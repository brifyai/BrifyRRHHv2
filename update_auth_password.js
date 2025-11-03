const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.1bemvXK8mHpvoA4djXmjtzrtDGFqBY4VBb62QQKuyhw';

// Usar service role key para operaciones administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateAuthPassword() {
  try {
    const email = 'camiloalegriabarra@gmail.com';
    const plainPassword = 'Antonito26';
    
    console.log('🔧 Configuración:');
    console.log('URL:', supabaseUrl);
    console.log('Service Key disponible:', !!supabaseServiceKey);
    
    console.log(`\n🔧 Actualizando contraseña en auth.users para ${email}...`);
    
    // Primero obtener el ID del usuario desde auth.users
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
    
    console.log('✅ Usuario encontrado en auth.users:', targetUser.id);
    
    // Actualizar la contraseña del usuario en auth.users
    const { data, error } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { 
        password: plainPassword,
        email_confirm: true // Asegurar que el email esté confirmado
      }
    );
    
    if (error) {
      console.log('❌ Error al actualizar contraseña en auth.users:', error.message);
      return;
    }
    
    console.log('✅ Contraseña actualizada exitosamente en auth.users');
    console.log('📋 Usuario actualizado:', {
      id: data.user.id,
      email: data.user.email,
      email_confirmed_at: data.user.email_confirmed_at
    });
    
    // También actualizar el nombre en la tabla users
    console.log('\n🔧 Actualizando nombre en tabla users...');
    
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ 
        full_name: 'Camilo Alegria Barra',
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select();
    
    if (updateError) {
      console.log('❌ Error al actualizar nombre en tabla users:', updateError.message);
    } else {
      console.log('✅ Nombre actualizado en tabla users');
      console.log('📋 Datos actualizados:', JSON.stringify(updateData[0], null, 2));
    }
    
    // Verificación final
    console.log('\n🔍 Verificación final...');
    const { data: finalUser, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (finalError) {
      console.log('❌ Error en verificación final:', finalError.message);
    } else {
      console.log('✅ Verificación exitosa:');
      console.log('📋 Usuario final:', JSON.stringify(finalUser, null, 2));
    }
    
    console.log('\n🎉 Proceso completado exitosamente');
    console.log('📝 Contraseña establecida: Antonito26');
    console.log('👤 Nombre actualizado: Camilo Alegria Barra');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

updateAuthPassword();