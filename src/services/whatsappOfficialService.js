/**
 * Servicio para la API oficial de WhatsApp Business
 * Maneja la integración con la API oficial de Meta para WhatsApp Business
 *
 * NOTA: Este servicio ahora usa configurationService para persistencia
 * en lugar de localStorage directamente.
 */

import configurationService from './configurationService.js'

class WhatsAppOfficialService {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    this.accessToken = null;
    this.phoneNumberId = null;
    this.webhookVerifyToken = null;
    this.testMode = false;
  }

  /**
   * Configura las credenciales del servicio
   */
  configure(config) {
    this.accessToken = config.accessToken;
    this.phoneNumberId = config.phoneNumberId;
    this.webhookVerifyToken = config.webhookVerifyToken;
    this.testMode = config.testMode || false;
  }

  /**
   * Carga configuración desde configurationService
   */
  async loadConfiguration() {
    try {
      const config = await configurationService.getConfig('integrations', 'whatsappOfficial', 'global', null, {
        accessToken: '',
        phoneNumberId: '',
        webhookVerifyToken: '',
        testMode: false
      });

      // Configurar el servicio con los valores cargados
      this.configure(config);

      return config;
    } catch (error) {
      console.error('Error loading WhatsApp Official configuration:', error);
      return {
        accessToken: '',
        phoneNumberId: '',
        webhookVerifyToken: '',
        testMode: false
      };
    }
  }

  /**
   * Guarda configuración usando configurationService
   */
  async saveConfiguration(config) {
    try {
      await configurationService.setConfig('integrations', 'whatsappOfficial', config, 'global', null,
        'Configuración de WhatsApp Business API oficial');

      this.configure(config);
    } catch (error) {
      console.error('Error saving WhatsApp Official configuration:', error);
      // Fallback: configurar solo en memoria
      this.configure(config);
    }
  }

  /**
   * Limpia configuración
   */
  async clearConfiguration() {
    try {
      await configurationService.deleteConfig('integrations', 'whatsappOfficial', 'global', null);
    } catch (error) {
      console.error('Error clearing WhatsApp Official configuration:', error);
    }

    this.accessToken = null;
    this.phoneNumberId = null;
    this.webhookVerifyToken = null;
    this.testMode = false;
  }

  /**
   * Verifica si el servicio está configurado
   */
  isConfigured() {
    return !!(this.accessToken && this.phoneNumberId);
  }

  /**
   * Envía un mensaje de texto
   */
  async sendTextMessage(to, message) {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp Official API no está configurado');
    }

    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''), // Solo números
      type: 'text',
      text: {
        body: message
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API Error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messages?.[0]?.id,
        status: 'sent',
        api: 'official'
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error.message,
        api: 'official'
      };
    }
  }

  /**
   * Envía un mensaje con plantilla
   */
  async sendTemplateMessage(to, templateName, language = 'es', components = []) {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp Official API no está configurado');
    }

    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language
        },
        components: components
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API Error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messages?.[0]?.id,
        status: 'sent',
        api: 'official'
      };
    } catch (error) {
      console.error('Error sending WhatsApp template message:', error);
      return {
        success: false,
        error: error.message,
        api: 'official'
      };
    }
  }

  /**
   * Envía mensajes masivos
   */
  async sendBulkMessages(recipients, message) {
    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendTextMessage(recipient, message);
        results.push({
          recipient,
          ...result
        });

        // Pequeña pausa para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          recipient,
          success: false,
          error: error.message,
          api: 'official'
        });
      }
    }

    return results;
  }

  /**
   * Verifica el estado de conexión
   */
  async testConnection() {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'WhatsApp Official API no está configurado'
      };
    }

    try {
      // Intentar obtener información del número de teléfono
      const url = `${this.baseUrl}/${this.phoneNumberId}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        phoneInfo: {
          name: data.name || 'Configurado',
          verifiedName: data.verified_name || 'Pendiente',
          codeVerificationStatus: data.code_verification_status || 'unknown'
        },
        api: 'official'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        api: 'official'
      };
    }
  }

  /**
   * Obtiene estadísticas de uso
   */
  async getStatistics() {
    // La API oficial no proporciona estadísticas directas
    // Esto sería implementado con webhooks o consultas específicas
    return {
      api: 'official',
      note: 'Las estadísticas se obtienen a través de webhooks configurados',
      webhookUrl: `${window.location.origin}/api/webhooks/whatsapp`
    };
  }

  /**
   * Maneja webhooks entrantes
   */
  handleWebhook(payload) {
    // Procesar webhook según la estructura de Meta
    if (payload.object === 'whatsapp_business_account') {
      const entries = payload.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          if (change.field === 'messages') {
            const messages = change.value.messages || [];
            const contacts = change.value.contacts || [];

            // Procesar mensajes
            for (const message of messages) {
              this.processIncomingMessage(message, contacts);
            }
          }
        }
      }
    }
  }

  /**
   * Procesa mensajes entrantes
   */
  processIncomingMessage(message, contacts) {
    // Implementar lógica para procesar mensajes entrantes
    console.log('Mensaje entrante procesado:', {
      from: message.from,
      type: message.type,
      timestamp: message.timestamp,
      api: 'official'
    });

    // Aquí se podría emitir eventos o llamar callbacks
    // para integrar con el sistema de comunicación
  }

  /**
   * Verifica token de webhook
   */
  verifyWebhookToken(mode, token, challenge) {
    if (mode === 'subscribe' && token === this.webhookVerifyToken) {
      return challenge;
    }
    return false;
  }
}

// Crear instancia singleton con inicialización asíncrona
const whatsappOfficialService = new WhatsAppOfficialService();

// Inicializar configuración al cargar el módulo
whatsappOfficialService.loadConfiguration().catch(error => {
  console.error('Error loading WhatsApp Official configuration on startup:', error);
});

export default whatsappOfficialService;