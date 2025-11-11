# 📋 Instrucciones para Crear la Tabla `user_google_drive_credentials` en Supabase

## ⚠️ IMPORTANTE
La tabla `user_google_drive_credentials` NO existe actualmente en tu base de datos de Supabase. Debes crearla manualmente siguiendo estos pasos:

---

## 🚀 Pasos para Crear la Tabla

### 1. Accede al Panel de Supabase

1. Ve a: **https://supabase.com/dashboard**
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: **BrifyRRHH** (tmqglnycivlcjijoymwe)

### 2. Abre el SQL Editor

1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en el botón **"+ New query"** (Nueva consulta)

### 3. Ejecuta el Script SQL

1. Abre el archivo: [`database/user_google_drive_credentials.sql`](database/user_google_drive_credentials.sql)
2. **Copia TODO el contenido** del archivo
3. **Pégalo** en el editor SQL de Supabase
4. Haz clic en el botón **"Run"** (Ejecutar) o presiona `Ctrl + Enter`

### 4. Verifica la Creación

Deberías ver un mensaje de éxito similar a:
```
Success. No rows returned
```

O verifica manualmente:
1. Ve a **"Table Editor"** en el menú lateral
2. Busca la tabla **`user_google_drive_credentials`**
3. Debería aparecer en la lista de tablas

---

## 📊 Estructura de la Tabla

La tabla contiene los siguientes campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único de la credencial |
| `user_id` | UUID | ID del usuario (FK a auth.users) |
| `google_user_id` | TEXT | ID del usuario de Google |
| `email` | TEXT | Email de la cuenta de Google |
| `access_token` | TEXT | Token de acceso OAuth 2.0 |
| `refresh_token` | TEXT | Token para renovar el acceso |
| `token_expires_at` | TIMESTAMPTZ | Fecha de expiración del token |
| `scope` | TEXT | Permisos concedidos |
| `default_folder_id` | TEXT | ID de carpeta raíz en Google Drive |
| `profile_picture` | TEXT | URL de foto de perfil de Google |
| `is_active` | BOOLEAN | Si la credencial está activa |
| `sync_status` | TEXT | Estado de sincronización |
| `last_sync_at` | TIMESTAMPTZ | Última sincronización |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última actualización |

---

## 🔒 Seguridad

La tabla incluye:
- ✅ **Row Level Security (RLS)** habilitado
- ✅ Políticas de acceso: cada usuario solo ve sus propias credenciales
- ✅ Índices para rendimiento optimizado
- ✅ Triggers para actualización automática de `updated_at`
- ✅ Funciones helper para verificar expiración de tokens

---

## ✅ Verificación Post-Creación

Después de ejecutar el SQL, verifica que la tabla existe ejecutando esta consulta en el SQL Editor:

```sql
SELECT COUNT(*) as total_credentials 
FROM user_google_drive_credentials;
```

Debería retornar `0` (cero registros) si la tabla está vacía, lo cual es correcto.

---

## 🔄 Siguiente Paso

Una vez creada la tabla, la aplicación podrá:
1. ✅ Guardar las credenciales de Google Drive cuando te autentiques
2. ✅ Mostrar el estado "Conectado" en `/configuracion/integraciones`
3. ✅ Mantener la conexión persistente entre sesiones
4. ✅ Refrescar automáticamente los tokens cuando expiren

---

## 🆘 Soporte

Si encuentras algún error al ejecutar el SQL:

1. **Error: "relation already exists"** 
   - La tabla ya existe, no necesitas hacer nada ✅

2. **Error: "permission denied"**
   - Asegúrate de usar una cuenta con permisos de administrador en Supabase

3. **Error de sintaxis**
   - Verifica que copiaste TODO el contenido del archivo SQL
   - Asegúrate de no haber modificado el script

---

## 📞 Contacto

Si necesitas ayuda adicional, contacta al equipo de desarrollo.