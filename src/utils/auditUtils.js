/**
 * Audit Utilities
 * Utilidades simplificadas para Auditoría y Logging
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import auditService from '../lib/auditService.js'

/**
 * Registrar evento de auditoría simple
 * @param {string} userId - ID del usuario
 * @param {string} action - Acción realizada
 * @param {Object} details - Detalles adicionales
 * @returns {string} ID del log creado
 */
export const logEvent = (userId, action, details = {}) => {
  return auditService.log(userId, action, details, 'INFO')
}

/**
 * Registrar evento de seguridad
 * @param {string} userId - ID del usuario
 * @param {string} event - Evento de seguridad
 * @param {Object} details - Detalles del evento
 * @param {string} severity - Severidad (LOW, MEDIUM, HIGH, CRITICAL)
 * @returns {string} ID del log creado
 */
export const logSecurity = (userId, event, details = {}, severity = 'MEDIUM') => {
  return auditService.logSecurityEvent(userId, event, details, severity)
}

/**
 * Registrar evento de autenticación
 * @param {string} userId - ID del usuario
 * @param {string} event - Evento de autenticación
 * @param {Object} details - Detalles del evento
 * @param {boolean} success - Si fue exitoso
 * @returns {string} ID del log creado
 */
export const logAuth = (userId, event, details = {}, success = true) => {
  return auditService.logAuthEvent(userId, event, details, success)
}

/**
 * Registrar acceso a datos
 * @param {string} userId - ID del usuario
 * @param {string} resource - Recurso accedido
 * @param {string} action - Acción realizada
 * @param {Object} details - Detalles del acceso
 * @returns {string} ID del log creado
 */
export const logDataAccess = (userId, resource, action, details = {}) => {
  return auditService.logDataAccess(userId, resource, action, details)
}

/**
 * Registrar error
 * @param {string} userId - ID del usuario
 * @param {Error|string} error - Error ocurrido
 * @param {Object} context - Contexto del error
 * @returns {string} ID del log creado
 */
export const logError = (userId, error, context = {}) => {
  const errorObj = typeof error === 'string' ? new Error(error) : error
  return auditService.logError(userId, errorObj, context)
}

/**
 * Registrar métrica de rendimiento
 * @param {string} operation - Operación medida
 * @param {number} duration - Duración en ms
 * @param {Object} metrics - Métricas adicionales
 * @returns {string} ID del log creado
 */
export const logPerformance = (operation, duration, metrics = {}) => {
  return auditService.logPerformance(operation, duration, metrics)
}

/**
 * Registrar advertencia
 * @param {string} userId - ID del usuario
 * @param {string} action - Acción que generó advertencia
 * @param {Object} details - Detalles de la advertencia
 * @returns {string} ID del log creado
 */
export const logWarning = (userId, action, details = {}) => {
  return auditService.log(userId, action, details, 'WARN')
}

/**
 * Registrar evento crítico
 * @param {string} userId - ID del usuario
 * @param {string} action - Acción crítica
 * @param {Object} details - Detalles del evento
 * @returns {string} ID del log creado
 */
export const logCritical = (userId, action, details = {}) => {
  return auditService.log(userId, action, details, 'CRITICAL')
}

/**
 * Registrar evento de depuración
 * @param {string} userId - ID del usuario
 * @param {string} action - Acción de depuración
 * @param {Object} details - Detalles del evento
 * @returns {string} ID del log creado
 */
export const logDebug = (userId, action, details = {}) => {
  return auditService.log(userId, action, details, 'DEBUG')
}

/**
 * Buscar logs con filtros simples
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Array} Logs filtrados
 */
export const searchLogs = (filters = {}) => {
  return auditService.searchLogs(filters)
}

/**
 * Obtener logs de usuario específico
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones adicionales
 * @returns {Array} Logs del usuario
 */
export const getUserLogs = (userId, options = {}) => {
  return auditService.searchLogs({ userId, ...options })
}

