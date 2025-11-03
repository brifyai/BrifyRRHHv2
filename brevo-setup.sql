-- ========================================
-- Creación de tablas para campañas de Brevo
-- Sistema de envío masivo de SMS y Email
-- ========================================

-- Tabla para campañas de SMS y Email
CREATE TABLE IF NOT EXISTS brevo_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Información básica de la campaña
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(20) NOT NULL CHECK (campaign_type IN ('sms', 'email')),
    
    -- Estado de la campaña
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'paused', 'cancelled')),
    
    -- Configuración de envío
    sender_name VARCHAR(100),
    sender_email VARCHAR(255),
    subject VARCHAR(255), -- Para emails
    
    -- Contenido del mensaje
    content TEXT NOT NULL,
    template_id VARCHAR(100),
    
    -- Programación
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Estadísticas
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0, -- Solo para emails
    clicked_count INTEGER DEFAULT 0, -- Solo para emails
    
    -- Configuración adicional
    test_mode BOOLEAN DEFAULT false,
    track_opens BOOLEAN DEFAULT true, -- Solo para emails
    track_clicks BOOLEAN DEFAULT true, -- Solo para emails
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    CONSTRAINT brevo_campaigns_user_id_idx FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Tabla para destinatarios de campañas
CREATE TABLE IF NOT EXISTS brevo_campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES brevo_campaigns(id) ON DELETE CASCADE,
    
    -- Información del destinatario
    phone_number VARCHAR(20), -- Para SMS
    email VARCHAR(255), -- Para Email
    contact_name VARCHAR(255),
    
    -- Estado de envío
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')),
    
    -- Información de envío
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE, -- Solo para emails
    clicked_at TIMESTAMP WITH TIME ZONE, -- Solo para emails
    
    -- Errores
    error_message TEXT,
    brevo_message_id VARCHAR(100),
    
    -- Personalización
    custom_variables JSONB DEFAULT '{}',
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para plantillas de mensajes
CREATE TABLE IF NOT EXISTS brevo_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Información básica
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(20) NOT NULL CHECK (template_type IN ('sms', 'email')),
    
    -- Contenido
    subject VARCHAR(255), -- Solo para emails
    content TEXT NOT NULL,
    
    -- Variables personalizables
    variables JSONB DEFAULT '[]',
    
    -- Estadísticas de uso
    usage_count INTEGER DEFAULT 0,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para estadísticas de envío
CREATE TABLE IF NOT EXISTS brevo_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Período de estadísticas
    date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    
    -- Estadísticas SMS
    sms_sent INTEGER DEFAULT 0,
    sms_delivered INTEGER DEFAULT 0,
    sms_failed INTEGER DEFAULT 0,
    sms_cost DECIMAL(10,4) DEFAULT 0,
    
    -- Estadísticas Email
    email_sent INTEGER DEFAULT 0,
    email_delivered INTEGER DEFAULT 0,
    email_opened INTEGER DEFAULT 0,
    email_clicked INTEGER DEFAULT 0,
    email_failed INTEGER DEFAULT 0,
    email_cost DECIMAL(10,4) DEFAULT 0,
    
    -- Totales
    total_sent INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint único para evitar duplicados
    UNIQUE(user_id, date, period_type)
);

-- Tabla para configuración de Brevo por usuario
CREATE TABLE IF NOT EXISTS brevo_user_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Configuración de API
    api_key_encrypted TEXT, -- Encriptado
    sms_sender VARCHAR(11),
    email_sender VARCHAR(255),
    email_name VARCHAR(100),
    
    -- Configuración preferencias
    test_mode BOOLEAN DEFAULT false,
    track_opens BOOLEAN DEFAULT true,
    track_clicks BOOLEAN DEFAULT true,
    
    -- Límites y cuotas
    daily_sms_limit INTEGER DEFAULT 1000,
    daily_email_limit INTEGER DEFAULT 2000,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    last_test_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_brevo_campaigns_user_id ON brevo_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_brevo_campaigns_status ON brevo_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_brevo_campaigns_type ON brevo_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_brevo_campaigns_created_at ON brevo_campaigns(created_at);

CREATE INDEX IF NOT EXISTS idx_brevo_recipients_campaign_id ON brevo_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_brevo_recipients_status ON brevo_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_brevo_recipients_email ON brevo_campaign_recipients(email);
CREATE INDEX IF NOT EXISTS idx_brevo_recipients_phone ON brevo_campaign_recipients(phone_number);

CREATE INDEX IF NOT EXISTS idx_brevo_templates_user_id ON brevo_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_brevo_templates_type ON brevo_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_brevo_templates_active ON brevo_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_brevo_statistics_user_id ON brevo_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_brevo_statistics_date ON brevo_statistics(date);
CREATE INDEX IF NOT EXISTS idx_brevo_statistics_period ON brevo_statistics(period_type);

CREATE INDEX IF NOT EXISTS idx_brevo_config_user_id ON brevo_user_config(user_id);

-- Función para actualizar el updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_brevo_campaigns_updated_at 
    BEFORE UPDATE ON brevo_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brevo_campaign_recipients_updated_at 
    BEFORE UPDATE ON brevo_campaign_recipients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brevo_templates_updated_at 
    BEFORE UPDATE ON brevo_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brevo_statistics_updated_at 
    BEFORE UPDATE ON brevo_statistics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brevo_user_config_updated_at 
    BEFORE UPDATE ON brevo_user_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de RLS (Row Level Security)
