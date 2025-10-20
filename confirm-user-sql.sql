-- Confirmar email del ÚLTIMO usuario creado para camiloalegriabarra@gmail.com
-- ID: 6084126c-8366-4d9d-9e95-beaa113ea9f2

UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  email_change_confirm_status = 1
WHERE id = '6084126c-8366-4d9d-9e95-beaa113ea9f2';

-- Verificar confirmación
SELECT
  id,
  email,
  email_confirmed_at
FROM auth.users
WHERE id = '6084126c-8366-4d9d-9e95-beaa113ea9f2';