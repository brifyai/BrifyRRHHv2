-- ========================================
-- SISTEMA DE CARPETAS DE EMPLEADOS
-- Tabla para vincular carpetas físicas con Supabase
-- ========================================

-- Tabla principal de carpetas de empleados
CREATE TABLE IF NOT EXISTS employee_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_email TEXT NOT NULL,
    employee_id TEXT,
    employee_name TEXT,
    employee_position TEXT,
    employee_department TEXT,
    employee_phone TEXT,
    employee_region TEXT,
    employee_level TEXT,
    employee_work_mode TEXT,
    employee_contract_type TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    company_name TEXT,
    drive_folder_id TEXT,
    drive_folder_url TEXT,
    local_folder_path TEXT,
    folder_status TEXT DEFAULT 'active' CHECK (folder_status IN ('active', 'inactive', 'syncing', 'error')),
    settings JSONB DEFAULT '{}',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_employee_email UNIQUE (employee_email)
);

-- Tabla para documentos de empleados
CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES employee_folders(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_type TEXT,
    file_size BIGINT DEFAULT 0,
    google_file_id TEXT,
    local_file_path TEXT,
    file_url TEXT,
    description TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'processing', 'error', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para FAQs de empleados
CREATE TABLE IF NOT EXISTS employee_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES employee_folders(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT,
    category TEXT,
    priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para historial de conversaciones
CREATE TABLE IF NOT EXISTS employee_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES employee_folders(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
    message_content TEXT NOT NULL,
    channel TEXT DEFAULT 'chat' CHECK (channel IN ('chat', 'whatsapp', 'telegram', 'email')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración de notificaciones por empleado
CREATE TABLE IF NOT EXISTS employee_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES employee_folders(id) ON DELETE CASCADE,
    whatsapp_enabled BOOLEAN DEFAULT true,
    telegram_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    response_language TEXT DEFAULT 'es',
    timezone TEXT DEFAULT 'America/Santiago',
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_folder_notification UNIQUE (folder_id)
);

-- ========================================
-- ÍNDICES para optimización
-- ========================================

-- Índices para employee_folders
CREATE INDEX IF NOT EXISTS idx_ef_employee_email ON employee_folders(employee_email);
CREATE INDEX IF NOT EXISTS idx_ef_company_id ON employee_folders(company_id);
CREATE INDEX IF NOT EXISTS idx_ef_drive_folder_id ON employee_folders(drive_folder_id);
CREATE INDEX IF NOT EXISTS idx_ef_folder_status ON employee_folders(folder_status);
CREATE INDEX IF NOT EXISTS idx_ef_created_at ON employee_folders(created_at);

-- Índices para employee_documents
CREATE INDEX IF NOT EXISTS idx_ed_folder_id ON employee_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_ed_google_file_id ON employee_documents(google_file_id);
CREATE INDEX IF NOT EXISTS idx_ed_document_type ON employee_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_ed_status ON employee_documents(status);
CREATE INDEX IF NOT EXISTS idx_ed_tags ON employee_documents USING GIN(tags);

-- Índices para employee_faqs
CREATE INDEX IF NOT EXISTS idx_efaq_folder_id ON employee_faqs(folder_id);
CREATE INDEX IF NOT EXISTS idx_efaq_status ON employee_faqs(status);
CREATE INDEX IF NOT EXISTS idx_efaq_category ON employee_faqs(category);
CREATE INDEX IF NOT EXISTS idx_efaq_priority ON employee_faqs(priority);

-- Índices para employee_conversations
CREATE INDEX IF NOT EXISTS idx_ec_folder_id ON employee_conversations(folder_id);
CREATE INDEX IF NOT EXISTS idx_ec_message_type ON employee_conversations(message_type);
CREATE INDEX IF NOT EXISTS idx_ec_channel ON employee_conversations(channel);
CREATE INDEX IF NOT EXISTS idx_ec_created_at ON employee_conversations(created_at);

-- Índices para employee_notification_settings
CREATE INDEX IF NOT EXISTS idx_ens_folder_id ON employee_notification_settings(folder_id);

-- ========================================
-- TRIGGERS para actualización automática de timestamps
-- ========================================

-- Trigger para employee_folders
DROP TRIGGER IF EXISTS update_employee_folders_updated_at ON employee_folders;
CREATE TRIGGER update_employee_folders_updated_at
    BEFORE UPDATE ON employee_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para employee_documents
DROP TRIGGER IF EXISTS update_employee_documents_updated_at ON employee_documents;
CREATE TRIGGER update_employee_documents_updated_at
    BEFORE UPDATE ON employee_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para employee_faqs
DROP TRIGGER IF EXISTS update_employee_faqs_updated_at ON employee_faqs;
CREATE TRIGGER update_employee_faqs_updated_at
    BEFORE UPDATE ON employee_faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para employee_notification_settings
DROP TRIGGER IF EXISTS update_employee_notification_settings_updated_at ON employee_notification_settings;
CREATE TRIGGER update_employee_notification_settings_updated_at
    BEFORE UPDATE ON employee_notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Función para obtener estadísticas de carpetas de una empresa
CREATE OR REPLACE FUNCTION get_company_folder_stats(company_uuid UUID)
RETURNS TABLE (
    total_folders BIGINT,
    active_folders BIGINT,
    total_documents BIGINT,
    total_faqs BIGINT,
    total_conversations BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ef.id) as total_folders,
        COUNT(DISTINCT CASE WHEN ef.folder_status = 'active' THEN ef.id END) as active_folders,
        COUNT(DISTINCT ed.id) as total_documents,
        COUNT(DISTINCT efq.id) as total_faqs,
        COUNT(DISTINCT ec.id) as total_conversations
    FROM employee_folders ef
    LEFT JOIN employee_documents ed ON ef.id = ed.folder_id
    LEFT JOIN employee_faqs efq ON ef.id = efq.folder_id
    LEFT JOIN employee_conversations ec ON ef.id = ec.folder_id
    WHERE ef.company_id = company_uuid;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar en documentos de un empleado
CREATE OR REPLACE FUNCTION search_employee_documents(employee_email TEXT, search_query TEXT)
RETURNS TABLE (
    document_id UUID,
    document_name TEXT,
    document_type TEXT,
    content_preview TEXT,
    relevance_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ed.id as document_id,
        ed.document_name,
        ed.document_type,
        LEFT(ed.description, 200) as content_preview,
        CASE 
            WHEN ed.document_name ILIKE '%' || search_query || '%' THEN 1.0
            WHEN ed.description ILIKE '%' || search_query || '%' THEN 0.8
            WHEN array_to_string(ed.tags, ' ') ILIKE '%' || search_query || '%' THEN 0.6
            ELSE 0.4
        END as relevance_score
    FROM employee_folders ef
    JOIN employee_documents ed ON ef.id = ed.folder_id
    WHERE ef.employee_email = employee_email
        AND ed.status = 'active'
        AND (
            ed.document_name ILIKE '%' || search_query || '%' OR
            ed.description ILIKE '%' || search_query || '%' OR
            array_to_string(ed.tags, ' ') ILIKE '%' || search_query || '%'
        )
    ORDER BY relevance_score DESC, ed.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Confirmación final
SELECT '✅ Sistema de carpetas de empleados creado exitosamente!' as status;

-- Mostrar tablas creadas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('employee_folders', 'employee_documents', 'employee_faqs', 'employee_conversations', 'employee_notification_settings')
ORDER BY table_name, ordinal_position;