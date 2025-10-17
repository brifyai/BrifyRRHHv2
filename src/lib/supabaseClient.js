import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// En desarrollo, usar la clave de servicio para evitar problemas de RLS
// En producción, se debería usar la clave anónima
const keyToUse = process.env.NODE_ENV === 'development' && supabaseServiceKey
  ? supabaseServiceKey
  : supabaseAnonKey

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, keyToUse)

// Export configuration for reference
export const config = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey
}