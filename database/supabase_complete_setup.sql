-- ========================================
-- SCRIPT COMPLETO PARA SUPABASE
-- Configuración definitiva para 800 empleados y analíticas
-- ========================================
-- Ejecutar en: https://supabase.com/dashboard/project/tmqglnycivlcjijoymwe.supabase.co/sql
-- ========================================

-- 1. PRIMERO: Deshabilitar RLS temporalmente para poder modificar
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- 2. AGREGAR COLUMNAS FALTANTES A LA TABLA USERS
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS position VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 3. AGREGAR COLUMNA DESCRIPTION A COMPANIES
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 4. AGREGAR COLUMNA METADATA A USER_TOKENS_USAGE
ALTER TABLE public.user_tokens_usage 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 5. CREAR TABLA MESSAGE_ANALYSIS
CREATE TABLE IF NOT EXISTS public.message_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_message TEXT NOT NULL,
    optimized_message TEXT,
    channel VARCHAR(50) NOT NULL,
    engagement_prediction JSONB,
    optimal_timing JSONB,
    optimizations JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREAR TABLA ANALYTICS_TEST_REPORTS
CREATE TABLE IF NOT EXISTS public.analytics_test_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_data JSONB NOT NULL,
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    environment VARCHAR(20) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    employee_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_users_position ON public.users(position);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_registered_via ON public.users(registered_via);

-- Índices para message_analysis
CREATE INDEX IF NOT EXISTS idx_message_analysis_channel ON public.message_analysis(channel);
CREATE INDEX IF NOT EXISTS idx_message_analysis_created_at ON public.message_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_analysis_user_id ON public.message_analysis(user_id);

