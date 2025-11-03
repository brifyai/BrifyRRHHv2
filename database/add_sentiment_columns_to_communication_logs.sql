-- Migración para agregar columnas de análisis de sentimientos a la tabla communication_logs
-- Ejecutar en Supabase

ALTER TABLE communication_logs
ADD COLUMN sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
ADD COLUMN sentiment_label VARCHAR(20);