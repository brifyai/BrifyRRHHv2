-- =========================================
-- TABLA DE CONFIGURACIONES DEL SISTEMA
-- =========================================
-- Esta tabla reemplaza el uso excesivo de localStorage
-- para configuraciones críticas del sistema

-- Crear tabla de configuraciones del sistema
CREATE TABLE IF NOT EXISTS system_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Configuración global vs por empresa
    scope TEXT NOT NULL CHECK (scope IN ('global', 'company')),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

    -- Categoría de configuración
    category TEXT NOT NULL CHECK (category IN (
        'integrations', 'notifications', 'security', 'dashboard',
        'communication', 'appearance', 'performance', 'backup'
    )),

    -- Clave de configuración
    config_key TEXT NOT NULL,

    -- Valor de configuración (JSON para flexibilidad)
    config_value JSONB NOT NULL,

    -- Metadatos
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Índices únicos para evitar duplicados
    UNIQUE(user_id, scope, company_id, category, config_key)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_system_configurations_user_scope
ON system_configurations(user_id, scope);

CREATE INDEX IF NOT EXISTS idx_system_configurations_category
ON system_configurations(category);

CREATE INDEX IF NOT EXISTS idx_system_configurations_company
ON system_configurations(company_id) WHERE company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_system_configurations_active
ON system_configurations(is_active) WHERE is_active = TRUE;

-- Índice único parcial para configuraciones globales (sin company_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_configurations_global_unique
ON system_configurations(user_id, scope, category, config_key)
WHERE company_id IS NULL;

-- Políticas RLS (Row Level Security)
ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: solo pueden ver/editar sus propias configuraciones
CREATE POLICY "Users can view their own configurations"
ON system_configurations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configurations"
ON system_configurations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configurations"
ON system_configurations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configurations"
ON system_configurations FOR DELETE
USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_system_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_configurations_updated_at
    BEFORE UPDATE ON system_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_system_configurations_updated_at();

-- Comentarios en la tabla
COMMENT ON TABLE system_configurations IS 'Tabla centralizada para configuraciones del sistema, reemplaza localStorage';
COMMENT ON COLUMN system_configurations.scope IS 'Alcance de la configuración: global o company';
COMMENT ON COLUMN system_configurations.category IS 'Categoría de configuración (integrations, notifications, etc.)';
COMMENT ON COLUMN system_configurations.config_key IS 'Clave única de la configuración';
COMMENT ON COLUMN system_configurations.config_value IS 'Valor JSON de la configuración';
COMMENT ON COLUMN system_configurations.is_encrypted IS 'Indica si el valor está encriptado';

-- Insertar configuraciones por defecto para integraciones críticas
-- (Estos serán migrados desde localStorage durante el proceso de actualización)

-- Configuración por defecto para notificaciones
INSERT INTO system_configurations (user_id, scope, company_id, category, config_key, config_value, description)
SELECT
    auth.uid(),
    'global',
    NULL,
    'notifications',
    'email_settings',
    '{
        "messagesSent": true,
        "systemErrors": true,
        "weeklyReports": false,
        "tokenLimits": true
    }'::jsonb,
    'Configuración por defecto de notificaciones por email'
WHERE NOT EXISTS (
    SELECT 1 FROM system_configurations
    WHERE user_id = auth.uid()
    AND scope = 'global'
    AND category = 'notifications'
    AND config_key = 'email_settings'
);

-- Configuración por defecto para seguridad
INSERT INTO system_configurations (user_id, scope, company_id, category, config_key, config_value, description)
SELECT
    auth.uid(),
    'global',
    NULL,
    'security',
    'session_settings',
    '{
        "twoFactorEnabled": false,
        "sessionTimeout": 30,
        "loginAttempts": 5,
        "lockoutDuration": 15,
        "auditLogEnabled": true
    }'::jsonb,
    'Configuración por defecto de seguridad de sesión'
WHERE NOT EXISTS (
    SELECT 1 FROM system_configurations
    WHERE user_id = auth.uid()
    AND scope = 'global'
    AND category = 'security'
    AND config_key = 'session_settings'
);

-- Configuración por defecto para dashboard
INSERT INTO system_configurations (user_id, scope, company_id, category, config_key, config_value, description)
SELECT
    auth.uid(),
    'global',
    NULL,
    'dashboard',
    'layout_settings',
    '{
        "theme": "light",
        "compactMode": false,
        "widgetsOrder": ["companies", "employees", "communications", "storage"]
    }'::jsonb,
    'Configuración por defecto del dashboard'
WHERE NOT EXISTS (
    SELECT 1 FROM system_configurations
    WHERE user_id = auth.uid()
    AND scope = 'global'
    AND category = 'dashboard'
    AND config_key = 'layout_settings'
);