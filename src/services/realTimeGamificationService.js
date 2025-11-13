import { supabase } from '../lib/supabase.js';
import gamificationService from './gamificationService.js';

/**
 * Servicio de gamificación en tiempo real
 * Monitorea actividades automáticas y actualiza puntos instantáneamente
 */
class RealTimeGamificationService {
  constructor() {
    this.activityTracking = new Map(); // Tracking de actividades por usuario
    this.realtimeChannel = null;
    this.isInitialized = false;
    this.activityThresholds = {
      message_sent: { maxPerHour: 20, cooldownMinutes: 3 },
      message_read: { maxPerHour: 50, cooldownMinutes: 1 },
      file_uploaded: { maxPerHour: 10, cooldownMinutes: 5 },
      file_downloaded: { maxPerHour: 30, cooldownMinutes: 2 },
      template_used: { maxPerHour: 15, cooldownMinutes: 4 },
      daily_login: { maxPerDay: 1, cooldownMinutes: 1440 }
    };
  }

  /**
   * Inicializa el servicio de gamificación en tiempo real
   */
  async initialize(userId, employeeId) {
    try {
      if (this.isInitialized) {
        return { success: true, message: 'Service already initialized' };
      }

      console.log('🎮 Inicializando gamificación en tiempo real');

      // Inicializar datos de gamificación si no existen
      await gamificationService.initializeEmployeeGamification(userId, employeeId);

      // Configurar canal de tiempo real de Supabase
      this.realtimeChannel = supabase
        .channel('gamification_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'employee_gamification' 
          }, 
          (payload) => this.handleGamificationUpdate(payload)
        )
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'gamification_events'
          },
          (payload) => this.handleGamificationEvent(payload)
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Canal de gamificación en tiempo real conectado');
            this.isInitialized = true;
          }
        });

      // Inicializar tracking de actividades diarias
      await this.initializeDailyTracking(userId, employeeId);

      return { success: true, message: 'Real-time gamification initialized' };
    } catch (error) {
      console.error('❌ Error inicializando gamificación en tiempo real:', error);
      return { success: false, error };
    }
  }

  /**
   * Registra una actividad con validaciones en tiempo real
   */
  async trackActivity(userId, employeeId, activityType, activityId = null, metadata = {}) {
    try {
      // Validar límites y cooldowns
      const canTrack = await this.validateActivityLimits(userId, activityType);
      if (!canTrack.allowed) {
        return {
          success: false,
          reason: canTrack.reason,
          nextAllowedIn: canTrack.nextAllowedIn
        };
      }

      // Registrar actividad en tracking local
      this.updateLocalTracking(userId, activityType);

      // Otorgar puntos usando el servicio principal
      const result = await gamificationService.awardPoints(
        userId,
        employeeId,
        activityType,
        activityId,
        metadata.description || `Actividad: ${activityType}`,
        {
          ...metadata,
          trackedAt: new Date().toISOString(),
          realTime: true
        }
      );

      if (result.success) {
        // Verificar logros desbloqueados
        await this.checkAchievements(userId, employeeId);

        // Actualizar predicciones de engagement
        await this.updateEngagementPrediction(userId, employeeId);

        // Enviar notificación en tiempo real
        await this.sendRealtimeNotification(userId, {
          type: 'points_earned',
          activityType,
          points: result.pointsAwarded,
          metadata
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error tracking activity:', error);
      return { success: false, error };
    }
  }

  /**
   * Valida límites de actividad para prevenir spam
   */
  async validateActivityLimits(userId, activityType) {
    const threshold = this.activityThresholds[activityType];
    if (!threshold) {
      return { allowed: true };
    }

    const userTracking = this.activityTracking.get(userId) || {};
    const activityTracking = userTracking[activityType] || {
      count: 0,
      lastActivity: null,
      resetTime: null
    };

    const now = new Date();
    const hoursAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const daysAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Resetear contadores si es necesario
    if (activityTracking.resetTime && now > activityTracking.resetTime) {
      activityTracking.count = 0;
      activityTracking.resetTime = null;
    }

    // Verificar cooldown
    if (activityTracking.lastActivity) {
      const cooldownMs = threshold.cooldownMinutes * 60 * 1000;
      const timeSinceLastActivity = now - activityTracking.lastActivity;
      
      if (timeSinceLastActivity < cooldownMs) {
        const remainingCooldown = Math.ceil((cooldownMs - timeSinceLastActivity) / 1000 / 60);
        return {
          allowed: false,
          reason: 'cooldown',
          nextAllowedIn: `${remainingCooldown} minutos`
        };
      }
    }

    // Verificar límites por hora/día
    const timeWindow = activityType === 'daily_login' ? daysAgo : hoursAgo;
    const recentCount = await this.getActivityCountSince(userId, activityType, timeWindow);
    
    const maxCount = activityType === 'daily_login' ? threshold.maxPerDay : threshold.maxPerHour;
    
    if (recentCount >= maxCount) {
      return {
        allowed: false,
        reason: 'limit_exceeded',
        nextAllowedIn: activityType === 'daily_login' ? 'mañana' : '1 hora'
      };
    }

    return { allowed: true };
  }

  /**
   * Actualiza tracking local de actividades
   */
  updateLocalTracking(userId, activityType) {
    if (!this.activityTracking.has(userId)) {
      this.activityTracking.set(userId, {});
    }

    const userTracking = this.activityTracking.get(userId);
    const activityTracking = userTracking[activityType] || {
      count: 0,
      lastActivity: null,
      resetTime: null
    };

    activityTracking.count++;
    activityTracking.lastActivity = new Date();

    // Configurar tiempo de reset para límites por hora
    if (activityType !== 'daily_login') {
      activityTracking.resetTime = new Date(Date.now() + 60 * 60 * 1000);
    } else {
      // Reset para actividad diaria a medianoche
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      activityTracking.resetTime = tomorrow;
    }

    userTracking[activityType] = activityTracking;
    this.activityTracking.set(userId, userTracking);
  }

  /**
   * Obtiene conteo de actividades desde un tiempo específico
   */
  async getActivityCountSince(userId, activityType, sinceDate) {
    try {
      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', activityType)
        .gte('created_at', sinceDate.toISOString());

      if (error) {
        console.warn('⚠️ Error obteniendo conteo de actividades:', error);
        return 0;
      }

      return data ? data.length : 0;
    } catch (error) {
      console.error('❌ Error en getActivityCountSince:', error);
      return 0;
    }
  }

  /**
   * Inicializa tracking diario
   */
  async initializeDailyTracking(userId, employeeId) {
    try {
      // Verificar si ya hizo login hoy
      const today = new Date().toISOString().split('T')[0];
      const { data: todayActivity, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', 'daily_login')
        .gte('created_at', today + 'T00:00:00.000Z')
        .limit(1);

      if (!error && (!todayActivity || todayActivity.length === 0)) {
        // Otorgar puntos de login diario
        await this.trackActivity(userId, employeeId, 'daily_login', null, {
          description: 'Login diario',
          date: today
        });
      }
    } catch (error) {
      console.error('❌ Error inicializando tracking diario:', error);
    }
  }

  /**
   * Verifica y desbloquea logros automáticamente
   */
  async checkAchievements(userId, employeeId) {
    try {
      const gamificationData = await gamificationService.getEmployeeGamification(userId, employeeId);
      if (!gamificationData.success) return;

      const data = gamificationData.data;
      const allAchievements = await gamificationService.getAllAchievements();
      
      if (!allAchievements.success) return;

      for (const achievement of allAchievements.data) {
        // Verificar si el logro ya está desbloqueado
        if (data.achievements_unlocked && data.achievements_unlocked.includes(achievement.id)) {
          continue;
        }

        // Verificar condiciones del logro
        const shouldUnlock = await this.evaluateAchievementConditions(achievement, data);
        
        if (shouldUnlock) {
          await this.unlockAchievement(userId, employeeId, achievement);
        }
      }
    } catch (error) {
      console.error('❌ Error verificando logros:', error);
    }
  }

  /**
   * Evalúa si se cumplen las condiciones de un logro
   */
  async evaluateAchievementConditions(achievement, userData) {
    try {
      const conditions = achievement.conditions || {};
      
      // Verificar puntos totales
      if (conditions.min_points && userData.total_points < conditions.min_points) {
        return false;
      }

      // Verificar nivel
      if (conditions.min_level && userData.current_level < conditions.min_level) {
        return false;
      }

      // Verificar racha
      if (conditions.min_streak && userData.streak_days < conditions.min_streak) {
        return false;
      }

      // Verificar número de logros
      if (conditions.min_achievements && userData.achievements_unlocked.length < conditions.min_achievements) {
        return false;
      }

      // Verificar actividades específicas
      if (conditions.activity_types) {
        for (const [activityType, requiredCount] of Object.entries(conditions.activity_types)) {
          const activityCount = await this.getActivityCountSince(
            userData.user_id,
            activityType,
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Última semana
          );
          
          if (activityCount < requiredCount) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error evaluando condiciones de logro:', error);
      return false;
    }
  }

  /**
   * Desbloquea un logro
   */
  async unlockAchievement(userId, employeeId, achievement) {
    try {
      // Otorgar puntos por logro
      await gamificationService.awardPoints(
        userId,
        employeeId,
        'achievement_unlocked',
        achievement.id,
        `Logro desbloqueado: ${achievement.name}`,
        {
          achievementId: achievement.id,
          achievementName: achievement.name,
          pointsReward: achievement.points_reward
        }
      );

      // Enviar notificación especial
      await this.sendRealtimeNotification(userId, {
        type: 'achievement_unlocked',
        achievement: {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          badge_icon: achievement.badge_icon,
          badge_color: achievement.badge_color,
          points_reward: achievement.points_reward
        }
      });

      console.log(`🏆 Logro desbloqueado para ${userId}: ${achievement.name}`);
    } catch (error) {
      console.error('❌ Error desbloqueando logro:', error);
    }
  }

  /**
   * Actualiza predicciones de engagement
   */
  async updateEngagementPrediction(userId, employeeId) {
    try {
      await gamificationService.generateEngagementPrediction(userId, employeeId);
    } catch (error) {
      console.error('❌ Error actualizando predicción:', error);
    }
  }

  /**
   * Envía notificación en tiempo real
   */
  async sendRealtimeNotification(userId, notificationData) {
    try {
      // Guardar notificación en la base de datos
      const { error } = await supabase
        .from('gamification_notifications')
        .insert({
          user_id: userId,
          notification_type: notificationData.type,
          notification_data: notificationData,
          created_at: new Date().toISOString(),
          read: false
        });

      if (error) {
        console.warn('⚠️ Error guardando notificación:', error);
      }

      // Emitir evento en tiempo real
      if (this.realtimeChannel) {
        this.realtimeChannel.send({
          type: 'broadcast',
          event: 'gamification_notification',
          payload: {
            userId,
            notification: notificationData
          }
        });
      }
    } catch (error) {
      console.error('❌ Error enviando notificación en tiempo real:', error);
    }
  }

  /**
   * Maneja actualizaciones de gamificación
   */
  handleGamificationUpdate(payload) {
    console.log('📊 Actualización de gamificación:', payload);
    // Aquí se pueden agregar reacciones a cambios en los datos de gamificación
  }

  /**
   * Maneja eventos de gamificación
   */
  handleGamificationEvent(payload) {
    console.log('🎮 Evento de gamificación:', payload);
    // Aquí se pueden agregar reacciones a eventos específicos
  }

  /**
   * Detiene el servicio
   */
  async stop() {
    try {
      if (this.realtimeChannel) {
        await supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
      }
      
      this.activityTracking.clear();
      this.isInitialized = false;
      
      console.log('🛑 Servicio de gamificación en tiempo real detenido');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deteniendo servicio:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene estadísticas en tiempo real
   */
  async getRealTimeStats(userId, employeeId) {
    try {
      const [gamificationData, events] = await Promise.all([
        gamificationService.getEmployeeGamification(userId, employeeId),
        gamificationService.getGamificationEvents(userId, employeeId, 10)
      ]);

      const userTracking = this.activityTracking.get(userId) || {};
      const recentActivities = Object.entries(userTracking)
        .map(([type, tracking]) => ({
          type,
          count: tracking.count,
          lastActivity: tracking.lastActivity
        }))
        .filter(activity => activity.lastActivity)
        .sort((a, b) => b.lastActivity - a.lastActivity)
        .slice(0, 5);

      return {
        success: true,
        data: {
          gamification: gamificationData.data,
          recentEvents: events.data || [],
          recentActivities,
          isTracking: this.isInitialized,
          activeCooldowns: this.getActiveCooldowns(userId)
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas en tiempo real:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene cooldowns activos para un usuario
   */
  getActiveCooldowns(userId) {
    const userTracking = this.activityTracking.get(userId) || {};
    const activeCooldowns = {};

    Object.entries(userTracking).forEach(([activityType, tracking]) => {
      const threshold = this.activityThresholds[activityType];
      if (threshold && tracking.lastActivity) {
        const cooldownMs = threshold.cooldownMinutes * 60 * 1000;
        const timeSinceLastActivity = Date.now() - tracking.lastActivity.getTime();
        
        if (timeSinceLastActivity < cooldownMs) {
          const remainingCooldown = Math.ceil((cooldownMs - timeSinceLastActivity) / 1000 / 60);
          activeCooldowns[activityType] = `${remainingCooldown} min`;
        }
      }
    });

    return activeCooldowns;
  }
}

// Crear y exportar la instancia única
const realTimeGamificationService = new RealTimeGamificationService();
export default realTimeGamificationService;