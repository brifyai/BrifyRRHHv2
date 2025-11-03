/**
 * Audit Service
 * Servicio de Auditoría y Logging Centralizado
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

class AuditService {
  constructor() {
    this.logs = []
    this.maxLogs = 50000 // Máximo 50,000 logs en memoria
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      CRITICAL: 4
    }
    this.currentLogLevel = this.logLevels.INFO
    this.anomalyDetector = new AnomalyDetector()
    this.alertManager = new AlertManager()
    this.retentionPolicy = new RetentionPolicy()
    
    // Inicializar sistema
    this.initialize()
  }

  /**
   * Inicializar servicio de auditoría
   */
  initialize() {
    this.log('SYSTEM', 'audit_service_initialized', {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      maxLogs: this.maxLogs
    }, 'INFO')
  }

  /**
   * Registrar evento de auditoría
   * @param {string} userId - ID del usuario
   * @param {string} action - Acción realizada
   * @param {Object} details - Detalles adicionales
   * @param {string} level - Nivel de log (DEBUG, INFO, WARN, ERROR, CRITICAL)
   * @param {Object} context - Contexto adicional
   */
  log(userId, action, details = {}, level = 'INFO', context = {}) {
    try {
      const logEntry = {
        id: this.generateLogId(),
        timestamp: new Date().toISOString(),
        userId: userId || 'anonymous',
        action,
        details: this.sanitizeDetails(details),
        level,
        context: this.buildContext(context),
        sessionId: this.getSessionId(),
        requestId: this.getRequestId(),
        ipAddress: context.ipAddress || 'unknown',
        userAgent: context.userAgent || 'unknown',
        source: context.source || 'application',
        category: this.categorizeAction(action),
        severity: this.calculateSeverity(level, action, details)
      }

      // Agregar a logs en memoria
      this.logs.push(logEntry)

      // Mantener límite de logs
      this.enforceLogLimit()

      // Detectar anomalías
      this.anomalyDetector.analyze(logEntry)

      // Verificar alertas
      this.alertManager.checkAlerts(logEntry)

      // Log a consola para desarrollo
      if (process.env.NODE_ENV === 'development') {
        this.consoleLog(logEntry)
      }

      // Enviar a almacenamiento externo (configurable)
      this.persistLog(logEntry)

      return logEntry.id
    } catch (error) {
      console.error('Error in audit logging:', error)
      return null
    }
  }

  /**
   * Registrar evento de seguridad
   * @param {string} userId - ID del usuario
   * @param {string} securityEvent - Evento de seguridad
   * @param {Object} details - Detalles del evento
   * @param {string} severity - Severidad (LOW, MEDIUM, HIGH, CRITICAL)
   */
  logSecurityEvent(userId, securityEvent, details = {}, severity = 'MEDIUM') {
    return this.log(userId, 'SECURITY_EVENT', {
      securityEvent,
      severity,
      ...details
    }, 'WARN', {
      category: 'security',
      priority: this.getSecurityPriority(severity)
    })
  }

  /**
   * Registrar evento de autenticación
   * @param {string} userId - ID del usuario
   * @param {string} authEvent - Evento de autenticación
   * @param {Object} details - Detalles del evento
   * @param {boolean} success - Si fue exitoso
   */
  logAuthEvent(userId, authEvent, details = {}, success = true) {
    return this.log(userId, 'AUTH_EVENT', {
      authEvent,
      success,
      ...details
    }, success ? 'INFO' : 'WARN', {
      category: 'authentication',
      sensitive: true
    })
  }

  /**
   * Registrar evento de acceso a datos
   * @param {string} userId - ID del usuario
   * @param {string} resource - Recurso accedido
   * @param {string} action - Acción realizada
   * @param {Object} details - Detalles del acceso
   */
  logDataAccess(userId, resource, action, details = {}) {
    return this.log(userId, 'DATA_ACCESS', {
      resource,
      action,
      ...details
    }, 'INFO', {
      category: 'data_access',
      compliance: true
    })
  }

  /**
   * Registrar evento de error
   * @param {string} userId - ID del usuario
   * @param {Error} error - Error ocurrido
   * @param {Object} context - Contexto del error
   */
  logError(userId, error, context = {}) {
    return this.log(userId, 'ERROR_OCCURRED', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    }, 'ERROR', {
      category: 'error',
      stackTrace: true
    })
  }

  /**
   * Registrar evento de rendimiento
   * @param {string} operation - Operación medida
   * @param {number} duration - Duración en ms
   * @param {Object} metrics - Métricas adicionales
   */
  logPerformance(operation, duration, metrics = {}) {
    return this.log('SYSTEM', 'PERFORMANCE_METRIC', {
      operation,
      duration,
      ...metrics
    }, 'INFO', {
      category: 'performance',
      measurable: true
    })
  }

  /**
   * Buscar logs con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Array} Logs filtrados
   */
  searchLogs(filters = {}) {
    try {
      let filteredLogs = [...this.logs]

      // Filtrar por nivel
      if (filters.level) {
        const targetLevel = this.logLevels[filters.level.toUpperCase()]
        filteredLogs = filteredLogs.filter(log => 
          this.logLevels[log.level] >= targetLevel
        )
      }

      // Filtrar por usuario
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => 
          log.userId === filters.userId
        )
      }

      // Filtrar por acción
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.includes(filters.action)
        )
      }

      // Filtrar por categoría
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => 
          log.category === filters.category
        )
      }

      // Filtrar por rango de fechas
      if (filters.startDate) {
        const start = new Date(filters.startDate)
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= start
        )
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate)
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= end
        )
      }

      // Ordenar
      if (filters.sortBy) {
        filteredLogs.sort((a, b) => {
          if (filters.sortBy === 'timestamp') {
            return new Date(b.timestamp) - new Date(a.timestamp)
          }
          if (filters.sortBy === 'severity') {
            return b.severity - a.severity
          }
          return 0
        })
      }

      // Limitar resultados
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(0, filters.limit)
      }

      return filteredLogs
    } catch (error) {
      console.error('Error searching logs:', error)
      return []
    }
  }

  /**
   * Obtener estadísticas de logs
   * @param {Object} filters - Filtros para estadísticas
   * @returns {Object} Estadísticas
   */
  getLogStats(filters = {}) {
    try {
      const logs = this.searchLogs(filters)
      
      const stats = {
        total: logs.length,
        byLevel: {},
        byCategory: {},
        byUser: {},
        byAction: {},
        timeRange: {
          earliest: null,
          latest: null
        },
        severity: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        }
      }

      logs.forEach(log => {
        // Por nivel
        stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1

        // Por categoría
        stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1

        // Por usuario
        stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1

        // Por acción
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1

        // Por severidad
        if (log.severity <= 2) stats.severity.low++
        else if (log.severity <= 4) stats.severity.medium++
        else if (log.severity <= 7) stats.severity.high++
        else stats.severity.critical++

        // Rango de tiempo
        const timestamp = new Date(log.timestamp)
        if (!stats.timeRange.earliest || timestamp < new Date(stats.timeRange.earliest)) {
          stats.timeRange.earliest = log.timestamp
        }
        if (!stats.timeRange.latest || timestamp > new Date(stats.timeRange.latest)) {
          stats.timeRange.latest = log.timestamp
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting log stats:', error)
      return {}
    }
  }

  /**
   * Generar ID único para log
   */
  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Sanitizar detalles del log
   * @param {Object} details - Detalles originales
   * @returns {Object} Detalles sanitizados
   */
  sanitizeDetails(details) {
    const sanitized = { ...details }
    
    // Remover información sensible
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'credit_card']
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    })

    // Limitar tamaño de strings
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '...[TRUNCATED]'
      }
    })

    return sanitized
  }

  /**
   * Construir contexto del log
   * @param {Object} context - Contexto proporcionado
   * @returns {Object} Contexto completo
   */
  buildContext(context) {
    return {
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'node',
      timestamp: new Date().toISOString(),
      ...context
    }
  }

  /**
   * Categorizar acción
   * @param {string} action - Acción a categorizar
   * @returns {string} Categoría
   */
  categorizeAction(action) {
    const categories = {
      'LOGIN': 'authentication',
      'LOGOUT': 'authentication',
      'AUTH': 'authentication',
      'SECURITY': 'security',
      'USER': 'user_management',
      'EMPLOYEE': 'employee_management',
      'COMPANY': 'company_management',
      'DATA': 'data_access',
      'ERROR': 'error',
      'PERFORMANCE': 'performance',
      'SYSTEM': 'system'
    }

    for (const [key, category] of Object.entries(categories)) {
      if (action.toUpperCase().includes(key)) {
        return category
      }
    }

    return 'general'
  }

  /**
   * Calcular severidad del evento
   * @param {string} level - Nivel de log
   * @param {string} action - Acción realizada
   * @param {Object} details - Detalles adicionales
   * @returns {number} Severidad (1-10)
   */
  calculateSeverity(level, action, details) {
    let severity = this.logLevels[level] || 1

    // Ajustar por tipo de acción
    if (action.includes('SECURITY') || action.includes('UNAUTHORIZED')) {
      severity += 3
    }
    if (action.includes('ERROR') || action.includes('FAILED')) {
      severity += 2
    }
    if (action.includes('CRITICAL')) {
      severity += 4
    }

    // Ajustar por detalles
    if (details.severity === 'HIGH') severity += 2
    if (details.severity === 'CRITICAL') severity += 4

    return Math.min(severity, 10)
  }

  /**
   * Obtener ID de sesión
   */
  getSessionId() {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('sessionId') || 'unknown'
    }
    return 'server_session'
  }

  /**
   * Obtener ID de request
   */
  getRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  /**
   * Obtener prioridad de seguridad
   * @param {string} severity - Severidad
   * @returns {number} Prioridad
   */
  getSecurityPriority(severity) {
    const priorities = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'CRITICAL': 4
    }
    return priorities[severity.toUpperCase()] || 1
  }

  /**
   * Enforzar límite de logs
   */
  enforceLogLimit() {
    if (this.logs.length > this.maxLogs) {
      const excess = this.logs.length - this.maxLogs
      this.logs.splice(0, excess)
      
      // Log de purga
      this.log('SYSTEM', 'LOGS_PURGED', {
        purgedCount: excess,
        remainingCount: this.logs.length
      }, 'INFO')
    }
  }

  /**
   * Log a consola para desarrollo
   * @param {Object} logEntry - Entrada de log
   */
  consoleLog(logEntry) {
    const { timestamp, userId, action, level, details } = logEntry
    const message = `[${timestamp}] ${level} - User: ${userId} - Action: ${action}`
    
    switch (level) {
      case 'DEBUG':
        console.debug(message, details)
        break
      case 'INFO':
        console.info(message, details)
        break
      case 'WARN':
        console.warn(message, details)
        break
      case 'ERROR':
      case 'CRITICAL':
        console.error(message, details)
        break
      default:
        console.log(message, details)
    }
  }

  /**
   * Persistir log (placeholder para implementación externa)
   * @param {Object} logEntry - Entrada de log
   */
  persistLog(logEntry) {
    // Placeholder para enviar a base de datos, archivo, o servicio externo
    // Ejemplo: enviar a Elasticsearch, Splunk, etc.
    
    if (process.env.NODE_ENV === 'production') {
      // Implementar persistencia en producción
      // this.sendToDatabase(logEntry)
      // this.sendToLogService(logEntry)
    }
  }

  /**
   * Exportar logs
   * @param {Object} filters - Filtros de exportación
   * @param {string} format - Formato de exportación (json, csv)
   * @returns {string} Datos exportados
   */
  exportLogs(filters = {}, format = 'json') {
    const logs = this.searchLogs(filters)
    
    if (format === 'csv') {
      return this.convertToCSV(logs)
    }
    
    return JSON.stringify(logs, null, 2)
  }

  /**
   * Convertir logs a CSV
   * @param {Array} logs - Logs a convertir
   * @returns {string} CSV
   */
  convertToCSV(logs) {
    if (logs.length === 0) return ''
    
    const headers = Object.keys(logs[0])
    const csvRows = [headers.join(',')]
    
    logs.forEach(log => {
      const values = headers.map(header => {
        const value = log[header]
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      })
      csvRows.push(values.join(','))
    })
    
    return csvRows.join('\n')
  }

  /**
   * Limpiar logs antiguos
   * @param {number} days - Días de retención
   */
  cleanupOldLogs(days = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const initialCount = this.logs.length
    this.logs = this.logs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    )
    
    const purgedCount = initialCount - this.logs.length
    
    if (purgedCount > 0) {
      this.log('SYSTEM', 'OLD_LOGS_CLEANED', {
        purgedCount,
        cutoffDate: cutoffDate.toISOString(),
        remainingCount: this.logs.length
      }, 'INFO')
    }
    
    return purgedCount
  }

  /**
   * Obtener resumen de actividad
   * @param {number} hours - Horas a analizar
   * @returns {Object} Resumen de actividad
   */
  getActivitySummary(hours = 24) {
    const since = new Date()
    since.setHours(since.getHours() - hours)
    
    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp) >= since
    )
    
    return {
      timeRange: `${hours}h`,
      totalEvents: recentLogs.length,
      uniqueUsers: new Set(recentLogs.map(log => log.userId)).size,
      errorRate: recentLogs.filter(log => log.level === 'ERROR').length / recentLogs.length,
      securityEvents: recentLogs.filter(log => log.category === 'security').length,
      topActions: this.getTopActions(recentLogs, 5)
    }
  }

  /**
   * Obtener acciones más frecuentes
   * @param {Array} logs - Logs a analizar
   * @param {number} limit - Límite de resultados
   * @returns {Array} Acciones más frecuentes
   */
  getTopActions(logs, limit = 5) {
    const actionCounts = {}
    
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
    })
    
    return Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([action, count]) => ({ action, count }))
  }
}

