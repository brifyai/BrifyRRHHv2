-- Script para actualizar el nombre del usuario administrador
-- Este script actualiza el nombre de "Camilo Alegria Barra" a "Juan Pablo Riesco"

-- Actualizar el nombre del usuario en la tabla users
UPDATE users 
SET 
    full_name = 'Juan Pablo Riesco',
    email = 'juanpablo.riesco@example.com'
WHERE email = 'camiloalegriabarra@gmail.com';

-- Si necesitas actualizar también en auth.users (esto requiere acceso administrativo)
-- Nota: Esta parte solo funciona si tienes permisos de administrador en Supabase
-- UPDATE auth.users 
-- SET 
--     email = 'juanpablo.riesco@example.com',
--     user_metadata = jsonb_set(
--         jsonb_set(user_metadata, '{name}', 'Juan Pablo Riesco'),
--         '{full_name}', 'Juan Pablo Riesco'
--     )
-- WHERE email = 'camiloalegriabarra@gmail.com';

-- Verificar la actualización
SELECT 
    id,
    email,
    full_name,
    is_active,
    created_at,
    updated_at
FROM users 
WHERE email = 'juanpablo.riesco@example.com';

-- Si el usuario antiguo ya no existe, mostrar mensaje
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'juanpablo.riesco@example.com') THEN
        RAISE NOTICE 'Usuario juanpablo.riesco@example.com no encontrado. Es posible que necesites crear el usuario primero.';
        RAISE NOTICE 'Ejecuta el script generate-sample-data.sql para crear el usuario administrador.';
    END IF;
END $$;

COMMIT;