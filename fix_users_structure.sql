-- Script para corregir la estructura de la tabla users
-- Ejecutar este script en el SQL Editor del panel de Supabase

-- Primero, verificar si la tabla users existe y tiene la estructura correcta
-- Agregar las columnas que faltan según el código de la aplicación

DO $$
BEGIN
    -- Agregar columna 'name' si no existe (usada por el dashboard)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'name'
    ) THEN
        ALTER TABLE users ADD COLUMN name VARCHAR(255);
        RAISE NOTICE 'Columna name agregada a la tabla users';
    END IF;
    
    -- Agregar columna 'current_plan_id' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'current_plan_id'
    ) THEN
        ALTER TABLE users ADD COLUMN current_plan_id UUID;
        RAISE NOTICE 'Columna current_plan_id agregada a la tabla users';
    END IF;
    
    -- Agregar columna 'plan_expiration' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'plan_expiration'
    ) THEN
        ALTER TABLE users ADD COLUMN plan_expiration TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Columna plan_expiration agregada a la tabla users';
    END IF;
    
    -- Agregar columna 'used_storage_bytes' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'used_storage_bytes'
    ) THEN
        ALTER TABLE users ADD COLUMN used_storage_bytes BIGINT DEFAULT 0;
        RAISE NOTICE 'Columna used_storage_bytes agregada a la tabla users';
    END IF;
    
    -- Agregar columna 'registered_via' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'registered_via'
    ) THEN
        ALTER TABLE users ADD COLUMN registered_via VARCHAR(50) DEFAULT 'web';
        RAISE NOTICE 'Columna registered_via agregada a la tabla users';
    END IF;
    
    -- Agregar columna 'admin' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'admin'
    ) THEN
        ALTER TABLE users ADD COLUMN admin BOOLEAN DEFAULT false;
        RAISE NOTICE 'Columna admin agregada a la tabla users';
    END IF;
    
    -- Agregar columna 'onboarding_status' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'onboarding_status'
    ) THEN
        ALTER TABLE users ADD COLUMN onboarding_status VARCHAR(50) DEFAULT 'pending';
        RAISE NOTICE 'Columna onboarding_status agregada a la tabla users';
    END IF;
    
    -- Agregar columna 'registro_previo' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'registro_previo'
    ) THEN
        ALTER TABLE users ADD COLUMN registro_previo BOOLEAN DEFAULT false;
        RAISE NOTICE 'Columna registro_previo agregada a la tabla users';
    END IF;
    
    -- Si existe 'full_name' pero no 'name', copiar los datos
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'full_name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'name'
    ) THEN
        -- Esto no debería ejecutarse porque ya agregamos 'name' arriba
        RAISE NOTICE 'Ambas columnas existen';
    END IF;
END $$;

-- Actualizar políticas de RLS para incluir las nuevas columnas
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Crear políticas actualizadas
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (id = auth.uid());

-- Mostrar la estructura final de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;