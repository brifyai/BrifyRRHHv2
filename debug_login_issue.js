const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.1bemvXK8mHpvoA4djXmjtzrtDGFqBY4VBb62QQKuyhw';

// Usar service role key para operaciones administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugLoginIssue() {
  try {
    const email = 'camiloalegriabarra@gmail.com';
    const plainPassword = 'Antonito26';
    
    console.log('🔧 Configuración:');
    console.log('URL:', supabaseUrl);
    console.log('Service Key disponible:', !!supabaseServiceKey);
    
    console.log(`\n🔍 Analizando problema de login para ${email}...`);
    
    // 1. Verificar estado actual del usuario en auth.users
    console.log('\n📋 1. Verificando estado en auth.users...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('❌ Error al listar usuarios:', listError.message);
      return;
    }
    
    const targetUser = users.find(user => user.email === email);
    
    if (!targetUser) {
      console.log('❌ Usuario no encontrado en auth.users');
      return;
    }
    
    console.log('✅ Usuario encontrado en auth.users:');
    console.log('📋 ID:', targetUser.id);
    console.log('📋 Email:', targetUser.email);
    console.log('📋 Email confirmado:', targetUser.email_confirmed_at ? 'Sí' : 'No');
    console.log('📋 Creado:', targetUser.created_at);
    console.log('📋 Último sign-in:', targetUser.last_sign_in_at);
    console.log('📋 Proveedor:', targetUser.app_metadata?.provider || 'email');
    
    // 2. Intentar resetear la contraseña completamente
    console.log('\n🔄 2. Resetendo contraseña completamente...');
    
    const { data: resetData, error: resetError } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { 
        password: plainPassword,
        email_confirm: true,
        // Forzar reset de sesión
        ban_duration_seconds: 1 // Banear por 1 segundo para forzar logout
      }
    );
    
    if (resetError) {
      console.log('❌ Error al resetear contraseña:', resetError.message);
    } else {
      console.log('✅ Contraseña reseteada exitosamente');
    }
    
    // 3. Quitar el ban inmediatamente
    console.log('\n🔓 3. Quitando ban temporal...');
    
    const { data: unbanData, error: unbanError } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { 
        ban_duration_seconds: null // Quitar el ban
      }
    );
    
    if (unbanError) {
      console.log('❌ Error al quitar ban:', unbanError.message);
    } else {
      console.log('✅ Ban quitado exitosamente');
    }
    
    // 4. Verificar estado final del usuario
    console.log('\n📋 4. Verificando estado final...');
    
    const { data: { users: finalUsers }, error: finalListError } = await supabase.auth.admin.listUsers();
    
    if (!finalListError) {
      const finalUser = finalUsers.find(user => user.email === email);
      if (finalUser) {
        console.log('✅ Estado final del usuario:');
        console.log('📋 Email confirmado:', finalUser.email_confirmed_at ? 'Sí' : 'No');
        console.log('📋 Baneado:', finalUser.banned_until ? 'Sí' : 'No');
        console.log('📋 Último sign-in:', finalUser.last_sign_in_at);
      }
    }
    
    // 5. Probar inicio de sesión con el cliente de autenticación
    console.log('\n🔐 5. Probando inicio de sesión...');
    
    // Crear un cliente con anon key para simular login real
    const supabaseAnon = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY);
    
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: email,
      password: plainPassword
    });
    
    if (signInError) {
      console.log('❌ Error en inicio de sesión:', signInError.message);
      console.log('📋 Detalles del error:', JSON.stringify(signInError, null, 2));
    } else {
      console.log('✅ Inicio de sesión exitoso:');
      console.log('📋 Usuario:', signInData.user?.email);
      console.log('📋 Session:', signInData.session ? 'Activa' : 'Inactiva');
    }
    
    // 6. Si falla, intentar crear una nueva contraseña temporal
    if (signInError) {
      console.log('\n🔄 6. Intentando método alternativo - contraseña temporal...');
      
      // Generar una contraseña más simple
      const tempPassword = 'Temp123456!';
      
      const { data: tempData, error: tempError } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        { 
          password: tempPassword,
          email_confirm: true
        }
      );
      
      if (tempError) {
        console.log('❌ Error al establecer contraseña temporal:', tempError.message);
      } else {
        console.log('✅ Contraseña temporal establecida:', tempPassword);
        console.log('📋 Por favor intenta iniciar sesión con:', tempPassword);
      }
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

debugLoginIssue();