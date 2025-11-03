// Script para probar autenticación con Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin() {
  try {
    console.log('🔐 Intentando iniciar sesión con: camiloalegriabarra@gmail.com');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'camiloalegriabarra@gmail.com',
      password: 'Antonito26'
    });

    if (error) {
      console.error('❌ Error de autenticación:', error.message);
      console.error('Código de error:', error.status);

      if (error.message.includes('Invalid login credentials')) {
        console.log('💡 Posibles causas:');
        console.log('  - Email no confirmado');
        console.log('  - Contraseña incorrecta');
        console.log('  - Usuario no existe en auth.users');
      }
    } else {
      console.log('✅ Login exitoso!');
      console.log('Usuario:', data.user.email);
      console.log('ID:', data.user.id);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testLogin();