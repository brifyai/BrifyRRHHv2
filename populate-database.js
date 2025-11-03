/**
 * SCRIPT PARA POBLAR LA BASE DE DATOS CON ESTRUCTURA CORRECTA
 * 
 * Este script crea y pobla la base de datos con:
 * - 16 empresas reales
 * - 800 empleados distribuidos entre empresas
 * - 800 carpetas (una por empleado)
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateDatabase() {
  console.log('🚀 Iniciando población de la base de datos con estructura correcta...\n');

  try {
    // Paso 1: Insertar empresas reales
    console.log('1️⃣ Insertando empresas reales...');
    
    const realCompanies = [
      { name: 'Copec', industry: 'Energía', description: 'Empresa de energía y combustibles', website: 'https://www.copec.cl' },
      { name: 'Falabella', industry: 'Retail', description: 'Tienda por departamentos', website: 'https://www.falabella.com' },
      { name: 'Cencosud', industry: 'Retail', description: 'Grupo de retail', website: 'https://www.cencosud.cl' },
      { name: 'Latam Airlines', industry: 'Aviación', description: 'Aerolínea', website: 'https://www.latam.com' },
      { name: 'Entel', industry: 'Telecomunicaciones', description: 'Empresa de telecomunicaciones', website: 'https://www.entel.cl' },
      { name: 'Movistar', industry: 'Telecomunicaciones', description: 'Empresa de telecomunicaciones', website: 'https://www.movistar.cl' },
      { name: 'Banco de Chile', industry: 'Banca', description: 'Banco comercial', website: 'https://www.bancochile.cl' },
      { name: 'Banco Santander', industry: 'Banca', description: 'Banco comercial', website: 'https://www.santander.cl' },
      { name: 'Codelco', industry: 'Minería', description: 'Empresa minera del estado', website: 'https://www.codelco.cl' },
      { name: 'BHP', industry: 'Minería', description: 'Empresa minera privada', website: 'https://www.bhp.com' },
      { name: 'Andes Iron', industry: 'Minería', description: 'Proyecto minero', website: 'https://www.andesiron.cl' },
      { name: 'Aguas Andinas', industry: 'Servicios', description: 'Empresa de agua potable', website: 'https://www.aguasandinas.cl' },
      { name: 'Colbún', industry: 'Energía', description: 'Empresa de generación eléctrica', website: 'https://www.colbun.cl' },
      { name: 'Enel', industry: 'Energía', description: 'Empresa de energía', website: 'https://www.enel.cl' },
      { name: 'Sodimac', industry: 'Retail', description: 'Tienda de mejoras para el hogar', website: 'https://www.sodimac.cl' },
      { name: 'Lider', industry: 'Retail', description: 'Supermercado', website: 'https://www.lider.cl' }
    ];

    const { data: insertedCompanies, error: companiesError } = await supabase
      .from('companies')
      .insert(realCompanies)
      .select();

    if (companiesError) {
      console.error('Error insertando empresas:', companiesError);
      return;
    }

    console.log(`✅ Se insertaron ${insertedCompanies.length} empresas reales`);

    // Paso 2: Generar e insertar 800 empleados
    console.log('\n2️⃣ Generando e insertando 800 empleados...');
    
    const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Sofía', 'Diego', 'Isabella', 
                       'Andrés', 'Valentina', 'Francisco', 'Camila', 'Javier', 'Paula', 'Roberto', 'Daniela', 
                       'Sergio', 'Fernanda', 'Martín', 'Constanza', 'Pablo', 'Ignacio', 'Sebastián', 'Javiera',
                       'Gonzalo', 'Victoria', 'Ricardo', 'Catalina', 'Eduardo', ' Alejandra', 'Alberto', 'Macarena',
                       'Hugo', 'Beatriz', 'Oscar', 'Teresa', 'Ramón', 'Lucía', 'Antonio', 'Patricia', 'Manuel',
                       'Cecilia', 'Jorge', 'Verónica', 'Raúl', 'Claudia', 'Fernando', 'Mónica', 'Rubén', 'Angélica'];

    const lastNames = ['González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Silva', 'Contreras', 'López', 'Martínez',
                      'Rodríguez', 'Araya', 'Fuentes', 'Torres', 'Valencia', 'Castillo', 'Espinoza', 'Rivera', 'Orellana',
                      'Vargas', 'Zúñiga', 'Mendoza', 'Alvarez', 'Reyes', 'Herrera', 'Sáez', 'Fernández', 'Gutiérrez',
                      'Leiva', 'Morales', 'Cortés', 'Bravo', 'Véliz', 'Pino', 'Salazar', 'Carrasco', 'Navarro', 'Cifuentes'];

    const positions = ['Gerente', 'Analista', 'Supervisor', 'Coordinador', 'Ejecutivo', 'Asistente', 'Técnico', 'Especialista', 'Consultor', 'Administrativo'];
    const departments = ['Ventas', 'Marketing', 'Finanzas', 'Recursos Humanos', 'Operaciones', 'TI', 'Logística', 'Calidad', 'Compras', 'Legal'];

    const employeesToInsert = [];
    
    for (let i = 1; i <= 800; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const companyIndex = (i - 1) % insertedCompanies.length;
      
      employeesToInsert.push({
        first_name: firstName,
        last_name: lastName,
        employee_id: `EMP${String(i).padStart(4, '0')}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@empresa.com`,
        position: position,
        department: department,
        company_id: insertedCompanies[companyIndex].id,
        status: 'active'
      });
    }

    // Insertar empleados en lotes para evitar timeouts
    const batchSize = 50;
    let insertedEmployeesCount = 0;
    
    for (let i = 0; i < employeesToInsert.length; i += batchSize) {
      const batch = employeesToInsert.slice(i, i + batchSize);
      const { error: batchError } = await supabase
        .from('employees')
        .insert(batch);
      
      if (batchError) {
        console.error(`Error insertando lote ${i + 1}-${Math.min(i + batchSize, employeesToInsert.length)}:`, batchError);
      } else {
        insertedEmployeesCount += batch.length;
        console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(employeesToInsert.length/batchSize)} insertado (${insertedEmployeesCount}/800 empleados)`);
      }
    }

    console.log(`✅ Se insertaron ${insertedEmployeesCount} empleados`);

    // Paso 3: Obtener todos los empleados para crear carpetas
    console.log('\n3️⃣ Obteniendo empleados para crear carpetas...');
    
    const { data: allEmployees, error: fetchEmployeesError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_id, companies:company_id(name)');

    if (fetchEmployeesError) {
      console.error('Error obteniendo empleados:', fetchEmployeesError);
      return;
    }

    console.log(`✅ Se obtuvieron ${allEmployees.length} empleados`);

    // Paso 4: Crear carpetas para cada empleado
    console.log('\n4️⃣ Creando carpetas para cada empleado...');
    
    const foldersToCreate = allEmployees.map(employee => ({
      name: `Carpeta ${employee.first_name} ${employee.last_name}`,
      employee_id: employee.id,
      description: `Carpeta personal de ${employee.first_name} ${employee.last_name} - ${employee.companies?.name || 'Sin empresa'}`,
      path: `/empleados/${employee.employee_id}`
    }));

    // Insertar carpetas en lotes
    let insertedFoldersCount = 0;
    
    for (let i = 0; i < foldersToCreate.length; i += batchSize) {
      const batch = foldersToCreate.slice(i, i + batchSize);
      const { error: batchError } = await supabase
        .from('folders')
        .insert(batch);
      
      if (batchError) {
        console.error(`Error insertando lote de carpetas ${i + 1}-${Math.min(i + batchSize, foldersToCreate.length)}:`, batchError);
      } else {
        insertedFoldersCount += batch.length;
        console.log(`✅ Lote de carpetas ${Math.floor(i/batchSize) + 1}/${Math.ceil(foldersToCreate.length/batchSize)} insertado (${insertedFoldersCount}/800 carpetas)`);
      }
    }

    console.log(`✅ Se crearon ${insertedFoldersCount} carpetas`);

    // Paso 5: Verificación final
    console.log('\n5️⃣ Verificación final...');
    
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

    // Mostrar distribución de empleados por empresa
    console.log('\n📈 Distribución de empleados por empresa:');
    for (const company of insertedCompanies) {
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id);
      console.log(`  ${company.name}: ${count} empleados`);
    }

    if (companiesCount === 16 && employeesCount === 800 && foldersCount === 800) {
      console.log('\n🎉 ¡POBLACIÓN COMPLETADA CON ÉXITO!');
      console.log('✅ La base de datos ahora está organizada correctamente');
      console.log('✅ El contador de carpetas debería mostrar 800');
      console.log('✅ El problema original ha sido resuelto');
      console.log('\n🚀 Ahora puedes probar la aplicación en http://localhost:3003/panel-principal');
    } else {
      console.log('\n⚠️ La población tuvo algunos problemas');
      console.log(`Esperado: 16 empresas, ${employeesCount === 800 ? '✅' : '❌'} 800 empleados, ${foldersCount === 800 ? '✅' : '❌'} 800 carpetas`);
    }

  } catch (error) {
    console.error('❌ ERROR durante la población:', error);
  }
}

// Ejecutar la población
populateDatabase().then(() => {
  console.log('\n✅ Proceso de población finalizado');
}).catch((error) => {
  console.error('\n❌ La población falló:', error);
  process.exit(1);
});
