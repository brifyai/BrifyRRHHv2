-- Script completo para configurar la base de datos de empleados y comunicaciones
-- Ejecutar en orden: primero las tablas, luego los datos

-- ===========================================
-- CREACIÓN DE TABLAS
-- ===========================================

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    region VARCHAR(255),
    department VARCHAR(255),
    level VARCHAR(100),
    position VARCHAR(255),
    work_mode VARCHAR(50),
    contract_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    has_subordinates BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    subject VARCHAR(500),
    content TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sent, read, delivered
    scheduled_date TIMESTAMP WITH TIME ZONE,
    sent_date TIMESTAMP WITH TIME ZONE,
    read_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de plantillas
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    content TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INSERCIÓN DE EMPRESAS
-- ===========================================

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
('Enaex'),
('SQM'),
('CMPC'),
('Corporación Chilena - Alemana'),
('Hogar Alemán'),
('Empresas SB')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- INSERCIÓN DE EMPLEADOS (800 empleados)
-- ===========================================

-- Función para generar empleados
CREATE OR REPLACE FUNCTION generate_employees()
RETURNS VOID AS $$
DECLARE
    company_record RECORD;
    first_names TEXT[] := ARRAY[
        'Camila', 'Patricio', 'Víctor', 'Graciela', 'Jorge', 'Ricardo', 'Felipe', 'Arturo',
        'Valentina', 'Isabel', 'César', 'Oscar', 'Carolina', 'Rodrigo', 'Francisco',
        'Miguel', 'Alejandro', 'Daniela', 'Romina', 'Silvana', 'Guillermo', 'Fernanda',
        'Claudia', 'Teresa', 'Víctor', 'Cristian', 'Diego', 'Natalia', 'Luis', 'Karina',
        'Andrés', 'Marcela', 'Verónica', 'Roberto', 'Tamara', 'Danielle', 'Macarena',
        'Sebastián', 'Pablo', 'Eduardo', 'Fernando', 'Constanza', 'Paulina', 'Catalina',
        'Ignacio', 'Renata', 'Matías', 'Camilo', 'Andrea', 'Nicole', 'José', 'Manuel',
        'María', 'Ana', 'Sofía', 'Lucía', 'Martina', 'Emma', 'Antonia', 'Agustina',
        'Josefa', 'Antonia', 'Florencia', 'Martín', 'Tomás', 'Benjamín', 'Joaquín',
        'Maximiliano', 'Simón', 'Julián', 'Gaspar', 'Vicente', 'Gonzalo', 'Renato',
        'Hernán', 'Esteban', 'Mario', 'Raúl', 'Hugo', 'Alberto', 'Enrique', 'Rafael'
    ];
    last_names TEXT[] := ARRAY[
        'Gutiérrez', 'Castro', 'Vargas', 'Reyes', 'Sepúlveda', 'Henríquez', 'Miranda',
        'López', 'Pizarro', 'Villarroel', 'Ramos', 'Morales', 'Álvarez', 'Cortés',
        'Rivera', 'Parra', 'Leiva', 'Silva', 'Fuentes', 'Zúñiga', 'Díaz', 'Muñoz',
        'Romero', 'Guzmán', 'Moraga', 'Contreras', 'Herrera', 'Roas', 'Aguilera',
        'Pérez', 'Sánchez', 'González', 'Rodríguez', 'Fernández', 'Martínez',
        'García', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Moreno',
        'Álvarez', 'Romero', 'Serrano', 'Torres', 'Delgado', 'Castillo', 'Ortega',
        'Rubio', 'Molina', 'Navarro', 'Ramos', 'Sanz', 'Blanco', 'Suárez', 'Mora',
        'Vega', 'Cruz', 'Flores', 'Herrero', 'Medina', 'Garrido', 'Campos', 'Vidal',
        'Saavedra', 'Cortés', 'Guerrero', 'Muñoz', 'Valenzuela', 'Rojas', 'Vásquez',
        'Espinoza', 'Bravo', 'Cárdenas', 'Mendoza', 'Vargas', 'Carrasco', 'Paredes'
    ];
    regions TEXT[] := ARRAY[
        'Región de Tarapacá', 'Región de Antofagasta', 'Región de Atacama',
        'Región de Coquimbo', 'Región de Valparaíso',
        'Región del Libertador General Bernardo O''Higgins', 'Región del Maule',
        'Región de Ñuble', 'Región del Biobío', 'Región de La Araucanía',
        'Región de Los Ríos', 'Región de Los Lagos',
        'Región Aysén del General Carlos Ibáñez del Campo',
        'Región de Magallanes y de la Antártica Chilena', 'Región Metropolitana'
    ];
    departments TEXT[] := ARRAY[
        'Operaciones', 'TI', 'Seguridad', 'Producción', 'RRHH', 'Administración',
        'Planificación', 'Mantenimiento', 'Servicio al Cliente', 'Logística',
        'Investigación y Desarrollo', 'Contabilidad', 'Finanzas', 'Tesorería',
        'Marketing', 'Ventas', 'Auditoría', 'Legal', 'Calidad', 'Compras',
        'Comunicaciones', 'Innovación', 'Sostenibilidad', 'Riesgos', 'Cumplimiento'
    ];
    levels TEXT[] := ARRAY[
        'Asistente', 'Especialista', 'Supervisor', 'Coordinador',
        'Jefatura', 'Gerente', 'Director', 'Operario', 'Analista', 'Consultor'
    ];
    positions TEXT[] := ARRAY[
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
        'Gerente de Ventas', 'Asistente de Tesorería', 'Auditor Interno',
        'Director de Innovación', 'Especialista en Sostenibilidad', 'Gerente de Riesgos',
        'Coordinador de Comunicaciones', 'Analista de Datos', 'Consultor Senior',
        'Director de Tecnología', 'Gerente de Proyectos', 'Especialista en Capacitación'
    ];
    work_modes TEXT[] := ARRAY['Presencial', 'Híbrido', 'Remoto'];
    contract_types TEXT[] := ARRAY['Indefinido', 'Plazo Fijo', 'Honorarios'];
    employee_id UUID;
    employee_name TEXT;
    employee_email TEXT;
    employee_phone TEXT;
    i INTEGER;