/**
 * Detector de Anomalías
 */
class AnomalyDetector {
  constructor() {
    this.baselineMetrics = {}
    this.thresholds = {
      failedLogins: 5,      // 5 intentos fallidos en 5 min
      dataAccess: 100,      // 100 accesos en 1 min
      errors: 10,           // 10 errores en 1 min
      securityEvents: 3     // 3 eventos de seguridad en 5 min
    }
    this.timeWindows = {
      short: 5 * 60 * 1000,    // 5 minutos
      medium: 60 * 60 * 1000,  // 1 hora
      long: 24 * 60 * 60 * 1000 // 24 horas
    }
  }

  /**
   * Analizar log en busca de anomalías
   * @param {Object} logEntry - Entrada de log
   */
  analyze(logEntry) {
    try {
      // Detectar patrones sospechosos
      this.detectFailedLogins(logEntry)
      this.detectExcessiveDataAccess(logEntry)
      this.detectErrorSpikes(logEntry)
      this.detectSecurityEvents(logEntry)
      this.detectUnusualAccess(logEntry)
    } catch (error) {
      console.error('Error in anomaly detection:', error)
    }
  }

  /**
   * Detectar intentos de login fallidos
   * @param {Object} logEntry - Entrada de log
   */
  detectFailedLogins(logEntry) {
    if (logEntry.action === 'LOGIN_FAILED') {
      const recentFailures = this.getRecentLogs(
        logEntry.userId, 
        'LOGIN_FAILED', 
        this.timeWindows.short
      )
      
      if (recentFailures.length >= this.thresholds.failedLogins) {
        this.triggerAnomalyAlert('BRUTE_FORCE_ATTACK', {
          userId: logEntry.userId,
          failureCount: recentFailures.length,
          timeWindow: '5 minutes'
        })
      }
    }
  }

