// Script para probar el login desde el frontend y ver qué está pasando
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLoginFlow() {
  try {
    console.log('🔐 Probando flujo completo de login...');

    // 1. Verificar sesión actual
    console.log('\n1. Verificando sesión actual...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Sesión actual:', sessionData?.session ? 'Existe' : 'No existe');

    if (sessionError) {
      console.error('Error obteniendo sesión:', sessionError);
    }

    // 2. Intentar login
    console.log('\n2. Intentando login...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'camiloalegriabarra@gmail.com',
      password: 'Antonito26'
    });

    if (error) {
      console.error('❌ Error de login:', error);
      console.error('Mensaje:', error.message);
      console.error('Status:', error.status);
      return;
    }

    console.log('✅ Login exitoso!');
    console.log('Usuario:', data.user.email);
    console.log('ID:', data.user.id);
    console.log('Email confirmado:', data.user.email_confirmed_at ? 'Sí' : 'No');

    // 3. Verificar sesión después del login
    console.log('\n3. Verificando sesión después del login...');
    const { data: newSessionData } = await supabase.auth.getSession();
    console.log('Nueva sesión existe:', !!newSessionData?.session);

    if (newSessionData?.session) {
      console.log('Token de acceso existe:', !!newSessionData.session.access_token);
      console.log('Token de refresh existe:', !!newSessionData.session.refresh_token);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testLoginFlow();