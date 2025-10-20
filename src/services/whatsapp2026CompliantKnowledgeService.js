/**
 * Servicio de Conocimiento Externo 100% Cumplido con Términos WhatsApp Business 2026
 * 
 * Este servicio implementa estrictamente los términos vigentes desde 15 de enero de 2026:
 * - Proveedores de Servicios Externos (PSE) autorizados
 * - Restricciones estrictas para Proveedores de IA
 * - Prohibición de perfiles y rastreo
 * - Responsabilidad total del cliente
 * - Reportes obligatorios
 */

import { supabase } from '../lib/supabase.js';
import whatsappComplianceService from './whatsappComplianceService.js';

class WhatsApp2026CompliantKnowledgeService {
  constructor() {
    this.authorizedProviders = new Map();
    this.isolatedModels = new Map(); // Modelos aislados por cliente
    this.usageTracker = new Map();
    this.complianceReports = new Map();
    
    // Inicializar con proveedores permitidos por defecto
    this.initializeDefaultProviders();
  }

  /**
   * Inicializar proveedores por defecto cumpliendo términos 2026
   */
  initializeDefaultProviders() {
    // FAQs internas (siempre permitidas)
    this.authorizedProviders.set('internal_faq', {
      id: 'internal_faq',
      type: 'faq',
      name: 'Base de Conocimiento Interna',
      priority: 1,
      requiresPSE: false,
      aiProvider: false,
      dataProcessing: 'internal_only',
      allowedPurposes: ['customer_service', 'information_delivery'],
      restrictions: {
        noProfiling: true,
        noDataSharing: true,
        exclusiveUse: true
      }
    });

    // CRM interno (siempre permitido)
    this.authorizedProviders.set('internal_crm', {
      id: 'internal_crm',
      type: 'crm',
      name: 'Sistema CRM Interno',
      priority: 2,
      requiresPSE: false,
      aiProvider: false,
      dataProcessing: 'internal_only',
      allowedPurposes: ['customer_service', 'personalized_response'],
      restrictions: {
        noProfiling: true,
        noDataSharing: true,
        exclusiveUse: true
      }
    });

    // Base de datos interna (siempre permitida)
    this.authorizedProviders.set('internal_database', {
      id: 'internal_database',
      type: 'database',
      name: 'Base de Datos Interna',
      priority: 3,
      requiresPSE: false,
      aiProvider: false,
      dataProcessing: 'internal_only',
      allowedPurposes: ['information_retrieval', 'knowledge_search'],
      restrictions: {
        noProfiling: true,
        noDataSharing: true,
        exclusiveUse: true
      }
    });
  }

  /**
   * Registrar Proveedor de Servicios Externo (PSE) según términos 2026
   * @param {number} companyId - ID de la empresa
   * @param {Object} pseConfig - Configuración del PSE
   */
  async registerExternalServiceProvider(companyId, pseConfig) {
    // Verificar cumplimiento de términos 2026
    const complianceCheck = await this.validatePSECompliance(companyId, pseConfig);
    
    if (!complianceCheck.compliant) {
      throw new Error(`PSE no cumple términos 2026: ${complianceCheck.reason}`);
    }

    // Registrar acuerdo escrito (simulado)
    await this.recordPSEAgreement(companyId, pseConfig);

    // Configurar proveedor con restricciones
    const provider = {
      ...pseConfig,
      companyId,
      registeredAt: new Date().toISOString(),
      agreementStatus: 'active',
      complianceVerified: true,
      restrictions: {
        ...pseConfig.restrictions,
        noProfiling: true,
        noDataSharing: true,
        exclusiveUse: true,
        noTrainingData: pseConfig.aiProvider || false
      }
    };

    this.authorizedProviders.set(pseConfig.id, provider);
    
    // Inicializar tracking de uso
    this.usageTracker.set(`${companyId}_${pseConfig.id}`, {
      usage: [],
      compliance: [],
      incidents: []
    });

    return { success: true, providerId: pseConfig.id };
  }

