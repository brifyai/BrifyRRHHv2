-- ========================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA employee_folders
-- ========================================

-- Deshabilitar RLS temporalmente para poder insertar datos
ALTER TABLE employee_folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_faqs DISABLE ROW LEVEL SECURITY;

-- Crear políticas más permisivas para desarrollo
-- Política para employee_folders
CREATE POLICY "Allow all operations for development" ON employee_folders
    FOR ALL USING (true)
    WITH CHECK (true);

-- Política para employee_documents  
CREATE POLICY "Allow all operations for development" ON employee_documents
    FOR ALL USING (true)
    WITH CHECK (true);

-- Política para employee_faqs
CREATE POLICY "Allow all operations for development" ON employee_faqs
    FOR ALL USING (true)
    WITH CHECK (true);

-- Volver a habilitar RLS con las nuevas políticas
ALTER TABLE employee_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_faqs ENABLE ROW LEVEL SECURITY;

-- Confirmación
SELECT '✅ Políticas RLS corregidas para desarrollo' as status;