-- Script para agregar soporte de soft delete a la tabla employee_folders
-- Esto permite mantener la integridad referencial y poder recuperar datos eliminados

-- Agregar campo para soft delete
ALTER TABLE employee_folders 
ADD COLUMN IF NOT EXISTS folder_status VARCHAR(20) DEFAULT 'active' 
CHECK (folder_status IN ('active', 'deleted', 'sync_error', 'archived'));

-- Agregar timestamp de eliminación
ALTER TABLE employee_folders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Agregar índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_employee_folders_status 
ON employee_folders(folder_status);

CREATE INDEX IF NOT EXISTS idx_employee_folders_deleted_at 
ON employee_folders(deleted_at) WHERE deleted_at IS NOT NULL;

-- Crear política RLS para manejar eliminación
-- Nota: Ajustar según tus políticas de seguridad existentes

-- Actualizar carpetas existentes para que tengan el estado correcto
UPDATE employee_folders 
SET folder_status = 'active' 
WHERE folder_status IS NULL;

-- Comentario sobre la estructura
COMMENT ON COLUMN employee_folders.folder_status IS 'Estado de la carpeta: active, deleted, sync_error, archived';
COMMENT ON COLUMN employee_folders.deleted_at IS 'Timestamp cuando la carpeta fue marcada como eliminada (soft delete)';

-- Función para contar carpetas por estado
CREATE OR REPLACE FUNCTION count_folders_by_status()
RETURNS TABLE(
  status TEXT,
  count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        folder_status::TEXT,
        COUNT(*)::BIGINT
    FROM employee_folders
    GROUP BY folder_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vista para carpetas activas (excluye eliminadas)
CREATE OR REPLACE VIEW active_employee_folders AS
SELECT 
    id,
    employee_email,
    employee_name,
    employee_id,
    employee_position,
    employee_department,
    employee_phone,
    employee_region,
    employee_level,
    employee_work_mode,
    employee_contract_type,
    company_id,
    company_name,
    drive_folder_id,
    drive_folder_url,
    settings,
    created_at,
    updated_at
FROM employee_folders
WHERE folder_status = 'active';

-- Vista para carpetas eliminadas (para auditoría)
CREATE OR REPLACE VIEW deleted_employee_folders AS
SELECT 
    id,
    employee_email,
    employee_name,
    employee_id,
    company_id,
    company_name,
    drive_folder_id,
    folder_status,
    deleted_at,
    created_at,
    updated_at
FROM employee_folders
WHERE folder_status = 'deleted'
ORDER BY deleted_at DESC;

-- Trigger para actualizar automatically updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a la tabla
DROP TRIGGER IF EXISTS update_employee_folders_updated_at ON employee_folders;
CREATE TRIGGER update_employee_folders_updated_at
    BEFORE UPDATE ON employee_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función de utilidad para soft delete
CREATE OR REPLACE FUNCTION soft_delete_employee_folder(p_employee_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    folder_id UUID;
BEGIN
    -- Obtener ID de la carpeta
    SELECT id INTO folder_id
    FROM employee_folders
    WHERE employee_email = p_employee_email AND folder_status = 'active';
    
    IF folder_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Marcar como eliminada
    UPDATE employee_folders
    SET 
        folder_status = 'deleted',
        deleted_at = CURRENT_TIMESTAMP
    WHERE id = folder_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de utilidad para restaurar carpeta eliminada
CREATE OR REPLACE FUNCTION restore_employee_folder(p_employee_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    folder_id UUID;
BEGIN
    -- Obtener ID de la carpeta eliminada
    SELECT id INTO folder_id
    FROM employee_folders
    WHERE employee_email = p_employee_email AND folder_status = 'deleted';
    
    IF folder_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Restaurar carpeta
    UPDATE employee_folders
    SET 
        folder_status = 'active',
        deleted_at = NULL
    WHERE id = folder_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Estadísticas de sincronización
CREATE OR REPLACE VIEW sync_statistics AS
SELECT 
    'Total Activas'::TEXT as metric,
    COUNT(*) FILTER (WHERE folder_status = 'active')::BIGINT as value
FROM employee_folders
UNION ALL
SELECT 
    'Total Eliminadas'::TEXT as metric,
    COUNT(*) FILTER (WHERE folder_status = 'deleted')::BIGINT as value
FROM employee_folders
UNION ALL
SELECT 
    'Con Errores'::TEXT as metric,
    COUNT(*) FILTER (WHERE folder_status = 'sync_error')::BIGINT as value
FROM employee_folders
UNION ALL
SELECT 
    'Sin Drive ID'::TEXT as metric,
    COUNT(*) FILTER (WHERE drive_folder_id IS NULL OR drive_folder_id = '')::BIGINT as value
FROM employee_folders
WHERE folder_status = 'active';

-- Auditoría de cambios (opcional - requiere tabla de auditoría)
/*
CREATE TABLE IF NOT EXISTS employee_folders_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE, SOFT_DELETE
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES employee_folders(id)
);

-- Trigger para auditoría
CREATE OR REPLACE FUNCTION audit_employee_folders()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO employee_folders_audit (folder_id, action, old_data, changed_by)
        VALUES (OLD.id, 'DELETE', row_to_json(OLD), current_user);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO employee_folders_audit (folder_id, action, old_data, new_data, changed_by)
        VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO employee_folders_audit (folder_id, action, new_data, changed_by)
        VALUES (NEW.id, 'INSERT', row_to_json(NEW), current_user);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de auditoría
CREATE TRIGGER audit_employee_folders_trigger
    AFTER INSERT OR UPDATE OR DELETE ON employee_folders
    FOR EACH ROW
    EXECUTE FUNCTION audit_employee_folders();
*/

-- Confirmación de cambios
DO $$
BEGIN
    RAISE NOTICE '✅ Estructura de employee_folders actualizada para soportar soft delete';
    RAISE NOTICE '📊 Campos agregados: folder_status, deleted_at';
    RAISE NOTICE '🔍 Índices creados para mejor rendimiento';
    RAISE NOTICE '📋 Vistas creadas: active_employee_folders, deleted_employee_folders, sync_statistics';
    RAISE NOTICE '🔧 Funciones de utilidad: soft_delete_employee_folder(), restore_employee_folder()';
END $$;