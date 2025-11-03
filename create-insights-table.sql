-- Crear tabla para almacenar insights de análisis de tendencias
CREATE TABLE IF NOT EXISTS company_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('front', 'back')),
  insight_category TEXT NOT NULL CHECK (insight_category IN ('positive', 'negative', 'warning', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_source TEXT DEFAULT 'ai_analysis',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  is_active BOOLEAN DEFAULT true
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_company_insights_company_id ON company_insights(company_id);
CREATE INDEX idx_company_insights_company_name ON company_insights(company_name);
CREATE INDEX idx_company_insights_type ON company_insights(insight_type);
CREATE INDEX idx_company_insights_category ON company_insights(insight_category);
CREATE INDEX idx_company_insights_expires_at ON company_insights(expires_at);
CREATE INDEX idx_company_insights_active ON company_insights(is_active);

-- Crear tabla para métricas de empresas
CREATE TABLE IF NOT EXISTS company_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  employee_count INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  sent_messages INTEGER DEFAULT 0,
  read_messages INTEGER DEFAULT 0,
  scheduled_messages INTEGER DEFAULT 0,
  draft_messages INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  delivery_rate DECIMAL(5,2) DEFAULT 0,
  sentiment_score DECIMAL(3,2) DEFAULT 0 CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  most_active_hour INTEGER DEFAULT 9 CHECK (most_active_hour >= 0 AND most_active_hour <= 23),
  most_active_day INTEGER DEFAULT 1 CHECK (most_active_day >= 0 AND most_active_day <= 6),
  preferred_channel TEXT DEFAULT 'whatsapp',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para métricas
CREATE INDEX idx_company_metrics_company_id ON company_metrics(company_id);
CREATE INDEX idx_company_metrics_company_name ON company_metrics(company_name);

-- Función para limpiar insights expirados automáticamente
CREATE OR REPLACE FUNCTION cleanup_expired_insights()
RETURNS void AS $$
BEGIN
  UPDATE company_insights 
  SET is_active = false 
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a ambas tablas
CREATE TRIGGER update_company_insights_updated_at
  BEFORE UPDATE ON company_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_metrics_updated_at
  BEFORE UPDATE ON company_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Programar limpieza automática (si el soporte de pg_cron está disponible)
-- SELECT cron.schedule('cleanup-expired-insights', '0 2 * * *', 'SELECT cleanup_expired_insights();');

-- Insertar datos iniciales de ejemplo (opcional)
INSERT INTO company_insights (company_name, insight_type, insight_category, title, description, confidence_score)
VALUES 
  ('StaffHub', 'front', 'info', 'Sistema Inicializado', 'El sistema de análisis de tendencias ha sido inicializado correctamente.', 1.0),
  ('StaffHub', 'back', 'info', 'Análisis Preparado', 'El sistema está listo para generar insights basados en datos reales.', 1.0)
ON CONFLICT DO NOTHING;

COMMIT;