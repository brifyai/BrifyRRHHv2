/**
 * Servicio para la API oficial de WhatsApp Business
 * Maneja la integración con la API oficial de Meta para WhatsApp Business
 */

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
   * Carga configuración desde localStorage
   */
  loadConfiguration() {
    return {
      accessToken: localStorage.getItem('whatsapp_official_access_token'),
      phoneNumberId: localStorage.getItem('whatsapp_official_phone_number_id'),
      webhookVerifyToken: localStorage.getItem('whatsapp_official_webhook_verify_token'),
      testMode: localStorage.getItem('whatsapp_official_test_mode') === 'true'
    };
  }

  /**
   * Guarda configuración en localStorage
   */
  saveConfiguration(config) {
    if (config.accessToken) localStorage.setItem('whatsapp_official_access_token', config.accessToken);
    if (config.phoneNumberId) localStorage.setItem('whatsapp_official_phone_number_id', config.phoneNumberId);
    if (config.webhookVerifyToken) localStorage.setItem('whatsapp_official_webhook_verify_token', config.webhookVerifyToken);
    if (config.testMode !== undefined) localStorage.setItem('whatsapp_official_test_mode', config.testMode.toString());

    this.configure(config);
  }

  /**
   * Limpia configuración
   */
  clearConfiguration() {
    localStorage.removeItem('whatsapp_official_access_token');
    localStorage.removeItem('whatsapp_official_phone_number_id');
    localStorage.removeItem('whatsapp_official_webhook_verify_token');
    localStorage.removeItem('whatsapp_official_test_mode');

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

// Exportar instancia singleton
const whatsappOfficialService = new WhatsAppOfficialService();
export default whatsappOfficialService;