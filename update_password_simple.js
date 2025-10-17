require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Usar las mismas variables de entorno que el proyecto
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔧 Configuración:');
console.log('URL:', supabaseUrl);
console.log('Key disponible:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno. Verifica tu archivo .env');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateUserPassword() {
  try {
    console.log('🔧 Actualizando contraseña del usuario camiloalegriabarra@gmail.com...');
    
    // Hashear la contraseña
    const plainPassword = 'Antonito26';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    console.log('📝 Contraseña hasheada correctamente');
    
    // Deshabilitar RLS temporalmente para poder actualizar
    console.log('🔓 Deshabilitando RLS temporalmente...');
    
    // Intentar actualizar directamente (si RLS está deshabilitado para el usuario)
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'camiloalegriabarra@gmail.com')
      .select();
    
    if (error) {
      console.error('❌ Error al actualizar la contraseña:', error);
      
      // Si falla por RLS, intentar con RPC
      if (error.message.includes('row-level security')) {
        console.log('🔄 Intentando con RPC para evitar RLS...');
        
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('update_user_password', {
            user_email: 'camiloalegriabarra@gmail.com',
            new_password: hashedPassword
          });
        
        if (rpcError) {
          console.error('❌ Error con RPC:', rpcError);
        } else {
          console.log('✅ Contraseña actualizada exitosamente con RPC');
          console.log('📊 Datos:', rpcData);
        }
      }
      return;
    }
    
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('📊 Datos del usuario actualizado:', data);
    
    // Verificar la actualización
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('id, email, name, role, updated_at')
      .eq('email', 'camiloalegriabarra@gmail.com')
      .single();
    
    if (verifyError) {
      console.error('❌ Error al verificar la actualización:', verifyError);
    } else {
      console.log('✅ Verificación completada:');
      console.log('   - ID:', verifyData.id);
      console.log('   - Email:', verifyData.email);
      console.log('   - Nombre:', verifyData.name);
      console.log('   - Rol:', verifyData.role);
      console.log('   - Actualizado:', verifyData.updated_at);
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la función
updateUserPassword();