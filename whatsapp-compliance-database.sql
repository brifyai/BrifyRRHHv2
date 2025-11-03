-- ========================================
-- TABLAS ADICIONALES PARA CUMPLIMIENTO DE WHATSAPP BUSINESS
-- 
-- Este script crea las tablas necesarias para asegurar que StaffHub
-- cumpla con las políticas actualizadas de WhatsApp Business (2024-2025)
-- ========================================

-- 1. TABLA DE CONSENTIMIENTO DE USUARIOS
CREATE TABLE IF NOT EXISTS user_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('marketing', 'utility', 'authentication', 'transactional')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    
    -- Fechas importantes
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos del consentimiento
    source VARCHAR(50) DEFAULT 'manual', -- manual, webform, sms, email
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_consent_unique UNIQUE(company_id, phone_number),
    CONSTRAINT user_consent_phone_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$'),
    CONSTRAINT user_consent_expires_after_granted CHECK (expires_at > granted_at)
);

-- 2. TABLA DE INTERACCIONES DE USUARIOS
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    
    -- Tipo de interacción
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN (
        'message_sent', 'message_received', 'message_read', 
        'button_click', 'link_click', 'form_submit', 'opt_out',
        'opt_in', 'survey_response', 'support_request'
    )),
    
    -- Detalles de la interacción
    message_id VARCHAR(100),
    message_content TEXT,
    template_name VARCHAR(100),
    campaign_id VARCHAR(100),
    
    -- Contexto
    direction VARCHAR(20) DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound', 'status_update')),
    channel VARCHAR(20) DEFAULT 'whatsapp',
    
    -- Metadatos
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_interactions_phone_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$')
);

-- 3. TABLA DE LOGS DE CUMPLIMIENTO
CREATE TABLE IF NOT EXISTS compliance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Información del evento
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'consent_granted', 'consent_revoked', 'consent_expired',
        'message_blocked', 'template_rejected', 'quality_alert',
        'rate_limit_exceeded', 'policy_violation', 'audit_event'
    )),
    
    -- Detalles del evento
    details JSONB NOT NULL DEFAULT '{}',
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    
    -- Información de usuario
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    
    -- Contexto adicional
    phone_number VARCHAR(20),
    message_id VARCHAR(100),
    template_name VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT compliance_logs_event_type_not_null CHECK (event_type IS NOT NULL),
    CONSTRAINT compliance_logs_details_not_null CHECK (details IS NOT NULL)
);

-- 4. TABLA DE VALIDACIÓN DE CONTENIDO
CREATE TABLE IF NOT EXISTS content_validation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Contenido a validar
    content_hash VARCHAR(64) NOT NULL, -- SHA-256 del contenido
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('text', 'template', 'media')),
    content_preview TEXT,
    
    -- Resultado de validación
    is_valid BOOLEAN NOT NULL,
    validation_score DECIMAL(3,2) DEFAULT 0, -- 0.00 a 1.00
    violations JSONB DEFAULT '[]',
    
    -- Categorías de violación
    prohibited_content BOOLEAN DEFAULT false,
    spam_indicators BOOLEAN DEFAULT false,
    policy_violations BOOLEAN DEFAULT false,
    
    -- Metadatos
    validation_rules JSONB DEFAULT '{}',
    ai_analysis JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Constraints
    CONSTRAINT content_validation_unique UNIQUE(company_id, content_hash, content_type)
);

-- 5. TABLA DE CALIDAD DE NÚMEROS
CREATE TABLE IF NOT EXISTS whatsapp_quality_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    phone_number_id VARCHAR(50) NOT NULL,
    
    -- Métricas de calidad
    quality_rating VARCHAR(10) CHECK (quality_rating IN ('GREEN', 'YELLOW', 'RED', 'UNKNOWN')),
    quality_score DECIMAL(3,2), -- 0.00 a 1.00
    
    -- Estadísticas de mensajería
    messages_sent INTEGER DEFAULT 0,
    messages_delivered INTEGER DEFAULT 0,
    messages_read INTEGER DEFAULT 0,
    messages_failed INTEGER DEFAULT 0,
    
    -- Tasas
    delivery_rate DECIMAL(5,2), -- Porcentaje
    read_rate DECIMAL(5,2), -- Porcentaje
    response_rate DECIMAL(5,2), -- Porcentaje
    
    -- Quejas y bloqueos
    user_complaints INTEGER DEFAULT 0,
    blocked_users INTEGER DEFAULT 0,
    
    -- Límites actuales
    current_daily_limit INTEGER DEFAULT 1000,
    current_monthly_limit INTEGER DEFAULT 30000,
    messages_per_second INTEGER DEFAULT 10,
    
    -- Estado del número
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_quality_check TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    quality_factors JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT whatsapp_quality_unique UNIQUE(company_id, phone_number_id),
    CONSTRAINT whatsapp_quality_rates CHECK (
        delivery_rate >= 0 AND delivery_rate <= 100 AND
        read_rate >= 0 AND read_rate <= 100 AND
        response_rate >= 0 AND response_rate <= 100
    )
);

