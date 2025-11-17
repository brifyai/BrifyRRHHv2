-- Script para crear la tabla de permisos de Google Drive
-- Tabla: google_drive_permissions

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS google_drive_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_email VARCHAR(255) NOT NULL,
    permission_level VARCHAR(50) NOT NULL CHECK (permission_level IN ('viewer', 'commenter', 'editor', 'manager')),
    folder_path VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para optimizar consultas
    CONSTRAINT unique_company_email_active UNIQUE (company_id, employee_email, is_active)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_google_drive_permissions_company_id ON google_drive_permissions(company_id);
CREATE INDEX IF NOT EXISTS idx_google_drive_permissions_email ON google_drive_permissions(employee_email);
CREATE INDEX IF NOT EXISTS idx_google_drive_permissions_active ON google_drive_permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_google_drive_permissions_level ON google_drive_permissions(permission_level);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_google_drive_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_google_drive_permissions_updated_at
    BEFORE UPDATE ON google_drive_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_google_drive_permissions_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE google_drive_permissions IS 'Configuración de permisos de Google Drive para empleados por empresa';
COMMENT ON COLUMN google_drive_permissions.company_id IS 'ID de la empresa';
COMMENT ON COLUMN google_drive_permissions.employee_email IS 'Email del empleado';
COMMENT ON COLUMN google_drive_permissions.permission_level IS 'Nivel de permiso: viewer, commenter, editor, manager';
COMMENT ON COLUMN google_drive_permissions.folder_path IS 'Ruta específica de carpeta (opcional)';
COMMENT ON COLUMN google_drive_permissions.is_active IS 'Si el permiso está activo';

-- Insertar algunos datos de ejemplo (opcional)
-- INSERT INTO google_drive_permissions (company_id, employee_email, permission_level, folder_path) VALUES
-- ('uuid-empresa-ejemplo', 'empleado1@empresa.com', 'viewer', '/Documentos'),
-- ('uuid-empresa-ejemplo', 'empleado2@empresa.com', 'editor', '/Proyectos'),
-- ('uuid-empresa-ejemplo', 'gerente@empresa.com', 'manager', NULL);

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'google_drive_permissions'
ORDER BY ordinal_position;