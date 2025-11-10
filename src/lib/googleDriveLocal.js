// Google Drive Local Simulation Service for Development
// This service simulates Google Drive functionality without requiring real credentials

class GoogleDriveLocalService {
  constructor() {
    this.accessToken = 'local-simulation-token'
    this.initialized = true
    this.localStorage = this.initializeLocalStorage()
    this.folderCounter = 1000
    this.fileCounter = 2000
  }

  initializeLocalStorage() {
    if (!localStorage.getItem('googleDriveLocalData')) {
      const initialData = {
        folders: [
          {
            id: 'root',
            name: 'Mi Drive',
            mimeType: 'application/vnd.google-apps.folder',
            parents: [],
            createdTime: new Date().toISOString(),
            modifiedTime: new Date().toISOString()
          }
        ],
        files: []
      }
      localStorage.setItem('googleDriveLocalData', JSON.stringify(initialData))
    }
    
    try {
      return JSON.parse(localStorage.getItem('googleDriveLocalData'))
    } catch (error) {
      console.error('Error reading local storage:', error)
      return { folders: [], files: [] }
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('googleDriveLocalData', JSON.stringify(this.localStorage))
    } catch (error) {
      console.error('Error saving to local storage:', error)
    }
  }

  generateAuthUrl() {
    // Simular URL de autenticación para modo local
    console.log('🔄 Modo de desarrollo local: Simulando autenticación Google Drive')
    
    // Simular un pequeño retraso para hacerlo más realista
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`${window.location.origin}/auth/google/callback?mode=local-simulation`)
      }, 500)
    })
  }

  async exchangeCodeForTokens(code) {
    // Simular intercambio de tokens para modo local
    console.log('🔄 Modo local: Simulando intercambio de tokens')
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          access_token: 'local-simulation-access-token',
          refresh_token: 'local-simulation-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file'
        })
      }, 800)
    })
  }

  async setTokens(tokens) {
    // En modo local, siempre aceptamos los tokens
    this.accessToken = 'local-simulation-token'
    console.log('✅ Modo local: Tokens configurados exitosamente')
    return true
  }

  async createFolder(name, parentId = 'root') {
    console.log(`📁 Modo local: Creando carpeta "${name}"`)
    
    const newFolder = {
      id: `folder_${this.folderCounter++}`,
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
      createdTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString()
    }

    this.localStorage.folders.push(newFolder)
    this.saveToLocalStorage()

    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('✅ Carpeta creada exitosamente:', newFolder)
    return newFolder
  }

  async listFiles(parentId = 'root', pageSize = 100) {
    console.log(`📋 Modo local: Listando archivos en carpeta ${parentId}`)
    
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const allItems = [
      ...this.localStorage.folders.filter(f => f.parents.includes(parentId)),
      ...this.localStorage.files.filter(f => f.parents.includes(parentId))
    ]
    
    return allItems.slice(0, pageSize)
  }

  async uploadFile(file, parentId = 'root') {
    console.log(`📤 Modo local: Subiendo archivo "${file.name}"`)
    
    // Simular retraso de subida según el tamaño del archivo
    const delay = Math.min(2000, Math.max(500, file.size / 1000))
    await new Promise(resolve => setTimeout(resolve, delay))
    
    const newFile = {
      id: `file_${this.fileCounter++}`,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size.toString(),
      parents: [parentId],
      createdTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
      // Guardar el archivo en base64 para simulación
      content: await this.fileToBase64(file)
    }

    this.localStorage.files.push(newFile)
    this.saveToLocalStorage()
    
    console.log('✅ Archivo subido exitosamente:', newFile)
    return newFile
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  async deleteFile(fileId) {
    console.log(`🗑️ Modo local: Eliminando archivo/carpeta ${fileId}`)
    
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Eliminar de folders
    const folderIndex = this.localStorage.folders.findIndex(f => f.id === fileId)
    if (folderIndex !== -1) {
      this.localStorage.folders.splice(folderIndex, 1)
      this.saveToLocalStorage()
      console.log('✅ Carpeta eliminada exitosamente')
      return true
    }
    
    // Eliminar de files
    const fileIndex = this.localStorage.files.findIndex(f => f.id === fileId)
    if (fileIndex !== -1) {
      this.localStorage.files.splice(fileIndex, 1)
      this.saveToLocalStorage()
      console.log('✅ Archivo eliminado exitosamente')
      return true
    }
    
    throw new Error('Archivo o carpeta no encontrado')
  }

  async shareFolder(folderId, email, role = 'reader') {
    console.log(`🔗 Modo local: Compartiendo carpeta ${folderId} con ${email} (${role})`)
    
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const permission = {
      id: `perm_${Date.now()}`,
      type: 'user',
      role: role,
      emailAddress: email,
      displayName: email.split('@')[0],
      domain: email.split('@')[1]
    }
    
    console.log('✅ Carpeta compartida exitosamente:', permission)
    return permission
  }

  async getFileInfo(fileId) {
    console.log(`ℹ️ Modo local: Obteniendo información de ${fileId}`)
    
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Buscar en folders
    const folder = this.localStorage.folders.find(f => f.id === fileId)
    if (folder) {
      return folder
    }
    
    // Buscar en files
    const file = this.localStorage.files.find(f => f.id === fileId)
    if (file) {
      return file
    }
    
    throw new Error('Archivo o carpeta no encontrado')
  }

  // Método para limpiar datos locales (útil para pruebas)
  clearLocalData() {
    localStorage.removeItem('googleDriveLocalData')
    this.localStorage = this.initializeLocalStorage()
    this.folderCounter = 1000
    this.fileCounter = 2000
    console.log('🧹 Datos locales limpiados')
  }

  // Método para obtener estadísticas del modo local
  getLocalStats() {
    return {
      totalFolders: this.localStorage.folders.length,
      totalFiles: this.localStorage.files.length,
      totalSize: this.localStorage.files.reduce((sum, file) => sum + parseInt(file.size || 0), 0),
      mode: 'local-simulation',
      lastUpdated: new Date().toISOString()
    }
  }

  // Método para verificar si está en modo local
  isLocalMode() {
    return true
  }
}

// Instancia singleton
const googleDriveLocalService = new GoogleDriveLocalService()

export default googleDriveLocalService
export { GoogleDriveLocalService }