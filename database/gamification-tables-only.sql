-- ========================================
-- SISTEMA DE GAMIFICACIÓN - WEBCOMIFY
-- ========================================
-- Ejecutar este SQL directamente en el editor SQL de Supabase
-- URL: https://app.supabase.com/project/tmqglnycivlcjijoymwe/sql

-- 1. TABLA DE NIVELES DE GAMIFICACIÓN
CREATE TABLE IF NOT EXISTS gamification_levels (
  id SERIAL PRIMARY KEY,
  level_number INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  min_points INTEGER DEFAULT 0,
  badge_icon VARCHAR(50),
  badge_color VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABLA DE LOGROS
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  points_reward INTEGER DEFAULT 0,
  badge_icon VARCHAR(50),
  badge_color VARCHAR(20),
  conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. TABLA DE GAMIFICACIÓN DE EMPLEADOS
CREATE TABLE IF NOT EXISTS employee_gamification (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  employee_id VARCHAR(255) NOT NULL,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0.00,
  achievements_unlocked INTEGER[] DEFAULT '{}',
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, employee_id)
);

-- 4. TABLA DE HISTORIAL DE PUNTOS
CREATE TABLE IF NOT EXISTS points_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  employee_id VARCHAR(255) NOT NULL,
  points INTEGER NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_id VARCHAR(255),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. TABLA DE LEADERBOARDS
