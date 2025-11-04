// Hybrid Google Drive Service - Usa Google Drive real o local según disponibilidad
import googleDriveService from './googleDrive'
import localGoogleDriveService from './localGoogleDrive'

class HybridGoogleDriveService {
  constructor() {
    this.isGoogleDriveAvailable = false
    this.currentService = null
    this.initialized = false
  }

  async initialize() {
    try {
      // Detectar si estamos en producción (Netlify) o desarrollo
      const isProduction = window.location.hostname.includes('netlify.app') || 
                          window.location.hostname !== 'localhost'
      
      // Intentar inicializar Google Drive real
      if (!isProduction) {
        try {
          const googleDriveInitialized = await googleDriveService.initialize()
          if (googleDriveInitialized) {
            this.currentService = googleDriveService
            this.isGoogleDriveAvailable = true
            console.log('✅ Usando Google Drive real')
          }
        } catch (error) {
          console.warn('⚠️ Google Drive no disponible, usando servicio local')
        }
      } else {
        console.log('🌐 Entorno de producción detectado, usando Google Drive local')
      }

      // Si Google Drive no está disponible o estamos en producción, usar servicio local
      if (!this.currentService) {
        await localGoogleDriveService.initialize()
        this.currentService = localGoogleDriveService
        this.isGoogleDriveAvailable = false
        console.log('✅ Usando Google Drive local')
      }

      this.initialized = true
      return true
    } catch (error) {
      console.error('❌ Error inicializando Hybrid Google Drive:', error)
      return false
    }
  }

  // Verificar si está usando Google Drive real
  isUsingRealGoogleDrive() {
    return this.isGoogleDriveAvailable
  }

  // Obtener estadísticas del servicio actual
  getServiceInfo() {
    return {
      service: this.isGoogleDriveAvailable ? 'Google Drive Real' : 'Google Drive Local',
      isReal: this.isGoogleDriveAvailable,
      initialized: this.initialized
    }
  }

  // Crear carpeta
  async createFolder(name, parentId = null) {
    this.ensureInitialized()
    try {
      const result = await this.currentService.createFolder(name, parentId)
      
      // Si estamos usando el servicio local, marcar como local
      if (!this.isGoogleDriveAvailable) {
        result.isLocal = true
      }
      
      return result
    } catch (error) {
      console.error('Error creando carpeta:', error)
      throw error
    }
  }

  // Listar archivos y carpetas
  async listFiles(parentId = null, pageSize = 100) {
    this.ensureInitialized()
    try {
      const files = await this.currentService.listFiles(parentId, pageSize)
      
      // Marcar archivos locales si corresponde
      if (!this.isGoogleDriveAvailable) {
        return files.map(file => ({ ...file, isLocal: true }))
      }
      
      return files
    } catch (error) {
      console.error('Error listando archivos:', error)
      throw error
    }
  }

  // Subir archivo
  async uploadFile(file, parentId = null, onProgress = null) {
    this.ensureInitialized()
    try {
      const result = await this.currentService.uploadFile(file, parentId, onProgress)
      
      // Si estamos usando el servicio local, marcar como local
      if (!this.isGoogleDriveAvailable) {
        result.isLocal = true
      }
      
      return result
    } catch (error) {
      console.error('Error subiendo archivo:', error)
      throw error
    }
  }

  // Eliminar archivo o carpeta
  async deleteFile(fileId) {
    this.ensureInitialized()
    try {
      return await this.currentService.deleteFile(fileId)
    } catch (error) {
      console.error('Error eliminando archivo:', error)
      throw error
    }
  }

  // Compartir carpeta
  async shareFolder(folderId, email, role = 'reader') {
    this.ensureInitialized()
    
    // Si estamos usando el servicio local, simular compartición
    if (!this.isGoogleDriveAvailable) {
      console.log(`🔗 Simulando compartición de carpeta local con ${email}`)
      return {
        id: 'local_share_' + Date.now(),
        type: 'user',
        role: role,
        emailAddress: email,
        isLocal: true
      }
    }
    
    try {
      return await this.currentService.shareFolder(folderId, email, role)
    } catch (error) {
      console.error('Error compartiendo carpeta:', error)
      throw error
    }
  }

