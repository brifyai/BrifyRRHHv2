-- ========================================
-- SISTEMA DE INTEGRACIONES API
-- Tablas para configuración de APIs externas
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
    provider_name TEXT NOT NULL, -- 'meta', 'google', 'microsoft', 'brevo', etc.
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}', -- Configuración específica de la integración
    credentials_encrypted TEXT, -- Credenciales encriptadas
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
    webhook_id TEXT, -- ID del webhook en el servicio externo
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
    external_id TEXT, -- ID del evento en el servicio externo
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
    data_transferred BIGINT DEFAULT 0, -- bytes
    average_response_time INTEGER DEFAULT 0, -- milliseconds
    cost DECIMAL(10,4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_integration_date_period UNIQUE (company_id, integration_type, date, period_type)
);

-- Tabla de configuración de notificaciones por integración
CREATE TABLE IF NOT EXISTS integration_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL,
    event_types TEXT[] DEFAULT '{}', -- Tipos de eventos que generan notificaciones
    notification_channels TEXT[] DEFAULT '{}', -- Canales de notificación: ['email', 'slack', 'whatsapp']
    is_enabled BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}', -- Configuración adicional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_integration_notifications UNIQUE (company_id, integration_type)
);

-- ========================================
-- ÍNDICES para optimización
-- ========================================

-- Índices para company_integrations
CREATE INDEX IF NOT EXISTS idx_ci_company_id ON company_integrations(company_id);
CREATE INDEX IF NOT EXISTS idx_ci_integration_type ON company_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_ci_is_active ON company_integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_ci_sync_status ON company_integrations(sync_status);

-- Índices para user_integration_credentials
CREATE INDEX IF NOT EXISTS idx_uic_user_id ON user_integration_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_uic_company_id ON user_integration_credentials(company_id);
CREATE INDEX IF NOT EXISTS idx_uic_integration_type ON user_integration_credentials(integration_type);
CREATE INDEX IF NOT EXISTS idx_uic_is_active ON user_integration_credentials(is_active);

-- Índices para integration_webhooks
CREATE INDEX IF NOT EXISTS idx_iw_company_id ON integration_webhooks(company_id);
CREATE INDEX IF NOT EXISTS idx_iw_integration_type ON integration_webhooks(integration_type);
CREATE INDEX IF NOT EXISTS idx_iw_is_active ON integration_webhooks(is_active);

-- Índices para integration_webhook_events
CREATE INDEX IF NOT EXISTS idx_iwe_webhook_id ON integration_webhook_events(webhook_id);
CREATE INDEX IF NOT EXISTS idx_iwe_event_type ON integration_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_iwe_processed ON integration_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_iwe_created_at ON integration_webhook_events(created_at);

-- Índices para integration_sync_logs
CREATE INDEX IF NOT EXISTS idx_isl_company_id ON integration_sync_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_isl_user_id ON integration_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_isl_integration_type ON integration_sync_logs(integration_type);
CREATE INDEX IF NOT EXISTS idx_isl_status ON integration_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_isl_started_at ON integration_sync_logs(started_at);

-- Índices para integration_usage_stats
CREATE INDEX IF NOT EXISTS idx_ius_company_id ON integration_usage_stats(company_id);
CREATE INDEX IF NOT EXISTS idx_ius_integration_type ON integration_usage_stats(integration_type);
CREATE INDEX IF NOT EXISTS idx_ius_date ON integration_usage_stats(date);
CREATE INDEX IF NOT EXISTS idx_ius_period_type ON integration_usage_stats(period_type);

-- Índices para integration_notification_settings
CREATE INDEX IF NOT EXISTS idx_ins_company_id ON integration_notification_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_ins_integration_type ON integration_notification_settings(integration_type);
CREATE INDEX IF NOT EXISTS idx_ins_is_enabled ON integration_notification_settings(is_enabled);

-- ========================================
-- TRIGGERS para actualización automática de timestamps
-- ========================================

-- Triggers para todas las tablas
DROP TRIGGER IF EXISTS update_company_integrations_updated_at ON company_integrations;
CREATE TRIGGER update_company_integrations_updated_at
    BEFORE UPDATE ON company_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_integration_credentials_updated_at ON user_integration_credentials;
CREATE TRIGGER update_user_integration_credentials_updated_at
    BEFORE UPDATE ON user_integration_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_webhooks_updated_at ON integration_webhooks;
CREATE TRIGGER update_integration_webhooks_updated_at
    BEFORE UPDATE ON integration_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_usage_stats_updated_at ON integration_usage_stats;
CREATE TRIGGER update_integration_usage_stats_updated_at
    BEFORE UPDATE ON integration_usage_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_notification_settings_updated_at ON integration_notification_settings;
CREATE TRIGGER update_integration_notification_settings_updated_at
    BEFORE UPDATE ON integration_notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Función para obtener estadísticas de uso de una integración
