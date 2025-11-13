/**
 * Google Drive Callback Handler
 * Procesa el callback de OAuth de Google y persiste credenciales
 * Maneja el flujo completo: código → tokens → Supabase
 */

import googleDrivePersistenceService from '../services/googleDrivePersistenceService.js';

class GoogleDriveCallbackHandler {
  /**
   * Procesa el código de autorización de Google
   * @param {string} code - Código de autorización de Google
   * @param {string} userId - ID del usuario
   * @returns {Promise<{success: boolean, data: object, error: object}>}
   */
  async handleAuthorizationCode(code, userId) {
    try {
      if (!code) {
        throw new Error('Código de autorización es requerido');
      }
      if (!userId) {
        throw new Error('User ID es requerido');
      }

      console.log(`Procesando código de autorización para usuario ${userId}`);

      // Paso 1: Intercambiar código por tokens
      const tokens = await this.exchangeCodeForTokens(code);
      if (!tokens) {
        throw new Error('No se pudieron obtener tokens de Google');
      }

      console.log('Tokens obtenidos exitosamente');

      // Paso 2: Obtener información del usuario de Google
      const userInfo = await this.getUserInfo(tokens.access_token);
      console.log('Información del usuario obtenida:', userInfo?.email);

      // Paso 3: Guardar credenciales en Supabase
      const { success, error } = await googleDrivePersistenceService.saveCredentials(
        userId,
        tokens,
        userInfo
      );

      if (!success) {
        throw new Error(`Error guardando credenciales: ${error?.message}`);
      }

      console.log('Credenciales guardadas exitosamente en Supabase');

      return {
        success: true,
        data: {
          userId,
          email: userInfo?.email,
          name: userInfo?.name,
          picture: userInfo?.picture,
          connected: true
        },
        error: null
      };
    } catch (error) {
      console.error('Error en handleAuthorizationCode:', error);
      return {
        success: false,
        data: null,
        error: { message: error.message }
      };
    }
  }