-- 6. TABLA DE PLANTILLAS VALIDADAS
CREATE TABLE IF NOT EXISTS validated_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Información de la plantilla
    template_name VARCHAR(255) NOT NULL,
    template_category VARCHAR(50) NOT NULL CHECK (template_category IN ('marketing', 'utility', 'authentication')),
    language VARCHAR(10) DEFAULT 'es',
    
    -- Estado de validación
    validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN (
        'pending', 'approved', 'rejected', 'needs_review', 'expired'
    )),
    
    -- Resultados de validación
    is_compliant BOOLEAN DEFAULT false,
    compliance_score DECIMAL(3,2) DEFAULT 0,
    violations JSONB DEFAULT '[]',
    
    -- Contenido analizado
    header_content TEXT,
    body_content TEXT,
    footer_content TEXT,
    buttons JSONB DEFAULT '[]',
    
    -- Validaciones específicas
    has_opt_out BOOLEAN DEFAULT false,
    has_contact_info BOOLEAN DEFAULT false,
    has_pricing_info BOOLEAN DEFAULT false,
    has_time_sensitive_info BOOLEAN DEFAULT false,
    
    -- Metadatos
    validation_rules JSONB DEFAULT '{}',
    reviewer_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT validated_templates_unique UNIQUE(company_id, template_name, language)
);

-- 7. TABLA DE RATE LIMITING DINÁMICO
CREATE TABLE IF NOT EXISTS dynamic_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    phone_number_id VARCHAR(50) NOT NULL,
    
    -- Límites configurados
    base_daily_limit INTEGER DEFAULT 1000,
    base_monthly_limit INTEGER DEFAULT 30000,
    messages_per_second INTEGER DEFAULT 10,
    messages_per_minute INTEGER DEFAULT 100,
    
    -- Factores de ajuste
    quality_multiplier DECIMAL(3,2) DEFAULT 1.0,
    consent_rate_multiplier DECIMAL(3,2) DEFAULT 1.0,
    complaint_rate_multiplier DECIMAL(3,2) DEFAULT 1.0,
    
    -- Límites calculados
    effective_daily_limit INTEGER,
    effective_monthly_limit INTEGER,
    effective_messages_per_second INTEGER,
    
    -- Estado actual
    current_usage_daily INTEGER DEFAULT 0,
    current_usage_monthly INTEGER DEFAULT 0,
    last_reset_date DATE,
    
    -- Control de sobrecarga
    is_throttled BOOLEAN DEFAULT false,
    throttle_reason VARCHAR(100),
    throttle_until TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    adjustment_factors JSONB DEFAULT '{}',
    limit_history JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT dynamic_rate_limits_unique UNIQUE(company_id, phone_number_id),
    CONSTRAINT dynamic_rate_limits_multipliers CHECK (
        quality_multiplier >= 0 AND quality_multiplier <= 2 AND
        consent_rate_multiplier >= 0 AND consent_rate_multiplier <= 2 AND
        complaint_rate_multiplier >= 0 AND complaint_rate_multiplier <= 2
    )
);

