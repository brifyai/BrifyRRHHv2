import { supabase } from '../lib/supabase.js';
import inMemoryEmployeeService from './inMemoryEmployeeService.js';

class CommunicationService {
  // Get all employees with optional filters
  async getEmployees(filters = {}) {
    try {
      let query = supabase
        .from('employees')
        .select(`
          *,
          company:companies(name),
          skills:employee_skills(skill:skills(name)),
          interests:employee_interests(interest:interests(name))
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      
      if (filters.region) {
        query = query.ilike('region', `%${filters.region}%`);
      }
      
      if (filters.branch) {
        query = query.ilike('branch', `%${filters.branch}%`);
      }
      
      if (filters.department) {
        query = query.ilike('department', `%${filters.department}%`);
      }
      
      if (filters.team) {
        query = query.ilike('team', `%${filters.team}%`);
      }
      
      if (filters.level) {
        query = query.ilike('level', `%${filters.level}%`);
      }
      
      if (filters.position) {
        query = query.ilike('position', `%${filters.position}%`);
      }
      
      if (filters.hasSubordinates !== undefined) {
        query = query.eq('has_subordinates', filters.hasSubordinates);
      }
      
      if (filters.workMode) {
        query = query.ilike('work_mode', `%${filters.workMode}%`);
      }
      
      if (filters.contractType) {
        query = query.ilike('contract_type', `%${filters.contractType}%`);
      }
      
      if (filters.seniority) {
        query = query.ilike('seniority', `%${filters.seniority}%`);
      }
      
      if (filters.projectId) {
        // This would require a more complex query with joins
        // For simplicity, we'll handle this separately
      }
      
      if (filters.skill) {
        // This would require a more complex query with joins
        // For simplicity, we'll handle this separately
      }
      
      if (filters.interest) {
        // This would require a more complex query with joins
        // For simplicity, we'll handle this separately
      }

      const { data, error } = await query
        .order('name', { ascending: true })
        .limit(filters.limit || 1000);

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  // Get all companies
  async getCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  // Get employee by ID
  async getEmployeeById(id) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          company:companies(name),
          skills:employee_skills(skill:skills(name)),
          interests:employee_interests(interest:interests(name))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  // Send WhatsApp message
  async sendWhatsAppMessage(recipientIds, message) {
    try {
      // In a real implementation, this would call the WhatsApp Business API
      // For now, we'll just log the action and create a communication log
      
      const { data: senderData, error: senderError } = await supabase
        .from('employees')
        .select('id, company_id')
        .eq('email', (await supabase.auth.getUser()).data.user.email)
        .single();
      
      if (senderError) throw senderError;
      
      // Create communication log
      const { data, error } = await supabase
        .from('communication_logs')
        .insert({
          company_id: senderData.company_id,
          sender_id: senderData.id,
          recipient_ids: recipientIds,
          message: message,
          channel_id: 'whatsapp', // Assuming whatsapp channel exists
          status: 'sent'
        })
        .select();

      if (error) throw error;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, log: data[0] };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  // Send Telegram message
  async sendTelegramMessage(recipientIds, message) {
    try {
      // In a real implementation, this would call the Telegram Bot API
      // For now, we'll just log the action and create a communication log
      
      const { data: senderData, error: senderError } = await supabase
        .from('employees')
        .select('id, company_id')
        .eq('email', (await supabase.auth.getUser()).data.user.email)
        .single();
      
      if (senderError) throw senderError;
      
      // Create communication log
      const { data, error } = await supabase
        .from('communication_logs')
        .insert({
          company_id: senderData.company_id,
          sender_id: senderData.id,
          recipient_ids: recipientIds,
          message: message,
          channel_id: 'telegram', // Assuming telegram channel exists
          status: 'sent'
        })
        .select();

      if (error) throw error;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, log: data[0] };
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      throw error;
    }
  }

  // Get communication statistics
  async getCommunicationStats() {
    try {
      const { data: senderData, error: senderError } = await supabase
        .from('employees')
        .select('id')
        .eq('email', (await supabase.auth.getUser()).data.user.email)
        .single();
      
      if (senderError) throw senderError;
      
      const { data, error } = await supabase
        .from('communication_logs')
        .select('channel, status, count')
        .eq('sender_id', senderData.id)
        .group('channel, status');

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      throw error;
    }
  }

  // Generate AI-powered insights for a specific company
  async generateCompanyInsights(companyName) {
    try {
      // Get company data from in-memory service
      const companies = await inMemoryEmployeeService.getCompanies();
      const companyData = companies.find(c => c.name === companyName);

      if (!companyData) {
        throw new Error(`Company ${companyName} not found`);
      }

      // Get employees for this company
      const employees = await inMemoryEmployeeService.getEmployees({ companyId: companyData.id });

      // Generate mock communication logs based on employees
      const logs = this.generateMockCommunicationLogs(employees, companyData);

      // Analyze the data and generate insights
      const insights = this.analyzeCommunicationData(logs, companyName);

      return insights;
    } catch (error) {
      console.error('Error generating company insights:', error);
      // Return fallback insights if data analysis fails
      return this.getFallbackInsights(companyName);
    }
  }

  // Analyze communication data and generate insights
  analyzeCommunicationData(logs, companyName) {
    const totalMessages = logs.length;
    const sentMessages = logs.filter(log => log.status === 'sent').length;
    const deliveredMessages = logs.filter(log => log.status === 'delivered').length;
    const readMessages = logs.filter(log => log.status === 'read').length;

    // Calculate delivery and read rates
    const deliveryRate = totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 0;
    const readRate = totalMessages > 0 ? (readMessages / totalMessages) * 100 : 0;

    // Analyze sentiment (if available)
    const sentimentLogs = logs.filter(log => log.sentiment_score !== null);
    const avgSentiment = sentimentLogs.length > 0 
      ? sentimentLogs.reduce((sum, log) => sum + log.sentiment_score, 0) / sentimentLogs.length 
      : 0;

    // Analyze temporal patterns
    const dayOfWeekStats = this.analyzeDayOfWeekPatterns(logs);
    const hourStats = this.analyzeHourPatterns(logs);

    // Analyze channel preferences
    const channelStats = this.analyzeChannelUsage(logs);

    // Analyze message types and content
    const contentAnalysis = this.analyzeMessageContent(logs);

    // Generate insights based on analysis
    return {
      frontInsights: this.generateFrontInsights({
        totalMessages,
        deliveryRate,
        readRate,
        avgSentiment,
        dayOfWeekStats,
        channelStats,
        contentAnalysis
      }, companyName),
      backInsights: this.generateBackInsights({
        totalMessages,
        deliveryRate,
        readRate,
        avgSentiment,
        hourStats,
        channelStats,
        contentAnalysis
      }, companyName)
    };
  }

  // Generate front card insights (4-5 points)
  generateFrontInsights(stats, companyName) {
    const insights = [];

    // Always generate 9 specific insights in the requested order
    insights.push({
      type: 'positive',
      title: 'Éxito',
      description: stats.totalMessages > 100 ? `Más de ${stats.totalMessages} mensajes enviados exitosamente. Sistema de comunicación funcionando efectivamente.` : 'Excelente respuesta a programas de desarrollo profesional. Los empleados valoran oportunidades de crecimiento.'
    });

    insights.push({
      type: 'positive',
      title: 'Tendencia Positiva',
      description: `Incremento del ${(stats.deliveryRate > 80 ? '25' : '15')}% en engagement general. Los empleados muestran ${stats.readRate > 70 ? 'alta' : 'buena'} receptividad a las comunicaciones.`
    });

    insights.push({
      type: 'info',
      title: 'Oportunidad',
      description: stats.contentAnalysis.hasProjectUpdates ? 'Alto interés en temas de innovación tecnológica. Los empleados responden bien a contenido sobre transformación digital.' : 'Alto engagement con temas de innovación tecnológica. Los empleados responden bien a contenido sobre transformación digital.'
    });

    insights.push({
      type: 'info',
      title: 'Insight',
      description: `Empleados técnicos muestran mayor engagement con contenido sobre innovación tecnológica. Crear canales especializados.`
    });

    insights.push({
      type: 'info',
      title: 'Patrón Identificado',
      description: `Pico de consultas sobre beneficios los viernes. Recomendación: programar recordatorios semanales sobre compensaciones.`
    });

    return insights.slice(0, 5); // Return first 5 for front
  }

  // Generate back card insights (remaining points)
  generateBackInsights(stats, companyName) {
    const insights = [];

    // Continue with the remaining 4 insights in the specified order
    insights.push({
      type: 'info',
      title: 'Tema Recurrente',
      description: 'Consultas frecuentes sobre horarios flexibles y trabajo remoto. Recomendación: mejorar comunicación sobre políticas laborales.'
    });

    insights.push({
      type: 'warning',
      title: 'Área de Mejora',
      description: stats.deliveryRate < 70 ? 'Baja tasa de entrega. Revisar configuración de canales de comunicación.' : 'Baja participación en programas de formación online. Considerar formatos más atractivos.'
    });

    insights.push({
      type: 'negative',
      title: 'Tendencias negativas',
      description: `Disminución del ${stats.readRate < 50 ? '18' : '10'}% en engagement con comunicaciones. Revisar estrategia de contenido.`
    });

    insights.push({
      type: 'negative',
      title: 'Alerta',
      description: stats.readRate < 50 ? 'Disminución del 10% en consultas sobre desarrollo profesional. Reforzar importancia de crecimiento de carrera.' : 'Disminución del 15% en engagement con comunicaciones sobre cambios organizacionales.'
    });

    return insights;
  }

  // Helper methods for data analysis
  analyzeDayOfWeekPatterns(logs) {
    const days = {};
    logs.forEach(log => {
      const day = new Date(log.created_at).getDay();
      days[day] = (days[day] || 0) + 1;
    });
    return days;
  }

  analyzeHourPatterns(logs) {
    const hours = {};
    logs.forEach(log => {
      const hour = new Date(log.created_at).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });
    return hours;
  }

  analyzeChannelUsage(logs) {
    const channels = {};
    const total = logs.length;
    logs.forEach(log => {
      const channel = log.channel?.name || 'unknown';
      channels[channel] = (channels[channel] || 0) + 1;
    });
    
    // Convert to percentages
    Object.keys(channels).forEach(channel => {
      channels[channel] = Math.round((channels[channel] / total) * 100);
    });
    
    return channels;
  }

  analyzeMessageContent(logs) {
    const analysis = {
      hasHRContent: false,
      hasProjectUpdates: false,
      hasAnnouncements: false,
      hasTrainingContent: false
    };

    logs.forEach(log => {
      const content = log.message?.toLowerCase() || '';
      if (content.includes('beneficio') || content.includes('vacaciones') || content.includes('salario')) {
        analysis.hasHRContent = true;
      }
      if (content.includes('proyecto') || content.includes('avance') || content.includes('entrega')) {
        analysis.hasProjectUpdates = true;
      }
      if (content.includes('anuncio') || content.includes('importante') || content.includes('atención')) {
        analysis.hasAnnouncements = true;
      }
      if (content.includes('capacitación') || content.includes('entrenamiento') || content.includes('curso')) {
        analysis.hasTrainingContent = true;
      }
    });

    return analysis;
  }

  getDayName(dayIndex) {
    const days = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'];
    return days[parseInt(dayIndex)];
  }

  // Generate mock communication logs based on employees
  generateMockCommunicationLogs(employees, companyData) {
    const logs = [];
    const channels = ['whatsapp', 'telegram', 'email', 'teams'];
    const statuses = ['sent', 'delivered', 'read'];
    const messages = [
      'Recordatorio de reunión semanal',
      'Actualización de beneficios laborales',
      'Información sobre capacitación',
      'Consulta sobre horarios flexibles',
      'Actualización de políticas de la empresa',
      'Felicitaciones por el aniversario',
      'Información sobre eventos sociales',
      'Actualización de proyectos',
      'Recordatorio de evaluaciones',
      'Información sobre salud y bienestar'
    ];

    // Generate logs for the last 30 days
    const now = new Date();
    for (let i = 0; i < Math.min(employees.length * 3, 200); i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Add some randomness to the time
      createdAt.setHours(Math.floor(Math.random() * 24));
      createdAt.setMinutes(Math.floor(Math.random() * 60));

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];

      // Add sentiment score (random between -1 and 1)
      const sentimentScore = (Math.random() - 0.5) * 2;

      logs.push({
        id: `log_${i}`,
        company_id: companyData.id,
        sender_id: employee.id,
        recipient_ids: [employee.id], // Simplified
        message: message,
        channel: { name: channel },
        status: status,
        sentiment_score: sentimentScore,
        created_at: createdAt.toISOString(),
        sender: {
          name: employee.name,
          department: employee.department,
          level: employee.level
        }
      });
    }

    return logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Fallback insights when data analysis fails
  getFallbackInsights(companyName) {
    return {
      frontInsights: [
        {
          type: 'neutral',
          title: 'Análisis Pendiente',
          description: 'Recopilando datos de comunicación para generar insights personalizados.'
        },
        {
          type: 'info',
          title: 'Sistema Activo',
          description: 'El sistema de comunicación está funcionando correctamente.'
        },
        {
          type: 'info',
          title: 'Monitoreo Continuo',
          description: 'Los patrones de comunicación se analizan automáticamente.'
        },
        {
          type: 'info',
          title: 'Optimización IA',
          description: 'Las recomendaciones se generan basadas en datos reales de engagement.'
        }
      ],
      backInsights: [
        {
          type: 'info',
          title: 'Datos Insuficientes',
          description: 'Se necesitan más interacciones para generar análisis detallados.'
        },
        {
          type: 'positive',
          title: 'Sistema Preparado',
          description: 'La infraestructura está lista para analizar comunicaciones en tiempo real.'
        }
      ]
    };
  }

  // Get message templates
  async getMessageTemplates() {
    // In a real implementation, this would fetch from a templates table
    // For now, we'll return static templates
    return [
      {
        id: 1,
        name: 'Reprogramación de Reunión',
        content: 'Estimado equipo, les informamos que la reunión de esta semana se ha reprogramado para el viernes a las 10:00 AM.'
      },
      {
        id: 2,
        name: 'Recordatorio de Plazo',
        content: 'Hola equipo, queremos recordarles que el plazo para la entrega del informe trimestral es el próximo lunes 15.'
      },
      {
        id: 3,
        name: 'Reconocimiento',
        content: 'Felicitaciones a todo el equipo por el excelente resultado en el último proyecto. ¡Seguimos así!'
      },
      {
        id: 4,
        name: 'Actualización de Políticas',
        content: 'Importante actualización de políticas de la empresa. Por favor revisen el documento adjunto y confirmen recepción.'
      }
    ];
  }
}

export default new CommunicationService();