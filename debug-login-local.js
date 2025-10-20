const { createClient } = require('@supabase/supabase-js');

// Credenciales del .env
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugLogin() {
  console.log('🔍 Debug Login Local - StaffHub');
  console.log('================================');

  try {
    // 1. Verificar conexión básica con auth
    console.log('1. Verificando conexión con Auth...');
    const { data: authTest, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('❌ Error de conexión Auth:', authError.message);
      return;
    }
    console.log('✅ Conexión Auth exitosa');

    // 2. Verificar si hay usuarios registrados (esto requiere service role key)
    console.log('\n2. Verificando usuarios registrados...');
    console.log('💡 Nota: Esta verificación requiere permisos de admin');

    // 3. Intentar login con credenciales conocidas
    console.log('\n3. Intentando login con camiloalegriabarra@gmail.com...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'camiloalegriabarra@gmail.com',
      password: '123456' // Contraseña por defecto
    });

    if (signInError) {
      console.log('❌ Error en login:', signInError.message);

      // Si el usuario no existe, intentar crear uno
      if (signInError.message.includes('Invalid login credentials') ||
          signInError.message.includes('Email not confirmed') ||
          signInError.message.includes('User not found')) {

        console.log('\n4. Intentando crear usuario de prueba...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'camiloalegriabarra@gmail.com',
          password: '123456'
        });

        if (signUpError) {
          console.log('❌ Error al crear usuario:', signUpError.message);
        } else {
          console.log('✅ Usuario creado exitosamente');
          console.log('📧 Revisa tu email para confirmar la cuenta');
          console.log('🔗 Datos del signup:', signUpData);
        }
      }
    } else {
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', signInData.user.email);
      console.log('🆔 ID:', signInData.user.id);
      console.log('🔗 Datos completos:', JSON.stringify(signInData, null, 2));
    }

    // 4. Verificar configuración de RLS
    console.log('\n4. Verificando configuración de la base de datos...');
    console.log('💡 Si hay errores de RLS, puede ser normal en desarrollo');

  } catch (error) {
    console.log('❌ Error general:', error.message);
    console.log('🔍 Stack trace:', error.stack);
  }
}

debugLogin();