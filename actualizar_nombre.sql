-- PASO 1: Crear función para buscar usuarios
CREATE OR REPLACE FUNCTION get_users_by_name_pattern(pattern TEXT)
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

-- PASO 2: Buscar usuarios con "Camilo"
SELECT * FROM get_users_by_name_pattern('%camilo%');

-- PASO 3: Crear función para actualizar nombre
CREATE OR REPLACE FUNCTION update_user_display_name(user_id UUID, new_name TEXT)
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

-- PASO 4: Actualizar el nombre (reemplaza ID_AQUI con el ID encontrado en el paso 2)
-- Descomenta la siguiente línea y reemplaza ID_AQUI:
-- SELECT update_user_display_name('ID_AQUI', 'Juan Pablo Riesco');

-- PASO 5: Verificar el cambio
SELECT * FROM get_users_by_name_pattern('%juan%');