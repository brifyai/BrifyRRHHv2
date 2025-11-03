const { createClient } = require('@supabase/supabase-js');

// Credenciales del .env
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugLoginComplete() {
  console.log('🔍 Debug Login Completo - StaffHub');
  console.log('=====================================');

  try {
    // 1. Verificar estado del usuario en Supabase
    console.log('1. Verificando estado del usuario camiloalegriabarra@gmail.com...');

    // Usar admin client para verificar estado (esto requiere service role key)
    console.log('   ⚠️  Nota: Verificación de estado requiere permisos admin');

    // 2. Intentar login directo
    console.log('\n2. Intentando login con camiloalegriabarra@gmail.com...');

    // Primero intentar con contraseña común
    const commonPasswords = ['123456', 'password', '123456789', 'admin123'];

    for (const password of commonPasswords) {
      console.log(`   Probando contraseña: ${password}`);

      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'camiloalegriabarra@gmail.com',
          password: password
        });

        if (!signInError) {
          console.log('   ✅ LOGIN EXITOSO!');
          console.log('   👤 Usuario:', signInData.user.email);
          console.log('   🆔 ID:', signInData.user.id);
          console.log('   🔑 Access Token:', signInData.session?.access_token ? 'Presente' : 'Ausente');
          return;
        } else {
          console.log(`   ❌ Error: ${signInError.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Error de conexión: ${error.message}`);
      }
    }

    // 3. Si ninguna contraseña funciona, intentar reset de contraseña
    console.log('\n3. Intentando reset de contraseña...');
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail('camiloalegriabarra@gmail.com', {
      redirectTo: 'http://localhost:3001/reset-password'
    });

    if (resetError) {
      console.log('❌ Error en reset de contraseña:', resetError.message);
    } else {
      console.log('✅ Email de reset enviado a camiloalegriabarra@gmail.com');
      console.log('📧 Revisa tu email y haz clic en el link de reset');
      console.log('🔗 El link te llevará a: http://localhost:3001/reset-password');
    }

    // 4. Verificar configuración de email confirmations
    console.log('\n4. Verificando configuración de autenticación...');
    console.log('   💡 Si el login falla, puede ser que el email no esté confirmado');
    console.log('   🔧 Solución: Confirma el email desde el panel de Supabase');

  } catch (error) {
    console.log('❌ Error general:', error.message);
    console.log('🔍 Stack trace:', error.stack);
  }
}

debugLoginComplete();