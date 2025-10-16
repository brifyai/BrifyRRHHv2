-- Script SQL para generar 800 empleados en la base de datos de producción
-- Este script debe ejecutarse con el service role key

-- Primero, limpiar empleados existentes
DELETE FROM employees;

-- Generar 800 empleados distribuidos entre las 16 empresas existentes
-- 50 empleados por empresa = 800 total

WITH company_ids AS (
  SELECT id, name FROM companies
),
employee_data AS (
  SELECT 
    c.id AS company_id,
    CASE 
      WHEN n <= 20 THEN 'Camilo'
      WHEN n <= 40 THEN 'Patricio'
      WHEN n <= 60 THEN 'Víctor'
      WHEN n <= 80 THEN 'Graciela'
      WHEN n <= 100 THEN 'Jorge'
      WHEN n <= 120 THEN 'Ricardo'
      WHEN n <= 140 THEN 'Felipe'
      WHEN n <= 160 THEN 'Arturo'
      WHEN n <= 180 THEN 'Valentina'
      WHEN n <= 200 THEN 'Isabel'
      WHEN n <= 220 THEN 'César'
      WHEN n <= 240 THEN 'Oscar'
      WHEN n <= 260 THEN 'Carolina'
      WHEN n <= 280 THEN 'Rodrigo'
      WHEN n <= 300 THEN 'Francisco'
      WHEN n <= 320 THEN 'Miguel'
      WHEN n <= 340 THEN 'Alejandro'
      WHEN n <= 360 THEN 'Daniela'
      WHEN n <= 380 THEN 'Romina'
      WHEN n <= 400 THEN 'Silvana'
      WHEN n <= 420 THEN 'Guillermo'
      WHEN n <= 440 THEN 'Fernanda'
      WHEN n <= 460 THEN 'Claudia'
      WHEN n <= 480 THEN 'Teresa'
      WHEN n <= 500 THEN 'Víctor'
      WHEN n <= 520 THEN 'Cristian'
      WHEN n <= 540 THEN 'Diego'
      WHEN n <= 560 THEN 'Natalia'
      WHEN n <= 580 THEN 'Luis'
      WHEN n <= 600 THEN 'Karina'
      WHEN n <= 620 THEN 'Andrés'
      WHEN n <= 640 THEN 'Marcela'
      WHEN n <= 660 THEN 'Verónica'
      WHEN n <= 680 THEN 'Roberto'
      WHEN n <= 700 THEN 'Tamara'
      WHEN n <= 720 THEN 'Danielle'
      WHEN n <= 740 THEN 'Macarena'
      WHEN n <= 760 THEN 'Sebastián'
      WHEN n <= 780 THEN 'Pablo'
      WHEN n <= 800 THEN 'Eduardo'
      ELSE 'Empleado'
    END ||
    CASE 
      WHEN n <= 25 THEN 'Gutiérrez'
      WHEN n <= 50 THEN 'Castro'
      WHEN n <= 75 THEN 'Vargas'
      WHEN n <= 100 THEN 'Reyes'
      WHEN n <= 125 THEN 'Sepúlveda'
      WHEN n <= 150 THEN 'Henríquez'
      WHEN n <= 175 THEN 'Miranda'
      WHEN n <= 200 THEN 'López'
      WHEN n <= 225 THEN 'Pizarro'
      WHEN n <= 250 THEN 'Villarroel'
      WHEN n <= 275 THEN 'Ramos'
      WHEN n <= 300 THEN 'Morales'
      WHEN n <= 325 THEN 'Álvarez'
      WHEN n <= 350 THEN 'Cortés'
      WHEN n <= 375 THEN 'Rivera'
      WHEN n <= 400 THEN 'Parra'
      WHEN n <= 425 THEN 'Leiva'
      WHEN n <= 450 THEN 'Silva'
      WHEN n <= 475 THEN 'Fuentes'
      WHEN n <= 500 THEN 'Zúñiga'
      WHEN n <= 525 THEN 'Díaz'
      WHEN n <= 550 THEN 'Muñoz'
      WHEN n <= 575 THEN 'Romero'
      WHEN n <= 600 THEN 'Guzmán'
      WHEN n <= 625 THEN 'Moraga'
      WHEN n <= 650 THEN 'Contreras'
      WHEN n <= 675 THEN 'Herrera'
      WHEN n <= 700 THEN 'Roas'
      WHEN n <= 725 THEN 'Aguilera'
      WHEN n <= 750 THEN 'Pérez'
      WHEN n <= 775 THEN 'Sánchez'
      WHEN n <= 800 THEN 'González'
      ELSE 'Rodríguez'
    END AS name,
    -- Generar email único
    LOWER(
      CASE 
        WHEN n <= 20 THEN 'camilo'
        WHEN n <= 40 THEN 'patricio'
        WHEN n <= 60 THEN 'victor'
        WHEN n <= 80 THEN 'graciela'
        WHEN n <= 100 THEN 'jorge'
        WHEN n <= 120 THEN 'ricardo'
        WHEN n <= 140 THEN 'felipe'
        WHEN n <= 160 THEN 'arturo'
        WHEN n <= 180 THEN 'valentina'
        WHEN n <= 200 THEN 'isabel'
        WHEN n <= 220 THEN 'cesar'
        WHEN n <= 240 THEN 'oscar'
        WHEN n <= 260 THEN 'carolina'
        WHEN n <= 280 THEN 'rodrigo'
        WHEN n <= 300 THEN 'francisco'
        WHEN n <= 320 THEN 'miguel'
        WHEN n <= 340 THEN 'alejandro'
        WHEN n <= 360 THEN 'daniela'
        WHEN n <= 380 THEN 'romina'
        WHEN n <= 400 THEN 'silvana'
        WHEN n <= 420 THEN 'guillermo'
        WHEN n <= 440 THEN 'fernanda'
        WHEN n <= 460 THEN 'claudia'
        WHEN n <= 480 THEN 'teresa'
        WHEN n <= 500 THEN 'victor'
        WHEN n <= 520 THEN 'cristian'
        WHEN n <= 540 THEN 'diego'
        WHEN n <= 560 THEN 'natalia'
        WHEN n <= 580 THEN 'luis'
        WHEN n <= 600 THEN 'karina'
        WHEN n <= 620 THEN 'andres'
        WHEN n <= 640 THEN 'marcela'
        WHEN n <= 660 THEN 'veronica'
        WHEN n <= 680 THEN 'roberto'
        WHEN n <= 700 THEN 'tamara'
        WHEN n <= 720 THEN 'danielle'
        WHEN n <= 740 THEN 'macarena'
        WHEN n <= 760 THEN 'sebastian'
        WHEN n <= 780 THEN 'pablo'
        WHEN n <= 800 THEN 'eduardo'
        ELSE 'empleado'
      END ||
      CASE 
        WHEN n <= 25 THEN 'gutierrez'
        WHEN n <= 50 THEN 'castro'
        WHEN n <= 75 THEN 'vargas'
        WHEN n <= 100 THEN 'reyes'
        WHEN n <= 125 THEN 'sepulveda'
        WHEN n <= 150 THEN 'henriquez'
        WHEN n <= 175 THEN 'miranda'
        WHEN n <= 200 THEN 'lopez'
        WHEN n <= 225 THEN 'pizarro'
        WHEN n <= 250 THEN 'villarroel'
        WHEN n <= 275 THEN 'ramos'
        WHEN n <= 300 THEN 'morales'
        WHEN n <= 325 THEN 'alvarez'
        WHEN n <= 350 THEN 'cortes'
        WHEN n <= 375 THEN 'rivera'
        WHEN n <= 400 THEN 'parra'
        WHEN n <= 425 THEN 'leiva'
        WHEN n <= 450 THEN 'silva'
        WHEN n <= 475 THEN 'fuentes'
        WHEN n <= 500 THEN 'zuniga'
        WHEN n <= 525 THEN 'diaz'
        WHEN n <= 550 THEN 'munoz'
        WHEN n <= 575 THEN 'romero'
        WHEN n <= 600 THEN 'guzman'
        WHEN n <= 625 THEN 'moraga'
        WHEN n <= 650 THEN 'contreras'
        WHEN n <= 675 THEN 'herrera'
        WHEN n <= 700 THEN 'roas'
        WHEN n <= 725 THEN 'aguilera'
        WHEN n <= 750 THEN 'perez'
        WHEN n <= 775 THEN 'sanchez'
        WHEN n <= 800 THEN 'gonzalez'
        ELSE 'rodriguez'
      END ||
      n ||
      '@' ||
      LOWER(REPLACE(c.name, ' ', '')) ||
      '.cl'
    ) AS email,
    -- Generar teléfono
    '+56 9 ' || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 8, '0') AS phone,
    -- Región aleatoria
    (ARRAY['Región Metropolitana', 'Región de Valparaíso', 'Región del Biobío', 'Región de Araucanía',
           'Región de Los Lagos', 'Región de Antofagasta', 'Región de Coquimbo', 'Región de Los Ríos',
           'Región del Maule', 'Región de Tarapacá', 'Región de Atacama', 'Región de Ñuble',
           'Región de Aysén', 'Región de Magallanes', 'Región del Libertador O''Higgins'])[CEIL(RANDOM() * 15)] AS region,
    -- Departamento aleatorio
    (ARRAY['Operaciones', 'TI', 'Seguridad', 'Producción', 'RRHH', 'Administración',
           'Planificación', 'Mantenimiento', 'Servicio al Cliente', 'Logística',
           'Investigación y Desarrollo', 'Contabilidad', 'Finanzas', 'Tesorería',
           'Marketing', 'Ventas', 'Auditoría', 'Legal', 'Calidad', 'Compras'])[CEIL(RANDOM() * 20)] AS department,
    -- Nivel aleatorio
    (ARRAY['Asistente', 'Especialista', 'Supervisor', 'Coordinador', 
           'Jefatura', 'Gerente', 'Director', 'Operario'])[CEIL(RANDOM() * 8)] AS level,
    -- Posición aleatoria
    (ARRAY['Jefe de Operaciones', 'Desarrollador', 'Supervisor de Seguridad',
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
           'Gerente de Ventas', 'Asistente de Tesorería', 'Auditor Interno'])[CEIL(RANDOM() * 40)] AS position,
    -- Modalidad de trabajo aleatoria
    (ARRAY['Presencial', 'Híbrido', 'Remoto'])[CEIL(RANDOM() * 3)] AS work_mode,
    -- Tipo de contrato aleatorio
    (ARRAY['Indefinido', 'Plazo Fijo', 'Honorarios'])[CEIL(RANDOM() * 3)] AS contract_type,
    true AS is_active,
    RANDOM() > 0.7 AS has_subordinates,
    NOW() AS created_at,
    NOW() AS updated_at
  FROM company_ids c
  CROSS JOIN generate_series(1, 50) n
  ORDER BY c.id, n
)

INSERT INTO employees (
  company_id, name, email, phone, region, department, level, 
  position, work_mode, contract_type, is_active, has_subordinates,
  created_at, updated_at
)
SELECT * FROM employee_data;

-- Verificar resultado
SELECT COUNT(*) as total_empleados FROM employees;

-- Mostrar muestra de empleados generados
SELECT 
  name, 
  email, 
  department, 
  position,
  company_id
FROM employees 
LIMIT 10;