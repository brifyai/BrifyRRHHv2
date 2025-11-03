# SOLUCIÓN ALTERNATIVA - ACCEDIENDO DIRECTAMENTE A SUPABASE AUTH

## PROBLEMA
No podemos acceder directamente a `auth.users` desde el SQL Editor con los permisos actuales.

## SOLUCIONES (Ejecutar en orden)

### OPCIÓN 1: Desde el panel de Supabase (Recomendada)

1. **Ve al panel de Supabase**: https://tmqglnycivlcjijoymwe.supabase.co
2. **Ingresa con tu cuenta de administrador**
3. **Ve a Authentication → Users**
4. **Busca el usuario** que tenga "Camilo" en el nombre (revisa la columna "Display Name")
5. **Haz clic en el usuario**
6. **Edita los metadatos manualmente**:
   - Busca el campo `name` en User Metadata
   - Cambia "Camilo Alegria" por "Juan Pablo Riesco"
   - Haz clic en "Save"

### OPCIÓN 2: Usando el SQL con funciones RPC

1. **Copia y ejecuta este SQL** en el SQL Editor:

```sql
-- Crear función para buscar usuarios
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
```

2. **Busca el usuario**:
```sql
SELECT * FROM get_users_by_name_pattern('%camilo%');
```

3. **Crea función para actualizar**:
```sql
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
```

4. **Actualiza el nombre** (reemplaza ID_REAL con el ID encontrado):
```sql
SELECT update_user_display_name('ID_REAL', 'Juan Pablo Riesco');
```

### OPCIÓN 3: Limpiar caché del navegador (Si el nombre está cacheado)

1. **Abre `http://localhost:3003/panel-principal`**
2. **Presiona F12** → Application → Local Storage
3. **Elimina todos los datos** de localhost:3003
4. **También elimina Session Storage**
5. **Recarga con Ctrl+F5**

### OPCIÓN 4: Forzar recreación de perfil

1. **Cierra sesión en la aplicación**
2. **Ejecuta este SQL** para crear estructura correcta:
```sql
-- Crear tabla users con estructura correcta si no existe
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  full_name VARCHAR(255),
  current_plan_id UUID,
  plan_expiration TIMESTAMP WITH TIME ZONE,
  used_storage_bytes BIGINT DEFAULT 0,
  registered_via VARCHAR(50) DEFAULT 'web',
  admin BOOLEAN DEFAULT false,
  onboarding_status VARCHAR(50) DEFAULT 'pending',
  registro_previo BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear políticas RLS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (id = auth.uid());
```

3. **Vuelve a iniciar sesión** - esto creará un perfil nuevo

## VERIFICACIÓN

Después de cualquiera de las opciones:
1. **Recarga la página** `http://localhost:3003/panel-principal`
2. **Debería mostrar**: "Buenos días, Juan Pablo Riesco"
3. **Si no funciona**, limpia el caché nuevamente

## NOTA FINAL

La OPCIÓN 1 (editar directamente desde el panel de Supabase) es la más sencilla y segura.