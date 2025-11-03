-- ===========================================
-- SCRIPT COMPLETO PARA CONFIGURAR BRIFY EN SUPABASE
-- ===========================================
-- Este script incluye todas las tablas, índices, políticas RLS y datos iniciales
-- necesarios para que la aplicación Webrify funcione correctamente.
--
-- Ejecutar en orden en Supabase SQL Editor

-- ===========================================
-- 1. HABILITAR EXTENSIONES NECESARIAS
-- ===========================================

-- Habilitar extensión vector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ===========================================
-- 2. TABLAS DE AUTENTICACIÓN Y USUARIOS
-- ===========================================

-- Tabla de credenciales de usuario (Google Drive, Telegram, etc.)
CREATE TABLE IF NOT EXISTS user_credentials (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    telegram_chat_id TEXT,
    email TEXT,
    google_refresh_token TEXT NOT NULL,
    google_access_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de uso de tokens por usuario
CREATE TABLE IF NOT EXISTS user_tokens_usage (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    tokens_limit INTEGER DEFAULT 100000,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 3. TABLAS DE PLANES Y PAGOS
-- ===========================================

-- Tabla de planes disponibles
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_es VARCHAR(255) NOT NULL,
    description TEXT,
    price_usd DECIMAL(10,2) NOT NULL,
    price_clp INTEGER,
    token_limit_usage INTEGER NOT NULL,
    storage_limit_bytes BIGINT NOT NULL,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    stripe_price_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de extensiones disponibles
CREATE TABLE IF NOT EXISTS extensiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_es VARCHAR(255) NOT NULL,
    description TEXT,
    description_es TEXT,
    price DECIMAL(10,2) NOT NULL,
    price_clp INTEGER,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de extensiones adquiridas por usuario
CREATE TABLE IF NOT EXISTS plan_extensiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    extension_id UUID NOT NULL REFERENCES extensiones(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, extension_id)
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    amount_usd DECIMAL(10,2) NOT NULL,
    amount_clp INTEGER,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status VARCHAR(50) NOT NULL, -- 'paid', 'pending', 'failed'
    stripe_payment_id TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 4. TABLAS DE EMPRESAS Y EMPLEADOS
-- ===========================================

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    region VARCHAR(255),
    department VARCHAR(255),
    level VARCHAR(100),
    position VARCHAR(255),
    work_mode VARCHAR(50),
    contract_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    has_subordinates BOOLEAN DEFAULT false,
    registro_previo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 5. TABLAS DE COMUNICACIÓN
-- ===========================================

-- Tabla de plantillas de mensajes
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    content TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de borradores
CREATE TABLE IF NOT EXISTS drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT,
    template_id UUID REFERENCES templates(id),
    recipient_filters JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de logs de comunicación
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_ids UUID[] NOT NULL,
    template_id UUID REFERENCES templates(id),
    subject VARCHAR(500),
    content TEXT,
    channel VARCHAR(50) NOT NULL, -- 'whatsapp', 'telegram', 'email'
    status VARCHAR(50) NOT NULL, -- 'sent', 'delivered', 'read', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    sentiment_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 6. TABLAS DE ARCHIVOS Y DOCUMENTOS
-- ===========================================

-- Tabla de carpetas de usuario
CREATE TABLE IF NOT EXISTS carpetas_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    administrador TEXT NOT NULL,
    nombre_carpeta TEXT NOT NULL,
    google_drive_id TEXT,
    parent_id UUID REFERENCES carpetas_usuario(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos del entrenador (embeddings)
CREATE TABLE IF NOT EXISTS documentos_entrenador (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(768),
    entrenador TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de chunks de archivos
CREATE TABLE IF NOT EXISTS file_embeddings (
    id BIGSERIAL PRIMARY KEY,
    file_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 7. TABLAS DE WEBHOOKS Y NOTIFICACIONES
-- ===========================================

-- Tabla de canales de watch de Google Drive
CREATE TABLE IF NOT EXISTS drive_watch_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL UNIQUE,
    resource_id TEXT NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones de Google Drive
CREATE TABLE IF NOT EXISTS drive_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watch_channel_id UUID NOT NULL REFERENCES drive_watch_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL,
    resource_state TEXT NOT NULL,
    resource_id TEXT,
    resource_uri TEXT,
    changed_files TEXT,
    notification_data JSONB DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 8. TABLAS DE ROLES Y PERMISOS
-- ===========================================

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    name_es VARCHAR(50) NOT NULL,
    description TEXT,
    hierarchy_level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    name_es VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación rol-permisos
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Tabla de usuarios del sistema
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

-- ===========================================
-- 9. ÍNDICES PARA OPTIMIZACIÓN
-- ===========================================

-- Índices para user_credentials
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_telegram_chat_id ON user_credentials(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON user_credentials(email);

-- Índices para user_tokens_usage
CREATE INDEX IF NOT EXISTS idx_user_tokens_usage_user_id ON user_tokens_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_usage_last_reset ON user_tokens_usage(last_reset_date);

-- Índices para empleados
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_region ON employees(region);

-- Índices para comunicación
CREATE INDEX IF NOT EXISTS idx_communication_logs_user_id ON communication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_channel ON communication_logs(channel);
CREATE INDEX IF NOT EXISTS idx_communication_logs_sent_at ON communication_logs(sent_at);

-- Índices para archivos
CREATE INDEX IF NOT EXISTS idx_carpetas_usuario_administrador ON carpetas_usuario(administrador);
CREATE INDEX IF NOT EXISTS idx_carpetas_usuario_google_drive_id ON carpetas_usuario(google_drive_id);
CREATE INDEX IF NOT EXISTS idx_documentos_entrenador_entrenador ON documentos_entrenador(entrenador);

-- Índices vectoriales para embeddings
CREATE INDEX IF NOT EXISTS idx_file_embeddings_file_id ON file_embeddings(file_id);
CREATE INDEX IF NOT EXISTS idx_file_embeddings_embedding ON file_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_documentos_entrenador_embedding ON documentos_entrenador USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_documentos_entrenador_metadata_file_id ON documentos_entrenador ((metadata->>'file_id'));

-- Índices para webhooks
CREATE INDEX IF NOT EXISTS idx_drive_watch_channels_user_id ON drive_watch_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_drive_watch_channels_channel_id ON drive_watch_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_drive_notifications_watch_channel_id ON drive_notifications(watch_channel_id);
CREATE INDEX IF NOT EXISTS idx_drive_notifications_user_id ON drive_notifications(user_id);

-- Índices para roles y permisos
CREATE INDEX IF NOT EXISTS idx_system_users_role_id ON system_users(role_id);
CREATE INDEX IF NOT EXISTS idx_system_users_active ON system_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);

-- ===========================================
-- 10. FUNCIONES ÚTILES
-- ===========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función match_documentos_entrenador para búsqueda semántica
CREATE OR REPLACE FUNCTION match_documentos_entrenador(
    query_embedding vector(768),
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id bigint,
    content text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        documentos_entrenador.id,
        documentos_entrenador.content,
        documentos_entrenador.metadata,
        1 - (documentos_entrenador.embedding <=> query_embedding) as similarity
    FROM
        documentos_entrenador
    ORDER BY
        similarity DESC
    LIMIT
        match_count;
END;
$$;

-- Función match_file_embeddings para búsqueda híbrida
CREATE OR REPLACE FUNCTION match_file_embeddings(
    query_embedding vector(768),
    filter jsonb DEFAULT '{}',
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id bigint,
    content text,
    metadata jsonb,
    similarity float,
    file_id text,
    chunk_index int
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        fe.id,
        fe.content,
        jsonb_build_object(
            'file_name', COALESCE(de.metadata->>'file_name', 'Documento sin nombre'),
            'file_id', fe.file_id,
            'chunk_index', fe.chunk_index,
            'source', 'chunk'
        ) as metadata,
        1 - (fe.embedding <=> query_embedding) as similarity,
        fe.file_id,
        fe.chunk_index
    FROM file_embeddings fe
    INNER JOIN documentos_entrenador de ON fe.file_id = de.metadata->>'file_id'
    ORDER BY
        similarity DESC
    LIMIT
        match_count;
END;
$$;

-- ===========================================
-- 11. TRIGGERS PARA UPDATED_AT
-- ===========================================

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_user_credentials_updated_at BEFORE UPDATE ON user_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_tokens_usage_updated_at BEFORE UPDATE ON user_tokens_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carpetas_usuario_updated_at BEFORE UPDATE ON carpetas_usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_entrenador_updated_at BEFORE UPDATE ON documentos_entrenador FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_embeddings_updated_at BEFORE UPDATE ON file_embeddings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drive_watch_channels_updated_at BEFORE UPDATE ON drive_watch_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_users_updated_at BEFORE UPDATE ON system_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 12. HABILITAR ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE extensiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_extensiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE carpetas_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_entrenador ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_watch_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 13. POLÍTICAS RLS
-- ===========================================

-- Políticas para user_credentials
CREATE POLICY "Users can view their own credentials" ON user_credentials FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own credentials" ON user_credentials FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own credentials" ON user_credentials FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own credentials" ON user_credentials FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Políticas para user_tokens_usage
CREATE POLICY "Users can view their own token usage" ON user_tokens_usage FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert their own token usage" ON user_tokens_usage FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own token usage" ON user_tokens_usage FOR UPDATE TO authenticated USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);

-- Políticas para planes (todos pueden ver, solo admins pueden modificar)
CREATE POLICY "Anyone can view plans" ON plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify plans" ON plans FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM system_users WHERE id = auth.uid() AND role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'director')
    ))
);

-- Políticas para extensiones
CREATE POLICY "Anyone can view extensions" ON extensiones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view their own plan extensions" ON plan_extensiones FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own plan extensions" ON plan_extensiones FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Políticas para pagos
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own payments" ON payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Políticas para empleados (basado en empresa del usuario - simplificado)
CREATE POLICY "Users can view employees" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can modify employees" ON employees FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM system_users WHERE id = auth.uid() AND role_id IN (
        SELECT id FROM roles WHERE name IN ('super_admin', 'director')
    ))
);

