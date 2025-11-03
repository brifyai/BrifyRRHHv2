-- ===================================
-- FASE 2: SISTEMA DE GAMIFICACIÓN Y ANÁLISIS PREDICTIVO
-- ===================================

-- 1. Tabla de niveles de gamificación
CREATE TABLE IF NOT EXISTS gamification_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INTEGER NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_points INTEGER NOT NULL,
    max_points INTEGER,
    badge_icon VARCHAR(100),
    badge_color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de logros (achievements)
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100),
    category VARCHAR(50) NOT NULL, -- 'communication', 'engagement', 'learning', 'collaboration'
    points_reward INTEGER NOT NULL DEFAULT 0,
    badge_type VARCHAR(50), -- 'bronze', 'silver', 'gold', 'platinum', 'diamond'
    is_secret BOOLEAN DEFAULT FALSE,
    trigger_condition JSONB, -- Condiciones para desbloquear el logro
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de progreso de empleados en gamificación
CREATE TABLE IF NOT EXISTS employee_gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    current_level_points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0, -- Días consecutivos de actividad
    last_activity_date DATE,
    achievements_unlocked UUID[] DEFAULT '{}', -- Array de IDs de logros desbloqueados
    badges_earned JSONB DEFAULT '{}', -- Insignias ganadas con conteo
    engagement_score DECIMAL(5,2) DEFAULT 0.00, -- Score de engagement (0-100)
    prediction_score DECIMAL(5,2) DEFAULT 0.00, -- Score predictivo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, employee_id)
);

-- 4. Tabla de historial de puntos
CREATE TABLE IF NOT EXISTS points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    points INTEGER NOT NULL, -- Puede ser positivo o negativo
    activity_type VARCHAR(50) NOT NULL, -- 'message_sent', 'message_read', 'achievement_unlocked', etc.
    activity_id UUID, -- Referencia a la actividad específica
    description TEXT,
    metadata JSONB DEFAULT '{}', -- Datos adicionales
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de tablas de clasificación (leaderboards)
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'all_time', 'department'
    category VARCHAR(50) NOT NULL, -- 'points', 'engagement', 'streak'
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de posiciones en leaderboards
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id UUID REFERENCES leaderboards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    score DECIMAL(10,2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(leaderboard_id, user_id, employee_id)
);

-- 7. Tabla de predicciones de engagement
CREATE TABLE IF NOT EXISTS engagement_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    predicted_engagement_score DECIMAL(5,2), -- 0-100
    confidence_level DECIMAL(5,2), -- 0-100
    risk_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    factors JSONB DEFAULT '{}', -- Factores que influyen en la predicción
    recommendations TEXT[], -- Recomendaciones basadas en la predicción
    actual_engagement_score DECIMAL(5,2), -- Score real cuando se conoce
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabla de eventos de gamificación
CREATE TABLE IF NOT EXISTS gamification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'level_up', 'achievement_unlocked', 'streak_milestone'
    event_data JSONB DEFAULT '{}',
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabla de recompensas
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'badge', 'points', 'recognition', 'privilege'
    cost_points INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    availability_limit INTEGER, -- Límite de disponibilidad (null = ilimitado)
    icon VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabla de recompensas canjeadas
