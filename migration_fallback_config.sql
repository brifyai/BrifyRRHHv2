-- Agregar columna fallback_config a la tabla companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS fallback_config JSONB DEFAULT '{"order": ["WhatsApp", "Telegram", "SMS", "Email"]}';

-- Actualizar empresas existentes con la configuración por defecto
UPDATE companies 
SET fallback_config = '{"order": ["WhatsApp", "Telegram", "SMS", "Email"]}' 
WHERE fallback_config IS NULL;

-- Crear índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_companies_fallback_config ON companies USING GIN (fallback_config);

-- Comentario sobre la columna
COMMENT ON COLUMN companies.fallback_config IS 'Configuración del orden de fallback para canales de comunicación';