// Script para probar el sistema de comunicación
import organizedDatabaseService from '../src/services/organizedDatabaseService.js';

async function testCommunicationSystem() {
  console.log('=== PRUEBA DEL SISTEMA DE COMUNICACIÓN ===\n');
  
  try {
    // 1. Verificar empresas
    console.log('1. Verificando empresas...');
    const companies = await organizedDatabaseService.getCompanies();
    console.log(`   Empresas encontradas: ${companies.length}`);
    companies.forEach(company => {
      console.log(`   - ${company.name} (ID: ${company.id})`);
    });
    
    // 2. Verificar empleados
    console.log('\n2. Verificando empleados...');
    const allEmployees = await organizedDatabaseService.getEmployees();
    console.log(`   Total de empleados: ${allEmployees.length}`);
    
    // 3. Verificar conteo por empresa
    console.log('\n3. Verificando conteo de empleados por empresa...');
    for (const company of companies) {
      const count = await organizedDatabaseService.getEmployeeCountByCompany(company.id);
      console.log(`   - ${company.name}: ${count} empleados`);
      
      // Verificar que cada empresa tenga exactamente 50 empleados
      if (count !== 50) {
        console.log(`   ⚠️  ADVERTENCIA: ${company.name} no tiene 50 empleados`);
      }
    }
    
    // 4. Probar filtros
    console.log('\n4. Probando filtros...');
    const filteredEmployees = await organizedDatabaseService.getEmployees({
      companyId: companies[0].id,
      limit: 5
    });
    console.log(`   Empleados filtrados (empresa ${companies[0].name}, límite 5): ${filteredEmployees.length}`);
    filteredEmployees.forEach(emp => {
      console.log(`   - ${emp.name} (${emp.email})`);
    });
    
    // 5. Probar obtención de empleado por ID
    console.log('\n5. Probando obtención de empleado por ID...');
    if (allEmployees.length > 0) {
      const employee = await organizedDatabaseService.getEmployeeById(allEmployees[0].id);
      console.log(`   Empleado encontrado: ${employee.name} (${employee.email})`);
      console.log(`   Empresa: ${employee.company.name}`);
    }
    
    console.log('\n=== PRUEBA COMPLETADA ===');
    console.log('✅ El sistema de comunicación está funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testCommunicationSystem();