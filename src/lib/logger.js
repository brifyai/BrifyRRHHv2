/**
 * Sistema Centralizado de Logging
 * 
 * Proporciona una interfaz unificada para logging estructurado
 * con diferentes niveles y destinos.
 */

import { errorHandler } from './errorHandler.js';

// Niveles de logging
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

// Nombres de niveles para logging
export const LogLevelNames = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL'
};

// Colores para consola (solo en desarrollo)
const ConsoleColors = {
  [LogLevel.DEBUG]: '#6c757d',
  [LogLevel.INFO]: '#007bff',
  [LogLevel.WARN]: '#ffc107',
  [LogLevel.ERROR]: '#dc3545',
  [LogLevel.FATAL]: '#6f42c1'
};

// Clase principal del logger
class Logger {
  constructor() {
    this.currentLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
    this.logHistory = [];
    this.maxHistorySize = 1000;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.transports = [];
    
    // Configurar transportes por defecto
    this.setupDefaultTransports();
  }

  // Configurar transportes por defecto
  setupDefaultTransports() {
    // Transporte de consola siempre activo
    this.addTransport(new ConsoleTransport());
    
    // Transporte de memoria en desarrollo
    if (this.isDevelopment) {
      this.addTransport(new MemoryTransport());
    }
    
    // Transporte a servicio externo en producción
    if (!this.isDevelopment) {
      // this.addTransport(new ExternalServiceTransport());
    }
  }

  // Establecer nivel de logging
  setLevel(level) {
    this.currentLevel = level;
  }

  // Obtener nivel actual
  getLevel() {
    return this.currentLevel;
  }

  // Agregar transporte
  addTransport(transport) {
    if (!transport || typeof transport.log !== 'function') {
      throw new Error('Transporte debe tener un método log');
    }
    this.transports.push(transport);
  }

  // Método principal de logging
  log(level, message, context = {}) {
    // Verificar si el nivel está habilitado
    if (level < this.currentLevel) {
      return;
    }

    // Crear entrada de log estructurada
    const logEntry = this.createLogEntry(level, message, context);
    
    // Enviar a todos los transportes
    this.transports.forEach(transport => {
      try {
        transport.log(logEntry);
      } catch (error) {
        console.error('Error en transporte de logging:', error);
      }
    });
    
    // Mantener historial
    this.addToHistory(logEntry);
    
    // Si es un error fatal, reportar al manejador de errores
    if (level >= LogLevel.ERROR) {
      errorHandler.handleError(message, {
        ...context,
        level: LogLevelNames[level],
        timestamp: logEntry.timestamp
      });
    }
  }

  // Crear entrada de log estructurada
  createLogEntry(level, message, context) {
    return {
      level,
      levelName: LogLevelNames[level],
      message,
      context,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    };
  }