-- 8. TABLA DE REPORTES DE CUMPLIMIENTO
CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Información del reporte
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'audit', 'violation', 'quality'
    )),
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    
    -- Métricas generales
    total_messages_sent INTEGER DEFAULT 0,
    total_messages_delivered INTEGER DEFAULT 0,
    total_messages_read INTEGER DEFAULT 0,
    total_messages_failed INTEGER DEFAULT 0,
    
    -- Métricas de cumplimiento
    consent_rate DECIMAL(5,2),
    opt_out_rate DECIMAL(5,2),
    complaint_rate DECIMAL(5,2),
    template_compliance_rate DECIMAL(5,2),
    
    -- Calidad y rendimiento
    average_quality_score DECIMAL(3,2),
    delivery_rate DECIMAL(5,2),
    read_rate DECIMAL(5,2),
    
    -- Violaciones y alertas
    total_violations INTEGER DEFAULT 0,
    critical_violations INTEGER DEFAULT 0,
    warnings_issued INTEGER DEFAULT 0,
    
    -- Estado del reporte
    status VARCHAR(20) DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'failed', 'archived')),
    
    -- Contenido del reporte
    report_data JSONB DEFAULT '{}',
    summary TEXT,
    recommendations JSONB DEFAULT '[]',
    
    -- Metadatos
    generated_by UUID REFERENCES users(id),
    report_format VARCHAR(20) DEFAULT 'json',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT compliance_reports_period CHECK (report_period_end >= report_period_start)
);

-- ========================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================

