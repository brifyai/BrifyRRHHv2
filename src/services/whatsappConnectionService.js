/**
 * Servicio de Conexión Real con WhatsApp Business API
 * 
 * Este servicio proporciona una interfaz real para conectar y verificar
 * las credenciales de WhatsApp Business API de Meta.
 */

class WhatsAppConnectionService {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    this.testMode = false;
  }

  /**
   * Verifica si un Access Token es válido y obtiene información del número
   * @param {string} accessToken - Token de acceso permanente
   * @param {string} phoneNumberId - ID del número de teléfono
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verifyCredentials(accessToken, phoneNumberId) {
    try {
      // Primero verificamos el token de acceso
      const tokenResponse = await fetch(`${this.baseUrl}/me?access_token=${accessToken}`);
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        return {
          success: false,
          message: `Token de acceso inválido: ${errorData.error?.message || 'Error desconocido'}`,
          error: errorData.error
        };
      }

      const tokenData = await tokenResponse.json();
      
      // Luego verificamos el número de teléfono
      const phoneResponse = await fetch(
        `${this.baseUrl}/${phoneNumberId}?fields=name,display_phone_number&access_token=${accessToken}`
      );

      if (!phoneResponse.ok) {
        const errorData = await phoneResponse.json();
        return {
          success: false,
          message: `ID de teléfono inválido: ${errorData.error?.message || 'Error desconocido'}`,
          error: errorData.error
        };
      }

      const phoneData = await phoneResponse.json();

      // Verificamos el estado del webhook si está configurado
      let webhookStatus = null;
      try {
        const webhookResponse = await fetch(
          `${this.baseUrl}/${phoneData.id}/subscribed_apps?access_token=${accessToken}`
        );
        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json();
          webhookStatus = webhookData.data.length > 0 ? 'Configurado' : 'No configurado';
        }
      } catch (error) {
        console.warn('No se pudo verificar el estado del webhook:', error);
      }

      return {
        success: true,
        message: 'Credenciales verificadas correctamente',
        data: {
          app: tokenData,
          phoneNumber: phoneData,
          webhookStatus,
          capabilities: await this.getPhoneCapabilities(phoneNumberId, accessToken)
        }
      };

    } catch (error) {
      console.error('Error verificando credenciales:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Obtiene las capacidades del número de teléfono
   * @param {string} phoneNumberId - ID del número de teléfono
   * @param {string} accessToken - Token de acceso
   * @returns {Promise<Object>} Capacidades del número
   */
  async getPhoneCapabilities(phoneNumberId, accessToken) {
    try {
      const response = await fetch(
        `${this.baseUrl}/${phoneNumberId}?fields=capabilities&access_token=${accessToken}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.capabilities || {};
      }
    } catch (error) {
      console.warn('No se pudieron obtener las capacidades:', error);
    }
    return {};
  }

  /**
   * Envía un mensaje de prueba para verificar la conexión
   * @param {string} accessToken - Token de acceso
   * @param {string} phoneNumberId - ID del número de teléfono
   * @param {string} testPhone - Número de teléfono de prueba
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendTestMessage(accessToken, phoneNumberId, testPhone = null) {
    try {
      // Si no se proporciona número de prueba, usamos uno predeterminado para modo prueba
      const to = testPhone || '14155238886'; // Número de WhatsApp de prueba
      
      const messageData = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: 'hello_world',
          language: {
            code: 'en_US'
          }
        }
      };

      const response = await fetch(
        `${this.baseUrl}/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        }
      );

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Mensaje de prueba enviado correctamente',
          data: result
        };
      } else {
        return {
          success: false,
          message: `Error enviando mensaje: ${result.error?.message || 'Error desconocido'}`,
          error: result.error
        };
      }

    } catch (error) {
      console.error('Error enviando mensaje de prueba:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Genera un webhook URL para el usuario
   * @param {string} baseUrl - URL base de la aplicación
   * @param {string} verifyToken - Token de verificación
   * @returns {string} URL del webhook
   */
  generateWebhookUrl(baseUrl, verifyToken) {
    // Limpiar la URL base
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return `${cleanBaseUrl}/api/webhook/whatsapp/${verifyToken}`;
  }

  /**
   * Valida el formato de un número de teléfono
   * @param {string} phoneNumber - Número de teléfono
   * @returns {Object} Resultado de la validación
   */
  validatePhoneNumber(phoneNumber) {
    // Eliminar caracteres no numéricos excepto +
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // Validar formato internacional
    const phoneRegex = /^\+\d{10,15}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return {
        valid: false,
        message: 'El número debe estar en formato internacional (+código país + número)',
        example: '+56912345678'
      };
    }

    return {
      valid: true,
      cleanPhone,
      message: 'Formato válido'
    };
  }

  /**
   * Genera un token de verificación seguro
   * @returns {string} Token generado
   */
  generateVerifyToken() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 16);
    return `whatsapp_${timestamp}_${randomStr}`;
  }

  /**
   * Obtiene la configuración necesaria para Meta Developers
   * @returns {Object} Información de configuración
   */
  getMetaDevelopersSetup() {
    return {
      steps: [
        {
          title: 'Crear cuenta en Meta Developers',
          description: 'Visita developers.facebook.com y crea una cuenta con tu perfil de Facebook',
          url: 'https://developers.facebook.com'
        },
        {
          title: 'Crear nueva aplicación',
          description: 'Haz clic en "Mis Aplicaciones" → "Crear Aplicación" → "Negocio"',
          url: 'https://developers.facebook.com/apps/create'
        },
        {
          title: 'Configurar WhatsApp',
          description: 'En el panel de la aplicación, busca "WhatsApp" y haz clic en "Configurar"',
          url: null
        },
        {
          title: 'Obtener credenciales',
          description: 'Una vez configurado, obtén tu Access Token permanente y Phone Number ID',
          url: null
        }
      ],
      requiredFields: [
        {
          name: 'Access Token',
          description: 'Token de acceso permanente (empieza con EAAZA...)',
          example: 'EAAZA...'
        },
        {
          name: 'Phone Number ID',
          description: 'ID numérico de tu número de WhatsApp Business',
          example: '1234567890123456'
        },
        {
          name: 'Webhook Verify Token',
          description: 'Token único para verificar webhooks (opcional)',
          example: 'whatsapp_token_secreto_123'
        }
      ],
      tips: [
        'Usa una cuenta de WhatsApp Business verificada',
        'El Access Token debe ser permanente (no temporal)',
        'Guarda tus credenciales en un lugar seguro',
        'Configura webhooks para recibir mensajes entrantes'
      ]
    };
  }

  /**
   * Verifica si el sistema está en modo de prueba
   * @returns {boolean} True si está en modo prueba
   */
  isTestMode() {
    return this.testMode;
  }

  /**
   * Activa o desactiva el modo de prueba
   * @param {boolean} enabled - Estado del modo prueba
   */
  setTestMode(enabled) {
    this.testMode = enabled;
  }
}

// Exportar una instancia única del servicio
const whatsappConnectionService = new WhatsAppConnectionService();
export default whatsappConnectionService;