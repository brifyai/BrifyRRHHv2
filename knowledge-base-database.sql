-- Esquema de Base de Datos para Gestión de Conocimiento
-- Compatible con WhatsApp Business 2026 y políticas de cumplimiento

-- ========================================
-- 1. Tabla de Categorías de Conocimiento
-- ========================================
CREATE TABLE IF NOT EXISTS knowledge_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones
    CONSTRAINT knowledge_categories_name_company_unique UNIQUE(name, company_id)
);

-- Índices
CREATE INDEX idx_knowledge_categories_company_id ON knowledge_categories(company_id);
CREATE INDEX idx_knowledge_categories_name ON knowledge_categories(name);

-- ========================================
-- 2. Tabla de FAQs (Preguntas Frecuentes)
-- ========================================
CREATE TABLE IF NOT EXISTS faq_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT, -- Palabras clave separadas por comas
    priority INTEGER DEFAULT 1, -- 1=Alta, 2=Media, 3=Baja
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Campos para búsqueda y optimización
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', question), 'A') ||
        setweight(to_tsvector('spanish', answer), 'B') ||
        setweight(to_tsvector('spanish', COALESCE(keywords, '')), 'C')
    ) STORED,
    
    -- Restricciones
    CONSTRAINT faq_entries_status_check CHECK (status IN ('active', 'inactive', 'archived')),
    CONSTRAINT faq_entries_priority_check CHECK (priority BETWEEN 1 AND 3)
);

-- Índices
CREATE INDEX idx_faq_entries_company_id ON faq_entries(company_id);
CREATE INDEX idx_faq_entries_category_id ON faq_entries(category_id);
CREATE INDEX idx_faq_entries_status ON faq_entries(status);
CREATE INDEX idx_faq_entries_priority ON faq_entries(priority);
CREATE INDEX idx_faq_entries_search_vector ON faq_entries USING GIN(search_vector);

-- ========================================
-- 3. Tabla de Documentos de Conocimiento
-- ========================================
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    
    -- Información del archivo
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64), -- SHA-256 para integridad
    
    -- Metadatos
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    
    -- Campos de búsqueda
    content_text TEXT, -- Texto extraído del documento para búsqueda
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', title), 'A') ||
        setweight(to_tsvector('spanish', COALESCE(description, '')), 'B') ||
        setweight(to_tsvector('spanish', COALESCE(content_text, '')), 'C')
    ) STORED,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones
    CONSTRAINT knowledge_documents_status_check CHECK (status IN ('active', 'inactive', 'archived')),
    CONSTRAINT knowledge_documents_file_size_positive CHECK (file_size > 0)
);

-- Índices
CREATE INDEX idx_knowledge_documents_company_id ON knowledge_documents(company_id);
CREATE INDEX idx_knowledge_documents_category_id ON knowledge_documents(category_id);
CREATE INDEX idx_knowledge_documents_status ON knowledge_documents(status);
CREATE INDEX idx_knowledge_documents_file_type ON knowledge_documents(file_type);
CREATE INDEX idx_knowledge_documents_search_vector ON knowledge_documents USING GIN(search_vector);

-- ========================================
-- 4. Tabla de Uso de Conocimiento (para cumplimiento)
-- ========================================
CREATE TABLE IF NOT EXISTS knowledge_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Información del usuario (anonimizada para cumplimiento)
    user_phone_hash VARCHAR(64) NOT NULL, -- Hash del teléfono para privacidad
    user_session_id VARCHAR(100),
    
    -- Información de la consulta
    query_text TEXT NOT NULL,
    query_type VARCHAR(50) DEFAULT 'text', -- text, voice, etc.
    
    -- Resultado
    source_type VARCHAR(50) NOT NULL, -- faq, document, ai, etc.
    source_id UUID, -- Referencia a la fuente usada
    source_name VARCHAR(255),
    response_content TEXT,
    confidence DECIMAL(3,2), -- 0.00 a 1.00
    response_time INTEGER, -- Tiempo en milisegundos
    
    -- Información de cumplimiento
    terms_2026_compliant BOOLEAN DEFAULT true,
    pse_authorized BOOLEAN DEFAULT false,
    ai_provider BOOLEAN DEFAULT false,
    no_profiling BOOLEAN DEFAULT true,
    exclusive_use BOOLEAN DEFAULT true,
    
    -- Resultado
    successful BOOLEAN DEFAULT true,
    requires_human BOOLEAN DEFAULT false,
    escalation_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones
    CONSTRAINT knowledge_usage_logs_confidence_range CHECK (confidence BETWEEN 0 AND 1),
    CONSTRAINT knowledge_usage_logs_response_time_positive CHECK (response_time >= 0)
);

-- Índices
CREATE INDEX idx_knowledge_usage_logs_company_id ON knowledge_usage_logs(company_id);
CREATE INDEX idx_knowledge_usage_logs_user_phone_hash ON knowledge_usage_logs(user_phone_hash);
CREATE INDEX idx_knowledge_usage_logs_source_type ON knowledge_usage_logs(source_type);
CREATE INDEX idx_knowledge_usage_logs_created_at ON knowledge_usage_logs(created_at);
CREATE INDEX idx_knowledge_usage_logs_successful ON knowledge_usage_logs(successful);

-- ========================================
-- 5. Tabla de Proveedores de Servicios Externos (PSE)
-- ========================================
CREATE TABLE IF NOT EXISTS external_knowledge_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Información del proveedor
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- faq, api, database, ai, crm
    description TEXT,
    endpoint VARCHAR(500),
    
    -- Configuración
    config JSONB DEFAULT '{}',
    headers JSONB DEFAULT '{}',
    timeout INTEGER DEFAULT 5000, -- milisegundos
    
    -- Prioridad y estado
    priority INTEGER DEFAULT 1,
    enabled BOOLEAN DEFAULT true,
    
    -- Cumplimiento términos 2026
    requires_pse_agreement BOOLEAN DEFAULT false,
    written_agreement_file VARCHAR(500),
    agreement_status VARCHAR(20) DEFAULT 'pending' CHECK (agreement_status IN ('pending', 'active', 'expired', 'revoked')),
    compliance_verified BOOLEAN DEFAULT false,
    
    -- Restricciones específicas
    ai_provider BOOLEAN DEFAULT false,
    allows_training BOOLEAN DEFAULT false,
    model_isolation VARCHAR(20) DEFAULT 'none' CHECK (model_isolation IN ('none', 'partial', 'complete')),
    exclusive_use BOOLEAN DEFAULT true,
    no_profiling BOOLEAN DEFAULT true,
    no_data_sharing BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones
    CONSTRAINT external_knowledge_providers_type_check CHECK (type IN ('faq', 'api', 'database', 'ai', 'crm')),
    CONSTRAINT external_knowledge_providers_priority_positive CHECK (priority > 0)
);

-- Índices
CREATE INDEX idx_external_knowledge_providers_company_id ON external_knowledge_providers(company_id);
CREATE INDEX idx_external_knowledge_providers_type ON external_knowledge_providers(type);
CREATE INDEX idx_external_knowledge_providers_enabled ON external_knowledge_providers(enabled);
CREATE INDEX idx_external_knowledge_providers_priority ON external_knowledge_providers(priority);

-- ========================================
-- 6. Tabla de Interacciones de Conocimiento
-- ========================================
CREATE TABLE IF NOT EXISTS knowledge_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Información del usuario (anonimizada)
    user_phone_hash VARCHAR(64) NOT NULL,
    
    -- Detalles de la interacción
    interaction_type VARCHAR(50) NOT NULL, -- query, feedback, rating, etc.
    source_type VARCHAR(50), -- faq, document, ai, etc.
    source_id UUID,
    
    -- Contenido
    message TEXT,
    response TEXT,
    
    -- Feedback del usuario
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    helpful BOOLEAN,
    
    -- Métricas
    confidence DECIMAL(3,2),
    response_time INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones
    CONSTRAINT knowledge_interactions_rating_range CHECK (rating BETWEEN 1 AND 5)
);

-- Índices
CREATE INDEX idx_knowledge_interactions_company_id ON knowledge_interactions(company_id);
CREATE INDEX idx_knowledge_interactions_user_phone_hash ON knowledge_interactions(user_phone_hash);
CREATE INDEX idx_knowledge_interactions_interaction_type ON knowledge_interactions(interaction_type);
CREATE INDEX idx_knowledge_interactions_rating ON knowledge_interactions(rating);
CREATE INDEX idx_knowledge_interactions_created_at ON knowledge_interactions(created_at);

-- ========================================
-- 7. Función de Búsqueda Avanzada
-- ========================================
CREATE OR REPLACE FUNCTION search_knowledge_base_compliant(
    p_company_id INTEGER,
    p_query TEXT,
    p_limit INTEGER DEFAULT 10,
    p_no_profiling BOOLEAN DEFAULT true
)
RETURNS TABLE (
    id UUID,
    source_type VARCHAR(50),
    title TEXT,
    content TEXT,
    confidence DECIMAL(3,2),
    category_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    -- Buscar en FAQs
    SELECT 
        f.id,
        'faq'::VARCHAR(50) as source_type,
        f.question as title,
        f.answer as content,
        ts_rank_cd(f.search_vector, plainto_tsquery('spanish', p_query)) * 100::DECIMAL(3,2) as confidence,
        c.name as category_name,
        f.created_at
    FROM faq_entries f
    LEFT JOIN knowledge_categories c ON f.category_id = c.id
    WHERE f.company_id = p_company_id
        AND f.status = 'active'
        AND f.search_vector @@ plainto_tsquery('spanish', p_query)
    
    UNION ALL
    
    -- Buscar en Documentos
    SELECT 
        d.id,
        'document'::VARCHAR(50) as source_type,
        d.title,
        COALESCE(d.description, '') as content,
        ts_rank_cd(d.search_vector, plainto_tsquery('spanish', p_query)) * 100::DECIMAL(3,2) as confidence,
        c.name as category_name,
        d.created_at
    FROM knowledge_documents d
    LEFT JOIN knowledge_categories c ON d.category_id = c.id
    WHERE d.company_id = p_company_id
        AND d.status = 'active'
        AND d.search_vector @@ plainto_tsquery('spanish', p_query)
    
    ORDER BY confidence DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. Trigger para actualizar updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers a todas las tablas
CREATE TRIGGER update_knowledge_categories_updated_at 
    BEFORE UPDATE ON knowledge_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_entries_updated_at 
    BEFORE UPDATE ON faq_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_documents_updated_at 
    BEFORE UPDATE ON knowledge_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_knowledge_providers_updated_at 
    BEFORE UPDATE ON external_knowledge_providers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 9. Políticas de Seguridad (RLS)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_knowledge_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_interactions ENABLE ROW LEVEL SECURITY;

-- Políticas para knowledge_categories
CREATE POLICY "Users can view own company knowledge categories" ON knowledge_categories
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_companies 
            WHERE company_id = knowledge_categories.company_id
        )
    );

CREATE POLICY "Users can insert own company knowledge categories" ON knowledge_categories
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM user_companies 
            WHERE company_id = knowledge_categories.company_id
        )
    );

CREATE POLICY "Users can update own company knowledge categories" ON knowledge_categories
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM user_companies 
            WHERE company_id = knowledge_categories.company_id
        )
    );

CREATE POLICY "Users can delete own company knowledge categories" ON knowledge_categories
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM user_companies 
            WHERE company_id = knowledge_categories.company_id
        )
    );

-- Políticas similares para las otras tablas...
CREATE POLICY "Users can view own company faq_entries" ON faq_entries
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_companies 
            WHERE company_id = faq_entries.company_id
        )
    );