  /**
   * Intercambia código de autorización por tokens de acceso
   * @param {string} code - Código de autorización
   * @returns {Promise<object>} Tokens de OAuth
   */
  async exchangeCodeForTokens(code) {
    try {
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
      const redirectUri = this.getRedirectUri();

      if (!clientId) {
        throw new Error('Google OAuth client_id no configurado');
      }

      // Recuperar code_verifier (PKCE) guardado al iniciar OAuth (método "plain" para evitar async sha256)
      const codeVerifier = sessionStorage.getItem('google_oauth_code_verifier') || '';

      // Construir cuerpo de intercambio con PKCE
      const bodyParams = new URLSearchParams({
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier
      });

      // Incluir client_secret solo si está configurado (algunos clientes web no lo requieren con PKCE)
      if (clientSecret && !/tu_google_client_secret|YOUR_GOOGLE_CLIENT_SECRET_HERE/i.test(clientSecret)) {
        bodyParams.append('client_secret', clientSecret);
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams
      });

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error_description || errorData.error || errorMsg;
        } catch (_) {}
        throw new Error(`Google token exchange failed: ${errorMsg}`);
      }

      const tokens = await response.json();

      // Limpiar el code_verifier usado
      sessionStorage.removeItem('google_oauth_code_verifier');

      // Validar tokens
      if (!tokens.access_token) {
        throw new Error('No access_token en respuesta de Google');
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_in: tokens.expires_in || 3600,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope || 'https://www.googleapis.com/auth/drive'
      };
    } catch (error) {
      console.error('Error en exchangeCodeForTokens:', error);
      throw error;
    }
  }

  /**
   * Obtiene información del usuario de Google
   * @param {string} accessToken - Token de acceso
   * @returns {Promise<object>} Información del usuario
   */
  async getUserInfo(accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.warn('No se pudo obtener información del usuario de Google');
        return null;
      }

      const userInfo = await response.json();

      return {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        id: userInfo.id
      };
    } catch (error) {
      console.error('Error obteniendo información del usuario:', error);
      return null;
    }
  }

  /**
   * Obtiene el URI de redirección
   * @returns {string} URI de redirección
   */
  getRedirectUri() {
    // En desarrollo
    if (process.env.NODE_ENV === 'development') {
      return process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
    }

    // En producción
    return process.env.REACT_APP_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;
  }

  /**
   * Verifica si el usuario está conectado a Google Drive
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  async isUserConnected(userId) {
    try {
      return await googleDrivePersistenceService.isConnected(userId);
    } catch (error) {
      console.error('Error verificando conexión:', error);
      return false;
    }
  }

  /**
   * Desconecta Google Drive del usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<{success: boolean, error: object}>}
   */
  async disconnectUser(userId) {
    try {
      const { success, error } = await googleDrivePersistenceService.disconnect(userId);

      if (!success) {
        throw new Error(error?.message || 'Error desconectando Google Drive');
      }

      console.log(`Usuario ${userId} desconectado de Google Drive`);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error en disconnectUser:', error);
      return { success: false, error: { message: error.message } };
    }
  }

  /**
   * Obtiene el estado de conexión del usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<{connected: boolean, email: string, expiresAt: string}>}
   */
  async getConnectionStatus(userId) {
    try {
      const { data, error } = await googleDrivePersistenceService.getCredentials(userId);

      if (error || !data) {
        return {
          connected: false,
          email: null,
          expiresAt: null
        };
      }

      return {
        connected: data.is_connected === true && !data.is_expired,
        email: data.google_email || data.user_email,
        expiresAt: data.token_expires_at || data.expires_at,
        name: data.google_name || data.user_name,
        picture: data.google_avatar_url || data.user_picture
      };
    } catch (error) {
      console.error('Error obteniendo estado de conexión:', error);
      return {
        connected: false,
        email: null,
        expiresAt: null
      };
    }
  }

  /**
   * Obtiene un token de acceso válido
   * @param {string} userId - ID del usuario
   * @returns {Promise<{token: string, error: object}>}
   */
  async getValidAccessToken(userId) {
    try {
      return await googleDrivePersistenceService.getValidAccessToken(userId);
    } catch (error) {
      console.error('Error obteniendo token válido:', error);
      return { token: null, error: { message: error.message } };
    }
  }

  /**
   * Maneja el callback de OAuth (para usar en componentes)
   * @param {object} params - Parámetros del callback
   * @param {string} params.code - Código de autorización
   * @param {string} params.state - Estado (para validación CSRF)
   * @param {string} params.userId - ID del usuario
   * @returns {Promise<{success: boolean, data: object, error: object}>}
   */
  async handleOAuthCallback({ code, state, userId }) {
    try {
      // Validar state si es necesario
      if (state) {
        const storedState = sessionStorage.getItem('google_oauth_state');
        if (state !== storedState) {
          throw new Error('Estado de OAuth inválido (posible ataque CSRF)');
        }
        sessionStorage.removeItem('google_oauth_state');
      }

      // Procesar código
      const result = await this.handleAuthorizationCode(code, userId);

      // Limpiar parámetros de URL
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      return result;
    } catch (error) {
      console.error('Error en handleOAuthCallback:', error);
      return {
        success: false,
        data: null,
        error: { message: error.message }
      };
    }
  }

  /**
   * Genera un estado CSRF para OAuth
   * @returns {string} Estado aleatorio
   */
  generateOAuthState() {
    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('google_oauth_state', state);
    return state;
  }

  /**
   * Genera la URL de autorización de Google
   * @param {object} options - Opciones
   * @returns {string} URL de autorización
   */
  generateAuthorizationUrl(options = {}) {
    try {
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      const redirectUri = this.getRedirectUri();
      const state = this.generateOAuthState();

      if (!clientId) {
        throw new Error('Google OAuth client_id no configurado');
      }

      const scopes = options.scopes || [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ];

      // Generar code_verifier PKCE y usar método "plain" para evitar dependencia async de SHA-256
      const generateCodeVerifier = (length = 64) => {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        let verifier = '';
        if (window.crypto && window.crypto.getRandomValues) {
          const randomValues = new Uint32Array(length);
          window.crypto.getRandomValues(randomValues);
          for (let i = 0; i < length; i++) {
            verifier += charset[randomValues[i] % charset.length];
          }
        } else {
          for (let i = 0; i < length; i++) {
            verifier += charset[Math.floor(Math.random() * charset.length)];
          }
        }
        return verifier;
      };

      const codeVerifier = generateCodeVerifier(64);
      sessionStorage.setItem('google_oauth_code_verifier', codeVerifier);

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes.join(' '),
        state,
        access_type: 'offline',
        prompt: 'consent',
        code_challenge: codeVerifier,
        code_challenge_method: 'plain'
      });

      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } catch (error) {
      console.error('Error generando URL de autorización:', error);
      throw error;
    }
  }
}

const googleDriveCallbackHandler = new GoogleDriveCallbackHandler();
export default googleDriveCallbackHandler;
