// Script para inicializar empleados (50 por empresa)
// Este script se ejecuta desde el directorio raíz del proyecto

import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
import { config } from 'dotenv';
config();

// Configurar cliente de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Por favor asegúrate de tener REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en tu .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Nombres y apellidos comunes en Chile
const firstNames = [
  'Camila', 'Patricio', 'Víctor', 'Graciela', 'Jorge', 'Ricardo', 'Felipe', 'Arturo', 
  'Valentina', 'Isabel', 'César', 'Oscar', 'Carolina', 'Rodrigo', 'Francisco', 
  'Miguel', 'Alejandro', 'Daniela', 'Romina', 'Silvana', 'Guillermo', 'Fernanda', 
  'Claudia', 'Teresa', 'Víctor', 'Cristian', 'Diego', 'Natalia', 'Luis', 'Karina',
  'Andrés', 'Marcela', 'Verónica', 'Roberto', 'Tamara', 'Danielle', 'Macarena',
  'Sebastián', 'Pablo', 'Eduardo', 'Fernando', 'Constanza', 'Paulina', 'Catalina',
  'Ignacio', 'Renata', 'Matías', 'Camilo', 'Andrea', 'Nicole', 'José', 'Manuel'
];

const lastNames = [
  'Gutiérrez', 'Castro', 'Vargas', 'Reyes', 'Sepúlveda', 'Henríquez', 'Miranda',
  'López', 'Pizarro', 'Villarroel', 'Ramos', 'Morales', 'Álvarez', 'Cortés',
  'Rivera', 'Parra', 'Leiva', 'Silva', 'Fuentes', 'Zúñiga', 'Díaz', 'Muñoz',
  'Romero', 'Guzmán', 'Moraga', 'Contreras', 'Herrera', 'Roas', 'Aguilera',
  'Pérez', 'Sánchez', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez',
  'García', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno'
];

const regions = [
  'Región de Tarapacá', 'Región de Antofagasta', 'Región de Atacama', 
  'Región de Coquimbo', 'Región de Valparaíso', 
  'Región del Libertador General Bernardo O\'Higgins', 'Región del Maule', 
  'Región de Ñuble', 'Región del Biobío', 'Región de La Araucanía', 
  'Región de Los Ríos', 'Región de Los Lagos', 
  'Región Aysén del General Carlos Ibáñez del Campo', 
  'Región de Magallanes y de la Antártica Chilena', 'Región Metropolitana'
];

const departments = [
  'Operaciones', 'TI', 'Seguridad', 'Producción', 'RRHH', 'Administración',
  'Planificación', 'Mantenimiento', 'Servicio al Cliente', 'Logística',
  'Investigación y Desarrollo', 'Contabilidad', 'Finanzas', 'Tesorería',
  'Marketing', 'Ventas', 'Auditoría', 'Legal', 'Calidad', 'Compras'
];

const levels = [
  'Asistente', 'Especialista', 'Supervisor', 'Coordinador', 
  'Jefatura', 'Gerente', 'Director', 'Operario'
];

const positions = [
  'Jefe de Operaciones', 'Desarrollador', 'Supervisor de Seguridad',
  'Jefe de Producción', 'Reclutador', 'Especialista en Seguridad',
  'Técnico de Soporte', 'Operario de Producción', 'Coordinador Administrativo',
  'Planificador', 'Administrativo', 'Gerente de Mantenimiento',
  'Ejecutivo de Servicio', 'Supervisor de Logística', 'Desarrollador de Producto',
  'Asistente Contable', 'Asistente de Calidad', 'Jefe Administrativo',
  'Jefe de Mantenimiento', 'Coordinador Administrativo', 'Gerente Contable',
  'Gerente Financiero', 'Asistente de Mantenimiento', 'Asistente Financiero',
  'Jefe de Calidad', 'Jefe de RRHH', 'Supervisor de Operaciones',
  'Analista de Tesorería', 'Supervisor de Producción', 'Especialista en Marketing',
  'Ejecutivo de Ventas', 'Jefe de Tesorería', 'Contador', 'Asistente de Auditoría',
  'Especialista en Cumplimiento', 'Asistente de Mantenimiento', 'Jefe de Logística',
  'Coordinador de Marketing', 'Gerente de Auditoría', 'Gerente Legal',
  'Gerente de Ventas', 'Asistente de Tesorería', 'Auditor Interno'
];

const workModes = ['Presencial', 'Híbrido', 'Remoto'];
const contractTypes = ['Indefinido', 'Plazo Fijo', 'Honorarios'];

// Generar un nombre aleatorio
function generateRandomName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

