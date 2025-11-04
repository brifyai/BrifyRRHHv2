-- ========================================
-- SETUP COMPLETO DE BASE DE DATOS BRIFY RRHH V2
-- Ejecutar este script para crear todas las tablas necesarias
-- ========================================

-- ========================================
-- 1. TABLAS DE CAMPAÑAS BREVO
-- ========================================

-- Tabla principal de campañas
CREATE TABLE IF NOT EXISTS brevo_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN ('sms', 'email')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'completed', 'cancelled', 'failed')),
    sender_name TEXT,
    sender_email TEXT,
    subject TEXT,
    content TEXT NOT NULL,
    template_id UUID,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    test_mode BOOLEAN DEFAULT false,
    track_opens BOOLEAN DEFAULT true,
    track_clicks BOOLEAN DEFAULT true,
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    complaint_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de destinatarios de campañas
CREATE TABLE IF NOT EXISTS brevo_campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES brevo_campaigns(id) ON DELETE CASCADE,
    phone_number TEXT,
    email TEXT,
    contact_name TEXT,
    custom_variables JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced', 'unsubscribed', 'complaint')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    brevo_message_id TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de plantillas
CREATE TABLE IF NOT EXISTS brevo_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT NOT NULL CHECK (template_type IN ('sms', 'email')),
    subject TEXT,
    content TEXT NOT NULL,
    variables TEXT DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estadísticas
CREATE TABLE IF NOT EXISTS brevo_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    sms_sent INTEGER DEFAULT 0,
    sms_delivered INTEGER DEFAULT 0,
    sms_failed INTEGER DEFAULT 0,
    sms_opened INTEGER DEFAULT 0,
    sms_clicked INTEGER DEFAULT 0,
    sms_bounced INTEGER DEFAULT 0,
    sms_unsubscribed INTEGER DEFAULT 0,
    sms_complaint INTEGER DEFAULT 0,
    email_sent INTEGER DEFAULT 0,
    email_delivered INTEGER DEFAULT 0,
    email_failed INTEGER DEFAULT 0,
    email_opened INTEGER DEFAULT 0,
    email_clicked INTEGER DEFAULT 0,
    email_bounced INTEGER DEFAULT 0,
    email_unsubscribed INTEGER DEFAULT 0,
    email_complaint INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_date_period UNIQUE (user_id, date, period_type)
);

-- Tabla de configuración de Brevo por usuario
CREATE TABLE IF NOT EXISTS brevo_user_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    api_key_encrypted TEXT,
    api_key_hash TEXT,
    sms_sender TEXT,
    email_sender TEXT,
    email_name TEXT,
    test_mode BOOLEAN DEFAULT true,
    daily_limit INTEGER DEFAULT 100,
    monthly_limit INTEGER DEFAULT 3000,
    webhook_url TEXT,
    webhook_secret TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed')),
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_brevo_config UNIQUE (user_id)
);

-- ========================================
-- 2. TABLAS DE INTEGRACIONES API
-- ========================================

-- Tabla de configuración de integraciones por empresa
CREATE TABLE IF NOT EXISTS company_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL CHECK (integration_type IN (
        'whatsapp', 'telegram', 'slack', 'microsoft_teams', 'zoom', 
        'google_calendar', 'google_drive', 'google_meet', 'microsoft_365',
        'brevo', 'sendgrid', 'twilio', 'salesforce', 'hubspot', 'airtable'
    )),
    provider_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    credentials_encrypted TEXT,
    webhook_url TEXT,
    webhook_secret TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed')),
    sync_error TEXT,
    usage_count INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 1000,
    monthly_limit INTEGER DEFAULT 30000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_company_integration UNIQUE (company_id, integration_type)
);

-- Tabla de credenciales de usuarios para integraciones
CREATE TABLE IF NOT EXISTS user_integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT[],
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_integration UNIQUE (user_id, integration_type)
);

-- Tabla de webhooks para integraciones
CREATE TABLE IF NOT EXISTS integration_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL,
    webhook_id TEXT,
    webhook_url TEXT NOT NULL,
    events TEXT[] DEFAULT '{}',
    secret_key TEXT,
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos de webhooks
CREATE TABLE IF NOT EXISTS integration_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES integration_webhooks(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_id TEXT,
    external_id TEXT,
    event_data JSONB DEFAULT '{}',
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de logs de sincronización
CREATE TABLE IF NOT EXISTS integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    integration_type TEXT NOT NULL,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'webhook', 'manual')),
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Tabla de estadísticas de uso de integraciones
CREATE TABLE IF NOT EXISTS integration_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL,
    date DATE NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
    api_calls INTEGER DEFAULT 0,
    successful_calls INTEGER DEFAULT 0,
    failed_calls INTEGER DEFAULT 0,
    data_transferred BIGINT DEFAULT 0,
    average_response_time INTEGER DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_company_integration_date_period UNIQUE (company_id, integration_type, date, period_type)
);

-- ========================================
-- 3. TABLAS DE CARPETAS DE EMPLEADOS
-- ========================================

