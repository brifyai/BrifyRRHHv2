# Solución para el problema del nombre incorrecto en el panel principal

## Problema identificado

En el panel principal (`http://localhost:3003/panel-principal`) aparece el nombre "Camilo Alegria" cuando debería aparecer "Juan Pablo Riesco".

## Causa raíz

1. La tabla `users` en la base de datos Supabase no tiene la estructura correcta
2. Falta la columna `name` que el código espera encontrar
3. La tabla está vacía (no hay registros de usuarios)
4. Hay inconsistencia entre el esquema de la base de datos y el código

## Solución temporal (aplicada)

Se han modificado los archivos para usar `full_name` como fallback:

1. **AuthContext.js**: Modificado para usar `user?.user_metadata?.full_name` como alternativa
2. **ModernDashboardRedesigned.js**: Modificado para mostrar `userProfile?.full_name` si `name` no está disponible

## Solución permanente

### Paso 1: Ejecutar script SQL en Supabase

Ejecuta el siguiente script en el SQL Editor del panel de Supabase:

```sql
-- Contenido del archivo fix_users_structure.sql
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
END $$;

-- Actualizar políticas de RLS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (id = auth.uid());
```

### Paso 2: Actualizar el nombre del usuario

Después de ejecutar el script SQL, el usuario debe:

1. Cerrar sesión en la aplicación web
2. Volver a iniciar sesión
3. Esto creará automáticamente un registro en la tabla `users` con el nombre correcto

O alternativamente, puedes actualizar manualmente el nombre ejecutando:

```sql
-- Actualizar el nombre del usuario actual (reemplaza 'user_email@example.com' con el email real)
UPDATE users 
SET name = 'Juan Pablo Riesco', full_name = 'Juan Pablo Riesco' 
WHERE email = 'user_email@example.com';
```

### Paso 3: Verificación

Para verificar que todo funciona correctamente:

1. Inicia sesión en la aplicación
2. Navega a `http://localhost:3003/panel-principal`
3. Debería aparecer "Buenos días, Juan Pablo Riesco" en lugar de "Buenos días, Camilo Alegria"

## Archivos modificados

- `src/contexts/AuthContext.js`: Línea 51 - Agregado fallback a `full_name`
- `src/components/dashboard/ModernDashboardRedesigned.js`: Línea 299 - Agregado fallback a `full_name`

## Scripts de utilidad creados

- `fix_users_structure.sql`: Script SQL para corregir la estructura de la tabla
- `check_users.mjs`: Script para verificar usuarios en la base de datos
- `update_user_name.mjs`: Script para actualizar nombres de usuarios

## Notas importantes

1. La solución temporal permite que la aplicación funcione mientras se ejecuta el SQL
2. Es importante ejecutar el script SQL para una solución permanente
3. Después de ejecutar el SQL, los usuarios deben cerrar y volver a iniciar sesión para que se cree su perfil
4. Los cambios en las políticas RLS aseguran que los usuarios solo puedan ver y modificar su propio perfil