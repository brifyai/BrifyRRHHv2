-- Script completo para crear la estructura de base de datos en el nuevo proyecto Supabase
-- Este script debe ejecutarse en el SQL Editor del nuevo proyecto Supabase

-- ============================================
-- TABLAS PRINCIPALES DEL SISTEMA
-- ============================================

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  region VARCHAR(100),
  department VARCHAR(100),
  level VARCHAR(50),
  position VARCHAR(100),
  work_mode VARCHAR(20),
  contract_type VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  has_subordinates BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE AUTENTICACIÓN Y USUARIOS
-- ============================================

-- Tabla de usuarios del sistema (extendida de auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  telegram_id VARCHAR(50) UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE GESTIÓN DE CARPETAS Y ARCHIVOS
-- ============================================

-- Tabla de carpetas de administrador
CREATE TABLE IF NOT EXISTS carpeta_administrador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correo VARCHAR(255) NOT NULL,
  nombre_carpeta VARCHAR(255) NOT NULL,
  file_id VARCHAR(255) UNIQUE NOT NULL,
  telegram_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de subcarpetas de administrador (extensiones)
CREATE TABLE IF NOT EXISTS sub_carpetas_administrador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  administrador_email VARCHAR(255) NOT NULL,
  nombre_subcarpeta VARCHAR(255) NOT NULL,
  file_id VARCHAR(255) UNIQUE NOT NULL,
  file_id_master VARCHAR(255) NOT NULL,
  tipo_extension VARCHAR(100) NOT NULL,
  telegram_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de carpetas de usuario
CREATE TABLE IF NOT EXISTS carpetas_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  administrador VARCHAR(255) NOT NULL,
  nombre_carpeta VARCHAR(255) NOT NULL,
  file_id VARCHAR(255) UNIQUE NOT NULL,
  telegram_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE DOCUMENTOS Y ENTRENAMIENTO
-- ============================================

-- Tabla de documentos del entrenador
CREATE TABLE IF NOT EXISTS documentos_entrenador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrenador VARCHAR(255) NOT NULL,
  nombre_documento VARCHAR(255) NOT NULL,
  file_id VARCHAR(255) UNIQUE NOT NULL,
  folder_id VARCHAR(255),
  telegram_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos de usuario para entrenador
CREATE TABLE IF NOT EXISTS documentos_usuario_entrenador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id VARCHAR(50) NOT NULL,
  nombre_documento VARCHAR(255) NOT NULL,
  file_id VARCHAR(255) UNIQUE NOT NULL,
  folder_id VARCHAR(255),
  entrenador VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE INTEGRACIONES EXTERNAS
-- ============================================

-- Tabla de credenciales de usuario para servicios externos
CREATE TABLE IF NOT EXISTS user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  telegram_chat_id VARCHAR(50) UNIQUE,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expires_at TIMESTAMP WITH TIME ZONE,
  google_drive_folder_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(telegram_chat_id)
);

-- Tabla de uso de tokens (para control de cuotas)
CREATE TABLE IF NOT EXISTS user_tokens_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  tokens_used INTEGER DEFAULT 0,
  tokens_limit INTEGER DEFAULT 10000,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE COMUNICACIÓN Y NOTIFICACIONES
-- ============================================

-- Tabla de canales de watch de Google Drive
CREATE TABLE IF NOT EXISTS drive_watch_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel_id VARCHAR(255) UNIQUE NOT NULL,
  resource_id VARCHAR(255),
  resource_uri TEXT,
  expiration TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones de Google Drive
CREATE TABLE IF NOT EXISTS drive_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id VARCHAR(255) NOT NULL,
  resource_state VARCHAR(50),
  resource_uri TEXT,
  changed_files TEXT,
  notification_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE SISTEMA DE PAGOS Y PLANES
-- ============================================

-- Tabla de planes de suscripción
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  mercado_pago_payment_id VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZAR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_telegram_id ON user_credentials(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_drive_watch_channels_user_id ON drive_watch_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_drive_watch_channels_channel_id ON drive_watch_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_drive_notifications_channel_id ON drive_notifications(channel_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_documentos_entrenador_entrenador ON documentos_entrenador(entrenador);
CREATE INDEX IF NOT EXISTS idx_documentos_usuario_entrenador_telegram_id ON documentos_usuario_entrenador(telegram_id);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE carpeta_administrador ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_carpetas_administrador ENABLE ROW LEVEL SECURITY;
ALTER TABLE carpetas_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_entrenador ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_usuario_entrenador ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_watch_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (se pueden ajustar según necesidades)
-- Primero eliminar políticas si existen
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON companies;
DROP POLICY IF EXISTS "Companies are insertable by authenticated users" ON companies;
DROP POLICY IF EXISTS "Employees are viewable by company users" ON employees;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own credentials" ON user_credentials;
DROP POLICY IF EXISTS "Users can update own credentials" ON user_credentials;
DROP POLICY IF EXISTS "Users can insert own credentials" ON user_credentials;

-- Empresas - acceso público para lectura
CREATE POLICY "Companies are viewable by everyone" ON companies FOR SELECT USING (true);
CREATE POLICY "Companies are insertable by authenticated users" ON companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Empleados - acceso basado en empresa del usuario
CREATE POLICY "Employees are viewable by company users" ON employees FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.company_id = employees.company_id
  )
);

