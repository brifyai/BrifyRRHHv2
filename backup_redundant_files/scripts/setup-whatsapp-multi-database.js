/**
 * Script para configurar las tablas de WhatsApp Multi-Agencia en Supabase
 * Este script ejecuta el esquema SQL necesario para soportar múltiples números de WhatsApp
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para ejecutar SQL
async function executeSQL(sql) {
  console.log('🔄 Ejecutando SQL...');
  
  try {
    // Para Supabase, necesitamos usar RPC o ejecutar directamente si tenemos permisos
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error al ejecutar SQL:', error);
      return false;
    }
    
    console.log('✅ SQL ejecutado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
}

// Función para leer el archivo SQL
function readSQLFile() {
  const sqlPath = path.join(process.cwd(), 'create-whatsapp-config-table.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ No se encuentra el archivo SQL:', sqlPath);
    return null;
  }
  
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('📄 Archivo SQL leído correctamente');
    return sql;
  } catch (error) {
    console.error('❌ Error al leer archivo SQL:', error);
    return null;
  }
}

// Función para verificar si las tablas ya existen
async function checkTablesExist() {
  console.log('🔍 Verificando si las tablas ya existen...');
  
  const tables = ['whatsapp_configs', 'whatsapp_templates', 'whatsapp_logs'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log(`📋 Tabla ${table} no existe (necesario crear)`);
        return false;
      } else if (error) {
        console.log(`⚠️ Error verificando tabla ${table}:`, error.message);
        return false;
      } else {
        console.log(`✅ Tabla ${table} ya existe`);
      }
    } catch (error) {
      console.log(`⚠️ Error verificando tabla ${table}:`, error.message);
      return false;
    }
  }
  
  return true;
}

// Función para crear las tablas manualmente si RPC no funciona
async function createTablesManually() {
  console.log('🔧 Creando tablas manualmente...');
  
  try {
    // Crear tabla whatsapp_configs
    const { error: configsError } = await supabase
      .from('whatsapp_configs')
      .select('*')
      .limit(1);
    
    if (configsError && configsError.code === 'PGRST116') {
      console.log('📋 Creando tabla whatsapp_configs...');
      // Nota: Esto requeriría permisos de administrador en Supabase
      console.log('⚠️ Se requieren permisos de administrador para crear tablas');
      console.log('📝 Por favor, ejecuta manualmente el SQL en el panel de Supabase');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creando tablas manualmente:', error);
    return false;
  }
}

// Función principal
async function setupWhatsAppMultiDatabase() {
  console.log('🚀 Iniciando configuración de base de datos para WhatsApp Multi-Agencia');
  console.log('=' .repeat(70));
  
  // 1. Verificar si las tablas ya existen
  const tablesExist = await checkTablesExist();
  if (tablesExist) {
    console.log('✅ Las tablas ya existen, no es necesario crearlas');
    return true;
  }
  
  // 2. Leer el archivo SQL
  const sql = readSQLFile();
  if (!sql) {
    console.error('❌ No se pudo leer el archivo SQL');
    return false;
  }
  
  // 3. Intentar ejecutar el SQL
  const sqlExecuted = await executeSQL(sql);
  if (!sqlExecuted) {
    console.log('⚠️ No se pudo ejecutar el SQL automáticamente');
    console.log('📝 Por favor, sigue estos pasos manuales:');
    console.log('');
    console.log('1. Abre el panel de Supabase: https://app.supabase.com');
    console.log('2. Ve a la sección "SQL Editor"');
    console.log('3. Copia y pega el contenido del archivo create-whatsapp-config-table.sql');
    console.log('4. Ejecuta el script SQL');
    console.log('');
    console.log('📄 El archivo SQL se encuentra en: ./create-whatsapp-config-table.sql');
    return false;
  }
  
  // 4. Verificar que las tablas se crearon correctamente
  console.log('🔍 Verificando que las tablas se crearon correctamente...');
  const tablesCreated = await checkTablesExist();
  
  if (tablesCreated) {
    console.log('✅ ¡Configuración completada con éxito!');
    console.log('');
    console.log('📋 Tablas creadas:');
    console.log('  - whatsapp_configs: Configuraciones de WhatsApp por empresa');
    console.log('  - whatsapp_templates: Plantillas de mensajes por empresa');
    console.log('  - whatsapp_logs: Registro de actividad de WhatsApp');
    console.log('  - active_whatsapp_configs: Vista de configuraciones activas');
    console.log('');
    console.log('🔗 Ahora puedes acceder al gestor multi-WhatsApp en:');
    console.log('  http://localhost:3000/whatsapp/multi-manager');
    return true;
  } else {
    console.error('❌ No se pudo verificar la creación de las tablas');
    return false;
  }
}

// Ejecutar el script
setupWhatsAppMultiDatabase()
  .then(success => {
    if (success) {
      console.log('\n🎉 Configuración completada exitosamente');
      process.exit(0);
    } else {
      console.log('\n💀 La configuración falló. Revisa los errores anteriores.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💀 Error inesperado:', error);
    process.exit(1);
  });