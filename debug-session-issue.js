/**
 * Script para diagnosticar problemas de sesión de Supabase
 */

console.log('🔍 DIAGNÓSTICO DE SESIÓN DE SUPABASE');
console.log('=====================================');

// 1. Verificar localStorage
console.log('\n1. VERIFICANDO LOCAL STORAGE:');
try {
  const supabaseAuth = localStorage.getItem('supabase.auth.token');
  if (supabaseAuth) {
    const parsed = JSON.parse(supabaseAuth);
    console.log('✅ Token encontrado en localStorage:');
    console.log('   - Current session exists:', !!parsed.currentSession);
    console.log('   - Expires at:', parsed.currentSession?.expires_at);
    console.log('   - User ID:', parsed.currentSession?.user?.id);
  } else {
    console.log('❌ No se encontró token en localStorage');
  }
} catch (error) {
  console.error('❌ Error leyendo localStorage:', error);
}

// 2. Verificar sessionStorage
console.log('\n2. VERIFICANDO SESSION STORAGE:');
try {
  const sessionData = sessionStorage.getItem('supabase.auth.token');
  if (sessionData) {
    console.log('✅ Datos encontrados en sessionStorage');
  } else {
    console.log('❌ No se encontraron datos en sessionStorage');
  }
} catch (error) {
  console.error('❌ Error leyendo sessionStorage:', error);
}

// 3. Verificar cookies
console.log('\n3. VERIFICANDO COOKIES:');
document.cookie.split(';').forEach(cookie => {
  const [name, value] = cookie.trim().split('=');
  if (name.includes('supabase')) {
    console.log(`✅ Cookie encontrada: ${name}`);
  }
});

// 4. Verificar configuración del cliente
console.log('\n4. VERIFICANDO CONFIGURACIÓN DEL CLIENTE:');
console.log('   - URL de Supabase:', process.env.REACT_APP_SUPABASE_URL);
console.log('   - Anon Key disponible:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);

// 5. Probar conexión directa
console.log('\n5. PROBANDO CONEXIÓN DIRECTA:');
import { createClient } from '@supabase/supabase-js';

const testClient = createClient(
  'https://tmqglnycivlcjijoymwe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  }
);

testClient.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Error obteniendo sesión:', error);
  } else {
    console.log('✅ Sesión obtenida exitosamente:');
    console.log('   - Session exists:', !!data.session);
    console.log('   - User ID:', data.session?.user?.id);
    console.log('   - Expires at:', data.session?.expires_at);
  }
});

console.log('\n6. INSTRUCCIONES:');
console.log('   - Abre la consola del navegador');
console.log('   - Inicia sesión');
console.log('   - Actualiza la página');
console.log('   - Revisa los resultados de este diagnóstico');
console.log('   - Si ves "❌ No se encontró token en localStorage" después de actualizar, ese es el problema');