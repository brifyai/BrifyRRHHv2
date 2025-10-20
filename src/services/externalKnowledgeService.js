/**
 * Servicio de Integración de Bases de Conocimiento Externas
 * 
 * Este servicio permite integrar bases de conocimiento externas, FAQs y sistemas de IA
 * manteniendo el 100% de cumplimiento con las políticas de WhatsApp Business 2024-2025.
 * 
 * Características principales:
 * - Integración con múltiples fuentes de conocimiento
 * - Validación de contenido según políticas de WhatsApp
 * - Verificación de consentimiento y ventana de 24 horas
 * - Sistema de confianza y calidad
 * - Escalado automático a humanos cuando es necesario
 * - Transparencia total con los usuarios
 */

import { supabase } from '../lib/supabase.js';
import whatsappComplianceService from './whatsappComplianceService.js';

class ExternalKnowledgeService {
  constructor() {
    this.knowledgeSources = new Map();
    this.qualityThreshold = 0.8;
    this.maxRetries = 2;
    this.responseTimeout = 5000; // 5 segundos
  }

  /**
   * Registrar una fuente de conocimiento externa
   * @param {string} sourceId - ID único de la fuente
   * @param {Object} config - Configuración de la fuente
   */
  registerKnowledgeSource(sourceId, config) {
    this.knowledgeSources.set(sourceId, {
      id: sourceId,
      type: config.type, // 'faq', 'api', 'database', 'ai', 'crm'
      endpoint: config.endpoint,
      priority: config.priority || 1,
      enabled: config.enabled !== false,
      confidence: config.confidence || 0.8,
      timeout: config.timeout || this.responseTimeout,
      headers: config.headers || {},
      validation: config.validation || {},
      requiresHuman: config.requiresHuman || false,
      transparency: config.transparency || true,
      ...config
    });
  }

  /**
   * Obtener respuesta de base de conocimiento externa con cumplimiento
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   * @param {string} message - Mensaje del usuario
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta validada
   */
  async getKnowledgeResponse(companyId, userPhone, message, options = {}) {
    try {
      console.log(`🔍 Buscando respuesta en base externa para ${userPhone}`);

      // 1. Verificaciones de cumplimiento CRÍTICAS
      const complianceCheck = await this.validateComplianceRequirements(
        companyId, 
        userPhone, 
        message
      );

      if (!complianceCheck.canProceed) {
        throw new Error(`Bloqueado por cumplimiento: ${complianceCheck.reason}`);
      }

      // 2. Buscar en fuentes de conocimiento por orden de prioridad
      const sortedSources = Array.from(this.knowledgeSources.values())
        .filter(source => source.enabled)
        .sort((a, b) => a.priority - b.priority);

      let bestResponse = null;
      let maxConfidence = 0;

      for (const source of sortedSources) {
        try {
          const response = await this.queryKnowledgeSource(
            source, 
            message, 
            companyId, 
            userPhone
          );

          if (response && response.confidence > maxConfidence) {
            bestResponse = {
              ...response,
              sourceId: source.id,
              sourceType: source.type,
              sourceName: source.name || source.id
            };
            maxConfidence = response.confidence;

            // Si encontramos una respuesta con alta confianza, podemos detenernos
            if (maxConfidence >= this.qualityThreshold) {
              break;
            }
          }
        } catch (error) {
          console.warn(`Error consultando fuente ${source.id}:`, error.message);
          // Continuar con la siguiente fuente
        }
      }

      // 3. Validar la mejor respuesta encontrada
      if (!bestResponse) {
        return {
          success: false,
          requiresHuman: true,
          reason: 'No se encontró respuesta adecuada en bases de conocimiento',
          suggestions: ['Escalando a agente humano']
        };
      }

      // 4. Validación de contenido según políticas de WhatsApp
      const contentValidation = await whatsappComplianceService.validateMessageContent(
        bestResponse.content,
        bestResponse.type || 'text'
      );

      if (!contentValidation.valid) {
        throw new Error(`Respuesta inválida: ${contentValidation.reason}`);
      }

      // 5. Evaluar si requiere intervención humana
      const requiresHuman = await this.shouldEscalateToHuman(
        bestResponse,
        message,
        complianceCheck
      );

      if (requiresHuman.required) {
        return {
          success: false,
          requiresHuman: true,
          reason: requiresHuman.reason,
          suggestedResponse: bestResponse.content,
          confidence: bestResponse.confidence,
          source: bestResponse.sourceName
        };
      }

      // 6. Registrar interacción y respuesta
      await this.recordKnowledgeInteraction(
        companyId,
        userPhone,
        message,
        bestResponse,
        complianceCheck
      );

      // 7. Agregar transparencia si es necesario
      const finalResponse = this.addTransparencyMessage(bestResponse);

      return {
        success: true,
        content: finalResponse.content,
        confidence: bestResponse.confidence,
        source: bestResponse.sourceName,
        sourceType: bestResponse.sourceType,
        responseTime: finalResponse.responseTime,
        requiresHuman: false,
        transparency: finalResponse.transparency
      };

    } catch (error) {
      console.error('Error en getKnowledgeResponse:', error);
      
      // Registrar error de cumplimiento
      await whatsappComplianceService.logComplianceEvent({
        companyId,
        eventType: 'knowledge_error',
        details: {
          error: error.message,
          userPhone,
          message: message.substring(0, 100)
        }
      });

      return {
        success: false,
        error: error.message,
        requiresHuman: true,
        reason: 'Error en sistema de conocimiento'
      };
    }
  }

