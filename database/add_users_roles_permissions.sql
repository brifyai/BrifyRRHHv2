-- Agregar sistema de usuarios con roles y permisos
-- Este script debe ejecutarse después de crear las tablas básicas

-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  name_es VARCHAR(50) NOT NULL,
  description TEXT,
  hierarchy_level INTEGER NOT NULL, -- Para orden jerárquico
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de permisos/funciones
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  name_es VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- dashboard, communication, files, settings, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de relación rol-permisos
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Agregar campos de rol a la tabla auth.users existente (usando metadata)
-- Nota: Supabase maneja auth.users automáticamente, así que usaremos una tabla separada

-- Crear tabla de usuarios del sistema (extensión de auth.users)
CREATE TABLE IF NOT EXISTS system_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role_id UUID NOT NULL REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_system_users_role_id ON system_users(role_id);
CREATE INDEX IF NOT EXISTS idx_system_users_active ON system_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);

-- Insertar roles básicos
INSERT INTO roles (name, name_es, description, hierarchy_level) VALUES
  ('super_admin', 'Super Administrador', 'Acceso completo a todas las funciones del sistema', 100),
  ('director', 'Director', 'Acceso administrativo con algunas restricciones', 80),
  ('executive', 'Ejecutivo', 'Acceso operativo avanzado', 60),
  ('redactor', 'Redactor', 'Acceso limitado a funciones de contenido', 40)
ON CONFLICT (name) DO NOTHING;

-- Insertar permisos básicos organizados por categorías
INSERT INTO permissions (name, name_es, description, category) VALUES
  -- Dashboard
  ('dashboard.view', 'Ver Dashboard', 'Acceso al panel principal', 'dashboard'),
  ('dashboard.edit', 'Editar Dashboard', 'Modificar configuraciones del dashboard', 'dashboard'),

  -- Comunicación
  ('communication.view', 'Ver Comunicación', 'Acceso a módulos de comunicación', 'communication'),
  ('communication.send', 'Enviar Mensajes', 'Enviar mensajes a empleados', 'communication'),
  ('communication.templates', 'Gestionar Plantillas', 'Crear y editar plantillas', 'communication'),
  ('communication.reports', 'Ver Reportes', 'Acceso a reportes de comunicación', 'communication'),
  ('communication.bulk_upload', 'Carga Masiva', 'Subir empleados en masa', 'communication'),

  -- Archivos y Documentos
  ('files.view', 'Ver Archivos', 'Acceso a archivos y documentos', 'files'),
  ('files.upload', 'Subir Archivos', 'Subir nuevos archivos', 'files'),
  ('files.download', 'Descargar Archivos', 'Descargar archivos existentes', 'files'),
  ('files.delete', 'Eliminar Archivos', 'Eliminar archivos del sistema', 'files'),

  -- Google Drive
  ('drive.view', 'Ver Google Drive', 'Acceso a integración con Google Drive', 'drive'),
  ('drive.connect', 'Conectar Google Drive', 'Configurar conexión con Google Drive', 'drive'),
  ('drive.sync', 'Sincronizar Drive', 'Sincronizar archivos con Google Drive', 'drive'),

  -- Planes y Facturación
  ('plans.view', 'Ver Planes', 'Acceso a información de planes', 'plans'),
  ('plans.upgrade', 'Actualizar Plan', 'Cambiar o actualizar planes', 'plans'),
  ('plans.billing', 'Ver Facturación', 'Acceso a información de facturación', 'plans'),

  -- Configuración
  ('settings.view', 'Ver Configuración', 'Acceso a configuraciones del sistema', 'settings'),
  ('settings.companies', 'Gestionar Empresas', 'Crear y editar empresas', 'settings'),
  ('settings.users', 'Gestionar Usuarios', 'Administrar usuarios del sistema', 'settings'),
  ('settings.system', 'Configuración Sistema', 'Configuraciones avanzadas del sistema', 'settings'),

  -- Perfil
  ('profile.view', 'Ver Perfil', 'Acceso al perfil de usuario', 'profile'),
  ('profile.edit', 'Editar Perfil', 'Modificar información del perfil', 'profile'),

  -- Búsqueda y IA
  ('search.view', 'Ver Búsqueda', 'Acceso a búsqueda semántica', 'search'),
  ('search.ai', 'Usar IA', 'Utilizar funciones de inteligencia artificial', 'search'),

  -- Legal/Abogado
  ('legal.view', 'Ver Legal', 'Acceso a funciones legales', 'legal'),
  ('legal.consult', 'Consultar Legal', 'Realizar consultas legales', 'legal')
ON CONFLICT (name) DO NOTHING;

-- Asignar permisos a roles
-- Super Admin: Todos los permisos
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Director: La mayoría de permisos excepto configuración avanzada
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'director'
  AND p.name NOT IN ('settings.system', 'plans.billing')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Ejecutivo: Permisos operativos principales
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'executive'
  AND p.category IN ('dashboard', 'communication', 'files', 'drive', 'plans', 'profile', 'search')
  AND p.name NOT IN ('communication.bulk_upload', 'settings.users', 'settings.system')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Redactor: Permisos limitados a contenido
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'redactor'
  AND p.name IN ('dashboard.view', 'communication.view', 'communication.templates', 'files.view', 'files.upload', 'profile.view', 'profile.edit', 'search.view')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Crear usuario administrador por defecto (opcional)
-- Esto requiere que especifiques un user_id válido
-- INSERT INTO system_users (id, email, full_name, role_id, is_active)
-- SELECT 'your-admin-user-id', 'admin@empresa.cl', 'Administrador Sistema',
--        (SELECT id FROM roles WHERE name = 'super_admin'), true
-- WHERE NOT EXISTS (SELECT 1 FROM system_users WHERE role_id = (SELECT id FROM roles WHERE name = 'super_admin'));

-- Verificar que todo se creó correctamente
SELECT
  'Roles creados:' as info,
  COUNT(*) as count
FROM roles
UNION ALL
SELECT
  'Permisos creados:',
  COUNT(*)
FROM permissions
UNION ALL
SELECT
  'Asignaciones rol-permiso:',
  COUNT(*)
FROM role_permissions;