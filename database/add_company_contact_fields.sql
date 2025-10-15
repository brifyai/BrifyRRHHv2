-- Agregar campos de contacto a la tabla companies
-- Este script debe ejecutarse después de crear la tabla companies

-- Agregar campos para números de contacto por empresa
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS telegram_bot VARCHAR(255),
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Crear índice para mejorar performance de consultas por usuario
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active) WHERE is_active = true;

-- Actualizar empresas existentes para asignarlas a un usuario por defecto (opcional)
-- Esto puede requerir que especifiques un user_id específico
-- UPDATE companies SET user_id = 'your-user-id-here' WHERE user_id IS NULL;

-- Insertar algunas empresas de ejemplo con datos de contacto (para desarrollo)
-- Estas pueden ser eliminadas en producción
INSERT INTO companies (name, telegram_bot, whatsapp_number, description, is_active) VALUES
  ('Ariztia', 'https://t.me/ariztia_bot', '+56912345678', 'Empresa líder en alimentos', true),
  ('Inchcape', 'https://t.me/inchcape_bot', '+56912345679', 'Distribución automotriz', true),
  ('Achs', 'https://t.me/achs_bot', '+56912345680', 'Salud y previsión', true),
  ('Arcoprime', 'https://t.me/arcoprime_bot', '+56912345681', 'Servicios financieros', true),
  ('Grupo Saesa', 'https://t.me/saesa_bot', '+56912345682', 'Energía eléctrica', true),
  ('Colbun', 'https://t.me/colbun_bot', '+56912345683', 'Generación eléctrica', true),
  ('AFP Habitat', 'https://t.me/habitat_bot', '+56912345684', 'Administradora de fondos', true),
  ('Copec', 'https://t.me/copec_bot', '+56912345685', 'Combustibles y energía', true),
  ('Antofagasta Minerals', 'https://t.me/antofagasta_bot', '+56912345686', 'Minería', true),
  ('Vida Cámara', 'https://t.me/vida_bot', '+56912345687', 'Cámaras de comercio', true),
  ('Enaex', 'https://t.me/enaex_bot', '+56912345688', 'Explosivos y servicios', true),
  ('SQM', 'https://t.me/sqm_bot', '+56912345689', 'Químicos y minería', true),
  ('CMPC', 'https://t.me/cmpc_bot', '+56912345690', 'Celulosa y papel', true),
  ('Corporación Chilena - Alemana', 'https://t.me/corpal_bot', '+56912345691', 'Corporación binacional', true),
  ('Hogar Alemán', 'https://t.me/hogar_bot', '+56912345692', 'Fundación social', true),
  ('Empresas SB', 'https://t.me/sb_bot', '+56912345693', 'Holding empresarial', true)
ON CONFLICT (name) DO UPDATE SET
  telegram_bot = EXCLUDED.telegram_bot,
  whatsapp_number = EXCLUDED.whatsapp_number,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Verificar que los campos se agregaron correctamente
SELECT
  id,
  name,
  telegram_bot,
  whatsapp_number,
  description,
  is_active,
  created_at
FROM companies
ORDER BY name;