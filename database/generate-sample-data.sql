-- Script para generar datos de ejemplo en el nuevo proyecto Supabase
-- Este script debe ejecutarse después de database/new-supabase-setup.sql

-- ============================================
-- FUNCIÓN SIMPLIFICADA PARA GENERAR EMPLEADOS
-- ============================================

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
  "position" VARCHAR,
  work_mode VARCHAR,
  contract_type VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE FLOOR(RANDOM() * 10 + 1)::INTEGER
      WHEN 1 THEN 'Camila Pérez'::VARCHAR
      WHEN 2 THEN 'Patricio Gutiérrez'::VARCHAR
      WHEN 3 THEN 'Víctor Castro'::VARCHAR
      WHEN 4 THEN 'Graciela Vargas'::VARCHAR
      WHEN 5 THEN 'Jorge Reyes'::VARCHAR
      WHEN 6 THEN 'Ricardo Sepúlveda'::VARCHAR
      WHEN 7 THEN 'Felipe Henríquez'::VARCHAR
      WHEN 8 THEN 'Arturo Miranda'::VARCHAR
      WHEN 9 THEN 'Valentina López'::VARCHAR
      ELSE 'Isabel Pizarro'::VARCHAR
    END AS name,
    
    LOWER(
      CASE FLOOR(RANDOM() * 10 + 1)::INTEGER
        WHEN 1 THEN 'camila.perez'::VARCHAR
        WHEN 2 THEN 'patricio.gutierrez'::VARCHAR
        WHEN 3 THEN 'victor.castro'::VARCHAR
        WHEN 4 THEN 'graciela.vargas'::VARCHAR
        WHEN 5 THEN 'jorge.reyes'::VARCHAR
        WHEN 6 THEN 'ricardo.sepulveda'::VARCHAR
        WHEN 7 THEN 'felipe.henriquez'::VARCHAR
        WHEN 8 THEN 'arturo.miranda'::VARCHAR
        WHEN 9 THEN 'valentina.lopez'::VARCHAR
        ELSE 'isabel.pizarro'::VARCHAR
      END || FLOOR(RANDOM() * 1000)::TEXT || '@' || LOWER(REPLACE(company_name, ' ', '')) || '.cl'
    )::VARCHAR AS email,
    
    ('+56 9 ' || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 8, '0'))::VARCHAR AS phone,
    
    CASE FLOOR(RANDOM() * 5 + 1)::INTEGER
      WHEN 1 THEN 'Región Metropolitana'::VARCHAR
      WHEN 2 THEN 'Región de Valparaíso'::VARCHAR
      WHEN 3 THEN 'Región del Biobío'::VARCHAR
      WHEN 4 THEN 'Región de Antofagasta'::VARCHAR
      ELSE 'Región de Coquimbo'::VARCHAR
    END AS region,
    
    CASE FLOOR(RANDOM() * 5 + 1)::INTEGER
      WHEN 1 THEN 'Operaciones'::VARCHAR
      WHEN 2 THEN 'TI'::VARCHAR
      WHEN 3 THEN 'RRHH'::VARCHAR
      WHEN 4 THEN 'Administración'::VARCHAR
      ELSE 'Ventas'::VARCHAR
    END AS department,
    
    CASE FLOOR(RANDOM() * 4 + 1)::INTEGER
      WHEN 1 THEN 'Asistente'::VARCHAR
      WHEN 2 THEN 'Especialista'::VARCHAR
      WHEN 3 THEN 'Supervisor'::VARCHAR
      ELSE 'Gerente'::VARCHAR
    END AS level,
    
    CASE FLOOR(RANDOM() * 5 + 1)::INTEGER
      WHEN 1 THEN 'Jefe de Operaciones'::VARCHAR
      WHEN 2 THEN 'Desarrollador'::VARCHAR
      WHEN 3 THEN 'Supervisor de Seguridad'::VARCHAR
      WHEN 4 THEN 'Reclutador'::VARCHAR
      ELSE 'Técnico de Soporte'::VARCHAR
    END AS "position",
    
    CASE FLOOR(RANDOM() * 3 + 1)::INTEGER
      WHEN 1 THEN 'Presencial'::VARCHAR
      WHEN 2 THEN 'Híbrido'::VARCHAR
      ELSE 'Remoto'::VARCHAR
    END AS work_mode,
    
    CASE FLOOR(RANDOM() * 3 + 1)::INTEGER
      WHEN 1 THEN 'Indefinido'::VARCHAR
      WHEN 2 THEN 'Plazo Fijo'::VARCHAR
      ELSE 'Honorarios'::VARCHAR
    END AS contract_type;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PROCEDIMIENTO PARA ASEGURAR 50 EMPLEADOS POR EMPRESA
-- ============================================

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
        "position", work_mode, contract_type, is_active, has_subordinates
      )
      SELECT
        company_record.id,
        name,
        email,
        phone,
        region,
        department,
        level,
        "position",
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

-- ============================================
-- PROCEDIMIENTO PARA CREAR USUARIO ADMINISTRADOR
-- ============================================

CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS VOID AS $$
BEGIN
  -- Nota: El usuario administrador debe crearse a través de Supabase Auth
    -- Esta función solo crea el registro en la tabla users cuando el usuario ya existe en auth.users
    
    -- Insertar usuario administrador si no existe (solo si ya existe en auth.users)
    INSERT INTO users (id, email, full_name, is_active)
    SELECT
      au.id,
      'juanpablo.riesco@example.com',
      'Juan Pablo Riesco',
      true
    FROM auth.users au
    WHERE au.email = 'juanpablo.riesco@example.com'
    ON CONFLICT (email) DO NOTHING;
    
    -- Asignar plan profesional al administrador
    INSERT INTO payments (user_id, plan_id, amount, status, paid_at)
    SELECT
      u.id,
      p.id,
      p.price,
      'paid',
      NOW()
    FROM users u, plans p
    WHERE u.email = 'juanpablo.riesco@example.com'
    AND p.name = 'Plan Profesional'
    AND EXISTS (SELECT 1 FROM auth.users WHERE email = 'juanpablo.riesco@example.com')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Usuario administrador configurado exitosamente';
    RAISE NOTICE 'IMPORTANTE: Debes crear el usuario juanpablo.riesco@example.com en Supabase Auth primero';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- EJECUTAR PROCEDIMIENTOS
-- ============================================

-- Crear usuario administrador
SELECT create_admin_user();

-- Generar empleados para todas las empresas
SELECT ensure_50_employees_per_company();

-- ============================================
-- VERIFICAR RESULTADOS
-- ============================================

-- Verificar conteo final de empleados por empresa
SELECT 
  c.name AS company,
  COUNT(e.id) AS employee_count
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Verificar usuarios creados
SELECT 
  email,
  full_name,
  company_id,
  is_active,
  created_at
FROM users
ORDER BY created_at;

-- Verificar planes y pagos
SELECT 
  p.name as plan_name,
  p.price,
  COUNT(pa.id) as payment_count
FROM plans p
LEFT JOIN payments pa ON p.id = pa.plan_id
GROUP BY p.id, p.name, p.price
ORDER BY p.price;

COMMIT;