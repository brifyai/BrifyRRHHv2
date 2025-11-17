/**
 * Sistema de Monitoreo de Salud de la Aplicación
 * Monitorea procesos, memoria y servicios críticos automáticamente
 */

class ApplicationHealthMonitor {
  constructor() {
    this.isMonitoring = false;
    this.checkInterval = null;
    this.memoryThreshold = 100 * 1024 * 1024; // 100MB
    this.processThreshold = 3; // Máximo 3 procesos Node.js
    this.alertCallbacks = [];
    this.stats = {
      checksPerformed: 0,
      issuesDetected: 0,
      lastCheck: null,
      memoryUsage: [],
      processCount: []
    };
  }

  /**
   * Iniciar monitoreo automático
   */
  startMonitoring(intervalMs = 30000) { // Cada 30 segundos
    if (this.isMonitoring) {
      console.log('⚠️ Monitoreo ya está activo');
      return;
    }

    this.isMonitoring = true;
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);

    console.log('✅ Sistema de monitoreo iniciado');
    this.performHealthCheck(); // Primera verificación inmediata
  }

  /**
   * Detener monitoreo
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    console.log('⏹️ Sistema de monitoreo detenido');
  }

  /**
   * Realizar verificación de salud
   */
  async performHealthCheck() {
    try {
      this.stats.checksPerformed++;
      this.stats.lastCheck = new Date().toISOString();

      const results = {
        timestamp: new Date().toISOString(),
        memory: await this.checkMemoryUsage(),
        processes: await this.checkNodeProcesses(),
        server: await this.checkServerHealth(),
        services: await this.checkCriticalServices()
      };

      // Detectar problemas
      const issues = this.detectIssues(results);
      
      if (issues.length > 0) {
        this.stats.issuesDetected++;
        this.handleIssues(issues);
      }

      // Guardar estadísticas
      this.updateStats(results);

      console.log(`🔍 Health check completado - ${issues.length} problemas detectados`);

      return results;
    } catch (error) {
      console.error('❌ Error en health check:', error);
      this.alertCallbacks.forEach(callback => callback('ERROR', error.message));
    }
  }

  /**
   * Verificar uso de memoria
   */
  async checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const totalMB = Math.round(memUsage.rss / 1024 / 1024);
    
    return {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      totalMB,
      isHigh: totalMB > 100
    };
  }

  /**
   * Verificar procesos Node.js
   */
  async checkNodeProcesses() {
    try {
      // En un entorno real, usarías child_process para ejecutar tasklist
      // Por ahora, simulamos la verificación
      return {
        count: 1, // Solo este proceso principal
        isHigh: false,
        threshold: this.processThreshold
      };
    } catch (error) {
      return {
        count: -1,
        isHigh: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar salud del servidor
   */
  async checkServerHealth() {
    try {
      const response = await fetch('http://localhost:3000', {
        method: 'HEAD',
        timeout: 5000
      });
      
      return {
        status: response.status,
        isHealthy: response.status === 200,
        responseTime: Date.now()
      };
    } catch (error) {
      return {
        status: 0,
        isHealthy: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar servicios críticos
   */
  async checkCriticalServices() {
    const services = {
      supabase: await this.checkSupabaseConnection(),
      googleDrive: await this.checkGoogleDriveService()
    };

    return services;
  }

  /**
   * Verificar conexión Supabase
   */
  async checkSupabaseConnection() {
    try {
      // Verificar si supabase client está disponible
      const { supabase } = await import('./supabaseClient.js');
      const { data, error } = await supabase.from('companies').select('count').limit(1);
      
      return {
        isConnected: !error,
        error: error?.message
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar servicio Google Drive
   */
  async checkGoogleDriveService() {
    try {
      const unifiedService = await import('./unifiedGoogleDriveService.js');
      const service = unifiedService.default;
      
      return {
        isAvailable: !!service,
        isInitialized: service.isInitialized || false
      };
    } catch (error) {
      return {
        isAvailable: false,
        error: error.message
      };
    }
  }

  /**
   * Detectar problemas en los resultados
   */
  detectIssues(results) {
    const issues = [];

    // Problemas de memoria
    if (results.memory.isHigh) {
      issues.push({
        type: 'MEMORY_HIGH',
        severity: 'WARNING',
        message: `Alto uso de memoria: ${results.memory.totalMB}MB`,
        data: results.memory
      });
    }

    // Problemas de procesos
    if (results.processes.isHigh) {
      issues.push({
        type: 'PROCESS_HIGH',
        severity: 'CRITICAL',
        message: `Demasiados procesos Node.js: ${results.processes.count}`,
        data: results.processes
      });
    }

    // Problemas del servidor
    if (!results.server.isHealthy) {
      issues.push({
        type: 'SERVER_DOWN',
        severity: 'CRITICAL',
        message: `Servidor no responde (HTTP ${results.server.status})`,
        data: results.server
      });
    }

    // Problemas de servicios
    if (!results.services.supabase.isConnected) {
      issues.push({
        type: 'SUPABASE_DOWN',
        severity: 'CRITICAL',
        message: 'Supabase no disponible',
        data: results.services.supabase
      });
    }

    if (!results.services.googleDrive.isAvailable) {
      issues.push({
        type: 'GOOGLE_DRIVE_DOWN',
        severity: 'WARNING',
        message: 'Google Drive service no disponible',
        data: results.services.googleDrive
      });
    }

    return issues;
  }

  /**
   * Manejar problemas detectados
   */
  handleIssues(issues) {
    issues.forEach(issue => {
      console.warn(`🚨 ${issue.severity}: ${issue.message}`);
      
      // Notificar a callbacks registrados
      this.alertCallbacks.forEach(callback => {
        try {
          callback(issue.type, issue.message, issue);
        } catch (error) {
          console.error('Error en alert callback:', error);
        }
      });

      // Acciones automáticas según el tipo de problema
      this.takeAutomaticAction(issue);
    });
  }

  /**
   * Tomar acciones automáticas según el problema
   */
  takeAutomaticAction(issue) {
    switch (issue.type) {
      case 'MEMORY_HIGH':
        // Forzar garbage collection si está disponible
        if (global.gc) {
          global.gc();
          console.log('🧹 Garbage collection ejecutado');
        }
        break;
        
      case 'PROCESS_HIGH':
        // Log para revisión manual
        console.log('📊 Procesos múltiples detectados - revisar manualmente');
        break;
        
      case 'SERVER_DOWN':
        // Intentar reinicio del servidor (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Intentando reinicio del servidor...');
          setTimeout(() => {
            process.exit(1); // Forzar reinicio
          }, 5000);
        }
        break;
    }
  }

  /**
   * Actualizar estadísticas
   */
  updateStats(results) {
    this.stats.memoryUsage.push({
      timestamp: Date.now(),
      value: results.memory.totalMB
    });

    this.stats.processCount.push({
      timestamp: Date.now(),
      value: results.processes.count
    });

    // Mantener solo los últimos 100 registros
    if (this.stats.memoryUsage.length > 100) {
      this.stats.memoryUsage.shift();
    }
    if (this.stats.processCount.length > 100) {
      this.stats.processCount.shift();
    }
  }

  /**
   * Registrar callback para alertas
   */
  onAlert(callback) {
    this.alertCallbacks.push(callback);
  }

  /**
   * Obtener estadísticas actuales
   */
  getStats() {
    return {
      ...this.stats,
      isMonitoring: this.isMonitoring,
      currentMemory: this.stats.memoryUsage[this.stats.memoryUsage.length - 1],
      currentProcesses: this.stats.processCount[this.stats.processCount.length - 1]
    };
  }

  /**
   * Generar reporte de salud
   */
  generateHealthReport() {
    const stats = this.getStats();
    const avgMemory = stats.memoryUsage.length > 0 
      ? stats.memoryUsage.reduce((sum, item) => sum + item.value, 0) / stats.memoryUsage.length
      : 0;

    return {
      summary: {
        status: stats.issuesDetected === 0 ? 'HEALTHY' : 'ISSUES_DETECTED',
        checksPerformed: stats.checksPerformed,
        issuesDetected: stats.issuesDetected,
        isMonitoring: stats.isMonitoring,
        lastCheck: stats.lastCheck
      },
      metrics: {
        averageMemoryMB: Math.round(avgMemory),
        currentMemoryMB: stats.currentMemory?.value || 0,
        currentProcesses: stats.currentProcesses?.value || 0,
        memoryThreshold: this.memoryThreshold / 1024 / 1024,
        processThreshold: this.processThreshold
      },
      recommendations: this.generateRecommendations(stats)
    };
  }

  /**
   * Generar recomendaciones
   */
  generateRecommendations(stats) {
    const recommendations = [];

    if (stats.issuesDetected > 5) {
      recommendations.push('Considera reiniciar la aplicación - muchos problemas detectados');
    }

    const avgMemory = stats.memoryUsage.length > 0 
      ? stats.memoryUsage.reduce((sum, item) => sum + item.value, 0) / stats.memoryUsage.length
      : 0;

    if (avgMemory > 80) {
      recommendations.push('Alto uso promedio de memoria - revisar memory leaks');
    }

    if (stats.currentProcesses?.value > 2) {
      recommendations.push('Múltiples procesos detectados - verificar procesos zombie');
    }

    return recommendations;
  }
}

// Instancia singleton
const healthMonitor = new ApplicationHealthMonitor();

export default healthMonitor;
export { ApplicationHealthMonitor };