CREATE OR REPLACE FUNCTION get_integration_usage_stats(
    p_company_id UUID, 
    p_integration_type TEXT, 
    p_period TEXT DEFAULT 'monthly',
    p_limit INTEGER DEFAULT 12
)
RETURNS TABLE (
    date DATE,
    period_type TEXT,
    api_calls BIGINT,
    successful_calls BIGINT,
    failed_calls BIGINT,
    success_rate DECIMAL,
    average_response_time INTEGER,
    cost DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ius.date,
        ius.period_type,
        COALESCE(ius.api_calls, 0) as api_calls,
        COALESCE(ius.successful_calls, 0) as successful_calls,
        COALESCE(ius.failed_calls, 0) as failed_calls,
        CASE 
            WHEN ius.api_calls > 0 THEN 
                ROUND((ius.successful_calls * 100.0 / ius.api_calls), 2)
            ELSE 0 
        END as success_rate,
        ius.average_response_time,
        ius.cost
    FROM integration_usage_stats ius
    WHERE ius.company_id = p_company_id 
        AND ius.integration_type = p_integration_type
        AND ius.period_type = p_period
    ORDER BY ius.date DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar uso de API
CREATE OR REPLACE FUNCTION log_integration_usage(
    p_company_id UUID,
    p_integration_type TEXT,
    p_success BOOLEAN,
    p_response_time INTEGER DEFAULT 0,
    p_data_size BIGINT DEFAULT 0,
    p_cost DECIMAL DEFAULT 0.0000
)
RETURNS VOID AS $$
DECLARE
    v_current_date DATE := CURRENT_DATE;
    v_period_type TEXT := 'daily';
BEGIN
    INSERT INTO integration_usage_stats (
        company_id, integration_type, date, period_type,
        api_calls, successful_calls, failed_calls,
        data_transferred, average_response_time, cost
    ) VALUES (
        p_company_id, p_integration_type, v_current_date, v_period_type,
        1, CASE WHEN p_success THEN 1 ELSE 0 END, CASE WHEN p_success THEN 0 ELSE 1 END,
        p_data_size, p_response_time, p_cost
    )
    ON CONFLICT (company_id, integration_type, date, period_type)
    DO UPDATE SET
        api_calls = integration_usage_stats.api_calls + 1,
        successful_calls = integration_usage_stats.successful_calls + CASE WHEN p_success THEN 1 ELSE 0 END,
        failed_calls = integration_usage_stats.failed_calls + CASE WHEN p_success THEN 0 ELSE 1 END,
        data_transferred = integration_usage_stats.data_transferred + p_data_size,
        average_response_time = (integration_usage_stats.average_response_time + p_response_time) / 2,
        cost = integration_usage_stats.cost + p_cost,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para obtener integraciones activas de una empresa
CREATE OR REPLACE FUNCTION get_active_integrations(p_company_id UUID)
RETURNS TABLE (
    integration_type TEXT,
    provider_name TEXT,
    is_active BOOLEAN,
    sync_status TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER,
    configuration JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.integration_type,
        ci.provider_name,
        ci.is_active,
        ci.sync_status,
        ci.last_sync_at,
        ci.usage_count,
        ci.configuration
    FROM company_integrations ci
    WHERE ci.company_id = p_company_id 
        AND ci.is_active = true
    ORDER BY ci.integration_type;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE company_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_notification_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para company_integrations
DROP POLICY IF EXISTS company_integrations_select_own ON company_integrations;
CREATE POLICY company_integrations_select_own ON company_integrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.id = company_id 
            AND companies.user_id = auth.uid()
        )
    );

-- Políticas para user_integration_credentials
DROP POLICY IF EXISTS user_integration_credentials_select_own ON user_integration_credentials;
CREATE POLICY user_integration_credentials_select_own ON user_integration_credentials
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_integration_credentials_insert_own ON user_integration_credentials;
CREATE POLICY user_integration_credentials_insert_own ON user_integration_credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_integration_credentials_update_own ON user_integration_credentials;
CREATE POLICY user_integration_credentials_update_own ON user_integration_credentials
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_integration_credentials_delete_own ON user_integration_credentials;
CREATE POLICY user_integration_credentials_delete_own ON user_integration_credentials
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para integration_webhooks
DROP POLICY IF EXISTS integration_webhooks_select_own ON integration_webhooks;
CREATE POLICY integration_webhooks_select_own ON integration_webhooks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.id = company_id 
            AND companies.user_id = auth.uid()
        )
    );

-- Políticas para integration_sync_logs
DROP POLICY IF EXISTS integration_sync_logs_select_own ON integration_sync_logs;
CREATE POLICY integration_sync_logs_select_own ON integration_sync_logs
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.id = company_id 
            AND companies.user_id = auth.uid()
        )
    );

-- Políticas para integration_usage_stats
DROP POLICY IF EXISTS integration_usage_stats_select_own ON integration_usage_stats;
CREATE POLICY integration_usage_stats_select_own ON integration_usage_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.id = company_id 
            AND companies.user_id = auth.uid()
        )
    );

-- Confirmación final
SELECT '✅ Sistema de integraciones API creado exitosamente!' as status;

-- Mostrar tablas creadas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN (
        'company_integrations', 
        'user_integration_credentials', 
        'integration_webhooks', 
        'integration_webhook_events',
        'integration_sync_logs',
        'integration_usage_stats',
        'integration_notification_settings'
    )
ORDER BY table_name, ordinal_position;