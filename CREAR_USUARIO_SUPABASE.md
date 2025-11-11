# 👤 Crear Usuario en Supabase - Instrucciones

## 📋 Crear usuario camiloalegriabarra@gmail.com

### Opción 1: Crear desde Supabase Dashboard (RECOMENDADO)

1. **Accede al Dashboard de Supabase:**
   - Ve a: https://supabase.com/dashboard/project/tmqglnycivlcjijoymwe/auth/users

2. **Haz clic en "Add user"** (botón verde arriba a la derecha)

3. **Completa el formulario:**
   ```
   Email: camiloalegriabarra@gmail.com
   Password: Camilo2024!
   ```

4. **IMPORTANTE: Marca la casilla "Auto Confirm User"**
   - Esto evita que el usuario tenga que confirmar su email

5. **Haz clic en "Create user"**

6. **¡Listo!** El usuario está creado y listo para usar

---

### Opción 2: Registrarse desde la Aplicación

1. Ve a: http://localhost:3000
2. Busca un botón de "Registrarse" o "Crear cuenta"
3. Completa el formulario con:
   ```
   Email: camiloalegriabarra@gmail.com
   Contraseña: Camilo2024!
   Nombre: Camilo Alegría
   ```
4. Si requiere confirmación de email, revisa la bandeja de entrada

---

### Opción 3: Ejecutar SQL en Supabase

Si prefieres SQL, ejecuta esto en el SQL Editor de Supabase:

```sql
-- Crear usuario en auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'camiloalegriabarra@gmail.com',
  crypt('Camilo2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Camilo Alegría"}',
  false,
  ''
);

-- Crear perfil asociado
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
  id,
  'camiloalegriabarra@gmail.com',
  'Camilo Alegría',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'camiloalegriabarra@gmail.com';
```

---

## ✅ Verificar que el Usuario Existe

Ejecuta en SQL Editor:

```sql
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'camiloalegriabarra@gmail.com';
```

Debería retornar 1 fila con los datos del usuario.

---

## 🔐 Iniciar Sesión

Una vez creado el usuario:

1. **Ve a:** http://localhost:3000
2. **Haz clic en:** "Iniciar Sesión"
3. **Ingresa:**
   - Email: `camiloalegriabarra@gmail.com`
   - Contraseña: `Camilo2024!`
4. **Haz clic en** "Iniciar Sesión"

---

## 🔄 Después de Iniciar Sesión

1. **Ve a:** `/configuracion/integraciones`
2. **Busca la sección** "Google Drive"
3. **Haz clic en** "Configurar Google Drive"
4. **Serás redirigido a Google OAuth**
5. **Autoriza la aplicación**
6. **Deberías ver:** "✅ Conectado"

---

## ⚠️ Solución de Problemas

### "Email not confirmed"
- Ve a Supabase Dashboard → Authentication → Users
- Encuentra el usuario
- Haz clic en los 3 puntos → "Confirm email"

### "Invalid login credentials"
- Verifica que la contraseña sea exactamente: `Camilo2024!`
- O resetea la contraseña en Supabase Dashboard

### "User not found"
- Verifica que el usuario fue creado correctamente
- Ejecuta la consulta SQL de verificación arriba

---

## 📞 Soporte

Si necesitas ayuda, contacta al equipo de desarrollo.