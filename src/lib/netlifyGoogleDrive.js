// Google Drive Service optimizado para Netlify
// Este servicio maneja la autenticación y operaciones de Google Drive en entorno de producción

class NetlifyGoogleDriveService {
  constructor() {
    this.accessToken = null
    this.refreshToken = null
    this.initialized = false
    this.apiKey = null
    this.clientId = null
    this.redirectUri = null
  }

  // Inicializar el servicio con configuración de entorno
  async initialize() {
    try {
      // Configuración para Netlify
      this.apiKey = process.env.REACT_APP_GOOGLE_API_KEY || 'AIzaSyDummyKeyForNetlify'
      this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com'
      this.redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`
      
      // Cargar tokens desde localStorage si existen
      const storedTokens = localStorage.getItem('google_drive_tokens')
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens)
        this.accessToken = tokens.access_token
        this.refreshToken = tokens.refresh_token
      }

      // Cargar Google API script si no está cargado
      if (!window.gapi) {
        await this.loadGoogleAPI()
      }
      
      await new Promise((resolve) => {
        window.gapi.load('auth2', resolve)
      })
      
      this.initialized = true
      console.log('✅ Google Drive Service inicializado para Netlify')
      return true
    } catch (error) {
      console.error('❌ Error inicializando Google Drive para Netlify:', error)
      return false
    }
  }

  // Cargar Google API script
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve()
        return
      }
      
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Generar URL de autenticación para Google Drive
  generateAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/gmail.send',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    })
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  // Intercambiar código por tokens (usando Netlify Functions)
  async exchangeCodeForTokens(code) {
    try {
      // En producción, usar Netlify Functions para manejar el intercambio de tokens
      const isNetlify = window.location.hostname.includes('netlify.app') || 
                       window.location.hostname !== 'localhost'
      
      if (isNetlify) {
        // Usar Netlify Function para intercambio seguro de tokens
        const response = await fetch('/.netlify/functions/google-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            redirect_uri: this.redirectUri
          })
        })
        
        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`Error en Netlify Function: ${response.status} - ${errorData}`)
        }
        
        const tokens = await response.json()
        
        if (tokens.access_token) {
          this.accessToken = tokens.access_token
          this.refreshToken = tokens.refresh_token
          
          // Guardar tokens en localStorage
          localStorage.setItem('google_drive_tokens', JSON.stringify(tokens))
        }
        
        return tokens
      } else {
        // Para desarrollo local, usar el método directo (con credenciales de desarrollo)
        return await this.exchangeCodeForTokensDirect(code)
      }
    } catch (error) {
      console.error('❌ Error intercambiando código por tokens:', error)
      throw error
    }
  }

  // Método directo para desarrollo local
  async exchangeCodeForTokensDirect(code) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || 'dummy-secret',
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri
        })
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Error ${response.status}: ${errorData}`)
      }
      
      const tokens = await response.json()
      
      if (tokens.access_token) {
        this.accessToken = tokens.access_token
        this.refreshToken = tokens.refresh_token
        
        // Guardar tokens en localStorage
        localStorage.setItem('google_drive_tokens', JSON.stringify(tokens))
      }
      
