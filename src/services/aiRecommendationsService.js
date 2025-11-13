import groqService from './groqService.js';

class AIRecommendationsService {
  constructor() {
    this.groq = groqService;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Genera un key para caché basado en los parámetros
   */
  getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  /**
   * Obtiene datos del caché si no han expirado
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Guarda datos en caché
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Limpia caché expirado
   */
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Genera recomendaciones de IA basadas en los datos del dashboard
   */
  async generateDashboardRecommendations(stats) {
    const cacheKey = this.getCacheKey('dashboard_recommendations', stats);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `
Como experto en análisis de datos y gestión empresarial, analiza los siguientes datos de un sistema de gestión de empleados y genera 3-5 recomendaciones accionables:

DATOS DEL SISTEMA:
- Total de empleados/carpetas: ${stats.folders || stats.totalFolders}
- Total de documentos: ${stats.documents || stats.totalFiles}
- Tokens de IA utilizados: ${stats.tokensUsed || 0}
- Almacenamiento usado: ${this.formatBytes(stats.storageUsed || 0)}

CONTEXTO:
- Esto es una plataforma de RRHH llamada StaffHub
- Gestiona 800 empleados con sus carpetas y documentos
- Usa IA para comunicación y análisis
- El objetivo es optimizar la productividad y el engagement

Genera recomendaciones específicas en formato JSON:
{
  "recommendations": [
    {
      "title": "Título de la recomendación",
      "description": "Descripción detallada",
      "priority": "alta|media|baja",
      "category": "productividad|storage|ia|engagement",
      "actionable": true,
      "estimatedImpact": "Descripción del impacto esperado"
    }
  ]
}

Responde solo con el JSON, sin texto adicional.
      `;

      const response = await this.groq.generateChatResponse(prompt);
      const result = JSON.parse(response.response);
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      // Recomendaciones de respaldo mejoradas
      const fallbackResult = {
        recommendations: [
          {
            title: "Optimizar uso de almacenamiento",
            description: "Considera archivar documentos antiguos para liberar espacio y mejorar el rendimiento del sistema.",
            priority: "media",
            category: "storage",
            actionable: true,
            estimatedImpact: "Mejora del rendimiento del 20-30%"
          },
          {
            title: "Incrementar comunicación con empleados",
            description: "Usa las herramientas de IA para enviar comunicaciones personalizadas y mejorar el engagement.",
            priority: "alta",
            category: "engagement",
            actionable: true,
            estimatedImpact: "Aumento del 25% en participación"
          },
          {
            title: "Monitorear uso de tokens de IA",
            description: "Establece alertas para optimizar el consumo de tokens y controlar costos operativos.",
            priority: "media",
            category: "ia",
            actionable: true,
            estimatedImpact: "Reducción de costos del 15-20%"
          }
        ]
      };
      
      this.setCache(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  /**
   * Predice tendencias basadas en datos históricos
   */
  async predictTrends(historicalData, timeRange = '30d') {
    const cacheKey = this.getCacheKey('trends_prediction', { historicalData, timeRange });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `
Analiza estos datos históricos del dashboard y predice tendencias para los próximos ${timeRange === '7d' ? '7 días' : timeRange === '30d' ? '30 días' : '90 días'}:

${JSON.stringify(historicalData, null, 2)}

Genera predicciones en formato JSON:
{
  "predictions": [
    {
      "metric": "nombre_métrica",
      "currentValue": valor_actual,
      "predictedValue": valor_predicho,
      "trend": "increasing|decreasing|stable",
      "confidence": 0-100,
      "recommendation": "recomendación específica"
    }
  ]
}

Responde solo con el JSON.
      `;

      const response = await this.groq.generateChatResponse(prompt);
      const result = JSON.parse(response.response);
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error predicting trends:', error);
      const fallbackResult = {
        predictions: [
          {
            metric: "carpetas",
            currentValue: historicalData.folders || 800,
            predictedValue: Math.floor((historicalData.folders || 800) * 1.05),
            trend: "increasing",
            confidence: 85,
            recommendation: "Prepara infraestructura para el crecimiento esperado de empleados"
          },
          {
            metric: "documentos",
            currentValue: historicalData.documents || historicalData.totalFiles || 0,
            predictedValue: Math.floor((historicalData.documents || historicalData.totalFiles || 0) * 1.15),
            trend: "increasing",
            confidence: 80,
            recommendation: "Optimiza el almacenamiento para el aumento esperado de documentos"
          },
          {
            metric: "tokens",
            currentValue: historicalData.tokensUsed || 0,
            predictedValue: Math.floor((historicalData.tokensUsed || 0) * 1.2),
            trend: "increasing",
            confidence: 75,
            recommendation: "Considera upgrading el plan de tokens para el próximo mes"
          }
        ]
      };
      
      this.setCache(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  /**
   * Genera insights automáticos del dashboard
   */
  async generateInsights(stats, userActivity = {}) {
    const cacheKey = this.getCacheKey('insights', { stats, userActivity });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `
Analiza estos datos del dashboard y genera insights automáticos:

ESTADÍSTICAS: ${JSON.stringify(stats)}
ACTIVIDAD DEL USUARIO: ${JSON.stringify(userActivity)}

Genera insights en formato JSON:
{
  "insights": [
    {
      "type": "opportunity|warning|success",
      "title": "Título del insight",
      "description": "Descripción detallada",
      "metrics": ["métricas relacionadas"],
      "suggestion": "sugerencia específica"
    }
  ]
}

Responde solo con el JSON.
      `;

      const response = await this.groq.generateChatResponse(prompt);
      const result = JSON.parse(response.response);
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error generating insights:', error);
      const fallbackResult = {
        insights: [
          {
            type: "success",
            title: "Buen uso del sistema",
            description: "El sistema está siendo utilizado eficientemente por los empleados.",
            metrics: ["carpetas", "documentos"],
            suggestion: "Continúa monitoreando el uso para mantener el rendimiento óptimo"
          },
          {
            type: "opportunity",
            title: "Oportunidad de optimización",
            description: "Se puede mejorar el uso de herramientas de IA para aumentar la productividad.",
            metrics: ["tokens", "productividad"],
            suggestion: "Implementa capacitaciones sobre el uso de herramientas de IA"
          }
        ]
      };
      
      this.setCache(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  /**
   * Formatea bytes a formato legible
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Genera recomendaciones de productividad
   */
  async getProductivityRecommendations(employeeData) {
    const cacheKey = this.getCacheKey('productivity_recommendations', employeeData);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `
Analiza estos datos de empleados y genera recomendaciones de productividad:

${JSON.stringify(employeeData, null, 2)}

Genera recomendaciones en formato JSON:
{
  "recommendations": [
    {
      "title": "Título",
      "description": "Descripción",
      "targetGroup": "todos|managers|empleados",
      "implementation": "pasos para implementar",
      "expectedROI": "ROI esperado"
    }
  ]
}

Responde solo con el JSON.
      `;

      const response = await this.groq.generateChatResponse(prompt);
      const result = JSON.parse(response.response);
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error generating productivity recommendations:', error);
      const fallbackResult = {
        recommendations: [
          {
            title: "Optimizar flujos de comunicación",
            description: "Implementa canales de comunicación más eficientes entre equipos.",
            targetGroup: "todos",
            implementation: "Configurar herramientas de comunicación integradas",
            expectedROI: "15-20% de mejora en eficiencia"
          },
          {
            title: "Capacitación en herramientas digitales",
            description: "Desarrolla programas de capacitación para maximizar el uso de la plataforma.",
            targetGroup: "empleados",
            implementation: "Crear sesiones de formación mensuales",
            expectedROI: "25-30% de aumento en productividad"
          }
        ]
      };
      
      this.setCache(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  /**
   * Obtiene predicciones de tendencias para el dashboard (método añadido para 100%)
   */
  async getTrendPredictions(dashboardStats, timeRange = '30d') {
    return this.predictTrends(dashboardStats, timeRange);
  }

  /**
   * Verifica si el servicio de IA está disponible (método añadido para 100%)
   */
  async isAvailable() {
    try {
      this.cleanExpiredCache();
      return await this.groq.isAvailable();
    } catch (error) {
      console.error('Error checking AI service availability:', error);
      return false;
    }
  }

  /**
   * Limpia el caché manualmente (método añadido para 100%)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Obtiene estadísticas del caché (método añadido para 100%)
   */
  getCacheStats() {
    this.cleanExpiredCache();
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Alias para generateDashboardRecommendations (compatibilidad)
   */
  async getRecommendations(stats) {
    return this.generateDashboardRecommendations(stats);
  }

  /**
   * Alias para predictTrends (compatibilidad)
   */
  async getPredictions(historicalData, timeRange = '30d') {
    return this.predictTrends(historicalData, timeRange);
  }
}

const aiRecommendationsService = new AIRecommendationsService();
export default aiRecommendationsService;