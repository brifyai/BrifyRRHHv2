const { createClient } = require('@supabase/supabase-js');

// Credenciales del .env
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function finalDebugLogin() {
  console.log('🔍 Debug Final - Login camiloalegriabarra@gmail.com');
  console.log('====================================================');

  try {
    // 1. Verificar si el usuario existe y está confirmado
    console.log('1. Verificando estado del usuario...');

    // Intentar login con la contraseña correcta
    console.log('\n2. Intentando login con contraseña: Camilo123!');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'camiloalegriabarra@gmail.com',
      password: 'Camilo123!'
    });

    if (signInError) {
      console.log('❌ Error en login:', signInError.message);

      // Si es "Invalid login credentials", puede ser que el usuario no esté confirmado
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('\n🔍 Posibles causas:');
        console.log('   - Email no confirmado');
        console.log('   - Usuario no existe');
        console.log('   - Contraseña incorrecta');

        // Intentar crear el usuario nuevamente
        console.log('\n🧪 Intentando crear usuario nuevamente...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'camiloalegriabarra@gmail.com',
          password: 'Camilo123!',
          options: {
            data: {
              name: 'Camilo Alegria',
              role: 'admin'
            }
          }
        });

        if (signUpError) {
          console.log('❌ Error al crear usuario:', signUpError.message);
        } else {
          console.log('✅ Usuario creado nuevamente');
          console.log('🆔 Nuevo ID:', signUpData.user.id);
          console.log('📧 Email confirmado:', signUpData.user.email_confirmed_at ? 'Sí' : 'No');

          // Intentar login inmediatamente
          console.log('\n🔐 Intentando login después de crear...');
          const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
            email: 'camiloalegriabarra@gmail.com',
            password: 'Camilo123!'
          });

          if (newSignInError) {
            console.log('❌ Aun así falla el login:', newSignInError.message);
            console.log('💡 Necesitas confirmar el email con SQL:');

            const userId = signUpData.user.id;
            console.log(`
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE id = '${userId}';
            `);
          } else {
            console.log('✅ LOGIN EXITOSO!');
            console.log('🎉 Ya puedes usar camiloalegriabarra@gmail.com / Camilo123!');
          }
        }
      }
    } else {
      console.log('✅ LOGIN EXITOSO!');
      console.log('👤 Usuario:', signInData.user.email);
      console.log('🆔 ID:', signInData.user.id);
      console.log('🎉 Ya puedes usar las credenciales en la app!');
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

finalDebugLogin();