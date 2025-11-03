-- ========================================
-- REESTRUCTURACIÓN COMPLETA DE BASE DE DATOS
-- ========================================
-- Este script reorganiza completamente la base de datos
-- para eliminar el desorden y establecer una estructura clara

-- ========================================
-- PASO 1: LIMPIAR TABLAS EXISTENTES
-- ========================================

-- Eliminar tablas vacías o innecesarias
DROP TABLE IF EXISTS drive_notifications CASCADE;
DROP TABLE IF EXISTS watch_channels CASCADE;
DROP TABLE IF EXISTS sentiment_analysis CASCADE;
DROP TABLE IF EXISTS rutinas_usuarios CASCADE;
DROP TABLE IF EXISTS documentos_usuario_entrenador CASCADE;
DROP TABLE IF EXISTS sub_carpetas_administrador CASCADE;

-- ========================================
-- PASO 2: RENOMBRAR TABLA INCORRECTA
-- ========================================

-- La tabla "companies" realmente contiene empleados, renombrarla
ALTER TABLE companies RENAME TO employees_temp;

-- ========================================
-- PASO 3: CREAR ESTRUCTURA CORRECTA
-- ========================================

-- Tabla de usuarios (autenticación)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de empresas (verdaderas empresas)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    website VARCHAR(255),
    logo_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de empleados (estructura correcta)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    position VARCHAR(255),
    department VARCHAR(255),
    salary DECIMAL(12,2),
    hire_date DATE,
    manager_id UUID REFERENCES employees(id),
    location VARCHAR(255),
    bio TEXT,
    status VARCHAR(20) DEFAULT 'active',
    employee_type VARCHAR(50) DEFAULT 'full_time',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de carpetas (relacionada con empleados)
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_folder_id UUID REFERENCES folders(id),
    path TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type VARCHAR(100),
    file_size BIGINT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de logs de comunicación
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    content TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    sent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de credenciales de usuario
CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service VARCHAR(100) NOT NULL,
    credentials JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de uso de tokens
CREATE TABLE IF NOT EXISTS user_tokens_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10,4),
    usage_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de extensiones
CREATE TABLE IF NOT EXISTS extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100),
    config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PASO 4: MIGRAR DATOS EXISTENTES
-- ========================================

-- Insertar empresas reales
INSERT INTO companies (name, industry, description, status) VALUES
('Copec', 'Energía', 'Empresa de energía y combustibles', 'active'),
('Hogar Alemán', 'Retail', 'Tienda por departamentos', 'active'),
('Falabella', 'Retail', 'Tienda por departamentos', 'active'),
('Cencosud', 'Retail', 'Retail y centros comerciales', 'active'),
('Entel', 'Telecomunicaciones', 'Telecomunicaciones', 'active'),
('Movistar', 'Telecomunicaciones', 'Telecomunicaciones', 'active'),
('Banco de Chile', 'Banca', 'Servicios bancarios', 'active'),
('Santander', 'Banca', 'Servicios bancarios', 'active'),
('BCI', 'Banca', 'Servicios bancarios', 'active'),
('Scotiabank', 'Banca', 'Servicios bancarios', 'active'),
('Itaú', 'Banca', 'Servicios bancarios', 'active'),
('Latam Airlines', 'Aviación', 'Aerolínea', 'active'),
('Codelco', 'Minería', 'Minería del cobre', 'active'),
('Ariztia', 'Alimentos', 'Productos alimenticios', 'active'),
('Inchcape', 'Automotriz', 'Venta de vehículos', 'active'),
('Achs', 'Seguridad', 'Seguridad y salud laboral', 'active')
ON CONFLICT (name) DO NOTHING;

-- Migrar datos de empleados desde la tabla temporal
INSERT INTO employees (
    employee_id, first_name, last_name, email, phone, position, department, 
    salary, hire_date, location, bio, status, employee_type, created_at, updated_at
)
SELECT 
    employee_id,
    SPLIT_PART(name, ' ', 1) as first_name,
    CASE 
        WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
        ELSE ''
    END as last_name,
    email,
    phone,
    position,
    department,
    salary,
    CASE 
        WHEN hire_date ~ '^\d{4}-\d{2}-\d{2}$' THEN hire_date::DATE
        ELSE '2024-01-01'::DATE
    END,
    location,
    bio,
    status,
    employee_type,
    created_at,
    updated_at
FROM employees_temp;

-- Asignar empleados a empresas (distribuirlos entre las 16 empresas)
UPDATE employees 
SET company_id = (
    SELECT id 
    FROM companies 
    ORDER BY id 
    LIMIT 1 
    OFFSET (MOD(row_number - 1, 16))
)
FROM (
    SELECT row_number() OVER (), id
    FROM employees
) AS numbered_employees
WHERE employees.id = numbered_employees.id;

-- Crear carpetas para cada empleado (una carpeta por empleado)
INSERT INTO folders (employee_id, name, description, path)
SELECT 
    id,
    'Carpeta Principal',
    'Carpeta principal del empleado',
    '/empleados/' || employee_id
FROM employees;

-- ========================================
-- PASO 5: CREAR ÍNDICES Y POLÍTICAS
-- ========================================

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_employee_id ON folders(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_company_id ON communication_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_employee_id ON communication_logs(employee_id);

-- ========================================
-- PASO 6: LIMPIAR
-- ========================================

-- Eliminar tabla temporal
DROP TABLE IF EXISTS employees_temp;

-- ========================================
-- PASO 7: VERIFICACIÓN
-- ========================================

-- Mostrar resultados
DO $$
DECLARE
    company_count INTEGER;
    employee_count INTEGER;
    folder_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO company_count FROM companies;
    SELECT COUNT(*) INTO employee_count FROM employees;
    SELECT COUNT(*) INTO folder_count FROM folders;
    
    RAISE NOTICE '=== REESTRUCTURACIÓN COMPLETADA ===';
    RAISE NOTICE 'Empresas: %', company_count;
    RAISE NOTICE 'Empleados: %', employee_count;
    RAISE NOTICE 'Carpetas: %', folder_count;
    RAISE NOTICE '====================================';
END $$;