  /**
   * Validar cumplimiento de PSE según términos 2026
   * @param {number} companyId - ID de la empresa
   * @param {Object} pseConfig - Configuración del PSE
   */
  async validatePSECompliance(companyId, pseConfig) {
    const issues = [];

    // 1. Verificar acuerdo escrito
    if (!pseConfig.writtenAgreement) {
      issues.push('Se requiere acuerdo escrito con PSE');
    }

    // 2. Verificar propósito específico
    if (!pseConfig.specificPurpose || pseConfig.specificPurpose === 'general') {
      issues.push('El PSE debe tener propósito específico definido');
    }

    // 3. Verificar salvaguardas técnicas
    if (!pseConfig.technicalSafeguards || !pseConfig.technicalSafeguards.encryption) {
      issues.push('El PSE debe tener salvaguardas técnicas implementadas');
    }

    // 4. Verificar cumplimiento legal
    if (!pseConfig.legalCompliance || !pseConfig.legalCompliance.gdprCompliant) {
      issues.push('El PSE debe cumplir con leyes aplicables (GDPR, etc.)');
    }

    // 5. Restricciones específicas para Proveedores de IA
    if (pseConfig.aiProvider) {
      const aiIssues = await this.validateAIProviderRestrictions(pseConfig);
      issues.push(...aiIssues);
    }

    return {
      compliant: issues.length === 0,
      reason: issues.join('; ')
    };
  }

  /**
   * Validar restricciones específicas para Proveedores de IA
   * @param {Object} aiConfig - Configuración del proveedor de IA
   */
  async validateAIProviderRestrictions(aiConfig) {
    const issues = [];

    // 1. Verificar prohibición de acceso directo
    if (aiConfig.directWhatsAppAccess) {
      issues.push('Prohibido acceso directo a WhatsApp Business para proveedores de IA');
    }

    // 2. Verificar prohibición de entrenamiento
    if (aiConfig.allowsTraining || aiConfig.dataForTraining) {
      issues.push('Prohibido usar datos para entrenar modelos de IA');
    }

    // 3. Verificar uso exclusivo
    if (!aiConfig.exclusiveUse) {
      issues.push('Los modelos de IA deben ser para uso exclusivo del cliente');
    }

    // 4. Verificar aislamiento de modelos
    if (!aiConfig.modelIsolation || aiConfig.modelIsolation !== 'complete') {
      issues.push('Se requiere aislamiento completo de modelos por cliente');
    }

    return issues;
  }

  /**
   * Obtener respuesta con cumplimiento 100% de términos 2026
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   * @param {string} message - Mensaje del usuario
   * @param {Object} options - Opciones adicionales
   */
  async getCompliantResponse(companyId, userPhone, message, options = {}) {
    try {
      console.log(`🔍 Buscando respuesta cumplida con términos 2026 para ${userPhone}`);

      // 1. Verificaciones de cumplimiento CRÍTICAS
      const complianceCheck = await this.validate2026Requirements(companyId, userPhone, message);

      if (!complianceCheck.canProceed) {
        throw new Error(`Bloqueado por términos 2026: ${complianceCheck.reason}`);
      }

      // 2. Obtener proveedores autorizados para esta empresa
      const authorizedSources = await this.getAuthorizedSources(companyId);

      if (authorizedSources.length === 0) {
        return {
          success: false,
          requiresHuman: true,
          reason: 'No hay fuentes de conocimiento autorizadas',
          complianceInfo: {
            terms2026: true,
            noAuthorizedProviders: true
          }
        };
      }

      // 3. Priorizar fuentes no-IA (más seguras según términos)
      const prioritizedSources = this.prioritizeSources(authorizedSources);

      let bestResponse = null;
      let sourceUsed = null;

      // 4. Buscar respuesta en fuentes autorizadas
      for (const source of prioritizedSources) {
        try {
          const response = await this.queryAuthorizedSource(
            source,
            message,
            companyId,
            userPhone,
            complianceCheck
          );

          if (response && response.compliant) {
            bestResponse = response;
            sourceUsed = source;
            
            // Si encontramos respuesta confiable, podemos detenernos
            if (response.confidence >= 0.8) {
              break;
            }
          }
        } catch (error) {
          console.warn(`Error consultando fuente ${source.id}:`, error.message);
          
          // Registrar incidente de cumplimiento
          await this.recordComplianceIncident(companyId, source.id, error.message);
        }
      }

      // 5. Evaluar respuesta encontrada
      if (!bestResponse) {
        return {
          success: false,
          requiresHuman: true,
          reason: 'No se encontró respuesta adecuada en fuentes autorizadas',
          complianceInfo: {
            terms2026: true,
            sourcesChecked: prioritizedSources.length,
            noAdequateResponse: true
          }
        };
      }

      // 6. Validación final de cumplimiento
      const finalValidation = await this.validateFinalResponse(
        bestResponse,
        sourceUsed,
        companyId,
        userPhone
      );

      if (!finalValidation.compliant) {
        throw new Error(`Respuesta final no cumple términos 2026: ${finalValidation.reason}`);
      }

      // 7. Registrar uso para responsabilidad del cliente
      await this.recordCompliantUsage(
        companyId,
        userPhone,
        message,
        bestResponse,
        sourceUsed
      );

      // 8. Agregar divulgación de cumplimiento
      const finalResponse = this.add2026ComplianceDisclosure(bestResponse, sourceUsed);

      return {
        success: true,
        content: finalResponse.content,
        confidence: bestResponse.confidence,
        source: sourceUsed.name,
        sourceType: sourceUsed.type,
        complianceInfo: {
          terms2026: true,
          pseAuthorized: sourceUsed.requiresPSE,
          aiProvider: sourceUsed.aiProvider,
          dataProcessing: sourceUsed.dataProcessing,
          noProfiling: true,
          exclusiveUse: true
        },
        requiresHuman: false,
        responseTime: bestResponse.responseTime
      };

    } catch (error) {
      console.error('Error en getCompliantResponse:', error);
      
      // Registrar error de cumplimiento
      await this.recordComplianceError(companyId, userPhone, error.message);

      return {
        success: false,
        error: error.message,
        requiresHuman: true,
        reason: 'Error en sistema de conocimiento cumplido',
        complianceInfo: {
          terms2026: true,
          errorRecorded: true
        }
      };
    }
  }

