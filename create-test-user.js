const { createClient } = require('@supabase/supabase-js');

// Credenciales del .env
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestUser() {
  console.log('🧪 Creando usuario de prueba - StaffHub');
  console.log('======================================');

  try {
    // Crear usuario con email válido de Gmail
    const { data, error } = await supabase.auth.signUp({
      email: 'test.staffhub@gmail.com',
      password: '123456',
      options: {
        data: {
          name: 'Usuario de Prueba',
          role: 'admin'
        }
      }
    });

    if (error) {
      console.log('❌ Error al crear usuario:', error.message);
      return;
    }

    console.log('✅ Usuario creado exitosamente');
    console.log('👤 Email:', data.user.email);
    console.log('🆔 ID:', data.user.id);
    console.log('📧 Confirmación enviada:', data.user.email_confirmed_at ? 'Sí' : 'No');

    // Si no está confirmado, intentar confirmar manualmente
    if (!data.user.email_confirmed_at) {
      console.log('\n⚠️ El email no está confirmado automáticamente');
      console.log('💡 Para desarrollo, puedes:');
      console.log('   1. Ir al panel de Supabase > Authentication > Users');
      console.log('   2. Buscar el usuario test.staffhub@gmail.com');
      console.log('   3. Hacer clic en "Confirm user"');
      console.log('   4. O usar el link de confirmación enviado al email');
    }

    // Intentar login inmediatamente
    console.log('\n🔐 Intentando login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test.staffhub@gmail.com',
      password: '123456'
    });

    if (signInError) {
      console.log('❌ Error en login:', signInError.message);
      if (signInError.message.includes('Email not confirmed')) {
        console.log('💡 El email necesita ser confirmado primero');
      }
    } else {
      console.log('✅ Login exitoso!');
      console.log('🎉 Ya puedes usar test.staffhub@gmail.com / 123456 en la app');
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

createTestUser();