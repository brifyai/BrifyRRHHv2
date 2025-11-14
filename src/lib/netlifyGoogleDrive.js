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
      // Usar la misma clave que googleDriveAuthService para consistencia
      const storedTokens = localStorage.getItem('google_drive_auth')
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
          // Usar la misma clave que googleDriveAuthService para consistencia
          localStorage.setItem('google_drive_auth', JSON.stringify(tokens))
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
        // Usar la misma clave que googleDriveAuthService para consistencia
        localStorage.setItem('google_drive_auth', JSON.stringify(tokens))
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
          // Usar la misma clave que googleDriveAuthService para consistencia
          const storedTokens = JSON.parse(localStorage.getItem('google_drive_auth') || '{}')
          storedTokens.access_token = tokens.access_token
          localStorage.setItem('google_drive_auth', JSON.stringify(storedTokens))
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
        // Usar la misma clave que googleDriveAuthService para consistencia
        const storedTokens = JSON.parse(localStorage.getItem('google_drive_auth') || '{}')
        storedTokens.access_token = tokens.access_token
        localStorage.setItem('google_drive_auth', JSON.stringify(storedTokens))
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
    localStorage.removeItem('google_drive_auth')
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
              
              // Reintentar la subida con el nuevo token
              const retryXhr = new XMLHttpRequest()
              retryXhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size')
              retryXhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`)
              
              const retryFormData = new FormData()
              retryFormData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }))
              retryFormData.append('file', file)
              
              retryXhr.addEventListener('load', () => {
                if (retryXhr.status === 200) {
                  try {
                    const result = JSON.parse(retryXhr.responseText)
                    resolve(result)
                  } catch (error) {
                    reject(new Error('Error parsing retry response'))
                  }
                } else {
                  reject(new Error(`Error en reintento: ${retryXhr.status}`))
                }
              })
              
              retryXhr.addEventListener('error', () => {
                reject(new Error('Error de red en reintento'))
              })
              
              retryXhr.send(retryFormData)
            } catch (refreshError) {
              reject(new Error('Error refrescando token'))
            }
          } else {
            reject(new Error(`Error subiendo archivo: ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Error de red'))
        })

        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size')
        xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`)
        xhr.send(formData)
      })
    } catch (error) {
      console.error('❌ Error subiendo archivo a Google Drive:', error)
      throw error
    }
  }

  // Listar archivos y carpetas
  async listFiles(parentId = null, pageSize = 100) {
    if (!this.accessToken) {
      throw new Error('Google Drive no está autenticado')
    }

    try {
      let query = ''
      if (parentId) {
        query = ` and '${parentId}' in parents`
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=trashed=false${query}&pageSize=${pageSize}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,parents)`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshAccessToken()
          // Reintentar con el nuevo token
          const retryResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=trashed=false${query}&pageSize=${pageSize}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,parents)`,
            {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`
              }
            }
          )
          
          if (!retryResponse.ok) {
            throw new Error(`Error listando archivos: ${retryResponse.status}`)
          }
          
          return await retryResponse.json()
        }
        throw new Error(`Error listando archivos: ${response.status}`)
      }

      const result = await response.json()
      console.log(`📁 Listados ${result.files?.length || 0} archivos de Google Drive`)
      return result
    } catch (error) {
      console.error('❌ Error listando archivos de Google Drive:', error)
      throw error
    }
  }

  // Eliminar archivo o carpeta
  async deleteFile(fileId) {
    if (!this.accessToken) {
      throw new Error('Google Drive no está autenticado')
    }

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshAccessToken()
          // Reintentar con el nuevo token
          const retryResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          })
          
          if (!retryResponse.ok) {
            throw new Error(`Error eliminando archivo: ${retryResponse.status}`)
          }
          
          return true
        }
        throw new Error(`Error eliminando archivo: ${response.status}`)
      }

      console.log(`🗑️ Archivo eliminado: ${fileId}`)
      return true
    } catch (error) {
      console.error('❌ Error eliminando archivo de Google Drive:', error)
      throw error
    }
  }

  // Compartir carpeta
  async shareFolder(folderId, email, role = 'reader') {
    if (!this.accessToken) {
      throw new Error('Google Drive no está autenticado')
    }

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: role,
          type: 'user',
          emailAddress: email
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshAccessToken()
          // Reintentar con el nuevo token
          const retryResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              role: role,
              type: 'user',
              emailAddress: email
            })
          })
          
          if (!retryResponse.ok) {
            throw new Error(`Error compartiendo carpeta: ${retryResponse.status}`)
          }
          
          return await retryResponse.json()
        }
        throw new Error(`Error compartiendo carpeta: ${response.status}`)
      }

      const result = await response.json()
      console.log(`🔗 Carpeta compartida con ${email} (${role})`)
      return result
    } catch (error) {
      console.error('❌ Error compartiendo carpeta de Google Drive:', error)
      throw error
    }
  }

  // Obtener información de archivo
  async getFileInfo(fileId) {
    if (!this.accessToken) {
      throw new Error('Google Drive no está autenticado')
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,parents`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshAccessToken()
          // Reintentar con el nuevo token
          const retryResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,parents`,
            {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`
              }
            }
          )
          
          if (!retryResponse.ok) {
            throw new Error(`Error obteniendo info: ${retryResponse.status}`)
          }
          
          return await retryResponse.json()
        }
        throw new Error(`Error obteniendo info: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Error obteniendo info del archivo:', error)
      throw error
    }
  }
}

// Instancia singleton
const netlifyGoogleDriveService = new NetlifyGoogleDriveService()

export default netlifyGoogleDriveService
export { NetlifyGoogleDriveService }