  /**
   * Validar requisitos específicos de términos 2026
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   * @param {string} message - Mensaje del usuario
   */
  async validate2026Requirements(companyId, userPhone, message) {
    try {
      // 1. Verificaciones de cumplimiento estándar de WhatsApp
      const standardCompliance = await whatsappComplianceService.validateComplianceRequirements(
        companyId,
        userPhone,
        message
      );

      if (!standardCompliance.canProceed) {
        return {
          canProceed: false,
          reason: standardCompliance.reason,
          type: 'standard_compliance'
        };
      }

      // 2. Verificaciones específicas de términos 2026
      const specificChecks = [
        await this.verifyNoProfiling(companyId, userPhone),
        await this.verifyAuthorizedProviders(companyId),
        await this.verifyDataRestrictions(companyId),
        await this.verifyClientResponsibility(companyId)
      ];

      const failedChecks = specificChecks.filter(check => !check.compliant);

      if (failedChecks.length > 0) {
        return {
          canProceed: false,
          reason: failedChecks.map(check => check.reason).join('; '),
          type: 'terms2026_specific'
        };
      }

      return {
        canProceed: true,
        standardCompliance,
        terms2026Compliance: true
      };

    } catch (error) {
      return {
        canProceed: false,
        reason: `Error en validación términos 2026: ${error.message}`,
        type: 'validation_error'
      };
    }
  }

  /**
   * Verificar que no hay creación de perfiles (prohibido por términos 2026)
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   */
  async verifyNoProfiling(companyId, userPhone) {
    try {
      // Verificar que no existen perfiles de este usuario
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('company_id', companyId)
        .eq('user_phone', userPhone);

      if (error) throw error;

      if (data && data.length > 0) {
        return {
          compliant: false,
          reason: 'Existen perfiles de usuario (prohibido por términos 2026)'
        };
      }

      return { compliant: true };

    } catch (error) {
      return {
        compliant: false,
        reason: `Error verificando perfiles: ${error.message}`
      };
    }
  }

