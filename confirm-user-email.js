const { createClient } = require('@supabase/supabase-js');

// Credenciales del .env
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

// ⚠️ IMPORTANTE: Esta es la SERVICE ROLE KEY (solo para desarrollo/testing)
// En producción NUNCA uses esta key en el frontend
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function confirmUserEmail() {
  console.log('🔧 Confirmando email del usuario - StaffHub');
  console.log('============================================');

  try {
    // Confirmar email del usuario
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      'bc2502d9-c918-4671-8626-38d4f448ca47', // ID del usuario creado
      {
        email_confirm: true
      }
    );

    if (error) {
      console.log('❌ Error al confirmar email:', error.message);
    } else {
      console.log('✅ Email confirmado exitosamente');
      console.log('👤 Usuario confirmado:', data.user.email);
    }

    // Ahora intentar login
    console.log('\n🔐 Intentando login después de confirmación...');
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: 'camiloalegriabarra@gmail.com',
      password: '123456'
    });

    if (signInError) {
      console.log('❌ Error en login:', signInError.message);
    } else {
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', signInData.user.email);
      console.log('🆔 ID:', signInData.user.id);
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

confirmUserEmail();