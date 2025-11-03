-- Resetear contraseña del usuario camiloalegriabarra@gmail.com
-- Establecer contraseña como 'Camilo123!'

UPDATE auth.users
SET encrypted_password = crypt('Camilo123!', gen_salt('bf'))
WHERE email = 'camiloalegriabarra@gmail.com';

-- Verificar que se actualizó
SELECT
  id,
  email,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'camiloalegriabarra@gmail.com';