import { supabase } from './src/lib/supabaseClient.js';

/**
 * Script para verificar y asignar empresas a empleados
 * Objetivo: Asegurar que los empleados tengan empresas asignadas (50 por empresa)
 */

async function checkEmployeesCompanies() {
  console.log('🔍 Verificando asignación de empleados a empresas...');

  try {
    // 1. Verificar empresas disponibles
    console.log('\n📋 Verificando empresas disponibles...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .order('name');

    if (companiesError) {
      console.error('Error obteniendo empresas:', companiesError);
      return;
    }

    console.log(`Encontradas ${companies.length} empresas:`);
    companies.forEach(company => {
      console.log(`- ${company.name} (ID: ${company.id})`);
    });

    // 2. Verificar empleados actuales
    console.log('\n👥 Verificando empleados actuales...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_id, company_id, email, position, department')
      .order('last_name');

    if (employeesError) {
      console.error('Error obteniendo empleados:', employeesError);
      return;
    }

    console.log(`Encontrados ${employees.length} empleados en total`);

    // 3. Analizar asignación actual
    const employeesByCompany = {};
    const employeesWithoutCompany = [];

    employees.forEach(employee => {
      if (employee.company_id) {
        if (!employeesByCompany[employee.company_id]) {
          employeesByCompany[employee.company_id] = [];
        }
        employeesByCompany[employee.company_id].push(employee);
      } else {
        employeesWithoutCompany.push(employee);
      }
    });

    console.log('\n📊 Distribución actual de empleados por empresa:');
    companies.forEach(company => {
      const count = employeesByCompany[company.id] ? employeesByCompany[company.id].length : 0;
      console.log(`- ${company.name}: ${count} empleados`);
    });

    console.log(`\n⚠️ Empleados sin empresa asignada: ${employeesWithoutCompany.length}`);

    // 4. Mostrar detalles de empleados sin empresa
    if (employeesWithoutCompany.length > 0) {
      console.log('\n📋 Lista de empleados sin empresa:');
      employeesWithoutCompany.slice(0, 10).forEach(employee => {
        console.log(`- ${employee.first_name} ${employee.last_name} (${employee.employee_id})`);
      });
      
      if (employeesWithoutCompany.length > 10) {
        console.log(`... y ${employeesWithoutCompany.length - 10} más`);
      }
    }

    // 5. Asignar empresas a empleados sin asignar
    if (employeesWithoutCompany.length > 0 && companies.length > 0) {
      console.log('\n🔧 Asignando empresas a empleados sin asignar...');
      await assignCompaniesToEmployees(employeesWithoutCompany, companies);
    }

    // 6. Verificar resultado final
    console.log('\n✅ Verificando resultado final...');
    await verifyFinalDistribution();

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

async function assignCompaniesToEmployees(employeesWithoutCompany, companies) {
  let targetEmployeesPerCompany = 50;
  let assignedCount = 0;

  // Primero, contar cuántos empleados tiene cada empresa actualmente
  const { data: currentEmployees } = await supabase
    .from('employees')
    .select('company_id');

  const currentCount = {};
  currentEmployees.forEach(emp => {
    if (emp.company_id) {
      currentCount[emp.company_id] = (currentCount[emp.company_id] || 0) + 1;
    }
  });

  // Ordenar empresas por cantidad actual de empleados (menor a mayor)
  const sortedCompanies = companies.sort((a, b) => {
    const countA = currentCount[a.id] || 0;
    const countB = currentCount[b.id] || 0;
    return countA - countB;
  });

  console.log('Distribución objetivo: 50 empleados por empresa');

  for (const employee of employeesWithoutCompany) {
    // Encontrar la empresa con menos empleados
    let targetCompany = sortedCompanies[0];
    
    for (const company of sortedCompanies) {
      const currentCount = employeesByCompanyCount[company.id] || 0;
      const targetCount = employeesByCompanyCount[targetCompany.id] || 0;
      
      if (currentCount < targetCount) {
        targetCompany = company;
      }
    }

    // Asignar empleado a la empresa
    const { error: updateError } = await supabase
      .from('employees')
      .update({ company_id: targetCompany.id })
      .eq('id', employee.id);

    if (updateError) {
      console.error(`Error asignando empleado ${employee.id} a empresa ${targetCompany.name}:`, updateError);
    } else {
      console.log(`✅ ${employee.first_name} ${employee.last_name} asignado a ${targetCompany.name}`);
      assignedCount++;
      
      // Actualizar contador
      employeesByCompanyCount[targetCompany.id] = (employeesByCompanyCount[targetCompany.id] || 0) + 1;
      
      // Reordenar si es necesario
      sortedCompanies.sort((a, b) => {
        const countA = employeesByCompanyCount[a.id] || 0;
        const countB = employeesByCompanyCount[b.id] || 0;
        return countA - countB;
      });
    }
  }

  console.log(`\n🎉 Se asignaron ${assignedCount} empleados a empresas`);
}

// Contador global para la función de asignación
let employeesByCompanyCount = {};

async function verifyFinalDistribution() {
  const { data: finalEmployees } = await supabase
    .from('employees')
    .select('company_id, companies:company_id (name)');

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name');

  const finalCount = {};
  finalEmployees.forEach(emp => {
    if (emp.company_id) {
      finalCount[emp.company_id] = (finalCount[emp.company_id] || 0) + 1;
    }
  });

  console.log('\n📊 Distribución final de empleados:');
  companies.forEach(company => {
    const count = finalCount[company.id] || 0;
    const status = count === 50 ? '✅' : count < 50 ? '⚠️' : '📈';
    console.log(`${status} ${company.name}: ${count} empleados`);
  });

  const totalEmployees = Object.values(finalCount).reduce((sum, count) => sum + count, 0);
  console.log(`\n📈 Total empleados asignados: ${totalEmployees}`);
}

// Ejecutar verificación
checkEmployeesCompanies()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la verificación:', error);
    process.exit(1);
  });