-- Índices para user_consent
CREATE INDEX IF NOT EXISTS idx_user_consent_company_phone ON user_consent(company_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_user_consent_status ON user_consent(status);
CREATE INDEX IF NOT EXISTS idx_user_consent_expires_at ON user_consent(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_consent_type ON user_consent(consent_type);

-- Índices para user_interactions
CREATE INDEX IF NOT EXISTS idx_user_interactions_company_phone ON user_interactions(company_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_interactions_direction ON user_interactions(direction);

-- Índices para compliance_logs
CREATE INDEX IF NOT EXISTS idx_compliance_logs_company ON compliance_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_event_type ON compliance_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_severity ON compliance_logs(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_created_at ON compliance_logs(created_at);

-- Índices para content_validation_cache
CREATE INDEX IF NOT EXISTS idx_content_validation_company_hash ON content_validation_cache(company_id, content_hash);
CREATE INDEX IF NOT EXISTS idx_content_validation_is_valid ON content_validation_cache(is_valid);
CREATE INDEX IF NOT EXISTS idx_content_validation_expires_at ON content_validation_cache(expires_at);

-- Índices para whatsapp_quality_monitoring
CREATE INDEX IF NOT EXISTS idx_whatsapp_quality_company ON whatsapp_quality_monitoring(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_quality_rating ON whatsapp_quality_monitoring(quality_rating);
CREATE INDEX IF NOT EXISTS idx_whatsapp_quality_active ON whatsapp_quality_monitoring(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_quality_updated ON whatsapp_quality_monitoring(updated_at);

-- Índices para validated_templates
CREATE INDEX IF NOT EXISTS idx_validated_templates_company ON validated_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_validated_templates_status ON validated_templates(validation_status);
CREATE INDEX IF NOT EXISTS idx_validated_templates_category ON validated_templates(template_category);
CREATE INDEX IF NOT EXISTS idx_validated_templates_expires ON validated_templates(expires_at);

-- Índices para dynamic_rate_limits
CREATE INDEX IF NOT EXISTS idx_dynamic_rate_limits_company ON dynamic_rate_limits(company_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_rate_limits_throttled ON dynamic_rate_limits(is_throttled);
CREATE INDEX IF NOT EXISTS idx_dynamic_rate_limits_updated ON dynamic_rate_limits(updated_at);

-- Índices para compliance_reports
CREATE INDEX IF NOT EXISTS idx_compliance_reports_company ON compliance_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_period ON compliance_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status ON compliance_reports(status);

-- ========================================
-- TRIGGERS Y FUNCIONES
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_user_consent_updated_at BEFORE UPDATE ON user_consent FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_interactions_updated_at BEFORE UPDATE ON user_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_quality_monitoring_updated_at BEFORE UPDATE ON whatsapp_quality_monitoring FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_validated_templates_updated_at BEFORE UPDATE ON validated_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_rate_limits_updated_at BEFORE UPDATE ON dynamic_rate_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_reports_updated_at BEFORE UPDATE ON compliance_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para verificar consentimiento antes de enviar mensaje
CREATE OR REPLACE FUNCTION check_consent_before_message(
    p_company_id UUID,
    p_phone_number VARCHAR(20)
)
RETURNS TABLE (
    has_consent BOOLEAN,
    consent_type VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN c.status = 'active' AND c.expires_at > NOW() THEN true
            ELSE false
        END as has_consent,
        c.consent_type,
        c.expires_at,
        c.status
    FROM user_consent c
    WHERE c.company_id = p_company_id
    AND c.phone_number = p_phone_number
    ORDER BY c.granted_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar ventana de 24 horas
CREATE OR REPLACE FUNCTION check_24h_window(
    p_company_id UUID,
    p_phone_number VARCHAR(20)
)
RETURNS TABLE (
    in_window BOOLEAN,
    last_interaction TIMESTAMP WITH TIME ZONE,
    hours_since_interaction DECIMAL(10,2),
    requires_template BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN MAX(ui.created_at) >= NOW() - INTERVAL '24 hours' THEN true
            ELSE false
        END as in_window,
        MAX(ui.created_at) as last_interaction,
        EXTRACT(EPOCH FROM (NOW() - MAX(ui.created_at))) / 3600 as hours_since_interaction,
        CASE 
            WHEN MAX(ui.created_at) >= NOW() - INTERVAL '24 hours' THEN false
            ELSE true
        END as requires_template
    FROM user_interactions ui
    WHERE ui.company_id = p_company_id
    AND ui.phone_number = p_phone_number
    AND ui.direction IN ('inbound', 'status_update')
    GROUP BY ui.company_id, ui.phone_number;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular límites dinámicos
CREATE OR REPLACE FUNCTION calculate_dynamic_limits(
    p_company_id UUID,
    p_phone_number_id VARCHAR(50)
)
RETURNS TABLE (
    daily_limit INTEGER,
    monthly_limit INTEGER,
    messages_per_second INTEGER,
    can_send BOOLEAN
) AS $$
DECLARE
    v_base_daily INTEGER := 1000;
    v_base_monthly INTEGER := 30000;
    v_base_mps INTEGER := 10;
    v_quality_mult DECIMAL := 1.0;
    v_consent_mult DECIMAL := 1.0;
    v_complaint_mult DECIMAL := 1.0;
    v_quality_rating VARCHAR(10);
    v_consent_rate DECIMAL := 1.0;
BEGIN
    -- Obtener rating de calidad
    SELECT wqm.quality_rating INTO v_quality_rating
    FROM whatsapp_quality_monitoring wqm
    WHERE wqm.company_id = p_company_id
    AND wqm.phone_number_id = p_phone_number_id;
    
    -- Calcular multiplicadores
    v_quality_mult := CASE 
        WHEN v_quality_rating = 'GREEN' THEN 1.5
        WHEN v_quality_rating = 'YELLOW' THEN 0.7
        WHEN v_quality_rating = 'RED' THEN 0.0
        ELSE 1.0
    END;
    
    -- Calcular tasa de consentimiento
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                COUNT(CASE WHEN status = 'active' THEN 1 END)::DECIMAL / COUNT(*)
            ELSE 0.5
        END INTO v_consent_rate
    FROM user_consent
    WHERE company_id = p_company_id;
    
    v_consent_mult := GREATEST(v_consent_rate, 0.1);
    
    -- Calcular límites efectivos
    RETURN QUERY
    SELECT 
        FLOOR(v_base_daily * v_quality_mult * v_consent_mult) as daily_limit,
        FLOOR(v_base_monthly * v_quality_mult * v_consent_mult) as monthly_limit,
        FLOOR(v_base_mps * v_quality_mult) as messages_per_second,
        (v_quality_rating != 'RED') as can_send;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista de estado de cumplimiento por empresa
CREATE OR REPLACE VIEW company_compliance_status AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    
    -- Métricas de consentimiento
    COALESCE(consent_stats.total_users, 0) as total_consented_users,
    COALESCE(consent_stats.active_users, 0) as active_consented_users,
    COALESCE(consent_stats.consent_rate, 0) as consent_rate,
    
    -- Métricas de calidad
    COALESCE(wqm.quality_rating, 'UNKNOWN') as quality_rating,
    COALESCE(wqm.quality_score, 0) as quality_score,
    
    -- Métricas de uso
    COALESCE(drl.effective_daily_limit, 1000) as daily_limit,
    COALESCE(drl.current_usage_daily, 0) as current_daily_usage,
    
    -- Estado general
    CASE 
        WHEN wqm.quality_rating = 'RED' THEN 'CRITICAL'
        WHEN consent_stats.consent_rate < 0.5 THEN 'WARNING'
        WHEN wqm.quality_rating = 'YELLOW' THEN 'WARNING'
        ELSE 'GOOD'
    END as compliance_status,
    
    -- Última actualización
    GREATEST(
        COALESCE(wqm.updated_at, '1970-01-01'::timestamp),
        COALESCE(drl.updated_at, '1970-01-01'::timestamp),
        COALESCE(consent_stats.last_updated, '1970-01-01'::timestamp)
    ) as last_updated
    
FROM companies c
LEFT JOIN (
    SELECT 
        company_id,
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::DECIMAL / COUNT(*) as consent_rate,
        MAX(updated_at) as last_updated
    FROM user_consent
    GROUP BY company_id
) consent_stats ON c.id = consent_stats.company_id
LEFT JOIN whatsapp_quality_monitoring wqm ON c.id = wqm.company_id
LEFT JOIN dynamic_rate_limits drl ON c.id = drl.company_id;

-- Vista de violaciones de políticas
CREATE OR REPLACE VIEW policy_violations AS
SELECT 
    cl.company_id,
    c.name as company_name,
    cl.event_type,
    cl.severity,
    cl.details,
    cl.created_at,
    cl.phone_number,
    cl.message_id,
    cl.user_id,
    u.email as user_email
    
FROM compliance_logs cl
JOIN companies c ON cl.company_id = c.id
LEFT JOIN users u ON cl.user_id = u.id
WHERE cl.event_type IN ('message_blocked', 'template_rejected', 'quality_alert', 'policy_violation')
ORDER BY cl.created_at DESC;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_validation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_quality_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE validated_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS
CREATE POLICY "Users can access their company consent data" ON user_consent
    FOR ALL USING (
        auth.uid() IN (
            SELECT cu.user_id FROM company_users cu 
            WHERE cu.company_id = user_consent.company_id 
            AND cu.is_active = true
        )
    );

CREATE POLICY "Users can access their company interactions" ON user_interactions
    FOR ALL USING (
        auth.uid() IN (
            SELECT cu.user_id FROM company_users cu 
            WHERE cu.company_id = user_interactions.company_id 
            AND cu.is_active = true
        )
    );

CREATE POLICY "Users can access their company compliance logs" ON compliance_logs
    FOR ALL USING (
        auth.uid() IN (
            SELECT cu.user_id FROM company_users cu 
            WHERE cu.company_id = compliance_logs.company_id 
            AND cu.is_active = true
        )
    );

-- Políticas para vistas (solo lectura)
CREATE POLICY "Users can view compliance status" ON company_compliance_status
    FOR SELECT USING (
        auth.uid() IN (
            SELECT cu.user_id FROM company_users cu 
            WHERE cu.company_id = company_compliance_status.company_id 
            AND cu.is_active = true
        )
    );

CREATE POLICY "Users can view policy violations" ON policy_violations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT cu.user_id FROM company_users cu 
            WHERE cu.company_id = policy_violations.company_id 
            AND cu.is_active = true
        )
    );

-- ========================================
-- COMENTARIOS FINALES
-- ========================================

/*
Este script crea la infraestructura de base de datos necesaria para asegurar
el cumplimiento de las políticas actualizadas de WhatsApp Business:

1. Gestión de consentimiento de usuarios (GDPR compliant)
2. Verificación de ventana de 24 horas
3. Monitoreo de calidad de números
4. Validación de contenido y plantillas
5. Rate limiting dinámico
6. Auditoría completa de eventos
7. Reportes de cumplimiento

Las políticas RLS aseguran que cada empresa solo pueda ver y modificar
sus propios datos de cumplimiento, manteniendo el aislamiento multi-empresa.

Para usar este sistema:
1. Ejecutar este script en la base de datos de Supabase
2. Integrar el servicio whatsappComplianceService.js en la aplicación
3. Actualizar los servicios existentes de WhatsApp para verificar cumplimiento
4. Configurar los webhooks para registrar interacciones
5. Implementar el monitoreo continuo de calidad

El sistema está diseñado para ser escalable y cumplir con las regulaciones
actuales y futuras de WhatsApp Business.
*/