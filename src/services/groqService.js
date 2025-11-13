import Groq from 'groq-sdk'
import embeddingsService from '../lib/embeddings.js'
import configurationService from './configurationService.js'

class GroqService {
  constructor() {
    this.initialized = false
    this.initPromise = this.initialize()
  }

  async initialize() {
    try {
      // Cargar configuración usando configurationService
      const config = await configurationService.getGroqConfig()

      // Priorizar la configuración de Supabase sobre environment variables
      const apiKey = config.apiKey || process.env.REACT_APP_GROQ_API_KEY

      if (!apiKey || apiKey === 'tu_groq_api_key_aqui' || apiKey === 'gsk_placeholder_configure_real_api_key') {
        console.warn('GROQ API key not configured. AI chat features will not be available.')
        this.groq = null
      } else {
        this.groq = new Groq({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true // Permitir uso en el navegador
        })
      }

      // Usar configuración de Supabase o valores por defecto
      this.model = config.model || 'llama-3.3-70b-versatile'
      this.temperature = config.temperature || 0.7
      this.maxTokens = config.maxTokens || 800

      this.initialized = true
    } catch (error) {
      console.error('Error initializing GroqService:', error)
      // Fallback a configuración por defecto
      this.groq = null
      this.model = 'llama-3.3-70b-versatile'
      this.temperature = 0.7
      this.maxTokens = 800
      this.initialized = true
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise
    }
  }

  /**
   * Estima el número de tokens en un texto
   * @param {string} text - Texto a analizar
   * @returns {number} - Número estimado de tokens
   */
  estimateTokens(text) {
    // Estimación aproximada: 1 token ≈ 4 caracteres para español
    return Math.ceil(text.length / 4)
  }

  /**
   * Registra el uso de tokens usando el servicio de embeddings
   * @param {string} userId - ID del usuario
   * @param {number} tokensUsed - Tokens utilizados
   * @param {string} operation - Tipo de operación
   */
  async trackTokenUsage(userId, tokensUsed, operation = 'groq_chat') {
    try {
      // Usar el método del embeddingsService para evitar duplicación
      await embeddingsService.trackTokenUsage(userId, tokensUsed, operation);
    } catch (error) {
      console.error('Error tracking token usage:', error)
    }
  }

  /**
   * Trunca texto para mantenerlo dentro del límite de tokens
   * @param {string} text - Texto a truncar
   * @param {number} maxTokens - Máximo número de tokens permitidos
   * @returns {string} - Texto truncado
   */
  truncateText(text, maxTokens) {
    const estimatedTokens = this.estimateTokens(text)
    if (estimatedTokens <= maxTokens) {
      return text
    }
    
    // Calcular caracteres aproximados para el límite de tokens
    const maxChars = maxTokens * 4
    const truncated = text.substring(0, maxChars)
    
    // Intentar cortar en una palabra completa
    const lastSpaceIndex = truncated.lastIndexOf(' ')
    if (lastSpaceIndex > maxChars * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + '...'
    }
    
    return truncated + '...'
  }

  /**
   * Optimiza el contexto de documentos para evitar exceder límites
   * @param {Array} context - Contexto original
   * @param {number} maxTokens - Máximo tokens para contexto
   * @returns {string} - Contexto optimizado
   */
  optimizeContext(context, maxTokens = 2000) {
    if (!context || context.length === 0) {
      return ''
    }

    let contextText = '\n\nCONTEXTO DE DOCUMENTOS:\n'
    let currentTokens = this.estimateTokens(contextText)
    
    for (let i = 0; i < context.length; i++) {
      const doc = context[i]
      const docText = `\n[Documento ${i + 1}]: ${doc.content}\n`
      const docTokens = this.estimateTokens(docText)
      
      if (currentTokens + docTokens > maxTokens) {
        // Si es el primer documento y es muy largo, truncarlo
        if (i === 0) {
          const remainingTokens = maxTokens - currentTokens - 50 // Buffer
          const truncatedContent = this.truncateText(doc.content, remainingTokens)
          contextText += `\n[Documento ${i + 1}]: ${truncatedContent}\n`
        }
        break
      }
      
      contextText += docText
      currentTokens += docTokens
    }
    
    return contextText
  }