-- Usuarios - solo pueden ver/editar su propio perfil
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid());

-- Credenciales - solo acceso propio
CREATE POLICY "Users can view own credentials" ON user_credentials FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own credentials" ON user_credentials FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert own credentials" ON user_credentials FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- TRIGGERS PARA ACTUALIZACIÓN DE TIMESTAMP
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para todas las tablas que tienen updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carpeta_administrador_updated_at BEFORE UPDATE ON carpeta_administrador FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sub_carpetas_administrador_updated_at BEFORE UPDATE ON sub_carpetas_administrador FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carpetas_usuario_updated_at BEFORE UPDATE ON carpetas_usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_entrenador_updated_at BEFORE UPDATE ON documentos_entrenador FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_usuario_entrenador_updated_at BEFORE UPDATE ON documentos_usuario_entrenador FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_credentials_updated_at BEFORE UPDATE ON user_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_tokens_usage_updated_at BEFORE UPDATE ON user_tokens_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drive_watch_channels_updated_at BEFORE UPDATE ON drive_watch_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar planes de suscripción
INSERT INTO plans (name, description, price, features) VALUES 
('Plan Básico', 'Acceso básico a funcionalidades', 0.00, '{"employees": 50, "storage": "1GB", "features": ["basic_dashboard", "file_upload"]}'),
('Plan Profesional', 'Acceso completo para empresas pequeñas', 29.90, '{"employees": 200, "storage": "10GB", "features": ["full_dashboard", "advanced_analytics", "api_access", "priority_support"]}'),
('Plan Empresarial', 'Solución completa para grandes empresas', 99.90, '{"employees": "unlimited", "storage": "100GB", "features": ["all_features", "custom_integrations", "dedicated_support", "white_label"]}')
ON CONFLICT DO NOTHING;

-- Insertar empresas de ejemplo
INSERT INTO companies (name) VALUES 
('Ariztia'),
('Inchcape'),
('Achs'),
('Arcoprime'),
('Grupo Saesa'),
('Colbun'),
('AFP Habitat'),
('Copec'),
('Antofagasta Minerals'),
('Vida Cámara'),
('Enaex'),
('SQM'),
('CMPC'),
('Corporación Chilena - Alemana'),
('Hogar Alemán'),
('Empresas SB')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para obtener estadísticas de un usuario
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_employees', (SELECT COUNT(*) FROM employees WHERE company_id = (SELECT company_id FROM users WHERE id = user_uuid)),
        'total_folders', (SELECT COUNT(*) FROM carpeta_administrador WHERE correo = (SELECT email FROM users WHERE id = user_uuid)),
        'total_documents', (SELECT COUNT(*) FROM documentos_entrenador WHERE entrenador = (SELECT email FROM users WHERE id = user_uuid)),
        'tokens_used', COALESCE((SELECT tokens_used FROM user_tokens_usage WHERE user_id = user_uuid), 0),
        'last_payment', (SELECT MAX(paid_at) FROM payments WHERE user_id = user_uuid AND status = 'paid')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de empleados con información de empresa
CREATE OR REPLACE VIEW employee_details AS
SELECT 
    e.*,
    c.name as company_name
FROM employees e
JOIN companies c ON e.company_id = c.id;

-- Vista de usuarios con información de empresa
CREATE OR REPLACE VIEW user_details AS
SELECT
  u.*,
  c.name as company_name,
  COALESCE(plans.name, 'Sin plan') as current_plan,
  COALESCE(utu.tokens_used, 0) as tokens_used,
  COALESCE(utu.tokens_limit, 10000) as tokens_limit
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN payments ON payments.user_id = u.id AND payments.status = 'paid' AND payments.paid_at = (
  SELECT MAX(paid_at) FROM payments p2 WHERE p2.user_id = u.id AND p2.status = 'paid'
)
LEFT JOIN plans ON plans.id = payments.plan_id
LEFT JOIN user_tokens_usage utu ON utu.user_id = u.id;

COMMIT;