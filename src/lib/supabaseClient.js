import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, APP_CONFIG } from '../config/constants.js'

// Usar variables de entorno reales - NO SIMULADAS
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || SUPABASE_CONFIG.URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || SUPABASE_CONFIG.ANON_KEY

// Validar configuración de Supabase
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.')
}

// Create and export the Supabase client con opciones optimizadas y REALES
export const supabase = createClient(
  // Usar URL de variables de entorno
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      flow: 'pkce',
      debug: false, // Deshabilitar logs de debug para evitar spam
      storageKey: 'brifyrrhhv2-auth-token',
      storageGetItem: (key) => {
        try {
          return window.localStorage.getItem(key)
        } catch (e) {
          console.warn('Failed to get storage item:', key)
          return null
        }
      },
      storageSetItem: (key, value) => {
        try {
          window.localStorage.setItem(key, value)
        } catch (e) {
          console.warn('Failed to set storage item:', key, e)
        }
      }
    },
    global: {
      headers: {
        'X-Client-Info': `${APP_CONFIG.NAME}/${APP_CONFIG.VERSION}`,
        'X-Forced-Project': 'tmqglnycivlcjijoymwe'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      disabled: false,
      encodeChannels: (channel) => channel,
      decodeChannels: (channel) => channel
    }
  }
)

// Export configuration for reference
export const config = {
  url: SUPABASE_CONFIG.URL,
  anonKey: SUPABASE_CONFIG.ANON_KEY,
  environment: APP_CONFIG.NODE_ENV
}