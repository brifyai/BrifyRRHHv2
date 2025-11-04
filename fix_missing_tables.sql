-- Crear tabla company_insights si no existe
CREATE TABLE IF NOT EXISTS company_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  insight_category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  confidence_score DECIMAL(3,2),
  data_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_company_insights_company_name ON company_insights(company_name);
CREATE INDEX IF NOT EXISTS idx_company_insights_active ON company_insights(is_active);
CREATE INDEX IF NOT EXISTS idx_company_insights_created_at ON company_insights(created_at DESC);

-- Insertar algunos datos de ejemplo para company_insights
INSERT INTO company_insights (company_name, insight_type, insight_category, title, description, confidence_score, data_source) VALUES
('Corporación Chilena', 'performance', 'engagement', 'Alto engagement detectado', 'Los empleados muestran un nivel de engagement superior al promedio', 0.85, 'internal_survey'),
('Achs', 'productivity', 'communication', 'Mejora en comunicación interna', 'Se observa una mejora del 15% en la comunicación efectiva', 0.78, 'system_metrics'),
('Inchcape', 'retention', 'satisfaction', 'Tasa de retención estable', 'La tasa de retención se mantiene estable en los últimos 3 meses', 0.92, 'hr_analytics'),
('Colbun', 'efficiency', 'operations', 'Optimización de procesos', 'Los procesos operativos han mejorado un 20% en eficiencia', 0.88, 'performance_data'),
('Hogar Alemán', 'engagement', 'training', 'Participación en capacitaciones', 'Aumento del 30% en participación en programas de capacitación', 0.81, 'training_systems'),
('Enaex', 'productivity', 'remote_work', 'Adaptación al trabajo remoto', 'Excelente adaptación al modelo de trabajo remoto/híbrido', 0.89, 'productivity_tools'),
('Copec', 'satisfaction', 'benefits', 'Satisfacción con beneficios', 'Los empleados reportan alta satisfacción con el paquete de beneficios', 0.86, 'employee_surveys'),
('Arcoprime', 'communication', 'collaboration', 'Colaboración interdepartamental', 'Mejora notable en la colaboración entre equipos', 0.83, 'collaboration_metrics'),
('CMPC', 'performance', 'goals', 'Cumplimiento de objetivos', 'Alto cumplimiento de objetivos trimestrales', 0.91, 'performance_reviews'),
('Ariztia', 'engagement', 'culture', 'Cultura organizacional positiva', 'La cultura organizacional es valorada positivamente', 0.87, 'culture_assessments'),
('Grupo Saesa', 'productivity', 'innovation', 'Innovación y mejoras', 'Los empleados contribuyen activamente con ideas de mejora', 0.79, 'innovation_platform'),
('AFP Habitat', 'satisfaction', 'service', 'Calidad del servicio interno', 'El servicio interno es evaluado como excelente', 0.88, 'service_quality'),
('Empresas SB', 'retention', 'development', 'Desarrollo profesional', 'Buenas oportunidades de desarrollo profesional', 0.84, 'career_development'),
('Vida Cámara', 'communication', 'transparency', 'Transparencia en comunicación', 'Alta transparencia en la comunicación corporativa', 0.90, 'communication_audits'),
('SQM', 'engagement', 'wellness', 'Bienestar laboral', 'Programas de bienestar bien evaluados', 0.85, 'wellness_programs'),
('Antofagasta Minerals', 'safety', 'compliance', 'Cumplimiento normativo', 'Excelente cumplimiento de normas de seguridad', 0.94, 'safety_audits')
ON CONFLICT (company_name, insight_type, insight_category) DO NOTHING;

-- Asegurar que RLS (Row Level Security) esté configurado correctamente
ALTER TABLE company_insights ENABLE ROW LEVEL SECURITY;

-- Política RLS para que todos los usuarios autenticados puedan leer
DROP POLICY IF EXISTS company_insights_select_policy ON company_insights;
CREATE POLICY company_insights_select_policy ON company_insights
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política RLS para que los usuarios puedan insertar si tienen rol apropiado
DROP POLICY IF EXISTS company_insights_insert_policy ON company_insights;
CREATE POLICY company_insights_insert_policy ON company_insights
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política RLS para actualizaciones
DROP POLICY IF EXISTS company_insights_update_policy ON company_insights;
CREATE POLICY company_insights_update_policy ON company_insights
  FOR UPDATE USING (auth.role() = 'authenticated');

COMMIT;