  /**
   * Optimiza el historial de chat para evitar exceder límites
   * @param {Array} chatHistory - Historial original
   * @param {number} maxTokens - Máximo tokens para historial
   * @returns {Array} - Historial optimizado
   */
  optimizeChatHistory(chatHistory, maxTokens = 1500) {
    if (!chatHistory || chatHistory.length === 0) {
      return []
    }

    // Empezar desde los mensajes más recientes
    const optimizedHistory = []
    let currentTokens = 0
    
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      const message = chatHistory[i]
      const messageTokens = this.estimateTokens(JSON.stringify(message))
      
      if (currentTokens + messageTokens > maxTokens) {
        break
      }
      
      optimizedHistory.unshift(message)
      currentTokens += messageTokens
    }
    
    return optimizedHistory
  }

  /**
   * Genera una respuesta de chat usando GROQ GEMMA 2-9b-it con optimización de contexto
   * @param {string} userMessage - Mensaje del usuario
   * @param {Array} context - Contexto de documentos encontrados
   * @param {Array} chatHistory - Historial de conversación
   * @param {string} userId - ID del usuario para tracking de tokens
   * @returns {Promise<Object>} - Respuesta del modelo y tokens utilizados
   */
  async generateChatResponse(userMessage, context = [], chatHistory = [], userId = null) {
    await this.ensureInitialized()
    if (!this.groq) {
      throw new Error('Servicio de IA no disponible. Configure la API key de GROQ.')
    }

    try {
      // Límites de tokens para evitar exceder el contexto
      const MAX_TOTAL_INPUT_TOKENS = 6000 // Límite conservador para gemma2-9b-it
      const MAX_CONTEXT_TOKENS = 2000
      const MAX_HISTORY_TOKENS = 1500
      const MAX_SYSTEM_TOKENS = 500
      
      // Optimizar contexto de documentos
      const contextText = this.optimizeContext(context, MAX_CONTEXT_TOKENS)
      
      // Optimizar historial de chat
      const optimizedHistory = this.optimizeChatHistory(chatHistory, MAX_HISTORY_TOKENS)
      
      // Mensaje del sistema optimizado
      const systemMessage = {
        role: 'system',
        content: this.truncateText(
          `Eres un asistente IA especializado en analizar y responder preguntas sobre documentos. 

Instrucciones:
- Responde en español de manera clara y concisa
- Usa la información del contexto proporcionado cuando sea relevante
- Si no tienes información suficiente en el contexto, indícalo claramente
- Sé útil y preciso en tus respuestas
- Mantén un tono profesional pero amigable${contextText}`,
          MAX_SYSTEM_TOKENS
        )
      }

      // Construir mensajes para el chat
      const messages = [systemMessage]

      // Agregar historial optimizado
      optimizedHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      })

      // Agregar mensaje actual del usuario (truncar si es muy largo)
      messages.push({
        role: 'user',
        content: this.truncateText(userMessage, 500)
      })

      // Verificar tokens totales antes de enviar
      const totalInputTokens = this.estimateTokens(JSON.stringify(messages))
      console.log(`📊 Tokens de entrada estimados: ${totalInputTokens}/${MAX_TOTAL_INPUT_TOKENS}`)
      
      if (totalInputTokens > MAX_TOTAL_INPUT_TOKENS) {
        console.warn('⚠️ Tokens de entrada exceden el límite, reduciendo contexto...')
        // Reducir aún más el contexto si es necesario
        const reducedContext = this.optimizeContext(context, MAX_CONTEXT_TOKENS * 0.5)
        messages[0].content = this.truncateText(
          `Eres un asistente IA especializado en analizar y responder preguntas sobre documentos. 

Instrucciones:
- Responde en español de manera clara y concisa
- Usa la información del contexto proporcionado cuando sea relevante
- Si no tienes información suficiente en el contexto, indícalo claramente
- Sé útil y preciso en tus respuestas
- Mantén un tono profesional pero amigable${reducedContext}`,
          MAX_SYSTEM_TOKENS * 0.7
        )
      }

      const completion = await this.groq.chat.completions.create({
        messages: messages,
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens, // Usar el valor configurado
        top_p: 1,
        stream: false
      })

      const response = completion.choices[0]?.message?.content || 'No se pudo generar una respuesta'
      
      // Calcular tokens utilizados
      const inputTokens = this.estimateTokens(JSON.stringify(messages))
      const outputTokens = this.estimateTokens(response)
      const totalTokens = inputTokens + outputTokens

      console.log(`✅ Respuesta generada - Input: ${inputTokens}, Output: ${outputTokens}, Total: ${totalTokens} tokens`)

      // Registrar uso de tokens si se proporciona userId
      if (userId) {
        await this.trackTokenUsage(userId, totalTokens, 'groq_chat')
      }

      return {
        response,
        tokensUsed: totalTokens,
        contextUsed: context.length,
        historyUsed: optimizedHistory.length
      }
    } catch (error) {
      console.error('Error generating chat response:', error)
      
      // Proporcionar información más específica sobre el error
      if (error.message && error.message.includes('context_length_exceeded')) {
        throw new Error('El contexto de la conversación es demasiado largo. Por favor, inicia una nueva conversación o reduce el tamaño de tu mensaje.')
      }
      
      throw new Error(`Error en GROQ API: ${error.message}`)
    }
  }

  /**
   * Genera un resumen de documentos
   * @param {Array} documents - Documentos a resumir
   * @param {string} userId - ID del usuario para tracking de tokens
   * @returns {Promise<Object>} - Resumen generado y tokens utilizados
   */
  async summarizeDocuments(documents, userId = null) {
    await this.ensureInitialized()
    if (!this.groq) {
      throw new Error('Servicio de IA no disponible. Configure la API key de GROQ.')
    }

    try {
      if (!documents || documents.length === 0) {
        return 'No hay documentos para resumir'
      }

      let content = 'DOCUMENTOS A RESUMIR:\n\n'
      documents.forEach((doc, index) => {
        content += `Documento ${index + 1}:\n${doc.content}\n\n`
      })

      const messages = [
        {
          role: 'system',
          content: 'Eres un experto en crear resúmenes concisos y útiles. Genera un resumen claro y estructurado de los documentos proporcionados en español.'
        },
        {
          role: 'user',
          content: content
        }
      ]

      const completion = await this.groq.chat.completions.create({
        messages: messages,
        model: this.model,
        temperature: this.temperature,
        max_tokens: Math.min(this.maxTokens, 512), // Limitar para resúmenes
        top_p: 1,
        stream: false
      })

      const summary = completion.choices[0]?.message?.content || 'No se pudo generar el resumen'
      
      // Calcular tokens utilizados
      const inputTokens = this.estimateTokens(JSON.stringify(messages))
      const outputTokens = this.estimateTokens(summary)
      const totalTokens = inputTokens + outputTokens

      // Registrar uso de tokens si se proporciona userId
      if (userId) {
        await this.trackTokenUsage(userId, totalTokens, 'groq_summary')
      }

      return {
        summary,
        tokensUsed: totalTokens
      }
    } catch (error) {
      console.error('Error summarizing documents:', error)
      throw new Error(`Error generando resumen: ${error.message}`)
    }
  }

  /**
   * Analiza el sentimiento de un texto usando GROQ
   * @param {string} text - Texto a analizar
   * @param {string} userId - ID del usuario para tracking de tokens (opcional)
   * @returns {Promise<Object>} - Objeto con score, label, confidence y tokensUsed
   */
  async analyzeSentiment(text, userId = null) {
    await this.ensureInitialized()
    if (!this.groq) {
      throw new Error('Servicio de IA no disponible. Configure la API key de GROQ.')
    }

    try {
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('Texto inválido para análisis de sentimientos')
      }

      const messages = [
        {
          role: 'system',
          content: `Eres un experto en análisis de sentimientos especializado en el contexto empresarial chileno. Tu tarea es analizar el sentimiento de textos en español considerando expresiones, jerga y contexto cultural chileno.

Instrucciones:
- Analiza el sentimiento general del texto proporcionado
- Considera el contexto empresarial: comunicaciones profesionales, feedback, opiniones sobre servicios, etc.
- Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "score": número entre -1.0 (muy negativo) y 1.0 (muy positivo),
  "label": "positive" | "negative" | "neutral",
  "confidence": número entre 0.0 y 1.0 indicando la confianza en el análisis
}

Criterios para el score:
- 1.0: Muy positivo, entusiasmo, satisfacción completa
- 0.5-0.9: Positivo, aprobación, satisfacción moderada
- 0.0: Neutral, informativo, sin carga emocional clara
- -0.5 a -0.9: Negativo, insatisfacción, crítica constructiva
- -1.0: Muy negativo, queja fuerte, insatisfacción extrema

Criterios para confidence:
- 1.0: Análisis muy claro y evidente
- 0.7-0.9: Análisis razonablemente claro
- 0.4-0.6: Análisis con cierta ambigüedad
- 0.0-0.3: Análisis muy ambiguo o texto muy corto`
        },
        {
          role: 'user',
          content: `Analiza el sentimiento del siguiente texto:\n\n"${text}"`
        }
      ]

      const completion = await this.groq.chat.completions.create({
        messages: messages,
        model: this.model,
        temperature: 0.3, // Baja temperatura para consistencia en análisis
        max_tokens: Math.min(this.maxTokens, 200), // Limitar para análisis
        top_p: 1,
        stream: false
      })

      const response = completion.choices[0]?.message?.content || '{}'

      // Intentar parsear la respuesta como JSON
      let sentimentResult
      try {
        sentimentResult = JSON.parse(response.trim())
      } catch (parseError) {
        console.error('Error parsing sentiment response:', parseError)
        // Intentar extraer JSON de la respuesta si tiene texto adicional
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          sentimentResult = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No se pudo parsear la respuesta del análisis de sentimientos')
        }
      }

      // Validar la estructura del resultado
      if (!sentimentResult.score || typeof sentimentResult.score !== 'number' ||
          sentimentResult.score < -1 || sentimentResult.score > 1) {
        throw new Error('Score inválido en la respuesta del análisis')
      }

      if (!['positive', 'negative', 'neutral'].includes(sentimentResult.label)) {
        throw new Error('Label inválido en la respuesta del análisis')
      }

      if (!sentimentResult.confidence || typeof sentimentResult.confidence !== 'number' ||
          sentimentResult.confidence < 0 || sentimentResult.confidence > 1) {
        throw new Error('Confidence inválido en la respuesta del análisis')
      }

      // Calcular tokens utilizados
      const inputTokens = this.estimateTokens(JSON.stringify(messages))
      const outputTokens = this.estimateTokens(response)
      const totalTokens = inputTokens + outputTokens

      console.log(`✅ Análisis de sentimiento completado - Input: ${inputTokens}, Output: ${outputTokens}, Total: ${totalTokens} tokens`)

      // Registrar uso de tokens si se proporciona userId
      if (userId) {
        await this.trackTokenUsage(userId, totalTokens, 'groq_sentiment')
      }

      return {
        score: sentimentResult.score,
        label: sentimentResult.label,
        confidence: sentimentResult.confidence,
        tokensUsed: totalTokens
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error)

      // Proporcionar errores más específicos
      if (error.message && error.message.includes('context_length_exceeded')) {
        throw new Error('El texto es demasiado largo para analizar. Por favor, reduce su longitud.')
      }

      if (error.message && error.message.includes('Texto inválido')) {
        throw error
      }

      throw new Error(`Error en análisis de sentimientos: ${error.message}`)
    }
  }

  /**
   * Genera una completion de chat a partir de un arreglo de mensajes
   * compatible con groq.chat.completions.create()
   * @param {Object} options
   * @param {Array} options.messages - Mensajes [{ role, content }]
   * @param {string} [options.model] - Modelo a usar
   * @param {number} [options.temperature] - Temperatura
   * @param {number} [options.maxTokens] - Máximo de tokens de salida
   * @returns {Promise<{content: string}>}
   */
  async generateCompletion({ messages = [], model = this.model, temperature = this.temperature, maxTokens = this.maxTokens } = {}) {
    await this.ensureInitialized()
    if (!this.groq) {
      throw new Error('Servicio de IA no disponible. Configure la API key de GROQ.');
    }
    try {
      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('Parámetro "messages" inválido: se requiere un arreglo de mensajes no vacío');
      }

      const completion = await this.groq.chat.completions.create({
        messages,
        model,
        temperature,
        max_tokens: maxTokens,
        top_p: 1,
        stream: false
      });

      const content = completion.choices?.[0]?.message?.content || '';
      return { content };
    } catch (error) {
      console.error('Error en generateCompletion:', error);
      throw new Error(`Error en GROQ generateCompletion: ${error.message}`);
    }
  }
  /**
   * Verifica si el servicio está disponible
   * @returns {Promise<boolean>} - True si está disponible
   */
  async isAvailable() {
    await this.ensureInitialized()
    if (!this.groq) {
      return false
    }

    try {
      const testCompletion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        model: this.model,
        max_tokens: 5
      })
      return !!testCompletion.choices[0]?.message?.content
    } catch (error) {
      console.error('GROQ service not available:', error)
      return false
    }
  }
}

