-- ========================================
-- SISTEMA MULTI-EMPRESA COMPLETO
-- Base de datos para gestión de agencias y múltiples clientes
-- ========================================

-- 1. TABLA DE AGENCIAS
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Chile',
    
    -- Configuración de límites
    max_companies INTEGER DEFAULT 50,
    default_monthly_limit INTEGER DEFAULT 1000,
    default_daily_limit INTEGER DEFAULT 50,
    default_message_cost DECIMAL(10, 4) DEFAULT 0.0525,
    
    -- Configuración de facturación
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    tax_rate DECIMAL(5, 4) DEFAULT 0.19,
    currency VARCHAR(3) DEFAULT 'CLP',
    
    -- Estado y metadata
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
    plan_type VARCHAR(50) DEFAULT 'basic',
    subscription_id VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT agencies_name_check CHECK (length(name) >= 2),
    CONSTRAINT agencies_rut_check CHECK (length(rut) >= 8),
    CONSTRAINT agencies_email_check CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 2. TABLA DE EMPRESAS/CLIENTES (Actualizada)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    
    -- Información básica
    name VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Chile',
    industry VARCHAR(100),
    website VARCHAR(255),
    
    -- Configuración de límites y costos
    monthly_limit INTEGER NOT NULL DEFAULT 1000,
    daily_limit INTEGER NOT NULL DEFAULT 50,
    message_cost DECIMAL(10, 4) NOT NULL DEFAULT 0.0525,
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    billing_email VARCHAR(255),
    
    -- Configuración de canales (nuevos campos)
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT true,
    telegram_enabled BOOLEAN DEFAULT false,
    whatsapp_enabled BOOLEAN DEFAULT false,
    groq_enabled BOOLEAN DEFAULT false,
    google_enabled BOOLEAN DEFAULT false,
    microsoft_enabled BOOLEAN DEFAULT false,
    slack_enabled BOOLEAN DEFAULT false,
    teams_enabled BOOLEAN DEFAULT false,
    hubspot_enabled BOOLEAN DEFAULT false,
    salesforce_enabled BOOLEAN DEFAULT false,
    
    -- Configuración de WhatsApp
    whatsapp_configured BOOLEAN DEFAULT false,
    whatsapp_status VARCHAR(20) DEFAULT 'not_configured' CHECK (whatsapp_status IN ('not_configured', 'pending', 'active', 'suspended', 'error')),
    
    -- Configuración de URLs por empresa
    company_url VARCHAR(255),
    webhook_url VARCHAR(500),
    api_endpoint VARCHAR(255),
    
    -- Estado y metadata
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'inactive')),
    plan_type VARCHAR(50) DEFAULT 'basic',
    subscription_id VARCHAR(100),
    
    -- Control de acceso
    requires_approval BOOLEAN DEFAULT false,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    suspended_at TIMESTAMP WITH TIME ZONE,
    reactivated_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT companies_name_check CHECK (length(name) >= 2),
    CONSTRAINT companies_rut_check CHECK (length(rut) >= 8),
    CONSTRAINT companies_email_check CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT companies_limits_check CHECK (monthly_limit > 0 AND daily_limit > 0),
    CONSTRAINT companies_cost_check CHECK (message_cost >= 0)
);

-- 3. TABLA DE CONFIGURACIÓN DE CANALES POR EMPRESA
CREATE TABLE IF NOT EXISTS company_channel_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN ('email', 'sms', 'whatsapp', 'telegram', 'groq', 'google', 'microsoft', 'slack', 'teams', 'hubspot', 'salesforce')),
    
    -- Credenciales encriptadas
    credentials JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_configured BOOLEAN DEFAULT false,
    
    -- Configuración específica del canal
    configuration JSONB DEFAULT '{}',
    webhook_url VARCHAR(500),
    api_key VARCHAR(500),
    phone_number VARCHAR(50),
    
    -- Límites por canal
    daily_limit INTEGER,
    monthly_limit INTEGER,
    
    -- Estado y metadata
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
    last_test_at TIMESTAMP WITH TIME ZONE,
    last_test_result JSONB,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT company_channel_unique UNIQUE(company_id, channel_type)
);

