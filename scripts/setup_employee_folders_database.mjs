import { supabase } from '../src/lib/supabaseClient.js';
import fs from 'fs';
import path from 'path';

/**
 * Script para ejecutar el SQL de configuración de carpetas de empleados
 * Este script lee el archivo SQL y lo ejecuta en Supabase
 */

async function executeSQLSetup() {
  console.log('🔧 Configurando base de datos para carpetas de empleados...');
  
  try {
    // 1. Leer el archivo SQL
    const sqlPath = path.join(process.cwd(), 'database/employee_folders_setup.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ No se encuentra el archivo SQL:', sqlPath);
      process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('📄 Archivo SQL leído correctamente');
    
    // 2. Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Se encontraron ${statements.length} statements SQL para ejecutar`);
    
    // 3. Ejecutar cada statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`⚙️ Ejecutando statement ${i + 1}/${statements.length}...`);
        
        // Intentar ejecutar directamente con Supabase
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          // Si falla con RPC, intentar con el endpoint REST
          console.warn('⚠️ RPC falló, intentando con endpoint REST...');
          
          const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ sql_query: statement })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          console.log('✅ Statement ejecutado via REST:', result);
        } else {
          console.log('✅ Statement ejecutado via RPC:', data);
        }
        
        successCount++;
        
        // Pequeña pausa para no sobrecargar la base de datos
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error en statement ${i + 1}:`, error.message);
        errorCount++;
        
        // Continuar con el siguiente statement
        continue;
      }
    }
    
    // 4. Verificar resultados
    console.log('\n📊 Resumen de la ejecución:');
    console.log(`   ✅ Statements exitosos: ${successCount}`);
    console.log(`   ❌ Statements con error: ${errorCount}`);
    console.log(`   📊 Total procesados: ${successCount + errorCount}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️ Algunos statements fallaron. Revisa los errores arriba.');
      console.log('💡 Es posible que algunas tablas ya existieran o que haya permisos limitados.');
    }
    
    // 5. Verificar que las tablas se crearon correctamente
    console.log('\n🔍 Verificando tablas creadas...');
    const tables = [
      'employee_folders',
      'employee_documents',
      'employee_faqs',
      'employee_conversations',
      'employee_notification_settings'
    ];
    
    let verificationResults = [];
    
    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error && error.code === 'PGRST116') {
          verificationResults.push({ table: tableName, status: '❌ No existe' });
        } else if (error) {
          verificationResults.push({ table: tableName, status: `⚠️ Error: ${error.message}` });
        } else {
          verificationResults.push({ table: tableName, status: '✅ Existe' });
        }
      } catch (error) {
        verificationResults.push({ table: tableName, status: `❌ Error: ${error.message}` });
      }
    }
    
    console.log('\n📋 Resultados de verificación:');
    verificationResults.forEach(result => {
      console.log(`   ${result.status} ${result.table}`);
    });
    
    // 6. Verificar funciones SQL
    console.log('\n🔍 Verificando funciones SQL...');
    try {
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_company_folder_stats', { company_uuid: '00000000-0000-0000-0000-000000000000' });
      
      if (functionError && !functionError.message.includes('invalid input')) {
        console.log('⚠️ Función get_company_folder_stats puede no existir');
      } else {
        console.log('✅ Función get_company_folder_stats existe');
      }
    } catch (error) {
      console.log('⚠️ No se pudo verificar la función get_company_folder_stats');
    }
    
    // 7. Resumen final
    const allTablesExist = verificationResults.every(r => r.status.includes('✅'));
    
    if (allTablesExist) {
      console.log('\n🎉 ¡Configuración completada exitosamente!');
      console.log('✅ Todas las tablas fueron creadas correctamente');
      console.log('\n📝 Siguientes pasos:');
      console.log('1. Ejecuta: node scripts/initialize_employee_folders.mjs');
      console.log('2. O accede al componente EmployeeFolderManager en la interfaz');
    } else {
      console.log('\n⚠️ La configuración tuvo algunos problemas.');
      console.log('💡 Revisa los errores arriba y ejecuta el SQL manualmente si es necesario.');
      console.log('📄 Archivo SQL: database/employee_folders_setup.sql');
    }
    
  } catch (error) {
    console.error('❌ Error fatal durante la configuración:', error);
    process.exit(1);
  }
}

// Función para verificar variables de entorno
function checkEnvironment() {
  const required = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Faltan variables de entorno requeridas:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.log('\n💡 Asegúrate de tener un archivo .env con las variables necesarias');
    process.exit(1);
  }
}

// Función principal
async function main() {
  console.log('🔧 Script de Configuración de Base de Datos');
  console.log('=======================================\n');
  
  // Verificar variables de entorno
  checkEnvironment();
  
  // Ejecutar configuración
  await executeSQLSetup();
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Error no manejado:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

// Ejecutar script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { executeSQLSetup, checkEnvironment };