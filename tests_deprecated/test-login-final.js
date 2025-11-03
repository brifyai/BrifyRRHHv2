const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin() {
  console.log('🧪 Test Final de Login');
  console.log('======================');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'camiloalegriabarra@gmail.com',
      password: 'Camilo123!'
    });

    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ LOGIN EXITOSO!');
      console.log('👤 Usuario:', data.user.email);
      console.log('🆔 ID:', data.user.id);
      console.log('🎉 ¡Ya puedes usar la aplicación!');
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

testLogin();