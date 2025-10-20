-- ========================================
-- Sistema de Base de Conocimiento Empresarial
-- ========================================
-- Este script crea las tablas necesarias para el sistema
-- automático de bases de conocimiento con Google Drive y vectorización

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
    
    -- Índices para mejor rendimiento
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
    
    -- Índices
    CONSTRAINT unique_company_folder_type UNIQUE (company_id, folder_type)
);

-- 3. Tabla de categorías de conocimiento (mejorada)
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
    
    -- Índices
    CONSTRAINT unique_company_category_name UNIQUE (company_id, name)
);

-- 4. Tabla de documentos vectorizados
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES knowledge_folders(id) ON DELETE SET NULL,
    category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    google_file_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    embedding VECTOR(768), -- Vector para búsqueda semántica
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
    
    -- Índices
    CONSTRAINT unique_company_google_file UNIQUE (company_id, google_file_id)
);

-- 5. Tabla de chunks de documentos para búsqueda granular
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(768), -- Vector para búsqueda semántica
    token_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    CONSTRAINT unique_document_chunk UNIQUE (document_id, chunk_index)
);

-- 6. Tabla de FAQs (mejorada con embeddings)
CREATE TABLE IF NOT EXISTS faq_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT,
    embedding VECTOR(768), -- Vector para búsqueda semántica
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

-- 7. Tabla de permisos de conocimiento
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
    
    -- Índices
    CONSTRAINT unique_company_user_permission UNIQUE (company_id, user_id)
);

-- 8. Tabla de interacciones con el conocimiento
CREATE TABLE IF NOT EXISTS knowledge_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('search', 'view', 'download', 'share', 'feedback')),
    target_type TEXT NOT NULL CHECK (target_type IN ('document', 'faq', 'category')),
    target_id UUID NOT NULL,
    query TEXT, -- Para búsquedas
    relevance_score DECIMAL(3,2), -- Para feedback de relevancia
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabla de sincronización de Google Drive
CREATE TABLE IF NOT EXISTS drive_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'manual')),
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    files_processed INTEGER DEFAULT 0,
    files_created INTEGER DEFAULT 0,
    files_updated INTEGER DEFAULT 0,
    files_deleted INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_details JSONB DEFAULT '[]',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}'
);

-- 10. Tabla de configuración de IA para conocimiento
CREATE TABLE IF NOT EXISTS knowledge_ai_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    embedding_model TEXT DEFAULT 'groq' CHECK (embedding_model IN ('groq', 'openai', 'claude')),
    embedding_dimension INTEGER DEFAULT 768,
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
    
    -- Índices
    CONSTRAINT unique_company_ai_config UNIQUE (company_id)
);

-- ========================================
-- ÍNDICES para optimización de búsquedas
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

-- Índices para knowledge_chunks
CREATE INDEX IF NOT EXISTS idx_kc_document_id ON knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_kc_company_id ON knowledge_chunks(company_id);
CREATE INDEX IF NOT EXISTS idx_kc_chunk_index ON knowledge_chunks(chunk_index);

-- Índices para faq_entries
CREATE INDEX IF NOT EXISTS idx_faq_company_id ON faq_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_faq_category_id ON faq_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_faq_status ON faq_entries(status);
CREATE INDEX IF NOT EXISTS idx_faq_priority ON faq_entries(priority);
CREATE INDEX IF NOT EXISTS idx_faq_keywords ON faq_entries USING GIN(to_tsvector('spanish', keywords || ' ' || question || ' ' || answer));

-- Índices para knowledge_permissions
CREATE INDEX IF NOT EXISTS idx_kp_company_id ON knowledge_permissions(company_id);
CREATE INDEX IF NOT EXISTS idx_kp_user_id ON knowledge_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kp_role ON knowledge_permissions(role);
CREATE INDEX IF NOT EXISTS idx_kp_is_active ON knowledge_permissions(is_active);

-- Índices para knowledge_interactions
CREATE INDEX IF NOT EXISTS idx_ki_company_id ON knowledge_interactions(company_id);
CREATE INDEX IF NOT EXISTS idx_ki_user_id ON knowledge_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ki_interaction_type ON knowledge_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ki_target_type ON knowledge_interactions(target_type);
CREATE INDEX IF NOT EXISTS idx_ki_created_at ON knowledge_interactions(created_at);

