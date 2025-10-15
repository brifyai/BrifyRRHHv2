-- Script para limpiar y configurar la base de datos desde cero
-- USAR CON PRECAUCIÓN - Esto eliminará todos los datos existentes

-- ============================================
-- LIMPIAR ESTRUCTURA EXISTENTE
-- ============================================

-- Eliminar vistas primero
DROP VIEW IF EXISTS user_details CASCADE;
DROP VIEW IF EXISTS employee_details CASCADE;

-- Eliminar triggers
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_carpeta_administrador_updated_at ON carpeta_administrador;
DROP TRIGGER IF EXISTS update_sub_carpetas_administrador_updated_at ON sub_carpetas_administrador;
DROP TRIGGER IF EXISTS update_carpetas_usuario_updated_at ON carpetas_usuario;
DROP TRIGGER IF EXISTS update_documentos_entrenador_updated_at ON documentos_entrenador;
DROP TRIGGER IF EXISTS update_documentos_usuario_entrenador_updated_at ON documentos_usuario_entrenador;
DROP TRIGGER IF EXISTS update_user_credentials_updated_at ON user_credentials;
DROP TRIGGER IF EXISTS update_user_tokens_usage_updated_at ON user_tokens_usage;
DROP TRIGGER IF EXISTS update_drive_watch_channels_updated_at ON drive_watch_channels;

-- Eliminar función
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_user_stats(user_uuid UUID) CASCADE;

-- Eliminar tablas en orden correcto (debido a foreign keys)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS drive_notifications CASCADE;
DROP TABLE IF EXISTS drive_watch_channels CASCADE;
DROP TABLE IF EXISTS user_tokens_usage CASCADE;
DROP TABLE IF EXISTS user_credentials CASCADE;
DROP TABLE IF EXISTS documentos_usuario_entrenador CASCADE;
DROP TABLE IF EXISTS documentos_entrenador CASCADE;
DROP TABLE IF EXISTS carpetas_usuario CASCADE;
DROP TABLE IF EXISTS sub_carpetas_administrador CASCADE;
DROP TABLE IF EXISTS carpeta_administrador CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- ============================================
-- MOSTRAR MENSAJE DE ÉXITO
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos limpiada exitosamente';
    RAISE NOTICE '📋 Ahora ejecuta database/new-supabase-setup.sql para crear la nueva estructura';
END $$;