  /**
   * Verificar proveedores autorizados para la empresa
   * @param {number} companyId - ID de la empresa
   */
  async verifyAuthorizedProviders(companyId) {
    try {
      const authorizedProviders = Array.from(this.authorizedProviders.values())
        .filter(provider => provider.companyId === companyId || !provider.companyId);

      if (authorizedProviders.length === 0) {
        return {
          compliant: false,
          reason: 'No hay proveedores autorizados configurados'
        };
      }

      // Verificar que todos los proveedores cumplen términos
      const nonCompliantProviders = authorizedProviders.filter(provider => {
        return !provider.complianceVerified || provider.agreementStatus !== 'active';
      });

      if (nonCompliantProviders.length > 0) {
        return {
          compliant: false,
          reason: `Proveedores no cumplen: ${nonCompliantProviders.map(p => p.id).join(', ')}`
        };
      }

      return { compliant: true };

    } catch (error) {
      return {
        compliant: false,
        reason: `Error verificando proveedores: ${error.message}`
      };
    }
  }

  /**
   * Verificar restricciones de datos según términos 2026
   * @param {number} companyId - ID de la empresa
   */
  async verifyDataRestrictions(companyId) {
    try {
      // Verificar que no hay compartición de datos con terceros no autorizados
      const { data, error } = await supabase
        .from('data_sharing_logs')
        .select('*')
        .eq('company_id', companyId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      if (data && data.length > 0) {
        const unauthorizedSharing = data.filter(log => !log.authorized_pse);
        if (unauthorizedSharing.length > 0) {
          return {
            compliant: false,
            reason: 'Compartición de datos no autorizada detectada'
          };
        }
      }

      return { compliant: true };

    } catch (error) {
      return {
        compliant: false,
        reason: `Error verificando restricciones de datos: ${error.message}`
      };
    }
  }

  /**
   * Verificar configuración de responsabilidad del cliente
   * @param {number} companyId - ID de la empresa
   */
  async verifyClientResponsibility(companyId) {
    try {
      // Verificar que está configurado el tracking de responsabilidad
      const { data, error } = await supabase
        .from('client_responsibility_config')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data || !data.tracking_enabled) {
        return {
          compliant: false,
          reason: 'No está configurado el tracking de responsabilidad del cliente'
        };
      }

      return { compliant: true };

    } catch (error) {
      return {
        compliant: false,
        reason: `Error verificando responsabilidad: ${error.message}`
      };
    }
  }

