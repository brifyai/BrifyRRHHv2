import { supabase } from '../lib/supabase';

class GamificationService {
  constructor() {
    this.pointsConfig = {
      message_sent: 5,
      message_read: 2,
      file_uploaded: 10,
      file_downloaded: 3,
      template_used: 8,
      achievement_unlocked: 50,
      daily_login: 5,
      streak_bonus: 20,
      perfect_week: 100
    };
  }

  // Inicializar gamificación para un empleado
  async initializeEmployeeGamification(userId, employeeId) {
    try {
      const { data, error } = await supabase.rpc('update_employee_gamification', {
        p_user_id: userId,
        p_employee_id: employeeId,
        p_points: 0,
        p_activity_type: 'initialization',
        p_description: 'Inicialización del sistema de gamificación'
      });

      if (error) {
        console.error('Error initializing gamification:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in initializeEmployeeGamification:', error);
      return { success: false, error };
    }
  }

  // Actualizar puntos por actividad
  async awardPoints(userId, employeeId, activityType, activityId = null, description = null, metadata = {}) {
    try {
      const points = this.pointsConfig[activityType] || 0;
      
      if (points === 0) {
        return { success: false, error: 'Invalid activity type' };
      }

      const { data, error } = await supabase.rpc('update_employee_gamification', {
        p_user_id: userId,
        p_employee_id: employeeId,
        p_points: points,
        p_activity_type: activityType,
        p_activity_id: activityId,
        p_description: description || `Puntos por ${activityType}`,
        p_metadata: metadata
      });

      if (error) {
        console.error('Error awarding points:', error);
        return { success: false, error };
      }

      // Actualizar racha de actividad
      await this.updateActivityStreak(userId, employeeId);

      return { success: true, data, pointsAwarded: points };
    } catch (error) {
      console.error('Error in awardPoints:', error);
      return { success: false, error };
    }
  }

  // Actualizar racha de actividad
  async updateActivityStreak(userId, employeeId) {
    try {
      const { data, error } = await supabase.rpc('update_activity_streak', {
        p_user_id: userId,
        p_employee_id: employeeId
      });

      if (error) {
        console.error('Error updating streak:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in updateActivityStreak:', error);
      return { success: false, error };
    }
  }

  // Obtener datos de gamificación de un empleado
  async getEmployeeGamification(userId, employeeId) {
    try {
      const { data, error } = await supabase
        .from('employee_gamification')
        .select(`
          *,
          gamification_levels (
            level_number,
            name,
            description,
            badge_icon,
            badge_color
          )
        `)
        .eq('user_id', userId)
        .eq('employee_id', employeeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching gamification data:', error);
        return { success: false, error };
      }

      // Si no existe, inicializar
      if (!data) {
        await this.initializeEmployeeGamification(userId, employeeId);
        return this.getEmployeeGamification(userId, employeeId);
      }

      // Obtener logros desbloqueados
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .in('id', data.achievements_unlocked || []);

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
      }

      // Obtener historial de puntos reciente
      const { data: pointsHistory, error: historyError } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyError) {
        console.error('Error fetching points history:', historyError);
      }

      return {
        success: true,
        data: {
          ...data,
          achievements: achievements || [],
          recentActivity: pointsHistory || []
        }
      };
    } catch (error) {
      console.error('Error in getEmployeeGamification:', error);
      return { success: false, error };
    }
  }

  // Obtener todos los logros disponibles
  async getAllAchievements() {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points_reward', { ascending: true });

      if (error) {
        console.error('Error fetching achievements:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getAllAchievements:', error);
      return { success: false, error };
    }
  }

