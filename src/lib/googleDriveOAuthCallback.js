/**
 * Google Drive OAuth Callback Handler
 * Maneja el callback de autorización OAuth de Google Drive
 */

import googleDriveAuthService from './googleDriveAuthService.js'
import logger from './logger.js'

class GoogleDriveOAuthCallback {
  /**
   * Procesa el callback de OAuth
   * Se llama después de que el usuario autoriza la aplicación en Google
   */
  static async handleCallback() {
    try {
      logger.info('GoogleDriveOAuthCallback', '🔄 Procesando callback de OAuth...')
      
      // Obtener el código de autorización de la URL
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const error = params.get('error')
      const state = params.get('state')
      
      logger.info('GoogleDriveOAuthCallback', `📍 URL: ${window.location.href}`)
      logger.info('GoogleDriveOAuthCallback', `🔑 Código presente: ${!!code}`)
      logger.info('GoogleDriveOAuthCallback', `❌ Error presente: ${!!error}`)
      
      // Verificar si hay error
      if (error) {
        logger.error('GoogleDriveOAuthCallback', `❌ Error de autorización: ${error}`)
        
        // Mostrar error al usuario
        const errorMessage = this.getErrorMessage(error)
        this.showErrorModal(errorMessage)
        
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname)
        return false
      }
      
      // Verificar que hay código
      if (!code) {
        logger.error('GoogleDriveOAuthCallback', '❌ No se recibió código de autorización')
        this.showErrorModal('No se recibió código de autorización. Por favor, intenta nuevamente.')
        window.history.replaceState({}, document.title, window.location.pathname)
        return false
      }
      
      logger.info('GoogleDriveOAuthCallback', `✅ Código de autorización recibido`)
      
      // Intercambiar código por tokens
      logger.info('GoogleDriveOAuthCallback', '🔄 Intercambiando código por tokens...')
      const tokens = await googleDriveAuthService.exchangeCodeForTokens(code)
      
      logger.info('GoogleDriveOAuthCallback', '✅ Tokens obtenidos exitosamente')
      
      // Mostrar éxito al usuario
      this.showSuccessModal('¡Conexión exitosa! Google Drive está configurado.')
      
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname)
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
      
      return true
    } catch (error) {
      logger.error('GoogleDriveOAuthCallback', `❌ Error procesando callback: ${error.message}`)
      this.showErrorModal(`Error: ${error.message}`)
      window.history.replaceState({}, document.title, window.location.pathname)
      return false
    }
  }

  /**
   * Obtiene un mensaje de error legible para el usuario
   */
  static getErrorMessage(errorCode) {
    const errorMessages = {
      'access_denied': 'Acceso denegado. No autorizaste la conexión con Google Drive.',
      'invalid_scope': 'Permisos inválidos solicitados.',
      'server_error': 'Error en el servidor de Google. Por favor, intenta nuevamente.',
      'temporarily_unavailable': 'Servicio de Google temporalmente no disponible. Por favor, intenta más tarde.',
      'invalid_request': 'Solicitud inválida. Verifica la configuración.',
      'unauthorized_client': 'Cliente no autorizado. Verifica las credenciales de Google Cloud.',
      'unsupported_response_type': 'Tipo de respuesta no soportado.',
      'invalid_client': 'Cliente inválido. Verifica el Client ID y Client Secret.'
    }
    
    return errorMessages[errorCode] || `Error de autorización: ${errorCode}`
  }

  /**
   * Muestra un modal de error
   */
  static showErrorModal(message) {
    const modal = document.createElement('div')
    modal.id = 'google-drive-error-modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `
    
    const content = document.createElement('div')
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 500px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `
    
    content.innerHTML = `
      <div style="text-align: center;">
        <h2 style="color: #dc2626; margin-bottom: 15px;">❌ Error de Conexión</h2>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">${message}</p>
        <button onclick="document.getElementById('google-drive-error-modal').remove()" 
                style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
          Cerrar
        </button>
      </div>
    `
    
    modal.appendChild(content)
    document.body.appendChild(modal)
  }

  /**
   * Muestra un modal de éxito
   */
  static showSuccessModal(message) {
    const modal = document.createElement('div')
    modal.id = 'google-drive-success-modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `
    
    const content = document.createElement('div')
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 500px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `
    
    content.innerHTML = `
      <div style="text-align: center;">
        <h2 style="color: #16a34a; margin-bottom: 15px;">✅ Conexión Exitosa</h2>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">${message}</p>
        <p style="color: #999; font-size: 14px;">Redirigiendo en 2 segundos...</p>
      </div>
    `
    
    modal.appendChild(content)
    document.body.appendChild(modal)
  }
}

export default GoogleDriveOAuthCallback