/**
 * Obtener logs de seguridad
 * @param {Object} filters - Filtros adicionales
 * @returns {Array} Logs de seguridad
 */
export const getSecurityLogs = (filters = {}) => {
  return auditService.searchLogs({ category: 'security', ...filters })
}

/**
 * Obtener logs de errores
 * @param {Object} filters - Filtros adicionales
 * @returns {Array} Logs de errores
 */
export const getErrorLogs = (filters = {}) => {
  return auditService.searchLogs({ level: 'ERROR', ...filters })
}

/**
 * Obtener logs de autenticación
 * @param {Object} filters - Filtros adicionales
 * @returns {Array} Logs de autenticación
 */
export const getAuthLogs = (filters = {}) => {
  return auditService.searchLogs({ category: 'authentication', ...filters })
}

/**
 * Obtener logs por rango de fechas
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @param {Object} filters - Filtros adicionales
 * @returns {Array} Logs en rango de fechas
 */
export const getLogsByDateRange = (startDate, endDate, filters = {}) => {
  return auditService.searchLogs({ startDate, endDate, ...filters })
}

/**
 * Obtener logs recientes
 * @param {number} hours - Horas hacia atrás
 * @param {Object} filters - Filtros adicionales
 * @returns {Array} Logs recientes
 */
export const getRecentLogs = (hours = 24, filters = {}) => {
  const startDate = new Date()
  startDate.setHours(startDate.getHours() - hours)
  
  return auditService.searchLogs({ startDate, ...filters })
}

/**
 * Obtener estadísticas de logs
 * @param {Object} filters - Filtros para estadísticas
 * @returns {Object} Estadísticas
 */
export const getLogStats = (filters = {}) => {
  return auditService.getLogStats(filters)
}

/**
 * Obtener resumen de actividad
 * @param {number} hours - Horas a analizar
 * @returns {Object} Resumen de actividad
 */
export const getActivitySummary = (hours = 24) => {
  return auditService.getActivitySummary(hours)
}

/**
 * Exportar logs a JSON
 * @param {Object} filters - Filtros de exportación
 * @returns {string} JSON con logs
 */
export const exportLogsJSON = (filters = {}) => {
  return auditService.exportLogs(filters, 'json')
}

/**
 * Exportar logs a CSV
 * @param {Object} filters - Filtros de exportación
 * @returns {string} CSV con logs
 */
export const exportLogsCSV = (filters = {}) => {
  return auditService.exportLogs(filters, 'csv')
}

/**
 * Limpiar logs antiguos
 * @param {number} days - Días de retención
 * @returns {number} Cantidad de logs eliminados
 */
export const cleanupOldLogs = (days = 30) => {
  return auditService.cleanupOldLogs(days)
}

/**
 * Middleware para logging de Express
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next function
 */
export const auditMiddleware = (req, res, next) => {
  const startTime = Date.now()
  
  // Capturar respuesta
  const originalSend = res.send
  res.send = function(data) {
    const duration = Date.now() - startTime
    const userId = req.user?.id || 'anonymous'
    
    // Log de la solicitud
    logEvent(userId, 'HTTP_REQUEST', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    })
    
    return originalSend.call(this, data)
  }
  
  next()
}

/**
 * Middleware para logging de errores
 * @param {Error} error - Error ocurrido
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next function
 */
export const errorAuditMiddleware = (error, req, res, next) => {
  const userId = req.user?.id || 'anonymous'
  
  logError(userId, error, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip
  })
  
  next(error)
}

/**
 * Decorador para logging de métodos
 * @param {string} action - Acción a loguear
 * @param {Object} options - Opciones adicionales
 * @returns {Function} Decorador
 */
