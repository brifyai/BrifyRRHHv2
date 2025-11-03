-- Script para crear el usuario camiloalegriabarra@gmail.com con contraseña "Antonito26"
-- Ejecutar este script directamente en la base de datos de Supabase

-- Primero, deshabilitar RLS temporalmente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verificar si el usuario ya existe
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM users WHERE email = 'camiloalegriabarra@gmail.com'
    ) INTO user_exists;
    
    IF user_exists THEN
        -- Actualizar usuario existente
        UPDATE users 
        SET 
            password = 'Antonito26',
            full_name = 'Camilo Alegria Barra',
            role = 'admin',
            updated_at = NOW()
        WHERE email = 'camiloalegriabarra@gmail.com';
        
        RAISE NOTICE 'Usuario actualizado exitosamente';
    ELSE
        -- Crear nuevo usuario
        INSERT INTO users (
            email, 
            password, 
            full_name, 
            role, 
            created_at, 
            updated_at
        ) VALUES (
            'camiloalegriabarra@gmail.com',
            'Antonito26',
            'Camilo Alegria Barra',
            'admin',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Usuario creado exitosamente';
    END IF;
END $$;

-- Verificar que el usuario fue creado/actualizado
SELECT 
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
FROM users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- Rehabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Crear política para que el usuario pueda acceder a sus propios datos
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Política para administradores
DROP POLICY IF EXISTS "Admin users can access all users" ON users;
CREATE POLICY "Admin users can access all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );

-- Mostrar mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Usuario camiloalegriabarra@gmail.com creado/actualizado';
    RAISE NOTICE 'Contraseña: Antonito26';
    RAISE NOTICE 'Rol: admin';
    RAISE NOTICE '===========================================';
END $$;