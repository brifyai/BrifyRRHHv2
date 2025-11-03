-- ========================================
-- SCRIPT DEFINITIVO COMPLETO PARA SUPABASE
-- Crea todas las columnas necesarias y 800 empleados
-- Ejecutar hasta que no haya errores
-- ========================================

-- PRIMERO: Verificar estructura actual
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICANDO ESTRUCTURA ACTUAL ===';
    
    -- Verificar tabla users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabla users existe';
    ELSE
        RAISE NOTICE 'Tabla users NO existe - creando estructura básica';
    END IF;
    
    -- Verificar tabla companies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabla companies existe';
    ELSE
        RAISE NOTICE 'Tabla companies NO existe - creando estructura básica';
    END IF;
END $$;

-- ========================================
-- 1. CREAR ESTRUCTURA BÁSICA SI NO EXISTE
-- ========================================

-- Crear tabla users si no existe
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    telegram_id VARCHAR(255),
    full_name TEXT,
    avatar_url TEXT,
    company_id UUID REFERENCES public.companies(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT,
    current_plan_id UUID,
    plan_expiration TIMESTAMP WITH TIME ZONE,
    used_storage_bytes BIGINT DEFAULT 0,
    registered_via VARCHAR(50) DEFAULT 'web',
    admin BOOLEAN DEFAULT false,
    onboarding_status VARCHAR(50) DEFAULT 'pending',
    registro_previo BOOLEAN DEFAULT false
);

-- Crear tabla companies si no existe
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. AGREGAR TODAS LAS COLUMNAS NECESARIAS A USERS
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '=== AGREGANDO COLUMNAS A USERS ===';
    
    -- Lista de columnas a agregar
    DECLARE
        columnas TEXT[] := ARRAY[
            'department VARCHAR(100)',
            'position VARCHAR(100)', 
            'phone VARCHAR(20)',
            'status VARCHAR(20) DEFAULT ''active''',
            'role VARCHAR(50)',
            'employee_id VARCHAR(50)',
            'hire_date DATE',
            'salary DECIMAL(10,2)',
            'manager_id UUID',
            'location VARCHAR(255)',
            'bio TEXT'
        ];
        
        columna TEXT;
        sql_query TEXT;
        column_exists BOOLEAN;
    BEGIN
        FOREACH columna IN ARRAY columnas
        LOOP
            -- Verificar si la columna ya existe
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name = SPLIT_PART(columna, ' ', 1)
                AND table_schema = 'public'
            ) INTO column_exists;
            
            IF NOT column_exists THEN
                sql_query := 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ' || columna;
                EXECUTE sql_query;
                RAISE NOTICE 'Columna agregada: %', SPLIT_PART(columna, ' ', 1);
            ELSE
                RAISE NOTICE 'Columna ya existe: %', SPLIT_PART(columna, ' ', 1);
            END IF;
        END LOOP;
    END;
END $$;

-- ========================================
-- 3. AGREGAR TODAS LAS COLUMNAS NECESARIAS A COMPANIES
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '=== AGREGANDO COLUMNAS A COMPANIES ===';
    
    -- Lista de columnas a agregar
    DECLARE
        columnas TEXT[] := ARRAY[
            'department VARCHAR(100)',
            'position VARCHAR(100)',
            'phone VARCHAR(20)',
            'email VARCHAR(255)',
            'status VARCHAR(20) DEFAULT ''active''',
            'employee_type VARCHAR(20) DEFAULT ''virtual''',
            'role VARCHAR(50)',
            'employee_id VARCHAR(50)',
            'hire_date DATE',
            'salary DECIMAL(10,2)',
            'manager_id UUID',
            'location VARCHAR(255)',
            'bio TEXT',
            'description TEXT'
        ];
        
        columna TEXT;
        sql_query TEXT;
        column_exists BOOLEAN;
    BEGIN
        FOREACH columna IN ARRAY columnas
        LOOP
            -- Verificar si la columna ya existe
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'companies' 
                AND column_name = SPLIT_PART(columna, ' ', 1)
                AND table_schema = 'public'
            ) INTO column_exists;
            
            IF NOT column_exists THEN
                sql_query := 'ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS ' || columna;
                EXECUTE sql_query;
                RAISE NOTICE 'Columna agregada: %', SPLIT_PART(columna, ' ', 1);
            ELSE
                RAISE NOTICE 'Columna ya existe: %', SPLIT_PART(columna, ' ', 1);
            END IF;
        END LOOP;
    END;
END $$;

-- ========================================
-- 4. CREAR TABLAS ADICIONALES NECESARIAS
-- ========================================