  /**
   * Detectar acceso excesivo a datos
   * @param {Object} logEntry - Entrada de log
   */
  detectExcessiveDataAccess(logEntry) {
    if (logEntry.category === 'data_access') {
      const recentAccess = this.getRecentLogs(
        logEntry.userId,
        'DATA_ACCESS',
        this.timeWindows.short
      )
      
      if (recentAccess.length >= this.thresholds.dataAccess) {
        this.triggerAnomalyAlert('EXCESSIVE_DATA_ACCESS', {
          userId: logEntry.userId,
          accessCount: recentAccess.length,
          timeWindow: '5 minutes'
        })
      }
    }
  }

  /**
   * Detectar picos de errores
   * @param {Object} logEntry - Entrada de log
   */
  detectErrorSpikes(logEntry) {
    if (logEntry.level === 'ERROR') {
      const recentErrors = this.getRecentLogs(
        null,
        'ERROR_OCCURRED',
        this.timeWindows.short
      )
      
      if (recentErrors.length >= this.thresholds.errors) {
        this.triggerAnomalyAlert('ERROR_SPIKE', {
          errorCount: recentErrors.length,
          timeWindow: '5 minutes'
        })
      }
    }
  }

  /**
   * Detectar eventos de seguridad
   * @param {Object} logEntry - Entrada de log
   */
  detectSecurityEvents(logEntry) {
    if (logEntry.category === 'security') {
      const recentSecurityEvents = this.getRecentLogs(
        null,
        'SECURITY_EVENT',
        this.timeWindows.short
      )
      
      if (recentSecurityEvents.length >= this.thresholds.securityEvents) {
        this.triggerAnomalyAlert('SECURITY_EVENT_SPIKE', {
          eventCount: recentSecurityEvents.length,
          timeWindow: '5 minutes'
        })
      }
    }
  }

  /**
   * Detectar acceso inusual
   * @param {Object} logEntry - Entrada de log
   */
  detectUnusualAccess(logEntry) {
    // Detectar acceso fuera de horario normal
    const hour = new Date(logEntry.timestamp).getHours()
    if (hour < 6 || hour > 22) {
      if (logEntry.category === 'data_access' || logEntry.category === 'authentication') {
        this.triggerAnomalyAlert('UNUSUAL_HOURS_ACCESS', {
          userId: logEntry.userId,
          hour,
          action: logEntry.action
        })
      }
    }

    // Detectar acceso desde ubicación inusual (si está disponible)
    if (logEntry.context && logEntry.context.unusualLocation) {
      this.triggerAnomalyAlert('UNUSUAL_LOCATION_ACCESS', {
        userId: logEntry.userId,
        location: logEntry.context.location
      })
    }
  }

  /**
   * Obtener logs recientes
   * @param {string} userId - ID del usuario
   * @param {string} action - Acción a buscar
   * @param {number} timeWindow - Ventana de tiempo en ms
   * @returns {Array} Logs recientes
   */
  getRecentLogs(userId, action, timeWindow) {
    // Este método debería acceder al servicio de auditoría principal
    // Por ahora, retornamos array vacío como placeholder
    return []
  }

