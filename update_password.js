const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.qhJFpYqLhjK7L2Q9Xh3jP7sT8wRkKmYnN4vB2Xf8D3o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateUserPassword() {
  try {
    console.log('🔧 Actualizando contraseña del usuario camiloalegriabarra@gmail.com...');
    
    // Hashear la contraseña
    const plainPassword = 'Antonito26';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    console.log('📝 Contraseña hasheada correctamente');
    
    // Actualizar la contraseña en la base de datos
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
      return;
    }
    
    console.log('✅ Verificación completada:');
    console.log('   - ID:', verifyData.id);
    console.log('   - Email:', verifyData.email);
    console.log('   - Nombre:', verifyData.name);
    console.log('   - Rol:', verifyData.role);
    console.log('   - Actualizado:', verifyData.updated_at);
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la función
updateUserPassword();