CREATE POLICY "Users can manage own company faq_entries" ON faq_entries
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_companies 
            WHERE company_id = faq_entries.company_id
        )
    );

CREATE POLICY "Users can view own company knowledge_documents" ON knowledge_documents
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_companies 
            WHERE company_id = knowledge_documents.company_id
        )
    );

CREATE POLICY "Users can manage own company knowledge_documents" ON knowledge_documents
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_companies 
            WHERE company_id = knowledge_documents.company_id
        )
    );

-- ========================================
-- 10. Datos Iniciales (Opcional)
-- ========================================

-- Insertar categorías por defecto para nuevas empresas
-- Esto se ejecutaría cuando se crea una nueva empresa

-- Ejemplo de inserción (descomentar si se necesita)
/*
INSERT INTO knowledge_categories (company_id, name, description, color) VALUES
(1, 'General', 'Preguntas y respuestas generales', '#3B82F6'),
(1, 'Productos', 'Información sobre productos y servicios', '#10B981'),
(1, 'Soporte Técnico', 'Ayuda técnica y solución de problemas', '#F59E0B'),
(1, 'Facturación', 'Preguntas sobre facturas y pagos', '#EF4444'),
(1, 'Políticas', 'Políticas de privacidad y términos de servicio', '#8B5CF6');
*/

-- ========================================
-- 11. Vistas Útiles
-- ========================================

-- Vista de estadísticas de uso de conocimiento
CREATE OR REPLACE VIEW knowledge_usage_stats AS
SELECT 
    company_id,
    DATE_TRUNC('day', created_at) as date,
    source_type,
    COUNT(*) as total_queries,
    AVG(confidence) as avg_confidence,
    AVG(response_time) as avg_response_time,
    COUNT(CASE WHEN successful THEN 1 END) as successful_queries,
    COUNT(CASE WHEN requires_human THEN 1 END) as escalated_queries
FROM knowledge_usage_logs
GROUP BY company_id, DATE_TRUNC('day', created_at), source_type
ORDER BY date DESC;

-- Vista de conocimiento más popular
CREATE OR REPLACE VIEW popular_knowledge AS
SELECT 
    ke.company_id,
    ke.source_type,
    ke.source_id,
    COUNT(*) as usage_count,
    AVG(kul.confidence) as avg_confidence,
    AVG(kul.rating) as avg_rating
FROM knowledge_usage_logs ke
LEFT JOIN knowledge_interactions kul ON ke.user_phone_hash = kul.user_phone_hash 
    AND ke.created_at = kul.created_at
WHERE ke.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ke.company_id, ke.source_type, ke.source_id
HAVING COUNT(*) > 0
ORDER BY usage_count DESC;

-- ========================================
-- 12. Comentarios y Documentación
-- ========================================

COMMENT ON TABLE knowledge_categories IS 'Categorías para organizar la base de conocimiento';
COMMENT ON TABLE faq_entries IS 'Preguntas frecuentes con búsqueda full-text y prioridad';
COMMENT ON TABLE knowledge_documents IS 'Documentos subidos con extracción de texto para búsqueda';
COMMENT ON TABLE knowledge_usage_logs IS 'Logs de uso para cumplimiento con políticas de WhatsApp Business 2026';
COMMENT ON TABLE external_knowledge_providers IS 'Proveedores externos autorizados según términos 2026';
COMMENT ON TABLE knowledge_interactions IS 'Interacciones de usuarios con feedback y rating';

COMMENT ON COLUMN faq_entries.search_vector IS 'Vector de búsqueda full-text para PostgreSQL';
COMMENT ON COLUMN knowledge_documents.search_vector IS 'Vector de búsqueda full-text para documentos';
COMMENT ON COLUMN knowledge_usage_logs.user_phone_hash IS 'Hash del teléfono para cumplir con políticas de privacidad';
COMMENT ON COLUMN external_knowledge_providers.ai_provider IS 'Indica si es un proveedor de IA con restricciones especiales';

-- ========================================
-- FIN DEL ESQUEMA
-- ========================================