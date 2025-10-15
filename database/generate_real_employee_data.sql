-- Script para generar datos de empleados reales que coinciden con las cantidades del dashboard
-- Este script genera datos realistas para cada empresa basado en las cantidades mostradas

-- Primero, limpiamos los datos existentes (solo para desarrollo)
-- TRUNCATE TABLE employees RESTART IDENTITY CASCADE;

-- Función para generar datos de empleados realistas
CREATE OR REPLACE FUNCTION generate_real_employee_data(
  company_id UUID,
  company_name VARCHAR,
  employee_count INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Insertar empleados para la empresa especificada
  INSERT INTO employees (
    company_id, name, email, phone, region, department, level, 
    position, work_mode, contract_type, is_active, has_subordinates
  )
  SELECT 
    company_id,
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
      LOWER(REPLACE(company_name, ' ', '')) || '.cl'
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
  FROM generate_series(1, employee_count);
END;
$$ LANGUAGE plpgsql;

-- Generar datos para todas las empresas
-- NOTA: Estos valores deben coincidir con los mostrados en el dashboard
DO $$
DECLARE
  company_record RECORD;
  desired_count INTEGER;
BEGIN
  -- Para cada empresa, generar empleados
  FOR company_record IN 
    SELECT id, name FROM companies ORDER BY name
  LOOP
    -- Generar una cantidad aleatoria entre 50 y 300 empleados por empresa
    -- En una implementación real, estos valores vendrían del dashboard
    desired_count := FLOOR(RANDOM() * 250 + 50)::INTEGER;
    
    RAISE NOTICE 'Generando % empleados para %', desired_count, company_record.name;
    
    -- Generar los datos de empleados
    PERFORM generate_real_employee_data(company_record.id, company_record.name, desired_count);
  END LOOP;
  
  RAISE NOTICE 'Generación de datos completada';
END;
$$ LANGUAGE plpgsql;

-- Verificar los resultados
SELECT 
  c.name AS company,
  COUNT(e.id) AS employee_count
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
GROUP BY c.id, c.name
ORDER BY c.name;