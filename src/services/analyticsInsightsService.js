import { supabase } from '../lib/supabase.js'

class AnalyticsInsightsService {
  constructor() {
    this.groqApiKey = process.env.REACT_APP_GROQ_API_KEY
    this.groqModel = 'gemma2-9b-it'
  }

  /**
   * Genera insights de IA basados en datos de comunicación
   * @param {Object} analyticsData - Datos de analytics a analizar
   * @returns {Promise<Object>} Insights generados por IA
   */
  async generateInsights(analyticsData) {
    try {
      if (!this.groqApiKey) {
        console.warn('Groq API key no configurada, usando insights predefinidos')
        return this.generateFallbackInsights(analyticsData)
      }

      const prompt = this.buildInsightPrompt(analyticsData)
      const insights = await this.callGroqAPI(prompt)
      
      return {
        ...insights,
        generated_at: new Date().toISOString(),
        data_period: this.getDataPeriod(analyticsData)
      }
    } catch (error) {
      console.error('Error generando insights con IA:', error)
      return this.generateFallbackInsights(analyticsData)
    }
  }

  /**
   * Construye el prompt para Groq basado en los datos de analytics
   * @param {Object} data - Datos de analytics
   * @returns {string} Prompt formateado
   */
  buildInsightPrompt(data) {
    const { communicationStats, companyMetrics, trends } = data

    return `Como experto en análisis de datos de comunicación empresarial, analiza los siguientes datos y genera insights accionables:

DATOS DE COMUNICACIÓN:
${JSON.stringify(communicationStats, null, 2)}

MÉTRICAS POR EMPRESA:
${JSON.stringify(companyMetrics, null, 2)}

TENDENCIAS DETECTADAS:
${JSON.stringify(trends, null, 2)}

Genera un análisis estructurado en formato JSON con las siguientes secciones:
1. "key_insights": Array de 3-5 insights principales
2. "trends_analysis": Análisis de tendencias clave
3. "recommendations": Array de 3-5 recomendaciones accionables
4. "performance_score": Puntuación general del 0-100
5. "risk_factors": Array de posibles riesgos identificados
6. "opportunities": Array de oportunidades de mejora
7. "next_steps": Array de próximos pasos sugeridos

Sé específico, cuantitativo cuando sea posible, y enfócate en insights prácticos que puedan mejorar la comunicación empresarial.`
  }

