-- ========================================
-- VERSIÓN MÍNIMA DE USER_CREDENTIALS
-- Para resolver el error 406 inmediatamente
-- ========================================

-- Crear tabla user_credentials básica
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
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_uc_user_id ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_uc_is_active ON user_credentials(is_active);

-- Habilitar RLS
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Políticas RLS simples
DROP POLICY IF EXISTS user_credentials_select_own ON user_credentials;
CREATE POLICY user_credentials_select_own ON user_credentials
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_credentials_insert_own ON user_credentials;
CREATE POLICY user_credentials_insert_own ON user_credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_credentials_update_own ON user_credentials;
CREATE POLICY user_credentials_update_own ON user_credentials
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_credentials_delete_own ON user_credentials;
CREATE POLICY user_credentials_delete_own ON user_credentials
    FOR DELETE USING (auth.uid() = user_id);

-- Confirmación
SELECT '✅ Tabla user_credentials creada exitosamente!' as status;