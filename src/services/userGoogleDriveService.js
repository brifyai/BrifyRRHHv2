import { supabase } from '../lib/supabaseClient.js'

class UserGoogleDriveService {
  constructor() {
    this.baseURL = 'https://www.googleapis.com'
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
    this.clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET
    this.redirectUri = this.getRedirectUri()
    this.scopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata'
    ]
  }

  getRedirectUri() {
    const isProduction = process.env.REACT_APP_ENVIRONMENT === 'production'
    return isProduction 
      ? 'https://brifyrrhhv2.netlify.app/auth/google/callback'
      : 'http://localhost:3000/auth/google/callback'
  }

  // Generar URL de autenticación para un usuario específico
  generateAuthUrl(userId, state = null) {
    if (!this.clientId) {
      throw new Error('Google Client ID no configurado')
    }

    const authState = state || `user_${userId}_${Date.now()}`
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      access_type: 'offline', // Importante para obtener refresh_token
      prompt: 'consent', // Forzar consentimiento para obtener refresh_token
      state: authState,
      include_granted_scopes: 'true'
    })

    // Guardar el estado en localStorage para validación posterior
    localStorage.setItem(`google_auth_state_${userId}`, authState)

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  // Intercambiar código de autorización por tokens de acceso
  async exchangeCodeForTokens(code, userId, state) {
    try {
      // Validar el estado
      const savedState = localStorage.getItem(`google_auth_state_${userId}`)
      if (!savedState || savedState !== state) {
        throw new Error('Estado de autenticación inválido')
      }

      // Limpiar el estado
      localStorage.removeItem(`google_auth_state_${userId}`)

      // Intercambiar código por tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }),
      })

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text()
        throw new Error(`Error al obtener tokens: ${error}`)
      }

      const tokenData = await tokenResponse.json()

      // Obtener información del usuario de Google
      const userInfo = await this.getGoogleUserInfo(tokenData.access_token)

      // Guardar credenciales en la base de datos
      await this.saveUserCredentials(userId, {
        ...tokenData,
        ...userInfo
      })

      return {
        success: true,
        credentials: {
          googleUserId: userInfo.id,
          googleEmail: userInfo.email,
          googleName: userInfo.name,
          googleAvatarUrl: userInfo.picture,
          isConnected: true
        }
      }
    } catch (error) {
      console.error('Error al intercambiar código por tokens:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Obtener información del usuario de Google
  async getGoogleUserInfo(accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener información del usuario')
      }

      return await response.json()
    } catch (error) {
      console.error('Error al obtener información del usuario:', error)
      throw error
    }
  }

  // Guardar credenciales del usuario en la base de datos
  async saveUserCredentials(userId, tokenData) {
    try {
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

      const { data, error } = await supabase
        .from('user_google_drive_credentials')
        .upsert({
          user_id: userId,
          google_user_id: tokenData.id,
          google_email: tokenData.email,
          google_name: tokenData.name,
          google_avatar_url: tokenData.picture,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt.toISOString(),
          scope: tokenData.scope,
          is_connected: true,
          sync_status: 'success',
          last_sync_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error al guardar credenciales:', error)
      throw error
    }
  }

  // Obtener credenciales del usuario actual
  async getUserCredentials(userId) {
    try {
      const { data, error } = await supabase
        .from('user_google_drive_credentials')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error
      }

      return data
    } catch (error) {
      console.error('Error al obtener credenciales del usuario:', error)
      return null
    }
  }

  // Verificar si el token ha expirado y renovarlo si es necesario
  async refreshAccessToken(userId) {
    try {
      const credentials = await this.getUserCredentials(userId)
      if (!credentials || !credentials.refresh_token) {
        throw new Error('No hay refresh token disponible')
      }

      // Verificar si el token está por expirar (dentro de 5 minutos)
      const expirationTime = new Date(credentials.token_expires_at)
      const now = new Date()
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

      if (expirationTime > fiveMinutesFromNow) {
        // El token aún es válido, retornar el actual
        return credentials.access_token
      }

      // Renovar el token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: credentials.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      if (!refreshResponse.ok) {
        const error = await refreshResponse.text()
        throw new Error(`Error al renovar token: ${error}`)
      }

      const refreshData = await refreshResponse.json()

      // Actualizar credenciales en la base de datos
      const newExpiresAt = new Date(Date.now() + (refreshData.expires_in * 1000))

      const { error } = await supabase
        .from('user_google_drive_credentials')
        .update({
          access_token: refreshData.access_token,
          token_expires_at: newExpiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return refreshData.access_token
    } catch (error) {
      console.error('Error al renovar token de acceso:', error)
      
      // Marcar como desconectado si no se puede renovar
      await this.updateConnectionStatus(userId, false, 'error', error.message)
      throw error
    }
  }

  // Obtener token de acceso válido (renueva si es necesario)
  async getValidAccessToken(userId) {
    try {
      const credentials = await this.getUserCredentials(userId)
      if (!credentials) {
        throw new Error('Usuario no tiene credenciales de Google Drive')
      }

      if (!credentials.is_connected) {
        throw new Error('Cuenta de Google Drive no está conectada')
      }

      // Verificar y renovar token si es necesario
      return await this.refreshAccessToken(userId)
    } catch (error) {
      console.error('Error al obtener token válido:', error)
      throw error
    }
  }

  // Actualizar estado de conexión
  async updateConnectionStatus(userId, isConnected, syncStatus = 'pending', errorMessage = null) {
    try {
      const updateData = {
        is_connected: isConnected,
        sync_status: syncStatus,
        updated_at: new Date().toISOString()
      }

      if (isConnected && syncStatus === 'success') {
        updateData.last_sync_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_google_drive_credentials')
        .update(updateData)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error al actualizar estado de conexión:', error)
      return false
    }
  }

  // Desconectar cuenta de Google Drive de un usuario
  async disconnectUserAccount(userId) {
    try {
      const { error } = await supabase
        .from('user_google_drive_credentials')
        .update({
          is_active: false,
          is_connected: false,
          sync_status: 'disconnected',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error al desconectar cuenta:', error)
      return false
    }
  }

  // Verificar si un usuario tiene cuenta conectada
  async isUserConnected(userId) {
    try {
      const credentials = await this.getUserCredentials(userId)
      return credentials && credentials.is_connected
    } catch (error) {
      console.error('Error al verificar conexión:', error)
      return false
    }
  }

  // Obtener información de conexión del usuario
  async getConnectionInfo(userId) {
    try {
      const credentials = await this.getUserCredentials(userId)
      if (!credentials) {
        return {
          isConnected: false,
          googleEmail: null,
          googleName: null,
          googleAvatarUrl: null,
          lastSyncAt: null,
          syncStatus: 'not_connected'
        }
      }

      return {
        isConnected: credentials.is_connected,
        googleEmail: credentials.google_email,
        googleName: credentials.google_name,
        googleAvatarUrl: credentials.google_avatar_url,
        lastSyncAt: credentials.last_sync_at,
        syncStatus: credentials.sync_status,
        defaultFolderId: credentials.default_folder_id
      }
    } catch (error) {
      console.error('Error al obtener información de conexión:', error)
      return {
        isConnected: false,
        googleEmail: null,
        googleName: null,
        googleAvatarUrl: null,
        lastSyncAt: null,
        syncStatus: 'error'
      }
    }
  }

  // Procesar callback de OAuth
  async handleOAuthCallback(code, state, userId) {
    try {
      return await this.exchangeCodeForTokens(code, userId, state)
    } catch (error) {
      console.error('Error en callback de OAuth:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

const userGoogleDriveService = new UserGoogleDriveService();
export default userGoogleDriveService;