-- Políticas para comunicación
CREATE POLICY "Users can view templates" ON templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own drafts" ON drafts FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view their own communication logs" ON communication_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own communication logs" ON communication_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Políticas para archivos
CREATE POLICY "Users can view their own folders" ON carpetas_usuario FOR SELECT TO authenticated USING (administrador = auth.email());
CREATE POLICY "Users can manage their own folders" ON carpetas_usuario FOR ALL TO authenticated USING (administrador = auth.email());
CREATE POLICY "Users can view their own documents" ON documentos_entrenador FOR SELECT TO authenticated USING (entrenador = auth.email());
CREATE POLICY "Users can manage their own documents" ON documentos_entrenador FOR ALL TO authenticated USING (entrenador = auth.email());
CREATE POLICY "Users can view file embeddings" ON file_embeddings FOR SELECT TO authenticated USING (true);

-- Políticas para webhooks
CREATE POLICY "Users can view their own watch channels" ON drive_watch_channels FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own watch channels" ON drive_watch_channels FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view their own drive notifications" ON drive_notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Políticas para roles y permisos (solo admins)
CREATE POLICY "Admins can manage roles" ON roles FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM system_users WHERE id = auth.uid() AND role_id IN (
        SELECT id FROM roles WHERE name = 'super_admin'
    ))
);
CREATE POLICY "Admins can manage permissions" ON permissions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM system_users WHERE id = auth.uid() AND role_id IN (
        SELECT id FROM roles WHERE name = 'super_admin'
    ))
);
CREATE POLICY "Admins can manage role permissions" ON role_permissions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM system_users WHERE id = auth.uid() AND role_id IN (
        SELECT id FROM roles WHERE name = 'super_admin'
    ))
);
CREATE POLICY "Admins can manage system users" ON system_users FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM system_users WHERE id = auth.uid() AND role_id IN (
        SELECT id FROM roles WHERE name = 'super_admin'
    ))
);

-- ===========================================
-- 14. DATOS INICIALES
-- ===========================================

-- Insertar empresas
INSERT INTO companies (name) VALUES
('Ariztia'), ('Inchcape'), ('Achs'), ('Arcoprime'), ('Grupo Saesa'),
('Colbun'), ('AFP Habitat'), ('Copec'), ('Antofagasta Minerals'),
('Vida Cámara'), ('Enaex'), ('SQM'), ('CMPC'),
('Corporación Chilena - Alemana'), ('Hogar Alemán'), ('Empresas SB')
ON CONFLICT DO NOTHING;

-- Insertar planes
INSERT INTO plans (name, name_es, description, price_usd, price_clp, token_limit_usage, storage_limit_bytes, features) VALUES
('free', 'Gratuito', 'Plan básico para comenzar', 0, 0, 1000, 1073741824, '{"dashboard": true, "basic_communication": true}'),
('starter', 'Inicial', 'Plan para pequeñas empresas', 29, 25000, 10000, 5368709120, '{"dashboard": true, "communication": true, "files": true}'),
('professional', 'Profesional', 'Plan completo para empresas', 79, 65000, 50000, 26843545600, '{"dashboard": true, "communication": true, "files": true, "ai": true}'),
('enterprise', 'Empresarial', 'Plan premium con todas las funciones', 199, 165000, 200000, 107374182400, '{"all": true}')
ON CONFLICT DO NOTHING;

-- Insertar extensiones
INSERT INTO extensiones (name, name_es, description, description_es, price, price_clp, category) VALUES
('legal_assistant', 'Asistente Legal', 'AI-powered legal assistant', 'Asistente legal con IA', 49, 40000, 'legal'),
('advanced_analytics', 'Analíticas Avanzadas', 'Advanced communication analytics', 'Analíticas avanzadas de comunicación', 39, 32000, 'analytics'),
('custom_integrations', 'Integraciones Personalizadas', 'Custom API integrations', 'Integraciones API personalizadas', 99, 82000, 'integration')
ON CONFLICT DO NOTHING;

-- Insertar roles
INSERT INTO roles (name, name_es, description, hierarchy_level) VALUES
('super_admin', 'Super Administrador', 'Acceso completo a todas las funciones', 100),
('director', 'Director', 'Acceso administrativo con algunas restricciones', 80),
('executive', 'Ejecutivo', 'Acceso operativo avanzado', 60),
('redactor', 'Redactor', 'Acceso limitado a funciones de contenido', 40)
ON CONFLICT DO NOTHING;

-- Insertar permisos
INSERT INTO permissions (name, name_es, description, category) VALUES
('dashboard.view', 'Ver Dashboard', 'Acceso al panel principal', 'dashboard'),
('dashboard.edit', 'Editar Dashboard', 'Modificar configuraciones del dashboard', 'dashboard'),
('communication.view', 'Ver Comunicación', 'Acceso a módulos de comunicación', 'communication'),
('communication.send', 'Enviar Mensajes', 'Enviar mensajes a empleados', 'communication'),
('communication.templates', 'Gestionar Plantillas', 'Crear y editar plantillas', 'communication'),
('communication.reports', 'Ver Reportes', 'Acceso a reportes de comunicación', 'communication'),
('communication.bulk_upload', 'Carga Masiva', 'Subir empleados en masa', 'communication'),
('files.view', 'Ver Archivos', 'Acceso a archivos y documentos', 'files'),
('files.upload', 'Subir Archivos', 'Subir nuevos archivos', 'files'),
('files.download', 'Descargar Archivos', 'Descargar archivos existentes', 'files'),
('files.delete', 'Eliminar Archivos', 'Eliminar archivos del sistema', 'files'),
('drive.view', 'Ver Google Drive', 'Acceso a integración con Google Drive', 'drive'),
('drive.connect', 'Conectar Google Drive', 'Configurar conexión con Google Drive', 'drive'),
('drive.sync', 'Sincronizar Drive', 'Sincronizar archivos con Google Drive', 'drive'),
('plans.view', 'Ver Planes', 'Acceso a información de planes', 'plans'),
('plans.upgrade', 'Actualizar Plan', 'Cambiar o actualizar planes', 'plans'),
('plans.billing', 'Ver Facturación', 'Acceso a información de facturación', 'plans'),
('settings.view', 'Ver Configuración', 'Acceso a configuraciones del sistema', 'settings'),
('settings.companies', 'Gestionar Empresas', 'Crear y editar empresas', 'settings'),
('settings.users', 'Gestionar Usuarios', 'Administrar usuarios del sistema', 'settings'),
('settings.system', 'Configuración Sistema', 'Configuraciones avanzadas del sistema', 'settings'),
('profile.view', 'Ver Perfil', 'Acceso al perfil de usuario', 'profile'),
('profile.edit', 'Editar Perfil', 'Modificar información del perfil', 'profile'),
('search.view', 'Ver Búsqueda', 'Acceso a búsqueda semántica', 'search'),
('search.ai', 'Usar IA', 'Utilizar funciones de inteligencia artificial', 'search'),
('legal.view', 'Ver Legal', 'Acceso a funciones legales', 'legal'),
('legal.consult', 'Consultar Legal', 'Realizar consultas legales', 'legal')
ON CONFLICT DO NOTHING;

