/**
 * Servicio de Brevo para envío masivo de SMS y Email
 * 
 * Este servicio proporciona una interfaz completa para:
 * - Configuración de API de Brevo
 * - Envío masivo de SMS
 * - Envío masivo de Email
 * - Gestión de plantillas
 * - Estadísticas de envío
 * - Pruebas de conexión
 */

class BrevoService {
  constructor() {
    this.apiKey = null
    this.baseUrl = 'https://api.brevo.com/v3'
    this.isConfigured = false
    this.testMode = false
  }

  /**
   * Configurar las credenciales de Brevo
   * @param {string} apiKey - API Key de Brevo
   * @param {boolean} testMode - Modo de prueba (opcional)
   */
  configure(apiKey, testMode = false) {
    this.apiKey = apiKey
    this.testMode = testMode
    this.isConfigured = !!apiKey
    
    // Guardar en localStorage para persistencia
    if (apiKey) {
      localStorage.setItem('brevo_api_key', apiKey)
      localStorage.setItem('brevo_test_mode', testMode.toString())
    }
  }

  /**
   * Cargar configuración desde localStorage
   */
  loadConfiguration() {
    const apiKey = localStorage.getItem('brevo_api_key')
    const testMode = localStorage.getItem('brevo_test_mode') === 'true'
    
    if (apiKey) {
      this.configure(apiKey, testMode)
    }
    
    return { apiKey: this.apiKey, testMode: this.testMode }
  }

  /**
   * Limpiar configuración
   */
  clearConfiguration() {
    this.apiKey = null
    this.testMode = false
    this.isConfigured = false
    
    localStorage.removeItem('brevo_api_key')
    localStorage.removeItem('brevo_test_mode')
  }

  /**
   * Obtener headers para peticiones a la API
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'api-key': this.apiKey
    }
  }

  /**
   * Probar conexión con la API de Brevo
   * @returns {Promise<Object>} Resultado de la prueba
   */
  async testConnection() {
    if (!this.isConfigured) {
      throw new Error('Brevo no está configurado. Por favor configura tu API Key primero.')
    }

    try {
      const response = await fetch(`${this.baseUrl}/account`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const account = await response.json()
      
      return {
        success: true,
        message: 'Conexión exitosa con Brevo',
        account: {
          email: account.email,
          firstName: account.firstName,
          lastName: account.lastName,
          plan: account.plan,
          credits: account.credits
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Enviar SMS masivo
   * @param {Object} params - Parámetros del envío
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendBulkSMS(params) {
    if (!this.isConfigured) {
      throw new Error('Brevo no está configurado')
    }

    const {
      recipients, // Array de { phone: string, name?: string }
      message,
      sender = 'Brify',
      scheduledAt = null
    } = params

    // Validar destinatarios
    if (!recipients || recipients.length === 0) {
      throw new Error('No hay destinatarios especificados')
    }

    // Limitar a 1000 destinatarios por petición (límite de Brevo)
    const batchSize = 1000
    const batches = []
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize))
    }

    const results = []
    
    for (const batch of batches) {
      try {
        const payload = {
          sender: sender,
          recipient: batch.map(r => r.phone).join(','),
          content: message,
          type: 'transactional'
        }

        if (scheduledAt) {
          payload.scheduledAt = scheduledAt
        }

        if (this.testMode) {
          // En modo prueba, simular envío
          results.push({
            batchIndex: results.length,
            success: true,
            messageId: `test_${Date.now()}_${results.length}`,
            recipientsCount: batch.length,
            testMode: true
          })
        } else {
          const response = await fetch(`${this.baseUrl}/sms`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
          })

          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
          }

          const result = await response.json()
          results.push({
            batchIndex: results.length,
            success: true,
            messageId: result.messageId,
            recipientsCount: batch.length,
            result: result
          })
        }
      } catch (error) {
        results.push({
          batchIndex: results.length,
          success: false,
          error: error.message,
          recipientsCount: batch.length
        })
      }
    }

    const totalRecipients = recipients.length
    const successfulBatches = results.filter(r => r.success)
    const totalSent = successfulBatches.reduce((sum, r) => sum + r.recipientsCount, 0)

    return {
      success: successfulBatches.length === batches.length,
      totalRecipients,
      totalSent,
      totalFailed: totalRecipients - totalSent,
      batches: results,
      messageId: results[0]?.messageId
    }
  }

