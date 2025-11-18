import { supabase } from '../lib/supabase.js'

class RealTimeStatsService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutos
    this.subscribers = new Set()
    this.realTimeInterval = null
  }

  /**
   * Obtiene estadísticas en tiempo real de comunicación
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Object>} Estadísticas en tiempo real
   */
  async getRealTimeStats(options = {}) {
    const {
      companyId = null,
      dateRange = '7d', // 1d, 7d, 30d, 90d
      channels = null,
      includeComparison = false
    } = options

    const cacheKey = `realtime_${companyId}_${dateRange}_${channels?.join(',') || 'all'}`
    
    // Verificar caché
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      const stats = await this.calculateRealTimeStats(options)
      
      // Guardar en caché
      this.cache.set(cacheKey, {
        data: stats,
        timestamp: Date.now()
      })

      // Agregar datos comparativos si se solicita
      if (includeComparison) {
        stats.comparison = await this.getComparisonStats(options)
      }

      return stats
    } catch (error) {
      console.error('Error obteniendo estadísticas en tiempo real:', error)
      return this.getFallbackStats()
    }
  }

  /**
   * Calcula estadísticas en tiempo real
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Object>} Estadísticas calculadas
   */
  async calculateRealTimeStats(options) {
    const { companyId, dateRange, channels } = options
    const dateFilter = this.getDateFilter(dateRange)

    // Construir consulta base
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .gte('created_at', dateFilter.start)
      .lte('created_at', dateFilter.end)

    // Aplicar filtros
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    if (channels && channels.length > 0) {
      query = query.in('channel', channels)
    }

    const { data: messages, error, count } = await query

    if (error) throw error

    // Calcular estadísticas básicas
    const totalMessages = count || 0
    const stats = {
      overview: {
        total_messages: totalMessages,
        date_range: dateRange,
        generated_at: new Date().toISOString()
      },
      delivery: this.calculateDeliveryStats(messages),
      engagement: this.calculateEngagementStats(messages),
      channels: this.calculateChannelStats(messages),
      temporal: this.calculateTemporalStats(messages),
      performance: this.calculatePerformanceStats(messages)
    }

    return stats
  }

  /**
   * Calcula estadísticas de entrega
   * @param {Array} messages - Mensajes
   * @returns {Object} Estadísticas de entrega
   */
  calculateDeliveryStats(messages) {
    if (!messages || messages.length === 0) {
      return {
        delivery_rate: 0,
        delivered_count: 0,
        pending_count: 0,
        failed_count: 0,
        avg_delivery_time: 0
      }
    }

    const delivered = messages.filter(m => m.status === 'delivered')
    const pending = messages.filter(m => m.status === 'pending')
    const failed = messages.filter(m => m.status === 'failed')

    // Calcular tiempo promedio de entrega
    const deliveryTimes = delivered
      .filter(m => m.delivered_at && m.created_at)
      .map(m => new Date(m.delivered_at) - new Date(m.created_at))

    const avgDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
      : 0

    return {
      delivery_rate: messages.length > 0 ? (delivered.length / messages.length * 100).toFixed(1) : 0,
      delivered_count: delivered.length,
      pending_count: pending.length,
      failed_count: failed.length,
      avg_delivery_time: Math.round(avgDeliveryTime / 1000), // en segundos
      delivery_trend: this.calculateTrend(delivered, 'delivered_at')
    }
  }

  /**
   * Calcula estadísticas de engagement
   * @param {Array} messages - Mensajes
   * @returns {Object} Estadísticas de engagement
   */
  calculateEngagementStats(messages) {
    if (!messages || messages.length === 0) {
      return {
        read_rate: 0,
        click_rate: 0,
        overall_engagement: 0,
        read_count: 0,
        click_count: 0
      }
    }

    const delivered = messages.filter(m => m.status === 'delivered')
    const read = delivered.filter(m => m.read_at)
    const clicked = delivered.filter(m => m.clicked_at)

    const readRate = delivered.length > 0 ? (read.length / delivered.length * 100).toFixed(1) : 0
    const clickRate = read.length > 0 ? (clicked.length / read.length * 100).toFixed(1) : 0
    const overallEngagement = delivered.length > 0 ? (clicked.length / delivered.length * 100).toFixed(1) : 0

    return {
      read_rate: readRate,
      click_rate: clickRate,
      overall_engagement: overallEngagement,
      read_count: read.length,
      click_count: clicked.length,
      read_trend: this.calculateTrend(read, 'read_at'),
      click_trend: this.calculateTrend(clicked, 'clicked_at')
    }
  }

  /**
   * Calcula estadísticas por canal
   * @param {Array} messages - Mensajes
   * @returns {Object} Estadísticas por canal
   */
  calculateChannelStats(messages) {
    const channelStats = {}

    if (!messages || messages.length === 0) {
      return channelStats
    }

    // Agrupar por canal
    messages.forEach(msg => {
      const channel = msg.channel || 'email'
      if (!channelStats[channel]) {
        channelStats[channel] = {
          total: 0,
          delivered: 0,
          read: 0,
          clicked: 0,
          failed: 0
        }
      }
      channelStats[channel].total++
      
      if (msg.status === 'delivered') channelStats[channel].delivered++
      if (msg.read_at) channelStats[channel].read++
      if (msg.clicked_at) channelStats[channel].clicked++
      if (msg.status === 'failed') channelStats[channel].failed++
    })

    // Calcular tasas para cada canal
    Object.keys(channelStats).forEach(channel => {
      const stats = channelStats[channel]
      stats.delivery_rate = stats.total > 0 ? (stats.delivered / stats.total * 100).toFixed(1) : 0
      stats.read_rate = stats.delivered > 0 ? (stats.read / stats.delivered * 100).toFixed(1) : 0
      stats.click_rate = stats.read > 0 ? (stats.clicked / stats.read * 100).toFixed(1) : 0
      stats.engagement_rate = stats.delivered > 0 ? (stats.clicked / stats.delivered * 100).toFixed(1) : 0
    })

    return channelStats
  }

  /**
   * Calcula estadísticas temporales
   * @param {Array} messages - Mensajes
   * @returns {Object} Estadísticas temporales
   */
  calculateTemporalStats(messages) {
    if (!messages || messages.length === 0) {
      return {
        hourly_distribution: [],
        daily_trends: [],
        peak_hours: [],
        peak_days: []
      }
    }

    // Distribución por hora
    const hourlyStats = Array(24).fill(0)
    const dailyStats = {}

    messages.forEach(msg => {
      const date = new Date(msg.created_at)
      const hour = date.getHours()
      const day = date.toLocaleDateString('es-ES', { weekday: 'short' })

      hourlyStats[hour]++
      dailyStats[day] = (dailyStats[day] || 0) + 1
    })

    // Encontrar horas y días pico
    const maxHourly = Math.max(...hourlyStats)
    const peakHours = hourlyStats
      .map((count, hour) => ({ hour, count }))
      .filter(item => item.count === maxHourly)
      .map(item => `${item.hour}:00`)

    const maxDaily = Math.max(...Object.values(dailyStats))
    const peakDays = Object.entries(dailyStats)
      .filter(([_, count]) => count === maxDaily)
      .map(([day, _]) => day)

    return {
      hourly_distribution: hourlyStats.map((count, hour) => ({
        hour: `${hour}:00`,
        count,
        percentage: ((count / messages.length) * 100).toFixed(1)
      })),
      daily_trends: Object.entries(dailyStats).map(([day, count]) => ({
        day,
        count,
        percentage: ((count / messages.length) * 100).toFixed(1)
      })),
      peak_hours: peakHours,
      peak_days: peakDays
    }
  }

  /**
   * Calcula estadísticas de rendimiento
   * @param {Array} messages - Mensajes
   * @returns {Object} Estadísticas de rendimiento
   */
  calculatePerformanceStats(messages) {
    if (!messages || messages.length === 0) {
      return {
        performance_score: 0,
        efficiency: 0,
        reliability: 0,
        speed: 0
      }
    }

    const deliveryStats = this.calculateDeliveryStats(messages)
    const engagementStats = this.calculateEngagementStats(messages)

    // Calcular puntuaciones individuales
    const deliveryScore = parseFloat(deliveryStats.delivery_rate)
    const engagementScore = parseFloat(engagementStats.overall_engagement)
    const speedScore = Math.max(0, 100 - (deliveryStats.avg_delivery_time / 60)) // Penalizar tiempos largos

    // Puntuación general
    const performanceScore = ((deliveryScore * 0.4) + (engagementScore * 0.4) + (speedScore * 0.2)).toFixed(1)

    return {
      performance_score: performanceScore,
      efficiency: deliveryScore,
      reliability: deliveryScore,
      speed: speedScore,
      grade: this.getPerformanceGrade(performanceScore)
    }
  }

  /**
   * Obtiene estadísticas comparativas
   * @param {Object} options - Opciones actuales
   * @returns {Promise<Object>} Estadísticas comparativas
   */
  async getComparisonStats(options) {
    const { dateRange } = options
    
    // Obtener estadísticas del período anterior
    const previousPeriod = this.getPreviousPeriod(dateRange)
    const previousOptions = { ...options, dateRange: previousPeriod }
    
    try {
      const previousStats = await this.calculateRealTimeStats(previousOptions)
      const currentStats = await this.calculateRealTimeStats(options)

      return {
        previous_period: previousPeriod,
        delivery_change: this.calculateChange(
          previousStats.delivery.delivery_rate,
          currentStats.delivery.delivery_rate
        ),
        engagement_change: this.calculateChange(
          previousStats.engagement.overall_engagement,
          currentStats.engagement.overall_engagement
        ),
        volume_change: this.calculateChange(
          previousStats.overview.total_messages,
          currentStats.overview.total_messages
        )
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas comparativas:', error)
      return null
    }
  }

  /**
   * Inicia suscripción a actualizaciones en tiempo real
   * @param {Function} callback - Función de callback
   * @returns {Function} Función para cancelar suscripción
   */
  subscribeToRealTimeUpdates(callback) {
    this.subscribers.add(callback)

    // Iniciar intervalo de actualización si no está activo
    if (!this.realTimeInterval) {
      this.realTimeInterval = setInterval(async () => {
        try {
          const stats = await this.getRealTimeStats()
          this.subscribers.forEach(cb => cb(stats))
        } catch (error) {
          console.error('Error en actualización en tiempo real:', error)
        }
      }, 30000) // Actualizar cada 30 segundos
    }

    // Retornar función de unsuscribe
    return () => {
      this.subscribers.delete(callback)
      if (this.subscribers.size === 0 && this.realTimeInterval) {
        clearInterval(this.realTimeInterval)
        this.realTimeInterval = null
      }
    }
  }

  /**
   * Obtiene métricas específicas de una empresa
   * @param {string} companyId - ID de la empresa
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Métricas de la empresa
   */
  async getCompanyMetrics(companyId, options = {}) {
    const companyOptions = { ...options, companyId }
    
    try {
      // Obtener información de la empresa
      const { data: company } = await supabase
        .from('companies')
        .select('name, created_at, status')
        .eq('id', companyId)
        .single()

      // Obtener estadísticas de comunicación
      const stats = await this.getRealTimeStats(companyOptions)

      // Obtener estadísticas de empleados
      const employeeStats = await this.getEmployeeStats(companyId)

      return {
        company,
        communication: stats,
        employees: employeeStats,
        insights: await this.generateCompanyInsights(companyId, stats)
      }
    } catch (error) {
      console.error('Error obteniendo métricas de empresa:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de empleados de una empresa
   * @param {string} companyId - ID de la empresa
   * @returns {Promise<Object>} Estadísticas de empleados
   */
  async getEmployeeStats(companyId) {
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('id, name, email, is_active, created_at')
        .eq('company_id', companyId)

      if (!employees || employees.length === 0) {
        return {
          total_employees: 0,
          active_employees: 0,
          avg_engagement: 0
        }
      }

      const active = employees.filter(e => e.is_active)
      
      // Obtener métricas de comunicación por empleado
      const employeeMetrics = await Promise.all(
        employees.map(async (emp) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('employee_id', emp.id)

          return {
            id: emp.id,
            name: emp.name,
            email: emp.email,
            is_active: emp.is_active,
            message_count: count || 0
          }
        })
      )

      return {
        total_employees: employees.length,
        active_employees: active.length,
        avg_engagement: employeeMetrics.reduce((sum, emp) => sum + emp.message_count, 0) / employees.length,
        employee_metrics: employeeMetrics
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de empleados:', error)
      return {
        total_employees: 0,
        active_employees: 0,
        avg_engagement: 0
      }
    }
  }

  /**
   * Genera insights específicos para una empresa
   * @param {string} companyId - ID de la empresa
   * @param {Object} stats - Estadísticas actuales
   * @returns {Promise<Object>} Insights generados
   */
  async generateCompanyInsights(companyId, stats) {
    try {
      // Importar dinámicamente para evitar dependencia circular
      const { default: analyticsInsightsService } = await import('./analyticsInsightsService.js')
      
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      return await analyticsInsightsService.generateCompanySpecificInsights(companyId, company)
    } catch (error) {
      console.error('Error generando insights de empresa:', error)
      return null
    }
  }

  /**
   * Obtiene filtro de fechas según el rango
   * @param {string} range - Rango de fechas
   * @returns {Object} Fechas de inicio y fin
   */
  getDateFilter(range) {
    const now = new Date()
    const end = now.toISOString()
    
    let start
    switch (range) {
      case '1d':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        break
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
        break
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    return { start, end }
  }

  /**
   * Calcula tendencia de un conjunto de datos
   * @param {Array} data - Datos
   * @param {string} dateField - Campo de fecha
   * @returns {string} Tendencia
   */
  calculateTrend(data, dateField) {
    if (!data || data.length < 2) return 'insufficient_data'

    const sorted = data
      .filter(item => item[dateField])
      .sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]))

    if (sorted.length < 2) return 'insufficient_data'

    const recent = sorted.slice(-Math.ceil(sorted.length / 2))
    const older = sorted.slice(0, Math.floor(sorted.length / 2))

    const recentCount = recent.length
    const olderCount = older.length

    if (recentCount > olderCount) return 'increasing'
    if (recentCount < olderCount) return 'decreasing'
    return 'stable'
  }

  /**
   * Calcula cambio porcentual
   * @param {number} previous - Valor anterior
   * @param {number} current - Valor actual
   * @returns {Object} Cambio calculado
   */
  calculateChange(previous, current) {
    if (previous === 0) return { change: 0, percentage: 0, trend: 'stable' }
    
    const change = current - previous
    const percentage = ((change / previous) * 100).toFixed(1)
    const trend = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'

    return {
      change: parseFloat(change),
      percentage: parseFloat(percentage),
      trend
    }
  }

  /**
   * Obtiene período anterior para comparación
   * @param {string} currentRange - Rango actual
   * @returns {string} Rango anterior
   */
  getPreviousPeriod(currentRange) {
    const rangeMap = {
      '1d': '1d',
      '7d': '7d',
      '30d': '30d',
      '90d': '90d'
    }
    return rangeMap[currentRange] || '7d'
  }

  /**
   * Obtiene calificación de rendimiento
   * @param {number} score - Puntuación
   * @returns {string} Calificación
   */
  getPerformanceGrade(score) {
    if (score >= 90) return 'excellent'
    if (score >= 80) return 'good'
    if (score >= 70) return 'average'
    if (score >= 60) return 'below_average'
    return 'poor'
  }

  /**
   * Obtiene estadísticas de respaldo cuando hay error
   * @returns {Object} Estadísticas de respaldo
   */
  getFallbackStats() {
    return {
      overview: {
        total_messages: 0,
        date_range: '7d',
        generated_at: new Date().toISOString(),
        error: true
      },
      delivery: {
        delivery_rate: 0,
        delivered_count: 0,
        pending_count: 0,
        failed_count: 0,
        avg_delivery_time: 0
      },
      engagement: {
        read_rate: 0,
        click_rate: 0,
        overall_engagement: 0,
        read_count: 0,
        click_count: 0
      },
      channels: {},
      temporal: {
        hourly_distribution: [],
        daily_trends: [],
        peak_hours: [],
        peak_days: []
      },
      performance: {
        performance_score: 0,
        efficiency: 0,
        reliability: 0,
        speed: 0
      }
    }
  }

  /**
   * Limpia caché
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Detiene actualizaciones en tiempo real
   */
  stopRealTimeUpdates() {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval)
      this.realTimeInterval = null
    }
    this.subscribers.clear()
  }
}

const realTimeStatsService = new RealTimeStatsService();
export default realTimeStatsService;