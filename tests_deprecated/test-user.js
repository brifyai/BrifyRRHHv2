// Script para verificar si un usuario existe en Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUser() {
  try {
    console.log('🔍 Verificando usuario: camiloalegriabarra@gmail.com');

    // Verificar en tabla users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'camiloalegriabarra@gmail.com')
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ Error consultando tabla users:', userError);
    } else if (userData) {
      console.log('✅ Usuario encontrado en tabla users:', userData);
    } else {
      console.log('⚠️  Usuario NO encontrado en tabla users');
    }

    // Verificar en auth.users (esto requiere service key)
    console.log('\n🔐 Verificando en auth.users...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error consultando auth.users:', authError.message);
    } else {
      const user = authData.users.find(u => u.email === 'camiloalegriabarra@gmail.com');
      if (user) {
        console.log('✅ Usuario encontrado en auth.users:', {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at
        });
      } else {
        console.log('⚠️  Usuario NO encontrado en auth.users');
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkUser();