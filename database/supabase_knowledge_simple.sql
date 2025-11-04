-- ========================================
-- BASE DE CONOCIMIENTO EMPRESARIAL - VERSIÓN SIMPLE
-- Compatible con Supabase SQL Editor
-- ========================================

-- 1. Tabla principal de bases de conocimiento empresariales
CREATE TABLE IF NOT EXISTS company_knowledge_bases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    drive_folder_id TEXT NOT NULL,
    drive_folder_url TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'syncing', 'error')),
    settings JSONB DEFAULT '{}',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_kb UNIQUE (company_id)
);

-- 2. Tabla de carpetas de conocimiento por empresa
CREATE TABLE IF NOT EXISTS knowledge_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    knowledge_base_id UUID NOT NULL REFERENCES company_knowledge_bases(id) ON DELETE CASCADE,
    folder_type TEXT NOT NULL CHECK (folder_type IN ('documents', 'policies', 'faqs', 'training', 'templates', 'multimedia')),
    drive_folder_id TEXT NOT NULL,
    drive_folder_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_folder_type UNIQUE (company_id, folder_type)
);

-- 3. Tabla de categorías de conocimiento
CREATE TABLE IF NOT EXISTS knowledge_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'folder',
    parent_id UUID REFERENCES knowledge_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_category_name UNIQUE (company_id, name)
);

-- 4. Tabla de documentos vectorizados (sin VECTOR por ahora)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES knowledge_folders(id) ON DELETE SET NULL,
    category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    google_file_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    file_size BIGINT DEFAULT 0,
    file_type TEXT,
    file_url TEXT,
    folder_type TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'processing', 'error', 'deleted')),
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_error TEXT,
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_google_file UNIQUE (company_id, google_file_id)
);

-- 5. Tabla de FAQs (simplificada)
CREATE TABLE IF NOT EXISTS faq_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT,
    priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de permisos de conocimiento
CREATE TABLE IF NOT EXISTS knowledge_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    permissions TEXT[] DEFAULT '{}',
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT unique_company_user_permission UNIQUE (company_id, user_id)
);

-- 7. Tabla de configuración de IA para conocimiento
CREATE TABLE IF NOT EXISTS knowledge_ai_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    embedding_model TEXT DEFAULT 'groq' CHECK (embedding_model IN ('groq', 'openai', 'claude')),
    similarity_threshold DECIMAL(3,2) DEFAULT 0.7,
    max_chunks_per_document INTEGER DEFAULT 50,
    chunk_size INTEGER DEFAULT 8000,
    chunk_overlap INTEGER DEFAULT 200,
    auto_vectorize BOOLEAN DEFAULT true,
    auto_sync BOOLEAN DEFAULT true,
    supported_formats TEXT[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'],
    max_file_size_mb INTEGER DEFAULT 50,
    processing_queue_enabled BOOLEAN DEFAULT true,
    custom_settings JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_company_ai_config UNIQUE (company_id)
);

-- ========================================
-- ÍNDICES para optimización
-- ========================================

-- Índices para company_knowledge_bases
CREATE INDEX IF NOT EXISTS idx_company_kb_company_id ON company_knowledge_bases(company_id);
CREATE INDEX IF NOT EXISTS idx_company_kb_status ON company_knowledge_bases(status);
CREATE INDEX IF NOT EXISTS idx_company_kb_last_sync ON company_knowledge_bases(last_sync_at);

-- Índices para knowledge_folders
CREATE INDEX IF NOT EXISTS idx_kf_company_id ON knowledge_folders(company_id);
CREATE INDEX IF NOT EXISTS idx_kf_kb_id ON knowledge_folders(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_kf_folder_type ON knowledge_folders(folder_type);

-- Índices para knowledge_categories
CREATE INDEX IF NOT EXISTS idx_kc_company_id ON knowledge_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_kc_parent_id ON knowledge_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_kc_is_active ON knowledge_categories(is_active);

-- Índices para knowledge_documents
CREATE INDEX IF NOT EXISTS idx_kd_company_id ON knowledge_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_kd_folder_id ON knowledge_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_kd_category_id ON knowledge_documents(category_id);
CREATE INDEX IF NOT EXISTS idx_kd_status ON knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_kd_processing_status ON knowledge_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_kd_folder_type ON knowledge_documents(folder_type);
CREATE INDEX IF NOT EXISTS idx_kd_created_at ON knowledge_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_kd_tags ON knowledge_documents USING GIN(tags);

-- Índices para faq_entries
CREATE INDEX IF NOT EXISTS idx_faq_company_id ON faq_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_faq_category_id ON faq_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_faq_status ON faq_entries(status);
CREATE INDEX IF NOT EXISTS idx_faq_priority ON faq_entries(priority);

-- Índices para knowledge_permissions
CREATE INDEX IF NOT EXISTS idx_kp_company_id ON knowledge_permissions(company_id);
CREATE INDEX IF NOT EXISTS idx_kp_user_id ON knowledge_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kp_role ON knowledge_permissions(role);
CREATE INDEX IF NOT EXISTS idx_kp_is_active ON knowledge_permissions(is_active);

-- ========================================
-- TRIGGERS para actualización automática de timestamps
-- ========================================

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para company_knowledge_bases
DROP TRIGGER IF EXISTS update_company_knowledge_bases_updated_at ON company_knowledge_bases;
CREATE TRIGGER update_company_knowledge_bases_updated_at
    BEFORE UPDATE ON company_knowledge_bases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para knowledge_categories
DROP TRIGGER IF EXISTS update_knowledge_categories_updated_at ON knowledge_categories;
CREATE TRIGGER update_knowledge_categories_updated_at
    BEFORE UPDATE ON knowledge_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para knowledge_documents
DROP TRIGGER IF EXISTS update_knowledge_documents_updated_at ON knowledge_documents;
CREATE TRIGGER update_knowledge_documents_updated_at
    BEFORE UPDATE ON knowledge_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para faq_entries
DROP TRIGGER IF EXISTS update_faq_entries_updated_at ON faq_entries;
CREATE TRIGGER update_faq_entries_updated_at
    BEFORE UPDATE ON faq_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para knowledge_ai_config
DROP TRIGGER IF EXISTS update_knowledge_ai_config_updated_at ON knowledge_ai_config;
CREATE TRIGGER update_knowledge_ai_config_updated_at
    BEFORE UPDATE ON knowledge_ai_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- CONFIGURACIÓN INICIAL
-- ========================================

-- Insertar configuración por defecto para empresas existentes
INSERT INTO knowledge_ai_config (company_id)
SELECT id FROM companies 
WHERE id NOT IN (SELECT company_id FROM knowledge_ai_config);

-- Confirmación final
SELECT '✅ Tablas de base de conocimiento empresarial creadas exitosamente!' as status;

-- Mostrar tablas creadas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('company_knowledge_bases', 'knowledge_folders', 'knowledge_categories', 'knowledge_documents', 'faq_entries', 'knowledge_permissions', 'knowledge_ai_config')
ORDER BY table_name, ordinal_position;