const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsersTableStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla users...');
    
    // Intentar obtener información de la tabla users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error al consultar la tabla users:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('📋 Columnas encontradas en la tabla users:');
      console.log(Object.keys(data[0]));
      
      console.log('\n📝 Datos de ejemplo (primer usuario):');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️ No se encontraron usuarios en la tabla');
    }
    
    // Verificar si el usuario específico existe
    console.log('\n🔍 Buscando usuario camiloalegriabarra@gmail.com...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'camiloalegriabarra@gmail.com')
      .single();
    
    if (userError) {
      console.error('❌ Error al buscar el usuario:', userError);
    } else {
      console.log('✅ Usuario encontrado:');
      console.log(JSON.stringify(userData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkUsersTableStructure();