-- Actualizar metadatos del usuario para corregir el nombre
-- Ejecutar este script en el SQL Editor del panel de Supabase

-- Opción 1: Si conoces el email del usuario
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'),
  '{name}',
  '"Juan Pablo Riesco"'
)
WHERE email = 'tu-email@example.com';  -- Reemplaza con el email real del usuario

-- Opción 2: Si conoces el ID del usuario
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'),
  '{name}',
  '"Juan Pablo Riesco"'
)
WHERE id = 'uuid-del-usuario';  -- Reemplaza con el ID real del usuario

-- Opción 3: Actualizar todos los usuarios que tengan "Camilo" en sus metadatos
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'),
  '{name}',
  '"Juan Pablo Riesco"'
)
WHERE user_metadata->>'name' ILIKE '%camilo%';

-- Verificación: Mostrar usuarios actualizados
SELECT 
  id,
  email,
  user_metadata->>'name' as display_name,
  user_metadata
FROM auth.users 
WHERE user_metadata->>'name' IS NOT NULL
ORDER BY email;