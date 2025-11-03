-- ========================================
-- MIGRACIÓN: AGREGAR CREDENCIALES DE CANALES POR EMPRESA
-- ========================================
-- Esta migración agrega campos para que cada empresa tenga sus propias
-- credenciales de comunicación (Email, SMS, Telegram, etc.)
-- Vinculado directamente con el sistema de integraciones global

-- ========================================
-- AGREGAR COLUMNAS DE CANALES A LA TABLA COMPANIES
-- ========================================

-- Configuración de Email por empresa
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS email_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sender_name VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email_sender_email VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email_reply_to VARCHAR(255) DEFAULT NULL;

-- Configuración de SMS por empresa
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS sms_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_sender_name VARCHAR(11) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sms_sender_phone VARCHAR(20) DEFAULT NULL;

-- Configuración de Telegram por empresa (mejora existente)
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS telegram_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS telegram_bot_username VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS telegram_webhook_url TEXT DEFAULT NULL;

-- Configuración de WhatsApp por empresa (mejora existente)
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS whatsapp_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS whatsapp_webhook_verify_token TEXT DEFAULT NULL;

-- Configuración de Groq AI por empresa
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS groq_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS groq_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groq_api_key TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS groq_model VARCHAR(100) DEFAULT 'gemma2-9b-it',
ADD COLUMN IF NOT EXISTS groq_temperature DECIMAL(3,2) DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS groq_max_tokens INTEGER DEFAULT 800;

-- Configuración de Google Workspace por empresa
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS google_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS google_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS google_api_key TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS google_client_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS google_client_secret TEXT DEFAULT NULL;

-- Configuración de Microsoft 365 por empresa
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS microsoft_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS microsoft_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS microsoft_client_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS microsoft_client_secret TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS microsoft_tenant_id TEXT DEFAULT NULL;

-- Configuración de Slack por empresa
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS slack_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS slack_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slack_bot_token TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS slack_signing_secret TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS slack_default_channel VARCHAR(255) DEFAULT NULL;

-- Configuración de Teams por empresa
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS teams_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS teams_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS teams_app_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS teams_client_secret TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS teams_tenant_id TEXT DEFAULT NULL;

-- Configuración de HubSpot por empresa
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS hubspot_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS hubspot_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hubspot_api_key TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS hubspot_portal_id VARCHAR(50) DEFAULT NULL;

-- Configuración de Salesforce por empresa
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS salesforce_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS salesforce_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS salesforce_consumer_key TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS salesforce_consumer_secret TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS salesforce_username VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS salesforce_password TEXT DEFAULT NULL;

-- ========================================
-- CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================

-- Índices para campos de configuración
CREATE INDEX IF NOT EXISTS idx_companies_email_enabled ON companies(email_enabled) WHERE email_enabled = true;
CREATE INDEX IF NOT EXISTS idx_companies_sms_enabled ON companies(sms_enabled) WHERE sms_enabled = true;
CREATE INDEX IF NOT EXISTS idx_companies_telegram_enabled ON companies(telegram_enabled) WHERE telegram_enabled = true;
CREATE INDEX IF NOT EXISTS idx_companies_whatsapp_enabled ON companies(whatsapp_enabled) WHERE whatsapp_enabled = true;
CREATE INDEX IF NOT EXISTS idx_companies_groq_enabled ON companies(groq_enabled) WHERE groq_enabled = true;
CREATE INDEX IF NOT EXISTS idx_companies_google_enabled ON companies(google_enabled) WHERE google_enabled = true;
CREATE INDEX IF NOT EXISTS idx_companies_microsoft_enabled ON companies(microsoft_enabled) WHERE microsoft_enabled = true;
CREATE INDEX IF NOT EXISTS idx_companies_slack_enabled ON companies(slack_enabled) WHERE slack_enabled = true;
CREATE INDEX IF NOT EXISTS idx_companies_teams_enabled ON companies(teams_enabled) WHERE teams_enabled = true;
CREATE INDEX IF NOT EXISTS idx_companies_hubspot_enabled ON companies(hubspot_enabled) WHERE hubspot_enabled = true;
CREATE INDEX IF NOT EXISTS idx_companies_salesforce_enabled ON companies(salesforce_enabled) WHERE salesforce_enabled = true;

-- Índices para campos JSONB
CREATE INDEX IF NOT EXISTS idx_companies_email_config ON companies USING GIN (email_config);
CREATE INDEX IF NOT EXISTS idx_companies_sms_config ON companies USING GIN (sms_config);
CREATE INDEX IF NOT EXISTS idx_companies_telegram_config ON companies USING GIN (telegram_config);
CREATE INDEX IF NOT EXISTS idx_companies_whatsapp_config ON companies USING GIN (whatsapp_config);
CREATE INDEX IF NOT EXISTS idx_companies_groq_config ON companies USING GIN (groq_config);
CREATE INDEX IF NOT EXISTS idx_companies_google_config ON companies USING GIN (google_config);
CREATE INDEX IF NOT EXISTS idx_companies_microsoft_config ON companies USING GIN (microsoft_config);
CREATE INDEX IF NOT EXISTS idx_companies_slack_config ON companies USING GIN (slack_config);
CREATE INDEX IF NOT EXISTS idx_companies_teams_config ON companies USING GIN (teams_config);
CREATE INDEX IF NOT EXISTS idx_companies_hubspot_config ON companies USING GIN (hubspot_config);
CREATE INDEX IF NOT EXISTS idx_companies_salesforce_config ON companies USING GIN (salesforce_config);