  /**
   * Llama a la API de Groq para generar insights
   * @param {string} prompt - Prompt para la IA
   * @returns {Promise<Object>} Respuesta parseada de Groq
   */
  async callGroqAPI(prompt) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.groqModel,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en análisis de datos de comunicación empresarial. Proporciona insights precisos, accionables y basados en datos. Responde siempre en formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`Error en API de Groq: ${response.statusText}`)
    }

    const result = await response.json()
    const content = result.choices[0].message.content

    try {
      // Intentar parsear como JSON
      return JSON.parse(content)
    } catch (parseError) {
      console.error('Error parseando respuesta de Groq:', parseError)
      // Extraer JSON del contenido si está embebido
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('No se pudo parsear la respuesta como JSON')
    }
  }

  /**
   * Genera insights predefinidos cuando IA no está disponible
   * @param {Object} data - Datos de analytics
   * @returns {Object} Insights predefinidos
   */
  generateFallbackInsights(data) {
    const { communicationStats, companyMetrics, trends } = data

    return {
      key_insights: [
        {
          title: "Tasa de entrega general",
          value: `${communicationStats.delivery_rate || 85}%`,
          trend: "positive",
          description: "La tasa de entrega se mantiene dentro de los parámetros óptimos"
        },
        {
          title: "Canales más efectivos",
          value: this.getTopChannels(communicationStats),
          trend: "stable",
          description: "Email y WhatsApp muestran mejor rendimiento"
        },
        {
          title: "Engagement promedio",
          value: `${communicationStats.engagement_rate || 65}%`,
          trend: "positive",
          description: "El engagement muestra una tendencia ascendente"
        }
      ],
      trends_analysis: {
        overall_performance: "positivo",
        channel_performance: this.analyzeChannelPerformance(communicationStats),
        temporal_trends: this.analyzeTemporalTrends(trends),
        company_comparison: this.analyzeCompanyComparison(companyMetrics)
      },
      recommendations: [
        "Optimizar horarios de envío basados en picos de engagement",
        "Implementar A/B testing en asuntos de email",
        "Personalizar contenido por segmentos de empresa",
        "Monitorear canales con baja tasa de entrega"
      ],
      performance_score: this.calculatePerformanceScore(communicationStats),
      risk_factors: [
        "Variabilidad en tasas de entrega entre canales",
        "Disminución de engagement en ciertos segmentos"
      ],
      opportunities: [
        "Expandir uso de canales con mejor rendimiento",
        "Implementar comunicación proactiva",
        "Mejorar segmentación de audiencias"
      ],
      next_steps: [
        "Analizar patrones de comportamiento por hora",
        "Implementar dashboard de métricas en tiempo real",
        "Establecer KPIs específicos por canal"
      ],
      generated_at: new Date().toISOString(),
      data_period: this.getDataPeriod(data),
      fallback_used: true
    }
  }

  /**
   * Obtiene los canales con mejor rendimiento
   * @param {Object} stats - Estadísticas de comunicación
   * @returns {string} Canales top
   */
  getTopChannels(stats) {
    const channels = []
    if (stats.email?.delivery_rate > 80) channels.push('Email')
    if (stats.whatsapp?.delivery_rate > 80) channels.push('WhatsApp')
    if (stats.sms?.delivery_rate > 80) channels.push('SMS')
    
    return channels.length > 0 ? channels.join(', ') : 'Email, WhatsApp'
  }

  /**
   * Analiza el rendimiento por canal
   * @param {Object} stats - Estadísticas
   * @returns {Object} Análisis por canal
   */
  analyzeChannelPerformance(stats) {
    const analysis = {}
    
    Object.keys(stats).forEach(channel => {
      const channelStats = stats[channel]
      if (channelStats.delivery_rate) {
        analysis[channel] = {
          delivery_rate: channelStats.delivery_rate,
          engagement: channelStats.engagement_rate || 0,
          status: channelStats.delivery_rate > 80 ? 'excelente' : 
                 channelStats.delivery_rate > 70 ? 'bueno' : 'mejorable'
        }
      }
    })
    
    return analysis
  }

  /**
   * Analiza tendencias temporales
   * @param {Array} trends - Datos de tendencias
   * @returns {Object} Análisis temporal
   */
  analyzeTemporalTrends(trends) {
    if (!trends || trends.length === 0) {
      return {
        pattern: "estable",
        peak_hours: ["09:00", "14:00", "18:00"],
        trend_direction: "neutral"
      }
    }

    // Análisis simple de tendencia
    const recent = trends.slice(-7)
    const older = trends.slice(-14, -7)
    
    const recentAvg = recent.reduce((sum, t) => sum + (t.engagement || 0), 0) / recent.length
    const olderAvg = older.reduce((sum, t) => sum + (t.engagement || 0), 0) / older.length

    return {
      pattern: recentAvg > olderAvg ? "creciente" : "decreciente",
      peak_hours: ["09:00", "14:00", "18:00"],
      trend_direction: recentAvg > olderAvg ? "ascendente" : "descendente",
      change_percentage: ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1)
    }
  }

  /**
   * Analiza comparación entre empresas
   * @param {Array} companies - Métricas por empresa
   * @returns {Object} Análisis comparativo
   */
  analyzeCompanyComparison(companies) {
    if (!companies || companies.length === 0) {
      return {
        top_performer: "N/A",
        average_performance: 75,
        performance_gap: 0
      }
    }

    const performances = companies.map(c => c.performance_score || 75)
    const avgPerformance = performances.reduce((sum, p) => sum + p, 0) / performances.length
    const maxPerformance = Math.max(...performances)
    const minPerformance = Math.min(...performances)

    return {
      top_performer: companies.find(c => c.performance_score === maxPerformance)?.name || "N/A",
      average_performance: avgPerformance.toFixed(1),
      performance_gap: (maxPerformance - minPerformance).toFixed(1),
      companies_above_average: performances.filter(p => p > avgPerformance).length
    }
  }

  /**
   * Calcula puntuación de rendimiento general
   * @param {Object} stats - Estadísticas
   * @returns {number} Puntuación 0-100
   */
  calculatePerformanceScore(stats) {
    let score = 0
    let factors = 0

    Object.keys(stats).forEach(channel => {
      const channelStats = stats[channel]
      if (channelStats.delivery_rate) {
        score += channelStats.delivery_rate
        factors++
      }
      if (channelStats.engagement_rate) {
        score += channelStats.engagement_rate
        factors++
      }
    })

    return factors > 0 ? Math.round(score / factors) : 75
  }

  /**
   * Determina el período de los datos
   * @param {Object} data - Datos
   * @returns {string} Período formateado
   */
  getDataPeriod(data) {
    if (data.trends && data.trends.length > 0) {
      const dates = data.trends.map(t => t.date).filter(Boolean)
      if (dates.length > 0) {
        const sortedDates = dates.sort()
        return `${sortedDates[0]} - ${sortedDates[sortedDates.length - 1]}`
      }
    }
    return "Últimos 7 días"
  }

  /**
   * Genera insights específicos para una empresa
   * @param {string} companyId - ID de la empresa
   * @param {Object} companyData - Datos específicos de la empresa
   * @returns {Promise<Object>} Insights personalizados
   */
  async generateCompanySpecificInsights(companyId, companyData) {
    try {
      // Obtener datos específicos de la empresa
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('company_id', companyId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      const analyticsData = {
        communicationStats: this.calculateCompanyStats(messages),
        companyMetrics: [{ name: companyData.name, ...companyData }],
        trends: this.processCompanyTrends(messages)
      }

      const insights = await this.generateInsights(analyticsData)
      
      return {
        ...insights,
        company_specific: true,
        company_id: companyId,
        company_name: companyData.name
      }
    } catch (error) {
      console.error('Error generando insights específicos para empresa:', error)
      throw error
    }
  }

  /**
   * Calcula estadísticas específicas de una empresa
   * @param {Array} messages - Mensajes de la empresa
   * @returns {Object} Estadísticas calculadas
   */
  calculateCompanyStats(messages) {
    if (!messages || messages.length === 0) {
      return {
        total_messages: 0,
        delivery_rate: 0,
        engagement_rate: 0,
        channels: {}
      }
    }

    const total = messages.length
    const delivered = messages.filter(m => m.status === 'delivered').length
    const engaged = messages.filter(m => m.read_at || m.clicked_at).length

    const channelStats = {}
    messages.forEach(msg => {
      const channel = msg.channel || 'email'
      if (!channelStats[channel]) {
        channelStats[channel] = { total: 0, delivered: 0, engaged: 0 }
      }
      channelStats[channel].total++
      if (msg.status === 'delivered') channelStats[channel].delivered++
      if (msg.read_at || msg.clicked_at) channelStats[channel].engaged++
    })

    // Calcular tasas por canal
    Object.keys(channelStats).forEach(channel => {
      const stats = channelStats[channel]
      stats.delivery_rate = stats.total > 0 ? (stats.delivered / stats.total * 100).toFixed(1) : 0
      stats.engagement_rate = stats.delivered > 0 ? (stats.engaged / stats.delivered * 100).toFixed(1) : 0
    })

    return {
      total_messages: total,
      delivery_rate: (delivered / total * 100).toFixed(1),
      engagement_rate: (engaged / delivered * 100).toFixed(1),
      channels: channelStats
    }
  }

  /**
   * Procesa tendencias de mensajes de una empresa
   * @param {Array} messages - Mensajes
   * @returns {Array} Tendencias procesadas
   */
  processCompanyTrends(messages) {
    if (!messages || messages.length === 0) return []

    // Agrupar por día
    const dailyStats = {}
    messages.forEach(msg => {
      const date = new Date(msg.created_at).toISOString().split('T')[0]
      if (!dailyStats[date]) {
        dailyStats[date] = { sent: 0, delivered: 0, engaged: 0 }
      }
      dailyStats[date].sent++
      if (msg.status === 'delivered') dailyStats[date].delivered++
      if (msg.read_at || msg.clicked_at) dailyStats[date].engaged++
    })

    return Object.keys(dailyStats).map(date => ({
      date,
      sent: dailyStats[date].sent,
      delivered: dailyStats[date].delivered,
      engagement: dailyStats[date].engaged > 0 ? 
        (dailyStats[date].engaged / dailyStats[date].delivered * 100).toFixed(1) : 0
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
  }
}

const analyticsInsightsService = new AnalyticsInsightsService()
export default analyticsInsightsService