export const logMethod = (action, options = {}) => {
  return (target, propertyName, descriptor) => {
    const method = descriptor.value
    
    descriptor.value = function(...args) {
      const userId = this.user?.id || 'anonymous'
      const startTime = Date.now()
      
      try {
        const result = method.apply(this, args)
        
        // Log de éxito
        if (result instanceof Promise) {
          return result
            .then(res => {
              const duration = Date.now() - startTime
              logEvent(userId, action, {
                method: propertyName,
                duration,
                success: true,
                ...options
              })
              return res
            })
            .catch(error => {
              const duration = Date.now() - startTime
              logError(userId, error, {
                method: propertyName,
                duration,
                ...options
              })
              throw error
            })
        } else {
          const duration = Date.now() - startTime
          logEvent(userId, action, {
            method: propertyName,
            duration,
            success: true,
            ...options
          })
          return result
        }
      } catch (error) {
        const duration = Date.now() - startTime
        logError(userId, error, {
          method: propertyName,
          duration,
          ...options
        })
        throw error
      }
    }
    
    return descriptor
  }
}

/**
 * Decorador para medición de rendimiento
 * @param {string} operation - Nombre de la operación
 * @returns {Function} Decorador
 */
export const measurePerformance = (operation) => {
  return (target, propertyName, descriptor) => {
    const method = descriptor.value
    
    descriptor.value = function(...args) {
      const startTime = Date.now()
      
      try {
        const result = method.apply(this, args)
        
        if (result instanceof Promise) {
          return result
            .then(res => {
              const duration = Date.now() - startTime
              logPerformance(operation, duration, {
                method: propertyName
              })
              return res
            })
            .catch(error => {
              const duration = Date.now() - startTime
              logPerformance(operation, duration, {
                method: propertyName,
                error: error.message
              })
              throw error
            })
        } else {
          const duration = Date.now() - startTime
          logPerformance(operation, duration, {
            method: propertyName
          })
          return result
        }
      } catch (error) {
        const duration = Date.now() - startTime
        logPerformance(operation, duration, {
          method: propertyName,
          error: error.message
        })
        throw error
      }
    }
    
    return descriptor
  }
}

/**
 * Función de utilidad para logging con contexto automático
 * @param {string} level - Nivel de log
 * @returns {Function} Función de logging
 */
export const createLogger = (level = 'INFO') => {
  return (userId, action, details = {}) => {
    return auditService.log(userId, action, details, level)
  }
}

/**
 * Logger específico para seguridad
 */
export const securityLogger = {
  loginAttempt: (userId, success, details = {}) => 
    logAuth(userId, 'LOGIN_ATTEMPT', details, success),
  
  loginFailed: (userId, reason, details = {}) => 
    logSecurity(userId, 'LOGIN_FAILED', { reason, ...details }, 'MEDIUM'),
  
  passwordChange: (userId, success, details = {}) => 
    logAuth(userId, 'PASSWORD_CHANGE', details, success),
  
  suspiciousActivity: (userId, activity, details = {}) => 
    logSecurity(userId, 'SUSPICIOUS_ACTIVITY', { activity, ...details }, 'HIGH'),
  
  unauthorizedAccess: (userId, resource, details = {}) => 
    logSecurity(userId, 'UNAUTHORIZED_ACCESS', { resource, ...details }, 'HIGH'),
  
  dataBreach: (userId, data, details = {}) => 
    logSecurity(userId, 'DATA_BREACH', { data, ...details }, 'CRITICAL')
}

/**
 * Logger específico para aplicaciones
 */
export const appLogger = {
  userAction: (userId, action, details = {}) => 
    logEvent(userId, `USER_${action.toUpperCase()}`, details),
  
  systemEvent: (event, details = {}) => 
    logEvent('SYSTEM', event, details),
  
  apiCall: (userId, endpoint, method, duration, statusCode) => 
    logEvent(userId, 'API_CALL', {
      endpoint,
      method,
      duration,
      statusCode
    }),
  
  databaseQuery: (userId, table, operation, duration) => 
    logDataAccess(userId, table, operation, { duration }),
  
  fileAccess: (userId, filename, operation, details = {}) => 
    logDataAccess(userId, filename, operation, details)
}

