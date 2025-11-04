#!/usr/bin/env node

/**
 * Script para poblar la base de datos con 800 empleados usando permisos de administrador
 * Este script usa el service role key para bypass RLS policies
 */

const { createClient } = require('@supabase/supabase-js');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Configuración de Supabase con SERVICE ROLE KEY (permisos de administrador)
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.1bemvXK8mHpvoA4djXmjtzrtDGFqBY4VBb62QQKuyhw';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Datos para generación
const firstNames = [
  'Camila', 'Patricio', 'Víctor', 'Graciela', 'Jorge', 'Ricardo', 'Felipe', 'Arturo', 
  'Valentina', 'Isabel', 'César', 'Oscar', 'Carolina', 'Rodrigo', 'Francisco', 
  'Miguel', 'Alejandro', 'Daniela', 'Romina', 'Silvana', 'Guillermo', 'Fernanda', 
  'Claudia', 'Teresa', 'Víctor', 'Cristian', 'Diego', 'Natalia', 'Luis', 'Karina',
  'Andrés', 'Marcela', 'Verónica', 'Roberto', 'Tamara', 'Danielle', 'Macarena',
  'Sebastián', 'Pablo', 'Eduardo', 'Fernando', 'Constanza', 'Paulina', 'Catalina',
  'Ignacio', 'Renata', 'Matías', 'Camilo', 'Andrea', 'Nicole', 'José', 'Manuel',
  'María José', 'Francisca', 'Javiera', 'Constanza', 'Sofía', 'Isidora', 'Martina',
  'Benjamín', 'Vicente', 'Matías', 'Sebastián', 'Joaquín', 'Diego', 'Tomás', 'Agustín'
];

const lastNames = [
  'Gutiérrez', 'Castro', 'Vargas', 'Reyes', 'Sepúlveda', 'Henríquez', 'Miranda',
  'López', 'Pizarro', 'Villarroel', 'Ramos', 'Morales', 'Álvarez', 'Cortés',
  'Rivera', 'Parra', 'Leiva', 'Silva', 'Fuentes', 'Zúñiga', 'Díaz', 'Muñoz',
  'Romero', 'Guzmán', 'Moraga', 'Contreras', 'Herrera', 'Roas', 'Aguilera',
  'Pérez', 'Sánchez', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez',
  'García', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno',
  'Torres', 'Bravo', 'Silva', 'Valenzuela', 'Castillo', 'Espinoza', 'Soto',
  'Valdés', 'Fuentes', 'Toro', 'Leiva', 'Araya', 'Rojas', 'Paredes'
];

const regions = [
  'Región Metropolitana', 'Región de Valparaíso', 'Región del Biobío', 'Región de Araucanía',
  'Región de Los Lagos', 'Región de Antofagasta', 'Región de Coquimbo', 'Región de Los Ríos',
  'Región del Maule', 'Región de Tarapacá', 'Región de Atacama', 'Región de Ñuble',
  'Región de Aysén', 'Región de Magallanes', 'Región del Libertador O\'Higgins'
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

// Función para obtener elemento aleatorio
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Función para generar teléfono chileno
function generateChileanPhone() {
  return '+56 9 ' + Math.floor(Math.random() * 10000000).toString().padStart(8, '0');
}

// Función para generar email
function generateEmail(name, companyName) {
  const nameParts = name.toLowerCase().split(' ');
  const companyDomain = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  return `${nameParts[0]}.${nameParts[1]}@${companyDomain}.cl`;
}

// Obtener empresas existentes
async function getCompanies() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name');
    
    if (error) {
      logError(`Error al obtener empresas: ${error.message}`);
      return [];
    }
    
    logSuccess(`Se encontraron ${data.length} empresas`);
    return data;
  } catch (error) {
    logError(`Error al obtener empresas: ${error.message}`);
    return [];
  }
}

// Limpiar empleados existentes
async function clearExistingEmployees() {
  try {
    logInfo('Limpiando empleados existentes...');
    
    const { error } = await supabase
      .from('employees')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (error) {
      logError(`Error al limpiar empleados: ${error.message}`);
      return false;
    }
    
    logSuccess('Empleados existentes eliminados');
    return true;
  } catch (error) {
    logError(`Error al limpiar empleados: ${error.message}`);
    return false;
  }
}