  /**
   * Validar requisitos de cumplimiento antes de consultar base externa
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   * @param {string} message - Mensaje del usuario
   * @returns {Promise<Object>} Resultado de validación
   */
  async validateComplianceRequirements(companyId, userPhone, message) {
    try {
      // 1. Verificar consentimiento activo
      const hasConsent = await whatsappComplianceService.hasActiveConsent(
        companyId,
        userPhone
      );

      if (!hasConsent) {
        return {
          canProceed: false,
          reason: 'No hay consentimiento activo para respuestas automatizadas'
        };
      }

      // 2. Verificar ventana de 24 horas
      const windowStatus = await whatsappComplianceService.check24HourWindow(
        companyId,
        userPhone
      );

      if (windowStatus.requiresTemplate) {
        return {
          canProceed: false,
          reason: 'Se requiere plantilla de mensaje (fuera de ventana de 24 horas)',
          requiresTemplate: true
        };
      }

      // 3. Verificar calidad y límites
      const qualityCheck = await whatsappComplianceService.checkQualityAndLimits(
        companyId
      );

      if (!qualityCheck.success || !qualityCheck.limits.canSend) {
        return {
          canProceed: false,
          reason: 'Límites de envío no disponibles por calidad del número'
        };
      }

      // 4. Validar mensaje de entrada
      const inputValidation = await whatsappComplianceService.validateMessageContent(
        message,
        'text'
      );

      if (!inputValidation.valid) {
        return {
          canProceed: false,
          reason: `Mensaje de entrada inválido: ${inputValidation.reason}`
        };
      }

      return {
        canProceed: true,
        windowStatus,
        qualityCheck,
        consentVerified: true
      };

    } catch (error) {
      return {
        canProceed: false,
        reason: `Error en validación de cumplimiento: ${error.message}`
      };
    }
  }

