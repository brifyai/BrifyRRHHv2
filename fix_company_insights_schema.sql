-- Script para corregir la tabla company_insights
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar tabla existente si tiene estructura incorrecta
DROP TABLE IF EXISTS company_insights CASCADE;

-- 2. Crear tabla con estructura correcta
CREATE TABLE company_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  insight_category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  confidence_score DECIMAL(3,2),
  data_source TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_company_insights_company_name ON company_insights(company_name);
CREATE INDEX IF NOT EXISTS idx_company_insights_active ON company_insights(is_active);
CREATE INDEX IF NOT EXISTS idx_company_insights_created_at ON company_insights(created_at DESC);

-- 4. Configurar Row Level Security (RLS)
ALTER TABLE company_insights ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS
DROP POLICY IF EXISTS company_insights_select_policy ON company_insights;
CREATE POLICY company_insights_select_policy ON company_insights
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS company_insights_insert_policy ON company_insights;
CREATE POLICY company_insights_insert_policy ON company_insights
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS company_insights_update_policy ON company_insights;
CREATE POLICY company_insights_update_policy ON company_insights
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Insertar datos de ejemplo para las empresas existentes
INSERT INTO company_insights (company_name, insight_type, insight_category, title, description, confidence_score, data_source) VALUES
('Aguas Andinas', 'front', 'positive', 'Sistema operativo estable', 'La plataforma muestra un rendimiento consistente con baja latencia', 0.85, 'system_monitoring'),
('Aguas Andinas', 'back', 'info', 'Configuración pendiente', 'Configure la API key de Groq para insights con IA avanzada', 0.90, 'system_monitoring'),
('Banco de Chile', 'front', 'warning', 'Atención requerida', 'Se detecta un ligero aumento en los tiempos de respuesta', 0.75, 'performance_monitoring'),
('Banco de Chile', 'back', 'positive', 'Seguridad óptima', 'Los protocolos de seguridad están funcionando correctamente', 0.95, 'security_audit'),
('Copec', 'front', 'info', 'Monitoreo activo', 'El sistema está recopilando datos para análisis de tendencias', 0.80, 'data_collection'),
('Copec', 'back', 'positive', 'Integraciones estables', 'Todas las integraciones externas funcionan correctamente', 0.88, 'integration_check');

-- Confirmación
SELECT 'Tabla company_insights recreada exitosamente' as status, COUNT(*) as registros_insertados FROM company_insights;