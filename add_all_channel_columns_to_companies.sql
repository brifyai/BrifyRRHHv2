-- Script para agregar todas las columnas de configuración de canales a la tabla companies
-- Ejecutar este script en Supabase SQL Editor

-- Configuración de Email
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_sender_name TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_sender_email TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_reply_to TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_config JSONB DEFAULT '{}';

-- Configuración de SMS
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_sender_name TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_sender_phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_config JSONB DEFAULT '{}';

-- Configuración de Telegram
ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_bot_username TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_webhook_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_config JSONB DEFAULT '{}';

-- Configuración de WhatsApp
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_webhook_verify_token TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_config JSONB DEFAULT '{}';

-- Configuración de Groq AI
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_api_key TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_model TEXT DEFAULT 'gemma2-9b-it';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_temperature DECIMAL(3,2) DEFAULT 0.7;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_max_tokens INTEGER DEFAULT 800;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_config JSONB DEFAULT '{}';

-- Configuración de Google Workspace
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_api_key TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_client_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_client_secret TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_config JSONB DEFAULT '{}';

-- Configuración de Microsoft 365
ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_client_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_client_secret TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_tenant_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_config JSONB DEFAULT '{}';

-- Configuración de Slack
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_bot_token TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_signing_secret TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_default_channel TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_config JSONB DEFAULT '{}';

-- Configuración de Teams
ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_app_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_client_secret TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_tenant_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_config JSONB DEFAULT '{}';

-- Configuración de HubSpot
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_api_key TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_portal_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_config JSONB DEFAULT '{}';

-- Configuración de Salesforce
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_consumer_key TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_consumer_secret TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_username TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_password TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_config JSONB DEFAULT '{}';

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_companies_email_enabled ON companies(email_enabled);
CREATE INDEX IF NOT EXISTS idx_companies_sms_enabled ON companies(sms_enabled);
CREATE INDEX IF NOT EXISTS idx_companies_telegram_enabled ON companies(telegram_enabled);
CREATE INDEX IF NOT EXISTS idx_companies_whatsapp_enabled ON companies(whatsapp_enabled);
CREATE INDEX IF NOT EXISTS idx_companies_groq_enabled ON companies(groq_enabled);
CREATE INDEX IF NOT EXISTS idx_companies_google_enabled ON companies(google_enabled);
CREATE INDEX IF NOT EXISTS idx_companies_microsoft_enabled ON companies(microsoft_enabled);
CREATE INDEX IF NOT EXISTS idx_companies_slack_enabled ON companies(slack_enabled);
CREATE INDEX IF NOT EXISTS idx_companies_teams_enabled ON companies(teams_enabled);
CREATE INDEX IF NOT EXISTS idx_companies_hubspot_enabled ON companies(hubspot_enabled);
CREATE INDEX IF NOT EXISTS idx_companies_salesforce_enabled ON companies(salesforce_enabled);

-- Actualizar el timestamp para todas las empresas existentes
UPDATE companies SET updated_at = NOW() WHERE updated_at IS NULL;

COMMIT;

-- Verificación: Mostrar todas las columnas de la tabla companies
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;