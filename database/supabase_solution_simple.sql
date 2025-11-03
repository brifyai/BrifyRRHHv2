-- ========================================
-- SOLUCIÓN SIMPLE PARA 800 EMPLEADOS
-- Sin requerir auth.users - Usa tabla companies
-- ========================================
-- Ejecutar en: https://supabase.com/dashboard/project/tmqglnycivlcjijoymwe.supabase.co/sql
-- ========================================

-- 1. AGREGAR COLUMNAS A COMPANIES (si no existen)
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS position VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS employee_type VARCHAR(20) DEFAULT 'virtual';

-- 2. CREAR ÍNDICES PARA COMPANIES
CREATE INDEX IF NOT EXISTS idx_companies_department ON public.companies(department);
CREATE INDEX IF NOT EXISTS idx_companies_position ON public.companies(position);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_employee_type ON public.companies(employee_type);

-- 3. LIMPIAR EMPLEADOS VIRTUALES EXISTENTES (si hay)
DELETE FROM public.companies WHERE employee_type = 'virtual';

-- 4. CREAR 800 EMPLEADOS VIRTUALES EN COMPANIES
DO $$
DECLARE
    i INTEGER;
    departments TEXT[] := ARRAY['Ventas', 'Marketing', 'Tecnología', 'Recursos Humanos', 'Finanzas', 'Operaciones'];
    positions TEXT[] := ARRAY['Gerente', 'Supervisor', 'Analista', 'Especialista', 'Coordinador', 'Desarrollador', 'Diseñador', 'Consultor', 'Asistente', 'Director'];
BEGIN
    RAISE NOTICE 'Creando 800 empleados virtuales en companies...';
    
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
            NOW(),
            NOW()
        );
    END LOOP;
    
    RAISE NOTICE '800 empleados virtuales creados exitosamente';
END $$;

-- 5. CREAR TABLA PARA ANALÍTICAS SIMPLES
CREATE TABLE IF NOT EXISTS public.employee_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.companies(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC,
    metric_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_analytics_employee_id ON public.employee_analytics(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_analytics_metric_name ON public.employee_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_employee_analytics_created_at ON public.employee_analytics(created_at DESC);

-- 6. CREAR DATOS DE MUESTRA PARA ANALÍTICAS
INSERT INTO public.employee_analytics (employee_id, metric_name, metric_value, metric_data)
SELECT 
    c.id,
    'engagement_score',
    0.7 + (RANDOM() * 0.3),
    json_build_object(
        'department', c.department,
        'position', c.position,
        'performance', RANDOM() * 100,
        'last_active', NOW() - (RANDOM() * 30 || ' days')::INTERVAL
    )
FROM public.companies c 
WHERE c.employee_type = 'virtual' 
LIMIT 50;

-- 7. VERIFICACIÓN FINAL
SELECT 
    'COMPANIES (EMPLEADOS VIRTUALES)' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN employee_type = 'virtual' THEN 1 END) as virtual_employees,
    COUNT(CASE WHEN department IS NOT NULL THEN 1 END) as with_department
FROM public.companies

UNION ALL

SELECT 
    'USERS REALES' as table_name,
    COUNT(*) as total_count,
    0 as virtual_employees,
    0 as with_department
FROM public.users

UNION ALL

SELECT 
    'EMPLOYEE_ANALYTICS' as table_name,
    COUNT(*) as total_count,
    0 as virtual_employees,
    0 as with_department
FROM public.employee_analytics;

-- 8. MOSTRAR ESTRUCTURA
-- \d+ public.companies
-- \d+ public.employee_analytics

-- ========================================
-- VERIFICACIÓN MANUAL
-- ========================================
-- 1. Conteo total:
-- SELECT COUNT(*) FROM companies WHERE employee_type = 'virtual'; -- Debe ser 800

-- 2. Conteo combinado (users + companies):
-- SELECT 
--     (SELECT COUNT(*) FROM users) + 
--     (SELECT COUNT(*) FROM companies WHERE employee_type = 'virtual') as total_empleados;

-- 3. Estructura de companies:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'companies' AND table_schema = 'public' 
-- ORDER BY ordinal_position;

-- ========================================
-- MODIFICACIÓN DEL SERVICIO REQUERIDA
-- ========================================
-- Después de ejecutar este SQL, el servicio debe contar:
-- users + companies (WHERE employee_type = 'virtual')

-- El dashboard debe mostrar 800 carpetas