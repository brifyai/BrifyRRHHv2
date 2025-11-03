-- PASO 1: Encontrar al usuario con "Camilo" en sus metadatos
SELECT id, email, user_metadata->>'name' as display_name, user_metadata 
FROM auth.users 
WHERE user_metadata->>'name' ILIKE '%camilo%';

-- PASO 2: Actualizar el nombre del usuario (reemplaza 'ID_DEL_USUARIO' con el ID real)
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'),
  '{name}',
  '"Juan Pablo Riesco"'
)
WHERE id = 'ID_DEL_USUARIO';

-- Alternativa: Actualizar por email (reemplaza 'email@ejemplo.com' con el email real)
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'),
  '{name}',
  '"Juan Pablo Riesco"'
)
WHERE email = 'email@ejemplo.com';

-- PASO 3: Verificar el cambio
SELECT id, email, user_metadata->>'name' as display_name 
FROM auth.users 
WHERE user_metadata->>'name' ILIKE '%juan%';

-- Opción masiva: Actualizar todos los usuarios que tengan "Camilo" en el nombre
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'),
  '{name}',
  '"Juan Pablo Riesco"'
)
WHERE user_metadata->>'name' ILIKE '%camilo%';