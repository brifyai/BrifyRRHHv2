import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, APP_CONFIG } from '../config/constants.js'

// Validar configuración de Supabase
if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.')
}

// En desarrollo, usar la clave de servicio para evitar problemas de RLS
// En producción, se debería usar la clave anónima
const keyToUse = APP_CONFIG.NODE_ENV === 'development' && SUPABASE_CONFIG.SERVICE_KEY
  ? SUPABASE_CONFIG.SERVICE_KEY
  : SUPABASE_CONFIG.ANON_KEY

// Create and export the Supabase client con opciones optimizadas
export const supabase = createClient(SUPABASE_CONFIG.URL, keyToUse, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': `${APP_CONFIG.NAME}/${APP_CONFIG.VERSION}`
    }
  },
  db: {
    schema: 'public'
  }
})

// Export configuration for reference
export const config = {
  url: SUPABASE_CONFIG.URL,
  anonKey: SUPABASE_CONFIG.ANON_KEY,
  environment: APP_CONFIG.NODE_ENV
}