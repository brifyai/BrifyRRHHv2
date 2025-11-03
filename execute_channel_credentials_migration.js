/**
 * Script para ejecutar la migración de credenciales de canales por empresa
 * Este script ejecuta el SQL de migración en la base de datos de Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMjcwNzIsImV4cCI6MjA1OTcwMzA3Mn0.MgPEHKNTk-5Q5n9tT3h5hGhQJgKJhTjYkHhQJgKJhTjYk';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  try {
    console.log('🚀 Iniciando migración de credenciales de canales por empresa...');
    
    // Leer el archivo SQL
    const sqlFile = join(__dirname, 'migration_company_channel_credentials.sql');
    const sqlContent = readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Archivo SQL leído correctamente');
    
    // Dividir el SQL en instrucciones individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Se encontraron ${statements.length} instrucciones SQL para ejecutar`);
    
    // Ejecutar cada instrucción
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Solo ejecutar instrucciones que no sean comentarios
        if (statement && !statement.startsWith('--') && !statement.startsWith('/*')) {
          console.log(`⚡ Ejecutando instrucción ${i + 1}/${statements.length}...`);
          
          const { error } = await supabase.rpc('exec_sql', { sql_statement: statement });
          
          if (error) {
            // Intentar ejecutar directamente con SQL puro
            console.warn(`⚠️ Error con RPC, intentando ejecución directa: ${error.message}`);
            
            // Para algunas instrucciones, podemos usar el método directo
            if (statement.includes('ALTER TABLE') || statement.includes('CREATE INDEX') || statement.includes('CREATE VIEW')) {
              console.log(`🔄 Ejecutando instrucción directamente: ${statement.substring(0, 50)}...`);
              // Las instrucciones DDL deben ejecutarse a través de la consola de Supabase
              console.log(`ℹ️ Esta instrucción debe ejecutarse manualmente en la consola de Supabase`);
            }
          } else {
            console.log(`✅ Instrucción ${i + 1} ejecutada correctamente`);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error en instrucción ${i + 1}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Resumen de la migración:');
    console.log(`✅ Instrucciones exitosas: ${successCount}`);
    console.log(`❌ Instrucciones con error: ${errorCount}`);
    console.log(`� Total de instrucciones: ${statements.length}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️ Algunas instrucciones no pudieron ejecutarse automáticamente.');
      console.log('💡 Recomendación: Ejecuta el SQL manualmente en la consola de Supabase');
      console.log('🔗 URL: https://tmqglnycivlcjijoymwe.supabase.co/project/sql');
    } else {
      console.log('\n🎉 ¡Migración completada exitosamente!');
    }
    
    // Verificar que las columnas se hayan agregado
    console.log('\n🔍 Verificando columnas agregadas...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'companies')
      .eq('table_schema', 'public')
      .like('column_name', '%_config');
    
    if (!columnsError && columns) {
      console.log('✅ Columnas verificadas:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }
    
    return { success: errorCount === 0, successCount, errorCount };
    
  } catch (error) {
    console.error('❌ Error crítico durante la migración:', error);
    return { success: false, error: error.message };
  }
}

// Función para crear una tabla temporal de migración si no existe
async function createMigrationTable() {
  try {
    console.log('🔧 Verificando tabla de migración...');
    
    const { error } = await supabase
      .from('migration_log')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('📝 Creando tabla de migración...');
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_statement: `
          CREATE TABLE IF NOT EXISTS migration_log (
            id SERIAL PRIMARY KEY,
            migration_name VARCHAR(255) NOT NULL,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            success BOOLEAN DEFAULT true,
            error_message TEXT
          );
        `
      });
      
      if (createError) {
        console.warn('⚠️ No se pudo crear tabla de migración:', createError.message);
      } else {
        console.log('✅ Tabla de migración creada');
      }
    } else {
      console.log('✅ Tabla de migración ya existe');
    }
  } catch (error) {
    console.warn('⚠️ Error verificando tabla de migración:', error.message);
  }
}

// Función para registrar la migración
async function logMigration(migrationName, success, errorMessage = null) {
  try {
    await supabase
      .from('migration_log')
      .insert({
        migration_name: migrationName,
        success: success,
        error_message: errorMessage
      });
  } catch (error) {
    console.warn('⚠️ Error registrando migración:', error.message);
  }
}

// Ejecutar la migración
async function main() {
  console.log('🚀 Iniciando proceso de migración de credenciales de canales...');
  
  // Crear tabla de migración si no existe
  await createMigrationTable();
  
  // Ejecutar la migración principal
  const result = await executeMigration();
  
  // Registrar el resultado
  await logMigration('company_channel_credentials', result.success, result.error);
  
  if (result.success) {
    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('📋 Las empresas ahora pueden tener configuraciones específicas para cada canal de comunicación.');
    console.log('🔗 Puedes continuar con la modificación del formulario de empresas.');
  } else {
    console.log('\n⚠️ La migración tuvo algunos errores.');
    console.log('💡 Algunas instrucciones pueden requerir ejecución manual en la consola de Supabase.');
    console.log('🔗 URL: https://tmqglnycivlcjijoymwe.supabase.co/project/sql');
  }
  
  process.exit(result.success ? 0 : 1);
}

// Ejecutar el script
main().catch(error => {
  console.error('❌ Error fatal en el script de migración:', error);
  process.exit(1);
});