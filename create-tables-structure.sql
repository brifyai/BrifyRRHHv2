-- SCRIPT PARA CREAR ESTRUCTURA CORRECTA DE TABLAS
-- Este script crea las tablas con la estructura correcta para la reorganización

-- 1. Crear tabla de empresas (limpiar y recrear)
DROP TABLE IF EXISTS companies CASCADE;
CREATE TABLE companies (
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

-- 2. Crear tabla de empleados con estructura correcta
DROP TABLE IF EXISTS employees CASCADE;
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    position VARCHAR(100),
    department VARCHAR(100),
    company_id UUID REFERENCES companies(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de carpetas
DROP TABLE IF EXISTS folders CASCADE;
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    description TEXT,
    path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de documentos
DROP TABLE IF EXISTS documents CASCADE;
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    file_url TEXT,
    file_size BIGINT,
    file_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear tabla de logs de comunicación
DROP TABLE IF EXISTS communication_logs CASCADE;
CREATE TABLE communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    employee_id UUID REFERENCES employees(id),
    type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft',
    subject TEXT,
    content TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Asegurar que la tabla users existe (si no existe)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Crear índices para mejor rendimiento
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_folders_employee_id ON folders(employee_id);
CREATE INDEX idx_documents_folder_id ON documents(folder_id);
CREATE INDEX idx_documents_employee_id ON documents(employee_id);
CREATE INDEX idx_communication_logs_company_id ON communication_logs(company_id);
CREATE INDEX idx_communication_logs_employee_id ON communication_logs(employee_id);

-- 8. Habilitar Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas RLS básicas (permitir todo por ahora)
CREATE POLICY "Enable all operations for companies" ON companies FOR ALL USING (true);
CREATE POLICY "Enable all operations for employees" ON employees FOR ALL USING (true);
CREATE POLICY "Enable all operations for folders" ON folders FOR ALL USING (true);
CREATE POLICY "Enable all operations for documents" ON documents FOR ALL USING (true);
CREATE POLICY "Enable all operations for communication_logs" ON communication_logs FOR ALL USING (true);
CREATE POLICY "Enable all operations for users" ON users FOR ALL USING (true);