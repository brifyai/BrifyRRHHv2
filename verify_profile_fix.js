const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.1bemvXK8mHpvoA4djXmjtzrtDGFqBY4VBb62QQKuyhw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyProfile() {
  try {
    console.log('🔍 Verificando perfil del usuario...');
    
    // 1. Verificar datos actuales en la base de datos
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'camiloalegriabarra@gmail.com')
      .single();
    
    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError);
      return;
    }
    
    console.log('✅ Datos del perfil en base de datos:', {
      id: profileData.id,
      email: profileData.email,
      full_name: profileData.full_name,
      name: profileData.name
    });
    
    // 2. Verificar si el nombre es correcto
    if (profileData.full_name === 'Camilo Alegria Barra') {
      console.log('✅ El nombre en la base de datos es correcto: "Camilo Alegria Barra"');
    } else {
      console.log('❌ El nombre en la base de datos no es correcto:', profileData.full_name);
    }
    
    // 3. Intentar iniciar sesión para verificar el flujo completo
    console.log('\n🔐 Verificando flujo de autenticación...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'camiloalegriabarra@gmail.com',
      password: 'Antonito26'
    });
    
    if (signInError) {
      console.log('⚠️  Error en inicio de sesión (esperado si no hay sesión activa):', signInError.message);
    } else {
      console.log('✅ Inicio de sesión exitoso');
      
      // 4. Verificar que el perfil se carga correctamente después del login
      if (signInData.user) {
        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', signInData.user.id)
          .single();
        
        if (userError) {
          console.error('❌ Error cargando perfil después del login:', userError);
        } else {
          console.log('✅ Perfil cargado después del login:', {
            id: userProfile.id,
            email: userProfile.email,
            full_name: userProfile.full_name
          });
        }
      }
    }
    
    console.log('\n📋 Resumen:');
    console.log('- Base de datos: https://tmqglnycivlcjijoymwe.supabase.co');
    console.log('- Usuario: camiloalegriabarra@gmail.com');
    console.log('- Nombre en BD:', profileData.full_name);
    console.log('- ID de usuario:', profileData.id);
    
    console.log('\n🌐 Para verificar en el navegador:');
    console.log('1. Abrir http://localhost:3000');
    console.log('2. Iniciar sesión con camiloalegriabarra@gmail.com / Antonito26');
    console.log('3. Verificar que el saludo muestre "Camilo Alegria Barra"');
    console.log('4. Si sigue mostrando "usuario", limpiar caché y recargar (Ctrl+F5)');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verifyProfile();