// Generar un email basado en el nombre y empresa
function generateEmail(name, companyName) {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  const cleanCompany = companyName.toLowerCase().replace(/\s+/g, '');
  return `${cleanName}@${cleanCompany}.cl`;
}

// Generar un teléfono aleatorio
function generatePhone() {
  const number = Math.floor(Math.random() * 10000000);
  return `+56 9 ${number.toString().padStart(8, '0')}`;
}

// Generar datos de empleado aleatorios
function generateEmployeeData(companyId, companyName) {
  const name = generateRandomName();
  return {
    company_id: companyId,
    name: name,
    email: generateEmail(name, companyName),
    phone: generatePhone(),
    region: regions[Math.floor(Math.random() * regions.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    level: levels[Math.floor(Math.random() * levels.length)],
    position: positions[Math.floor(Math.random() * positions.length)],
    work_mode: workModes[Math.floor(Math.random() * workModes.length)],
    contract_type: contractTypes[Math.floor(Math.random() * contractTypes.length)],
    is_active: true,
    has_subordinates: Math.random() > 0.7
  };
}

// Asegurar que cada empresa tenga exactamente 50 empleados
async function ensure50EmployeesPerCompany() {
  try {
    console.log('🚀 Iniciando proceso para asegurar 50 empleados por empresa...');
    
    // Obtener todas las empresas
    console.log('📊 Obteniendo lista de empresas...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (companiesError) throw companiesError;
    
    console.log(`🏢 Encontradas ${companies.length} empresas`);
    
    // Para cada empresa, asegurar que tenga exactamente 50 empleados
    for (const company of companies) {
      console.log(`\n🏢 Procesando empresa: ${company.name}`);
      
      // Obtener el conteo actual de empleados
      const { count: currentCount, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id);
      
      if (countError) throw countError;
      
      console.log(`   📊 Empleados actuales: ${currentCount}`);
      
      // Si ya hay 50 empleados, continuar con la siguiente empresa
      if (currentCount === 50) {
        console.log(`   ✅ Empresa ${company.name} ya tiene exactamente 50 empleados`);
        continue;
      }
      
      // Si hay menos de 50, generar los que faltan
      if (currentCount < 50) {
        const employeesToAdd = 50 - currentCount;
        console.log(`   ➕ Agregando ${employeesToAdd} empleados a ${company.name}`);
        
        const employeesData = [];
        for (let i = 0; i < employeesToAdd; i++) {
          employeesData.push(generateEmployeeData(company.id, company.name));
        }
        
        // Insertar empleados en lotes
        for (let i = 0; i < employeesData.length; i += 100) {
          const batch = employeesData.slice(i, i + 100);
          const { error: insertError } = await supabase
            .from('employees')
            .insert(batch);
          
          if (insertError) throw insertError;
        }
        
        console.log(`   ✅ Agregados ${employeesToAdd} empleados a ${company.name}`);
      }
      // Si hay más de 50, eliminar los excedentes
      else if (currentCount > 50) {
        const employeesToRemove = currentCount - 50;
        console.log(`   ➖ Eliminando ${employeesToRemove} empleados de ${company.name}`);
        
        // Obtener IDs de empleados para eliminar (aleatoriamente)
        const { data: employeesToDelete, error: selectError } = await supabase
          .from('employees')
          .select('id')
          .eq('company_id', company.id)
          .limit(employeesToRemove);
        
        if (selectError) throw selectError;
        
        const employeeIds = employeesToDelete.map(emp => emp.id);
        
        const { error: deleteError } = await supabase
          .from('employees')
          .delete()
          .in('id', employeeIds);
        
        if (deleteError) throw deleteError;
        
        console.log(`   ✅ Eliminados ${employeesToRemove} empleados de ${company.name}`);
      }
    }
    
    console.log('\n🎉 Proceso completado - todas las empresas tienen 50 empleados');
    
    // Verificar los resultados finales
    console.log('\n🔍 Verificando resultados finales:');
    const { data: finalCompanies, error: finalError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (finalError) throw finalError;
    
    for (const company of finalCompanies) {
      const { count: finalCount, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id);
      
      if (countError) throw countError;
      
      console.log(`   ${company.name}: ${finalCount} empleados ${finalCount === 50 ? '✅' : '❌'}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error asegurando 50 empleados por empresa:', error);
    throw error;
  }
}

// Ejecutar la función principal
async function main() {
  try {
    await ensure50EmployeesPerCompany();
    console.log('\n✨ ¡Proceso finalizado exitosamente!');
  } catch (error) {
    console.error('\n💥 Error en el proceso:', error.message);
    process.exit(1);
  }
}

main();