-- Índices para analytics_test_reports
CREATE INDEX IF NOT EXISTS idx_analytics_test_reports_date ON public.analytics_test_reports(test_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_test_reports_environment ON public.analytics_test_reports(environment);

-- Índices para user_tokens_usage
CREATE INDEX IF NOT EXISTS idx_user_tokens_usage_metadata ON public.user_tokens_usage USING GIN(metadata);

-- 8. ACTUALIZAR USUARIO EXISTENTE CON VALORES POR DEFECTO
UPDATE public.users 
SET 
    department = COALESCE(department, 'Administración'),
    position = COALESCE(position, 'Administrador'),
    phone = COALESCE(phone, '+56 9 12345678'),
    status = COALESCE(status, 'active')
WHERE department IS NULL OR position IS NULL OR phone IS NULL OR status IS NULL;

-- 9. CREAR 799 EMPLEADOS ADICIONALES (para llegar a 800)
-- Primero verificamos cuántos hay
DO $$
DECLARE
    current_count INTEGER;
    employees_to_create INTEGER;
    i INTEGER;
    departments TEXT[] := ARRAY['Ventas', 'Marketing', 'Tecnología', 'Recursos Humanos', 'Finanzas', 'Operaciones'];
    positions TEXT[] := ARRAY['Gerente', 'Supervisor', 'Analista', 'Especialista', 'Coordinador', 'Desarrollador', 'Diseñador', 'Consultor', 'Asistente', 'Director'];
BEGIN
    -- Contar empleados actuales
    SELECT COUNT(*) INTO current_count FROM public.users;
    
    -- Calcular cuántos crear
    employees_to_create := 800 - current_count;
    
    IF employees_to_create > 0 THEN
        RAISE NOTICE 'Creando % empleados adicionales...', employees_to_create;
        
        FOR i IN 1..employees_to_create LOOP
            INSERT INTO public.users (
                id,
                email,
                full_name,
                name,
                department,
                position,
                phone,
                status,
                is_active,
                registered_via,
                admin,
                onboarding_status,
                registro_previo,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                'empleado' || (current_count + i) || '@brify.com',
                'Empleado ' || (current_count + i),
                'Empleado ' || (current_count + i),
                departments[((current_count + i - 1) % 6) + 1],
                positions[((current_count + i - 1) % 10) + 1],
                '+56 9 ' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0'),
                'active',
                true,
                'system',
                false,
                'completed',
                false,
                NOW(),
                NOW()
            );
        END LOOP;
        
        RAISE NOTICE 'Se crearon % empleados exitosamente', employees_to_create;
    ELSE
        RAISE NOTICE 'Ya hay suficientes empleados (%), no se necesitan crear más', current_count;
    END IF;
END $$;

-- 10. CREAR DATOS DE MUESTRA PARA ANALÍTICAS
INSERT INTO public.message_analysis (original_message, optimized_message, channel, engagement_prediction, optimal_timing, optimizations)
VALUES 
    ('Recordatorio de reunión importante', '📅 Recordatorio: Tienes una reunión importante hoy a las 15:00. Por favor confirma tu asistencia.', 'email', 
     '{"score": 0.85, "confidence": 0.9, "prediction": "high", "factors": {"messageLength": 0.8, "timeOfDay": 0.9, "channel": 0.7, "recipientCount": 0.6}}',
     '{"optimalSlots": ["09:00", "14:00", "16:00"], "currentScore": 0.8, "recommendations": ["Enviar en horario laboral", "Personalizar mensaje"]}',
     '["tone_optimization", "clarity_optimization", "personalization"]'),
    
    ('Nuevo proyecto disponible', '🚀 ¡Nuevo proyecto disponible! Revisa los detalles y postula antes del viernes. ¡No te lo pierdas!', 'whatsapp',
     '{"score": 0.92, "confidence": 0.85, "prediction": "high", "factors": {"messageLength": 0.9, "timeOfDay": 0.8, "channel": 0.95, "recipientCount": 0.7}}',
     '{"optimalSlots": ["10:00", "15:00", "18:00"], "currentScore": 0.85, "recommendations": ["Usar emojis", "Crear urgencia"]}',
     '["tone_optimization", "urgency_optimization", "personalization"]'),
    
    ('Actualización de sistema', '⚙️ Actualización del sistema completada. Todo funciona correctamente. Gracias por tu paciencia.', 'slack',
     '{"score": 0.75, "confidence": 0.8, "prediction": "medium", "factors": {"messageLength": 0.7, "timeOfDay": 0.8, "channel": 0.8, "recipientCount": 0.5}}',
     '{"optimalSlots": ["08:00", "12:00", "17:00"], "currentScore": 0.7, "recommendations": ["Ser conciso", "Informar claramente"]}',
     '["clarity_optimization", "timing_optimization"]');

-- 11. CONFIGURAR POLÍTICAS DE SEGURIDAD (RLS)
-- Rehabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Configurar RLS para message_analysis
ALTER TABLE public.message_analysis ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own message analysis" ON public.message_analysis;
DROP POLICY IF EXISTS "Users can insert their own message analysis" ON public.message_analysis;
DROP POLICY IF EXISTS "Users can update their own message analysis" ON public.message_analysis;
DROP POLICY IF EXISTS "Service role can manage all message analysis" ON public.message_analysis;

-- Crear nuevas políticas
CREATE POLICY "Users can view their own message analysis" ON public.message_analysis
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own message analysis" ON public.message_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own message analysis" ON public.message_analysis
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Service role can manage all message analysis" ON public.message_analysis
    FOR ALL USING (auth.role() = 'service_role');

-- Configurar RLS para analytics_test_reports
ALTER TABLE public.analytics_test_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage analytics test reports" ON public.analytics_test_reports;
CREATE POLICY "Service role can manage analytics test reports" ON public.analytics_test_reports
    FOR ALL USING (auth.role() = 'service_role');

-- 12. VERIFICACIÓN FINAL
-- Mostrar conteo final de usuarios
SELECT 
    'USERS' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN registered_via = 'system' THEN 1 END) as system_users,
    COUNT(CASE WHEN department IS NOT NULL THEN 1 END) as with_department
FROM public.users

UNION ALL

SELECT 
    'MESSAGE_ANALYSIS' as table_name,
    COUNT(*) as total_count,
    0 as system_users,
    0 as with_department
FROM public.message_analysis

UNION ALL

SELECT 
    'ANALYTICS_TEST_REPORTS' as table_name,
    COUNT(*) as total_count,
    0 as system_users,
    0 as with_department
FROM public.analytics_test_reports;

-- 13. MOSTRAR ESTRUCTURA DE TABLAS
-- Comentar estas líneas si no quieres ver la estructura completa
-- \d+ public.users
-- \d+ public.companies
-- \d+ public.message_analysis
-- \d+ public.analytics_test_reports
-- \d+ public.user_tokens_usage

-- ========================================
-- VERIFICACIÓN MANUAL
-- ========================================
-- Después de ejecutar este script, verifica:

-- 1. Conteo de empleados:
-- SELECT COUNT(*) FROM users; -- Debe ser 800

-- 2. Estructura de users:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'users' AND table_schema = 'public' 
-- ORDER BY ordinal_position;

-- 3. Datos de muestra:
-- SELECT * FROM message_analysis LIMIT 3;

-- 4. Dashboard en: http://localhost:3003/panel-principal
--    Debe mostrar 800 carpetas

-- ========================================
-- LISTO PARA EJECUTAR EL SCRIPT NODE
-- ========================================
-- Después de ejecutar este SQL, ejecuta:
-- node scripts/final-800-solution.js