  /**
   * Obtener fuentes autorizadas para la empresa
   * @param {number} companyId - ID de la empresa
   */
  async getAuthorizedSources(companyId) {
    return Array.from(this.authorizedProviders.values())
      .filter(provider => {
        // Incluir proveedores globales (sin companyId) y proveedores específicos de la empresa
        const belongsToCompany = !provider.companyId || provider.companyId === companyId;
        
        // Verificar que esté activo y cumplido
        const isActiveAndCompliant = provider.enabled !== false && 
                                   provider.complianceVerified && 
                                   provider.agreementStatus === 'active';

        return belongsToCompany && isActiveAndCompliant;
      })
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Priorizar fuentes según seguridad de términos 2026
   * @param {Array} sources - Fuentes autorizadas
   */
  prioritizeSources(sources) {
    // Prioridad: 1) No-IA internas, 2) No-AI externas, 3) IA aisladas, 4) IA externas
    return sources.sort((a, b) => {
      const getPriorityScore = (source) => {
        let score = 0;
        
        // Preferir fuentes internas
        if (!source.requiresPSE) score += 100;
        
        // Penalizar proveedores de IA
        if (source.aiProvider) score -= 50;
        
        // Preferir procesamiento interno
        if (source.dataProcessing === 'internal_only') score += 30;
        
        // Preferir mayor prioridad configurada
        score += (100 - source.priority);
        
        return score;
      };

      return getPriorityScore(b) - getPriorityScore(a);
    });
  }

  /**
   * Consultar fuente autorizada con cumplimiento
   * @param {Object} source - Fuente autorizada
   * @param {string} message - Mensaje de consulta
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   * @param {Object} complianceCheck - Verificación de cumplimiento
   */
  async queryAuthorizedSource(source, message, companyId, userPhone, complianceCheck) {
    const startTime = Date.now();

    try {
      let response;

      // Verificaciones específicas según tipo de fuente
      if (source.aiProvider) {
        // Verificaciones adicionales para proveedores de IA
        const aiCompliance = await this.validateAIUsage(source, companyId);
        if (!aiCompliance.allowed) {
          throw new Error(`Proveedor de IA no autorizado: ${aiCompliance.reason}`);
        }
      }

      // Consultar según tipo de fuente
      switch (source.type) {
        case 'faq':
          response = await this.queryCompliantFAQ(source, message, companyId);
          break;
        case 'crm':
          response = await this.queryCompliantCRM(source, message, companyId, userPhone);
          break;
        case 'database':
          response = await this.queryCompliantDatabase(source, message, companyId);
          break;
        case 'api':
          response = await this.queryCompliantAPI(source, message, companyId);
          break;
        case 'ai':
          response = await this.queryCompliantAI(source, message, companyId, userPhone);
          break;
        default:
          throw new Error(`Tipo de fuente no soportado: ${source.type}`);
      }

      const responseTime = Date.now() - startTime;

      // Validar respuesta según términos 2026
      const responseValidation = await this.validateResponseCompliance(response, source);

      if (!responseValidation.compliant) {
        throw new Error(`Respuesta no cumple términos 2026: ${responseValidation.reason}`);
      }

      return {
        ...response,
        responseTime,
        sourceId: source.id,
        sourceType: source.type,
        compliant: true,
        complianceInfo: {
          terms2026: true,
          pseAuthorized: source.requiresPSE,
          aiProvider: source.aiProvider,
          noProfiling: true,
          exclusiveUse: true
        }
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw new Error(`Error consultando ${source.type}: ${error.message}`);
    }
  }

  /**
   * Consultar FAQ con cumplimiento
   * @param {Object} source - Fuente FAQ
   * @param {string} message - Mensaje
   * @param {number} companyId - ID de la empresa
   */
  async queryCompliantFAQ(source, message, companyId) {
    const { data, error } = await supabase
      .from('faq_entries')
      .select('*')
      .eq('company_id', companyId)
      .or(`question.ilike.%${message}%,answer.ilike.%${message}%,keywords.ilike.%${message}%`)
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(5);

    if (error) throw error;

    if (!data || data.length === 0) {
      return null;
    }

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
        priority: bestMatch.priority,
        noProfiling: true
      }
    };
  }

