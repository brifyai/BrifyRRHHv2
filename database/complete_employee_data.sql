-- Script para generar datos de empleados realistas
-- Este script genera datos de empleados que coinciden con las empresas del sistema

-- Primero, limpiamos los datos existentes (opcional, solo para desarrollo)
-- TRUNCATE TABLE employees, employee_skills, employee_interests RESTART IDENTITY CASCADE;

-- Nombres y apellidos comunes en Chile
WITH first_names AS (
  SELECT unnest(ARRAY[
    'Camila', 'Patricio', 'Víctor', 'Graciela', 'Jorge', 'Ricardo', 'Felipe', 'Arturo', 
    'Valentina', 'Isabel', 'César', 'Oscar', 'Carolina', 'Rodrigo', 'Francisco', 
    'Miguel', 'Alejandro', 'Daniela', 'Romina', 'Silvana', 'Guillermo', 'Fernanda', 
    'Claudia', 'Teresa', 'Víctor', 'Cristian', 'Diego', 'Natalia', 'Luis', 'Karina',
    'Andrés', 'Marcela', 'Verónica', 'Roberto', 'Tamara', 'Danielle', 'Macarena',
    'Sebastián', 'Pablo', 'Eduardo', 'Fernando', 'Constanza', 'Paulina', 'Catalina',
    'Ignacio', 'Renata', 'Matías', 'Camilo', 'Andrea', 'Nicole', 'José', 'Manuel'
  ]) AS name
),
last_names AS (
  SELECT unnest(ARRAY[
    'Gutiérrez', 'Castro', 'Vargas', 'Reyes', 'Sepúlveda', 'Henríquez', 'Miranda',
    'López', 'Pizarro', 'Villarroel', 'Ramos', 'Morales', 'Álvarez', 'Cortés',
    'Rivera', 'Parra', 'Leiva', 'Silva', 'Fuentes', 'Zúñiga', 'Díaz', 'Muñoz',
    'Romero', 'Guzmán', 'Moraga', 'Contreras', 'Herrera', 'Roas', 'Aguilera',
    'Pérez', 'Sánchez', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez',
    'García', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno'
  ]) AS name
),
regions AS (
  SELECT unnest(ARRAY[
    'Región de Tarapacá', 'Región de Antofagasta', 'Región de Atacama', 
    'Región de Coquimbo', 'Región de Valparaíso', 
    'Región del Libertador General Bernardo O''Higgins', 'Región del Maule', 
    'Región de Ñuble', 'Región del Biobío', 'Región de La Araucanía', 
    'Región de Los Ríos', 'Región de Los Lagos', 
    'Región Aysén del General Carlos Ibáñez del Campo', 
    'Región de Magallanes y de la Antártica Chilena', 'Región Metropolitana'
  ]) AS name
),
departments AS (
  SELECT unnest(ARRAY[
    'Operaciones', 'TI', 'Seguridad', 'Producción', 'RRHH', 'Administración',
    'Planificación', 'Mantenimiento', 'Servicio al Cliente', 'Logística',
    'Investigación y Desarrollo', 'Contabilidad', 'Finanzas', 'Tesorería',
    'Marketing', 'Ventas', 'Auditoría', 'Legal', 'Calidad', 'Compras'
  ]) AS name
),
levels AS (
  SELECT unnest(ARRAY[
    'Asistente', 'Especialista', 'Supervisor', 'Coordinador', 
    'Jefatura', 'Gerente', 'Director', 'Operario'
  ]) AS name
),
positions AS (
  SELECT unnest(ARRAY[
    'Jefe de Operaciones', 'Desarrollador', 'Supervisor de Seguridad',
    'Jefe de Producción', 'Reclutador', 'Especialista en Seguridad',
    'Técnico de Soporte', 'Operario de Producción', 'Coordinador Administrativo',
    'Planificador', 'Administrativo', 'Gerente de Mantenimiento',
    'Ejecutivo de Servicio', 'Supervisor de Logística', 'Desarrollador de Producto',
    'Asistente Contable', 'Asistente de Calidad', 'Jefe Administrativo',
    'Jefe de Mantenimiento', 'Coordinador Administrativo', 'Gerente Contable',
    'Gerente Financiero', 'Asistente de Mantenimiento', 'Asistente Financiero',
    'Jefe de Calidad', 'Jefe de RRHH', 'Supervisor de Operaciones',
    'Analista de Tesorería', 'Supervisor de Producción', 'Especialista en Marketing',
    'Ejecutivo de Ventas', 'Jefe de Tesorería', 'Contador', 'Asistente de Auditoría',
    'Especialista en Cumplimiento', 'Asistente de Mantenimiento', 'Jefe de Logística',
    'Coordinador de Marketing', 'Gerente de Auditoría', 'Gerente Legal',
    'Gerente de Ventas', 'Asistente de Tesorería', 'Auditor Interno'
  ]) AS name
),
work_modes AS (
  SELECT unnest(ARRAY['Presencial', 'Híbrido', 'Remoto']) AS name
),
contract_types AS (
  SELECT unnest(ARRAY['Indefinido', 'Plazo Fijo', 'Honorarios']) AS name
)

