-- ============================================
-- CREAR TABLA DE TOKENS DE GOOGLE DRIVE
-- ============================================

-- Crear tabla para almacenar tokens de Google Drive
CREATE TABLE IF NOT EXISTS google_drive_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  token_type TEXT DEFAULT 'Bearer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_google_drive_tokens_user_id ON google_drive_tokens(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE google_drive_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios tokens
CREATE POLICY "Users can view their own tokens"
  ON google_drive_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios tokens
CREATE POLICY "Users can update their own tokens"
  ON google_drive_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios tokens
CREATE POLICY "Users can insert their own tokens"
  ON google_drive_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios tokens
CREATE POLICY "Users can delete their own tokens"
  ON google_drive_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verificar que la tabla fue creada correctamente
SELECT 
  tablename,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = 'google_drive_tokens') as column_count
FROM pg_tables 
WHERE tablename = 'google_drive_tokens';
