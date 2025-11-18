/**
 * SERVICIO UNIFICADO DE GOOGLE DRIVE
 * 
 * Este servicio centraliza toda la lógica de Google Drive
 * reemplazando múltiples implementaciones conflictivas.
 */

import { supabase } from './supabaseClient.js';
import { GOOGLE_DRIVE_CONFIG, validateGoogleDriveConfig } from './googleDriveConfig.js';

class GoogleDriveService {
  constructor() {
    this.isInitialized = false;
    this.tokens = null;
    this.userId = null;
    this.init();
  }

  /**
   * Inicializa el servicio
   */
  init() {
    console.log('🔧 GoogleDriveService: Inicializando...');
    
    // Validar configuración
    if (!validateGoogleDriveConfig()) {
      console.warn('⚠️ GoogleDriveService: Configuración incompleta');
      return;
    }
    
    // Cargar tokens del localStorage si existen
    this.loadTokensFromStorage();
    
    this.isInitialized = true;
    console.log('✅ GoogleDriveService: Inicializado correctamente');
  }

  /**
   * Carga tokens del localStorage
   */
  loadTokensFromStorage() {
    try {
      const stored = localStorage.getItem('google_drive_tokens');
      if (stored) {
        this.tokens = JSON.parse(stored);
        console.log('✅ GoogleDriveService: Tokens cargados del almacenamiento');
      }
    } catch (error) {
      console.error('❌ Error cargando tokens:', error);
      this.tokens = null;
    }
  }

  /**
   * Guarda tokens en localStorage
   */
  saveTokensToStorage(tokens) {
    try {
      localStorage.setItem('google_drive_tokens', JSON.stringify(tokens));
      this.tokens = tokens;
      console.log('✅ GoogleDriveService: Tokens guardados en almacenamiento');
    } catch (error) {
      console.error('❌ Error guardando tokens:', error);
    }
  }

  /**
   * Obtiene la URL de autorización
   */
  getAuthorizationUrl(state = '') {
    const params = new URLSearchParams({
      client_id: GOOGLE_DRIVE_CONFIG.clientId,
      redirect_uri: GOOGLE_DRIVE_CONFIG.redirectUri,
      response_type: 'code',
      scope: GOOGLE_DRIVE_CONFIG.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: state || Math.random().toString(36).substring(7)
    });
    
    const url = `${GOOGLE_DRIVE_CONFIG.oauth.authorizationUrl}?${params.toString()}`;
    console.log('🔗 GoogleDriveService: URL de autorización generada');
    return url;
  }

  /**
   * Intercambia código de autorización por tokens
   */
  async exchangeCodeForTokens(code) {
    try {
      console.log('🔄 GoogleDriveService: Intercambiando código por tokens...');
      
      const response = await fetch(GOOGLE_DRIVE_CONFIG.oauth.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: GOOGLE_DRIVE_CONFIG.clientId,
          client_secret: GOOGLE_DRIVE_CONFIG.clientSecret,
          code,
          redirect_uri: GOOGLE_DRIVE_CONFIG.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const tokens = await response.json();
      
      // Guardar tokens
      this.saveTokensToStorage(tokens);
      
      // Guardar en Supabase
      await this.saveTokensToDatabase(tokens);
      
      console.log('✅ GoogleDriveService: Tokens obtenidos correctamente');
      return tokens;
    } catch (error) {
      console.error('❌ Error intercambiando código:', error);
      throw error;
    }
  }

  /**
   * Guarda tokens en la base de datos
   */
  async saveTokensToDatabase(tokens) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('⚠️ GoogleDriveService: Usuario no autenticado');
        return;
      }

