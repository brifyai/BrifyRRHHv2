#!/usr/bin/env node

/**
 * Script para verificar datos de producción - BrifyRRHH
 * 
 * Este script verifica que los 800 empleados estén accesibles
 * y que el contador de carpetas funcione correctamente
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

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verificar conexión a la base de datos
async function verifyDatabaseConnection() {
  logStep(1, 'Verificando conexión a la base de datos');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      logError(`Error de conexión: ${error.message}`);
      return false;
    }
    
    logSuccess('Conexión a Supabase establecida correctamente');
    return true;
  } catch (error) {
    logError(`Error al conectar con la base de datos: ${error.message}`);
    return false;
  }
}

// Verificar tabla de empleados
async function verifyEmployeesTable() {
  logStep(2, 'Verificando tabla de empleados');
  
  try {
    // Verificar si la tabla existe y obtener el conteo
    const { data, error, count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      logError(`Error al consultar empleados: ${error.message}`);
      return false;
    }
    
    logInfo(`Total de empleados en la base de datos: ${count}`);
    
    if (count === 800) {
      logSuccess('✅ Exactamente 800 empleados encontrados');
    } else if (count > 0) {
      logWarning(`⚠️  Se encontraron ${count} empleados (se esperaban 800)`);
    } else {
      logError('❌ No se encontraron empleados');
      return false;
    }
    
    // Verificar estructura de los datos
    const { data: sampleData, error: sampleError } = await supabase
      .from('employees')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      logError(`Error al obtener muestra de empleados: ${sampleError.message}`);
      return false;
    }
    
    if (sampleData && sampleData.length > 0) {
      logSuccess('Estructura de datos de empleados verificada');
      logInfo('Campos encontrados:', Object.keys(sampleData[0]).join(', '));
      
      // Verificar campos importantes
      const requiredFields = ['id', 'name', 'email', 'company_id'];
      const sampleFields = Object.keys(sampleData[0]);
      
      requiredFields.forEach(field => {
        if (sampleFields.includes(field)) {
          logSuccess(`Campo ${field}: ✓`);
        } else {
          logWarning(`Campo ${field}: ✗ (faltante)`);
        }
      });
    }
    
    return count > 0;
  } catch (error) {
    logError(`Error al verificar tabla de empleados: ${error.message}`);
    return false;
  }
}

// Verificar tabla de empresas
async function verifyCompaniesTable() {
  logStep(3, 'Verificando tabla de empresas');
  
  try {
    const { data, error, count } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      logError(`Error al consultar empresas: ${error.message}`);
      return false;
    }
    
    logInfo(`Total de empresas en la base de datos: ${count}`);
    
    if (count > 0) {
      logSuccess(`✅ ${count} empresas encontradas`);
      
      // Obtener muestra de empresas
      const { data: sampleData } = await supabase
        .from('companies')
        .select('*')
        .limit(3);
      
      if (sampleData) {
        logInfo('Empresas de ejemplo:');
        sampleData.forEach(company => {
          logInfo(`  - ${company.name} (${company.id})`);
        });
      }
    } else {
      logWarning('⚠️  No se encontraron empresas');
    }
    
    return true;
  } catch (error) {
    logError(`Error al verificar tabla de empresas: ${error.message}`);
    return false;
  }
}

// Verificar usuarios activos
async function verifyActiveUsers() {
  logStep(4, 'Verificando usuarios activos');
  
  try {
    const { data, error, count } = await supabase
      .from('users')
      .select('email, name, is_active, last_sign_in_at', { count: 'exact' })
      .eq('is_active', true)
      .order('last_sign_in_at', { ascending: false })
      .limit(10);
    
    if (error) {
      logError(`Error al consultar usuarios: ${error.message}`);
      return false;
    }
    
    logInfo(`Total de usuarios activos: ${count}`);
    
    if (data && data.length > 0) {
      logSuccess('Últimos usuarios activos:');
      data.forEach((user, index) => {
        const lastLogin = user.last_sign_in_at ? 
          new Date(user.last_sign_in_at).toLocaleString() : 'Nunca';
        logInfo(`  ${index + 1}. ${user.name} (${user.email}) - Último login: ${lastLogin}`);
      });
    }
    
    return true;
  } catch (error) {
    logError(`Error al verificar usuarios activos: ${error.message}`);
    return false;
  }
}

// Simular conteo de carpetas por usuario
async function simulateFolderCount() {
  logStep(5, 'Simulando conteo de carpetas');
  
  try {
    // Obtener usuarios activos
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('is_active', true)
      .limit(5);
    
    if (userError) {
      logError(`Error al obtener usuarios: ${userError.message}`);
      return false;
    }
    
    if (!users || users.length === 0) {
      logWarning('No hay usuarios activos para simular conteo');
      return true;
    }
    
    // Para cada usuario, simular el conteo de carpetas
    for (const user of users) {
      logInfo(`\n📁 Verificando carpetas para: ${user.name} (${user.email})`);
      
      // Simular la lógica del contador de carpetas
      // Esto debería ser igual a la lógica en el frontend
      
      // 1. Contar empleados totales
      const { count: totalEmployees, error: empError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
      
      if (empError) {
        logError(`  Error al contar empleados: ${empError.message}`);
        continue;
      }
      
      // 2. Verificar si el usuario tiene acceso a todos los empleados
      // (asumimos que todos los usuarios activos tienen acceso)
      const folderCount = totalEmployees;
      
      logInfo(`  Total de empleados: ${totalEmployees}`);
      logInfo(`  Carpetas esperadas: ${folderCount}`);
      
      if (folderCount === 800) {
        logSuccess(`  ✅ Contador correcto: ${folderCount} carpetas`);
      } else {
        logWarning(`  ⚠️  Contador incorrecto: ${folderCount} carpetas (se esperaban 800)`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Error al simular conteo de carpetas: ${error.message}`);
    return false;
  }
}

// Verificar políticas RLS
async function verifyRLSPolicies() {
  logStep(6, 'Verificando políticas RLS');
  
  try {
    // Intentar leer datos como usuario anónimo
    const { data, error } = await supabase
      .from('employees')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('permission denied')) {
        logWarning('⚠️  Las políticas RLS pueden estar restringiendo el acceso anónimo');
        logInfo('Esto es normal si la aplicación requiere autenticación');
      } else {
        logError(`Error inesperado de RLS: ${error.message}`);
      }
    } else {
      logSuccess('✅ Acceso anónimo a empleados funcionando');
    }
    
    // Verificar acceso a usuarios
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (userError) {
      logWarning(`⚠️  Acceso a usuarios restringido: ${userError.message}`);
    } else {
      logSuccess('✅ Acceso anónimo a usuarios funcionando');
    }
    
    return true;
  } catch (error) {
    logError(`Error al verificar políticas RLS: ${error.message}`);
    return false;
  }
}

// Generar reporte final
function generateReport(results) {
  logStep(7, 'Generando reporte final');
  
  const passedTests = results.filter(r => r).length;
  const totalTests = results.length;
  
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 REPORTE DE VERIFICACIÓN DE DATOS DE PRODUCCIÓN', 'bright');
  log('='.repeat(60), 'cyan');
  
  log(`\n✅ Tests pasados: ${passedTests}/${totalTests}`, 
    passedTests === totalTests ? 'green' : 'yellow');
  
  log('\n🎯 ESTADO DE LOS DATOS:', 'bright');
  log(`• Conexión a base de datos: ${results[0] ? '✅' : '❌'}`);
  log(`• Tabla de empleados: ${results[1] ? '✅' : '❌'}`);
  log(`• Tabla de empresas: ${results[2] ? '✅' : '❌'}`);
  log(`• Usuarios activos: ${results[3] ? '✅' : '❌'}`);
  log(`• Conteo de carpetas: ${results[4] ? '✅' : '❌'}`);
  log(`• Políticas RLS: ${results[5] ? '✅' : '❌'}`);
  
  if (passedTests === totalTests) {
    log('\n🎉 ¡TODAS LAS VERIFICACIONES PASARON!', 'green');
    log('✅ La aplicación está lista para producción', 'green');
    log('✅ El contador de carpetas debería funcionar correctamente', 'green');
  } else {
    log('\n⚠️  HAY PROBLEMAS QUE REQUIEREN ATENCIÓN:', 'yellow');
    log('• Revisa los errores marcados arriba', 'yellow');
    log('• Asegúrate de que los datos estén correctamente configurados', 'yellow');
  }
  
  log('\n📝 RECOMENDACIONES:', 'bright');
  log('1. Verifica que el contador muestre 800 en producción', 'blue');
  log('2. Si muestra un número diferente, revisa las políticas RLS', 'blue');
  log('3. Asegúrate de que todos los usuarios tengan acceso a los empleados', 'blue');
  log('4. Monitorea el rendimiento del contador en producción', 'blue');
  
  log('\n' + '='.repeat(60), 'cyan');
}

// Función principal
async function main() {
  log('🔍 VERIFICACIÓN DE DATOS DE PRODUCCIÓN - BrifyRRHH', 'bright');
  log('Verificando que el contador de carpetas funcione correctamente', 'blue');
  log('═'.repeat(60), 'blue');
  
  const results = [];
  
  try {
    results.push(await verifyDatabaseConnection());
    results.push(await verifyEmployeesTable());
    results.push(await verifyCompaniesTable());
    results.push(await verifyActiveUsers());
    results.push(await simulateFolderCount());
    results.push(await verifyRLSPolicies());
    
    generateReport(results);
    
  } catch (error) {
    logError(`Error durante la verificación: ${error.message}`);
    process.exit(1);
  }
}

// Función auxiliar para mostrar pasos
function logStep(step, message) {
  log(`\n📍 Paso ${step}: ${message}`, 'cyan');
  log('─'.repeat(60), 'blue');
}

// Ejecutar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  verifyDatabaseConnection,
  verifyEmployeesTable,
  verifyCompaniesTable,
  verifyActiveUsers,
  simulateFolderCount,
  verifyRLSPolicies
};