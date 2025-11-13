/**
 * Google Drive API Service - Refactorizado
 * Usa GoogleDriveAuthService para gestión centralizada de tokens
 */

import googleDriveAuthService from './googleDriveAuthService.js'
import logger from './logger.js'

class GoogleDriveService {
  constructor() {
    this.authService = googleDriveAuthService
    this.initialized = false
  }

  /**
   * Inicializa el servicio
   */
  async initialize() {
    try {
      logger.info('GoogleDriveService', '🔄 Inicializando servicio...')
      
      // Inicializar servicio de autenticación
      await this.authService.initialize()
      
      this.initialized = true
      logger.info('GoogleDriveService', '✅ Servicio inicializado')
      return true
    } catch (error) {
      logger.error('GoogleDriveService', `❌ Error inicializando: ${error.message}`)
      return false
    }
  }

  /**
   * Valida que esté autenticado
   */
  validateAuthentication() {
    if (!this.authService.isAuthenticated()) {
      const error = 'Google Drive no está autenticado. Por favor, conecta tu cuenta de Google Drive.'
      logger.error('GoogleDriveService', error)
      throw new Error(error)
    }
  }

  /**
   * Crea una carpeta en Google Drive
   */
  async createFolder(name, parentId = null) {
    try {
      logger.info('GoogleDriveService', `📁 Creando carpeta: ${name}`)
      
      this.validateAuthentication()
      
      const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder'
      }

      if (parentId) {
        fileMetadata.parents = [parentId]
        logger.info('GoogleDriveService', `📍 Carpeta padre: ${parentId}`)
      }

      const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,parents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authService.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fileMetadata)
      })

      if (!response.ok) {
        const errorData = await response.text()
        logger.error('GoogleDriveService', `❌ Error creando carpeta: ${response.status} - ${errorData}`)
        throw new Error(`Error creando carpeta: ${response.status}`)
      }

      const result = await response.json()
      logger.info('GoogleDriveService', `✅ Carpeta creada: ${result.id}`)
      return result
    } catch (error) {
      logger.error('GoogleDriveService', `❌ Error en createFolder: ${error.message}`)
      throw error
    }
  }

  /**
   * Lista archivos y carpetas
   */
  async listFiles(parentId = null, pageSize = 100) {
    try {
      logger.info('GoogleDriveService', `📂 Listando archivos${parentId ? ` en ${parentId}` : ''}`)
      
      this.validateAuthentication()

      let query = "trashed=false"
      if (parentId) {
        query += ` and '${parentId}' in parents`
      }

      const params = new URLSearchParams({
        q: query,
        pageSize: pageSize,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents)'
      })

      const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.authService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        const errorData = await response.text()
        logger.error('GoogleDriveService', `❌ Error listando archivos: ${response.status} - ${errorData}`)
        throw new Error(`Error listando archivos: ${response.status}`)
      }

      const data = await response.json()
      logger.info('GoogleDriveService', `✅ ${data.files?.length || 0} archivos encontrados`)
      return data.files || []
    } catch (error) {
      logger.error('GoogleDriveService', `❌ Error en listFiles: ${error.message}`)
      throw error
    }
  }

  /**
   * Sube un archivo a Google Drive
   */
  async uploadFile(file, parentId = null) {
    try {
      logger.info('GoogleDriveService', `📤 Subiendo archivo: ${file.name}`)
      
      this.validateAuthentication()

      const fileMetadata = {
        name: file.name
      }

      if (parentId) {
        fileMetadata.parents = [parentId]
      }

      const formData = new FormData()
      formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }))
      formData.append('file', file)

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,mimeType', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authService.getAccessToken()}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.text()
        logger.error('GoogleDriveService', `❌ Error subiendo archivo: ${response.status} - ${errorData}`)
        throw new Error(`Error subiendo archivo: ${response.status}`)
      }

      const result = await response.json()
      logger.info('GoogleDriveService', `✅ Archivo subido: ${result.id}`)
      return result
    } catch (error) {
      logger.error('GoogleDriveService', `❌ Error en uploadFile: ${error.message}`)
      throw error
    }
  }

  /**
   * Descarga un archivo de Google Drive
   */
  async downloadFile(fileId) {
    try {
      logger.info('GoogleDriveService', `⬇️ Descargando archivo: ${fileId}`)
      
      this.validateAuthentication()

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${this.authService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        logger.error('GoogleDriveService', `❌ Error descargando archivo: ${response.status}`)
        throw new Error(`Error descargando archivo: ${response.status}`)
      }

      logger.info('GoogleDriveService', `✅ Archivo descargado: ${fileId}`)
      return await response.blob()
    } catch (error) {
      logger.error('GoogleDriveService', `❌ Error en downloadFile: ${error.message}`)
      throw error
    }
  }

  /**
   * Elimina un archivo o carpeta
   */
  async deleteFile(fileId) {
    try {
      logger.info('GoogleDriveService', `🗑️ Eliminando archivo: ${fileId}`)
      
      this.validateAuthentication()

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        logger.error('GoogleDriveService', `❌ Error eliminando archivo: ${response.status}`)
        throw new Error(`Error eliminando archivo: ${response.status}`)
      }

      logger.info('GoogleDriveService', `✅ Archivo eliminado: ${fileId}`)
      return true
    } catch (error) {
      logger.error('GoogleDriveService', `❌ Error en deleteFile: ${error.message}`)
      throw error
    }
  }

  /**
   * Obtiene información de un archivo
   */
  async getFileInfo(fileId) {
    try {
      logger.info('GoogleDriveService', `ℹ️ Obteniendo información: ${fileId}`)
      
      this.validateAuthentication()

      const params = new URLSearchParams({
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, parents'
      })

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.authService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        logger.error('GoogleDriveService', `❌ Error obteniendo información: ${response.status}`)
        throw new Error(`Error obteniendo información: ${response.status}`)
      }

      const result = await response.json()
      logger.info('GoogleDriveService', `✅ Información obtenida: ${result.name}`)
      return result
    } catch (error) {
      logger.error('GoogleDriveService', `❌ Error en getFileInfo: ${error.message}`)
      throw error
    }
  }

  /**
   * Comparte una carpeta con un usuario
   */
  async shareFolder(folderId, email, role = 'reader') {
    try {
      logger.info('GoogleDriveService', `🔗 Compartiendo carpeta ${folderId} con ${email} (${role})`)
      
      this.validateAuthentication()

      const permission = {
        type: 'user',
        role: role,
        emailAddress: email
      }

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions?sendNotificationEmail=true`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authService.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permission)
      })

      if (!response.ok) {
        const errorData = await response.text()
        logger.error('GoogleDriveService', `❌ Error compartiendo carpeta: ${response.status} - ${errorData}`)
        throw new Error(`Error compartiendo carpeta: ${response.status}`)
      }

      const result = await response.json()
      logger.info('GoogleDriveService', `✅ Carpeta compartida: ${result.id}`)
      return result
    } catch (error) {
      logger.error('GoogleDriveService', `❌ Error en shareFolder: ${error.message}`)
      throw error
    }
  }

  /**
   * Verifica si está autenticado
   */
  isAuthenticated() {
    return this.authService.isAuthenticated()
  }

  /**
   * Obtiene el servicio de autenticación
   */
  getAuthService() {
    return this.authService
  }
}

// Instancia singleton
const googleDriveService = new GoogleDriveService()

export default googleDriveService
export { GoogleDriveService }
