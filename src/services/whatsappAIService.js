/**
 * Servicio de IA para WhatsApp Business
 *
 * Proporciona respuestas inteligentes, análisis de sentimientos,
 * y automatización avanzada usando Groq AI.
 */

import groqService from './groqService.js';

class WhatsAppAIService {
  constructor() {
    this.sentimentCache = new Map();
    this.responseCache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutos
  }

  /**
   * Genera una respuesta inteligente basada en el mensaje recibido
   * @param {string} message - Mensaje del usuario
   * @param {Object} context - Contexto adicional (historial, empresa, etc.)
   * @returns {Promise<Object>} Respuesta generada
   */
  async generateSmartReply(message, context = {}) {
    try {
      const cacheKey = this.generateCacheKey(message, context);
      const cached = this.responseCache.get(cacheKey);

      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        return cached.response;
      }

      const prompt = this.buildSmartReplyPrompt(message, context);

      const aiResponse = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.7,
        maxTokens: 500
      });

      const response = {
        text: aiResponse,
        confidence: this.calculateConfidence(aiResponse),
        category: this.categorizeResponse(aiResponse),
        timestamp: new Date()
      };

      // Cachear respuesta
      this.responseCache.set(cacheKey, {
        response,
        timestamp: Date.now()
      });

      return response;

    } catch (error) {
      console.error('Error generando respuesta inteligente:', error);
      return {
        text: 'Lo siento, no pude procesar tu mensaje. ¿Podrías reformularlo?',
        confidence: 0,
        category: 'error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Analiza el sentimiento de un mensaje
   * @param {string} message - Mensaje a analizar
   * @returns {Promise<Object>} Análisis de sentimiento
   */
  async analyzeSentiment(message) {
    try {
      const cacheKey = `sentiment_${message.substring(0, 100)}`;
      const cached = this.sentimentCache.get(cacheKey);

      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        return cached.sentiment;
      }

      const prompt = `Analiza el sentimiento del siguiente mensaje y clasifícalo como positivo, negativo, neutral, o pregunta. También indica el nivel de urgencia (bajo, medio, alto) y si requiere respuesta inmediata.

Mensaje: "${message}"

Responde en formato JSON:
{
  "sentiment": "positivo|negativo|neutral|pregunta",
  "confidence": 0.0-1.0,
  "urgency": "bajo|medio|alto",
  "requires_immediate_response": true|false,
  "key_topics": ["tema1", "tema2"],
  "suggested_action": "acción recomendada"
}`;

      const aiResponse = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.1,
        maxTokens: 300
      });

      let sentiment;
      try {
        sentiment = JSON.parse(aiResponse);
      } catch (parseError) {
        // Fallback si no es JSON válido
        sentiment = {
          sentiment: this.fallbackSentimentAnalysis(message),
          confidence: 0.5,
          urgency: 'medio',
          requires_immediate_response: false,
          key_topics: [],
          suggested_action: 'Responder normalmente'
        };
      }

      // Cachear resultado
      this.sentimentCache.set(cacheKey, {
        sentiment,
        timestamp: Date.now()
      });

      return sentiment;

    } catch (error) {
      console.error('Error analizando sentimiento:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        urgency: 'medio',
        requires_immediate_response: false,
        key_topics: [],
        suggested_action: 'Responder normalmente'
      };
    }
  }

  /**
   * Genera plantillas dinámicas basadas en el contexto
   * @param {string} type - Tipo de plantilla (bienvenida, despedida, etc.)
   * @param {Object} context - Contexto para personalizar
   * @returns {Promise<string>} Plantilla generada
   */
  async generateDynamicTemplate(type, context = {}) {
    try {
      const prompt = this.buildTemplatePrompt(type, context);

      const template = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.8,
        maxTokens: 200
      });

      return template.trim();

    } catch (error) {
      console.error('Error generando plantilla dinámica:', error);
      return this.getFallbackTemplate(type);
    }
  }

  /**
   * Clasifica automáticamente los mensajes entrantes
   * @param {string} message - Mensaje a clasificar
   * @returns {Promise<Object>} Clasificación del mensaje
   */
  async classifyMessage(message) {
    try {
      const prompt = `Clasifica el siguiente mensaje de WhatsApp en una categoría específica:

Mensaje: "${message}"

Categorías posibles:
- consulta_general
- soporte_tecnico
- ventas
- reclamo
- felicitacion
- pregunta_precio
- solicitud_informacion
- otro

Responde en formato JSON:
{
  "category": "categoria",
  "subcategory": "subcategoria_opcional",
  "priority": "bajo|medio|alto",
  "department": "departamento_sugerido",
  "estimated_response_time": "tiempo_estimado_en_minutos"
}`;

      const aiResponse = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.1,
        maxTokens: 200
      });

      return JSON.parse(aiResponse);

    } catch (error) {
      console.error('Error clasificando mensaje:', error);
      return {
        category: 'otro',
        priority: 'medio',
        department: 'general',
        estimated_response_time: 60
      };
    }
  }

  /**
   * Genera respuestas automáticas basadas en reglas de negocio
   * @param {Object} messageData - Datos del mensaje
   * @param {Object} businessRules - Reglas de negocio
   * @returns {Promise<Object>} Respuesta automática
   */
  async generateAutoResponse(messageData, businessRules = {}) {
    try {
      const sentiment = await this.analyzeSentiment(messageData.content);
      const classification = await this.classifyMessage(messageData.content);

      // Aplicar reglas de negocio
      let response = null;

      if (businessRules.autoResponses && businessRules.autoResponses[classification.category]) {
        response = businessRules.autoResponses[classification.category];
      }

      // Si no hay respuesta específica, generar inteligente
      if (!response && sentiment.sentiment === 'pregunta') {
        response = await this.generateSmartReply(messageData.content, {
          sentiment,
          classification,
          businessRules
        });
      }

      return {
        response,
        sentiment,
        classification,
        shouldAutoRespond: this.shouldAutoRespond(sentiment, classification, businessRules)
      };

    } catch (error) {
      console.error('Error generando respuesta automática:', error);
      return {
        response: null,
        sentiment: { sentiment: 'neutral' },
        classification: { category: 'otro' },
        shouldAutoRespond: false
      };
    }
  }

  /**
   * Genera reportes de análisis de conversaciones
   * @param {Array} messages - Array de mensajes
   * @param {Object} options - Opciones de análisis
   * @returns {Promise<Object>} Reporte de análisis
   */
  async generateConversationReport(messages, options = {}) {
    try {
      const messageTexts = messages.map(m => m.content).join('\n');

      const prompt = `Analiza las siguientes conversaciones de WhatsApp y genera un reporte ejecutivo:

Conversaciones:
${messageTexts}

Genera un reporte en formato JSON con:
{
  "summary": "resumen ejecutivo",
  "sentiment_distribution": {"positivo": 0, "negativo": 0, "neutral": 0},
  "top_topics": ["tema1", "tema2", "tema3"],
  "customer_satisfaction_score": 0-100,
  "response_recommendations": ["recomendacion1", "recomendacion2"],
  "urgency_level": "bajo|medio|alto",
  "key_insights": ["insight1", "insight2"]
}`;

      const aiResponse = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.3,
        maxTokens: 800
      });

      return JSON.parse(aiResponse);

    } catch (error) {
      console.error('Error generando reporte de conversación:', error);
      return {
        summary: 'No se pudo generar el análisis',
        sentiment_distribution: { positivo: 0, negativo: 0, neutral: 0 },
        top_topics: [],
        customer_satisfaction_score: 50,
        response_recommendations: [],
        urgency_level: 'medio',
        key_insights: []
      };
    }
  }

  /**
   * Entrena el modelo con datos específicos de la empresa
   * @param {Array} trainingData - Datos de entrenamiento
   * @param {string} companyId - ID de la empresa
   * @returns {Promise<boolean>} Éxito del entrenamiento
   */
  async trainCompanyModel(trainingData, companyId) {
    try {
      // En una implementación real, esto enviaría datos a un servicio de fine-tuning
      // Por ahora, solo almacenamos las preferencias

      const trainingPrompt = `Basado en estos ejemplos de conversaciones exitosas, aprende el estilo de comunicación de la empresa:

${trainingData.map(item => `Cliente: ${item.customer_message}\nEmpresa: ${item.company_response}`).join('\n\n')}

Genera un perfil de comunicación que incluya:
- Tono de voz
- Estilo de respuestas
- Temas comunes
- Mejores prácticas`;

      const profile = await groqService.generateResponse(trainingPrompt, {
        model: 'llama3-8b-8192',
        temperature: 0.5,
        maxTokens: 400
      });

      // Aquí se almacenaría el perfil en la base de datos
      console.log(`Perfil de comunicación generado para empresa ${companyId}:`, profile);

      return true;

    } catch (error) {
      console.error('Error entrenando modelo:', error);
      return false;
    }
  }

  // Métodos auxiliares

  buildSmartReplyPrompt(message, context) {
    return `Eres un asistente de atención al cliente profesional y amable. Responde al siguiente mensaje de manera helpful, concisa y profesional.

Mensaje del cliente: "${message}"

${context.companyName ? `Empresa: ${context.companyName}` : ''}
${context.previousMessages ? `Conversación previa:\n${context.previousMessages.join('\n')}` : ''}

Instrucciones:
- Sé amable y profesional
- Mantén la respuesta concisa pero completa
- Si es una pregunta, responde directamente
- Si es un problema, ofrece solución
- Incluye llamada a acción si es apropiado
- Usa un tono conversacional pero profesional

Respuesta:`;
  }

  buildTemplatePrompt(type, context) {
    const templates = {
      welcome: `Genera un mensaje de bienvenida personalizado para WhatsApp.

Contexto: ${JSON.stringify(context)}

El mensaje debe ser:
- Amigable y profesional
- Conciso (máximo 150 caracteres)
- Incluir nombre si está disponible
- Invitar a hacer preguntas

Mensaje:`,

      farewell: `Genera un mensaje de despedida para WhatsApp.

Contexto: ${JSON.stringify(context)}

El mensaje debe ser:
- Agradecer la conversación
- Invitar a contactar nuevamente
- Profesional pero amigable

Mensaje:`,

      follow_up: `Genera un mensaje de seguimiento para WhatsApp.

Contexto: ${JSON.stringify(context)}

El mensaje debe ser:
- Recordar la conversación anterior
- Ofrecer ayuda adicional
- Mantener el engagement

Mensaje:`
    };

    return templates[type] || templates.welcome;
  }

  calculateConfidence(response) {
    // Lógica simple para calcular confianza basada en longitud y complejidad
    const words = response.split(' ').length;
    if (words < 5) return 0.3;
    if (words > 50) return 0.9;
    return 0.6 + (words - 5) * 0.02;
  }

  categorizeResponse(response) {
    const lower = response.toLowerCase();

    if (lower.includes('?') || lower.includes('puedo ayudarte')) return 'question';
    if (lower.includes('gracias') || lower.includes('agradec')) return 'gratitude';
    if (lower.includes('disculpa') || lower.includes('perdón')) return 'apology';
    if (lower.includes('información') || lower.includes('detalles')) return 'information';

    return 'general';
  }

  fallbackSentimentAnalysis(message) {
    const positiveWords = ['bueno', 'excelente', 'genial', 'perfecto', 'gracias', 'feliz'];
    const negativeWords = ['malo', 'terrible', 'horrible', 'problema', 'error', 'molesto'];

    const lower = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lower.includes(word)).length;

    if (positiveCount > negativeCount) return 'positivo';
    if (negativeCount > positiveCount) return 'negativo';
    if (lower.includes('?')) return 'pregunta';

    return 'neutral';
  }

  shouldAutoRespond(sentiment, classification, businessRules) {
    // Lógica para determinar si responder automáticamente
    if (businessRules.disableAutoResponse) return false;
    if (sentiment.urgency === 'alto') return false; // Casos urgentes requieren atención humana
    if (classification.category === 'reclamo') return false; // Reclamos requieren atención especial

    return sentiment.sentiment !== 'negativo' && classification.priority !== 'alto';
  }

  generateCacheKey(message, context) {
    return `${message.substring(0, 50)}_${JSON.stringify(context).substring(0, 50)}`;
  }

  getFallbackTemplate(type) {
    const fallbacks = {
      welcome: '¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte?',
      farewell: 'Gracias por contactarnos. ¡Hasta pronto!',
      follow_up: 'Seguimiento: ¿Resolvimos tu consulta?'
    };

    return fallbacks[type] || fallbacks.welcome;
  }

  // Limpieza de cache periódica
  cleanupCache() {
    const now = Date.now();
    const timeout = this.cacheTimeout;

    // Limpiar cache de respuestas
    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > timeout) {
        this.responseCache.delete(key);
      }
    }

    // Limpiar cache de sentimientos
    for (const [key, value] of this.sentimentCache.entries()) {
      if (now - value.timestamp > timeout) {
        this.sentimentCache.delete(key);
      }
    }
  }
}

// Limpiar cache cada hora
setInterval(() => {
  whatsappAIService.cleanupCache();
}, 60 * 60 * 1000);

// Exportar instancia única
const whatsappAIService = new WhatsAppAIService();
export default whatsappAIService;