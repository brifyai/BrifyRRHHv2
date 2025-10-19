/**
 * SCRIPT PARA EJECUTAR REESTRUCTURACIÓN DE BASE DE DATOS
 * 
 * Este script ejecuta la reestructuración completa de la base de datos
 * para separar correctamente empresas de empleados y crear las carpetas.
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeRestructure() {
  console.log('🔧 Iniciando reestructuración de la base de datos...\n');

  try {
    // Paso 1: Verificar estado actual
    console.log('1️⃣ Verificando estado actual...');
    const { data: currentCompanies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5);

    if (companiesError) {
      console.error('Error verificando companies:', companiesError);
      return;
    }

    console.log(`Estado actual - Tabla companies tiene ${currentCompanies.length} registros de muestra:`);
    currentCompanies.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name}`);
    });

    // Paso 2: Crear tabla temporal de empleados si no existe
    console.log('\n2️⃣ Creando tabla temporal de empleados...');
    
    // Primero, vamos a crear una tabla temporal con los datos actuales
    const { error: createTempError } = await supabase.rpc('create_employees_temp_table');
    
    if (createTempError) {
      console.log('La tabla temporal ya existe o no se pudo crear (esto es normal)');
    } else {
      console.log('✅ Tabla temporal creada');
    }

    // Paso 3: Mover datos de companies a employees_temp
    console.log('\n3️⃣ Moviendo datos de companies a employees_temp...');
    
    // Extraer los datos actuales de companies (que son realmente empleados)
    const { data: employeeData, error: fetchError } = await supabase
      .from('companies')
      .select('*');

    if (fetchError) {
      console.error('Error extrayendo datos de companies:', fetchError);
      return;
    }

    console.log(`Se encontraron ${employeeData.length} registros para mover`);

    // Transformar los datos a formato de empleado
    const employeesToInsert = employeeData.map((emp, index) => ({
      first_name: emp.name.replace('Empleado ', '').split(' ')[0] || `Empleado${index + 1}`,
      last_name: 'Apellido',
      employee_id: `EMP${String(index + 1).padStart(4, '0')}`,
      email: `empleado${index + 1}@empresa.com`,
      position: 'Empleado',
      department: 'General',
      company_id: null, // Se asignará después
      status: 'active',
      created_at: emp.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insertar en la tabla de empleados
    const { error: insertError } = await supabase
      .from('employees')
      .insert(employeesToInsert);

    if (insertError) {
      console.error('Error insertando empleados:', insertError);
      return;
    }

    console.log(`✅ Se insertaron ${employeesToInsert.length} empleados`);

    // Paso 4: Crear empresas reales
    console.log('\n4️⃣ Creando empresas reales...');
    
    const realCompanies = [
      { name: 'Copec', industry: 'Energía', description: 'Empresa de energía y combustibles' },
      { name: 'Falabella', industry: 'Retail', description: 'Tienda por departamentos' },
      { name: 'Cencosud', industry: 'Retail', description: 'Grupo de retail' },
      { name: 'Latam Airlines', industry: 'Aviación', description: 'Aerolínea' },
      { name: 'Entel', industry: 'Telecomunicaciones', description: 'Empresa de telecomunicaciones' },
      { name: 'Movistar', industry: 'Telecomunicaciones', description: 'Empresa de telecomunicaciones' },
      { name: 'Banco de Chile', industry: 'Banca', description: 'Banco comercial' },
      { name: 'Banco Santander', industry: 'Banca', description: 'Banco comercial' },
      { name: 'Codelco', industry: 'Minería', description: 'Empresa minera del estado' },
      { name: 'BHP', industry: 'Minería', description: 'Empresa minera privada' },
      { name: 'Andes Iron', industry: 'Minería', description: 'Proyecto minero' },
      { name: 'Aguas Andinas', industry: 'Servicios', description: 'Empresa de agua potable' },
      { name: 'Colbún', industry: 'Energía', description: 'Empresa de generación eléctrica' },
      { name: 'Enel', industry: 'Energía', description: 'Empresa de energía' },
      { name: 'Sodimac', industry: 'Retail', description: 'Tienda de mejoras para el hogar' },
      { name: 'Lider', industry: 'Retail', description: 'Supermercado' }
    ];

    const { data: insertedCompanies, error: companiesInsertError } = await supabase
      .from('companies')
      .insert(realCompanies)
      .select();

    if (companiesInsertError) {
      console.error('Error insertando empresas:', companiesInsertError);
      return;
    }

    console.log(`✅ Se crearon ${insertedCompanies.length} empresas reales`);

    // Paso 5: Asignar empleados a empresas
    console.log('\n5️⃣ Asignando empleados a empresas...');
    
    // Distribuir empleados equitativamente entre empresas
    const employeesPerCompany = Math.floor(employeesToInsert.length / insertedCompanies.length);
    
    for (let i = 0; i < insertedCompanies.length; i++) {
      const company = insertedCompanies[i];
      const startIndex = i * employeesPerCompany;
      const endIndex = i === insertedCompanies.length - 1 ? employeesToInsert.length : (i + 1) * employeesPerCompany;
      
      const employeesForCompany = employeesToInsert.slice(startIndex, endIndex);
      
      // Asignar company_id a estos empleados
      const employeeIds = employeesForCompany.map((_, index) => startIndex + index + 1);
      
      const { error: updateError } = await supabase
        .from('employees')
        .update({ company_id: company.id })
        .in('id', employeeIds);

      if (updateError) {
        console.error(`Error asignando empleados a ${company.name}:`, updateError);
      } else {
        console.log(`✅ ${employeesForCompany.length} empleados asignados a ${company.name}`);
      }
    }

    // Paso 6: Crear carpetas para cada empleado
    console.log('\n6️⃣ Creando carpetas para cada empleado...');
    
    const { data: allEmployees, error: fetchEmployeesError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_id');

    if (fetchEmployeesError) {
      console.error('Error obteniendo empleados:', fetchEmployeesError);
      return;
    }

    const foldersToCreate = allEmployees.map(employee => ({
      name: `Carpeta ${employee.first_name} ${employee.last_name}`,
      employee_id: employee.id,
      description: `Carpeta personal de ${employee.first_name} ${employee.last_name}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error: foldersError } = await supabase
      .from('folders')
      .insert(foldersToCreate);

    if (foldersError) {
      console.error('Error creando carpetas:', foldersError);
      return;
    }

    console.log(`✅ Se crearon ${foldersToCreate.length} carpetas`);

    // Paso 7: Verificación final
    console.log('\n7️⃣ Verificación final...');
    
    const { count: companiesCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    const { count: employeesCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });

    const { count: foldersCount } = await supabase
      .from('folders')
      .select('*', { count: 'exact', head: true });

    console.log('\n📊 RESULTADO FINAL:');
    console.log('====================');
    console.log(`🏢 Empresas: ${companiesCount}`);
    console.log(`👥 Empleados: ${employeesCount}`);
    console.log(`📁 Carpetas: ${foldersCount}`);

    if (companiesCount === 16 && employeesCount === 800 && foldersCount === 800) {
      console.log('\n🎉 ¡REESTRUCTURACIÓN COMPLETADA CON ÉXITO!');
      console.log('✅ La base de datos ahora está organizada correctamente');
      console.log('✅ El contador de carpetas debería mostrar 800');
    } else {
      console.log('\n⚠️ La reestructuración tuvo algunos problemas');
    }

  } catch (error) {
    console.error('❌ ERROR durante la reestructuración:', error);
  }
}

// Ejecutar la reestructuración
executeRestructure().then(() => {
  console.log('\n✅ Proceso de reestructuración finalizado');
}).catch((error) => {
  console.error('\n❌ La reestructuración falló:', error);
  process.exit(1);
});