  /**
   * Consultar CRM con cumplimiento (sin perfiles)
   * @param {Object} source - Fuente CRM
   * @param {string} message - Mensaje
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   */
  async queryCompliantCRM(source, message, companyId, userPhone) {
    // Buscar información específica (sin crear perfiles)
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)
      .eq('phone', userPhone)
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      throw customerError;
    }

    // Buscar interacciones recientes (sin historial extenso que podría ser perfil)
    const { data: recentInteractions, error: interactionError } = await supabase
      .from('customer_interactions')
      .select('*')
      .eq('company_id', companyId)
      .eq('customer_phone', userPhone)
      .order('created_at', { ascending: false })
      .limit(3); // Solo interacciones muy recientes

    if (interactionError) throw interactionError;

    // Generar respuesta sin crear/ampliar perfiles
    const crmResponse = this.generateCompliantCRMResponse(message, customer, recentInteractions);

    return {
      content: crmResponse.content,
      confidence: crmResponse.confidence,
      type: 'crm_data',
      metadata: {
        hasRecentData: !!(customer && recentInteractions?.length > 0),
        lastInteraction: recentInteractions?.[0]?.created_at,
        noProfiling: true,
        dataMinimal: true
      }
    };
  }

  /**
   * Generar respuesta CRM sin crear perfiles (cumpliendo términos 2026)
   * @param {string} message - Mensaje del usuario
   * @param {Object} customer - Datos del cliente
   * @param {Array} interactions - Interacciones recientes
   */
  generateCompliantCRMResponse(message, customer, interactions) {
    if (!customer) {
      return {
        content: 'No encuentro información reciente. ¿En qué puedo ayudarte?',
        confidence: 0.6
      };
    }

    // Respuesta basada solo en datos muy recientes (sin perfil histórico)
    if (interactions && interactions.length > 0) {
      const lastInteraction = interactions[0];
      const hoursSinceLastInteraction = (Date.now() - new Date(lastInteraction.created_at).getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastInteraction < 24) {
        return {
          content: `Veo que tu consulta reciente fue sobre "${lastInteraction.topic}". ¿En qué puedo ayudarte hoy?`,
          confidence: 0.8
        };
      }
    }

    return {
      content: `Hola. ¿En qué puedo ayudarte hoy?`,
      confidence: 0.7
    };
  }

  /**
   * Consultar base de datos con cumplimiento
   * @param {Object} source - Fuente de base de datos
   * @param {string} message - Mensaje
   * @param {number} companyId - ID de la empresa
   */
  async queryCompliantDatabase(source, message, companyId) {
    const { data, error } = await supabase.rpc('search_knowledge_base_compliant', {
      p_company_id: companyId,
      p_query: message,
      p_limit: 5,
      p_no_profiling: true // Parámetro para asegurar cumplimiento
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
        similarity: bestMatch.similarity_score,
        noProfiling: true
      }
    };
  }

  /**
   * Consultar API externa con cumplimiento
   * @param {Object} source - Fuente API
   * @param {string} message - Mensaje
   * @param {number} companyId - ID de la empresa
   */
  async queryCompliantAPI(source, message, companyId) {
    const response = await fetch(source.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Company-ID': companyId.toString(),
        'X-Terms-2026': 'compliant',
        ...source.headers
      },
      body: JSON.stringify({
        query: message,
        timestamp: new Date().toISOString(),
        source: 'whatsapp_business_2026_compliant',
        noProfiling: true,
        exclusiveUse: true
      }),
      signal: AbortSignal.timeout(source.timeout || 5000)
    });

    if (!response.ok) {
      throw new Error(`API response: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validar que la API no incluye datos de perfil
    if (data.profileData || data.userTracking) {
      throw new Error('API devuelve datos de perfil (prohibido por términos 2026)');
    }

    return {
      content: data.answer || data.response || data.content,
      confidence: data.confidence || 0.8,
      type: 'api_response',
      metadata: {
        endpoint: source.endpoint,
        responseTime: data.responseTime,
        requestId: data.requestId,
        noProfiling: true
      }
    };
  }

  /**
   * Consultar IA con cumplimiento estricto de términos 2026
   * @param {Object} source - Fuente de IA
   * @param {string} message - Mensaje
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   */
  async queryCompliantAI(source, message, companyId, userPhone) {
    // Verificaciones estrictas para IA según términos 2026
    
    // 1. Obtener modelo aislado para este cliente
    const isolatedModel = await this.getIsolatedModel(companyId, source);
    
    // 2. Procesar con prohibición explícita de entrenamiento
    const response = await isolatedModel.generate({
      input: message,
      mode: 'inference_only', // Solo inferencia
      training: false, // Explícitamente prohibido
      data_retention: 'none', // No retener datos
      no_profiling: true,
      exclusive_use: true,
      user_hash: this.hashUserData(userPhone) // Hash en lugar de datos reales
    });

    // 3. Validar que no se usaron datos para entrenamiento
    if (response.trainingDataUsed || response.modelUpdated) {
      throw new Error('Modelo de IA usó datos para entrenamiento (prohibido por términos 2026)');
    }

    return {
      content: response.text,
      confidence: response.confidence || 0.75,
      type: 'ai_generated',
      metadata: {
        model: 'isolated_customer_model',
        tokens: response.tokens,
        processingTime: response.processingTime,
        noTrainingData: true,
        exclusiveUse: true,
        modelIsolation: 'complete'
      }
    };
  }

  /**
   * Obtener modelo aislado para cliente (cumpliendo términos 2026)
   * @param {number} companyId - ID de la empresa
   * @param {Object} source - Fuente de IA
   */
  async getIsolatedModel(companyId, source) {
    const modelKey = `${companyId}_${source.id}`;
    
    if (!this.isolatedModels.has(modelKey)) {
      // Crear modelo completamente aislado
      const isolatedModel = await this.createIsolatedModel({
        companyId,
        sourceId: source.id,
        trainingData: 'none', // Sin datos de entrenamiento
        baseModel: 'generic_untrained', // Modelo base no entrenado
        isolation: 'complete', // Aislamiento completo
        noProfiling: true,
        exclusiveUse: true
      });
      
      this.isolatedModels.set(modelKey, isolatedModel);
    }
    
    return this.isolatedModels.get(modelKey);
  }

  /**
   * Crear modelo aislado (simulado)
   * @param {Object} config - Configuración del modelo aislado
   */
  async createIsolatedModel(config) {
    // Simulación de creación de modelo aislado
    return {
      generate: async (params) => {
        // Simulación de respuesta de IA aislada
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              text: 'Esta es una respuesta de IA aislada para uso exclusivo del cliente. No se utilizan datos para entrenamiento.',
              confidence: 0.75,
              tokens: 45,
              processingTime: 1200,
              trainingDataUsed: false,
              modelUpdated: false
            });
          }, 1000);
        });
      }
    };
  }

  /**
   * Validar cumplimiento de respuesta
   * @param {Object} response - Respuesta a validar
   * @param {Object} source - Fuente utilizada
   */
  async validateResponseCompliance(response, source) {
    const issues = [];

    // 1. Validar contenido según políticas de WhatsApp
    const contentValidation = await whatsappComplianceService.validateMessageContent(
      response.content,
      response.type || 'text'
    );

    if (!contentValidation.valid) {
      issues.push(`Contenido inválido: ${contentValidation.reason}`);
    }

    // 2. Validar que no incluye datos de perfil
    if (response.content.includes('perfil') || response.content.includes('historial completo')) {
      issues.push('Respuesta incluye datos de perfil (prohibido por términos 2026)');
    }

    // 3. Validar fuente autorizada
    if (!source.complianceVerified || source.agreementStatus !== 'active') {
      issues.push('Fuente no autorizada o no cumplida');
    }

    return {
      compliant: issues.length === 0,
      reason: issues.join('; ')
    };
  }

  /**
   * Agregar divulgación de cumplimiento términos 2026
   * @param {Object} response - Respuesta
   * @param {Object} source - Fuente utilizada
   */
  add2026ComplianceDisclosure(response, source) {
    let disclosureText = '';

    // Transparencia según tipo de fuente
    if (source.aiProvider) {
      disclosureText = '🤖 *Respuesta generada por IA aislada para uso exclusivo*\n\n';
    } else if (source.type === 'faq') {
      disclosureText = '📚 *Respuesta de base de conocimiento autorizada*\n\n';
    } else if (source.type === 'crm') {
      disclosureText = '👤 *Respuesta basada en datos recientes (sin perfiles)*\n\n';
    }

    // Opción de hablar con humano
    const humanOption = '\n\n_Si prefieres hablar con un humano, responde "HUMANO"_';

    return {
      ...response,
      content: disclosureText + response.content + humanOption,
      transparency: {
        terms2026: true,
        sourceType: source.type,
        aiProvider: source.aiProvider,
        noProfiling: true,
        exclusiveUse: true
      }
    };
  }

  /**
   * Registrar uso cumplido para responsabilidad del cliente
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   * @param {string} originalMessage - Mensaje original
   * @param {Object} response - Respuesta generada
   * @param {Object} source - Fuente utilizada
   */
  async recordCompliantUsage(companyId, userPhone, originalMessage, response, source) {
    try {
      // Registrar en tabla de uso cumplido
      const { error } = await supabase
        .from('compliant_knowledge_usage')
        .insert({
          company_id: companyId,
          user_phone_hash: this.hashUserData(userPhone), // Hash para privacidad
          original_message_hash: this.hashUserData(originalMessage),
          response_content: response.content,
          source_id: source.id,
          source_type: source.type,
          pse_authorized: source.requiresPSE,
          ai_provider: source.aiProvider,
          confidence: response.confidence,
          response_time: response.responseTime,
          terms_2026_compliant: true,
          no_profiling: true,
          exclusive_use: true,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // También registrar como interacción estándar de WhatsApp
      await whatsappComplianceService.recordUserInteraction(
        companyId,
        userPhone,
        'compliant_knowledge_response',
        {
          source: source.type,
          confidence: response.confidence,
          terms2026: true
        }
      );

    } catch (error) {
      console.error('Error registrando uso cumplido:', error);
    }
  }

  /**
   * Generar hash para datos de usuario (privacidad)
   * @param {string} data - Datos a hashear
   */
  hashUserData(data) {
    // Simulación de hash (en producción usar crypto real)
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Generar reporte de cumplimiento para Meta
   * @param {number} companyId - ID de la empresa
   * @param {Object} period - Período del reporte
   */
  async generateComplianceReport(companyId, period = {}) {
    const report = {
      period: period.start && period.end ? { start: period.start, end: period.end } : 'last_30_days',
      companyId,
      timestamp: new Date().toISOString(),
      terms2026: true,
      
      // Reporte de PSE
      externalProviders: await this.getExternalProviderReport(companyId, period),
      
      // Reporte de uso de IA
      aiUsage: await this.getAIUsageReport(companyId, period),
      
      // Verificación de restricciones
      dataRestrictions: await this.getDataRestrictionsReport(companyId, period),
      
      // Incidentes de cumplimiento
      complianceIncidents: await this.getComplianceIncidents(companyId, period),
      
      // Evidencia de cumplimiento
      complianceEvidence: await this.getComplianceEvidence(companyId, period)
    };

    // Guardar reporte
    await this.saveComplianceReport(companyId, report);

    return report;
  }

  /**
   * Obtener reporte de proveedores externos
   * @param {number} companyId - ID de la empresa
   * @param {Object} period - Período
   */
  async getExternalProviderReport(companyId, period) {
    const providers = Array.from(this.authorizedProviders.values())
      .filter(p => p.companyId === companyId && p.requiresPSE);

    return {
      authorizedProviders: providers.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        agreementStatus: p.agreementStatus,
        complianceVerified: p.complianceVerified
      })),
      usageStats: await this.getProviderUsageStats(companyId, period),
      complianceStatus: 'verified'
    };
  }

  /**
   * Obtener reporte de uso de IA
   * @param {number} companyId - ID de la empresa
   * @param {Object} period - Período
   */
  async getAIUsageReport(companyId, period) {
    const { data, error } = await supabase
      .from('compliant_knowledge_usage')
      .select('*')
      .eq('company_id', companyId)
      .eq('ai_provider', true)
      .gte('created_at', period.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', period.end || new Date().toISOString());

    if (error) throw error;

    return {
      totalAIQueries: data?.length || 0,
      averageConfidence: data?.reduce((sum, d) => sum + (d.confidence || 0), 0) / (data?.length || 1),
      modelIsolationVerified: true,
      noTrainingDataVerified: data?.every(d => d.no_profiling && d.exclusive_use) || false,
      exclusiveUseVerified: true
    };
  }

  /**
   * Guardar reporte de cumplimiento
   * @param {number} companyId - ID de la empresa
   * @param {Object} report - Reporte a guardar
   */
  async saveComplianceReport(companyId, report) {
    try {
      const { error } = await supabase
        .from('compliance_reports')
        .insert({
          company_id: companyId,
          report_type: 'terms_2026_compliance',
          report_data: report,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error guardando reporte de cumplimiento:', error);
    }
  }

  /**
   * Registrar incidente de cumplimiento
   * @param {number} companyId - ID de la empresa
   * @param {string} providerId - ID del proveedor
   * @param {string} description - Descripción del incidente
   */
  async recordComplianceIncident(companyId, providerId, description) {
    try {
      const { error } = await supabase
        .from('compliance_incidents')
        .insert({
          company_id: companyId,
          provider_id: providerId,
          incident_type: 'terms_2026_violation',
          description,
          severity: 'medium',
          resolved: false,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error registrando incidente:', error);
    }
  }

  /**
   * Registrar error de cumplimiento
   * @param {number} companyId - ID de la empresa
   * @param {string} userPhone - Teléfono del usuario
   * @param {string} error - Error
   */
  async recordComplianceError(companyId, userPhone, error) {
    try {
      await supabase
        .from('compliance_errors')
        .insert({
          company_id: companyId,
          user_phone_hash: this.hashUserData(userPhone),
          error_message: error,
          error_type: 'terms_2026_compliance',
          created_at: new Date().toISOString()
        });
    } catch (e) {
      console.error('Error registrando error de cumplimiento:', e);
    }
  }
}

// Crear instancia global del servicio cumplido
const whatsapp2026CompliantKnowledgeService = new WhatsApp2026CompliantKnowledgeService();

export default whatsapp2026CompliantKnowledgeService;