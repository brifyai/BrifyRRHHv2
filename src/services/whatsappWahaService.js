/**
 * Servicio para la API de WAHA (waha.devike.pro)
 * Maneja la integración con la API de WAHA para WhatsApp
 */

class WhatsAppWahaService {
  constructor() {
    this.baseUrl = 'https://waha.devike.pro';
    this.apiKey = null;
    this.sessionId = null;
    this.testMode = false;
  }

  /**
   * Configura las credenciales del servicio
   */
  configure(config) {
    this.apiKey = config.apiKey;
    this.sessionId = config.sessionId;
    this.testMode = config.testMode || false;
  }

  /**
   * Carga configuración desde localStorage
   */
  loadConfiguration() {
    return {
      apiKey: localStorage.getItem('whatsapp_waha_api_key'),
      sessionId: localStorage.getItem('whatsapp_waha_session_id'),
      testMode: localStorage.getItem('whatsapp_waha_test_mode') === 'true'
    };
  }

  /**
   * Guarda configuración en localStorage
   */
  saveConfiguration(config) {
    if (config.apiKey) localStorage.setItem('whatsapp_waha_api_key', config.apiKey);
    if (config.sessionId) localStorage.setItem('whatsapp_waha_session_id', config.sessionId);
    if (config.testMode !== undefined) localStorage.setItem('whatsapp_waha_test_mode', config.testMode.toString());

    this.configure(config);
  }

  /**
   * Limpia configuración
   */
  clearConfiguration() {
    localStorage.removeItem('whatsapp_waha_api_key');
    localStorage.removeItem('whatsapp_waha_session_id');
    localStorage.removeItem('whatsapp_waha_test_mode');

    this.apiKey = null;
    this.sessionId = null;
    this.testMode = false;
  }

  /**
   * Verifica si el servicio está configurado
   */
  isConfigured() {
    return !!(this.apiKey && this.sessionId);
  }

  /**
   * Envía un mensaje de texto
   */
  async sendTextMessage(to, message) {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp WAHA API no está configurado');
    }

    const url = `${this.baseUrl}/api/sendText`;

    const payload = {
      chatId: `${to}@c.us`, // Formato requerido por WAHA
      text: message,
      session: this.sessionId
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WAHA API Error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.id || result.messageId,
        status: 'sent',
        api: 'waha'
      };
    } catch (error) {
      console.error('Error sending WAHA message:', error);
      return {
        success: false,
        error: error.message,
        api: 'waha'
      };
    }
  }

  /**
   * Envía un mensaje con archivo
   */
  async sendFileMessage(to, fileUrl, caption = '') {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp WAHA API no está configurado');
    }

    const url = `${this.baseUrl}/api/sendFile`;

    const payload = {
      session: this.sessionId,
      chatId: `${to}@c.us`,
      file: fileUrl,
      caption: caption
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WAHA API Error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.id || result.messageId,
        status: 'sent',
        api: 'waha'
      };
    } catch (error) {
      console.error('Error sending WAHA file message:', error);
      return {
        success: false,
        error: error.message,
        api: 'waha'
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
          api: 'waha'
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
        error: 'WhatsApp WAHA API no está configurado'
      };
    }

    try {
      // Intentar obtener información de la sesión
      const url = `${this.baseUrl}/api/sessions/${this.sessionId}`;
      const response = await fetch(url, {
        headers: {
          'X-Api-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        sessionInfo: {
          sessionId: this.sessionId,
          status: data.status || 'connected',
          phone: data.phone || 'Configurado',
          name: data.name || 'WAHA Session'
        },
        api: 'waha'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        api: 'waha'
      };
    }
  }

  /**
   * Obtiene estadísticas de uso
   */
  async getStatistics() {
    if (!this.isConfigured()) {
      return {
        api: 'waha',
        error: 'API no configurada'
      };
    }

    try {
      const url = `${this.baseUrl}/api/sessions/${this.sessionId}/stats`;
      const response = await fetch(url, {
        headers: {
          'X-Api-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const stats = await response.json();
      return {
        api: 'waha',
        messages: stats.messages || 0,
        lastActivity: stats.lastActivity || new Date().toISOString(),
        uptime: stats.uptime || 0
      };
    } catch (error) {
      return {
        api: 'waha',
        error: error.message,
        messages: 0
      };
    }
  }

  /**
   * Crea una nueva sesión
   */
  async createSession(sessionName) {
    if (!this.apiKey) {
      throw new Error('API Key es requerida para crear una sesión');
    }

    const url = `${this.baseUrl}/api/sessions`;

    const payload = {
      name: sessionName || `session_${Date.now()}`,
      default: true
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WAHA API Error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      this.sessionId = result.id;
      localStorage.setItem('whatsapp_waha_session_id', this.sessionId);

      return {
        success: true,
        sessionId: result.id,
        qrCode: result.qr // QR code para escanear con WhatsApp
      };
    } catch (error) {
      console.error('Error creating WAHA session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene el código QR para la sesión
   */
  async getQRCode() {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp WAHA API no está configurado');
    }

    const url = `${this.baseUrl}/api/sessions/${this.sessionId}/qr`;

    try {
      const response = await fetch(url, {
        headers: {
          'X-Api-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        qrCode: result.qrCode || result.qr
      };
    } catch (error) {
      console.error('Error getting WAHA QR code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica el estado de la sesión
   */
  async checkSessionStatus() {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'API no configurada'
      };
    }

    const url = `${this.baseUrl}/api/sessions/${this.sessionId}`;

    try {
      const response = await fetch(url, {
        headers: {
          'X-Api-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        status: data.status,
        phone: data.phone,
        name: data.name,
        profilePicUrl: data.profilePicUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Elimina la sesión actual
   */
  async deleteSession() {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'API no configurada'
      };
    }

    const url = `${this.baseUrl}/api/sessions/${this.sessionId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-Api-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.clearConfiguration();
      return {
        success: true,
        message: 'Sesión eliminada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envía un mensaje de ubicación
   */
  async sendLocationMessage(to, latitude, longitude, name = '', address = '') {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp WAHA API no está configurado');
    }

    const url = `${this.baseUrl}/api/sendLocation`;

    const payload = {
      session: this.sessionId,
      chatId: `${to}@c.us`,
      lat: latitude,
      lng: longitude,
      name: name,
      address: address
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WAHA API Error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.id || result.messageId,
        status: 'sent',
        api: 'waha'
      };
    } catch (error) {
      console.error('Error sending WAHA location message:', error);
      return {
        success: false,
        error: error.message,
        api: 'waha'
      };
    }
  }
}

// Exportar instancia singleton
const whatsappWahaService = new WhatsAppWahaService();
export default whatsappWahaService;