  // Obtener leaderboard
  async getLeaderboard(type = 'weekly', category = 'points', limit = 50) {
    try {
      // Obtener leaderboard activo
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('type', type)
        .eq('category', category)
        .eq('is_active', true)
        .single();

      if (leaderboardError) {
        console.error('Error fetching leaderboard:', leaderboardError);
        return { success: false, error: leaderboardError };
      }

      // Obtener posiciones
      const { data: entries, error: entriesError } = await supabase
        .from('leaderboard_entries')
        .select(`
          *,
          employee_gamification!inner (
            user_id,
            employee_id,
            total_points,
            current_level
          ),
          companies!inner (
            name,
            department,
            position
          )
        `)
        .eq('leaderboard_id', leaderboard.id)
        .order('position', { ascending: true })
        .limit(limit);

      if (entriesError) {
        console.error('Error fetching leaderboard entries:', entriesError);
        return { success: false, error: entriesError };
      }

      return { success: true, data: entries };
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return { success: false, error };
    }
  }

  // Obtener recompensas disponibles
  async getAvailableRewards() {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('cost_points', { ascending: true });

      if (error) {
        console.error('Error fetching rewards:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getAvailableRewards:', error);
      return { success: false, error };
    }
  }

  // Canjear recompensa
  async redeemReward(userId, employeeId, rewardId) {
    try {
      // Obtener datos del empleado y recompensa
      const [gamificationResult, rewardResult] = await Promise.all([
        this.getEmployeeGamification(userId, employeeId),
        supabase.from('rewards').select('*').eq('id', rewardId).single()
      ]);

      if (!gamificationResult.success) {
        return { success: false, error: 'Error fetching gamification data' };
      }

      if (rewardResult.error) {
        return { success: false, error: 'Reward not found' };
      }

      const employeeData = gamificationResult.data;
      const reward = rewardResult.data;

      // Verificar si tiene suficientes puntos
      if (employeeData.total_points < reward.cost_points) {
        return { success: false, error: 'Insufficient points' };
      }

      // Verificar disponibilidad
      if (reward.availability_limit !== null && reward.availability_limit <= 0) {
        return { success: false, error: 'Reward not available' };
      }

      // Iniciar transacción
      const { data, error } = await supabase
        .from('redeemed_rewards')
        .insert({
          user_id: userId,
          employee_id: employeeId,
          reward_id: rewardId,
          points_spent: reward.cost_points,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error redeeming reward:', error);
        return { success: false, error };
      }

      // Descontar puntos
      await this.awardPoints(userId, employeeId, 'reward_redeemed', data.id, 
        `Canjeo de recompensa: ${reward.name}`, { rewardId, pointsSpent: -reward.cost_points });

      // Actualizar disponibilidad si aplica
      if (reward.availability_limit !== null) {
        await supabase
          .from('rewards')
          .update({ availability_limit: reward.availability_limit - 1 })
          .eq('id', rewardId);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in redeemReward:', error);
      return { success: false, error };
    }
  }

  // Obtener eventos de gamificación
  async getGamificationEvents(userId, employeeId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('gamification_events')
        .select('*')
        .eq('user_id', userId)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching gamification events:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getGamificationEvents:', error);
      return { success: false, error };
    }
  }

  // Generar predicción de engagement (simulación simple)
  async generateEngagementPrediction(userId, employeeId) {
    try {
      // Obtener datos históricos del empleado
      const { data: gamificationData, error: gamificationError } = await supabase
        .from('employee_gamification')
        .select('*')
        .eq('user_id', userId)
        .eq('employee_id', employeeId)
        .single();

      if (gamificationError) {
        console.error('Error fetching gamification data for prediction:', gamificationError);
        return { success: false, error: gamificationError };
      }

      // Obtener actividad reciente (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentActivity, error: activityError } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .eq('employee_id', employeeId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (activityError) {
        console.error('Error fetching recent activity:', activityError);
        return { success: false, error: activityError };
      }

      // Calcular métricas para predicción
      const totalRecentPoints = recentActivity.reduce((sum, activity) => sum + activity.points, 0);
      const activityDays = new Set(recentActivity.map(a => a.created_at.split('T')[0])).size;
      const avgDailyPoints = activityDays > 0 ? totalRecentPoints / activityDays : 0;
      
      // Fórmula simple de predicción (puede ser mejorada con ML)
      let predictedScore = Math.min(100, Math.max(0, 
        (gamificationData.engagement_score || 0) * 0.4 +
        (avgDailyPoints / 10) * 30 +
        (gamificationData.streak_days / 30) * 20 +
        (gamificationData.achievements_unlocked?.length || 0) * 2
      ));

      // Determinar nivel de riesgo
      let riskLevel = 'low';
      if (predictedScore < 30) riskLevel = 'critical';
      else if (predictedScore < 50) riskLevel = 'high';
      else if (predictedScore < 70) riskLevel = 'medium';

      // Generar recomendaciones
      const recommendations = [];
      if (predictedScore < 50) {
        recommendations.push('Aumentar frecuencia de comunicación diaria');
        recommendations.push('Participar más en actividades colaborativas');
      }
      if (gamificationData.streak_days < 7) {
        recommendations.push('Mantener racha de actividad semanal');
      }
      if ((gamificationData.achievements_unlocked?.length || 0) < 5) {
        recommendations.push('Explorar nuevas funcionalidades para desbloquear logros');
      }

      // Guardar predicción
      const { data: prediction, error: predictionError } = await supabase
        .from('engagement_predictions')
        .insert({
          user_id: userId,
          employee_id: employeeId,
          prediction_date: new Date().toISOString().split('T')[0],
          predicted_engagement_score: predictedScore,
          confidence_level: 75 + (activityDays / 30) * 20, // Más confianza con más datos
          risk_level: riskLevel,
          factors: {
            recent_points: totalRecentPoints,
            activity_days: activityDays,
            avg_daily_points: avgDailyPoints,
            current_streak: gamificationData.streak_days,
            achievements_count: gamificationData.achievements_unlocked?.length || 0
          },
          recommendations
        })
        .select()
        .single();

      if (predictionError) {
        console.error('Error saving prediction:', predictionError);
        return { success: false, error: predictionError };
      }

      return { success: true, data: prediction };
    } catch (error) {
      console.error('Error in generateEngagementPrediction:', error);
      return { success: false, error };
    }
  }

