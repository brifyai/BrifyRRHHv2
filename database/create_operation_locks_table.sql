-- Tabla para sistema de locks distribuidos
-- Previene race conditions en la creación de carpetas de Google Drive

CREATE TABLE IF NOT EXISTS operation_locks (
    id SERIAL PRIMARY KEY,
    lock_key VARCHAR(255) NOT NULL UNIQUE,
    lock_id VARCHAR(255) NOT NULL,
    operation_type VARCHAR(100) NOT NULL,
    employee_email VARCHAR(255),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    released_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_operation_locks_key ON operation_locks(lock_key);
CREATE INDEX IF NOT EXISTS idx_operation_locks_active ON operation_locks(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_operation_locks_employee ON operation_locks(employee_email);
CREATE INDEX IF NOT EXISTS idx_operation_locks_operation ON operation_locks(operation_type);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_operation_locks_updated_at
    BEFORE UPDATE ON operation_locks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar locks expirados automáticamente
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    UPDATE operation_locks 
    SET 
        is_active = false,
        released_at = NOW()
    WHERE 
        is_active = true 
        AND expires_at < NOW();
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE operation_locks IS 'Tabla para locks distribuidos que previenen race conditions';
COMMENT ON COLUMN operation_locks.lock_key IS 'Clave única del lock (ej: folder_creation_lock_email@empresa.com)';
COMMENT ON COLUMN operation_locks.lock_id IS 'ID único del lock para tracking';
COMMENT ON COLUMN operation_locks.operation_type IS 'Tipo de operación (create_folder, sync_files, etc)';
COMMENT ON COLUMN operation_locks.employee_email IS 'Email del empleado asociado (opcional)';
COMMENT ON COLUMN operation_locks.acquired_at IS 'Timestamp cuando se adquirió el lock';
COMMENT ON COLUMN operation_locks.expires_at IS 'Timestamp cuando expira el lock';
COMMENT ON COLUMN operation_locks.released_at IS 'Timestamp cuando se liberó el lock';
COMMENT ON COLUMN operation_locks.is_active IS 'Indica si el lock está activo';

-- Insertar datos de ejemplo para testing (opcional)
-- INSERT INTO operation_locks (lock_key, lock_id, operation_type, employee_email, expires_at) 
-- VALUES ('folder_creation_lock_test@example.com', 'test_lock_123', 'create_folder', 'test@example.com', NOW() + INTERVAL '5 minutes')
-- ON CONFLICT (lock_key) DO NOTHING;