-- ========================================
-- SISTEMA DE CAMPAÑAS BREVO (Sendinblue)
-- Tablas para gestión de campañas de email y SMS
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
    template_id UUID REFERENCES brevo_templates(id) ON DELETE SET NULL,
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
    variables TEXT DEFAULT '[]', -- Array JSON de variables
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
    api_key_hash TEXT, -- Hash para verificación sin exponer la clave
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

-- Tabla de webhooks de Brevo
CREATE TABLE IF NOT EXISTS brevo_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    webhook_id TEXT, -- ID del webhook en Brevo
    webhook_url TEXT NOT NULL,
    events TEXT[] DEFAULT '{}', -- Array de eventos: ['sent', 'delivered', 'opened', 'clicked', etc.]
    secret_key TEXT,
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos de webhooks
CREATE TABLE IF NOT EXISTS brevo_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES brevo_webhooks(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_id TEXT, -- ID del evento en Brevo
    message_id TEXT,
    campaign_id UUID REFERENCES brevo_campaigns(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES brevo_campaign_recipients(id) ON DELETE SET NULL,
    event_data JSONB DEFAULT '{}',
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES para optimización
-- ========================================

-- Índices para brevo_campaigns
CREATE INDEX IF NOT EXISTS idx_bc_user_id ON brevo_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_bc_status ON brevo_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_bc_campaign_type ON brevo_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_bc_created_at ON brevo_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_bc_scheduled_at ON brevo_campaigns(scheduled_at);

-- Índices para brevo_campaign_recipients
CREATE INDEX IF NOT EXISTS idx_bcr_campaign_id ON brevo_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_bcr_status ON brevo_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_bcr_email ON brevo_campaign_recipients(email);
CREATE INDEX IF NOT EXISTS idx_bcr_phone_number ON brevo_campaign_recipients(phone_number);
CREATE INDEX IF NOT EXISTS idx_bcr_brevo_message_id ON brevo_campaign_recipients(brevo_message_id);

-- Índices para brevo_templates
CREATE INDEX IF NOT EXISTS idx_bt_user_id ON brevo_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_bt_template_type ON brevo_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_bt_is_active ON brevo_templates(is_active);

-- Índices para brevo_statistics
CREATE INDEX IF NOT EXISTS idx_bs_user_id ON brevo_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_bs_date ON brevo_statistics(date);
CREATE INDEX IF NOT EXISTS idx_bs_period_type ON brevo_statistics(period_type);
CREATE INDEX IF NOT EXISTS idx_bs_user_date_period ON brevo_statistics(user_id, date, period_type);

-- Índices para brevo_user_config
CREATE INDEX IF NOT EXISTS idx_buc_user_id ON brevo_user_config(user_id);
CREATE INDEX IF NOT EXISTS idx_buc_is_active ON brevo_user_config(is_active);

-- Índices para brevo_webhooks
CREATE INDEX IF NOT EXISTS idx_bw_user_id ON brevo_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_bw_is_active ON brevo_webhooks(is_active);

-- Índices para brevo_webhook_events
CREATE INDEX IF NOT EXISTS idx_bwe_webhook_id ON brevo_webhook_events(webhook_id);
CREATE INDEX IF NOT EXISTS idx_bwe_event_type ON brevo_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_bwe_processed ON brevo_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_bwe_created_at ON brevo_webhook_events(created_at);

-- ========================================
-- TRIGGERS para actualización automática de timestamps
-- ========================================

-- Función para actualizar updated_at (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas las tablas
DROP TRIGGER IF EXISTS update_brevo_campaigns_updated_at ON brevo_campaigns;
CREATE TRIGGER update_brevo_campaigns_updated_at
    BEFORE UPDATE ON brevo_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brevo_campaign_recipients_updated_at ON brevo_campaign_recipients;
CREATE TRIGGER update_brevo_campaign_recipients_updated_at
    BEFORE UPDATE ON brevo_campaign_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brevo_templates_updated_at ON brevo_templates;
CREATE TRIGGER update_brevo_templates_updated_at
    BEFORE UPDATE ON brevo_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brevo_statistics_updated_at ON brevo_statistics;
CREATE TRIGGER update_brevo_statistics_updated_at
    BEFORE UPDATE ON brevo_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brevo_user_config_updated_at ON brevo_user_config;
CREATE TRIGGER update_brevo_user_config_updated_at
    BEFORE UPDATE ON brevo_user_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brevo_webhooks_updated_at ON brevo_webhooks;
CREATE TRIGGER update_brevo_webhooks_updated_at
    BEFORE UPDATE ON brevo_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Función para obtener estadísticas de una campaña
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

-- Función para actualizar contadores de campaña
CREATE OR REPLACE FUNCTION update_brevo_campaign_counters(p_campaign_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE brevo_campaigns 
    SET 
        total_recipients = (SELECT COUNT(*) FROM brevo_campaign_recipients WHERE campaign_id = p_campaign_id),
        sent_count = (SELECT COUNT(*) FROM brevo_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'sent'),
        delivered_count = (SELECT COUNT(*) FROM brevo_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'delivered'),
        opened_count = (SELECT COUNT(*) FROM brevo_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'opened'),
        clicked_count = (SELECT COUNT(*) FROM brevo_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'clicked'),
        failed_count = (SELECT COUNT(*) FROM brevo_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'failed'),
        bounced_count = (SELECT COUNT(*) FROM brevo_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'bounced'),
        unsubscribed_count = (SELECT COUNT(*) FROM brevo_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'unsubscribed'),
        complaint_count = (SELECT COUNT(*) FROM brevo_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'complaint'),
        updated_at = NOW()
    WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE brevo_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE brevo_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE brevo_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE brevo_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE brevo_user_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE brevo_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE brevo_webhook_events ENABLE ROW LEVEL SECURITY;

-- Políticas para brevo_campaigns
DROP POLICY IF EXISTS brevo_campaigns_select_own ON brevo_campaigns;
CREATE POLICY brevo_campaigns_select_own ON brevo_campaigns
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_campaigns_insert_own ON brevo_campaigns;
CREATE POLICY brevo_campaigns_insert_own ON brevo_campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_campaigns_update_own ON brevo_campaigns;
CREATE POLICY brevo_campaigns_update_own ON brevo_campaigns
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_campaigns_delete_own ON brevo_campaigns;
CREATE POLICY brevo_campaigns_delete_own ON brevo_campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para brevo_campaign_recipients (acceso a través de campaña)
DROP POLICY IF EXISTS brevo_campaign_recipients_select_own ON brevo_campaign_recipients;
CREATE POLICY brevo_campaign_recipients_select_own ON brevo_campaign_recipients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brevo_campaigns 
            WHERE brevo_campaigns.id = campaign_id 
            AND brevo_campaigns.user_id = auth.uid()
        )
    );

-- Políticas para brevo_templates
DROP POLICY IF EXISTS brevo_templates_select_own ON brevo_templates;
CREATE POLICY brevo_templates_select_own ON brevo_templates
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_templates_insert_own ON brevo_templates;
CREATE POLICY brevo_templates_insert_own ON brevo_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_templates_update_own ON brevo_templates;
CREATE POLICY brevo_templates_update_own ON brevo_templates
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_templates_delete_own ON brevo_templates;
CREATE POLICY brevo_templates_delete_own ON brevo_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para brevo_statistics
DROP POLICY IF EXISTS brevo_statistics_select_own ON brevo_statistics;
CREATE POLICY brevo_statistics_select_own ON brevo_statistics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_statistics_insert_own ON brevo_statistics;
CREATE POLICY brevo_statistics_insert_own ON brevo_statistics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_statistics_update_own ON brevo_statistics;
CREATE POLICY brevo_statistics_update_own ON brevo_statistics
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para brevo_user_config
DROP POLICY IF EXISTS brevo_user_config_select_own ON brevo_user_config;
CREATE POLICY brevo_user_config_select_own ON brevo_user_config
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_user_config_insert_own ON brevo_user_config;
CREATE POLICY brevo_user_config_insert_own ON brevo_user_config
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_user_config_update_own ON brevo_user_config;
CREATE POLICY brevo_user_config_update_own ON brevo_user_config
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_user_config_delete_own ON brevo_user_config;
CREATE POLICY brevo_user_config_delete_own ON brevo_user_config
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para brevo_webhooks
DROP POLICY IF EXISTS brevo_webhooks_select_own ON brevo_webhooks;
CREATE POLICY brevo_webhooks_select_own ON brevo_webhooks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_webhooks_insert_own ON brevo_webhooks;
CREATE POLICY brevo_webhooks_insert_own ON brevo_webhooks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_webhooks_update_own ON brevo_webhooks;
CREATE POLICY brevo_webhooks_update_own ON brevo_webhooks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brevo_webhooks_delete_own ON brevo_webhooks;
CREATE POLICY brevo_webhooks_delete_own ON brevo_webhooks
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para brevo_webhook_events (acceso a través de webhook)
DROP POLICY IF EXISTS brevo_webhook_events_select_own ON brevo_webhook_events;
CREATE POLICY brevo_webhook_events_select_own ON brevo_webhook_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brevo_webhooks 
            WHERE brevo_webhooks.id = webhook_id 
            AND brevo_webhooks.user_id = auth.uid()
        )
    );

-- Confirmación final
SELECT '✅ Sistema de campañas Brevo creado exitosamente!' as status;

-- Mostrar tablas creadas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN (
        'brevo_campaigns', 
        'brevo_campaign_recipients', 
        'brevo_templates', 
        'brevo_statistics',
        'brevo_user_config',
        'brevo_webhooks',
        'brevo_webhook_events'
    )
ORDER BY table_name, ordinal_position;