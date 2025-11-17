/**
 * Inicializador del Sistema de Monitoreo
 * Se ejecuta automáticamente al cargar la aplicación
 */

import healthMonitor from '../utils/applicationHealthMonitor.js';

// Configurar callbacks de alerta
healthMonitor.onAlert((type, message, data) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`🚨 [${timestamp}] ALERT: ${type} - ${message}`);
  
  // En producción, aquí podrías enviar notificaciones a Slack, email, etc.
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrar con sistema de notificaciones
  }
});

// Configurar límites personalizados según el entorno
const configureMonitoringLimits = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // En desarrollo, ser más permisivo
    healthMonitor.memoryThreshold = 200 * 1024 * 1024; // 200MB
    healthMonitor.processThreshold = 5; //允許更多進程
    console.log('🔧 Modo desarrollo: límites de monitoreo relajados');
  } else {
    // En producción, ser más estricto
    healthMonitor.memoryThreshold = 100 * 1024 * 1024; // 100MB
    healthMonitor.processThreshold = 2; // Solo 2 procesos máximo
    console.log('🚀 Modo producción: límites de monitoreo estrictos');
  }
};

// Inicializar monitoreo
const initializeHealthMonitoring = () => {
  try {
    configureMonitoringLimits();
    
    // Iniciar monitoreo automático
    healthMonitor.startMonitoring(30000); // Cada 30 segundos
    
    console.log('✅ Sistema de monitoreo de salud inicializado');
    
    // Realizar primera verificación
    setTimeout(async () => {
      const report = await healthMonitor.performHealthCheck();
      console.log('🔍 Primera verificación de salud completada');
      
      if (report) {
        const healthReport = healthMonitor.generateHealthReport();
        console.log('📊 Estado de salud:', healthReport.summary.status);
        
        if (healthReport.recommendations.length > 0) {
          console.log('💡 Recomendaciones:', healthReport.recommendations);
        }
      }
    }, 2000);
    
    // Exponer funciones útiles globalmente para debugging
    if (typeof window !== 'undefined') {
      window.healthMonitor = healthMonitor;
      console.log('🔧 healthMonitor disponible en window para debugging');
    }
    
  } catch (error) {
    console.error('❌ Error inicializando monitoreo de salud:', error);
  }
};

// Auto-inicializar si estamos en el entorno correcto
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  initializeHealthMonitoring();
}

// Exportar para uso manual si es necesario
export { initializeHealthMonitoring };
export default healthMonitor;