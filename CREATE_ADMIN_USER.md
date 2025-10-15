# Guía para Crear Usuario Administrador en Supabase

## 📋 Problema Resuelto

El error `foreign key constraint "users_id_fkey"` ocurre porque la tabla `users` tiene una relación con `auth.users` de Supabase Auth. No podemos insertar directamente en `users` sin que el usuario exista primero en `auth.users`.

## 🔧 Solución

### Paso 1: Crear Usuario en Supabase Auth

1. Ve a tu proyecto Supabase: https://tmqglnycivlcjijoymwe.supabase.co
2. En el menú lateral, ve a **Authentication** → **Users**
3. Haz clic en **Add user**
4. Ingresa los siguientes datos:
   - **Email**: `camiloalegriabarra@gmail.com`
   - **Password**: `Antonito26`
5. Desmarca **"Send invite email"** (para que no requiera confirmación)
6. Haz clic en **Save**

### Paso 2: Verificar Usuario en auth.users

1. En **SQL Editor**, ejecuta esta consulta para verificar:
```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'camiloalegriabarra@gmail.com';
```

### Paso 3: Ejecutar Script de Datos

Ahora ejecuta el script `database/generate-sample-data.sql` nuevamente. La función `create_admin_user()` encontrará el usuario en `auth.users` y creará el registro correspondiente en la tabla `users`.

### Paso 4: Verificar Usuario Administrador

1. En **SQL Editor**, ejecuta:
```sql
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.is_active,
  c.name as company_name,
  p.name as current_plan
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN payments pay ON pay.user_id = u.id AND pay.status = 'paid'
LEFT JOIN plans p ON p.id = pay.plan_id
WHERE u.email = 'camiloalegriabarra@gmail.com';
```

## 🎯 Resultado Esperado

Deberías ver:
- Usuario `camiloalegriabarra@gmail.com` con rol de administrador
- Asignado al "Plan Profesional"
- Listo para usar en la aplicación

## 🔐 Iniciar Sesión

Una vez creado el usuario, puedes iniciar sesión en la aplicación:
- **URL**: http://localhost:3000
- **Email**: `camiloalegriabarra@gmail.com`
- **Password**: `Antonito26`

## 📝 Notas Importantes

1. **Primero Auth**: Siempre crea usuarios en `auth.users` primero
2. **Relación**: La tabla `users` extiende la información de `auth.users`
3. **Seguridad**: Usa contraseñas seguras para el administrador
4. **Email**: El email debe coincidir exactamente en ambas tablas
5. **Credenciales**: Email: camiloalegriabarra@gmail.com | Password: Antonito26

## 🚀 Siguiente Paso

Una vez que el usuario administrador esté funcionando, puedes:
1. Probar el inicio de sesión
2. Configurar Google Drive API
3. Desplegar en Netlify

## 🆘 Si tienes problemas

Si el usuario no se crea correctamente:
1. Verifica que el email sea exactamente `camiloalegriabarra@gmail.com`
2. Asegúrate de que el usuario exista en `auth.users`
3. Revisa los logs de Supabase para errores detallados
4. Ejecuta las consultas de verificación mencionadas arriba