-- 4. TABLA DE CONFIGURACIÓN DE WHATSAPP POR EMPRESA
CREATE TABLE IF NOT EXISTS whatsapp_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Configuración de Meta API
    access_token VARCHAR(1000) NOT NULL,
    phone_number_id VARCHAR(100) NOT NULL,
    webhook_verify_token VARCHAR(255),
    webhook_url VARCHAR(500),
    
    -- Información del número
    phone_number VARCHAR(50) NOT NULL,
    display_name VARCHAR(255),
    quality_rating VARCHAR(20),
    
    -- Configuración de límites
    rate_limit_per_second INTEGER DEFAULT 10,
    rate_limit_per_minute INTEGER DEFAULT 100,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    
    -- Estado
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'pending', 'suspended', 'error')),
    is_verified BOOLEAN DEFAULT false,
    
    -- Estadísticas
    messages_sent INTEGER DEFAULT 0,
    messages_delivered INTEGER DEFAULT 0,
    messages_read INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT whatsapp_configs_unique UNIQUE(company_id)
);

-- 5. TABLA DE CONTADORES DE USO POR EMPRESA
CREATE TABLE IF NOT EXISTS company_usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL, -- YYYY-MM-DD para uso diario, YYYY-MM para uso mensual
    period_type VARCHAR(10) NOT NULL CHECK (period_type IN ('daily', 'monthly')),
    
    -- Contadores
    daily_count INTEGER DEFAULT 0,
    monthly_count INTEGER DEFAULT 0,
    daily_cost DECIMAL(10, 2) DEFAULT 0,
    monthly_cost DECIMAL(10, 2) DEFAULT 0,
    
    -- Contadores por canal
    email_count INTEGER DEFAULT 0,
    sms_count INTEGER DEFAULT 0,
    whatsapp_count INTEGER DEFAULT 0,
    telegram_count INTEGER DEFAULT 0,
    other_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT usage_counters_unique UNIQUE(company_id, date, period_type)
);

-- 6. TABLA DE LOGS DE USO DETALLADOS
CREATE TABLE IF NOT EXISTS company_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Información del mensaje
    message_count INTEGER NOT NULL DEFAULT 1,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'document', 'template', 'interactive')),
    channel VARCHAR(50) NOT NULL,
    
    -- Costos
    cost DECIMAL(10, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CLP',
    
    -- Destinatarios
    recipient_count INTEGER DEFAULT 1,
    
    -- Metadata adicional
    metadata JSONB DEFAULT '{}',
    campaign_id VARCHAR(100),
    template_name VARCHAR(255),
    
    -- Estado
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'cancelled')),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA DE CONFIGURACIÓN DE FACTURACIÓN
CREATE TABLE IF NOT EXISTS company_billing_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Configuración de facturación
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    billing_email VARCHAR(255) NOT NULL,
    auto_generate_invoices BOOLEAN DEFAULT true,
    
    -- Método de pago
    payment_method VARCHAR(50) DEFAULT 'manual' CHECK (payment_method IN ('manual', 'automatic', 'stripe', 'paypal', 'transfer')),
    payment_token VARCHAR(500),
    
    -- Configuración de impuestos
    tax_rate DECIMAL(5, 4) DEFAULT 0.19,
    tax_id VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'CLP',
    
    -- Configuración de recordatorios
    reminder_days_before INTEGER DEFAULT 3,
    reminder_days_after INTEGER DEFAULT 7,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT billing_config_unique UNIQUE(company_id)
);

-- 8. TABLA DE FACTURAS
CREATE TABLE IF NOT EXISTS company_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Información de la factura
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    -- Montos
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CLP',
    
    -- Estado
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
    payment_date DATE,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    
    -- Detalles de uso
    usage_summary JSONB DEFAULT '{}',
    
    -- Archivos
    pdf_url VARCHAR(500),
    xml_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT invoices_positive_amounts CHECK (subtotal >= 0 AND tax_amount >= 0 AND total_amount >= 0)
);

-- 9. TABLA DE ROLES POR EMPRESA
CREATE TABLE IF NOT EXISTS company_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Información del rol
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Permisos (array de strings)
    permissions JSONB DEFAULT '[]',
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_system_role BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT company_roles_unique UNIQUE(company_id, name)
);