CREATE TABLE IF NOT EXISTS redeemed_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
    points_spent INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'delivered', 'expired'
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_employee_gamification_user_id ON employee_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_gamification_employee_id ON employee_gamification(employee_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_employee_id ON points_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_leaderboard_id ON leaderboard_entries(leaderboard_id);
CREATE INDEX IF NOT EXISTS idx_engagement_predictions_user_id ON engagement_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_predictions_prediction_date ON engagement_predictions(prediction_date);
CREATE INDEX IF NOT EXISTS idx_gamification_events_user_id ON gamification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_redeemed_rewards_user_id ON redeemed_rewards(user_id);

-- Row Level Security (RLS)
ALTER TABLE gamification_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE redeemed_rewards ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para gamification_levels (lectura pública para todos los usuarios autenticados)
CREATE POLICY "Users can view gamification levels" ON gamification_levels
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas RLS para achievements (lectura pública para todos los usuarios autenticados)
CREATE POLICY "Users can view achievements" ON achievements
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas RLS para employee_gamification
CREATE POLICY "Users can view own gamification data" ON employee_gamification
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification data" ON employee_gamification
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para points_history
CREATE POLICY "Users can view own points history" ON points_history
    FOR SELECT USING (auth.uid() = user_id);

-- Políticas RLS para leaderboards
CREATE POLICY "Users can view leaderboards" ON leaderboards
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas RLS para leaderboard_entries
CREATE POLICY "Users can view leaderboard entries" ON leaderboard_entries
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas RLS para engagement_predictions
CREATE POLICY "Users can view own engagement predictions" ON engagement_predictions
    FOR SELECT USING (auth.uid() = user_id);

-- Políticas RLS para gamification_events
CREATE POLICY "Users can view own gamification events" ON gamification_events
    FOR SELECT USING (auth.uid() = user_id);

-- Políticas RLS para rewards
CREATE POLICY "Users can view active rewards" ON rewards
    FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Políticas RLS para redeemed_rewards
CREATE POLICY "Users can view own redeemed rewards" ON redeemed_rewards
    FOR SELECT USING (auth.uid() = user_id);

-- Insertar niveles iniciales
INSERT INTO gamification_levels (level_number, name, description, min_points, max_points, badge_icon, badge_color) VALUES
(1, 'Novato', 'Principiante en el sistema de comunicación', 0, 99, '🌟', '#94a3b8'),
(2, 'Explorador', 'Descubriendo las funcionalidades básicas', 100, 299, '🚀', '#22c55e'),
(3, 'Comunicador', 'Comunicación activa y constante', 300, 699, '💬', '#3b82f6'),
(4, 'Conector', 'Conectando equipos y personas', 700, 1499, '🤝', '#8b5cf6'),
(5, 'Influencer', 'Influenciando positivamente en el equipo', 1500, 2999, '⭐', '#f59e0b'),
(6, 'Líder', 'Liderando por ejemplo', 3000, 5999, '👑', '#ef4444'),
(7, 'Maestro', 'Dominio absoluto de la plataforma', 6000, 9999, '🏆', '#059669'),
(8, 'Leyenda', 'Leyenda de la comunicación corporativa', 10000, NULL, '💎', '#7c3aed')
ON CONFLICT (level_number) DO NOTHING;

-- Insertar logros iniciales
INSERT INTO achievements (name, description, icon, category, points_reward, badge_type, trigger_condition) VALUES
('Primer Mensaje', 'Envía tu primer mensaje', '📤', 'communication', 10, 'bronze', '{"type": "first_message"}'),
('Comunicador Activo', 'Envía 10 mensajes', '📨', 'communication', 50, 'bronze', '{"type": "message_count", "count": 10}'),
('Super Comunicador', 'Envía 50 mensajes', '📬', 'communication', 200, 'silver', '{"type": "message_count", "count": 50}'),
('Maestro de la Comunicación', 'Envía 100 mensajes', '📮', 'communication', 500, 'gold', '{"type": "message_count", "count": 100}'),
('Lector Rápido', 'Lee 10 mensajes en menos de 1 hora', '👀', 'engagement', 30, 'bronze', '{"type": "read_speed", "count": 10, "timeframe": 3600}'),
('Engagement Perfecto', '100% de tasa de lectura en una semana', '🎯', 'engagement', 100, 'silver', '{"type": "perfect_engagement", "timeframe": 604800}'),
('Racha Semanal', '7 días consecutivos de actividad', '🔥', 'engagement', 70, 'bronze', '{"type": "streak", "days": 7}'),
('Racha Mensual', '30 días consecutivos de actividad', '🌟', 'engagement', 300, 'gold', '{"type": "streak", "days": 30}'),
('Colaborador del Mes', 'Top 10 en el leaderboard mensual', '🏅', 'collaboration', 150, 'silver', '{"type": "leaderboard_position", "position": 10, "period": "monthly"}'),
('Pionero Digital', 'Primer usuario en desbloquear 5 logros', '🚀', 'learning', 200, 'gold', '{"type": "achievement_pioneer", "count": 5}'),
('Explorador de Funciones', 'Usa todas las funcionalidades principales', '🔍', 'learning', 100, 'bronze', '{"type": "feature_explorer", "features": ["messages", "files", "folders", "templates"]}'),
('Ayudante Comunitario', 'Responde 5 preguntas de compañeros', '🤝', 'collaboration', 80, 'bronze', '{"type": "help_others", "count": 5}')
ON CONFLICT DO NOTHING;

-- Insertar recompensas iniciales
INSERT INTO rewards (name, description, type, cost_points, icon) VALUES
('Café Virtual', 'Un café virtual para compartir con el equipo', 'recognition', 50, '☕'),
('Día Extra de Vacaciones', 'Medio día adicional de vacaciones', 'privilege', 1000, '🏖️'),
('Certificado de Reconocimiento', 'Certificado digital de excelente desempeño', 'recognition', 200, '🏆'),
('Badge Exclusivo', 'Insignia especial para tu perfil', 'badge', 150, '🎖️'),
('Libro Digital', 'Libro electrónico de desarrollo profesional', 'privilege', 300, '📚'),
('Mentoría Personalizada', 'Sesión de 1 hora con un mentor', 'privilege', 500, '👨‍🏫')
ON CONFLICT DO NOTHING;

-- Crear tablas de clasificación iniciales
INSERT INTO leaderboards (name, type, category, is_active) VALUES
('Leaderboard Semanal', 'weekly', 'points', true),
('Leaderboard Mensual', 'monthly', 'points', true),
('Leaderboard Histórico', 'all_time', 'points', true),
('Leaderboard de Engagement', 'monthly', 'engagement', true),
('Leaderboard de Rachas', 'weekly', 'streak', true)
ON CONFLICT DO NOTHING;

-- Función para calcular nivel basado en puntos
CREATE OR REPLACE FUNCTION calculate_level(p_points INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_level INTEGER;
BEGIN
    SELECT COALESCE(MAX(level_number), 1)
    INTO v_level
    FROM gamification_levels
    WHERE p_points >= min_points;
    
    RETURN COALESCE(v_level, 1);
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar puntos y nivel de empleado
CREATE OR REPLACE FUNCTION update_employee_gamification(
    p_user_id UUID,
    p_employee_id UUID,
    p_points INTEGER,
    p_activity_type VARCHAR(50),
    p_activity_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_points INTEGER;
    v_new_level INTEGER;
    v_old_level INTEGER;
    v_gamification_id UUID;
BEGIN
    -- Obtener o crear registro de gamificación del empleado
    SELECT id, total_points, current_level
    INTO v_gamification_id, v_current_points, v_old_level
    FROM employee_gamification
    WHERE user_id = p_user_id AND employee_id = p_employee_id;
    
    IF v_gamification_id IS NULL THEN
        INSERT INTO employee_gamification (user_id, employee_id, total_points, current_level_points, last_activity_date)
        VALUES (p_user_id, p_employee_id, p_points, p_points, CURRENT_DATE)
        RETURNING id INTO v_gamification_id;
        v_current_points := p_points;
        v_old_level := 1;
    ELSE
        UPDATE employee_gamification
        SET total_points = total_points + p_points,
            current_level_points = current_level_points + p_points,
            last_activity_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = v_gamification_id;
        
        v_current_points := v_current_points + p_points;
    END IF;
    
    -- Calcular nuevo nivel
    v_new_level := calculate_level(v_current_points);
    
    -- Actualizar nivel si cambió
    IF v_new_level != v_old_level THEN
        UPDATE employee_gamification
        SET current_level = v_new_level,
            updated_at = NOW()
        WHERE id = v_gamification_id;
        
        -- Crear evento de nivel alcanzado
        INSERT INTO gamification_events (user_id, employee_id, event_type, event_data)
        VALUES (p_user_id, p_employee_id, 'level_up', json_build_object(
            'old_level', v_old_level,
            'new_level', v_new_level,
            'total_points', v_current_points
        ));
    END IF;
    
    -- Registrar historial de puntos
    INSERT INTO points_history (user_id, employee_id, points, activity_type, activity_id, description, metadata)
    VALUES (p_user_id, p_employee_id, p_points, p_activity_type, p_activity_id, p_description, p_metadata);
    
    -- Verificar logros desbloqueados
    PERFORM check_and_unlock_achievements(p_user_id, p_employee_id);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar y desbloquear logros
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID, p_employee_id UUID)
RETURNS VOID AS $$
DECLARE
    achievement_record RECORD;
    v_gamification_id UUID;
    v_current_achievements UUID[];
    v_new_achievements UUID[];
BEGIN
    -- Obtener datos actuales del empleado
    SELECT id, achievements_unlocked
    INTO v_gamification_id, v_current_achievements
    FROM employee_gamification
    WHERE user_id = p_user_id AND employee_id = p_employee_id;
    
    IF v_gamification_id IS NULL THEN
        RETURN;
    END IF;
    
    v_new_achievements := v_current_achievements;
    
    -- Verificar cada logro potencial
    FOR achievement_record IN 
        SELECT * FROM achievements 
        WHERE id NOT = ANY(v_current_achievements)
    LOOP
        IF is_achievement_unlocked(p_user_id, p_employee_id, achievement_record.trigger_condition) THEN
            v_new_achievements := array_append(v_new_achievements, achievement_record.id);
            
            -- Actualizar logros del empleado
            UPDATE employee_gamification
            SET achievements_unlocked = v_new_achievements,
                total_points = total_points + achievement_record.points_reward,
                updated_at = NOW()
            WHERE id = v_gamification_id;
            
            -- Crear evento de logro desbloqueado
            INSERT INTO gamification_events (user_id, employee_id, event_type, event_data)
            VALUES (p_user_id, p_employee_id, 'achievement_unlocked', json_build_object(
                'achievement_id', achievement_record.id,
                'achievement_name', achievement_record.name,
                'points_reward', achievement_record.points_reward
            ));
            
            -- Registrar puntos del logro
            INSERT INTO points_history (user_id, employee_id, points, activity_type, description)
            VALUES (p_user_id, p_employee_id, achievement_record.points_reward, 'achievement_unlocked', 
                   'Logro desbloqueado: ' || achievement_record.name);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si un logro está desbloqueado (simplificada)
CREATE OR REPLACE FUNCTION is_achievement_unlocked(p_user_id UUID, p_employee_id UUID, p_condition JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    v_condition_type TEXT;
    v_count INTEGER;
    v_days INTEGER;
BEGIN
    v_condition_type := p_condition->>'type';
    
    CASE v_condition_type
        WHEN 'first_message' THEN
            SELECT COUNT(*)
            INTO v_count
            FROM points_history
            WHERE user_id = p_user_id AND employee_id = p_employee_id AND activity_type = 'message_sent';
            RETURN v_count >= 1;
            
        WHEN 'message_count' THEN
            SELECT COUNT(*)
            INTO v_count
            FROM points_history
            WHERE user_id = p_user_id AND employee_id = p_employee_id AND activity_type = 'message_sent';
            RETURN v_count >= (p_condition->>'count')::INTEGER;
            
        WHEN 'streak' THEN
            SELECT streak_days
            INTO v_days
            FROM employee_gamification
            WHERE user_id = p_user_id AND employee_id = p_employee_id;
            RETURN v_days >= (p_condition->>'days')::INTEGER;
            
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Crear función para actualizar racha de actividad
CREATE OR REPLACE FUNCTION update_activity_streak(p_user_id UUID, p_employee_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_last_activity DATE;
    v_streak INTEGER;
    v_gamification_id UUID;
BEGIN
    -- Obtener registro de gamificación
    SELECT id, last_activity_date, streak_days
    INTO v_gamification_id, v_last_activity, v_streak
    FROM employee_gamification
    WHERE user_id = p_user_id AND employee_id = p_employee_id;
    
    IF v_gamification_id IS NULL THEN
        -- Crear nuevo registro
        INSERT INTO employee_gamification (user_id, employee_id, streak_days, last_activity_date)
        VALUES (p_user_id, p_employee_id, 1, CURRENT_DATE)
        RETURNING id INTO v_gamification_id;
        v_streak := 1;
    ELSIF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
        -- Continuar racha
        v_streak := v_streak + 1;
        UPDATE employee_gamification
        SET streak_days = v_streak,
            last_activity_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = v_gamification_id;
    ELSIF v_last_activity < CURRENT_DATE - INTERVAL '1 day' THEN
        -- Reiniciar racha
        v_streak := 1;
        UPDATE employee_gamification
        SET streak_days = v_streak,
            last_activity_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = v_gamification_id;
    END IF;
    
    -- Verificar logros de racha
    PERFORM check_and_unlock_achievements(p_user_id, p_employee_id);
    
    RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE gamification_levels IS 'Niveles de gamificación con puntos requeridos y recompensas';
COMMENT ON TABLE achievements IS 'Logros que los empleados pueden desbloquear';
COMMENT ON TABLE employee_gamification IS 'Progreso de gamificación de cada empleado';
COMMENT ON TABLE points_history IS 'Historial completo de puntos ganados/perdidos';
COMMENT ON TABLE leaderboards IS 'Configuración de tablas de clasificación';
COMMENT ON TABLE leaderboard_entries IS 'Posiciones en las tablas de clasificación';
COMMENT ON TABLE engagement_predictions IS 'Predicciones de engagement usando IA';
COMMENT ON TABLE gamification_events IS 'Eventos importantes de gamificación';
COMMENT ON TABLE rewards IS 'Catálogo de recompensas canjeables';
COMMENT ON TABLE redeemed_rewards IS 'Historial de recompensas canjeadas';