-- ========================================
-- CREAR VISTA PARA CONFIGURACIONES ACTIVAS
-- ========================================
CREATE OR REPLACE VIEW active_company_integrations AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.industry,
  
  -- Estado de las integraciones
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
  
  -- Contador de integraciones activas
  (
    c.email_enabled::int + 
    c.sms_enabled::int + 
    c.telegram_enabled::int + 
    c.whatsapp_enabled::int + 
    c.groq_enabled::int + 
    c.google_enabled::int + 
    c.microsoft_enabled::int + 
    c.slack_enabled::int + 
    c.teams_enabled::int + 
    c.hubspot_enabled::int + 
    c.salesforce_enabled::int
  ) as active_integrations_count,
  
  -- Información de configuración básica
  CASE 
    WHEN c.email_enabled THEN c.email_sender_email
    ELSE NULL
  END as primary_email,
  
  CASE 
    WHEN c.sms_enabled THEN c.sms_sender_phone
    ELSE NULL
  END as primary_sms,
  
  CASE 
    WHEN c.telegram_enabled THEN c.telegram_bot_username
    ELSE NULL
  END as primary_telegram,
  
  CASE 
    WHEN c.whatsapp_enabled THEN c.whatsapp_phone_number
    ELSE NULL
  END as primary_whatsapp,
  
  c.created_at,
  c.updated_at
  
FROM companies c
WHERE c.is_active = true;