// Métodos para obtener la configuración actual
GroqService.prototype.getConfig = async function() {
  await this.ensureInitialized()
  try {
    const config = await configurationService.getGroqConfig()
    return {
      apiKey: !!config.apiKey,
      model: config.model || this.model,
      temperature: config.temperature || this.temperature,
      maxTokens: config.maxTokens || this.maxTokens
    }
  } catch (error) {
    console.error('Error getting Groq config:', error)
    return {
      apiKey: false,
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens
    }
  }
}

// Método para actualizar la configuración
GroqService.prototype.updateConfig = async function(config) {
  await this.ensureInitialized()
  try {
    const currentConfig = await configurationService.getGroqConfig()

    const updatedConfig = {
      apiKey: config.apiKey || currentConfig.apiKey || '',
      model: config.model || currentConfig.model || this.model,
      temperature: config.temperature !== undefined ? config.temperature : (currentConfig.temperature || this.temperature),
      maxTokens: config.maxTokens || currentConfig.maxTokens || this.maxTokens
    }

    await configurationService.setGroqConfig(updatedConfig)

    // Actualizar propiedades locales
    this.model = updatedConfig.model
    this.temperature = updatedConfig.temperature
    this.maxTokens = updatedConfig.maxTokens

    // Recrear instancia de Groq si la API key cambió
    if (config.apiKey && config.apiKey !== currentConfig.apiKey) {
      if (config.apiKey && config.apiKey !== 'tu_groq_api_key_aqui' && config.apiKey !== 'gsk_placeholder_configure_real_api_key') {
        this.groq = new Groq({
          apiKey: config.apiKey,
          dangerouslyAllowBrowser: true
        })
      } else {
        this.groq = null
      }
    }
  } catch (error) {
    console.error('Error updating Groq config:', error)
    // Fallback: actualizar solo propiedades locales
    if (config.model) this.model = config.model
    if (config.temperature !== undefined) this.temperature = config.temperature
    if (config.maxTokens) this.maxTokens = config.maxTokens
  }
}

