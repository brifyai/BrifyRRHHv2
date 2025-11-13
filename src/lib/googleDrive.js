// Google Drive API service for browser environment
class GoogleDriveService {
  constructor() {
    this.accessToken = null
    this.initialized = false
  }

  async initialize() {
    try {
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGoogleAPI()
      }
      
      await new Promise((resolve) => {
        window.gapi.load('auth2', resolve)
      })
      
      // Intentar restaurar token guardado en localStorage
      const savedTokens = localStorage.getItem('google_drive_tokens')
      if (savedTokens) {
        try {
          const tokens = JSON.parse(savedTokens)
          await this.setTokens(tokens)
          console.log('✅ Token de Google Drive restaurado desde localStorage')
        } catch (error) {
          console.warn('⚠️ No se pudo restaurar token de Google Drive:', error.message)
          localStorage.removeItem('google_drive_tokens')
        }
      }
      
      this.initialized = true
      return true
    } catch (error) {
      console.error('Error initializing Google Drive:', error)
      return false
    }
  }

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

  generateAuthUrl() {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
    
    // Detectar automáticamente el redirect URI según el ambiente
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI ||
                       (isDevelopment ?
                        'http://localhost:3000/auth/google/callback' :
                        `${window.location.origin}/auth/google/callback`)
    
    // Verificar credenciales válidas - manejar apropiadamente sin credenciales
    if (!clientId ||
        clientId.includes('tu_google_client_id') ||
        clientId.includes('YOUR_GOOGLE_CLIENT_ID_HERE') ||
        clientId === 'your-google-client-id') {
      
      // Si no hay credenciales, retornar mensaje informativo en lugar de error
      console.log('ℹ️  Google Drive: Mostrando información de configuración')
      return 'show-credentials-info'
    }
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/gmail.send',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    })
    
    console.log(`🔄 OAuth Google Drive - Ambiente: ${isDevelopment ? 'Desarrollo' : 'Producción'}`)
    console.log(`📍 Redirect URI: ${redirectUri}`)
    console.log(`🔑 Client ID: ${clientId ? 'Configurado' : 'No configurado'}`)
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  // Verificar si hay credenciales configuradas
  hasValidCredentials() {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
    const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET
    
    return !!(clientId &&
             clientSecret &&
             !clientId.includes('tu_google_client_id') &&
             !clientId.includes('YOUR_GOOGLE_CLIENT_ID_HERE') &&
             !clientSecret.includes('tu_google_client_secret') &&
             !clientSecret.includes('YOUR_GOOGLE_CLIENT_SECRET_HERE'))
  }

  // Obtener información de configuración
  getConfigInfo() {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
    const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`
    
    return {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      redirectUri: redirectUri,
      isValid: this.hasValidCredentials(),
      needsConfiguration: !this.hasValidCredentials()
    }
  }

  async exchangeCodeForTokens(code) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`
        })
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('Google token exchange failed:', response.status, errorData)
        
        // Manejo específico de errores comunes
        if (response.status === 403) {
          throw new Error('Límite de solicitudes excedido. Por favor, intenta nuevamente en unos minutos.')
        } else if (response.status === 400) {
          throw new Error('Código de autorización inválido o expirado. Por favor, intenta conectar Google Drive nuevamente.')
        } else if (response.status === 401) {
          throw new Error('Credenciales de Google inválidas. Verifica la configuración del proyecto.')
        } else {
          throw new Error(`Error de conexión con Google (${response.status}). Intenta nuevamente.`)
        }
      }
      
      const tokens = await response.json()
      
      if (!tokens || typeof tokens !== 'object') {
        console.error('Invalid tokens response:', tokens)
        throw new Error('Invalid tokens response from Google')
      }
      
      if (tokens.error) {
        console.error('Google API error:', tokens.error, tokens.error_description)
        throw new Error(`Google API error: ${tokens.error}`)
      }
      
      if (tokens.access_token) {
        this.accessToken = tokens.access_token
        // Guardar tokens en localStorage para restaurarlos después
        localStorage.setItem('google_drive_tokens', JSON.stringify(tokens))
        console.log('✅ Tokens de Google Drive guardados en localStorage')
      }
      
      return tokens
    } catch (error) {
      console.error('Error getting tokens:', error)
      throw error
    }
  }

  // Configurar tokens existentes
  async setTokens(tokens) {
    try {
      // Si tenemos un access_token directamente, usarlo
      if (tokens.access_token) {
        this.accessToken = tokens.access_token
        return true
      }
      
      // Si tenemos un refresh_token, usarlo para obtener un access_token
      if (tokens.refresh_token) {
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
            refresh_token: tokens.refresh_token,
            grant_type: 'refresh_token'
          })
        })
        
        if (!response.ok) {
          const errorData = await response.text()
          console.error('Error refreshing Google token:', response.status, errorData)
          throw new Error(`Error refreshing token: ${response.status}`)
        }
        
        const refreshedTokens = await response.json()
        
        if (refreshedTokens.access_token) {
          this.accessToken = refreshedTokens.access_token
          return true
        } else {
          throw new Error('No access token received from refresh')
        }
      }
      
      throw new Error('No valid tokens provided')
    } catch (error) {
      console.error('Error setting tokens:', error)
      return false
    }
  }

  // Crear carpeta
  async createFolder(name, parentId = null) {
    if (!this.accessToken) {
      throw new Error('Google Drive no está inicializado')
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

      return await response.json()
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  }

  // Listar archivos y carpetas
  async listFiles(parentId = null, pageSize = 100) {
    if (!this.accessToken) {
      throw new Error('Google Drive no está inicializado')
    }

    try {
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
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      const data = await response.json()
      return data.files
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  }

  // Subir archivo
  async uploadFile(file, parentId = null) {
    if (!this.accessToken) {
      throw new Error('Google Drive no está inicializado')
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

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,mimeType', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: formData
      })

      const result = await response.json()
      
      if (!response.ok || result.error) {
        throw new Error(result.error?.message || `Error uploading file: ${response.status}`)
      }
      
      console.log('✅ Google Drive upload result:', result)
      return result // Retornar el objeto completo que incluye id, name, size, mimeType
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  // Eliminar archivo o carpeta
  async deleteFile(fileId) {
    if (!this.accessToken) {
      throw new Error('Google Drive no está inicializado')
    }

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })
      return response.ok
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  // Compartir carpeta con email
  async shareFolder(folderId, email, role = 'reader') {
    if (!this.accessToken) {
      throw new Error('Google Drive no está inicializado')
    }

    try {
      const permission = {
        type: 'user',
        role: role,
        emailAddress: email
      }

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions?sendNotificationEmail=true`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permission)
      })

      return await response.json()
    } catch (error) {
      console.error('Error sharing folder:', error)
      throw error
    }
  }

  // Obtener información de archivo
  async getFileInfo(fileId) {
    if (!this.accessToken) {
      throw new Error('Google Drive no está inicializado')
    }

    try {
      const params = new URLSearchParams({
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, parents'
      })

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      return await response.json()
    } catch (error) {
      console.error('Error getting file info:', error)
      throw error
    }
  }

  // Verificar si está autenticado
  isAuthenticated() {
    return !!this.accessToken
  }
}

// Instancia singleton
const googleDriveService = new GoogleDriveService()

export default googleDriveService
export { GoogleDriveService }
