import enhancedEmployeeFolderService from '../src/services/enhancedEmployeeFolderService.js';
import supabaseClient from '../src/lib/supabaseClient.js';

const { supabase } = supabaseClient;

/**
 * Script para inicializar carpetas de todos los empleados existentes
 * Este script crea carpetas en Supabase y opcionalmente en Google Drive
 */

async function initializeEmployeeFolders() {
  console.log('🚀 Iniciando inicialización de carpetas de empleados...');
  
  try {
    // 1. Inicializar el servicio
    console.log('📋 Paso 1: Inicializando servicio de carpetas...');
    const serviceInitialized = await enhancedEmployeeFolderService.initialize();
    
    if (!serviceInitialized) {
      console.error('❌ No se pudo inicializar el servicio de carpetas');
      process.exit(1);
    }
    
    console.log('✅ Servicio de carpetas inicializado correctamente');
    
    // 2. Verificar si ya existen carpetas en Supabase
    console.log('📊 Paso 2: Verificando carpetas existentes...');
    const { data: existingFolders, error: foldersError } = await supabase
      .from('employee_folders')
      .select('employee_email')
      .limit(1);
    
    if (foldersError && foldersError.code !== 'PGRST116') {
      console.error('❌ Error verificando carpetas existentes:', foldersError);
      process.exit(1);
    }
    
    const existingCount = existingFolders ? existingFolders.length : 0;
    console.log(`📁 Se encontraron ${existingCount} carpetas existentes`);
    
    // 3. Crear carpetas para todos los empleados
    console.log('🔧 Paso 3: Creando carpetas para todos los empleados...');
    const result = await enhancedEmployeeFolderService.createFoldersForAllEmployees();
    
    console.log('📊 Resultados:');
    console.log(`   ✅ Carpetas creadas: ${result.createdCount}`);
    console.log(`   🔄 Carpetas actualizadas: ${result.updatedCount}`);
    console.log(`   ❌ Errores: ${result.errorCount}`);
    
    // 4. Verificar resultados finales
    console.log('📋 Paso 4: Verificando resultados finales...');
    const { data: finalFolders, error: finalError } = await supabase
      .from('employee_folders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (finalError) {
      console.error('❌ Error obteniendo carpetas finales:', finalError);
    } else {
      console.log(`📁 Total de carpetas en base de datos: ${finalFolders ? finalFolders.length : 0}`);
      
      if (finalFolders && finalFolders.length > 0) {
        console.log('\n📋 Últimas carpetas creadas/actualizadas:');
        finalFolders.forEach((folder, index) => {
          console.log(`   ${index + 1}. ${folder.employee_name} (${folder.employee_email}) - ${folder.company_name}`);
        });
      }
    }
    
    // 5. Estadísticas por empresa
    console.log('\n📊 Paso 5: Generando estadísticas por empresa...');
    const { data: companyStats, error: statsError } = await supabase
      .from('employee_folders')
      .select('company_name, company_id')
      .not('company_name', 'is', null);
    
    if (statsError) {
      console.error('❌ Error obteniendo estadísticas:', statsError);
    } else {
      const stats = {};
      companyStats?.forEach(folder => {
        const companyName = folder.company_name || 'Sin empresa';
        stats[companyName] = (stats[companyName] || 0) + 1;
      });
      
      console.log('\n📈 Carpetas por empresa:');
      Object.entries(stats).forEach(([company, count]) => {
        console.log(`   ${company}: ${count} carpetas`);
      });
    }
    
    console.log('\n🎉 ¡Inicialización completada exitosamente!');
    console.log('\n📝 Resumen:');
    console.log(`   • Carpetas nuevas creadas: ${result.createdCount}`);
    console.log(`   • Carpetas existentes actualizadas: ${result.updatedCount}`);
    console.log(`   • Total de errores: ${result.errorCount}`);
    console.log(`   • Total procesado: ${result.createdCount + result.updatedCount + result.errorCount}`);
    
    if (result.errorCount > 0) {
      console.log('\n⚠️  Algunas carpetas no pudieron ser procesadas. Revisa los logs para más detalles.');
    }
    
  } catch (error) {
    console.error('❌ Error fatal durante la inicialización:', error);
    process.exit(1);
  }
}

// Función para verificar la estructura de la base de datos
async function verifyDatabaseStructure() {
  console.log('🔍 Verificando estructura de la base de datos...');
  
  const tables = [
    'employee_folders',
    'employee_documents',
    'employee_faqs',
    'employee_conversations',
    'employee_notification_settings'
  ];
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.error(`❌ La tabla ${tableName} no existe. Ejecuta el script SQL primero.`);
        return false;
      } else if (error) {
        console.error(`❌ Error verificando tabla ${tableName}:`, error);
        return false;
      } else {
        console.log(`✅ Tabla ${tableName} verificada`);
      }
    } catch (error) {
      console.error(`❌ Error verificando tabla ${tableName}:`, error);
      return false;
    }
  }
  
  return true;
}

// Función principal
async function main() {
  console.log('🔧 Sistema de Inicialización de Carpetas de Empleados');
  console.log('==================================================\n');
  
  // Verificar estructura de la base de datos
  const structureOk = await verifyDatabaseStructure();
  if (!structureOk) {
    console.log('\n❌ La estructura de la base de datos no es correcta.');
    console.log('💡 Por favor, ejecuta el siguiente script SQL en Supabase:');
    console.log('   database/employee_folders_setup.sql');
    process.exit(1);
  }
  
  // Inicializar carpetas
  await initializeEmployeeFolders();
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

export { initializeEmployeeFolders, verifyDatabaseStructure };