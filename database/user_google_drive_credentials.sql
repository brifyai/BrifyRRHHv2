-- Tabla para almacenar las credenciales de Google Drive de cada usuario
-- Cada usuario tiene su propia conexión individual a Google Drive

-- Crear tabla para credenciales de Google Drive por usuario
CREATE TABLE IF NOT EXISTS user_google_drive_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información de la cuenta de Google
  google_user_id VARCHAR(255) NOT NULL,
  google_email VARCHAR(255) NOT NULL,
  google_name VARCHAR(255),
  google_avatar_url TEXT,
  
  -- Credenciales OAuth 2.0
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  
  -- Estado de la conexión
  is_active BOOLEAN DEFAULT true,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'pending', -- pending, syncing, success, error
  
  -- Configuración específica del usuario
  default_folder_id VARCHAR(255), -- Carpeta raíz para este usuario
  sync_enabled BOOLEAN DEFAULT true,
  auto_sync_interval INTEGER DEFAULT 30, -- minutos
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Restricciones únicas
  UNIQUE(user_id), -- Un usuario solo puede tener una cuenta de Google Drive conectada
  UNIQUE(google_user_id) -- Una cuenta de Google solo puede estar conectada a un usuario
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_user_google_drive_user_id ON user_google_drive_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_google_drive_google_user_id ON user_google_drive_credentials(google_user_id);
CREATE INDEX IF NOT EXISTS idx_user_google_drive_is_active ON user_google_drive_credentials(is_active);
CREATE INDEX IF NOT EXISTS idx_user_google_drive_sync_status ON user_google_drive_credentials(sync_status);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_user_google_drive_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_user_google_drive_credentials_updated_at_trigger
  BEFORE UPDATE ON user_google_drive_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_user_google_drive_credentials_updated_at();

-- Crear función para verificar si el token ha expirado
CREATE OR REPLACE FUNCTION is_google_token_expired(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT token_expires_at INTO expires_at
  FROM user_google_drive_credentials
  WHERE user_id = user_id_param AND is_active = true;
  
  RETURN expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Crear función para obtener credenciales activas de un usuario
CREATE OR REPLACE FUNCTION get_user_google_credentials(user_id_param UUID)
RETURNS TABLE (
  google_user_id VARCHAR(255),
  google_email VARCHAR(255),
  google_name VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  default_folder_id VARCHAR(255),
  is_connected BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    udc.google_user_id,
    udc.google_email,
    udc.google_name,
    udc.access_token,
    udc.refresh_token,
    udc.token_expires_at,
    udc.scope,
    udc.default_folder_id,
    udc.is_connected
  FROM user_google_drive_credentials udc
  WHERE udc.user_id = user_id_param 
    AND udc.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Crear función para actualizar el estado de sincronización
CREATE OR REPLACE FUNCTION update_google_drive_sync_status(
  user_id_param UUID,
  status_param VARCHAR(50),
  error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_google_drive_credentials
  SET 
    sync_status = status_param,
    last_sync_at = NOW(),
    is_connected = (status_param = 'success')
  WHERE user_id = user_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Crear política de RLS (Row Level Security)
ALTER TABLE user_google_drive_credentials ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias credenciales
CREATE POLICY "Users can view their own Google Drive credentials"
  ON user_google_drive_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias credenciales
CREATE POLICY "Users can insert their own Google Drive credentials"
  ON user_google_drive_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias credenciales
CREATE POLICY "Users can update their own Google Drive credentials"
  ON user_google_drive_credentials
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias credenciales
CREATE POLICY "Users can delete their own Google Drive credentials"
  ON user_google_drive_credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE user_google_drive_credentials IS 'Almacena las credenciales OAuth 2.0 de Google Drive para cada usuario individualmente';
COMMENT ON COLUMN user_google_drive_credentials.user_id IS 'ID del usuario de BrifyRRHH';
COMMENT ON COLUMN user_google_drive_credentials.google_user_id IS 'ID único del usuario de Google';
COMMENT ON COLUMN user_google_drive_credentials.access_token IS 'Token de acceso OAuth 2.0 de Google';
COMMENT ON COLUMN user_google_drive_credentials.refresh_token IS 'Token de refresco para renovar el access token';
COMMENT ON COLUMN user_google_drive_credentials.token_expires_at IS 'Fecha de expiración del access token';
COMMENT ON COLUMN user_google_drive_credentials.default_folder_id IS 'ID de la carpeta raíz en Google Drive para este usuario';
COMMENT ON COLUMN user_google_drive_credentials.sync_status IS 'Estado de sincronización: pending, syncing, success, error';