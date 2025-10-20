import { supabase } from '../lib/supabase'

/**
 * Servicio para gestionar credenciales de canales por empresa
 * Integra las configuraciones específicas de cada empresa con las integraciones globales
 */
class CompanyChannelCredentialsService {
  constructor() {
    this.globalIntegrations = null
    this.companyCredentialsCache = new Map()
  }

  /**
   * Cargar las integraciones globales desde localStorage
   */
  async loadGlobalIntegrations() {
    try {
      const stored = localStorage.getItem('integrations')
      if (stored) {
        this.globalIntegrations = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading global integrations:', error)
      this.globalIntegrations = {}
    }
  }

  /**
   * Obtener credenciales completas para un canal específico de una empresa
   * Combina las credenciales específicas de la empresa con las configuraciones globales
   */
  async getChannelCredentials(companyId, channelType) {
    // Verificar cache primero
    const cacheKey = `${companyId}_${channelType}`
    if (this.companyCredentialsCache.has(cacheKey)) {
      return this.companyCredentialsCache.get(cacheKey)
    }

    // Cargar integraciones globales si no están cargadas
    if (!this.globalIntegrations) {
      await this.loadGlobalIntegrations()
    }

    try {
      // Obtener configuración específica de la empresa
      const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (error) {
        console.error(`Error loading company ${companyId}:`, error)
        return this.getGlobalCredentials(channelType)
      }

      // Combinar credenciales específicas con globales
      const credentials = this.mergeCredentials(company, channelType)
      
      // Cachear resultado
      this.companyCredentialsCache.set(cacheKey, credentials)
      
      return credentials
    } catch (error) {
      console.error(`Error getting channel credentials for ${channelType}:`, error)
      return this.getGlobalCredentials(channelType)
    }
  }

  /**
   * Combinar credenciales específicas de la empresa con configuraciones globales
   */
  mergeCredentials(company, channelType) {
    const globalConfig = this.getGlobalCredentials(channelType)
    const companyConfig = this.getCompanyChannelConfig(company, channelType)

    // Si la empresa tiene el canal deshabilitado, retornar null
    if (companyConfig && companyConfig.enabled === false) {
      return null
    }

    // Combinar configuraciones, dando prioridad a las específicas de la empresa
    return {
      ...globalConfig,
      ...companyConfig,
      // Mantener referencia de la empresa para logging/auditoría
      companyId: company.id,
      companyName: company.name,
      source: companyConfig && Object.keys(companyConfig).length > 1 ? 'company' : 'global'
    }
  }

  /**
   * Obtener configuración específica de una empresa para un canal
   */
  getCompanyChannelConfig(company, channelType) {
    const channelMappings = {
      'email': {
        enabled: company.email_enabled,
        sender_name: company.email_sender_name,
        sender_email: company.email_sender_email,
        reply_to: company.email_reply_to,
        config: company.email_config
      },
      'sms': {
        enabled: company.sms_enabled,
        sender_name: company.sms_sender_name,
        sender_phone: company.sms_sender_phone,
        config: company.sms_config
      },
      'telegram': {
        enabled: company.telegram_enabled,
        bot_token: company.telegram_bot_token,
        bot_username: company.telegram_bot_username,
        webhook_url: company.telegram_webhook_url,
        config: company.telegram_config
      },
      'whatsapp': {
        enabled: company.whatsapp_enabled,
        access_token: company.whatsapp_access_token,
        phone_number_id: company.whatsapp_phone_number_id,
        webhook_verify_token: company.whatsapp_webhook_verify_token,
        config: company.whatsapp_config
      },
      'groq': {
        enabled: company.groq_enabled,
        api_key: company.groq_api_key,
        model: company.groq_model,
        temperature: company.groq_temperature,
        max_tokens: company.groq_max_tokens,
        config: company.groq_config
      },
      'google': {
        enabled: company.google_enabled,
        api_key: company.google_api_key,
        client_id: company.google_client_id,
        client_secret: company.google_client_secret,
        config: company.google_config
      },
      'microsoft': {
        enabled: company.microsoft_enabled,
        client_id: company.microsoft_client_id,
        client_secret: company.microsoft_client_secret,
        tenant_id: company.microsoft_tenant_id,
        config: company.microsoft_config
      },
      'slack': {
        enabled: company.slack_enabled,
        bot_token: company.slack_bot_token,
        signing_secret: company.slack_signing_secret,
        default_channel: company.slack_default_channel,
        config: company.slack_config
      },
      'teams': {
        enabled: company.teams_enabled,
        app_id: company.teams_app_id,
        client_secret: company.teams_client_secret,
        tenant_id: company.teams_tenant_id,
        config: company.teams_config
      },
      'hubspot': {
        enabled: company.hubspot_enabled,
        api_key: company.hubspot_api_key,
        portal_id: company.hubspot_portal_id,
        config: company.hubspot_config
      },
      'salesforce': {
        enabled: company.salesforce_enabled,
        consumer_key: company.salesforce_consumer_key,
        consumer_secret: company.salesforce_consumer_secret,
        username: company.salesforce_username,
        password: company.salesforce_password,
        config: company.salesforce_config
      }
    }

    return channelMappings[channelType] || {}
  }

  /**
   * Obtener configuración global para un canal
   */
  getGlobalCredentials(channelType) {
    if (!this.globalIntegrations) {
      return {}
    }

    const globalMappings = {
      'email': {
        smtp_config: this.globalIntegrations.brevo?.smtp_config,
        api_key: this.globalIntegrations.brevo?.api_key,
        sender_email: this.globalIntegrations.brevo?.sender_email,
        sender_name: this.globalIntegrations.brevo?.sender_name
      },
      'sms': {
        api_key: this.globalIntegrations.brevo?.api_key,
        sender_name: this.globalIntegrations.brevo?.sms_sender_name
      },
      'telegram': {
        bot_token: this.globalIntegrations.telegram?.bot_token,
        bot_username: this.globalIntegrations.telegram?.bot_username,
        webhook_url: this.globalIntegrations.telegram?.webhook_url
      },
      'whatsapp': {
        access_token: this.globalIntegrations.whatsapp?.access_token,
        phone_number_id: this.globalIntegrations.whatsapp?.phone_number_id,
        webhook_verify_token: this.globalIntegrations.whatsapp?.webhook_verify_token
      },
      'groq': {
        api_key: this.globalIntegrations.groq?.api_key,
        model: this.globalIntegrations.groq?.model || 'gemma2-9b-it',
        temperature: this.globalIntegrations.groq?.temperature || 0.7,
        max_tokens: this.globalIntegrations.groq?.max_tokens || 800
      },
      'google': {
        api_key: this.globalIntegrations.google?.api_key,
        client_id: this.globalIntegrations.google?.client_id,
        client_secret: this.globalIntegrations.google?.client_secret
      },
      'microsoft': {
        client_id: this.globalIntegrations.microsoft?.client_id,
        client_secret: this.globalIntegrations.microsoft?.client_secret,
        tenant_id: this.globalIntegrations.microsoft?.tenant_id
      },
      'slack': {
        bot_token: this.globalIntegrations.slack?.bot_token,
        signing_secret: this.globalIntegrations.slack?.signing_secret,
        default_channel: this.globalIntegrations.slack?.default_channel
      },
      'teams': {
        app_id: this.globalIntegrations.teams?.app_id,
        client_secret: this.globalIntegrations.teams?.client_secret,
        tenant_id: this.globalIntegrations.teams?.tenant_id
      },
      'hubspot': {
        api_key: this.globalIntegrations.hubspot?.api_key,
        portal_id: this.globalIntegrations.hubspot?.portal_id
      },
      'salesforce': {
        consumer_key: this.globalIntegrations.salesforce?.consumer_key,
        consumer_secret: this.globalIntegrations.salesforce?.consumer_secret,
        username: this.globalIntegrations.salesforce?.username,
        password: this.globalIntegrations.salesforce?.password
      }
    }

    return globalMappings[channelType] || {}
  }

  /**
   * Obtener todas las credenciales de una empresa
   */
  async getAllCompanyCredentials(companyId) {
    const channels = ['email', 'sms', 'telegram', 'whatsapp', 'groq', 'google', 'microsoft', 'slack', 'teams', 'hubspot', 'salesforce']
    const credentials = {}

    for (const channel of channels) {
      credentials[channel] = await this.getChannelCredentials(companyId, channel)
    }

    return credentials
  }

  /**
   * Validar si un canal está configurado y habilitado para una empresa
   */
  async isChannelConfigured(companyId, channelType) {
    const credentials = await this.getChannelCredentials(companyId, channelType)
    
    if (!credentials) {
      return false
    }

    // Verificar campos críticos según el tipo de canal
    const criticalFields = {
      'email': ['sender_email', 'smtp_config'],
      'sms': ['api_key'],
      'telegram': ['bot_token'],
      'whatsapp': ['access_token', 'phone_number_id'],
      'groq': ['api_key'],
      'google': ['client_id', 'client_secret'],
      'microsoft': ['client_id', 'client_secret', 'tenant_id'],
      'slack': ['bot_token'],
      'teams': ['app_id', 'client_secret', 'tenant_id'],
      'hubspot': ['api_key'],
      'salesforce': ['consumer_key', 'consumer_secret', 'username', 'password']
    }

    const requiredFields = criticalFields[channelType] || []
    return requiredFields.every(field => credentials[field])
  }

  /**
   * Limpiar cache de una empresa específica
   */
  clearCompanyCache(companyId) {
    const keysToDelete = []
    for (const key of this.companyCredentialsCache.keys()) {
      if (key.startsWith(`${companyId}_`)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.companyCredentialsCache.delete(key))
  }

  /**
   * Limpiar todo el cache
   */
  clearAllCache() {
    this.companyCredentialsCache.clear()
    this.globalIntegrations = null
  }

  /**
   * Obtener el orden de fallback de una empresa
   */
  async getFallbackOrder(companyId) {
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .select('fallback_config')
        .eq('id', companyId)
        .single()

      if (error) {
        console.error('Error loading fallback order:', error)
        return ['WhatsApp', 'Telegram', 'SMS', 'Email'] // Orden por defecto
      }

      return company.fallback_config?.order || ['WhatsApp', 'Telegram', 'SMS', 'Email']
    } catch (error) {
      console.error('Error getting fallback order:', error)
      return ['WhatsApp', 'Telegram', 'SMS', 'Email']
    }
  }

  /**
   * Obtener canales habilitados para una empresa en orden de prioridad
   */
  async getEnabledChannels(companyId) {
    const fallbackOrder = await this.getFallbackOrder(companyId)
    const enabledChannels = []

    for (const channel of fallbackOrder) {
      const isConfigured = await this.isChannelConfigured(companyId, channel.toLowerCase())
      if (isConfigured) {
        enabledChannels.push(channel)
      }
    }

    return enabledChannels
  }
}

export default new CompanyChannelCredentialsService()