  // Obtener información de archivo
  async getFileInfo(fileId) {
    this.ensureInitialized()
    try {
      const info = await this.currentService.getFileInfo(fileId)
      
      // Marcar como local si corresponde
      if (!this.isGoogleDriveAvailable) {
        info.isLocal = true
      }
      
      return info
    } catch (error) {
      console.error('Error obteniendo info del archivo:', error)
      throw error
    }
  }

  // Descargar archivo
  async downloadFile(fileId) {
    this.ensureInitialized()
    try {
      return await this.currentService.downloadFile(fileId)
    } catch (error) {
      console.error('Error descargando archivo:', error)
      throw error
    }
  }

  // Buscar archivos
  async searchFiles(query) {
    this.ensureInitialized()
    try {
      const results = await this.currentService.searchFiles(query)
      
      // Marcar resultados como locales si corresponde
      if (!this.isGoogleDriveAvailable) {
        return results.map(file => ({ ...file, isLocal: true }))
      }
      
      return results
    } catch (error) {
      console.error('Error buscando archivos:', error)
      throw error
    }
  }

  // Obtener estadísticas
  getStats() {
    this.ensureInitialized()
    
    if (!this.isGoogleDriveAvailable && localGoogleDriveService.getStats) {
      return localGoogleDriveService.getStats()
    }
    
    return {
      service: this.isGoogleDriveAvailable ? 'Google Drive Real' : 'Google Drive Local',
      isReal: this.isGoogleDriveAvailable,
      files: 0,
      folders: 0,
      totalSize: 0
    }
  }

  // Obtener URL de vista previa
  getPreviewUrl(fileId) {
    this.ensureInitialized()
    
    if (!this.isGoogleDriveAvailable && localGoogleDriveService.getPreviewUrl) {
      return localGoogleDriveService.getPreviewUrl(fileId)
    }
    
    return null
  }

  // Cambiar entre servicios (para testing)
  async switchService(useRealGoogleDrive) {
    if (useRealGoogleDrive && !this.isGoogleDriveAvailable) {
      try {
        await googleDriveService.initialize()
        this.currentService = googleDriveService
        this.isGoogleDriveAvailable = true
        console.log('✅ Cambiado a Google Drive real')
      } catch (error) {
        console.error('❌ No se pudo cambiar a Google Drive real:', error)
        return false
      }
    } else if (!useRealGoogleDrive && this.isGoogleDriveAvailable) {
      await localGoogleDriveService.initialize()
      this.currentService = localGoogleDriveService
      this.isGoogleDriveAvailable = false
      console.log('✅ Cambiado a Google Drive local')
    }
    
    return true
  }

  // Limpiar almacenamiento local (solo para servicio local)
  clearLocalStorage() {
    if (!this.isGoogleDriveAvailable && localGoogleDriveService.clearStorage) {
      localGoogleDriveService.clearStorage()
    }
  }

  // Verificar si está inicializado
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Hybrid Google Drive no está inicializado. Llama a initialize() primero.')
    }
  }

  // Verificar autenticación (solo para Google Drive real)
  isAuthenticated() {
    if (this.isGoogleDriveAvailable) {
      return googleDriveService.isAuthenticated ? googleDriveService.isAuthenticated() : false
    }
    return true // Siempre autenticado para servicio local
  }

  // Generar URL de autenticación (solo para Google Drive real)
  generateAuthUrl() {
    if (this.isGoogleDriveAvailable && googleDriveService.generateAuthUrl) {
      return googleDriveService.generateAuthUrl()
    }
    return null
  }

  // Intercambiar código por tokens (solo para Google Drive real)
  async exchangeCodeForTokens(code) {
    if (this.isGoogleDriveAvailable && googleDriveService.exchangeCodeForTokens) {
      return await googleDriveService.exchangeCodeForTokens(code)
    }
    return null
  }
}

// Instancia singleton
const hybridGoogleDriveService = new HybridGoogleDriveService()

export default hybridGoogleDriveService
export { HybridGoogleDriveService }