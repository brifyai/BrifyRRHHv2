const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.1bemvXK8mHpvoA4djXmjtzrtDGFqBY4VBb62QQKuyhw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTemporaryPassword() {
  try {
    const email = 'camiloalegriabarra@gmail.com';
    const tempPassword = 'Brify123!';
    
    console.log('🔧 Creando contraseña temporal para acceso inmediato...');
    
    // 1. Obtener el usuario
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('❌ Error al listar usuarios:', listError.message);
      return;
    }
    
    const targetUser = users.find(user => user.email === email);
    
    if (!targetUser) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', targetUser.id);
    
    // 2. Establecer contraseña temporal simple
    const { data, error } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { 
        password: tempPassword,
        email_confirm: true
      }
    );
    
    if (error) {
      console.log('❌ Error al establecer contraseña temporal:', error.message);
      return;
    }
    
    console.log('✅ Contraseña temporal establecida exitosamente');
    
    // 3. Verificar que funciona
    const supabaseAnon = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY);
    
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: email,
      password: tempPassword
    });
    
    if (signInError) {
      console.log('❌ Error verificando contraseña temporal:', signInError.message);
    } else {
      console.log('✅ Verificación exitosa');
    }
    
    console.log('\n🎉 CREDENCIALES DE ACCESO TEMPORALES:');
    console.log('==========================================');
    console.log('📧 Email:', email);
    console.log('🔑 Contraseña:', tempPassword);
    console.log('==========================================');
    console.log('⚠️  IMPORTANTE: Use estas credenciales para iniciar sesión');
    console.log('⚠️  Luego puede cambiar la contraseña desde el perfil');
    
    // 4. También intentar con "Antonito26" como alternativa
    console.log('\n🔄 Estableciendo también "Antonito26" como alternativa...');
    
    const { data: altData, error: altError } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { 
        password: 'Antonito26',
        email_confirm: true
      }
    );
    
    if (altError) {
      console.log('❌ Error con contraseña alternativa:', altError.message);
    } else {
      console.log('✅ Contraseña "Antonito26" también establecida');
    }
    
    console.log('\n📋 OPCIONES DE CONTRASEÑA:');
    console.log('1. Brify123! (recomendada - fácil de escribir)');
    console.log('2. Antonito26 (solicitada originalmente)');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

createTemporaryPassword();