  /**
   * Enviar Email masivo
   * @param {Object} params - Parámetros del envío
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendBulkEmail(params) {
    if (!this.isConfigured) {
      throw new Error('Brevo no está configurado')
    }

    const {
      recipients, // Array de { email: string, name?: string }
      subject,
      htmlContent,
     textContent,
      sender = { name: 'Brify', email: 'noreply@brify.ai' },
      scheduledAt = null,
      attachment = null
    } = params

    // Validar destinatarios
    if (!recipients || recipients.length === 0) {
      throw new Error('No hay destinatarios especificados')
    }

    // Limitar a 2000 destinatarios por petición (límite de Brevo)
    const batchSize = 2000
    const batches = []
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize))
    }

    const results = []
    
    for (const batch of batches) {
      try {
        const payload = {
          sender: sender,
          to: batch.map(r => ({ email: r.email, name: r.name || '' })),
          subject: subject,
          htmlContent: htmlContent,
          textContent: textContent || this.stripHtml(htmlContent)
        }

        if (scheduledAt) {
          payload.scheduledAt = scheduledAt
        }

        if (attachment) {
          payload.attachment = [attachment]
        }

        if (this.testMode) {
          // En modo prueba, simular envío
          results.push({
            batchIndex: results.length,
            success: true,
            messageId: `test_${Date.now()}_${results.length}`,
            recipientsCount: batch.length,
            testMode: true
          })
        } else {
          const response = await fetch(`${this.baseUrl}/smtp/email`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
          })

          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
          }

          const result = await response.json()
          results.push({
            batchIndex: results.length,
            success: true,
            messageId: result.messageId,
            recipientsCount: batch.length,
            result: result
          })
        }
      } catch (error) {
        results.push({
          batchIndex: results.length,
          success: false,
          error: error.message,
          recipientsCount: batch.length
        })
      }
    }

    const totalRecipients = recipients.length
    const successfulBatches = results.filter(r => r.success)
    const totalSent = successfulBatches.reduce((sum, r) => sum + r.recipientsCount, 0)

    return {
      success: successfulBatches.length === batches.length,
      totalRecipients,
      totalSent,
      totalFailed: totalRecipients - totalSent,
      batches: results,
      messageId: results[0]?.messageId
    }
  }

  /**
   * Obtener estadísticas de envío de SMS
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Estadísticas
   */
  async getSMSStatistics(params = {}) {
    if (!this.isConfigured) {
      throw new Error('Brevo no está configurado')
    }

    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
      endDate = new Date(),
      limit = 100
    } = params

    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      const response = await fetch(`${this.baseUrl}/sms/statistics?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        statistics: data,
        period: { startDate, endDate }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al obtener estadísticas: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Obtener estadísticas de envío de Email
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Estadísticas
   */
  async getEmailStatistics(params = {}) {
    if (!this.isConfigured) {
      throw new Error('Brevo no está configurado')
    }

    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
      endDate = new Date(),
      limit = 100
    } = params

    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      const response = await fetch(`${this.baseUrl}/smtp/statistics?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        statistics: data,
        period: { startDate, endDate }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al obtener estadísticas: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Obtener información de la cuenta y créditos
   * @returns {Promise<Object>} Información de la cuenta
   */
  async getAccountInfo() {
    if (!this.isConfigured) {
      throw new Error('Brevo no está configurado')
    }

    try {
      const response = await fetch(`${this.baseUrl}/account`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const account = await response.json()
      return {
        success: true,
        account: {
          email: account.email,
          firstName: account.firstName,
          lastName: account.lastName,
          plan: account.plan,
          credits: account.credits,
          smsCredits: account.smsCredits,
          createdAt: account.createdAt
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al obtener información de la cuenta: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Enviar SMS de prueba
   * @param {string} phoneNumber - Número de teléfono
   * @param {string} message - Mensaje de prueba
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendTestSMS(phoneNumber, message = 'Este es un mensaje de prueba desde Brify AI') {
    if (!this.isConfigured) {
      throw new Error('Brevo no está configurado')
    }

    try {
      const payload = {
        sender: 'Brify',
        recipient: phoneNumber,
        content: message,
        type: 'transactional'
      }

      if (this.testMode) {
        return {
          success: true,
          messageId: `test_${Date.now()}`,
          testMode: true,
          message: 'SMS de prueba enviado (modo prueba)'
        }
      }

      const response = await fetch(`${this.baseUrl}/sms`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        messageId: result.messageId,
        result: result,
        message: 'SMS de prueba enviado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al enviar SMS de prueba: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Enviar Email de prueba
   * @param {string} emailAddress - Email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} htmlContent - Contenido HTML
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendTestEmail(emailAddress, subject = 'Email de prueba desde Brify AI', htmlContent = null) {
    if (!this.isConfigured) {
      throw new Error('Brevo no está configurado')
    }

    const defaultContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email de Prueba</h2>
        <p>Este es un email de prueba enviado desde la plataforma Brify AI utilizando Brevo.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">✅ Configuración Exitosa</h3>
          <p>Tu integración con Brevo está funcionando correctamente.</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Enviado desde: <strong>Brify AI</strong><br>
          Fecha: ${new Date().toLocaleString('es-ES')}
        </p>
      </div>
    `

    try {
      const payload = {
        sender: { name: 'Brify', email: 'noreply@brify.ai' },
        to: [{ email: emailAddress, name: 'Usuario de Prueba' }],
        subject: subject,
        htmlContent: htmlContent || defaultContent,
        textContent: this.stripHtml(htmlContent || defaultContent)
      }

      if (this.testMode) {
        return {
          success: true,
          messageId: `test_${Date.now()}`,
          testMode: true,
          message: 'Email de prueba enviado (modo prueba)'
        }
      }

      const response = await fetch(`${this.baseUrl}/smtp/email`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        messageId: result.messageId,
        result: result,
        message: 'Email de prueba enviado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al enviar email de prueba: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Utilidad para eliminar etiquetas HTML
   * @param {string} html - Contenido HTML
   * @returns {string} Texto plano
   */
  stripHtml(html) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  /**
   * Validar formato de número de teléfono
   * @param {string} phone - Número de teléfono
   * @returns {boolean} Válido o no
   */
  validatePhoneNumber(phone) {
    // Expresión regular para números de teléfono internacionales
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  /**
   * Validar formato de email
   * @param {string} email - Email
   * @returns {boolean} Válido o no
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Formatear número de teléfono para Brevo
   * @param {string} phone - Número de teléfono
   * @returns {string} Número formateado
   */
  formatPhoneNumber(phone) {
    // Eliminar caracteres no numéricos excepto +
    let formatted = phone.replace(/[^\d+]/g, '')
    
    // Asegurar que comience con +
    if (!formatted.startsWith('+')) {
      // Si no tiene código de país, asumir Chile (+56)
      if (formatted.startsWith('9') && formatted.length === 9) {
        formatted = '+56' + formatted
      } else {
        formatted = '+' + formatted
      }
    }
    
    return formatted
  }
}

// Crear instancia global del servicio
const brevoService = new BrevoService()

// Cargar configuración guardada al iniciar
brevoService.loadConfiguration()

export default brevoService