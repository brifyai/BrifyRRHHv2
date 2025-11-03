-- Crear tabla para análisis de mensajes con IA
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

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_message_analysis_channel ON public.message_analysis(channel);
CREATE INDEX IF NOT EXISTS idx_message_analysis_created_at ON public.message_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_analysis_user_id ON public.message_analysis(user_id);

-- Habilitar Row Level Security
ALTER TABLE public.message_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
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

-- Crear tabla para reportes de testing
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