// Generar empleados
async function generateEmployees() {
  log('🚀 Generando 800 empleados con permisos de administrador', 'bright');
  log('═'.repeat(60), 'blue');
  
  const companies = await getCompanies();
  
  if (companies.length === 0) {
    logError('No se encontraron empresas. No se pueden generar empleados.');
    return false;
  }
  
  // Limpiar datos existentes
  const cleared = await clearExistingEmployees();
  if (!cleared) {
    logWarning('No se pudieron limpiar los empleados existentes, continuando...');
  }
  
  const employeesPerCompany = Math.floor(800 / companies.length);
  const remainingEmployees = 800 % companies.length;
  
  logInfo(`Se generarán ${employeesPerCompany} empleados por empresa`);
  logInfo(`${remainingEmployees} empresas adicionales recibirán 1 empleado extra`);
  
  let totalGenerated = 0;
  let batch = [];
  const batchSize = 100; // Lotes más grandes con permisos de admin
  
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const employeesForThisCompany = employeesPerCompany + (i < remainingEmployees ? 1 : 0);
    
    logInfo(`\n📁 Generando ${employeesForThisCompany} empleados para: ${company.name}`);
    
    for (let j = 0; j < employeesForThisCompany; j++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const fullName = `${firstName} ${lastName}`;
      
      const employee = {
        company_id: company.id,
        name: fullName,
        email: generateEmail(fullName, company.name),
        phone: generateChileanPhone(),
        region: getRandomElement(regions),
        department: getRandomElement(departments),
        level: getRandomElement(levels),
        position: getRandomElement(positions),
        work_mode: getRandomElement(workModes),
        contract_type: getRandomElement(contractTypes),
        is_active: true,
        has_subordinates: Math.random() > 0.7, // 30% de probabilidad de tener subordinados
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      batch.push(employee);
      
      // Insertar en lotes
      if (batch.length >= batchSize) {
        const inserted = await insertBatch(batch);
        if (inserted) {
          totalGenerated += batch.length;
          logInfo(`  ✅ Progreso: ${totalGenerated}/800 empleados generados`);
        } else {
          logError(`  ❌ Error al insertar lote de ${batch.length} empleados`);
        }
        batch = [];
      }
    }
  }
  
  // Insertar el último lote si hay elementos restantes
  if (batch.length > 0) {
    const inserted = await insertBatch(batch);
    if (inserted) {
      totalGenerated += batch.length;
      logInfo(`  ✅ Lote final: ${batch.length} empleados insertados`);
    }
  }
  
  logSuccess(`\n🎉 Total de empleados generados: ${totalGenerated}`);
  return totalGenerated === 800;
}

// Insertar lote en la base de datos
async function insertBatch(employees) {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert(employees)
      .select();
    
    if (error) {
      logError(`Error al insertar lote: ${error.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    logError(`Error al insertar lote: ${error.message}`);
    return false;
  }
}

// Verificar resultado
async function verifyResult() {
  log('\n🔍 Verificando resultado...', 'cyan');
  
  try {
    const { count, error } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      logError(`Error al verificar: ${error.message}`);
      return false;
    }
    
    if (count === 800) {
      logSuccess(`✅ Verificación exitosa: ${count} empleados en la base de datos`);
      
      // Obtener muestra de empleados
      const { data: sampleData } = await supabase
        .from('employees')
        .select('name, email, company_id, department')
        .limit(5);
      
      if (sampleData && sampleData.length > 0) {
        logInfo('Muestra de empleados generados:');
        sampleData.forEach((emp, index) => {
          logInfo(`  ${index + 1}. ${emp.name} - ${emp.department} - ${emp.email}`);
        });
      }
      
      return true;
    } else {
      logWarning(`⚠️  Se esperaban 800 empleados, se encontraron ${count}`);
      return false;
    }
  } catch (error) {
    logError(`Error al verificar: ${error.message}`);
    return false;
  }
}

// Función principal
async function main() {
  log('📊 SCRIPT DE POBLACIÓN DE EMPLEADOS (ADMIN) - BrifyRRHH', 'bright');
  log('Este script generará 800 empleados usando permisos de administrador', 'blue');
  log('═'.repeat(60), 'blue');
  
  try {
    // Verificar conexión con service role
    logInfo('Verificando conexión con permisos de administrador...');
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1);
    
    if (error) {
      logError(`Error de conexión: ${error.message}`);
      process.exit(1);
    }
    
    logSuccess('Conexión establecida con permisos de administrador');
    
    // Generar empleados
    const success = await generateEmployees();
    
    if (success) {
      // Verificar resultado
      const verificationSuccess = await verifyResult();
      
      if (verificationSuccess) {
        log('\n🎉 ¡PROCESO COMPLETADO CON ÉXITO!', 'green');
        log('✅ 800 empleados han sido generados correctamente', 'green');
        log('✅ El contador de carpetas ahora debería mostrar 800', 'green');
        log('✅ La aplicación está lista para producción', 'green');
        
        log('\n📝 PRÓXIMOS PASOS:', 'bright');
        log('1. Verifica https://brifyrrhhapp.netlify.app/panel-principal', 'blue');
        log('2. El contador de carpetas debería mostrar 800', 'blue');
        log('3. Prueba la funcionalidad completa', 'blue');
        log('4. Verifica que todos los usuarios vean el contador correcto', 'blue');
        
        log('\n🔄 Los cambios deberían reflejarse inmediatamente en producción', 'cyan');
      } else {
        log('\n⚠️  El proceso completó pero la verificación falló', 'yellow');
      }
    } else {
      log('\n❌ ERROR: No se pudieron generar todos los empleados', 'red');
      process.exit(1);
    }
    
  } catch (error) {
    logError(`Error durante la ejecución: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateEmployees,
  verifyResult,
  getCompanies,
  clearExistingEmployees
};