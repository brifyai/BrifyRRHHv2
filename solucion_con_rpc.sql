-- SOLUCIÓN USANDO FUNCIONES RPC DE SUPABASE
-- Ejecutar en orden en el SQL Editor de Supabase

-- PASO 1: Crear función para acceder a auth.users (solo administradores)
CREATE OR REPLACE FUNCTION get_user_with_name_pattern(pattern TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'name' as display_name
  FROM auth.users au
  WHERE au.raw_user_meta_data->>'name' ILIKE pattern;
END;
$$;

-- PASO 2: Buscar usuarios con "Camilo" en el nombre
SELECT * FROM get_user_with_name_pattern('%camilo%');

-- PASO 3: Crear función para actualizar metadatos del usuario
CREATE OR REPLACE FUNCTION update_user_name(user_id UUID, new_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'),
    '{name}',
    to_jsonb(new_name)
  )
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$;

-- PASO 4: Actualizar el nombre (reemplaza 'ID_DEL_USUARIO' con el ID real)
-- Primero ejecuta el PASO 2 para obtener el ID, luego usa ese ID aquí:
-- SELECT update_user_name('ID_DEL_USUARIO', 'Juan Pablo Riesco');

-- PASO 5: Verificar el cambio
SELECT * FROM get_user_with_name_pattern('%juan%');

-- PASO 6: Limpiar funciones (opcional, después de verificar que todo funciona)
-- DROP FUNCTION IF EXISTS get_user_with_name_pattern(TEXT);
-- DROP FUNCTION IF EXISTS update_user_name(UUID, TEXT);