-- ========================================
-- CREAR FUNCIÓN PARA OBTENER CONFIGURACIÓN DE CANAL
-- ========================================
CREATE OR REPLACE FUNCTION get_company_channel_config(
  p_company_id UUID,
  p_channel_name TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_config JSONB;
  v_enabled BOOLEAN;
BEGIN
  CASE p_channel_name
    WHEN 'email' THEN
      SELECT email_config, email_enabled INTO v_config, v_enabled 
      FROM companies WHERE id = p_company_id;
    WHEN 'sms' THEN
      SELECT sms_config, sms_enabled INTO v_config, v_enabled 
      FROM companies WHERE id = p_company_id;
    WHEN 'telegram' THEN
      SELECT telegram_config, telegram_enabled INTO v_config, v_enabled 
      FROM companies WHERE id = p_company_id;
    WHEN 'whatsapp' THEN
      SELECT whatsapp_config, whatsapp_enabled INTO v_config, v_enabled 
      FROM companies WHERE id = p_company_id;
    WHEN 'groq' THEN
      SELECT groq_config, groq_enabled INTO v_config, v_enabled 
      FROM companies WHERE id = p_company_id;
    WHEN 'google' THEN
      SELECT google_config, google_enabled INTO v_config, v_enabled 
      FROM companies WHERE id = p_company_id;
    WHEN 'microsoft' THEN
      SELECT microsoft_config, microsoft_enabled INTO v_config, v_enabled 
      FROM companies WHERE id = p_company_id;
    WHEN 'slack' THEN
      SELECT slack_config, slack_enabled INTO v_config, v_enabled 
      FROM companies WHERE id = p_company_id;
    WHEN 'teams' THEN
      SELECT teams_config, teams_enabled INTO v_config, v_enabled 
      FROM companies WHERE id = p_company_id;
    WHEN 'hubspot' THEN
      SELECT hubspot_config, hubspot_enabled INTO v_config, v_enabled 
      FROM companies WHERE id = p_company_id;
    WHEN 'salesforce' THEN
      SELECT salesforce_config, salesforce_enabled INTO v_config, v_enabled 
      FROM companies WHERE id = p_company_id;
    ELSE
      RAISE EXCEPTION 'Canal no reconocido: %', p_channel_name;
  END CASE;
  
  IF NOT v_enabled OR v_config IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN v_config;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CREAR FUNCIÓN PARA ACTUALIZAR CONFIGURACIÓN DE CANAL
-- ========================================
CREATE OR REPLACE FUNCTION update_company_channel_config(
  p_company_id UUID,
  p_channel_name TEXT,
  p_config JSONB,
  p_enabled BOOLEAN DEFAULT true
)
RETURNS BOOLEAN AS $$
BEGIN
  CASE p_channel_name
    WHEN 'email' THEN
      UPDATE companies 
      SET email_config = p_config, 
          email_enabled = p_enabled,
          updated_at = NOW()
      WHERE id = p_company_id;
    WHEN 'sms' THEN
      UPDATE companies 
      SET sms_config = p_config, 
          sms_enabled = p_enabled,
          updated_at = NOW()
      WHERE id = p_company_id;
    WHEN 'telegram' THEN
      UPDATE companies 
      SET telegram_config = p_config, 
          telegram_enabled = p_enabled,
          updated_at = NOW()
      WHERE id = p_company_id;
    WHEN 'whatsapp' THEN
      UPDATE companies 
      SET whatsapp_config = p_config, 
          whatsapp_enabled = p_enabled,
          updated_at = NOW()
      WHERE id = p_company_id;
    WHEN 'groq' THEN
      UPDATE companies 
      SET groq_config = p_config, 
          groq_enabled = p_enabled,
          updated_at = NOW()
      WHERE id = p_company_id;
    WHEN 'google' THEN
      UPDATE companies 
      SET google_config = p_config, 
          google_enabled = p_enabled,
          updated_at = NOW()
      WHERE id = p_company_id;
    WHEN 'microsoft' THEN
      UPDATE companies 
      SET microsoft_config = p_config, 
          microsoft_enabled = p_enabled,
          updated_at = NOW()
      WHERE id = p_company_id;
    WHEN 'slack' THEN
      UPDATE companies 
      SET slack_config = p_config, 
          slack_enabled = p_enabled,
          updated_at = NOW()
      WHERE id = p_company_id;
    WHEN 'teams' THEN
      UPDATE companies 
      SET teams_config = p_config, 
          teams_enabled = p_enabled,
          updated_at = NOW()
      WHERE id = p_company_id;
    WHEN 'hubspot' THEN
      UPDATE companies 
      SET hubspot_config = p_config, 
          hubspot_enabled = p_enabled,
          updated_at = NOW()
      WHERE id = p_company_id;
    WHEN 'salesforce' THEN
      UPDATE companies 
      SET salesforce_config = p_config, 
          salesforce_enabled = p_enabled,
          updated_at = NOW()
      WHERE id = p_company_id;
    ELSE
      RAISE EXCEPTION 'Canal no reconocido: %', p_channel_name;
    END CASE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ========================================
COMMENT ON COLUMN companies.email_config IS 'Configuración JSON de Email para la empresa (Brevo, SMTP, etc.)';
COMMENT ON COLUMN companies.sms_config IS 'Configuración JSON de SMS para la empresa (Brevo, Twilio, etc.)';
COMMENT ON COLUMN companies.telegram_config IS 'Configuración JSON de Telegram para la empresa';
COMMENT ON COLUMN companies.whatsapp_config IS 'Configuración JSON de WhatsApp para la empresa';
COMMENT ON COLUMN companies.groq_config IS 'Configuración JSON de Groq AI para la empresa';
COMMENT ON COLUMN companies.google_config IS 'Configuración JSON de Google Workspace para la empresa';
COMMENT ON COLUMN companies.microsoft_config IS 'Configuración JSON de Microsoft 365 para la empresa';
COMMENT ON COLUMN companies.slack_config IS 'Configuración JSON de Slack para la empresa';
COMMENT ON COLUMN companies.teams_config IS 'Configuración JSON de Microsoft Teams para la empresa';
COMMENT ON COLUMN companies.hubspot_config IS 'Configuración JSON de HubSpot para la empresa';
COMMENT ON COLUMN companies.salesforce_config IS 'Configuración JSON de Salesforce para la empresa';

COMMENT ON VIEW active_company_integrations IS 'Vista de integraciones activas por empresa';
COMMENT ON FUNCTION get_company_channel_config IS 'Obtiene la configuración de un canal específico para una empresa';
COMMENT ON FUNCTION update_company_channel_config IS 'Actualiza la configuración de un canal específico para una empresa';

-- ========================================
-- MIGRACIÓN DE DATOS EXISTENTES (opcional)
-- ========================================
-- Migrar datos existentes de telegram_bot y whatsapp_number a los nuevos campos
UPDATE companies 
SET 
  telegram_enabled = CASE WHEN telegram_bot IS NOT NULL AND telegram_bot != '' THEN true ELSE false END,
  telegram_bot_username = telegram_bot,
  whatsapp_enabled = CASE WHEN whatsapp_number IS NOT NULL AND whatsapp_number != '' THEN true ELSE false END,
  whatsapp_phone_number = whatsapp_number
WHERE telegram_bot IS NOT NULL OR whatsapp_number IS NOT NULL;

-- ========================================
-- VERIFICACIÓN DE LA MIGRACIÓN
-- ========================================
-- Verificar que las columnas se hayan agregado correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND table_schema = 'public'
  AND column_name LIKE '%_config' OR column_name LIKE '%_enabled'
ORDER BY column_name;

-- Verificar que la vista se haya creado correctamente
SELECT COUNT(*) as vista_creada 
FROM information_schema.views 
WHERE table_name = 'active_company_integrations';

-- ========================================
-- FIN DE LA MIGRACIÓN
-- ========================================