-- Asignar permisos a roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'director'
AND p.name NOT IN ('settings.system', 'plans.billing')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'executive'
AND p.category IN ('dashboard', 'communication', 'files', 'drive', 'plans', 'profile', 'search')
AND p.name NOT IN ('communication.bulk_upload', 'settings.users', 'settings.system')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'redactor'
AND p.name IN ('dashboard.view', 'communication.view', 'communication.templates', 'files.view', 'files.upload', 'profile.view', 'profile.edit', 'search.view')
ON CONFLICT DO NOTHING;

-- Insertar plantillas de ejemplo
INSERT INTO templates (name, subject, content, category) VALUES
('Bienvenida Nuevo Empleado', 'Bienvenido a la empresa',
 'Estimado/a [NOMBRE],

Nos complace darle la bienvenida a [EMPRESA]. Esperamos que tenga una excelente experiencia con nosotros.

Atentamente,
Equipo de RRHH', 'RRHH'),

('Recordatorio de Reunión', 'Recordatorio: Reunión programada',
 'Hola [NOMBRE],

Le recordamos que tiene una reunión programada para [FECHA] a las [HORA].

Saludos,
Equipo Administrativo', 'Administrativo'),

('Actualización de Políticas', 'Actualización de políticas de la empresa',
 'Estimado equipo,

Hemos actualizado nuestras políticas de trabajo. Por favor, revise la documentación adjunta.

Gracias,
Dirección', 'General')
ON CONFLICT DO NOTHING;

-- ===========================================
-- 15. VERIFICACIÓN FINAL
-- ===========================================

-- Verificar que todas las tablas se crearon correctamente
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'user_credentials', 'user_tokens_usage', 'plans', 'extensiones',
        'plan_extensiones', 'payments', 'companies', 'employees', 'templates',
        'drafts', 'communication_logs', 'carpetas_usuario', 'documentos_entrenador',
        'file_embeddings', 'drive_watch_channels', 'drive_notifications',
        'roles', 'permissions', 'role_permissions', 'system_users'
    )
ORDER BY tablename;

-- Mostrar resumen de datos iniciales
SELECT
    (SELECT COUNT(*) FROM companies) as companies_count,
    (SELECT COUNT(*) FROM plans) as plans_count,
    (SELECT COUNT(*) FROM extensiones) as extensions_count,
    (SELECT COUNT(*) FROM roles) as roles_count,
    (SELECT COUNT(*) FROM permissions) as permissions_count,
    (SELECT COUNT(*) FROM templates) as templates_count;

-- ===========================================
-- CONFIGURACIÓN COMPLETA
-- ===========================================
-- La base de datos de Brify está ahora completamente configurada y lista para usar.
-- Todas las tablas, índices, políticas RLS y datos iniciales han sido creados.