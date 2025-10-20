const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno REACT_APP_SUPABASE_URL o REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeFallbackMigration() {
  try {
    console.log('🚀 Ejecutando migración para agregar columna fallback_config...');
    
    // Como no podemos ejecutar ALTER TABLE directamente con el cliente JS,
    // vamos a verificar si la columna ya existe y mostrar instrucciones
    console.log('📋 Verificando estructura actual de la tabla companies...');
    
    // Intentar seleccionar la columna fallback_config
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, fallback_config')
      .limit(1);

    if (error && error.message.includes('column "fallback_config" does not exist')) {
      console.log('⚠️ La columna fallback_config no existe. Ejecute el siguiente SQL:');
      console.log('\n' + '='.repeat(80));
      console.log('OPCIÓN 1 - Panel de Supabase:');
      console.log('1. Vaya a https://supabase.com/dashboard');
      console.log('2. Seleccione su proyecto: tmqglnycivlcjijoymwe');
      console.log('3. Vaya a SQL Editor');
      console.log('4. Copie y ejecute el contenido del archivo migration_fallback_config.sql');
      console.log('\nOPCIÓN 2 - Archivo SQL:');
      console.log('El archivo migration_fallback_config.sql contiene el SQL completo para ejecutar.');
      console.log('='.repeat(80));
      
    } else if (error) {
      console.error('❌ Error verificando la tabla:', error);
    } else {
      console.log('✅ Columna fallback_config ya existe');
      
      if (companies && companies.length > 0) {
        console.log('📊 Muestra de empresas con fallback_config:');
        companies.forEach(company => {
          console.log(`  - ${company.name}: ${JSON.stringify(company.fallback_config)}`);
        });
      } else {
        console.log('📝 No hay empresas para mostrar, pero la columna existe.');
      }
    }

    console.log('\n🎯 Resumen de la implementación:');
    console.log('1. ✅ SendMessages.js modificado para usar configuración dinámica');
    console.log('2. ✅ communicationService.js actualizado con fallback personalizado');
    console.log('3. ⏳ Base de datos: Ejecute el SQL manualmente si la columna no existe');
    console.log('4. ✅ CompanyForm.js ya tiene la interfaz para editar el orden');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

executeFallbackMigration();