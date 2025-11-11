-- ========================================
-- AGREGAR COLUMNA PHONE A LA TABLA EMPLOYEES
-- Script para agregar la columna phone a la tabla employees
-- ========================================

-- Agregar columna phone a la tabla employees
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employees' AND column_name = 'phone';

-- Confirmación
SELECT '✅ Columna phone agregada a la tabla employees' as status;