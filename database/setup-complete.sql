-- Script para crear las tablas y datos iniciales
-- Este script debe ejecutarse en el SQL Editor de Supabase

-- Crear tabla de empresas
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de empleados
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  region VARCHAR(100),
  department VARCHAR(100),
  level VARCHAR(50),
  position VARCHAR(100),
  work_mode VARCHAR(20),
  contract_type VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  has_subordinates BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar empresas de ejemplo
INSERT INTO companies (name) VALUES 
  ('Ariztia'),
  ('Inchcape'),
  ('Achs'),
  ('Arcoprime'),
  ('Grupo Saesa'),
  ('Colbun'),
  ('AFP Habitat'),
  ('Copec'),
  ('Antofagasta Minerals'),
  ('Vida Cámara'),
  ('Enaex')
ON CONFLICT (name) DO NOTHING;

-- Función para generar un empleado con datos realistas
CREATE OR REPLACE FUNCTION generate_realistic_employee(
  company_id UUID,
  company_name VARCHAR
) RETURNS TABLE (
  name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  region VARCHAR,
  department VARCHAR,
  level VARCHAR,
  position VARCHAR,
  work_mode VARCHAR,
  contract_type VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
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
    (ARRAY['Indefinido', 'Plazo Fijo', 'Honorarios'])[FLOOR(RANDOM() * 3 + 1)::INTEGER] AS contract_type;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para asegurar que cada empresa tenga exactamente 50 empleados
CREATE OR REPLACE FUNCTION ensure_50_employees_per_company()
RETURNS VOID AS $$
DECLARE
  company_record RECORD;
  current_count INTEGER;
  employees_to_add INTEGER;
  employees_to_remove INTEGER;
BEGIN
  -- Para cada empresa, asegurar que tenga exactamente 50 empleados
  FOR company_record IN 
    SELECT id, name FROM companies ORDER BY name
  LOOP
    -- Obtener el conteo actual de empleados
    SELECT COUNT(*) INTO current_count
    FROM employees
    WHERE company_id = company_record.id;
    
    RAISE NOTICE 'Empresa: %, Actual: %, Objetivo: 50', company_record.name, current_count;
    
    -- Si ya hay 50 empleados, continuar con la siguiente empresa
    IF current_count = 50 THEN
      RAISE NOTICE 'Empresa % ya tiene 50 empleados', company_record.name;
      CONTINUE;
    END IF;
    
    -- Si hay menos de 50, generar los que faltan
    IF current_count < 50 THEN
      employees_to_add := 50 - current_count;
      RAISE NOTICE 'Agregando % empleados a %', employees_to_add, company_record.name;
      
      -- Insertar empleados faltantes
      INSERT INTO employees (
        company_id, name, email, phone, region, department, level, 
        position, work_mode, contract_type, is_active, has_subordinates
      )
      SELECT 
        company_record.id,
        name,
        email,
        phone,
        region,
        department,
        level,
        position,
        work_mode,
        contract_type,
        true AS is_active,
        (RANDOM() > 0.7) AS has_subordinates
      FROM generate_realistic_employee(company_record.id, company_record.name)
      LIMIT employees_to_add;
      
    -- Si hay más de 50, eliminar los excedentes
    ELSIF current_count > 50 THEN
      employees_to_remove := current_count - 50;
      RAISE NOTICE 'Eliminando % empleados de %', employees_to_remove, company_record.name;
      
      -- Eliminar empleados excedentes
      DELETE FROM employees 
      WHERE id IN (
        SELECT id 
        FROM employees 
        WHERE company_id = company_record.id
        ORDER BY RANDOM() 
        LIMIT employees_to_remove
      );
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Proceso completado - todas las empresas tienen 50 empleados';
END;
$$ LANGUAGE plpgsql;

-- Ejecutar el procedimiento para asegurar 50 empleados por empresa
SELECT ensure_50_employees_per_company();

-- Verificar los resultados finales
SELECT 
  c.name AS company,
  COUNT(e.id) AS final_employee_count
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
GROUP BY c.id, c.name
ORDER BY c.name;