-- Actualizar contraseña del usuario camiloalegriabarra@gmail.com
-- La contraseña se hasheará usando bcrypt (el sistema lo hará automáticamente)

-- Actualizar la contraseña del usuario específico
UPDATE users 
SET password = 'Antonito26'
WHERE email = 'camiloalegriabarra@gmail.com';

-- Verificar que el usuario existe y mostrar información
SELECT id, email, name, role, created_at, updated_at 
FROM users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- Confirmar la actualización
SELECT 'Password updated successfully for camiloalegriabarra@gmail.com' as status;