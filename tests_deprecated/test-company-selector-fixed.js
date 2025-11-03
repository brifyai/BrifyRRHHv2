import databaseEmployeeService from './src/services/databaseEmployeeService.js';

async function testCompanySelectorFixed() {
  console.log('🔍 Probando selector de empresas corregido...\n');

  try {
    // 1. Probar getCompanies()
    console.log('1. Probando getCompanies()...');
    const companies = await databaseEmployeeService.getCompanies();
    console.log(`✅ Se encontraron ${companies.length} empresas:`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (${company.industry}) - ${company.location}`);
    });

    // 2. Probar getEmployeeCountByCompany() para cada empresa
    console.log('\n2. Probando getEmployeeCountByCompany()...');
    for (const company of companies) {
      const count = await databaseEmployeeService.getEmployeeCountByCompany(company.id);
      console.log(`   ${company.name}: ${count} empleados`);
    }

    // 3. Probar getMessageStatsByCompany() para algunas empresas
    console.log('\n3. Probando getMessageStatsByCompany()...');
    const testCompanies = companies.slice(0, 3); // Probamos las primeras 3
    for (const company of testCompanies) {
      const stats = await databaseEmployeeService.getMessageStatsByCompany(company.id);
      console.log(`   ${company.name}:`);
      console.log(`     - Programados: ${stats.scheduled}`);
      console.log(`     - Borradores: ${stats.draft}`);
      console.log(`     - Enviados: ${stats.sent}`);
      console.log(`     - Leídos: ${stats.read}`);
      console.log(`     - Total: ${stats.total}`);
    }

    // 4. Probar getEmployees() con filtro de empresa
    console.log('\n4. Probando getEmployees() con filtro...');
    const firstCompany = companies[0];
    const employees = await databaseEmployeeService.getEmployees({ companyId: firstCompany.id });
    console.log(`   ${firstCompany.name}: ${employees.length} empleados encontrados`);

    console.log('\n✅ Todas las pruebas completadas exitosamente');
    console.log(`📊 Resumen: ${companies.length} empresas disponibles para el selector`);

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

// Ejecutar prueba
testCompanySelectorFixed();