  /**
   * Disparar alerta de anomalía
   * @param {string} type - Tipo de anomalía
   * @param {Object} details - Detalles de la anomalía
   */
  triggerAnomalyAlert(type, details) {
    console.warn(`ANOMALY DETECTED: ${type}`, details)
    // Aquí se podría enviar a un sistema de alertas
  }
}

/**
 * Gestor de Alertas
 */
class AlertManager {
  constructor() {
    this.alertRules = new Map()
    this.activeAlerts = new Map()
    this.alertChannels = []
    this.setupDefaultRules()
  }

  /**
   * Configurar reglas por defecto
   */
  setupDefaultRules() {
    // Alerta de ataques de fuerza bruta
    this.alertRules.set('BRUTE_FORCE_ATTACK', {
      condition: 'failed_logins > 5 in 5m',
      severity: 'HIGH',
      channels: ['email', 'sms'],
      cooldown: 300 // 5 minutos
    })

    // Alerta de acceso excesivo
    this.alertRules.set('EXCESSIVE_DATA_ACCESS', {
      condition: 'data_access > 100 in 5m',
      severity: 'MEDIUM',
      channels: ['email'],
      cooldown: 600 // 10 minutos
    })

    // Alerta de picos de error
    this.alertRules.set('ERROR_SPIKE', {
      condition: 'errors > 10 in 5m',
      severity: 'HIGH',
      channels: ['email', 'slack'],
      cooldown: 300 // 5 minutos
    })
  }

