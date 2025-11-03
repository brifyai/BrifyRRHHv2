/**
 * SCRIPT PARA PROBAR EL SERVICIO DE BASE DE DATOS ORGANIZADA
 * 
 * Este script verifica que el nuevo servicio organizado funciona correctamente
 * y puede obtener los datos de la base de datos reestructurada.
 */

import organizedDatabaseService from './src/services/organizedDatabaseService.js';

async function testOrganizedDatabaseService() {
  console.log('🔍 Iniciando pruebas del servicio de base de datos organizada...\n');

  try {
    // 1. Verificar estructura de la base de datos
    console.log('1️⃣ Verificando estructura de la base de datos...');
    const structure = await organizedDatabaseService.verifyDatabaseStructure();
    
    console.log('Estructura encontrada:');
    Object.entries(structure).forEach(([table, info]) => {
      console.log(`  📋 ${table}: ${info.exists ? '✅ EXISTE' : '❌ NO EXISTE'} (${info.count} registros)`);
      if (info.error) {
        console.log(`     ⚠️  Error: ${info.error}`);
      }
    });

    // 2. Probar obtención de estadísticas del dashboard
    console.log('\n2️⃣ Probando obtención de estadísticas del dashboard...');
    const dashboardStats = await organizedDatabaseService.getDashboardStats();
    
    console.log('Estadísticas del dashboard:');
    console.log(`  🏢 Empresas: ${dashboardStats.companies}`);
    console.log(`  👥 Empleados: ${dashboardStats.employees}`);
    console.log(`  📁 Carpetas: ${dashboardStats.folders}`);
    console.log(`  📄 Documentos: ${dashboardStats.documents}`);
    console.log(`  💬 Comunicaciones: ${dashboardStats.communications}`);
    console.log(`  🪙 Tokens usados: ${dashboardStats.tokensUsed}`);
    console.log(`  💾 Almacenamiento: ${dashboardStats.storageUsed} MB`);

    // 3. Probar obtención de empresas
    console.log('\n3️⃣ Probando obtención de empresas...');
    const companies = await organizedDatabaseService.getCompanies();
    console.log(`Se encontraron ${companies.length} empresas:`);
    companies.slice(0, 5).forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name} (${company.industry || 'Sin industria'})`);
    });
    if (companies.length > 5) {
      console.log(`  ... y ${companies.length - 5} más`);
    }

    // 4. Probar obtención de empleados
    console.log('\n4️⃣ Probando obtención de empleados...');
    const employees = await organizedDatabaseService.getEmployees();
    console.log(`Se encontraron ${employees.length} empleados:`);
    employees.slice(0, 5).forEach((employee, index) => {
      console.log(`  ${index + 1}. ${employee.first_name} ${employee.last_name} - ${employee.companies?.name || 'Sin empresa'}`);
    });
    if (employees.length > 5) {
      console.log(`  ... y ${employees.length - 5} más`);
    }

    // 5. Probar obtención de carpetas
    console.log('\n5️⃣ Probando obtención de carpetas...');
    const folders = await organizedDatabaseService.getFolders();
    console.log(`Se encontraron ${folders.length} carpetas:`);
    folders.slice(0, 5).forEach((folder, index) => {
      console.log(`  ${index + 1}. ${folder.name} - ${folder.employees?.first_name} ${folder.employees?.last_name || 'Sin empleado'}`);
    });
    if (folders.length > 5) {
      console.log(`  ... y ${folders.length - 5} más`);
    }

    // 6. Verificar el problema específico del contador de carpetas
    console.log('\n6️⃣ Verificando el problema del contador de carpetas...');
    const folderCount = await organizedDatabaseService.getFolderCount();
    console.log(`📊 Contador de carpetas: ${folderCount}`);
    
    if (folderCount === 800) {
      console.log('✅ ¡El contador de carpetas muestra correctamente 800!');
    } else if (folderCount === 0) {
      console.log('❌ El contador de carpetas muestra 0 - el problema persiste');
    } else {
      console.log(`⚠️  El contador de carpetas muestra ${folderCount} - valor inesperado`);
    }

    // 7. Resumen de la prueba
    console.log('\n📋 RESUMEN DE LA PRUEBA:');
    console.log('=====================================');
    
    const hasCompanies = structure.companies.exists && structure.companies.count > 0;
    const hasEmployees = structure.employees.exists && structure.employees.count > 0;
    const hasFolders = structure.folders.exists && structure.folders.count > 0;
    const correctFolderCount = folderCount === 800;
    
    if (hasCompanies && hasEmployees && hasFolders && correctFolderCount) {
      console.log('🎉 ¡TODO CORRECTO! La base de datos está organizada y funcionando:');
      console.log('   ✅ Empresas configuradas correctamente');
      console.log('   ✅ Empleados configurados correctamente');
      console.log('   ✅ Carpetas configuradas correctamente');
      console.log('   ✅ Contador de carpetas muestra 800');
      console.log('\n🚀 El sistema está listo para funcionar con la nueva estructura.');
    } else {
      console.log('⚠️  PROBLEMAS DETECTADOS:');
      if (!hasCompanies) console.log('   ❌ No hay empresas en la base de datos');
      if (!hasEmployees) console.log('   ❌ No hay empleados en la base de datos');
      if (!hasFolders) console.log('   ❌ No hay carpetas en la base de datos');
      if (!correctFolderCount) console.log('   ❌ El contador de carpetas no muestra 800');
      
      console.log('\n🔧 Se necesita ejecutar el script de reestructuración de la base de datos.');
    }

  } catch (error) {
    console.error('❌ ERROR durante la prueba:', error.message);
    console.error('Detalles:', error);
  }
}

// Ejecutar la prueba
testOrganizedDatabaseService().then(() => {
  console.log('\n✅ Prueba completada');
}).catch((error) => {
  console.error('\n❌ La prueba falló:', error);
  process.exit(1);
});