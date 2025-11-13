// Local Google Drive Service para Netlify - Simulación de Google Drive
class LocalGoogleDriveService {
  constructor() {
    this.initialized = false
    this.baseFolder = 'brify-drive'
    this.folders = new Map()
    this.files = new Map()
    this.initializeStorage()
  }

  async initialize() {
    try {
      if (!localStorage.getItem(this.baseFolder)) {
        localStorage.setItem(this.baseFolder, JSON.stringify({
          folders: {},
          files: {},
          created: new Date().toISOString()
        }))
      }
      this.loadFromStorage()
      this.initialized = true
      console.log('✅ Local Google Drive inicializado')
      return true
    } catch (error) {
      console.error('Error inicializando Local Google Drive:', error)
      return false
    }
  }

  initializeStorage() {
    try {
      const stored = localStorage.getItem(this.baseFolder)
      if (stored) {
        const data = JSON.parse(stored)
        this.folders = new Map(Object.entries(data.folders || {}))
        this.files = new Map(Object.entries(data.files || {}))
      }
    } catch (error) {
      console.error('Error cargando almacenamiento local:', error)
      this.folders = new Map()
      this.files = new Map()
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.baseFolder)
      if (stored) {
        const data = JSON.parse(stored)
        this.folders = new Map(Object.entries(data.folders || {}))
        this.files = new Map(Object.entries(data.files || {}))
      }
    } catch (error) {
      console.error('Error cargando desde storage:', error)
    }
  }

  saveToStorage() {
    try {
      const data = {
        folders: Object.fromEntries(this.folders),
        files: Object.fromEntries(this.files),
        updated: new Date().toISOString()
      }
      localStorage.setItem(this.baseFolder, JSON.stringify(data))
    } catch (error) {
      console.error('Error guardando en storage:', error)
    }
  }

  generateId() {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  async createFolder(name, parentId = null) {
    try {
      const folderId = this.generateId()
      const folder = {
        id: folderId,
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : [],
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        size: null,
        isLocal: true
      }
      this.folders.set(folderId, folder)
      this.saveToStorage()
      console.log(`✅ Carpeta local creada: ${name} (${folderId})`)
      return folder
    } catch (error) {
      console.error('Error creando carpeta local:', error)
      throw error
    }
  }

  async listFiles(parentId = null, pageSize = 100) {
    try {
      const allItems = []
      for (const [id, folder] of this.folders) {
        if (!parentId || (folder.parents && folder.parents.includes(parentId))) {
          allItems.push(folder)
        }
      }
      for (const [id, file] of this.files) {
        if (!parentId || (file.parents && file.parents.includes(parentId))) {
          allItems.push(file)
        }
      }
      allItems.sort((a, b) => a.name.localeCompare(b.name))
      const startIndex = 0
      const endIndex = Math.min(startIndex + pageSize, allItems.length)
      const paginatedItems = allItems.slice(startIndex, endIndex)
      console.log(`📁 Listados ${paginatedItems.length} items locales`)
      return paginatedItems
    } catch (error) {
      console.error('Error listando archivos locales:', error)
      throw error
    }
  }

  async uploadFile(file, parentId = null) {
    try {
      const fileId = this.generateId()
      const reader = new FileReader()
      const fileContent = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const uploadedFile = {
        id: fileId,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        parents: parentId ? [parentId] : [],
        content: fileContent,
        isLocal: true
      }
      this.files.set(fileId, uploadedFile)
      this.saveToStorage()
      console.log(`✅ Archivo local subido: ${file.name} (${fileId})`)
      return uploadedFile
    } catch (error) {
      console.error('Error subiendo archivo local:', error)
      throw error
    }
  }

  async deleteFile(fileId) {
    try {
      if (this.folders.has(fileId)) {
        const folder = this.folders.get(fileId)
        for (const [id, item] of [...this.folders, ...this.files]) {
          if (item.parents && item.parents.includes(fileId)) {
            if (this.folders.has(id)) {
              await this.deleteFile(id)
            } else {
              this.files.delete(id)
            }
          }
        }
        this.folders.delete(fileId)
      } else if (this.files.has(fileId)) {
        this.files.delete(fileId)
      }
      this.saveToStorage()
      console.log(`🗑️ Item local eliminado: ${fileId}`)
      return true
    } catch (error) {
      console.error('Error eliminando archivo local:', error)
      throw error
    }
  }

  async shareFolder(folderId, email, role = 'reader') {
    try {
      const folder = this.folders.get(folderId)
      if (!folder) {
        throw new Error('Carpeta no encontrada')
      }
      if (!folder.sharedWith) {
        folder.sharedWith = []
      }
      folder.sharedWith.push({
        email: email,
        role: role,
        addedDate: new Date().toISOString()
      })
      this.folders.set(folderId, folder)
      this.saveToStorage()
      console.log(`🔗 Carpeta compartida con ${email} (${role})`)
      return {
        id: this.generateId(),
        type: 'user',
        role: role,
        emailAddress: email
      }
    } catch (error) {
      console.error('Error compartiendo carpeta local:', error)
      throw error
    }
  }

  async getFileInfo(fileId) {
    try {
      const item = this.folders.get(fileId) || this.files.get(fileId)
      if (!item) {
        throw new Error('Archivo o carpeta no encontrado')
      }
      return item
    } catch (error) {
      console.error('Error obteniendo info del archivo local:', error)
      throw error
    }
  }

  async downloadFile(fileId) {
    try {
      const file = this.files.get(fileId)
      if (!file) {
        throw new Error('Archivo no encontrado')
      }
      const response = await fetch(file.content)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log(`⬇️ Archivo descargado: ${file.name}`)
      return true
    } catch (error) {
      console.error('Error descargando archivo local:', error)
      throw error
    }
  }

  async searchFiles(query) {
    try {
      const results = []
      const lowerQuery = query.toLowerCase()
      for (const [id, folder] of this.folders) {
        if (folder.name.toLowerCase().includes(lowerQuery)) {
          results.push(folder)
        }
      }
      for (const [id, file] of this.files) {
        if (file.name.toLowerCase().includes(lowerQuery)) {
          results.push(file)
        }
      }
      console.log(`🔍 Búsqueda local: ${results.length} resultados para "${query}"`)
      return results
    } catch (error) {
      console.error('Error buscando archivos locales:', error)
      throw error
    }
  }

  getStats() {
    const folderCount = this.folders.size
    const fileCount = this.files.size
    let totalSize = 0
    for (const file of this.files.values()) {
      totalSize += file.size || 0
    }
    return {
      folders: folderCount,
      files: fileCount,
      totalSize: totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      isLocal: true
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  clearStorage() {
    try {
      localStorage.removeItem(this.baseFolder)
      this.folders.clear()
      this.files.clear()
      console.log('🧹 Almacenamiento local limpiado')
    } catch (error) {
      console.error('Error limpiando almacenamiento local:', error)
    }
  }

  isInitialized() {
    return this.initialized
  }

  getPreviewUrl(fileId) {
    const file = this.files.get(fileId)
    if (file && file.content) {
      return file.content
    }
    return null
  }
}

const localGoogleDriveService = new LocalGoogleDriveService()

export default localGoogleDriveService
export { LocalGoogleDriveService }