  /**
   * Verificar alertas para un log
   * @param {Object} logEntry - Entrada de log
   */
  checkAlerts(logEntry) {
    // Implementar lógica de verificación de alertas
    // Por ahora, es un placeholder
  }

  /**
   * Enviar alerta
   * @param {string} type - Tipo de alerta
   * @param {Object} details - Detalles
   */
  sendAlert(type, details) {
    const rule = this.alertRules.get(type)
    if (!rule) return

    // Verificar cooldown
    if (this.isInCooldown(type)) return

    // Enviar a canales configurados
    rule.channels.forEach(channel => {
      this.sendToChannel(channel, type, details, rule.severity)
    })

    // Registrar cooldown
    this.setCooldown(type)
  }

  /**
   * Enviar a canal específico
   * @param {string} channel - Canal de envío
   * @param {string} type - Tipo de alerta
   * @param {Object} details - Detalles
   * @param {string} severity - Severidad
   */
  sendToChannel(channel, type, details, severity) {
    // Placeholder para implementación de canales
    console.log(`Alert sent to ${channel}: ${type} - ${severity}`, details)
  }

  /**
   * Verificar si está en cooldown
   * @param {string} type - Tipo de alerta
   * @returns {boolean} True si está en cooldown
   */
  isInCooldown(type) {
    const cooldown = this.activeAlerts.get(type)
    if (!cooldown) return false
    
    return Date.now() - cooldown.lastSent < cooldown.duration
  }

  /**
   * Establecer cooldown
   * @param {string} type - Tipo de alerta
   */
  setCooldown(type) {
    const rule = this.alertRules.get(type)
    if (!rule) return

    this.activeAlerts.set(type, {
      lastSent: Date.now(),
      duration: rule.cooldown * 1000
    })
  }
}

/**
 * Política de Retención
 */
class RetentionPolicy {
  constructor() {
    this.policies = {
      'authentication': 90,    // 90 días
      'security': 365,         // 1 año
      'data_access': 180,      // 6 meses
      'error': 30,             // 30 días
      'performance': 7,        // 7 días
      'general': 30            // 30 días
    }
  }

  /**
   * Obtener período de retención para categoría
   * @param {string} category - Categoría
   * @returns {number} Días de retención
   */
  getRetentionPeriod(category) {
    return this.policies[category] || this.policies.general
  }

  /**
   * Verificar si log debe ser retenido
   * @param {Object} logEntry - Entrada de log
   * @returns {boolean} True si debe ser retenido
   */
  shouldRetain(logEntry) {
    const retentionDays = this.getRetentionPeriod(logEntry.category)
    const logDate = new Date(logEntry.timestamp)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    return logDate >= cutoffDate
  }

  /**
   * Limpiar logs basados en política
   * @param {Array} logs - Logs a limpiar
   * @returns {Array} Logs después de limpieza
   */
  applyPolicy(logs) {
    return logs.filter(log => this.shouldRetain(log))
  }
}

// Crear instancia singleton
const auditService = new AuditService()

export default auditService
export { AuditService, AnomalyDetector, AlertManager, RetentionPolicy }