// Método para obtener todos los modelos disponibles
GroqService.prototype.getAvailableModels = function() {
  return [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', description: 'Modelo de Meta de 70B parámetros, versátil para múltiples tareas' },
    { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B', description: 'Modelo de última generación de Meta, 17B parámetros' },
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', description: 'Modelo optimizado de Meta, 17B parámetros' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Modelo rápido de Meta, 8B parámetros, respuestas instantáneas' },
    { id: 'allam-2-7b', name: 'Allam 2 7B', description: 'Modelo especializado en árabe, 7B parámetros' },
    { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B', description: 'Modelo de Alibaba Cloud, 32B parámetros' },
    { id: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2 Instruct', description: 'Modelo de Moonshot AI optimizado para instrucciones' },
    { id: 'moonshotai/kimi-k2-instruct-0905', name: 'Kimi K2 Instruct v0905', description: 'Versión mejorada de Kimi K2' },
    { id: 'groq/compound', name: 'Groq Compound', description: 'Modelo especializado de Groq' },
    { id: 'groq/compound-mini', name: 'Groq Compound Mini', description: 'Versión compacta del modelo Groq Compound' },
    { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', description: 'Modelo OpenAI de código abierto, 120B parámetros' },
    { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', description: 'Modelo OpenAI de código abierto, 20B parámetros' }
  ]
}

const groqService = new GroqService()
export default groqService