/**
 * Logger específico para rendimiento
 */
export const performanceLogger = {
  slowQuery: (query, duration, details = {}) => 
    logPerformance('SLOW_QUERY', duration, { query, ...details }),
  
  memoryUsage: (used, total, details = {}) => 
    logPerformance('MEMORY_USAGE', used, { total, ...details }),
  
  cpuUsage: (usage, details = {}) => 
    logPerformance('CPU_USAGE', usage, details),
  
  responseTime: (endpoint, duration, details = {}) => 
    logPerformance('RESPONSE_TIME', duration, { endpoint, ...details }),
  
  throughput: (operations, timeWindow, details = {}) => 
    logPerformance('THROUGHPUT', operations, { timeWindow, ...details })
}

/**
 * Función para crear logs estructurados
 * @param {string} userId - ID del usuario
 * @param {string} event - Evento
 * @param {Object} data - Datos estructurados
 * @param {string} level - Nivel de log
 * @returns {string} ID del log creado
 */
export const logStructured = (userId, event, data = {}, level = 'INFO') => {
  const structuredData = {
    event,
    timestamp: new Date().toISOString(),
    data,
    schema: '1.0'
  }
  
  return auditService.log(userId, event, structuredData, level)
}

/**
 * Función para logging asíncrono con batch
 * @param {Array} logs - Array de logs para procesar
 * @returns {Promise<Array>} IDs de logs creados
 */
export const batchLog = async (logs) => {
  const results = []
  
  for (const logEntry of logs) {
    try {
      const { userId, action, details = {}, level = 'INFO' } = logEntry
      const logId = auditService.log(userId, action, details, level)
      results.push(logId)
    } catch (error) {
      console.error('Error in batch log:', error)
      results.push(null)
    }
  }
  
  return results
}

/**
 * Función para obtener métricas de auditoría
 * @param {Object} options - Opciones de métricas
 * @returns {Object} Métricas de auditoría
 */
export const getAuditMetrics = (options = {}) => {
  const { hours = 24, category, userId } = options
  
  const filters = {}
  if (category) filters.category = category
  if (userId) filters.userId = userId
  
  const stats = auditService.getLogStats(filters)
  const summary = auditService.getActivitySummary(hours)
  
  return {
    timeRange: `${hours}h`,
    stats,
    summary,
    generatedAt: new Date().toISOString()
  }
}

/**
 * Función para verificar salud del sistema de auditoría
 * @returns {Object} Estado de salud del sistema
 */
export const getAuditHealth = () => {
  try {
    const totalLogs = auditService.logs.length
    const recentLogs = getRecentLogs(1)
    const errorRate = recentLogs.filter(log => log.level === 'ERROR').length / recentLogs.length
    
    return {
      status: 'healthy',
      totalLogs,
      recentActivity: recentLogs.length,
      errorRate: errorRate.toFixed(4),
      lastLog: recentLogs.length > 0 ? recentLogs[0].timestamp : null,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      checkedAt: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      checkedAt: new Date().toISOString()
    }
  }
}

export default {
  logEvent,
  logSecurity,
  logAuth,
  logDataAccess,
  logError,
  logPerformance,
  logWarning,
  logCritical,
  logDebug,
  searchLogs,
  getUserLogs,
  getSecurityLogs,
  getErrorLogs,
  getAuthLogs,
  getLogsByDateRange,
  getRecentLogs,
  getLogStats,
  getActivitySummary,
  exportLogsJSON,
  exportLogsCSV,
  cleanupOldLogs,
  auditMiddleware,
  errorAuditMiddleware,
  logMethod,
  measurePerformance,
  createLogger,
  securityLogger,
  appLogger,
  performanceLogger,
  logStructured,
  batchLog,
  getAuditMetrics,
  getAuditHealth
}