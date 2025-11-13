-- Crear tabla para credenciales de Google Drive
-- Esta tabla reemplaza a user_google_drive_credentials que fue eliminada en la migración

CREATE TABLE IF NOT EXISTS google_drive_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Tokens OAuth
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expires_at TIMESTAMPTZ,

    -- Información de Google
    google_user_id TEXT,
    google_email TEXT,
    google_name TEXT,
    google_avatar_url TEXT,

    -- Configuración
    google_scope TEXT DEFAULT 'https://www.googleapis.com/auth/drive',
    default_folder_id TEXT,

    -- Estado y sincronización
    is_connected BOOLEAN DEFAULT false,
    sync_status TEXT DEFAULT 'disconnected', -- 'disconnected', 'connecting', 'connected', 'error'
    last_sync_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadatos
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id),
    CHECK (sync_status IN ('disconnected', 'connecting', 'connected', 'error'))
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_google_drive_credentials_user_id ON google_drive_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_google_drive_credentials_google_user_id ON google_drive_credentials(google_user_id);
CREATE INDEX IF NOT EXISTS idx_google_drive_credentials_is_connected ON google_drive_credentials(is_connected);
CREATE INDEX IF NOT EXISTS idx_google_drive_credentials_sync_status ON google_drive_credentials(sync_status);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_google_drive_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_google_drive_credentials_updated_at_trigger ON google_drive_credentials;
CREATE TRIGGER update_google_drive_credentials_updated_at_trigger
    BEFORE UPDATE ON google_drive_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_google_drive_credentials_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE google_drive_credentials ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para google_drive_credentials
DROP POLICY IF EXISTS "Users can view their own Google Drive credentials" ON google_drive_credentials;
CREATE POLICY "Users can view their own Google Drive credentials"
    ON google_drive_credentials
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own Google Drive credentials" ON google_drive_credentials;
CREATE POLICY "Users can insert their own Google Drive credentials"
    ON google_drive_credentials
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own Google Drive credentials" ON google_drive_credentials;
CREATE POLICY "Users can update their own Google Drive credentials"
    ON google_drive_credentials
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own Google Drive credentials" ON google_drive_credentials;
CREATE POLICY "Users can delete their own Google Drive credentials"
    ON google_drive_credentials
    FOR DELETE
    USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE google_drive_credentials IS 'Almacena las credenciales OAuth 2.0 de Google Drive para cada usuario';
COMMENT ON COLUMN google_drive_credentials.user_id IS 'ID del usuario de Supabase Auth';
COMMENT ON COLUMN google_drive_credentials.google_access_token IS 'Token de acceso OAuth 2.0 de Google';
COMMENT ON COLUMN google_drive_credentials.google_refresh_token IS 'Token de refresco para renovar el access token';
COMMENT ON COLUMN google_drive_credentials.google_token_expires_at IS 'Fecha de expiración del access token';
COMMENT ON COLUMN google_drive_credentials.google_user_id IS 'ID único del usuario de Google';
COMMENT ON COLUMN google_drive_credentials.google_email IS 'Email del usuario de Google';
COMMENT ON COLUMN google_drive_credentials.google_name IS 'Nombre del usuario de Google';
COMMENT ON COLUMN google_drive_credentials.google_avatar_url IS 'URL del avatar del usuario de Google';
COMMENT ON COLUMN google_drive_credentials.google_scope IS 'Alcance de los permisos OAuth concedidos';
COMMENT ON COLUMN google_drive_credentials.default_folder_id IS 'ID de la carpeta raíz en Google Drive para este usuario';
COMMENT ON COLUMN google_drive_credentials.is_connected IS 'Indica si la conexión está activa';
COMMENT ON COLUMN google_drive_credentials.sync_status IS 'Estado de sincronización: disconnected, connecting, connected, error';
COMMENT ON COLUMN google_drive_credentials.last_sync_at IS 'Fecha de la última sincronización exitosa';
COMMENT ON COLUMN google_drive_credentials.last_used_at IS 'Fecha de la última vez que se usó la conexión';
COMMENT ON COLUMN google_drive_credentials.metadata IS 'Campo JSON para metadatos adicionales';

-- Otorgar permisos necesarios
GRANT SELECT, INSERT, UPDATE, DELETE ON google_drive_credentials TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;