-- Actualizar el campo name para que sea consistente con full_name
-- Esto asegura que ambos campos tengan el mismo valor correcto

UPDATE users 
SET name = full_name 
WHERE email = 'camiloalegriabarra@gmail.com' 
AND full_name = 'Camilo Alegria Barra';

-- Verificación
SELECT 
    id,
    email,
    name,
    full_name,
    updated_at
FROM users 
WHERE email = 'camiloalegriabarra@gmail.com';