  // Agregar al historial
  addToHistory(logEntry) {
    this.logHistory.push(logEntry);
    
    // Mantener tamaño del historial
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.maxHistorySize);
    }
  }

  // Métodos de conveniencia para cada nivel
  debug(message, context = {}) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message, context = {}) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message, context = {}) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message, context = {}) {
    this.log(LogLevel.ERROR, message, context);
  }

  fatal(message, context = {}) {
    this.log(LogLevel.FATAL, message, context);
  }

  // Logging de rendimiento
  time(label) {
    console.time(label);
  }

  timeEnd(label) {
    console.timeEnd(label);
    this.info(`Performance: ${label}`, { type: 'performance' });
  }

  // Logging de métricas
  metric(name, value, context = {}) {
    this.info(`Metric: ${name} = ${value}`, {
      ...context,
      type: 'metric',
      metricName: name,
      metricValue: value
    });
  }

  // Logging de eventos de usuario
  userAction(action, context = {}) {
    this.info(`User Action: ${action}`, {
      ...context,
      type: 'user_action',
      action
    });
  }

  // Logging de eventos de negocio
  businessEvent(event, context = {}) {
    this.info(`Business Event: ${event}`, {
      ...context,
      type: 'business_event',
      event
    });
  }

  // Obtener historial de logs
  getHistory(filter = {}) {
    let history = [...this.logHistory];
    
    if (filter.level) {
      history = history.filter(entry => entry.level === filter.level);
    }
    
    if (filter.type) {
      history = history.filter(entry => entry.context.type === filter.type);
    }
    
    if (filter.since) {
      const since = new Date(filter.since);
      history = history.filter(entry => new Date(entry.timestamp) >= since);
    }
    
    if (filter.limit) {
      history = history.slice(-filter.limit);
    }
    
    return history;
  }

  // Obtener estadísticas de logging
  getStats() {
    const stats = {
      total: this.logHistory.length,
      byLevel: {},
      byType: {},
      recent: this.getHistory({ limit: 10 })
    };

    this.logHistory.forEach(entry => {
      stats.byLevel[entry.levelName] = (stats.byLevel[entry.levelName] || 0) + 1;
      
      if (entry.context.type) {
        stats.byType[entry.context.type] = (stats.byType[entry.context.type] || 0) + 1;
      }
    });

    return stats;
  }

  // Limpiar historial
  clearHistory() {
    this.logHistory = [];
  }

  // Exportar logs
  exportLogs(format = 'json') {
    const logs = this.logHistory;
    
    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);
      case 'csv':
        return this.convertToCSV(logs);
      case 'txt':
        return this.convertToText(logs);
      default:
        return logs;
    }
  }

  // Convertir a CSV
  convertToCSV(logs) {
    if (logs.length === 0) return '';
    
    const headers = ['timestamp', 'level', 'message', 'context'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = [
        log.timestamp,
        log.levelName,
        `"${log.message.replace(/"/g, '""')}"`,
        `"${JSON.stringify(log.context).replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Convertir a texto plano
  convertToText(logs) {
    return logs.map(log => {
      return `[${log.timestamp}] ${log.levelName}: ${log.message} ${JSON.stringify(log.context)}`;
    }).join('\n');
  }
}

// Transporte de consola
class ConsoleTransport {
  log(logEntry) {
    const { level, levelName, message, context, timestamp } = logEntry;
    const color = ConsoleColors[level];
    
    // Formato mejorado para consola
    const formattedMessage = `%c[${timestamp}] ${levelName}: ${message}`;
    const styles = [`color: ${color}; font-weight: bold;`];
    
    // Usar el método apropiado de consola
    const consoleMethod = this.getConsoleMethod(level);
    
    consoleMethod(
      formattedMessage,
      ...styles,
      '\nContext:',
      context,
      '\n'
    );
  }

  getConsoleMethod(level) {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error;
      default:
        return console.log;
    }
  }
}

// Transporte de memoria (para desarrollo)
class MemoryTransport {
  constructor() {
    this.logs = [];
    this.maxSize = 100;
  }

  log(logEntry) {
    this.logs.push(logEntry);
    
    if (this.logs.length > this.maxSize) {
      this.logs = this.logs.slice(-this.maxSize);
    }
  }

  getLogs() {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }
}

// Transporte a servicio externo (placeholder)
class ExternalServiceTransport {
  async log(logEntry) {
    try {
      // Aquí se podría implementar el envío a servicios como:
      // - Sentry
      // - LogRocket
      // - Datadog
      // - Custom logging service
      
      if (logEntry.level >= LogLevel.ERROR) {
        // Solo enviar errores y errores fatales
        await this.sendToService(logEntry);
      }
    } catch (error) {
      console.error('Error al enviar log a servicio externo:', error);
    }
  }

  async sendToService(logEntry) {
    // Ejemplo de implementación:
    // await fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry)
    // });
    
    console.log('Enviando log a servicio externo:', logEntry);
  }
}

// Crear instancia global del logger
const logger = new Logger();

// Exportar instancia y clases
export default logger;
export { Logger, ConsoleTransport, MemoryTransport, ExternalServiceTransport };