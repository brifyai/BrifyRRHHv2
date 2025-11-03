-- Script para sincronizar los datos de empleados con el dashboard
-- Este script ajusta los datos para que coincidan con las cantidades mostradas en el resumen por empresa

-- Primero, verificamos cuántos empleados hay por empresa actualmente
SELECT 
  c.name AS company,
  COUNT(e.id) AS current_employee_count
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Si necesitamos ajustar las cantidades para que coincidan con el dashboard,
-- podemos usar este enfoque:

-- 1. Crear una tabla temporal con las cantidades deseadas
-- (Esto sería basado en los datos reales del dashboard)
CREATE TEMP TABLE desired_employee_counts (
  company_name VARCHAR(255),
  desired_count INTEGER
);

-- 2. Insertar las cantidades deseadas (estos valores deben coincidir con el dashboard)
-- NOTA: Estos valores son ejemplos y deben ser reemplazados con los valores reales del dashboard
INSERT INTO desired_employee_counts (company_name, desired_count) VALUES
  ('Ariztia', 120),
  ('Inchcape', 85),
  ('Achs', 210),
  ('Arcoprime', 95),
  ('Grupo Saesa', 180),
  ('Colbun', 145),
  ('AFP Habitat', 90),
  ('Copec', 320),
  ('Antofagasta Minerals', 275),
  ('Vida Cámara', 65),
  ('Enaex', 130);

-- 3. Ajustar las cantidades de empleados para cada empresa
-- Primero, eliminamos empleados excedentes
WITH employee_counts AS (
  SELECT 
    c.id AS company_id,
    c.name AS company_name,
    COUNT(e.id) AS current_count,
    d.desired_count
  FROM companies c
  LEFT JOIN employees e ON c.id = e.company_id
  LEFT JOIN desired_employee_counts d ON c.name = d.company_name
  GROUP BY c.id, c.name, d.desired_count
)
DELETE FROM employees 
WHERE id IN (
  SELECT e.id
  FROM employees e
  JOIN employee_counts ec ON e.company_id = ec.company_id
  WHERE ec.current_count > COALESCE(ec.desired_count, ec.current_count)
  AND random() < (
    (ec.current_count - COALESCE(ec.desired_count, ec.current_count))::FLOAT / ec.current_count::FLOAT
  )
);

