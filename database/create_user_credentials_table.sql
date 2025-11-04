-- ========================================
-- CREAR TABLA USER_CREDENTIALS
-- Para almacenar credenciales de servicios externos
-- ========================================

-- Crear tabla user_credentials si no existe
CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Identificación del proveedor y servicio
    provider TEXT NOT NULL,
    service_type TEXT,
    
    -- Credenciales de Google
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expires_at TIMESTAMP WITH TIME ZONE,
    google_scope TEXT[],
    
    -- Credenciales de Microsoft
    microsoft_access_token TEXT,
    microsoft_refresh_token TEXT,
    microsoft_token_expires_at TIMESTAMP WITH TIME ZONE,
    microsoft_scope TEXT[],
    
    -- Credenciales de WhatsApp
    whatsapp_access_token TEXT,
    whatsapp_phone_number_id TEXT,
    whatsapp_webhook_secret TEXT,
    whatsapp_verify_token TEXT,
    
    -- Credenciales de Email (Brevo/Sendinblue)
    email_api_key TEXT,
    email_sender_email TEXT,
    email_sender_name TEXT,
    
    -- Credenciales de Zoom
    zoom_access_token TEXT,
    zoom_refresh_token TEXT,
    zoom_token_expires_at TIMESTAMP WITH TIME ZONE,
    zoom_scope TEXT[],
    
    -- Credenciales de Slack
    slack_access_token TEXT,
    slack_refresh_token TEXT,
    slack_token_expires_at TIMESTAMP WITH TIME ZONE,
    slack_scope TEXT[],
    
    -- Metadatos adicionales
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
);

-- ========================================
-- ÍNDICES para optimización
-- ========================================

CREATE INDEX IF NOT EXISTS idx_uc_user_id ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_uc_provider ON user_credentials(provider);
CREATE INDEX IF NOT EXISTS idx_uc_service_type ON user_credentials(service_type);
CREATE INDEX IF NOT EXISTS idx_uc_is_active ON user_credentials(is_active);
CREATE INDEX IF NOT EXISTS idx_uc_google_token ON user_credentials(google_access_token);
CREATE INDEX IF NOT EXISTS idx_uc_microsoft_token ON user_credentials(microsoft_access_token);
CREATE INDEX IF NOT EXISTS idx_uc_whatsapp_token ON user_credentials(whatsapp_access_token);

-- ========================================
-- TRIGGER para actualización automática de timestamps
-- ========================================

DROP TRIGGER IF EXISTS update_user_credentials_updated_at ON user_credentials;
CREATE TRIGGER update_user_credentials_updated_at
    BEFORE UPDATE ON user_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver sus propias credenciales
DROP POLICY IF EXISTS user_credentials_select_own ON user_credentials;
CREATE POLICY user_credentials_select_own ON user_credentials
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar sus propias credenciales
DROP POLICY IF EXISTS user_credentials_insert_own ON user_credentials;
CREATE POLICY user_credentials_insert_own ON user_credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar sus propias credenciales
DROP POLICY IF EXISTS user_credentials_update_own ON user_credentials;
CREATE POLICY user_credentials_update_own ON user_credentials
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar sus propias credenciales
DROP POLICY IF EXISTS user_credentials_delete_own ON user_credentials;
CREATE POLICY user_credentials_delete_own ON user_credentials
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Función para obtener credenciales activas de un usuario para un proveedor específico
CREATE OR REPLACE FUNCTION get_user_credentials(user_uuid UUID, provider_name TEXT)
RETURNS TABLE (
    id UUID,
    provider TEXT,
    service_type TEXT,
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
    email_api_key TEXT,
    zoom_access_token TEXT,
    zoom_refresh_token TEXT,
    zoom_token_expires_at TIMESTAMP WITH TIME ZONE,
    zoom_scope TEXT[],
    slack_access_token TEXT,
    slack_refresh_token TEXT,
    slack_token_expires_at TIMESTAMP WITH TIME ZONE,
    slack_scope TEXT[],
    is_active BOOLEAN,
    last_used_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uc.id,
        uc.provider,
        uc.service_type,
        uc.google_access_token,
        uc.google_refresh_token,
        uc.google_token_expires_at,
        uc.google_scope,
        uc.microsoft_access_token,
        uc.microsoft_refresh_token,
        uc.microsoft_token_expires_at,
        uc.microsoft_scope,
        uc.whatsapp_access_token,
        uc.whatsapp_phone_number_id,
        uc.email_api_key,
        uc.zoom_access_token,
        uc.zoom_refresh_token,
        uc.zoom_token_expires_at,
        uc.zoom_scope,
        uc.slack_access_token,
        uc.slack_refresh_token,
        uc.slack_token_expires_at,
        uc.slack_scope,
        uc.is_active,
        uc.last_used_at,
        uc.metadata
    FROM user_credentials uc
    WHERE uc.user_id = user_uuid 
        AND uc.provider = provider_name 
        AND uc.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar el último uso de credenciales
CREATE OR REPLACE FUNCTION update_credentials_usage(credentials_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_credentials 
    SET last_used_at = NOW()
    WHERE id = credentials_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un token ha expirado
CREATE OR REPLACE FUNCTION is_token_expired(expires_at TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN expires_at IS NOT NULL AND expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista para credenciales de Google activas
CREATE OR REPLACE VIEW active_google_credentials AS
SELECT 
    uc.id,
    uc.user_id,
    uc.google_access_token,
    uc.google_refresh_token,
    uc.google_token_expires_at,
    uc.google_scope,
    uc.is_active,
    uc.last_used_at,
    CASE 
        WHEN is_token_expired(uc.google_token_expires_at) THEN true
        ELSE false
    END as is_expired
FROM user_credentials uc
WHERE uc.google_access_token IS NOT NULL 
    AND uc.is_active = true;

-- Vista para credenciales de Microsoft activas
CREATE OR REPLACE VIEW active_microsoft_credentials AS
SELECT 
    uc.id,
    uc.user_id,
    uc.microsoft_access_token,
    uc.microsoft_refresh_token,
    uc.microsoft_token_expires_at,
    uc.microsoft_scope,
    uc.is_active,
    uc.last_used_at,
    CASE 
        WHEN is_token_expired(uc.microsoft_token_expires_at) THEN true
        ELSE false
    END as is_expired
FROM user_credentials uc
WHERE uc.microsoft_access_token IS NOT NULL 
    AND uc.is_active = true;

-- Confirmación final
SELECT '✅ Tabla user_credentials creada exitosamente!' as status;

-- Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'user_credentials'
ORDER BY ordinal_position;