-- Generar empleados para cada empresa
INSERT INTO employees (
  company_id, name, email, phone, region, department, level, 
  position, work_mode, contract_type, is_active, has_subordinates
)
SELECT 
  c.id AS company_id,
  -- Generar nombre completo
  (SELECT name FROM first_names ORDER BY random() LIMIT 1) || ' ' || 
  (SELECT name FROM last_names ORDER BY random() LIMIT 1) AS name,
  -- Generar email
  LOWER(
    (SELECT name FROM first_names ORDER BY random() LIMIT 1) || '.' || 
    (SELECT name FROM last_names ORDER BY random() LIMIT 1) || '@' || 
    LOWER(REPLACE(c.name, ' ', '')) || '.cl'
  ) AS email,
  -- Generar teléfono
  '+56 9 ' || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 8, '0') AS phone,
  -- Seleccionar región aleatoria
  (SELECT name FROM regions ORDER BY random() LIMIT 1) AS region,
  -- Seleccionar departamento aleatorio
  (SELECT name FROM departments ORDER BY random() LIMIT 1) AS department,
  -- Seleccionar nivel aleatorio
  (SELECT name FROM levels ORDER BY random() LIMIT 1) AS level,
  -- Seleccionar posición aleatoria
  (SELECT name FROM positions ORDER BY random() LIMIT 1) AS position,
  -- Seleccionar modalidad de trabajo aleatoria
  (SELECT name FROM work_modes ORDER BY random() LIMIT 1) AS work_mode,
  -- Seleccionar tipo de contrato aleatorio
  (SELECT name FROM contract_types ORDER BY random() LIMIT 1) AS contract_type,
  -- Activar todos los empleados
  true AS is_active,
  -- Algunos empleados tienen subordinados
  (RANDOM() > 0.7) AS has_subordinates
FROM companies c
-- Generar entre 50 y 200 empleados por empresa
CROSS JOIN generate_series(1, FLOOR(RANDOM() * 150 + 50)::INTEGER) AS gs
ORDER BY c.name;

-- Actualizar algunos empleados para que tengan jefes (relación recursiva)
-- Esto se haría en una aplicación real, pero para simplificar, 
-- vamos a establecer algunos empleados como gerentes con subordinados

-- Asignar jefes a empleados (simplificado)
UPDATE employees 
SET has_subordinates = true
WHERE id IN (
  SELECT id FROM employees 
  ORDER BY RANDOM() 
  LIMIT (SELECT COUNT(*) * 0.2 FROM employees)::INTEGER
);

-- Insertar algunas habilidades de ejemplo para empleados
INSERT INTO employee_skills (employee_id, skill_id)
SELECT 
  e.id AS employee_id,
  s.id AS skill_id
FROM employees e
CROSS JOIN skills s
WHERE RANDOM() < 0.3  -- 30% de probabilidad de tener cada habilidad
ON CONFLICT DO NOTHING;

-- Insertar algunos intereses de ejemplo para empleados
INSERT INTO employee_interests (employee_id, interest_id)
SELECT 
  e.id AS employee_id,
  i.id AS interest_id
FROM employees e
CROSS JOIN interests i
WHERE RANDOM() < 0.2  -- 20% de probabilidad de tener cada interés
ON CONFLICT DO NOTHING;

-- Verificar los datos generados
SELECT 
  c.name AS company,
  COUNT(e.id) AS employee_count
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
GROUP BY c.id, c.name
ORDER BY c.name;