ALTER TABLE brevo_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE brevo_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE brevo_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE brevo_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE brevo_user_config ENABLE ROW LEVEL SECURITY;

-- Políticas para brevo_campaigns
CREATE POLICY "Users can view their own campaigns" ON brevo_campaigns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns" ON brevo_campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" ON brevo_campaigns
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" ON brevo_campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para brevo_campaign_recipients
CREATE POLICY "Users can view their own campaign recipients" ON brevo_campaign_recipients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brevo_campaigns 
            WHERE id = campaign_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own campaign recipients" ON brevo_campaign_recipients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM brevo_campaigns 
            WHERE id = campaign_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own campaign recipients" ON brevo_campaign_recipients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM brevo_campaigns 
            WHERE id = campaign_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own campaign recipients" ON brevo_campaign_recipients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM brevo_campaigns 
            WHERE id = campaign_id AND user_id = auth.uid()
        )
    );

-- Políticas para brevo_templates
CREATE POLICY "Users can view their own templates" ON brevo_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON brevo_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON brevo_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON brevo_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para brevo_statistics
CREATE POLICY "Users can view their own statistics" ON brevo_statistics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" ON brevo_statistics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" ON brevo_statistics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own statistics" ON brevo_statistics
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para brevo_user_config
CREATE POLICY "Users can view their own config" ON brevo_user_config
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own config" ON brevo_user_config
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config" ON brevo_user_config
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own config" ON brevo_user_config
    FOR DELETE USING (auth.uid() = user_id);

-- Funciones de utilidad
CREATE OR REPLACE FUNCTION get_brevo_campaign_stats(p_campaign_id UUID)
RETURNS TABLE(
    total_recipients BIGINT,
    sent_count BIGINT,
    delivered_count BIGINT,
    failed_count BIGINT,
    opened_count BIGINT,
    clicked_count BIGINT,
    delivery_rate DECIMAL,
    open_rate DECIMAL,
    click_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_recipients,
        COUNT(CASE WHEN status = 'sent' THEN 1 END)::BIGINT as sent_count,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END)::BIGINT as delivered_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END)::BIGINT as failed_count,
        COUNT(CASE WHEN status = 'opened' THEN 1 END)::BIGINT as opened_count,
        COUNT(CASE WHEN status = 'clicked' THEN 1 END)::BIGINT as clicked_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN status = 'delivered' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
            ELSE 0 
        END as delivery_rate,
        CASE 
            WHEN COUNT(CASE WHEN status IN ('sent', 'delivered', 'opened', 'clicked') THEN 1 END) > 0 THEN 
                ROUND((COUNT(CASE WHEN status = 'opened' THEN 1 END)::DECIMAL / COUNT(CASE WHEN status IN ('sent', 'delivered', 'opened', 'clicked') THEN 1 END)::DECIMAL) * 100, 2)
            ELSE 0 
        END as open_rate,
        CASE 
            WHEN COUNT(CASE WHEN status IN ('sent', 'delivered', 'opened', 'clicked') THEN 1 END) > 0 THEN 
                ROUND((COUNT(CASE WHEN status = 'clicked' THEN 1 END)::DECIMAL / COUNT(CASE WHEN status IN ('sent', 'delivered', 'opened', 'clicked') THEN 1 END)::DECIMAL) * 100, 2)
            ELSE 0 
        END as click_rate
    FROM brevo_campaign_recipients
    WHERE campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Datos de ejemplo
INSERT INTO brevo_templates (id, user_id, name, description, template_type, subject, content, variables) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'SMS de Bienvenida',
    'Plantilla para mensaje de bienvenida a nuevos empleados',
    'sms',
    NULL,
    '¡Hola {{nombre}}! Bienvenido a {{empresa}}. Tu primer día será el {{fecha_inicio}}. Reporta a {{supervisor}}. ¡Te esperamos!',
    '["nombre", "empresa", "fecha_inicio", "supervisor"]'
),
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'Email de Recordatorio',
    'Plantilla para recordatorios de reuniones',
    'email',
    'Recordatorio: {{tipo_reunion}} - {{fecha}}',
    '<h2>Recordatorio de {{tipo_reunion}}</h2>
     <p>Estimado/a {{nombre}},</p>
     <p>Te recordamos que tienes una {{tipo_reunion}} programada para el <strong>{{fecha}}</strong> a las <strong>{{hora}}</strong>.</p>
     <p><strong>Lugar:</strong> {{lugar}}</p>
     <p><strong>Agenda:</strong> {{agenda}}</p>
     <p>Por favor confirma tu asistencia.</p>
     <br>
     <p>Saludos cordiales,<br>{{departamento}}</p>',
    '["nombre", "tipo_reunion", "fecha", "hora", "lugar", "agenda", "departamento"]'
) ON CONFLICT DO NOTHING;

-- Comentarios sobre el esquema
COMMENT ON TABLE brevo_campaigns IS 'Tabla principal para almacenar campañas de SMS y Email';
COMMENT ON TABLE brevo_campaign_recipients IS 'Destinatarios individuales de cada campaña';
COMMENT ON TABLE brevo_templates IS 'Plantillas reutilizables para mensajes';
COMMENT ON TABLE brevo_statistics IS 'Estadísticas agregadas de envío';
COMMENT ON TABLE brevo_user_config IS 'Configuración personal de Brevo por usuario';