BEGIN
    -- Para cada empresa, insertar 50 empleados
    FOR company_record IN SELECT id, name FROM companies LOOP
        FOR i IN 1..50 LOOP
            -- Generar nombre
            employee_name := first_names[1 + (random() * array_length(first_names, 1))::integer] || ' ' ||
                           last_names[1 + (random() * array_length(last_names, 1))::integer] || ' ' ||
                           last_names[1 + (random() * array_length(last_names, 1))::integer];

            -- Generar email
            employee_email := lower(replace(replace(employee_name, ' ', '.'), '''', '')) || '@' ||
                            lower(replace(replace(company_record.name, ' ', ''), '''', '')) || '.cl';

            -- Generar teléfono
            employee_phone := '+56 ' || (ARRAY['9','2','3','4','5','6','7'])[1 + (random() * 7)::integer] || ' ' ||
                            lpad((random() * 10000000)::integer::text, 8, '0');

            -- Insertar empleado
            INSERT INTO employees (
                company_id, name, email, phone, region, department, level, position,
                work_mode, contract_type, is_active, has_subordinates
            ) VALUES (
                company_record.id,
                employee_name,
                employee_email,
                employee_phone,
                regions[1 + (random() * array_length(regions, 1))::integer],
                departments[1 + (random() * array_length(departments, 1))::integer],
                levels[1 + (random() * array_length(levels, 1))::integer],
                positions[1 + (random() * array_length(positions, 1))::integer],
                work_modes[1 + (random() * array_length(work_modes, 1))::integer],
                contract_types[1 + (random() * array_length(contract_types, 1))::integer],
                true,
                (random() > 0.7)
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la función para generar empleados
SELECT generate_employees();

-- ===========================================
-- INSERCIÓN DE MENSAJES DE EJEMPLO
-- ===========================================

-- Función para generar mensajes de ejemplo
CREATE OR REPLACE FUNCTION generate_sample_messages()
RETURNS VOID AS $$
DECLARE
    employee_record RECORD;
    message_count INTEGER;
    random_status TEXT;
    random_days INTEGER;
BEGIN
    -- Para cada empleado, generar algunos mensajes aleatorios
    FOR employee_record IN SELECT id, company_id FROM employees LOOP
        -- Generar entre 0 y 5 mensajes por empleado
        message_count := (random() * 6)::integer;

        FOR i IN 1..message_count LOOP
            -- Elegir status aleatorio
            random_status := (ARRAY['draft','scheduled','sent','read'])[1 + (random() * 4)::integer];

            -- Insertar mensaje
            INSERT INTO messages (
                employee_id, company_id, subject, content, status,
                scheduled_date, sent_date, read_date
            ) VALUES (
                employee_record.id,
                employee_record.company_id,
                'Mensaje de ejemplo ' || i,
                'Este es un mensaje de ejemplo generado automáticamente para testing del sistema.',
                random_status,
                CASE WHEN random_status IN ('scheduled','sent','read')
                     THEN NOW() + (random() * 30 || ' days')::interval
                     ELSE NULL END,
                CASE WHEN random_status IN ('sent','read')
                     THEN NOW() - (random() * 30 || ' days')::interval
                     ELSE NULL END,
                CASE WHEN random_status = 'read'
                     THEN NOW() - (random() * 7 || ' days')::interval
                     ELSE NULL END
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la función para generar mensajes
SELECT generate_sample_messages();

-- ===========================================
-- INSERCIÓN DE PLANTILLAS DE EJEMPLO
-- ===========================================

INSERT INTO templates (name, subject, content, category) VALUES
('Bienvenida Nuevo Empleado', 'Bienvenido a la empresa',
 'Estimado/a [NOMBRE],

Nos complace darle la bienvenida a [EMPRESA]. Esperamos que tenga una excelente experiencia con nosotros.

Atentamente,
Equipo de RRHH', 'RRHH'),

('Recordatorio de Reunión', 'Recordatorio: Reunión programada',
 'Hola [NOMBRE],

Le recordamos que tiene una reunión programada para [FECHA] a las [HORA].

Saludos,
Equipo Administrativo', 'Administrativo'),

('Actualización de Políticas', 'Actualización de políticas de la empresa',
 'Estimado equipo,

Hemos actualizado nuestras políticas de trabajo. Por favor, revise la documentación adjunta.

Gracias,
Dirección', 'General')
ON CONFLICT DO NOTHING;

-- ===========================================
-- CREACIÓN DE ÍNDICES PARA MEJOR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_messages_employee_id ON messages(employee_id);
CREATE INDEX IF NOT EXISTS idx_messages_company_id ON messages(company_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_scheduled_date ON messages(scheduled_date);

-- ===========================================
-- VERIFICACIÓN FINAL
-- ===========================================

-- Mostrar resumen de datos insertados
SELECT
    (SELECT COUNT(*) FROM companies) as total_companies,
    (SELECT COUNT(*) FROM employees) as total_employees,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM templates) as total_templates;

-- Mostrar distribución de empleados por empresa
SELECT
    c.name as company_name,
    COUNT(e.id) as employee_count
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Mostrar distribución de mensajes por status
SELECT
    status,
    COUNT(*) as message_count
FROM messages
GROUP BY status
ORDER BY status;

-- Limpiar funciones temporales
DROP FUNCTION IF EXISTS generate_employees();
DROP FUNCTION IF EXISTS generate_sample_messages();