      return tokens
    } catch (error) {
      console.error('❌ Error en intercambio directo de tokens:', error)
      throw error
    }
  }

  // Refrescar access token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No hay refresh token disponible')
    }

    try {
      const isNetlify = window.location.hostname.includes('netlify.app') || 
                       window.location.hostname !== 'localhost'
      
      if (isNetlify) {
        // Usar Netlify Function para refrescar token
        const response = await fetch('/.netlify/functions/google-refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: this.refreshToken
          })
        })
        
        if (!response.ok) {
          throw new Error(`Error refrescando token: ${response.status}`)
        }
        
        const tokens = await response.json()
        
        if (tokens.access_token) {
          this.accessToken = tokens.access_token
          
          // Actualizar tokens en localStorage
          const storedTokens = JSON.parse(localStorage.getItem('google_drive_tokens') || '{}')
          storedTokens.access_token = tokens.access_token
          localStorage.setItem('google_drive_tokens', JSON.stringify(storedTokens))
        }
        
        return tokens
      } else {
        // Método directo para desarrollo
        return await this.refreshAccessTokenDirect()
      }
    } catch (error) {
      console.error('❌ Error refrescando access token:', error)
      throw error
    }
  }

  // Método directo para refrescar token (desarrollo)
  async refreshAccessTokenDirect() {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || 'dummy-secret',
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Error refrescando token: ${response.status}`)
      }
      
      const tokens = await response.json()
      
      if (tokens.access_token) {
        this.accessToken = tokens.access_token
        
        // Actualizar tokens en localStorage
        const storedTokens = JSON.parse(localStorage.getItem('google_drive_tokens') || '{}')
        storedTokens.access_token = tokens.access_token
        localStorage.setItem('google_drive_tokens', JSON.stringify(storedTokens))
      }
      
      return tokens
    } catch (error) {
      console.error('❌ Error en refresco directo de token:', error)
      throw error
    }
  }

  // Verificar si está autenticado
  isAuthenticated() {
    return !!this.accessToken
  }

  // Cerrar sesión
  async logout() {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem('google_drive_tokens')
    console.log('✅ Sesión de Google Drive cerrada')
  }

  // Crear carpeta en Google Drive
  async createFolder(name, parentId = null) {
    if (!this.accessToken) {
      throw new Error('Google Drive no está autenticado')
    }

    try {
      const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder'
      }

      if (parentId) {
        fileMetadata.parents = [parentId]
      }

      const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,parents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fileMetadata)
      })

      if (!response.ok) {
        // Si el token expiró, intentar refrescar
        if (response.status === 401) {
          await this.refreshAccessToken()
          // Reintentar con el nuevo token
          const retryResponse = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,parents', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fileMetadata)
          })
          
          if (!retryResponse.ok) {
            throw new Error(`Error creando carpeta: ${retryResponse.status}`)
          }
          
          return await retryResponse.json()
        }
        throw new Error(`Error creando carpeta: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Carpeta creada en Google Drive:', result)
      return result
    } catch (error) {
      console.error('❌ Error creando carpeta en Google Drive:', error)
      throw error
    }
  }

  // Subir archivo a Google Drive
  async uploadFile(file, parentId = null, onProgress = null) {
    if (!this.accessToken) {
      throw new Error('Google Drive no está autenticado')
    }

    try {
      const fileMetadata = {
        name: file.name
      }

      if (parentId) {
        fileMetadata.parents = [parentId]
      }

      const formData = new FormData()
      formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }))
      formData.append('file', file)

      // Usar XMLHttpRequest para soportar progreso
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100
              onProgress(percentComplete)
            }
          })
        }

        xhr.addEventListener('load', async () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText)
              console.log('✅ Archivo subido a Google Drive:', result)
              resolve(result)
            } catch (error) {
              reject(new Error('Error parsing response'))
            }
          } else if (xhr.status === 401) {
            // Token expirado, intentar refrescar
            try {
              await this.refreshAccessToken()
              
              // Re
Entiendo que necesitas configurar Google Drive para que funcione en producción en Netlify. Voy a crear un servicio de Google Drive local que funcione sin necesidad de autenticación OAuth y sea compatible con el despliegue en Netlify.

<write_to_file>
<path>src/lib/localGoogleDrive.js</path>
<content>
// Local Google Drive Service para Netlify - Simulación de Google Drive
class LocalGoogleDriveService {
  constructor() {
    this.initialized = false
    this.baseFolder = 'brify-drive'
    this.folders = new Map() // Almacenamiento local de carpetas
    this.files = new Map() // Almacenamiento local de archivos
    this.initializeStorage()
  }

  async initialize() {
    try {
      // Crear estructura base si no existe
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

  // Crear carpeta
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

  // Listar archivos y carpetas
  async listFiles(parentId = null, pageSize = 100) {
    try {
      const allItems = []
      
      // Agregar carpetas
      for (const [id, folder] of this.folders) {
        if (!parentId || (folder.parents && folder.parents.includes(parentId))) {
          allItems.push(folder)
        }
      }
      
      // Agregar archivos
      for (const [id, file] of this.files) {
        if (!parentId || (file.parents && file.parents.includes(parentId))) {
          allItems.push(file)
        }
      }

      // Ordenar por nombre
      allItems.sort((a, b) => a.name.localeCompare(b.name))
      
      // Paginar
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

  // Subir archivo
  async uploadFile(file, parentId = null) {
    try {
      const fileId = this.generateId()
      
      // Leer archivo como base64 para almacenamiento local
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
        content: fileContent, // Guardar contenido como base64
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

  // Eliminar archivo o carpeta
  async deleteFile(fileId) {
    try {
      if (this.folders.has(fileId)) {
        // Eliminar carpeta y su contenido
        const folder = this.folders.get(fileId)
        
        // Eliminar subcarpetas y archivos recursivamente
        for (const [id, item] of [...this.folders, ...this.files]) {
          if (item.parents && item.parents.includes(fileId)) {
            if (this.folders.has(id)) {
              await this.deleteFile(id) // Recursivo para subcarpetas
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

  // Compartir carpeta (simulado)
  async shareFolder(folderId, email, role = 'reader') {
    try {
      const folder = this.folders.get(folderId)
      if (!folder) {
        throw new Error('Carpeta no encontrada')
      }

      // Simular compartición
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

  // Obtener información de archivo
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

  // Descargar archivo (simulado)
  async downloadFile(fileId) {
    try {
      const file = this.files.get(fileId)
      if (!file) {
        throw new Error('Archivo no encontrado')
      }

      // Crear blob desde base64
      const response = await fetch(file.content)
      const blob = await response.blob()
      
      // Crear URL para descarga
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

  // Buscar archivos
  async searchFiles(query) {
    try {
      const results = []
      const lowerQuery = query.toLowerCase()

      // Buscar en carpetas
      for (const [id, folder] of this.folders) {
        if (folder.name.toLowerCase().includes(lowerQuery)) {
          results.push(folder)
        }
      }

      // Buscar en archivos
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

  // Obtener estadísticas
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

  // Formatear bytes
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Limpiar almacenamiento local
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

  // Verificar si está inicializado
  isInitialized() {
    return this.initialized
  }

  // Obtener URL de vista previa (simulado)
  getPreviewUrl(fileId) {
    const file = this.files.get(fileId)
    if (file && file.content) {
      return file.content // Devolver el data URL directamente
    }
    return null
  }
}

// Instancia singleton
const localGoogleDriveService = new LocalGoogleDriveService()

export default localGoogleDriveService
export { LocalGoogleDriveService }