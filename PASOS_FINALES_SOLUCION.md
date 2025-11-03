# PASOS FINALES PARA SOLUCIONAR EL PROBLEMA DEL NOMBRE

## SITUACIÓN ACTUAL
- ✅ La tabla `users` está vacía (0 registros)
- ✅ El nombre "Camilo Alegria" NO está en la base de datos
- ❌ No hay sesión activa desde Node.js (no puedo identificar al usuario automáticamente)

## SOLUCIÓN DEFINITIVA (Ejecutar en orden)

### PASO 1: Encontrar al usuario en Supabase Auth

1. Ve al panel de Supabase: https://tmqglnycivlcjijoymwe.supabase.co
2. Ingresa con tus credenciales de administrador
3. Ve a **Authentication** → **Users**
4. Ejecuta este SQL en el SQL Editor:

```sql
SELECT id, email, user_metadata->>'name' as display_name, user_metadata 
FROM auth.users 
WHERE user_metadata->>'name' ILIKE '%camilo%';
```

5. Anota el **ID** y **email** del usuario encontrado

### PASO 2: Actualizar los metadatos del usuario

Usa el ID que encontraste en el paso anterior y ejecuta:

```sql
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'),
  '{name}',
  '"Juan Pablo Riesco"'
)
WHERE id = 'AQUI_EL_ID_DEL_USUARIO';
```

O si prefieres usar el email:

```sql
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'),
  '{name}',
  '"Juan Pablo Riesco"'
)
WHERE email = 'aqui-el-email@ejemplo.com';
```

### PASO 3: Verificar la actualización

Ejecuta este SQL para confirmar el cambio:

```sql
SELECT id, email, user_metadata->>'name' as display_name 
FROM auth.users 
WHERE user_metadata->>'name' ILIKE '%juan%';
```

### PASO 4: Limpiar caché del navegador

1. Abre `http://localhost:3003/panel-principal`
2. Presiona **F12** para abrir herramientas de desarrollador
3. Ve a **Application** → **Local Storage** → Eliminar todo
4. Ve a **Session Storage** → Eliminar todo
5. Recarga la página con **Ctrl+F5** (o **Cmd+Shift+R**)

### PASO 5: Si el problema persiste

1. Cierra sesión en la aplicación
2. Vuelve a iniciar sesión
3. Esto forzará la recarga de los metadatos actualizados

## ALTERNATIVA: Editar directamente desde el panel de Supabase

1. En **Authentication** → **Users**
2. Haz clic en el usuario que muestra "Camilo Alegria"
3. En la sección **User Metadata**, edita el campo `name`
4. Cambia "Camilo Alegria" por "Juan Pablo Riesco"
5. Haz clic en **Save**

## VERIFICACIÓN FINAL

Después de completar estos pasos:
1. Ve a `http://localhost:3003/panel-principal`
2. Deberías ver: "Buenos días, Juan Pablo Riesco"
3. Si aún ves "Camilo Alegria", repite el PASO 4 (limpiar caché)

## ARCHIVOS CREADOS PARA REFERENCIA

- `update_user_metadata.sql`: SQL para actualizar metadatos
- `find_current_user.mjs`: Script para identificar usuario (requiere sesión activa)
- `fix_users_structure.sql`: SQL para corregir estructura de tabla users

## NOTA IMPORTANTE

El problema estaba en los metadatos del usuario en Supabase Auth, no en la tabla `users` del esquema público. Por eso la tabla `users` aparecía vacía pero el nombre seguía mostrándose.