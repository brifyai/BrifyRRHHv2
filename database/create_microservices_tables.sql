-- ============================================
-- TABLAS PARA MICROSERVICIOS DE ANÁLISIS
-- ============================================

-- Tabla para guardar resultados del análisis de empresas
CREATE TABLE IF NOT EXISTS company_insights_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'error', 'cancelled')),
    insights JSONB,
    metrics JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_company_insights_results_company_id ON company_insights_results(company_id);
CREATE INDEX idx_company_insights_results_status ON company_insights_results(status);
CREATE INDEX idx_company_insights_results_user_id ON company_insights_results(user_id);
CREATE INDEX idx_company_insights_results_created_at ON company_insights_results(created_at DESC);

-- Tabla para notificaciones en tiempo real
CREATE TABLE IF NOT EXISTS realtime_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('insights_ready', 'analysis_error', 'processing_started')),
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para notificaciones
CREATE INDEX idx_realtime_notifications_company_id ON realtime_notifications(company_id);
CREATE INDEX idx_realtime_notifications_event_type ON realtime_notifications(event_type);
CREATE INDEX idx_realtime_notifications_created_at ON realtime_notifications(created_at DESC);

-- RLS (Row Level Security) - Habilitar
ALTER TABLE company_insights_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para company_insights_results
CREATE POLICY "Usuarios pueden ver sus propios resultados" ON company_insights_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar resultados" ON company_insights_results
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar sus resultados" ON company_insights_results
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de seguridad para realtime_notifications
CREATE POLICY "Usuarios pueden ver notificaciones de sus empresas" ON realtime_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.id = realtime_notifications.company_id 
            AND companies.user_id = auth.uid()
        )
    );

CREATE POLICY "Sistema puede insertar notificaciones" ON realtime_notifications
    FOR INSERT WITH CHECK (true);

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-actualizar updated_at
CREATE TRIGGER update_company_insights_results_updated_at
    BEFORE UPDATE ON company_insights_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar resultados antiguos (mayores a 30 días)
CREATE OR REPLACE FUNCTION cleanup_old_insights_results()
RETURNS void AS $$
BEGIN
    DELETE FROM company_insights_results 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON TABLE company_insights_results IS 'Almacena resultados de análisis de empresas generados por microservicios';
COMMENT ON TABLE realtime_notifications IS 'Almacena notificaciones en tiempo real para WebSockets y webhooks';