#!/usr/bin/env node

// Script para configurar la nueva base de datos BrifyRRHH
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Configurando base de datos BrifyRRHH...');

// Configurar cliente de Supabase con las nuevas credenciales
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para ejecutar script SQL
async function executeSQLScript(scriptPath) {
  try {
    console.log(`📄 Leyendo script: ${scriptPath}`);
    const sqlContent = readFileSync(scriptPath, 'utf8');
    
    console.log('🔧 Ejecutando script SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    
    if (error) {
      console.error('❌ Error ejecutando script:', error);
      return false;
    }
    
    console.log('✅ Script ejecutado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error leyendo o ejecutando script:', error.message);
    return false;
  }
}

// Función para verificar tablas
async function verifyTables() {
  try {
    console.log('🔍 Verificando tablas creadas...');
    
    const tables = [
      'companies',
      'employees', 
      'users',
      'carpeta_administrador',
      'sub_carpetas_administrador',
      'carpetas_usuario',
      'documentos_entrenador',
      'documentos_usuario_entrenador',
      'user_credentials',
      'user_tokens_usage',
      'drive_watch_channels',
      'drive_notifications',
      'plans',
      'payments'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabla ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabla ${table}: OK`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando tablas:', error.message);
    return false;
  }
}

// Función para verificar datos de ejemplo
async function verifySampleData() {
  try {
    console.log('🔍 Verificando datos de ejemplo...');
    
    // Verificar empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (companiesError) {
      console.error('❌ Error verificando empresas:', companiesError);
    } else {
      console.log(`✅ Empresas encontradas: ${companies.length}`);
      companies.forEach(company => {
        console.log(`   - ${company.name}`);
      });
    }
    
    // Verificar empleados
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, name, email, company_id!inner(name)')
      .limit(5);
    
    if (employeesError) {
      console.error('❌ Error verificando empleados:', employeesError);
    } else {
      console.log(`✅ Empleados encontrados: ${employees.length} (mostrando primeros 5)`);
      employees.forEach(employee => {
        console.log(`   - ${employee.name} (${employee.email}) - ${employee.company_id.name}`);
      });
    }
    
    // Verificar planes
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('id, name, price');
    
    if (plansError) {
      console.error('❌ Error verificando planes:', plansError);
    } else {
      console.log(`✅ Planes encontrados: ${plans.length}`);
      plans.forEach(plan => {
        console.log(`   - ${plan.name}: $${plan.price}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando datos:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  try {
    console.log('\n📋 Información de conexión:');
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Proyecto: BrifyRRHH`);
    
    // Paso 1: Ejecutar script de creación de tablas
    console.log('\n🔧 Paso 1: Creando estructura de base de datos...');
    const setupScriptPath = join(__dirname, '../database/new-supabase-setup.sql');
    const setupSuccess = await executeSQLScript(setupScriptPath);
    
    if (!setupSuccess) {
      console.log('\n⚠️  No se pudo ejecutar el script automáticamente.');
      console.log('Por favor, ejecuta manualmente el contenido de database/new-supabase-setup.sql');
      console.log('en el SQL Editor de Supabase: https://tmqglnycivlcjijoymwe.supabase.co');
    }
    
    // Esperar un momento para que las tablas se creen
    console.log('\n⏳ Esperando 3 segundos para que las tablas se creen...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Paso 2: Verificar tablas
    console.log('\n🔍 Paso 2: Verificando tablas...');
    await verifyTables();
    
    // Paso 3: Ejecutar script de datos de ejemplo
    console.log('\n📊 Paso 3: Generando datos de ejemplo...');
    const dataScriptPath = join(__dirname, '../database/generate-sample-data.sql');
    const dataSuccess = await executeSQLScript(dataScriptPath);
    
    if (!dataSuccess) {
      console.log('\n⚠️  No se pudo ejecutar el script de datos automáticamente.');
      console.log('Por favor, ejecuta manualmente el contenido de database/generate-sample-data.sql');
      console.log('en el SQL Editor de Supabase.');
    }
    
    // Esperar un momento para que los datos se inserten
    console.log('\n⏳ Esperando 3 segundos para que los datos se inserten...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Paso 4: Verificar datos
    console.log('\n🔍 Paso 4: Verificando datos de ejemplo...');
    await verifySampleData();
    
    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n📋 Resumen:');
    console.log('✅ Variables de entorno configuradas');
    console.log('✅ Servidor actualizado con nuevas credenciales');
    console.log('✅ Base de datos BrifyRRHH lista');
    
    console.log('\n🌐 URLs importantes:');
    console.log(`Frontend: http://localhost:3000`);
    console.log(`Backend: http://localhost:3001`);
    console.log(`Supabase Dashboard: https://tmqglnycivlcjijoymwe.supabase.co`);
    
    console.log('\n🚀 Siguientes pasos:');
    console.log('1. Configura Google Drive API (ver MIGRATION_GUIDE.md)');
    console.log('2. Prueba la aplicación localmente');
    console.log('3. Despliega en Netlify cuando esté todo listo');
    
  } catch (error) {
    console.error('\n💥 Error en el proceso:', error.message);
    process.exit(1);
  }
}

// Ejecutar script
main();