CREATE TABLE IF NOT EXISTS leaderboards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- weekly, monthly, all_time
  category VARCHAR(20) NOT NULL, -- points, level, achievements
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. TABLA DE ENTRADAS DE LEADERBOARD
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id SERIAL PRIMARY KEY,
  leaderboard_id INTEGER REFERENCES leaderboards(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  employee_id VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. TABLA DE RECOMPENSAS
CREATE TABLE IF NOT EXISTS rewards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cost_points INTEGER NOT NULL,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  availability_limit INTEGER,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. TABLA DE RECOMPENSAS CANJEADAS
CREATE TABLE IF NOT EXISTS redeemed_rewards (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  employee_id VARCHAR(255) NOT NULL,
  reward_id INTEGER REFERENCES rewards(id),
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  redeemed_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- 9. TABLA DE PREDICCIONES DE ENGAGEMENT
CREATE TABLE IF NOT EXISTS engagement_predictions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  employee_id VARCHAR(255) NOT NULL,
  prediction_date DATE NOT NULL,
  predicted_engagement_score DECIMAL(5,2) NOT NULL,
  confidence_level DECIMAL(5,2) NOT NULL,
  risk_level VARCHAR(20) NOT NULL, -- low, medium, high, critical
  factors JSONB,
  recommendations TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. TABLA DE EVENTOS DE GAMIFICACIÓN
CREATE TABLE IF NOT EXISTS gamification_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  employee_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. TABLA DE NOTIFICACIONES DE GAMIFICACIÓN
CREATE TABLE IF NOT EXISTS gamification_notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  notification_data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- INSERCIÓN DE DATOS INICIALES
-- ========================================

-- Insertar niveles de gamificación
INSERT INTO gamification_levels (level_number, name, description, min_points, badge_icon, badge_color) VALUES
(1, 'Principiante', 'Nivel inicial', 0, '🌟', '#10b981'),
(2, 'Novato', 'Estás aprendiendo', 100, '🌱', '#3b82f6'),
(3, 'Intermedio', 'Buen progreso', 250, '🚀', '#8b5cf6'),
(4, 'Avanzado', 'Excelente desempeño', 500, '🔥', '#f59e0b'),
(5, 'Experto', 'Maestro de la comunicación', 1000, '👑', '#ef4444')
ON CONFLICT (level_number) DO NOTHING;

-- Insertar logros básicos
INSERT INTO achievements (name, description, points_reward, badge_icon, badge_color, conditions, is_active) VALUES
('Primer Mensaje', 'Envía tu primer mensaje', 10, '💬', '#3b82f6', '{"min_points": 0, "activity_types": {"message_sent": 1}}', true),
('Comunicador Activo', 'Envía 10 mensajes', 50, '📢', '#10b981', '{"min_points": 0, "activity_types": {"message_sent": 10}}', true),
('Coleccionista', 'Alcanza 100 puntos', 25, '💎', '#8b5cf6', '{"min_points": 100}', true),
('Semana Perfecta', 'Mantén racha de 7 días', 100, '🏆', '#f59e0b', '{"min_streak": 7}', true),
('Explorador', 'Usa 5 templates diferentes', 30, '🔍', '#06b6d4', '{"min_points": 0, "activity_types": {"template_used": 5}}', true),
('Colaborador', 'Sube 10 archivos', 75, '📁', '#84cc16', '{"min_points": 0, "activity_types": {"file_uploaded": 10}}', true)
ON CONFLICT DO NOTHING;

-- Insertar leaderboard semanal
INSERT INTO leaderboards (name, description, type, category, is_active, start_date, end_date) VALUES
('Leaderboard Semanal', 'Clasificación de la semana', 'weekly', 'points', true, NOW(), NOW() + INTERVAL '7 days'),
('Leaderboard Mensual', 'Clasificación del mes', 'monthly', 'points', true, NOW(), NOW() + INTERVAL '30 days'),
('Leaderboard de Todos los Tiempos', 'Mejores puntajes históricos', 'all_time', 'points', true, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Insertar recompensas básicas
INSERT INTO rewards (name, description, cost_points, category, is_active, availability_limit) VALUES
('Café Gratis', 'Canjea por un café gratis en la oficina', 50, 'food', true, NULL),
('Hora Extra Libre', '1 hora adicional de tiempo libre', 200, 'time', true, 10),
('Gift Card $10', 'Gift card de $10 para compras', 150, 'shopping', true, 20),
('Día de Home Office', 'Trabaja desde casa por un día', 300, 'benefit', true, 5),
('Certificado de Reconocimiento', 'Certificado por excelente desempeño', 100, 'recognition', true, NULL),
('Bonus de Puntos Extra', '50 puntos adicionales para tu cuenta', 75, 'points', true, NULL)
ON CONFLICT DO NOTHING;

-- ========================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================

CREATE INDEX IF NOT EXISTS idx_employee_gamification_user_employee ON employee_gamification(user_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_gamification_points ON employee_gamification(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_points_history_user_employee ON points_history(user_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_history_activity_type ON points_history(activity_type);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON achievements(is_active);
CREATE INDEX IF NOT EXISTS idx_leaderboards_active ON leaderboards(is_active);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_leaderboard ON leaderboard_entries(leaderboard_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score ON leaderboard_entries(score DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_redeemed_rewards_user ON redeemed_rewards(user_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_engagement_predictions_user ON engagement_predictions(user_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_engagement_predictions_date ON engagement_predictions(prediction_date);
CREATE INDEX IF NOT EXISTS idx_gamification_events_user ON gamification_events(user_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_gamification_notifications_user ON gamification_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_notifications_read ON gamification_notifications(read);

-- ========================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE gamification_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE redeemed_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para gamification_levels (lectura pública)
CREATE POLICY "Gamification levels public read" ON gamification_levels
    FOR SELECT USING (true);

-- Políticas para achievements (lectura pública)
CREATE POLICY "Achievements public read" ON achievements
    FOR SELECT USING (is_active = true);

-- Políticas para employee_gamification (usuarios pueden ver y modificar sus propios datos)
CREATE POLICY "Users can view own gamification" ON employee_gamification
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own gamification" ON employee_gamification
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own gamification" ON employee_gamification
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Políticas para points_history (usuarios pueden ver su propio historial)
CREATE POLICY "Users can view own points history" ON points_history
    FOR SELECT USING (auth.uid()::text = user_id);

-- Políticas para leaderboards (lectura pública)
CREATE POLICY "Leaderboards public read" ON leaderboards
    FOR SELECT USING (is_active = true);

-- Políticas para leaderboard_entries (lectura pública)
CREATE POLICY "Leaderboard entries public read" ON leaderboard_entries
    FOR SELECT USING (true);

-- Políticas para rewards (lectura pública de recompensas activas)
CREATE POLICY "Rewards public read active" ON rewards
    FOR SELECT USING (is_active = true);

-- Políticas para redeemed_rewards (usuarios pueden ver sus propias redenciones)
CREATE POLICY "Users can view own redeemed rewards" ON redeemed_rewards
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own redeemed rewards" ON redeemed_rewards
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Políticas para engagement_predictions (usuarios pueden ver sus propias predicciones)
CREATE POLICY "Users can view own predictions" ON engagement_predictions
    FOR SELECT USING (auth.uid()::text = user_id);

-- Políticas para gamification_events (usuarios pueden ver sus propios eventos)
CREATE POLICY "Users can view own events" ON gamification_events
    FOR SELECT USING (auth.uid()::text = user_id);

-- Políticas para gamification_notifications (usuarios pueden ver y gestionar sus notificaciones)
CREATE POLICY "Users can view own notifications" ON gamification_notifications
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own notifications" ON gamification_notifications
    FOR UPDATE USING (auth.uid()::text = user_id);

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Función para actualizar puntos de gamificación
CREATE OR REPLACE FUNCTION update_employee_gamification(
    p_user_id TEXT,
    p_employee_id TEXT,
    p_points INTEGER,
    p_activity_type TEXT,
    p_activity_id TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_gamification_id UUID;
    v_new_level INTEGER;
    v_points_needed INTEGER;
BEGIN
    -- Insertar en historial de puntos
    INSERT INTO points_history (user_id, employee_id, points, activity_type, activity_id, description, metadata)
    VALUES (p_user_id, p_employee_id, p_points, p_activity_type, p_activity_id, p_description, p_metadata)
    RETURNING id INTO v_gamification_id;
    
    -- Actualizar o insertar gamificación del empleado
    INSERT INTO employee_gamification (user_id, employee_id, total_points, last_activity)
    VALUES (p_user_id, p_employee_id, p_points, NOW())
    ON CONFLICT (user_id, employee_id)
    DO UPDATE SET
        total_points = employee_gamification.total_points + p_points,
        last_activity = NOW(),
        updated_at = NOW()
    RETURNING id INTO v_gamification_id;
    
    -- Determinar nuevo nivel basado en puntos totales
    SELECT level_number INTO v_new_level
    FROM gamification_levels
    WHERE min_points <= (
        SELECT total_points FROM employee_gamification
        WHERE user_id = p_user_id AND employee_id = p_employee_id
    )
    ORDER BY min_points DESC
    LIMIT 1;
    
    -- Actualizar nivel si es necesario
    UPDATE employee_gamification
    SET current_level = COALESCE(v_new_level, 1), updated_at = NOW()
    WHERE user_id = p_user_id AND employee_id = p_employee_id;
    
    RETURN v_gamification_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar racha de actividad
CREATE OR REPLACE FUNCTION update_activity_streak(
    p_user_id TEXT,
    p_employee_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_last_activity TIMESTAMP;
    v_current_streak INTEGER;
    v_days_since_last_activity INTEGER;
BEGIN
    -- Obtener última actividad y racha actual
    SELECT last_activity, streak_days INTO v_last_activity, v_current_streak
    FROM employee_gamification
    WHERE user_id = p_user_id AND employee_id = p_employee_id;
    
    -- Si no hay registro anterior, iniciar racha en 1
    IF v_last_activity IS NULL THEN
        UPDATE employee_gamification
        SET streak_days = 1, last_activity = NOW(), updated_at = NOW()
        WHERE user_id = p_user_id AND employee_id = p_employee_id;
        RETURN true;
    END IF;
    
    -- Calcular días desde última actividad
    v_days_since_last_activity := EXTRACT(DAYS FROM (NOW() - v_last_activity));
    
    -- Si la última actividad fue ayer, incrementar racha
    IF v_days_since_last_activity = 1 THEN
        UPDATE employee_gamification
        SET streak_days = v_current_streak + 1, last_activity = NOW(), updated_at = NOW()
        WHERE user_id = p_user_id AND employee_id = p_employee_id;
        RETURN true;
    -- Si la última actividad fue hoy, solo actualizar timestamp
    ELSIF v_days_since_last_activity = 0 THEN
        UPDATE employee_gamification
        SET last_activity = NOW(), updated_at = NOW()
        WHERE user_id = p_user_id AND employee_id = p_employee_id;
        RETURN true;
    -- Si han pasado más días, reiniciar racha
    ELSE
        UPDATE employee_gamification
        SET streak_days = 1, last_activity = NOW(), updated_at = NOW()
        WHERE user_id = p_user_id AND employee_id = p_employee_id;
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- DISPARADORES (TRIGGERS)
-- ========================================

-- Trigger para actualizar timestamp updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas que tienen updated_at
CREATE TRIGGER set_gamification_levels_timestamp
    BEFORE UPDATE ON gamification_levels
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_achievements_timestamp
    BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_employee_gamification_timestamp
    BEFORE UPDATE ON employee_gamification
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_leaderboards_timestamp
    BEFORE UPDATE ON leaderboards
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_leaderboard_entries_timestamp
    BEFORE UPDATE ON leaderboard_entries
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_rewards_timestamp
    BEFORE UPDATE ON rewards
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ========================================
-- COMPLETADO
-- ========================================

-- El sistema de gamificación está listo para usar
-- Las tablas han sido creadas con datos iniciales
-- Los índices están configurados para óptimo rendimiento
-- Las políticas RLS están configuradas para seguridad
-- Las funciones y disparadores están listos para uso