-- Configuración completa de la base de datos para soportar 800 empleados y analíticas
-- Ejecutar en Supabase Dashboard → SQL Editor

-- 1. Agregar columnas faltantes a la tabla users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS position VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 2. Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_users_position ON public.users(position);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- 3. Actualizar el usuario existente con valores por defecto
UPDATE public.users 
SET 
    department = 'Administración',
    position = 'Administrador',
    phone = '+56 9 12345678',
    status = 'active'
WHERE department IS NULL;

-- 4. Agregar columna description a la tabla companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 5. Crear tabla message_analysis para analíticas
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

-- Índices para message_analysis
CREATE INDEX IF NOT EXISTS idx_message_analysis_channel ON public.message_analysis(channel);
CREATE INDEX IF NOT EXISTS idx_message_analysis_created_at ON public.message_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_analysis_user_id ON public.message_analysis(user_id);

-- 6. Habilitar Row Level Security para message_analysis
ALTER TABLE public.message_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para message_analysis
DROP POLICY IF EXISTS "Users can view their own message analysis" ON public.message_analysis;
CREATE POLICY "Users can view their own message analysis" ON public.message_analysis
    FOR SELECT USING (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Users can insert their own message analysis" ON public.message_analysis;
CREATE POLICY "Users can insert their own message analysis" ON public.message_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Users can update their own message analysis" ON public.message_analysis;
CREATE POLICY "Users can update their own message analysis" ON public.message_analysis
    FOR UPDATE USING (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Service role can manage all message analysis" ON public.message_analysis;
CREATE POLICY "Service role can manage all message analysis" ON public.message_analysis
    FOR ALL USING (auth.role() = 'service_role');

-- 7. Crear tabla analytics_test_reports para reportes
CREATE TABLE IF NOT EXISTS public.analytics_test_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_data JSONB NOT NULL,
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    environment VARCHAR(20) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    employee_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_test_reports_date ON public.analytics_test_reports(test_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_test_reports_environment ON public.analytics_test_reports(environment);

ALTER TABLE public.analytics_test_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage analytics test reports" ON public.analytics_test_reports;
CREATE POLICY "Service role can manage analytics test reports" ON public.analytics_test_reports
    FOR ALL USING (auth.role() = 'service_role');

-- 8. Agregar columna metadata a user_tokens_usage si no existe
ALTER TABLE public.user_tokens_usage 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 9. Crear índice para metadata en user_tokens_usage
CREATE INDEX IF NOT EXISTS idx_user_tokens_usage_metadata ON public.user_tokens_usage USING GIN(metadata);

-- 10. Verificar que todas las tablas tengan las columnas necesarias
SELECT 
    'users' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'companies' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'companies' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'message_analysis' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'message_analysis' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 11. Conteo final de usuarios
SELECT COUNT(*) as total_users FROM public.users;

-- 12. Mostrar estructura completa
\d+ public.users;
\d+ public.companies;
\d+ public.message_analysis;
\d+ public.analytics_test_reports;
\d+ public.user_tokens_usage;