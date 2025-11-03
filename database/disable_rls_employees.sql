-- Deshabilitar RLS para la tabla employees
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Opcional: Crear políticas públicas si se quiere mantener RLS activo
-- DROP POLICY IF EXISTS "Enable read access for all users" ON employees;
-- CREATE POLICY "Enable read access for all users" ON employees
--   FOR SELECT USING (true);

-- Verificar que la tabla existe y tiene datos
SELECT COUNT(*) as employee_count FROM employees;

-- Mostrar estructura de la tabla
\d employees;