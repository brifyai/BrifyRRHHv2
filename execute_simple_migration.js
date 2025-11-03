/**
 * Script simplificado para ejecutar las instrucciones ALTER TABLE esenciales
 * para agregar las columnas de credenciales de canales por empresa
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMjcwNzIsImV4cCI6MjA1OTcwMzA3Mn0.MgPEHKNTk-5Q5n9tT3h5hGhQJgKJhTjYkHhQJgKJhTjYk';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Instrucciones SQL esenciales para la migración
const essentialStatements = [
  // Configuración de Email
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_config JSONB DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_sender_name VARCHAR(255) DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_sender_email VARCHAR(255) DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_reply_to VARCHAR(255) DEFAULT NULL',

  // Configuración de SMS
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_config JSONB DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_sender_name VARCHAR(11) DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_sender_phone VARCHAR(20) DEFAULT NULL',

  // Configuración de Telegram (mejora existente)
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_config JSONB DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_bot_username VARCHAR(255) DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_webhook_url TEXT DEFAULT NULL',

  // Configuración de WhatsApp (mejora existente)
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_config JSONB DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_webhook_verify_token TEXT DEFAULT NULL',

  // Configuración de Groq AI
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_config JSONB DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_enabled BOOLEAN DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_api_key TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_model VARCHAR(100) DEFAULT \'gemma2-9b-it\'',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_temperature DECIMAL(3,2) DEFAULT 0.7',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_max_tokens INTEGER DEFAULT 800',

  // Configuración de Google Workspace
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_config JSONB DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_enabled BOOLEAN DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_api_key TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_client_id TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_client_secret TEXT DEFAULT NULL',

  // Configuración de Microsoft 365
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_config JSONB DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_enabled BOOLEAN DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_client_id TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_client_secret TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_tenant_id TEXT DEFAULT NULL',

  // Configuración de Slack
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_config JSONB DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_enabled BOOLEAN DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_bot_token TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_signing_secret TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_default_channel VARCHAR(255) DEFAULT NULL',

  // Configuración de Teams
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_config JSONB DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_enabled BOOLEAN DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_app_id TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_client_secret TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_tenant_id TEXT DEFAULT NULL',

  // Configuración de HubSpot
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_config JSONB DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_enabled BOOLEAN DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_api_key TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_portal_id VARCHAR(50) DEFAULT NULL',

  // Configuración de Salesforce
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_config JSONB DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_enabled BOOLEAN DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_consumer_key TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_consumer_secret TEXT DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_username VARCHAR(255) DEFAULT NULL',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_password TEXT DEFAULT NULL'
];

async function executeSimpleMigration() {
  try {
    console.log('🚀 Iniciando migración simplificada de credenciales de canales...');
    console.log(`📊 Se ejecutarán ${essentialStatements.length} instrucciones ALTER TABLE`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < essentialStatements.length; i++) {
      const statement = essentialStatements[i];
      
      try {
        console.log(`⚡ Ejecutando (${i + 1}/${essentialStatements.length}): ${statement.substring(0, 60)}...`);
        
        // Usar el método RPC para ejecutar SQL
        const { error } = await supabase.rpc('exec_sql', { 
          sql_statement: statement 
        });
        
        if (error) {
          console.warn(`⚠️ Error: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Instrucción ${i + 1} ejecutada correctamente`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Error crítico en instrucción ${i + 1}:`, error.message);
        errorCount++;
      }
      
      // Pequeña pausa entre instrucciones
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Resumen de la migración:');
    console.log(`✅ Instrucciones exitosas: ${successCount}`);
    console.log(`❌ Instrucciones con error: ${errorCount}`);
    console.log(`� Total de instrucciones: ${essentialStatements.length}`);
    
    // Migrar datos existentes
    console.log('\n🔄 Migrando datos existentes...');
    try {
      const { error: migrateError } = await supabase
        .from('companies')
        .update({
          telegram_enabled: supabase.sql`CASE WHEN telegram_bot IS NOT NULL AND telegram_bot != '' THEN true ELSE false END`,
          telegram_bot_username: supabase.sql`telegram_bot`,
          whatsapp_enabled: supabase.sql`CASE WHEN whatsapp_number IS NOT NULL AND whatsapp_number != '' THEN true ELSE false END`,
          whatsapp_phone_number: supabase.sql`whatsapp_number`
        })
        .not('telegram_bot', isNull)
        .not('whatsapp_number', isNull);
      
      if (migrateError) {
        console.warn('⚠️ Error migrando datos existentes:', migrateError.message);
      } else {
        console.log('✅ Datos existentes migrados correctamente');
      }
    } catch (error) {
      console.warn('⚠️ Error en migración de datos:', error.message);
    }
    
    // Verificar columnas
    console.log('\n🔍 Verificando columnas agregadas...');
    try {
      const { data: companies, error: verifyError } = await supabase
        .from('companies')
        .select('id, name, email_enabled, sms_enabled, telegram_enabled, whatsapp_enabled, groq_enabled')
        .limit(1);
      
      if (verifyError) {
        console.warn('⚠️ Error verificando columnas:', verifyError.message);
      } else {
        if (companies && companies.length > 0) {
          console.log('✅ Columnas verificadas en la tabla companies');
          const sampleCompany = companies[0];
          console.log('📋 Ejemplo de empresa actualizada:');
          console.log(`  - Email habilitado: ${sampleCompany.email_enabled}`);
          console.log(`  - SMS habilitado: ${sampleCompany.sms_enabled}`);
          console.log(`  - Telegram habilitado: ${sampleCompany.telegram_enabled}`);
          console.log(`  - WhatsApp habilitado: ${sampleCompany.whatsapp_enabled}`);
          console.log(`  - Groq habilitado: ${sampleCompany.groq_enabled}`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error en verificación:', error.message);
    }
    
    const success = errorCount === 0;
    
    if (success) {
      console.log('\n🎉 ¡Migración simplificada completada exitosamente!');
      console.log('📋 Las empresas ahora tienen columnas para configuraciones específicas de cada canal.');
      console.log('🔗 Puedes continuar con la modificación del formulario de empresas.');
    } else {
      console.log('\n⚠️ La migración tuvo algunos errores.');
      console.log('💡 Algunas instrucciones pueden requerir ejecución manual en la consola de Supabase.');
      console.log('🔗 URL: https://tmqglnycivlcjijoymwe.supabase.co/project/sql');
    }
    
    return { success, successCount, errorCount };
    
  } catch (error) {
    console.error('❌ Error crítico durante la migración:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar el script
async function main() {
  console.log('🚀 Iniciando migración simplificada de credenciales de canales...');
  
  const result = await executeSimpleMigration();
  
  process.exit(result.success ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Error fatal en el script de migración:', error);
  process.exit(1);
});