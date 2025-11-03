import { supabase } from './src/lib/supabaseClient.js';

/**
 * Script para verificar cómo se muestran los empleados con sus empresas en el componente
 */

async function testEmployeeDisplay() {
  console.log('🔍 Verificando visualización de empleados con empresas...');

  try {
    // 1. Verificar la consulta que usa el servicio organizedDatabaseService
    console.log('\n📋 Probando consulta con relación de empresas...');
    const { data: employeesWithCompanies, error: employeesError } = await supabase
      .from('employees')
      .select(`
        *,
        companies:company_id (
          id,
          name,
          industry
        )
      `)
      .limit(5);

    if (employeesError) {
      console.error('Error en consulta con relación:', employeesError);
      return;
    }

    console.log('✅ Consulta con relación exitosa');
    console.log('Estructura de datos recibida:');
    if (employeesWithCompanies && employeesWithCompanies.length > 0) {
      const sample = employeesWithCompanies[0];
      console.log('Campos:', Object.keys(sample));
      console.log('¿Tiene companies?', !!sample.companies);
      if (sample.companies) {
        console.log('Datos de empresa:', sample.companies);
      }
    }

    // 2. Verificar datos específicos de los primeros empleados
    console.log('\n👥 Primeros 5 empleados con sus empresas:');
    employeesWithCompanies.forEach((employee, index) => {
      console.log(`${index + 1}. ${employee.first_name} ${employee.last_name}`);
      console.log(`   Email: ${employee.email || 'N/A'}`);
      console.log(`   Empresa: ${employee.companies?.name || 'SIN EMPRESA'}`);
      console.log(`   ID Empresa: ${employee.company_id || 'N/A'}`);
      console.log(`   Departamento: ${employee.department || 'N/A'}`);
      console.log('');
    });

    // 3. Verificar consulta directa sin relación
    console.log('🔍 Verificando consulta directa sin relación...');
    const { data: employeesDirect, error: directError } = await supabase
      .from('employees')
      .select('*')
      .limit(3);

    if (directError) {
      console.error('Error en consulta directa:', directError);
      return;
    }

    console.log('Datos directos (primeros 3):');
    employeesDirect.forEach((employee, index) => {
      console.log(`${index + 1}. ${employee.first_name} ${employee.last_name}`);
      console.log(`   company_id: ${employee.company_id || 'NULL'}`);
      console.log('');
    });

    // 4. Verificar si hay algún problema con el servicio
    console.log('\n🔧 Verificando servicio organizedDatabaseService...');
    try {
      const organizedDatabaseService = await import('./src/services/organizedDatabaseService.js');
      const employees = await organizedDatabaseService.default.getEmployees();
      
      console.log(`✅ Servicio funcionó, devolvió ${employees.length} empleados`);
      
      if (employees.length > 0) {
        const sample = employees[0];
        console.log('Estructura del servicio:');
        console.log('Campos:', Object.keys(sample));
        console.log('¿Tiene company?', !!sample.company);
        console.log('¿Tiene companies?', !!sample.companies);
        
        if (sample.company) {
          console.log('Datos de company:', sample.company);
        } else if (sample.companies) {
          console.log('Datos de companies:', sample.companies);
        }
      }
    } catch (serviceError) {
      console.error('❌ Error en el servicio:', serviceError);
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

// Ejecutar verificación
testEmployeeDisplay()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la verificación:', error);
    process.exit(1);
  });