-- ========================================
-- ACTUALIZAR TELÉFONOS DE EMPLEADOS
-- Script para agregar números de teléfono móviles a los 800 empleados
-- ========================================

-- Primero, verificar cuántos empleados no tienen teléfono
SELECT 
    'Empleados sin teléfono' as descripcion,
    COUNT(*) as cantidad
FROM employees 
WHERE phone IS NULL OR phone = '' OR phone = 'No especificado';

-- Actualizar empleados sin teléfono con números móviles chilenos generados
UPDATE employees 
SET phone = (
    CASE 
        WHEN phone IS NULL OR phone = '' OR phone = 'No especificado' THEN
            '+56 9 ' || 
            LPAD(FLOOR(RANDOM() * 10)::TEXT, 1, '0') || 
            LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 8, '0')
        ELSE phone
    END
)
WHERE phone IS NULL OR phone = '' OR phone = 'No especificado';

-- Verificar resultado
SELECT 
    'Empleados actualizados con teléfono' as descripcion,
    COUNT(*) as cantidad
FROM employees 
WHERE phone IS NOT NULL AND phone != '' AND phone != 'No especificado';

-- Mostrar ejemplos de teléfonos agregados
SELECT 
    'Ejemplos de teléfonos agregados' as descripcion,
    name,
    email,
    phone
FROM employees 
WHERE phone LIKE '+56 9%'
LIMIT 10;

-- Confirmación final
SELECT 
    '✅ Teléfonos agregados exitosamente' as status,
    COUNT(*) as total_empleados_con_telefono
FROM employees 
WHERE phone IS NOT NULL AND phone != '' AND phone != 'No especificado';