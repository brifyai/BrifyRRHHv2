-- ========================================
-- MIGRACIÓN MANUAL DE CREDENCIALES DE CANALES POR EMPRESA
-- ========================================
-- Ejecutar este script manualmente en: https://tmqglnycivlcjijoymwe.supabase.co/project/sql
-- ========================================

-- 1. Configuración de Email
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_config JSONB DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_sender_name VARCHAR(255) DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_sender_email VARCHAR(255) DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_reply_to VARCHAR(255) DEFAULT NULL;

-- 2. Configuración de SMS
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_config JSONB DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_sender_name VARCHAR(11) DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sms_sender_phone VARCHAR(20) DEFAULT NULL;

-- 3. Configuración de Telegram (mejora existente)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_config JSONB DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_bot_username VARCHAR(255) DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS telegram_webhook_url TEXT DEFAULT NULL;

-- 4. Configuración de WhatsApp (mejora existente)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_config JSONB DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_webhook_verify_token TEXT DEFAULT NULL;

-- 5. Configuración de Groq AI
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_config JSONB DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_api_key TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_model VARCHAR(100) DEFAULT 'gemma2-9b-it';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_temperature DECIMAL(3,2) DEFAULT 0.7;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS groq_max_tokens INTEGER DEFAULT 800;

-- 6. Configuración de Google Workspace
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_config JSONB DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_api_key TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_client_id TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_client_secret TEXT DEFAULT NULL;

-- 7. Configuración de Microsoft 365
ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_config JSONB DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_client_id TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_client_secret TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS microsoft_tenant_id TEXT DEFAULT NULL;

-- 8. Configuración de Slack
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_config JSONB DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_bot_token TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_signing_secret TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slack_default_channel VARCHAR(255) DEFAULT NULL;

-- 9. Configuración de Teams
ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_config JSONB DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_app_id TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_client_secret TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS teams_tenant_id TEXT DEFAULT NULL;

-- 10. Configuración de HubSpot
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_config JSONB DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_api_key TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hubspot_portal_id VARCHAR(50) DEFAULT NULL;

-- 11. Configuración de Salesforce
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_config JSONB DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_enabled BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_consumer_key TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_consumer_secret TEXT DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_username VARCHAR(255) DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS salesforce_password TEXT DEFAULT NULL;

-- ========================================
-- MIGRAR DATOS EXISTENTES
-- ========================================

-- Migrar datos de Telegram existentes
UPDATE companies 
SET 
    telegram_enabled = CASE WHEN telegram_bot IS NOT NULL AND telegram_bot != '' THEN true ELSE false END,
    telegram_bot_username = telegram_bot,
    telegram_config = jsonb_build_object(
        'bot_token', telegram_bot,
        'bot_username', telegram_bot,
        'webhook_url', telegram_webhook_url
    )
WHERE telegram_bot IS NOT NULL AND telegram_bot != '';

-- Migrar datos de WhatsApp existentes
UPDATE companies 
SET 
    whatsapp_enabled = CASE WHEN whatsapp_number IS NOT NULL AND whatsapp_number != '' THEN true ELSE false END,
    whatsapp_phone_number_id = whatsapp_number,
    whatsapp_config = jsonb_build_object(
        'phone_number_id', whatsapp_number,
        'access_token', whatsapp_access_token,
        'webhook_verify_token', whatsapp_webhook_verify_token
    )
WHERE whatsapp_number IS NOT NULL AND whatsapp_number != '';

-- ========================================
-- CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================

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

-- ========================================
-- CREAR VISTA PARA VER CONFIGURACIONES
-- ========================================