-- Índices para drive_sync_logs
CREATE INDEX IF NOT EXISTS idx_dsl_company_id ON drive_sync_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_dsl_status ON drive_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_dsl_started_at ON drive_sync_logs(started_at);

-- ========================================
-- FUNCIONES para búsqueda semántica
-- ========================================

-- Función para buscar documentos por similitud de vectores
CREATE OR REPLACE FUNCTION search_knowledge_documents(
    p_company_id UUID,
    p_query_embedding VECTOR(768),
    p_similarity_threshold DECIMAL DEFAULT 0.7,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    description TEXT,
    file_type TEXT,
    folder_type TEXT,
    category_name TEXT,
    similarity DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kd.id,
        kd.title,
        kd.content,
        kd.description,
        kd.file_type,
        kd.folder_type,
        kc.name as category_name,
        (1 - (kd.embedding <=> p_query_embedding))::DECIMAL(3,2) as similarity,
        kd.created_at
    FROM knowledge_documents kd
    LEFT JOIN knowledge_categories kc ON kd.category_id = kc.id
    WHERE kd.company_id = p_company_id
        AND kd.status = 'active'
        AND kd.embedding IS NOT NULL
        AND (1 - (kd.embedding <=> p_query_embedding)) >= p_similarity_threshold
    ORDER BY similarity DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar en chunks (más granular)
CREATE OR REPLACE FUNCTION search_knowledge_chunks(
    p_company_id UUID,
    p_query_embedding VECTOR(768),
    p_similarity_threshold DECIMAL DEFAULT 0.7,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    document_title TEXT,
    chunk_content TEXT,
    chunk_index INTEGER,
    similarity DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kc.id,
        kc.document_id,
        kd.title as document_title,
        kc.content as chunk_content,
        kc.chunk_index,
        (1 - (kc.embedding <=> p_query_embedding))::DECIMAL(3,2) as similarity,
        kc.created_at
    FROM knowledge_chunks kc
    JOIN knowledge_documents kd ON kc.document_id = kd.id
    WHERE kc.company_id = p_company_id
        AND kd.status = 'active'
        AND kc.embedding IS NOT NULL
        AND (1 - (kc.embedding <=> p_query_embedding)) >= p_similarity_threshold
    ORDER BY similarity DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar FAQs combinando texto y vectores
CREATE OR REPLACE FUNCTION search_faqs_hybrid(
    p_company_id UUID,
    p_query TEXT,
    p_query_embedding VECTOR(768),
    p_similarity_threshold DECIMAL DEFAULT 0.7,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    question TEXT,
    answer TEXT,
    keywords TEXT,
    priority INTEGER,
    text_relevance DECIMAL,
    semantic_similarity DECIMAL,
    combined_score DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.question,
        f.answer,
        f.keywords,
        f.priority,
        CASE 
            WHEN p_query ILIKE ANY(string_to_array(f.keywords, ',')) THEN 1.0
            WHEN p_query ILIKE ANY(string_to_array(f.question, ' ')) THEN 0.8
            WHEN p_query ILIKE ANY(string_to_array(f.answer, ' ')) THEN 0.6
            ELSE 0.3
        END::DECIMAL(3,2) as text_relevance,
        COALESCE((1 - (f.embedding <=> p_query_embedding))::DECIMAL(3,2), 0) as semantic_similarity,
        (
            CASE 
                WHEN p_query ILIKE ANY(string_to_array(f.keywords, ',')) THEN 1.0
                WHEN p_query ILIKE ANY(string_to_array(f.question, ' ')) THEN 0.8
                WHEN p_query ILIKE ANY(string_to_array(f.answer, ' ')) THEN 0.6
                ELSE 0.3
            END * 0.6 + 
            COALESCE((1 - (f.embedding <=> p_query_embedding)), 0) * 0.4
        )::DECIMAL(3,2) as combined_score,
        f.created_at
    FROM faq_entries f
    WHERE f.company_id = p_company_id
        AND f.status = 'active'
        AND (
            p_query ILIKE ANY(string_to_array(f.keywords, ',')) OR
            p_query ILIKE ANY(string_to_array(f.question, ' ')) OR
            p_query ILIKE ANY(string_to_array(f.answer, ' ')) OR
            (f.embedding IS NOT NULL AND (1 - (f.embedding <=> p_query_embedding)) >= p_similarity_threshold)
        )
    ORDER BY combined_score DESC, f.priority ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS para actualización automática de timestamps
-- ========================================

-- Trigger para company_knowledge_bases
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_knowledge_bases_updated_at
    BEFORE UPDATE ON company_knowledge_bases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para knowledge_categories
CREATE TRIGGER update_knowledge_categories_updated_at
    BEFORE UPDATE ON knowledge_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para knowledge_documents
CREATE TRIGGER update_knowledge_documents_updated_at
    BEFORE UPDATE ON knowledge_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para faq_entries
CREATE TRIGGER update_faq_entries_updated_at
    BEFORE UPDATE ON faq_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para knowledge_ai_config
CREATE TRIGGER update_knowledge_ai_config_updated_at
    BEFORE UPDATE ON knowledge_ai_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE company_knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_ai_config ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades específicas)
CREATE POLICY "Users can view own company knowledge" ON company_knowledge_bases
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
            OR id IN (
                SELECT company_id FROM company_users WHERE user_id = auth.uid()
            )
        )
    );

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista de estadísticas de conocimiento por empresa
CREATE OR REPLACE VIEW company_knowledge_stats AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT kd.id) as total_documents,
    COUNT(DISTINCT CASE WHEN kd.status = 'active' THEN kd.id END) as active_documents,
    COUNT(DISTINCT kc.id) as total_chunks,
    COUNT(DISTINCT f.id) as total_faqs,
    COUNT(DISTINCT CASE WHEN f.status = 'active' THEN f.id END) as active_faqs,
    COUNT(DISTINCT kcat.id) as total_categories,
    COALESCE(kb.last_sync_at, NOW() - INTERVAL '1 year') as last_sync_at,
    kb.status as kb_status
FROM companies c
LEFT JOIN company_knowledge_bases kb ON c.id = kb.company_id
LEFT JOIN knowledge_documents kd ON c.id = kd.company_id
LEFT JOIN knowledge_chunks kc ON kd.id = kc.document_id
LEFT JOIN faq_entries f ON c.id = f.company_id
LEFT JOIN knowledge_categories kcat ON c.id = kcat.company_id
GROUP BY c.id, c.name, kb.last_sync_at, kb.status;

-- Vista de documentos recientes por empresa
CREATE OR REPLACE VIEW recent_company_documents AS
SELECT 
    kd.company_id,
    c.name as company_name,
    kd.id,
    kd.title,
    kd.description,
    kd.file_type,
    kd.folder_type,
    kd.created_at,
    kc.name as category_name,
    kf.drive_folder_name
FROM knowledge_documents kd
JOIN companies c ON kd.company_id = c.id
LEFT JOIN knowledge_categories kc ON kd.category_id = kc.id
LEFT JOIN knowledge_folders kf ON kd.folder_id = kf.id
WHERE kd.status = 'active'
ORDER BY kd.created_at DESC;

-- ========================================
-- CONFIGURACIÓN INICIAL
-- ========================================

-- Insertar configuración por defecto para empresas existentes
INSERT INTO knowledge_ai_config (company_id)
SELECT id FROM companies 
WHERE id NOT IN (SELECT company_id FROM knowledge_ai_config);

-- Comentarios para documentación
COMMENT ON TABLE company_knowledge_bases IS 'Tabla principal de bases de conocimiento empresariales';
COMMENT ON TABLE knowledge_folders IS 'Carpetas organizativas en Google Drive por empresa';
COMMENT ON TABLE knowledge_categories IS 'Categorías personalizables para organizar el conocimiento';
COMMENT ON TABLE knowledge_documents IS 'Documentos vectorizados con embeddings para búsqueda semántica';
COMMENT ON TABLE knowledge_chunks IS 'Fragmentos de documentos para búsqueda granular';
COMMENT ON TABLE faq_entries IS 'Preguntas frecuentes con búsqueda híbrida (texto + vectores)';
COMMENT ON TABLE knowledge_permissions IS 'Permisos de acceso a la base de conocimiento por usuario';
COMMENT ON TABLE knowledge_interactions IS 'Registro de interacciones para analíticas y mejoras';
COMMENT ON TABLE drive_sync_logs IS 'Logs de sincronización con Google Drive';
COMMENT ON TABLE knowledge_ai_config IS 'Configuración de IA y procesamiento por empresa';

-- Finalización
SELECT 'Company Knowledge Base tables created successfully!' as status;