-- Tabla principal de carpetas de empleados
CREATE TABLE IF NOT EXISTS employee_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_email TEXT NOT NULL,
    employee_id TEXT,
    employee_name TEXT,
    employee_position TEXT,
    employee_department TEXT,
    employee_phone TEXT,
    employee_region TEXT,
    employee_level TEXT,
    employee_work_mode TEXT,
    employee_contract_type TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    company_name TEXT,
    drive_folder_id TEXT,
    drive_folder_url TEXT,
    local_folder_path TEXT,
    folder_status TEXT DEFAULT 'active' CHECK (folder_status IN ('active', 'inactive', 'syncing', 'error')),
    settings JSONB DEFAULT '{}',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_employee_email UNIQUE (employee_email)
);

-- Tabla para documentos de empleados
CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES employee_folders(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_type TEXT,
    file_size BIGINT DEFAULT 0,
    google_file_id TEXT,
    local_file_path TEXT,
    file_url TEXT,
    description TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'processing', 'error', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para FAQs de empleados
CREATE TABLE IF NOT EXISTS employee_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES employee_folders(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT,
    category TEXT,
    priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para historial de conversaciones
CREATE TABLE IF NOT EXISTS employee_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES employee_folders(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
    message_content TEXT NOT NULL,
    channel TEXT DEFAULT 'chat' CHECK (channel IN ('chat', 'whatsapp', 'telegram', 'email')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración de notificaciones por empleado
CREATE TABLE IF NOT EXISTS employee_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES employee_folders(id) ON DELETE CASCADE,
    whatsapp_enabled BOOLEAN DEFAULT true,
    telegram_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    response_language TEXT DEFAULT 'es',
    timezone TEXT DEFAULT 'America/Santiago',
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_folder_notification UNIQUE (folder_id)
);

-- ========================================
-- 4. TABLA DE CREDENCIALES DE USUARIO
-- ========================================

-- Tabla de credenciales de usuario (versión básica)
CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expires_at TIMESTAMP WITH TIME ZONE,
    google_scope TEXT[],
    microsoft_access_token TEXT,
    microsoft_refresh_token TEXT,
    microsoft_token_expires_at TIMESTAMP WITH TIME ZONE,
    microsoft_scope TEXT[],
    whatsapp_access_token TEXT,
    whatsapp_phone_number_id TEXT,
    whatsapp_webhook_secret TEXT,
    whatsapp_verify_token TEXT,
    email_api_key TEXT,
    email_sender_email TEXT,
    email_sender_name TEXT,
    zoom_access_token TEXT,
    zoom_refresh_token TEXT,
    zoom_token_expires_at TIMESTAMP WITH TIME ZONE,
    zoom_scope TEXT[],
    slack_access_token TEXT,
    slack_refresh_token TEXT,
    slack_token_expires_at TIMESTAMP WITH TIME ZONE,
    slack_scope TEXT[],
    last_used_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. FUNCIONES Y TRIGGERS
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para obtener estadísticas de campaña
CREATE OR REPLACE FUNCTION get_brevo_campaign_stats(p_campaign_id UUID)
RETURNS TABLE (
    total_recipients BIGINT,
    sent_count BIGINT,
    delivered_count BIGINT,
    opened_count BIGINT,
    clicked_count BIGINT,
    failed_count BIGINT,
    bounced_count BIGINT,
    unsubscribed_count BIGINT,
    complaint_count BIGINT,
    delivery_rate DECIMAL,
    open_rate DECIMAL,
    click_rate DECIMAL,
    bounce_rate DECIMAL,
    unsubscribe_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT bcr.id) as total_recipients,
        COUNT(DISTINCT CASE WHEN bcr.status = 'sent' THEN bcr.id END) as sent_count,
        COUNT(DISTINCT CASE WHEN bcr.status = 'delivered' THEN bcr.id END) as delivered_count,
        COUNT(DISTINCT CASE WHEN bcr.status = 'opened' THEN bcr.id END) as opened_count,
        COUNT(DISTINCT CASE WHEN bcr.status = 'clicked' THEN bcr.id END) as clicked_count,
        COUNT(DISTINCT CASE WHEN bcr.status = 'failed' THEN bcr.id END) as failed_count,
        COUNT(DISTINCT CASE WHEN bcr.status = 'bounced' THEN bcr.id END) as bounced_count,
        COUNT(DISTINCT CASE WHEN bcr.status = 'unsubscribed' THEN bcr.id END) as unsubscribed_count,
        COUNT(DISTINCT CASE WHEN bcr.status = 'complaint' THEN bcr.id END) as complaint_count,
        CASE 
            WHEN COUNT(DISTINCT bcr.id) > 0 THEN 
                ROUND((COUNT(DISTINCT CASE WHEN bcr.status = 'delivered' THEN bcr.id END) * 100.0 / COUNT(DISTINCT bcr.id)), 2)
            ELSE 0 
        END as delivery_rate,
        CASE 
            WHEN COUNT(DISTINCT CASE WHEN bcr.status = 'sent' THEN bcr.id END) > 0 THEN 
                ROUND((COUNT(DISTINCT CASE WHEN bcr.status = 'opened' THEN bcr.id END) * 100.0 / COUNT(DISTINCT CASE WHEN bcr.status = 'sent' THEN bcr.id END)), 2)
            ELSE 0 
        END as open_rate,
        CASE 
            WHEN COUNT(DISTINCT CASE WHEN bcr.status = 'delivered' THEN bcr.id END) > 0 THEN 
                ROUND((COUNT(DISTINCT CASE WHEN bcr.status = 'clicked' THEN bcr.id END) * 100.0 / COUNT(DISTINCT CASE WHEN bcr.status = 'delivered' THEN bcr.id END)), 2)
            ELSE 0 
        END as click_rate,
        CASE 
            WHEN COUNT(DISTINCT CASE WHEN bcr.status = 'sent' THEN bcr.id END) > 0 THEN 
                ROUND((COUNT(DISTINCT CASE WHEN bcr.status = 'bounced' THEN bcr.id END) * 100.0 / COUNT(DISTINCT CASE WHEN bcr.status = 'sent' THEN bcr.id END)), 2)
            ELSE 0 
        END as bounce_rate,
        CASE 
            WHEN COUNT(DISTINCT CASE WHEN bcr.status = 'delivered' THEN bcr.id END) > 0 THEN 
                ROUND((COUNT(DISTINCT CASE WHEN bcr.status = 'unsubscribed' THEN bcr.id END) * 100.0 / COUNT(DISTINCT CASE WHEN bcr.status = 'delivered' THEN bcr.id END)), 2)
            ELSE 0 
        END as unsubscribe_rate
    FROM brevo_campaign_recipients bcr
    WHERE bcr.campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para todas las tablas con updated_at
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY 
        ARRAY[
            'brevo_campaigns', 'brevo_campaign_recipients', 'brevo_templates', 
            'brevo_statistics', 'brevo_user_config', 'company_integrations',
            'user_integration_credentials', 'integration_webhooks', 
            'integration_usage_stats', 'employee_folders', 'employee_documents',
            'employee_faqs', 'employee_conversations', 
            'employee_notification_settings', 'user_credentials'
        ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', table_name, table_name);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', table_name, table_name);
    END LOOP;
END $$;

-- ========================================
-- 6. POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS en todas las tablas
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY 
        ARRAY[
            'brevo_campaigns', 'brevo_campaign_recipients', 'brevo_templates', 
            'brevo_statistics', 'brevo_user_config', 'company_integrations',
            'user_integration_credentials', 'integration_webhooks', 
            'integration_webhook_events', 'integration_sync_logs',
            'integration_usage_stats', 'employee_folders', 'employee_documents',
            'employee_faqs', 'employee_conversations', 
            'employee_notification_settings', 'user_credentials'
        ]
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    END LOOP;
END $$;

-- Políticas básicas para tablas de usuario
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY 
        ARRAY['brevo_campaigns', 'brevo_templates', 'brevo_statistics', 'brevo_user_config', 'user_integration_credentials', 'user_credentials']
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I_select_own ON %I', table_name, table_name);
        EXECUTE format('CREATE POLICY %I_select_own ON %I FOR SELECT USING (auth.uid() = user_id)', table_name, table_name);
        
        EXECUTE format('DROP POLICY IF EXISTS %I_insert_own ON %I', table_name, table_name);
        EXECUTE format('CREATE POLICY %I_insert_own ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', table_name, table_name);
        
        EXECUTE format('DROP POLICY IF EXISTS %I_update_own ON %I', table_name, table_name);
        EXECUTE format('CREATE POLICY %I_update_own ON %I FOR UPDATE USING (auth.uid() = user_id)', table_name, table_name);
        
        EXECUTE format('DROP POLICY IF EXISTS %I_delete_own ON %I', table_name, table_name);
        EXECUTE format('CREATE POLICY %I_delete_own ON %I FOR DELETE USING (auth.uid() = user_id)', table_name, table_name);
    END LOOP;
END $$;

-- Política para user_credentials (más específica)
DROP POLICY IF EXISTS user_credentials_policy ON user_credentials;
CREATE POLICY user_credentials_policy ON user_credentials FOR ALL USING (auth.uid() = user_id);

-- Confirmación final
SELECT '✅ Base de datos completa de BrifyRRHH v2 creada exitosamente!' as status;

-- Resumen de tablas creadas
SELECT 
    'Tablas creadas:' as category,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'brevo_campaigns', 'brevo_campaign_recipients', 'brevo_templates', 
        'brevo_statistics', 'brevo_user_config', 'company_integrations',
        'user_integration_credentials', 'integration_webhooks', 
        'integration_webhook_events', 'integration_sync_logs',
        'integration_usage_stats', 'employee_folders', 'employee_documents',
        'employee_faqs', 'employee_conversations', 
        'employee_notification_settings', 'user_credentials'
    )

UNION ALL

SELECT 
    'Funciones creadas:' as category,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('update_updated_at_column', 'get_brevo_campaign_stats')

UNION ALL

SELECT 
    'Triggers creados:' as category,
    COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND trigger_name LIKE 'update_%_updated_at'

UNION ALL

SELECT 
    'Políticas RLS creadas:' as category,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';