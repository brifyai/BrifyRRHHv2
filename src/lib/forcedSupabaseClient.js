
/**
 * CLIENTE SUPABASE CORREGIDO - Versión definitiva
 *
 * Este archivo crea una única instancia del cliente Supabase con la configuración correcta
 * y asegura la persistencia de sesión
 */

import { createClient } from '@supabase/supabase-js'

// Configuración correcta del proyecto
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

// Crear una única instancia del cliente con configuración completa
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    // Añadir opciones adicionales para mayor estabilidad
    flow: 'pkce',
    debug: process.env.NODE_ENV === 'development'
  },
  global: {
    headers: {
      'X-Client-Info': 'staffhub/1.0.0'
    }
  }
})

// Exportar createClientForced para compatibilidad pero usando la misma configuración
export function createClientForced(url, key, options = {}) {
  console.warn('🔒 Usando cliente Supabase configurado correctamente');
  console.log('🔒 URL:', SUPABASE_URL);
  
  // Siempre retornar la misma instancia configurada correctamente
  return supabase;
}

// Sobrescribir la función global createClient para asegurar consistencia
if (typeof window !== 'undefined') {
  window.originalCreateClient = window.originalCreateClient || createClient;
}
