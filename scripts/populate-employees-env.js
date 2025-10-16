import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔧 Iniciando población de 800 empleados...');
console.log('📊 Usando configuración desde .env');

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno en .env');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

console.log('🔗 URL de Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Datos para generar empleados
const names = [
  'Camilo', 'Patricio', 'Víctor', 'Graciela', 'Jorge', 'Ricardo', 'Felipe', 'Arturo',
  'Valentina', 'Isabel', 'César', 'Oscar', 'Carolina', 'Rodrigo', 'Francisco', 'Miguel',
  'Alejandro', 'Daniela', 'Romina', 'Silvana', 'Guillermo', 'Fernanda', 'Claudia', 'Teresa',
  'Cristian', 'Diego', 'Natalia', 'Luis', 'Karina', 'Andrés', 'Marcela', 'Verónica',
  'Roberto', 'Tamara', 'Danielle', 'Macarena', 'Sebastián', 'Pablo', 'Eduardo', 'Matías',
  'Ignacio', 'Fernando', 'Martín', 'Benjamín', 'Vicente', 'Joaquín', 'Diego', 'Tomás'
];

const surnames = [
  'Gutiérrez', 'Castro', 'Vargas', 'Reyes', 'Sepúlveda', 'Henríquez', 'Miranda', 'López',
  'Pizarro', 'Villarroel', 'Ramos', 'Morales', 'Álvarez', 'Cortés', 'Rivera', 'Parra',
  'Leiva', 'Silva', 'Fuentes', 'Zúñiga', 'Díaz', 'Muñoz', 'Romero', 'Guzmán', 'Moraga',
  'Contreras', 'Herrera', 'Roas', 'Aguilera', 'Pérez', 'Sánchez', 'González', 'Rodríguez'
];

const departments = [
  'Operaciones', 'TI', 'Seguridad', 'Producción', 'RRHH', 'Administración',
  'Planificación', 'Mantenimiento', 'Servicio al Cliente', 'Logística',
  'Investigación y Desarrollo', 'Contabilidad', 'Finanzas', 'Tesorería',
  'Marketing', 'Ventas', 'Auditoría', 'Legal', 'Calidad', 'Compras'
];

const positions = [
  'Jefe de Operaciones', 'Desarrollador', 'Supervisor de Seguridad', 'Jefe de Producción',
  'Reclutador', 'Especialista en Seguridad', 'Técnico de Soporte', 'Operario de Producción',
  'Coordinador Administrativo', 'Planificador', 'Administrativo', 'Gerente de Mantenimiento',
  'Ejecutivo de Servicio', 'Supervisor de Logística', 'Desarrollador de Producto',
  'Asistente Contable', 'Asistente de Calidad', 'Jefe Administrativo', 'Jefe de Mantenimiento',
  'Coordinador Administrativo', 'Gerente Contable', 'Gerente Financiero', 'Asistente de Mantenimiento',
  'Asistente Financiero', 'Jefe de Calidad', 'Jefe de RRHH', 'Supervisor de Operaciones',
  'Analista de Tesorería', 'Supervisor de Producción', 'Especialista en Marketing',
  'Ejecutivo de Ventas', 'Jefe de Tesorería', 'Contador', 'Asistente de Auditoría',
  'Especialista en Cumplimiento', 'Asistente de Mantenimiento', 'Jefe de Logística',
  'Coordinador de Marketing', 'Gerente de Auditoría', 'Gerente Legal', 'Gerente de Ventas',
  'Asistente de Tesorería', 'Auditor Interno'
];

const regions = [
  'Región Metropolitana', 'Región de Valparaíso', 'Región del Biobío', 'Región de Araucanía',
  'Región de Los Lagos', 'Región de Antofagasta', 'Región de Coquimbo', 'Región de Los Ríos',
  'Región del Maule', 'Región de Tarapacá', 'Región de Atacama', 'Región de Ñuble',
  'Región de Aysén', 'Región de Magallanes', 'Región del Libertador O\'Higgins'
];

const workModes = ['Presencial', 'Híbrido', 'Remoto'];
const contractTypes = ['Indefinido', 'Plazo Fijo', 'Honorarios'];
const levels = ['Asistente', 'Especialista', 'Supervisor', 'Coordinador', 'Jefatura', 'Gerente', 'Director', 'Operario'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone() {
  return '+56 9 ' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

async function populateEmployees() {
  try {
    console.log('📊 Verificando estado actual...');
    
    // Obtener conteo actual
    const { count: currentCount, error: countError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error al contar empleados:', countError);
      return;
    }
    
    console.log(`📊 Empleados actuales: ${currentCount || 0}`);
    
    // Obtener empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (companiesError) {
      console.error('❌ Error al obtener empresas:', companiesError);
      return;
    }
    
    console.log(`🏢 Empresas encontradas: ${companies.length}`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
    });
    
    if (companies.length === 0) {
      console.error('❌ No hay empresas en la base de datos');
      return;
    }
    
    // Limpiar empleados existentes
    if (currentCount > 0) {
      console.log('🧹 Limpiando empleados existentes...');
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .neq('id', 0); // Eliminar todos
      
      if (deleteError) {
        console.error('❌ Error al limpiar empleados:', deleteError);
      } else {
        console.log('✅ Empleados existentes eliminados');
      }
    }
    
    // Generar empleados
    console.log('🚀 Generando 800 empleados...');
    const employeesPerCompany = Math.floor(800 / companies.length);
    let totalCreated = 0;
    
    for (const company of companies) {
      console.log(`📝 Creando ${employeesPerCompany} empleados para ${company.name}...`);
      
      for (let i = 0; i < employeesPerCompany; i++) {
        const name = getRandomElement(names);
        const surname = getRandomElement(surnames);
        const email = `${name.toLowerCase()}${surname.toLowerCase()}${company.id}${i}@company${company.id}.cl`;
        
        const employee = {
          company_id: company.id,
          name: `${name} ${surname}`,
          email: email,
          phone: generatePhone(),
          region: getRandomElement(regions),
          department: getRandomElement(departments),
          level: getRandomElement(levels),
          position: getRandomElement(positions),
          work_mode: getRandomElement(workModes),
          contract_type: getRandomElement(contractTypes),
          is_active: true,
          has_subordinates: Math.random() > 0.7
        };
        
        const { error: insertError } = await supabase
          .from('employees')
          .insert(employee);
        
        if (insertError) {
          console.error(`❌ Error al crear empleado ${i + 1}:`, insertError.message);
        } else {
          totalCreated++;
          if (totalCreated % 50 === 0) {
            console.log(`   ✅ Creados ${totalCreated} empleados hasta ahora...`);
          }
        }
      }
    }
    
    // Verificación final
    console.log('🔍 Verificando resultado final...');
    const { count: finalCount, error: finalCountError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (finalCountError) {
      console.error('❌ Error al verificar conteo final:', finalCountError);
    } else {
      console.log(`🎉 ÉXITO: Se crearon ${finalCount} empleados`);
      
      if (finalCount >= 800) {
        console.log('✅ Objetivo alcanzado: 800+ empleados creados');
        console.log('🎯 El contador de carpetas debería mostrar ahora 800');
      } else {
        console.log(`⚠️  Se esperaban 800 empleados, pero se crearon ${finalCount}`);
      }
    }
    
    // Mostrar muestra
    const { data: sample, error: sampleError } = await supabase
      .from('employees')
      .select('name, email, department, position')
      .limit(5);
    
    if (!sampleError && sample) {
      console.log('\n📋 Muestra de empleados creados:');
      sample.forEach((emp, index) => {
        console.log(`   ${index + 1}. ${emp.name} - ${emp.email}`);
        console.log(`      Depto: ${emp.department} | Cargo: ${emp.position}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack:', error.stack);
  }
}

populateEmployees();