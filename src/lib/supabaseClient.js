import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, APP_CONFIG } from '../config/constants.js'

// Validar configuración de Supabase
if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.')
}

// Usar siempre la clave anónima para evitar problemas de RLS
const keyToUse = SUPABASE_CONFIG.ANON_KEY

// Create and export the Supabase client con opciones optimizadas y forzadas
export const supabase = createClient(
  // Forzar siempre el proyecto correcto
  'https://tmqglnycivlcjijoymwe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      flow: 'pkce',
      debug: process.env.NODE_ENV === 'development'
    },
    global: {
      headers: {
        'X-Client-Info': `${APP_CONFIG.NAME}/${APP_CONFIG.VERSION}`,
        'X-Forced-Project': 'tmqglnycivlcjijoymwe'
      }
    },
    db: {
      schema: 'public'
    }
  }
)

// Export configuration for reference
export const config = {
  url: SUPABASE_CONFIG.URL,
  anonKey: SUPABASE_CONFIG.ANON_KEY,
  environment: APP_CONFIG.NODE_ENV
}