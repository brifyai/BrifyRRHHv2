-- Script para verificar que los datos de empleados se han generado correctamente
-- Este script muestra un resumen de los empleados por empresa

-- Verificar el total de empleados por empresa
SELECT 
  c.name AS company,
  COUNT(e.id) AS employee_count,
  -- Mostrar algunos datos de ejemplo
  STRING_AGG(DISTINCT e.department, ', ' ORDER BY e.department) AS departments,
  STRING_AGG(DISTINCT e.region, ', ' ORDER BY e.region) AS regions
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Verificar la distribución por departamento
SELECT 
  e.department,
  COUNT(*) AS employee_count
FROM employees e
GROUP BY e.department
ORDER BY employee_count DESC;

-- Verificar la distribución por región
SELECT 
  e.region,
  COUNT(*) AS employee_count
FROM employees e
GROUP BY e.region
ORDER BY employee_count DESC;

-- Verificar la distribución por modalidad de trabajo
SELECT 
  e.work_mode,
  COUNT(*) AS employee_count
FROM employees e
GROUP BY e.work_mode
ORDER BY employee_count DESC;

-- Verificar la distribución por tipo de contrato
SELECT 
  e.contract_type,
  COUNT(*) AS employee_count
FROM employees e
GROUP BY e.contract_type
ORDER BY employee_count DESC;

-- Verificar la distribución por nivel jerárquico
SELECT 
  e.level,
  COUNT(*) AS employee_count
FROM employees e
GROUP BY e.level
ORDER BY employee_count DESC;

-- Mostrar algunos empleados de ejemplo
SELECT 
  c.name AS company,
  e.name,
  e.email,
  e.department,
  e.position,
  e.work_mode,
  e.contract_type
FROM employees e
JOIN companies c ON e.company_id = c.id
ORDER BY c.name, e.name
LIMIT 20;

-- Verificar que no hay empleados duplicados por email
SELECT 
  e.email,
  COUNT(*) as duplicate_count
FROM employees e
GROUP BY e.email
HAVING COUNT(*) > 1;

-- Verificar que todos los empleados tienen empresa asignada
SELECT 
  COUNT(*) AS employees_without_company
FROM employees e
WHERE e.company_id IS NULL;

-- Verificar la fecha de creación de los registros
SELECT 
  DATE(e.created_at) AS creation_date,
  COUNT(*) AS employees_created
FROM employees e
GROUP BY DATE(e.created_at)
ORDER BY creation_date DESC;