  // Obtener predicciones de engagement
  async getEngagementPredictions(userId, employeeId, limit = 30) {
    try {
      const { data, error } = await supabase
        .from('engagement_predictions')
        .select('*')
        .eq('user_id', userId)
        .eq('employee_id', employeeId)
        .order('prediction_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching engagement predictions:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getEngagementPredictions:', error);
      return { success: false, error };
    }
  }

  // Obtener estadísticas generales de gamificación
  async getGamificationStats() {
    try {
      const [levelsResult, achievementsResult, leaderboardsResult] = await Promise.all([
        supabase.from('gamification_levels').select('*').order('level_number'),
        supabase.from('achievements').select('*').order('points_reward'),
        supabase.from('leaderboards').select('*').eq('is_active', true)
      ]);

      if (levelsResult.error || achievementsResult.error || leaderboardsResult.error) {
        return { success: false, error: 'Error fetching stats' };
      }

      return {
        success: true,
        data: {
          levels: levelsResult.data,
          achievements: achievementsResult.data,
          leaderboards: leaderboardsResult.data
        }
      };
    } catch (error) {
      console.error('Error in getGamificationStats:', error);
      return { success: false, error };
    }
  }

  // Marcar notificación de evento como enviada
  async markEventNotified(eventId) {
    try {
      const { error } = await supabase
        .from('gamification_events')
        .update({ notification_sent: true })
        .eq('id', eventId);

      if (error) {
        console.error('Error marking event as notified:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in markEventNotified:', error);
      return { success: false, error };
    }
  }
}

const gamificationService = new GamificationService();
export default gamificationService;