  /**
   * Consultar una fuente específica de conocimiento
   * @param {Object} source - Configuración de la fuente
   * @param {string} message - Mensaje a consultar
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   * @returns {Promise<Object>} Respuesta de la fuente
   */
  async queryKnowledgeSource(source, message, companyId, userPhone) {
    const startTime = Date.now();

    try {
      let response;

      switch (source.type) {
        case 'faq':
          response = await this.queryFAQ(source, message);
          break;
        case 'api':
          response = await this.queryAPI(source, message);
          break;
        case 'database':
          response = await this.queryDatabase(source, message, companyId);
          break;
        case 'ai':
          response = await this.queryAI(source, message, userPhone);
          break;
        case 'crm':
          response = await this.queryCRM(source, message, companyId, userPhone);
          break;
        default:
          throw new Error(`Tipo de fuente no soportado: ${source.type}`);
      }

      const responseTime = Date.now() - startTime;

      return {
        ...response,
        responseTime,
        sourceId: source.id,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw new Error(`Error consultando ${source.type}: ${error.message}`);
    }
  }

  /**
   * Consultar base de datos FAQ
   * @param {Object} source - Configuración de la fuente
   * @param {string} message - Mensaje de consulta
   * @returns {Promise<Object>} Respuesta FAQ
   */
  async queryFAQ(source, message) {
    const { data, error } = await supabase
      .from('faq_entries')
      .select('*')
      .eq('company_id', source.companyId)
      .or(`question.ilike.%${message}%,answer.ilike.%${message}%,keywords.ilike.%${message}%`)
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(5);

    if (error) throw error;

    if (!data || data.length === 0) {
      return null;
    }

    // Encontrar la mejor coincidencia (similitud simple)
    const bestMatch = data.find(item => 
      item.question.toLowerCase().includes(message.toLowerCase()) ||
      message.toLowerCase().includes(item.question.toLowerCase())
    ) || data[0];

    return {
      content: bestMatch.answer,
      confidence: 0.9,
      type: 'faq',
      metadata: {
        question: bestMatch.question,
        category: bestMatch.category,
        priority: bestMatch.priority
      }
    };
  }

  /**
   * Consultar API externa
   * @param {Object} source - Configuración de la fuente
   * @param {string} message - Mensaje de consulta
   * @returns {Promise<Object>} Respuesta de API
   */
  async queryAPI(source, message) {
    const response = await fetch(source.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...source.headers
      },
      body: JSON.stringify({
        query: message,
        timestamp: new Date().toISOString(),
        source: 'whatsapp_business'
      }),
      signal: AbortSignal.timeout(source.timeout || this.responseTimeout)
    });