      const { error } = await supabase
        .from('google_drive_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          token_type: tokens.token_type,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Error guardando tokens en BD:', error);
        throw error;
      }

      console.log('✅ GoogleDriveService: Tokens guardados en base de datos');
    } catch (error) {
      console.error('❌ Error en saveTokensToDatabase:', error);
      // No lanzar error, solo registrar
    }
  }

  /**
   * Obtiene tokens de la base de datos
   */
  async getTokensFromDatabase() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('⚠️ GoogleDriveService: Usuario no autenticado');
        return null;
      }

      const { data, error } = await supabase
        .from('google_drive_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('⚠️ GoogleDriveService: No hay tokens en BD:', error.message);
        return null;
      }

      console.log('✅ GoogleDriveService: Tokens obtenidos de base de datos');
      return data;
    } catch (error) {
      console.error('❌ Error en getTokensFromDatabase:', error);
      return null;
    }
  }

  /**
   * Refresca el token de acceso
   */
  async refreshAccessToken() {
    try {
      if (!this.tokens?.refresh_token) {
        console.warn('⚠️ GoogleDriveService: No hay refresh token disponible');
        return null;
      }

      console.log('🔄 GoogleDriveService: Refrescando token de acceso...');

      const response = await fetch(GOOGLE_DRIVE_CONFIG.oauth.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: GOOGLE_DRIVE_CONFIG.clientId,
          client_secret: GOOGLE_DRIVE_CONFIG.clientSecret,
          refresh_token: this.tokens.refresh_token,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const newTokens = await response.json();
      
      // Mantener refresh token si no viene uno nuevo
      if (!newTokens.refresh_token) {
        newTokens.refresh_token = this.tokens.refresh_token;
      }

      // Guardar nuevos tokens
      this.saveTokensToStorage(newTokens);
      await this.saveTokensToDatabase(newTokens);

      console.log('✅ GoogleDriveService: Token refrescado correctamente');
      return newTokens;
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      throw error;
    }
  }

  /**
   * Revoca los tokens
   */
  async revokeTokens() {
    try {
      console.log('🔄 GoogleDriveService: Revocando tokens...');

      if (this.tokens?.access_token) {
        await fetch(GOOGLE_DRIVE_CONFIG.oauth.revokeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            token: this.tokens.access_token
          })
        });
      }

      // Limpiar almacenamiento local
      localStorage.removeItem('google_drive_tokens');
      this.tokens = null;

      // Limpiar base de datos
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('google_drive_tokens')
          .delete()
          .eq('user_id', user.id);
      }

      console.log('✅ GoogleDriveService: Tokens revocados correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error revocando tokens:', error);
      throw error;
    }
  }

  /**
   * Verifica si hay tokens válidos
   */
  hasValidTokens() {
    return !!(this.tokens?.access_token);
  }

  /**
   * Obtiene el token de acceso actual
   */
  getAccessToken() {
    return this.tokens?.access_token || null;
  }

  /**
   * Realiza una llamada a la API de Google Drive
   */
  async callGoogleDriveAPI(endpoint, options = {}) {
    try {
      if (!this.hasValidTokens()) {
        throw new Error('No hay tokens válidos disponibles');
      }

      const url = `https://www.googleapis.com/drive/v3${endpoint}`;
      const headers = {
        'Authorization': `Bearer ${this.getAccessToken()}`,
        'Content-Type': 'application/json',
        ...options.headers
      };

      const response = await fetch(url, {
        ...options,
        headers,
        timeout: GOOGLE_DRIVE_CONFIG.timeout
      });

      if (response.status === 401) {
        // Token expirado, intentar refrescar
        console.log('🔄 GoogleDriveService: Token expirado, refrescando...');
        await this.refreshAccessToken();
        return this.callGoogleDriveAPI(endpoint, options);
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error en llamada a Google Drive API:', error);
      throw error;
    }
  }

  /**
   * Lista archivos del usuario
   */
  async listFiles(pageSize = 10) {
    try {
      console.log('📁 GoogleDriveService: Listando archivos...');
      
      const data = await this.callGoogleDriveAPI('/files', {
        method: 'GET',
        headers: {
          'q': "trashed=false"
        }
      });

      console.log('✅ GoogleDriveService: Archivos listados:', data.files?.length || 0);
      return data.files || [];
    } catch (error) {
      console.error('❌ Error listando archivos:', error);
      throw error;
    }
  }

  /**
   * Obtiene información de un archivo
   */
  async getFileInfo(fileId) {
    try {
      console.log('📄 GoogleDriveService: Obteniendo información del archivo:', fileId);
      
      const data = await this.callGoogleDriveAPI(`/files/${fileId}`, {
        method: 'GET'
      });

      console.log('✅ GoogleDriveService: Información obtenida');
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo información del archivo:', error);
      throw error;
    }
  }
}

// Exportar instancia única
const googleDriveService = new GoogleDriveService();
export default googleDriveService;
