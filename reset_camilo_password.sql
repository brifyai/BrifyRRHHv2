-- ============================================
-- Script para Resetear Contraseña del Usuario
-- Email: camiloalegriabarra@gmail.com
-- ============================================

-- OPCIÓN 1: Resetear contraseña a "Camilo2024!"
-- Ejecuta este SQL en Supabase SQL Editor:

UPDATE auth.users
SET 
  encrypted_password = crypt('Camilo2024!', gen_salt('bf')),
  updated_at = NOW(),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'camiloalegriabarra@gmail.com';

-- Verificar que se actualizó
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  updated_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'camiloalegriabarra@gmail.com';

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Debería mostrar 1 fila con:
-- - email_confirmed_at con fecha (usuario confirmado)
-- - updated_at con fecha actual (password actualizado)
--
-- CREDENCIALES ACTUALIZADAS:
-- Email: camiloalegriabarra@gmail.com
-- Contraseña: Camilo2024!
-- ============================================