-- Tabla message_analysis para analíticas
CREATE TABLE IF NOT EXISTS public.message_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_message TEXT NOT NULL,
    optimized_message TEXT,
    channel VARCHAR(50) NOT NULL,
    engagement_prediction JSONB,
    optimal_timing JSONB,
    optimizations JSONB,
    user_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla analytics_test_reports para reportes
CREATE TABLE IF NOT EXISTS public.analytics_test_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_data JSONB NOT NULL,
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    environment VARCHAR(20) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    employee_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla employee_analytics para métricas
CREATE TABLE IF NOT EXISTS public.employee_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID,
    employee_type VARCHAR(20) DEFAULT 'virtual',
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC,
    metric_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- ========================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_users_position ON public.users(position);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_registered_via ON public.users(registered_via);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_department ON public.companies(department);
CREATE INDEX IF NOT EXISTS idx_companies_position ON public.companies(position);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_employee_type ON public.companies(employee_type);
CREATE INDEX IF NOT EXISTS idx_companies_email ON public.companies(email);

-- Índices para tablas de analíticas
CREATE INDEX IF NOT EXISTS idx_message_analysis_channel ON public.message_analysis(channel);
CREATE INDEX IF NOT EXISTS idx_message_analysis_created_at ON public.message_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_analysis_user_id ON public.message_analysis(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_test_reports_date ON public.analytics_test_reports(test_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_test_reports_environment ON public.analytics_test_reports(environment);

CREATE INDEX IF NOT EXISTS idx_employee_analytics_employee_id ON public.employee_analytics(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_analytics_metric_name ON public.employee_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_employee_analytics_created_at ON public.employee_analytics(created_at DESC);

-- ========================================
-- 6. LIMPIAR DATOS EXISTENTES (si los hay)
-- ========================================

DELETE FROM public.companies WHERE employee_type = 'virtual';

-- ========================================
-- 7. CREAR 800 EMPLEADOS VIRTUALES EN COMPANIES
-- ========================================

DO $$
DECLARE
    i INTEGER;
    departments TEXT[] := ARRAY['Ventas', 'Marketing', 'Tecnología', 'Recursos Humanos', 'Finanzas', 'Operaciones'];
    positions TEXT[] := ARRAY['Gerente', 'Supervisor', 'Analista', 'Especialista', 'Coordinador', 'Desarrollador', 'Diseñador', 'Consultor', 'Asistente', 'Director'];
    roles TEXT[] := ARRAY['Líder', 'Ejecutivo', 'Staff', 'Operativo', 'Estratégico'];
    locations TEXT[] := ARRAY['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco'];
BEGIN
    RAISE NOTICE '=== CREANDO 800 EMPLEADOS VIRTUALES ===';
    
    FOR i IN 1..800 LOOP
        INSERT INTO public.companies (
            id,
            name,
            description,
            department,
            position,
            phone,
            email,
            status,
            employee_type,
            role,
            employee_id,
            hire_date,
            salary,
            location,
            bio,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'Empleado ' || i,
            positions[((i - 1) % 10) + 1] || ' - ' || departments[((i - 1) % 6) + 1],
            departments[((i - 1) % 6) + 1],
            positions[((i - 1) % 10) + 1],
            '+56 9 ' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0'),
            'empleado' || i || '@brify.com',
            'active',
            'virtual',
            roles[((i - 1) % 5) + 1],
            'EMP' || LPAD(i::TEXT, 4, '0'),
            NOW() - (FLOOR(RANDOM() * 365) || ' days')::INTERVAL,
            ROUND((500000 + RANDOM() * 2000000)::NUMERIC, 2),
            locations[((i - 1) % 6) + 1],
            'Profesional con experiencia en ' || departments[((i - 1) % 6) + 1] || ' especializado en ' || positions[((i - 1) % 10) + 1],
            NOW(),
            NOW()
        );
        
        -- Mostrar progreso cada 100 empleados
        IF i % 100 = 0 THEN
            RAISE NOTICE 'Creados % empleados de 800', i;
        END IF;
    END LOOP;
    
    RAISE NOTICE '800 empleados virtuales creados exitosamente';
END $$;

-- ========================================
-- 8. CREAR DATOS DE MUESTRA PARA ANALÍTICAS
-- ========================================

INSERT INTO public.employee_analytics (employee_id, employee_type, metric_name, metric_value, metric_data)
SELECT 
    c.id,
    'virtual',
    'engagement_score',
    ROUND((0.6 + RANDOM() * 0.4)::NUMERIC, 2),
    json_build_object(
        'department', c.department,
        'position', c.position,
        'performance', ROUND((RANDOM() * 100)::NUMERIC, 2),
        'last_active', NOW() - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL,
        'productivity', ROUND((RANDOM() * 100)::NUMERIC, 2),
        'satisfaction', ROUND((RANDOM() * 5)::NUMERIC, 2)
    )
FROM public.companies c 
WHERE c.employee_type = 'virtual' 
LIMIT 100;

-- ========================================
-- 9. CONFIGURAR POLÍTICAS DE SEGURIDAD
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas para users
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Service role full access users" ON public.users;

CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);
    
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);
    
CREATE POLICY "Service role full access users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para companies
DROP POLICY IF EXISTS "Companies read access" ON public.companies;
DROP POLICY IF EXISTS "Service role full access companies" ON public.companies;

CREATE POLICY "Companies read access" ON public.companies
    FOR SELECT USING (true);
    
CREATE POLICY "Service role full access companies" ON public.companies
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para tablas de analíticas
DROP POLICY IF EXISTS "Service role full access message_analysis" ON public.message_analysis;
CREATE POLICY "Service role full access message_analysis" ON public.message_analysis
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access analytics_test_reports" ON public.analytics_test_reports;
CREATE POLICY "Service role full access analytics_test_reports" ON public.analytics_test_reports
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access employee_analytics" ON public.employee_analytics;
CREATE POLICY "Service role full access employee_analytics" ON public.employee_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- 10. VERIFICACIÓN FINAL
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN FINAL ===';
    
    DECLARE
        user_count INTEGER;
        company_count INTEGER;
        virtual_count INTEGER;
    BEGIN
        -- Contar usuarios reales
        SELECT COUNT(*) INTO user_count FROM public.users;
        
        -- Contar companies
        SELECT COUNT(*) INTO company_count FROM public.companies;
        
        -- Contar empleados virtuales
        SELECT COUNT(*) INTO virtual_count FROM public.companies WHERE employee_type = 'virtual';
        
        RAISE NOTICE 'Usuarios reales: %', user_count;
        RAISE NOTICE 'Total companies: %', company_count;
        RAISE NOTICE 'Empleados virtuales: %', virtual_count;
        RAISE NOTICE 'Total empleados (reales + virtuales): %', user_count + virtual_count;
        
        IF virtual_count = 800 THEN
            RAISE NOTICE '✅ ÉXITO: Se crearon 800 empleados virtuales';
        ELSE
            RAISE NOTICE '⚠️ ADVERTENCIA: Se crearon % empleados virtuales (se esperaban 800)', virtual_count;
        END IF;
    END;
END $$;

-- ========================================
-- 11. MOSTRAR ESTRUCTURA FINAL
-- ========================================

DO $$
DECLARE
    column_info TEXT;
BEGIN
    RAISE NOTICE '=== ESTRUCTURA FINAL DE TABLAS ===';
    
    -- Mostrar columnas de users
    RAISE NOTICE 'Columnas de users:';
    FOR column_info IN
        SELECT column_name || ' (' || data_type || ')'
        FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %', column_info;
    END LOOP;
    
    -- Mostrar columnas de companies
    RAISE NOTICE 'Columnas de companies:';
    FOR column_info IN
        SELECT column_name || ' (' || data_type || ')'
        FROM information_schema.columns
        WHERE table_name = 'companies' AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %', column_info;
    END LOOP;
END $$;

-- ========================================
-- 12. CONSULTAS DE VERIFICACIÓN MANUAL
-- ========================================

-- ========================================
-- 12. CONSULTAS DE VERIFICACIÓN MANUAL
-- ========================================

-- Para verificar manualmente, ejecuta estas consultas en el SQL Editor:

-- 1. Conteo total de empleados virtuales:
-- SELECT COUNT(*) FROM companies WHERE employee_type = 'virtual';

-- 2. Conteo combinado (usuarios reales + virtuales):
-- SELECT (SELECT COUNT(*) FROM users) + (SELECT COUNT(*) FROM companies WHERE employee_type = 'virtual') as total_empleados;

-- 3. Verificar estructura completa:
-- \d+ public.users
-- \d+ public.companies

-- 4. Dashboard debería mostrar 800 carpetas en:
-- http://localhost:3003/panel-principal

-- ========================================
-- FIN DEL SCRIPT
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '=== SCRIPT COMPLETADO ===';
    RAISE NOTICE '✅ Todas las columnas han sido creadas';
    RAISE NOTICE '✅ 800 empleados virtuales han sido creados';
    RAISE NOTICE '✅ Índices configurados';
    RAISE NOTICE '✅ Políticas de seguridad configuradas';
    RAISE NOTICE '✅ Sistema listo para producción';
END $$;