-- 10. TABLA DE USUARIOS POR EMPRESA
CREATE TABLE IF NOT EXISTS company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES company_roles(id),
    
    -- Información adicional
    department VARCHAR(100),
    position VARCHAR(100),
    cost_center VARCHAR(100),
    
    -- Permisos adicionales específicos
    additional_permissions JSONB DEFAULT '[]',
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT company_users_unique UNIQUE(company_id, user_id)
);

-- 11. TABLA DE NOTIFICACIONES POR EMPRESA
CREATE TABLE IF NOT EXISTS company_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Información de la notificación
    type VARCHAR(50) NOT NULL CHECK (type IN ('limit_warning', 'limit_reached', 'invoice_generated', 'payment_due', 'system_alert', 'feature_update')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Configuración
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Canales de envío
    send_email BOOLEAN DEFAULT true,
    send_sms BOOLEAN DEFAULT false,
    send_whatsapp BOOLEAN DEFAULT false,
    send_dashboard BOOLEAN DEFAULT true,
    
    -- Estado
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABLA DE CONFIGURACIÓN DE INTEGRACIONES POR EMPRESA
CREATE TABLE IF NOT EXISTS company_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Información de la integración
    integration_type VARCHAR(100) NOT NULL,
    integration_name VARCHAR(255) NOT NULL,
    
    -- Configuración
    config JSONB NOT NULL DEFAULT '{}',
    credentials JSONB DEFAULT '{}',
    webhook_url VARCHAR(500),
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_configured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
    
    -- Sincronización
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency INTEGER DEFAULT 3600, -- en segundos
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT company_integrations_unique UNIQUE(company_id, integration_type, integration_name)
);

-- ========================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================

-- Índices para agencies
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(status);
CREATE INDEX IF NOT EXISTS idx_agencies_created_at ON agencies(created_at);

-- Índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_agency_id ON companies(agency_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_rut ON companies(rut);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_plan_type ON companies(plan_type);

-- Índices para company_channel_credentials
CREATE INDEX IF NOT EXISTS idx_channel_credentials_company_id ON company_channel_credentials(company_id);
CREATE INDEX IF NOT EXISTS idx_channel_credentials_type ON company_channel_credentials(channel_type);
CREATE INDEX IF NOT EXISTS idx_channel_credentials_status ON company_channel_credentials(status);

-- Índices para whatsapp_configs
CREATE INDEX IF NOT EXISTS idx_whatsapp_configs_company_id ON whatsapp_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_configs_status ON whatsapp_configs(status);

-- Índices para company_usage_counters
CREATE INDEX IF NOT EXISTS idx_usage_counters_company_id ON company_usage_counters(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_date ON company_usage_counters(date);
CREATE INDEX IF NOT EXISTS idx_usage_counters_period ON company_usage_counters(period_type);
CREATE INDEX IF NOT EXISTS idx_usage_counters_composite ON company_usage_counters(company_id, date, period_type);

-- Índices para company_usage_logs
CREATE INDEX IF NOT EXISTS idx_usage_logs_company_id ON company_usage_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON company_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_channel ON company_usage_logs(channel);
CREATE INDEX IF NOT EXISTS idx_usage_logs_status ON company_usage_logs(status);

-- Índices para company_invoices
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON company_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON company_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON company_invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON company_invoices(due_date);

-- Índices para company_users
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_role_id ON company_users(role_id);
CREATE INDEX IF NOT EXISTS idx_company_users_is_active ON company_users(is_active);

-- Índices para company_notifications
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON company_notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON company_notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON company_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON company_notifications(created_at);

-- Índices para company_integrations
CREATE INDEX IF NOT EXISTS idx_integrations_company_id ON company_integrations(company_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON company_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON company_integrations(status);

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
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channel_credentials_updated_at BEFORE UPDATE ON company_channel_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_configs_updated_at BEFORE UPDATE ON whatsapp_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_counters_updated_at BEFORE UPDATE ON company_usage_counters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_config_updated_at BEFORE UPDATE ON company_billing_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON company_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_roles_updated_at BEFORE UPDATE ON company_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_users_updated_at BEFORE UPDATE ON company_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON company_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON company_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para incrementar contadores de uso diario
CREATE OR REPLACE FUNCTION increment_daily_usage(
    p_company_id UUID,
    p_date DATE,
    p_message_count INTEGER,
    p_cost DECIMAL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO company_usage_counters (
        company_id, 
        date, 
        period_type, 
        daily_count, 
        daily_cost,
        created_at,
        updated_at
    ) VALUES (
        p_company_id, 
        p_date, 
        'daily', 
        p_message_count, 
        p_cost,
        NOW(),
        NOW()
    )
    ON CONFLICT (company_id, date, period_type)
    DO UPDATE SET
        daily_count = company_usage_counters.daily_count + p_message_count,
        daily_cost = company_usage_counters.daily_cost + p_cost,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar contadores de uso mensual
CREATE OR REPLACE FUNCTION increment_monthly_usage(
    p_company_id UUID,
    p_month TEXT, -- YYYY-MM
    p_message_count INTEGER,
    p_cost DECIMAL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO company_usage_counters (
        company_id, 
        date, 
        period_type, 
        monthly_count, 
        monthly_cost,
        created_at,
        updated_at
    ) VALUES (
        p_company_id, 
        p_month::DATE, 
        'monthly', 
        p_message_count, 
        p_cost,
        NOW(),
        NOW()
    )
    ON CONFLICT (company_id, date, period_type)
    DO UPDATE SET
        monthly_count = company_usage_counters.monthly_count + p_message_count,
        monthly_cost = company_usage_counters.monthly_cost + p_cost,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_channel_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_billing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_integrations ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidad)
-- Estas son políticas de ejemplo, deberían ser más específicas en producción

CREATE POLICY "Agencias: Solo usuarios autenticados" ON agencies
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Empresas: Solo usuarios autenticados" ON companies
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Channel credentials: Solo usuarios autenticados" ON company_channel_credentials
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "WhatsApp configs: Solo usuarios autenticados" ON whatsapp_configs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usage counters: Solo usuarios autenticados" ON company_usage_counters
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usage logs: Solo usuarios autenticados" ON company_usage_logs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Billing config: Solo usuarios autenticados" ON company_billing_config
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Invoices: Solo usuarios autenticados" ON company_invoices
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Company roles: Solo usuarios autenticados" ON company_roles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Company users: Solo usuarios autenticados" ON company_users
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Notifications: Solo usuarios autenticados" ON company_notifications
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Integrations: Solo usuarios autenticados" ON company_integrations
    FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- DATOS INICIALES (OPCIONAL)
-- ========================================

-- Insertar agencia de ejemplo (comentar en producción)
-- INSERT INTO agencies (name, rut, contact_email, contact_phone) 
-- VALUES ('Agencia Ejemplo', '76.123.456-7', 'contacto@ejemplo.com', '+56912345678');

-- Insertar roles básicos (comentar en producción)
-- INSERT INTO company_roles (company_id, name, description, permissions, is_system_role)
-- VALUES 
-- (gen_random_uuid(), 'admin', 'Administrador de la empresa', '["*"]', true),
-- (gen_random_uuid(), 'manager', 'Gestor de comunicaciones', '["read", "write", "send_messages"]', true),
-- (gen_random_uuid(), 'user', 'Usuario básico', '["read"]', true);

-- ========================================
-- COMENTARIOS FINALES
-- ========================================

/*
Este script crea la estructura completa para un sistema multi-empresa que incluye:

1. Gestión de agencias y múltiples clientes
2. Configuración independiente de canales por empresa
3. Control de límites de uso y costos
4. Sistema de facturación completo
5. Gestión de roles y permisos por empresa
6. Sistema de notificaciones
7. Integraciones con servicios externos
8. Auditoría completa de uso
9. Row Level Security para aislamiento de datos

Para usar este sistema:
1. Ejecutar este script en la base de datos de Supabase
2. Configurar las políticas RLS según los roles específicos
3. Implementar el middleware en la aplicación para verificar permisos
4. Configurar los webhooks y endpoints necesarios
5. Implementar el sistema de facturación automática

Las tablas están diseñadas para escalabilidad y incluyen índices optimizados
para consultas frecuentes en un entorno multi-empresa.
*/