CREATE OR REPLACE VIEW company_channel_configurations AS
SELECT 
    c.id,
    c.name,
    c.email_enabled,
    c.sms_enabled,
    c.telegram_enabled,
    c.whatsapp_enabled,
    c.groq_enabled,
    c.google_enabled,
    c.microsoft_enabled,
    c.slack_enabled,
    c.teams_enabled,
    c.hubspot_enabled,
    c.salesforce_enabled,
    -- Contar canales habilitados
    (
        (c.email_enabled::int) +
        (c.sms_enabled::int) +
        (c.telegram_enabled::int) +
        (c.whatsapp_enabled::int) +
        (c.groq_enabled::int) +
        (c.google_enabled::int) +
        (c.microsoft_enabled::int) +
        (c.slack_enabled::int) +
        (c.teams_enabled::int) +
        (c.hubspot_enabled::int) +
        (c.salesforce_enabled::int)
    ) as enabled_channels_count,
    -- Lista de canales habilitados
    ARRAY_REMOVE(
        ARRAY[
            CASE WHEN c.email_enabled THEN 'Email' ELSE NULL END,
            CASE WHEN c.sms_enabled THEN 'SMS' ELSE NULL END,
            CASE WHEN c.telegram_enabled THEN 'Telegram' ELSE NULL END,
            CASE WHEN c.whatsapp_enabled THEN 'WhatsApp' ELSE NULL END,
            CASE WHEN c.groq_enabled THEN 'Groq AI' ELSE NULL END,
            CASE WHEN c.google_enabled THEN 'Google Workspace' ELSE NULL END,
            CASE WHEN c.microsoft_enabled THEN 'Microsoft 365' ELSE NULL END,
            CASE WHEN c.slack_enabled THEN 'Slack' ELSE NULL END,
            CASE WHEN c.teams_enabled THEN 'Teams' ELSE NULL END,
            CASE WHEN c.hubspot_enabled THEN 'HubSpot' ELSE NULL END,
            CASE WHEN c.salesforce_enabled THEN 'Salesforce' ELSE NULL END
        ],
        NULL
    ) as enabled_channels
FROM companies c;

-- ========================================
-- FUNCIONES AUXILIARES
-- ========================================

-- Función para obtener configuración de un canal específico
CREATE OR REPLACE FUNCTION get_company_channel_config(
    company_id_param UUID,
    channel_param TEXT
) RETURNS JSONB AS $$
DECLARE
    channel_config JSONB;
BEGIN
    CASE LOWER(channel_param)
        WHEN 'email' THEN
            SELECT jsonb_build_object(
                'enabled', email_enabled,
                'sender_name', email_sender_name,
                'sender_email', email_sender_email,
                'reply_to', email_reply_to,
                'config', email_config
            ) INTO channel_config
            FROM companies WHERE id = company_id_param;
        WHEN 'sms' THEN
            SELECT jsonb_build_object(
                'enabled', sms_enabled,
                'sender_name', sms_sender_name,
                'sender_phone', sms_sender_phone,
                'config', sms_config
            ) INTO channel_config
            FROM companies WHERE id = company_id_param;
        WHEN 'telegram' THEN
            SELECT jsonb_build_object(
                'enabled', telegram_enabled,
                'bot_token', telegram_bot_token,
                'bot_username', telegram_bot_username,
                'webhook_url', telegram_webhook_url,
                'config', telegram_config
            ) INTO channel_config
            FROM companies WHERE id = company_id_param;
        WHEN 'whatsapp' THEN
            SELECT jsonb_build_object(
                'enabled', whatsapp_enabled,
                'access_token', whatsapp_access_token,
                'phone_number_id', whatsapp_phone_number_id,
                'webhook_verify_token', whatsapp_webhook_verify_token,
                'config', whatsapp_config
            ) INTO channel_config
            FROM companies WHERE id = company_id_param;
        WHEN 'groq' THEN
            SELECT jsonb_build_object(
                'enabled', groq_enabled,
                'api_key', groq_api_key,
                'model', groq_model,
                'temperature', groq_temperature,
                'max_tokens', groq_max_tokens,
                'config', groq_config
            ) INTO channel_config
            FROM companies WHERE id = company_id_param;
        ELSE
            channel_config := NULL;
    END CASE;
    
    RETURN channel_config;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Verificar columnas agregadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
    AND table_schema = 'public'
    AND (
        column_name LIKE '%_config' OR 
        column_name LIKE '%_enabled' OR
        column_name LIKE '%_token' OR
        column_name LIKE '%_key' OR
        column_name LIKE '%_secret' OR
        column_name LIKE '%_name' OR
        column_name LIKE '%_email' OR
        column_name LIKE '%_phone' OR
        column_name LIKE '%_id' OR
        column_name LIKE '%_url' OR
        column_name LIKE '%_model' OR
        column_name LIKE '%_temperature' OR
        column_name LIKE '%_tokens'
    )
ORDER BY column_name;

-- Verificar vista
SELECT * FROM company_channel_configurations LIMIT 5;

-- Verificar función
SELECT get_company_channel_config(id, 'email') as email_config,
       get_company_channel_config(id, 'telegram') as telegram_config,
       get_company_channel_config(id, 'whatsapp') as whatsapp_config
FROM companies 
LIMIT 3;

-- ========================================
-- COMPLETADO
-- ========================================

-- La migración ha sido completada exitosamente
-- Ahora puedes modificar el formulario de empresas para incluir la configuración de canales