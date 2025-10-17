const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exploreAllTables() {
  try {
    console.log('🔍 Explorando todas las tablas de la base de datos...');
    
    // Lista de tablas comunes para verificar
    const tables = [
      'users',
      'user_credentials', 
      'user_tokens_usage',
      'employees',
      'auth.users',
      'profiles',
      'accounts'
    ];
    
    for (const tableName of tables) {
      console.log(`\n📋 Verificando tabla: ${tableName}`);
      
      try {
        // Intentar obtener la estructura y datos
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Error al acceder a ${tableName}: ${error.message}`);
          continue;
        }
        
        console.log(`✅ Tabla ${tableName} encontrada con ${count} registros`);
        
        // Obtener un registro para ver la estructura
        if (count > 0) {
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!sampleError && sampleData.length > 0) {
            console.log(`📝 Columnas: ${Object.keys(sampleData[0]).join(', ')}`);
            
            // Buscar el email específico
            const { data: userData, error: userError } = await supabase
              .from(tableName)
              .select('*')
              .eq('email', 'camiloalegriabarra@gmail.com')
              .limit(1);
            
            if (!userError && userData.length > 0) {
              console.log('🎯 ¡USUARIO ENCONTRADO!');
              console.log(JSON.stringify(userData[0], null, 2));
            }
          }
        }
        
      } catch (err) {
        console.log(`❌ Error al verificar ${tableName}: ${err.message}`);
      }
    }
    
    // También intentar buscar directamente con RPC o SQL
    console.log('\n🔍 Intentando búsqueda directa con SQL...');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
      });
      
      if (!error && data) {
        console.log('📋 Tablas encontradas en la base de datos:');
        console.log(data.map(row => row.table_name).join(', '));
      }
    } catch (err) {
      console.log('❌ No se pudo ejecutar la consulta de tablas');
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

exploreAllTables();