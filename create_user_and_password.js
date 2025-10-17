const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.1bemvXK8mHpvoA4djXmjtzrtDGFqBY4VBb62QQKuyhw';

// Usar service role key para operaciones administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserAndPassword() {
  try {
    const email = 'camiloalegriabarra@gmail.com';
    const plainPassword = 'Antonito26';
    
    console.log('🔧 Configuración:');
    console.log('URL:', supabaseUrl);
    console.log('Service Key disponible:', !!supabaseServiceKey);
    
    console.log(`\n🔧 Creando/actualizando usuario ${email}...`);
    
    // Primero intentar crear el usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: plainPassword,
      email_confirm: true
    });
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Usuario ya existe en auth.users, actualizando contraseña...');
        
        // Si el usuario ya existe, actualizar la contraseña
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          authData.user?.id || 'buscar-id',
          { password: plainPassword }
        );
        
        if (updateError) {
          console.log('❌ Error al actualizar contraseña en auth.users:', updateError.message);
        } else {
          console.log('✅ Contraseña actualizada en auth.users');
        }
      } else {
        console.log('❌ Error al crear usuario en auth.users:', authError.message);
      }
    } else {
      console.log('✅ Usuario creado en auth.users:', authData.user?.id);
    }
    
    // Ahora crear/actualizar el registro en la tabla users
    console.log('\n🔧 Creando/actualizando registro en tabla users...');
    
    // Hashear la contraseña para la tabla users
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log('📝 Contraseña hasheada correctamente');
    
    // Verificar si ya existe en la tabla users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ Error al verificar usuario existente:', checkError.message);
    }
    
    if (existingUser) {
      // Actualizar usuario existente
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ 
          password: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();
      
      if (updateError) {
        console.log('❌ Error al actualizar usuario en tabla users:', updateError.message);
      } else {
        console.log('✅ Usuario actualizado en tabla users');
        console.log('📋 Datos actualizados:', JSON.stringify(updateData[0], null, 2));
      }
    } else {
      // Crear nuevo usuario
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          email: email,
          password: hashedPassword,
          full_name: 'Camilo Alegria Barra',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.log('❌ Error al crear usuario en tabla users:', insertError.message);
      } else {
        console.log('✅ Usuario creado en tabla users');
        console.log('📋 Datos insertados:', JSON.stringify(insertData[0], null, 2));
      }
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
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

createUserAndPassword();