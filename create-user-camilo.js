const { createClient } = require('@supabase/supabase-js');

// Credenciales del .env
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createUserCamilo() {
  console.log('🧪 Creando usuario para Camilo - camiloalegriabarra@gmail.com');
  console.log('================================================================');

  try {
    // Crear usuario con email confirmado
    const { data, error } = await supabase.auth.signUp({
      email: 'camiloalegriabarra@gmail.com',
      password: 'Camilo123!',
      options: {
        data: {
          name: 'Camilo Alegria',
          role: 'admin',
          company: 'StaffHub'
        }
      }
    });

    if (error) {
      console.log('❌ Error al crear usuario:', error.message);

      // Si el usuario ya existe, intentar login
      if (error.message.includes('already registered') ||
          error.message.includes('User already registered')) {

        console.log('\n🔐 Usuario ya existe, intentando login...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'camiloalegriabarra@gmail.com',
          password: 'Camilo123!'
        });

        if (signInError) {
          console.log('❌ Error en login:', signInError.message);
        } else {
          console.log('✅ Login exitoso!');
          console.log('👤 Usuario:', signInData.user.email);
          console.log('🆔 ID:', signInData.user.id);
        }
      }
      return;
    }

    console.log('✅ Usuario creado exitosamente');
    console.log('👤 Email:', data.user.email);
    console.log('🆔 ID:', data.user.id);
    console.log('📧 Confirmación enviada:', data.user.email_confirmed_at ? 'Sí' : 'No');

    // Intentar login inmediatamente
    console.log('\n🔐 Intentando login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'camiloalegriabarra@gmail.com',
      password: 'Camilo123!'
    });

    if (signInError) {
      console.log('❌ Error en login:', signInError.message);
      if (signInError.message.includes('Email not confirmed')) {
        console.log('💡 El email necesita ser confirmado');
        console.log('🔧 Ejecutando confirmación automática...');

        // Intentar confirmar con SQL (esto requiere permisos admin)
        console.log('⚠️ Para confirmar automáticamente, ejecuta este SQL en Supabase:');
        console.log(`
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'camiloalegriabarra@gmail.com';
        `);
      }
    } else {
      console.log('✅ Login exitoso!');
      console.log('🎉 Ya puedes usar camiloalegriabarra@gmail.com / Camilo123! en la app');
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

createUserCamilo();