    if (!response.ok) {
      throw new Error(`API response: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.answer || data.response || data.content,
      confidence: data.confidence || source.confidence,
      type: 'api_response',
      metadata: {
        endpoint: source.endpoint,
        responseTime: data.responseTime,
        requestId: data.requestId
      }
    };
  }

  /**
   * Consultar base de datos interna
   * @param {Object} source - Configuración de la fuente
   * @param {string} message - Mensaje de consulta
   * @param {number} companyId - ID de la empresa
   * @returns {Promise<Object>} Respuesta de base de datos
   */
  async queryDatabase(source, message, companyId) {
    const { data, error } = await supabase.rpc('search_knowledge_base', {
      p_company_id: companyId,
      p_query: message,
      p_limit: 5
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      return null;
    }

    const bestMatch = data[0];

    return {
      content: bestMatch.content,
      confidence: bestMatch.similarity_score || 0.8,
      type: 'database',
      metadata: {
        table: bestMatch.table_name,
        id: bestMatch.record_id,
        similarity: bestMatch.similarity_score
      }
    };
  }

  /**
   * Consultar modelo de IA
   * @param {Object} source - Configuración de la fuente
   * @param {string} message - Mensaje de consulta
   * @param {string} userPhone - Teléfono del usuario
   * @returns {Promise<Object>} Respuesta de IA
   */
  async queryAI(source, message, userPhone) {
    // Aquí se integraría con un servicio de IA como OpenAI, Claude, etc.
    // Por ahora, simulamos una respuesta

    const aiResponse = await this.callAIService({
      prompt: message,
      context: 'whatsapp_business_support',
      userPhone: userPhone,
      maxTokens: 150,
      temperature: 0.7
    });

    return {
      content: aiResponse.text,
      confidence: aiResponse.confidence || 0.75,
      type: 'ai_generated',
      metadata: {
        model: source.model || 'gpt-3.5-turbo',
        tokens: aiResponse.tokens,
        processingTime: aiResponse.processingTime
      }
    };
  }

  /**
   * Consultar sistema CRM
   * @param {Object} source - Configuración de la fuente
   * @param {string} message - Mensaje de consulta
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   * @returns {Promise<Object>} Respuesta del CRM
   */
  async queryCRM(source, message, companyId, userPhone) {
    // Buscar información del cliente en el CRM
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)
      .eq('phone', userPhone)
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      throw customerError;
    }

    // Buscar historial de interacciones
    const { data: history, error: historyError } = await supabase
      .from('customer_interactions')
      .select('*')
      .eq('company_id', companyId)
      .eq('customer_phone', userPhone)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) throw historyError;

    // Generar respuesta basada en información del CRM
    const crmResponse = this.generateCRMResponse(message, customer, history);

    return {
      content: crmResponse.content,
      confidence: crmResponse.confidence,
      type: 'crm_data',
      metadata: {
        customerId: customer?.id,
        hasHistory: history && history.length > 0,
        lastInteraction: history?.[0]?.created_at
      }
    };
  }

  /**
   * Determinar si se debe escalar a humano
   * @param {Object} response - Respuesta encontrada
   * @param {string} originalMessage - Mensaje original
   * @param {Object} complianceCheck - Verificación de cumplimiento
   * @returns {Promise<Object>} Decisión de escalado
   */
  async shouldEscalateToHuman(response, originalMessage, complianceCheck) {
    const escalationTriggers = [
      // Baja confianza en la respuesta
      response.confidence < this.qualityThreshold,
      
      // Palabras clave que requieren intervención humana
      /humano|agente|persona|queja|emerggencia|urgente/i.test(originalMessage),
      
      // Fuente requiere validación humana
      response.sourceType === 'ai_generated' && response.confidence < 0.9,
      
      // Mensaje demasiado complejo
      originalMessage.length > 200,
      
      // Solicitudes específicas
      /hablar con|representante|supervisor|gerente/i.test(originalMessage)
    ];

    const shouldEscalate = escalationTriggers.some(trigger => trigger === true);

    if (shouldEscalate) {
      let reason = 'Escalado a humano requerido';
      
      if (response.confidence < this.qualityThreshold) {
        reason = `Baja confianza en respuesta (${(response.confidence * 100).toFixed(1)}%)`;
      } else if (/humano|agente|persona/i.test(originalMessage)) {
        reason = 'Usuario solicita explícitamente hablar con humano';
      } else if (/queja|emerggencia|urgente/i.test(originalMessage)) {
        reason = 'Mensaje requiere atención prioritaria';
      }

      return {
        required: true,
        reason,
        suggestedResponse: response.content,
        confidence: response.confidence
      };
    }

    return {
      required: false,
      reason: 'Respuesta automática adecuada'
    };
  }

  /**
   * Agregar mensaje de transparencia sobre uso de IA/bases externas
   * @param {Object} response - Respuesta a enviar
   * @returns {Object} Respuesta con transparencia
   */
  addTransparencyMessage(response) {
    const transparencyMessages = {
      ai: '🤖 *Respuesta generada por IA basada en nuestra base de conocimiento*\n\n',
      faq: '📚 *Respuesta de nuestra base de conocimiento*\n\n',
      crm: '👤 *Información personalizada de tu historial*\n\n',
      api: '🔗 *Respuesta obtenida de sistema externo*\n\n'
    };

    let transparencyText = '';
    let needsTransparency = false;

    // Agregar transparencia según el tipo de fuente
    if (response.sourceType === 'ai_generated' && response.confidence < 0.9) {
      transparencyText = transparencyMessages.ai;
      needsTransparency = true;
    } else if (response.sourceType === 'faq') {
      transparencyText = transparencyMessages.faq;
      needsTransparency = true;
    } else if (response.sourceType === 'crm_data') {
      transparencyText = transparencyMessages.crm;
      needsTransparency = true;
    }

    // Agregar opción de hablar con humano
    const humanOption = '\n\n_Si prefieres hablar con un humano, responde "HUMANO"_';

    return {
      ...response,
      content: needsTransparency 
        ? transparencyText + response.content + humanOption
        : response.content + humanOption,
      transparency: {
        enabled: needsTransparency,
        sourceType: response.sourceType,
        confidence: response.confidence
      }
    };
  }

  /**
   * Registrar interacción con base de conocimiento
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   * @param {string} originalMessage - Mensaje original
   * @param {Object} response - Respuesta generada
   * @param {Object} complianceCheck - Verificación de cumplimiento
   */
  async recordKnowledgeInteraction(companyId, userPhone, originalMessage, response, complianceCheck) {
    try {
      const { error } = await supabase
        .from('knowledge_interactions')
        .insert({
          company_id: companyId,
          user_phone: userPhone,
          original_message: originalMessage,
          response_content: response.content,
          source_id: response.sourceId,
          source_type: response.sourceType,
          confidence: response.confidence,
          response_time: response.responseTime,
          requires_human: response.requiresHuman || false,
          compliance_verified: complianceCheck.consentVerified,
          window_verified: complianceCheck.windowStatus?.inWindow || false,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // También registrar como interacción de usuario para mantener ventana activa
      await whatsappComplianceService.recordUserInteraction(
        companyId,
        userPhone,
        'knowledge_response',
        {
          source: response.sourceType,
          confidence: response.confidence,
          responseTime: response.responseTime
        }
      );

    } catch (error) {
      console.error('Error registrando interacción de conocimiento:', error);
    }
  }

  /**
   * Simular llamada a servicio de IA (integración real con OpenAI, Claude, etc.)
   * @param {Object} params - Parámetros para la API de IA
   * @returns {Promise<Object>} Respuesta de la IA
   */
  async callAIService(params) {
    // Aquí iría la integración real con servicios como:
    // - OpenAI GPT-4
    // - Anthropic Claude
    // - Google Gemini
    // - Modelos locales
    
    // Por ahora, simulamos una respuesta
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: 'Esta es una respuesta generada por IA basada en tu consulta. Para obtener información más específica, te recomiendo hablar con uno de nuestros agentes.',
          confidence: 0.75,
          tokens: 45,
          processingTime: 1200
        });
      }, 1000);
    });
  }

  /**
   * Generar respuesta basada en datos del CRM
   * @param {string} message - Mensaje del usuario
   * @param {Object} customer - Datos del cliente
   * @param {Array} history - Historial de interacciones
   * @returns {Object} Respuesta personalizada
   */
  generateCRMResponse(message, customer, history) {
    if (!customer) {
      return {
        content: 'No encuentro tu información en nuestro sistema. ¿Podrías proporcionar tu número de cliente o email?',
        confidence: 0.6
      };
    }

    // Respuestas personalizadas basadas en historial
    const recentInteractions = history?.slice(0, 3) || [];
    
    if (recentInteractions.length > 0) {
      const lastInteraction = recentInteractions[0];
      return {
        content: `Hola ${customer.name}. Veo que tu última consulta fue sobre "${lastInteraction.topic}". ¿En qué puedo ayudarte hoy?`,
        confidence: 0.9
      };
    }

    return {
      content: `Hola ${customer.name}. ¿En qué puedo ayudarte hoy?`,
      confidence: 0.8
    };
  }

  /**
   * Obtener estadísticas de uso de bases de conocimiento
   * @param {number} companyId - ID de la empresa
   * @param {Object} filters - Filtros para las estadísticas
   * @returns {Promise<Object>} Estadísticas de uso
   */
  async getKnowledgeStats(companyId, filters = {}) {
    try {
      const { data, error } = await supabase
        .from('knowledge_interactions')
        .select('*')
        .eq('company_id', companyId)
        .gte('created_at', filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', filters.endDate || new Date().toISOString());

      if (error) throw error;

      const stats = {
        totalQueries: data?.length || 0,
        autoResolved: data?.filter(i => !i.requires_human).length || 0,
        escalatedToHuman: data?.filter(i => i.requires_human).length || 0,
        averageConfidence: data?.reduce((sum, i) => sum + (i.confidence || 0), 0) / (data?.length || 1),
        averageResponseTime: data?.reduce((sum, i) => sum + (i.response_time || 0), 0) / (data?.length || 1),
        sourceUsage: {},
        complianceRate: data?.filter(i => i.compliance_verified).length / (data?.length || 1) * 100
      };

      // Agrupar por tipo de fuente
      data?.forEach(interaction => {
        const sourceType = interaction.source_type || 'unknown';
        stats.sourceUsage[sourceType] = (stats.sourceUsage[sourceType] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error('Error obteniendo estadísticas de conocimiento:', error);
      return {
        totalQueries: 0,
        autoResolved: 0,
        escalatedToHuman: 0,
        averageConfidence: 0,
        averageResponseTime: 0,
        sourceUsage: {},
        complianceRate: 0
      };
    }
  }
}

// Crear instancia global del servicio
const externalKnowledgeService = new ExternalKnowledgeService();

// Registrar fuentes de conocimiento por defecto
externalKnowledgeService.registerKnowledgeSource('internal_faq', {
  type: 'faq',
  priority: 1,
  confidence: 0.9,
  transparency: true
});

externalKnowledgeService.registerKnowledgeSource('crm_data', {
  type: 'crm',
  priority: 2,
  confidence: 0.85,
  transparency: true
});

externalKnowledgeService.registerKnowledgeSource('ai_assistant', {
  type: 'ai',
  priority: 3,
  confidence: 0.75,
  transparency: true,
  requiresHuman: true
});

export default externalKnowledgeService;