-- 4. Agregar empleados faltantes
WITH employee_counts AS (
  SELECT 
    c.id AS company_id,
    c.name AS company_name,
    COUNT(e.id) AS current_count,
    COALESCE(d.desired_count, 0) AS desired_count
  FROM companies c
  LEFT JOIN employees e ON c.id = e.company_id
  LEFT JOIN desired_employee_counts d ON c.name = d.company_name
  GROUP BY c.id, c.name, d.desired_count
)
INSERT INTO employees (
  company_id, name, email, phone, region, department, level, 
  position, work_mode, contract_type, is_active, has_subordinates
)
SELECT 
  ec.company_id,
  -- Generar nombre completo
  (ARRAY[
    'Camila', 'Patricio', 'Víctor', 'Graciela', 'Jorge', 'Ricardo', 'Felipe', 'Arturo', 
    'Valentina', 'Isabel', 'César', 'Oscar', 'Carolina', 'Rodrigo', 'Francisco', 
    'Miguel', 'Alejandro', 'Daniela', 'Romina', 'Silvana', 'Guillermo', 'Fernanda', 
    'Claudia', 'Teresa', 'Víctor', 'Cristian', 'Diego', 'Natalia', 'Luis', 'Karina',
    'Andrés', 'Marcela', 'Verónica', 'Roberto', 'Tamara', 'Danielle', 'Macarena',
    'Sebastián', 'Pablo', 'Eduardo', 'Fernando', 'Constanza', 'Paulina', 'Catalina',
    'Ignacio', 'Renata', 'Matías', 'Camilo', 'Andrea', 'Nicole', 'José', 'Manuel'
  ])[FLOOR(RANDOM() * 52 + 1)::INTEGER] || ' ' || 
  (ARRAY[
    'Gutiérrez', 'Castro', 'Vargas', 'Reyes', 'Sepúlveda', 'Henríquez', 'Miranda',
    'López', 'Pizarro', 'Villarroel', 'Ramos', 'Morales', 'Álvarez', 'Cortés',
    'Rivera', 'Parra', 'Leiva', 'Silva', 'Fuentes', 'Zúñiga', 'Díaz', 'Muñoz',
    'Romero', 'Guzmán', 'Moraga', 'Contreras', 'Herrera', 'Roas', 'Aguilera',
    'Pérez', 'Sánchez', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez',
    'García', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno'
  ])[FLOOR(RANDOM() * 44 + 1)::INTEGER] AS name,
  -- Generar email
  LOWER(
    (ARRAY[
      'Camila', 'Patricio', 'Víctor', 'Graciela', 'Jorge', 'Ricardo', 'Felipe', 'Arturo', 
      'Valentina', 'Isabel', 'César', 'Oscar', 'Carolina', 'Rodrigo', 'Francisco', 
      'Miguel', 'Alejandro', 'Daniela', 'Romina', 'Silvana', 'Guillermo', 'Fernanda', 
      'Claudia', 'Teresa', 'Víctor', 'Cristian', 'Diego', 'Natalia', 'Luis', 'Karina',
      'Andrés', 'Marcela', 'Verónica', 'Roberto', 'Tamara', 'Danielle', 'Macarena',
      'Sebastián', 'Pablo', 'Eduardo', 'Fernando', 'Constanza', 'Paulina', 'Catalina',
      'Ignacio', 'Renata', 'Matías', 'Camilo', 'Andrea', 'Nicole', 'José', 'Manuel'
    ])[FLOOR(RANDOM() * 52 + 1)::INTEGER] || '.' || 
    (ARRAY[
      'Gutiérrez', 'Castro', 'Vargas', 'Reyes', 'Sepúlveda', 'Henríquez', 'Miranda',
      'López', 'Pizarro', 'Villarroel', 'Ramos', 'Morales', 'Álvarez', 'Cortés',
      'Rivera', 'Parra', 'Leiva', 'Silva', 'Fuentes', 'Zúñiga', 'Díaz', 'Muñoz',
      'Romero', 'Guzmán', 'Moraga', 'Contreras', 'Herrera', 'Roas', 'Aguilera',
      'Pérez', 'Sánchez', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez',
      'García', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno'
    ])[FLOOR(RANDOM() * 44 + 1)::INTEGER] || '@' || 
    LOWER(REPLACE(ec.company_name, ' ', '')) || '.cl'
  ) AS email,
  -- Generar teléfono
  '+56 9 ' || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 8, '0') AS phone,
  -- Seleccionar región aleatoria
  (ARRAY[
    'Región de Tarapacá', 'Región de Antofagasta', 'Región de Atacama', 
    'Región de Coquimbo', 'Región de Valparaíso', 
    'Región del Libertador General Bernardo O''Higgins', 'Región del Maule', 
    'Región de Ñuble', 'Región del Biobío', 'Región de La Araucanía', 
    'Región de Los Ríos', 'Región de Los Lagos', 
    'Región Aysén del General Carlos Ibáñez del Campo', 
    'Región de Magallanes y de la Antártica Chilena', 'Región Metropolitana'
  ])[FLOOR(RANDOM() * 15 + 1)::INTEGER] AS region,
  -- Seleccionar departamento aleatorio
  (ARRAY[
    'Operaciones', 'TI', 'Seguridad', 'Producción', 'RRHH', 'Administración',
    'Planificación', 'Mantenimiento', 'Servicio al Cliente', 'Logística',
    'Investigación y Desarrollo', 'Contabilidad', 'Finanzas', 'Tesorería',
    'Marketing', 'Ventas', 'Auditoría', 'Legal', 'Calidad', 'Compras'
  ])[FLOOR(RANDOM() * 20 + 1)::INTEGER] AS department,
  -- Seleccionar nivel aleatorio
  (ARRAY[
    'Asistente', 'Especialista', 'Supervisor', 'Coordinador', 
    'Jefatura', 'Gerente', 'Director', 'Operario'
  ])[FLOOR(RANDOM() * 8 + 1)::INTEGER] AS level,
  -- Seleccionar posición aleatoria
  (ARRAY[
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
  ])[FLOOR(RANDOM() * 42 + 1)::INTEGER] AS position,
  -- Seleccionar modalidad de trabajo aleatoria
  (ARRAY['Presencial', 'Híbrido', 'Remoto'])[FLOOR(RANDOM() * 3 + 1)::INTEGER] AS work_mode,
  -- Seleccionar tipo de contrato aleatorio
  (ARRAY['Indefinido', 'Plazo Fijo', 'Honorarios'])[FLOOR(RANDOM() * 3 + 1)::INTEGER] AS contract_type,
  -- Activar todos los empleados
  true AS is_active,
  -- Algunos empleados tienen subordinados
  (RANDOM() > 0.7) AS has_subordinates
FROM employee_counts ec
CROSS JOIN generate_series(1, GREATEST(0, ec.desired_count - ec.current_count)) AS gs
WHERE ec.desired_count > ec.current_count;

-- 5. Verificar los resultados finales
SELECT 
  c.name AS company,
  COUNT(e.id) AS final_employee_count
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- 6. Limpiar la tabla temporal
DROP TABLE IF EXISTS desired_employee_counts;