import { supabase } from '../lib/supabaseClient'
import inMemoryEmployeeService from './inMemoryEmployeeService'
import brevoService from './brevoService'
import brevoCampaignService from './brevoCampaignService'

class MultiChannelCommunicationService {
  constructor() {
    this.employees = []
    this.companies = []
    this.loadEmployeeData()
    
    this.channels = {
      email: {
        name: 'Email',
        icon: '📧',
        color: '#3B82F6',
        enabled: true,
        templates: ['newsletter', 'announcement', 'reminder', 'report']
      },
      teams: {
        name: 'Microsoft Teams',
        icon: '🟣',
        color: '#5B21B6',
        enabled: true,
        templates: ['meeting', 'update', 'alert', 'collaboration']
      },
      slack: {
        name: 'Slack',
        icon: '💜',
        color: '#6366F1',
        enabled: true,
        templates: ['message', 'channel', 'dm', 'announcement']
      },
      sms: {
        name: 'SMS',
        icon: '📱',
        color: '#10B981',
        enabled: true,
        templates: ['urgent', 'reminder', 'verification', 'alert']
      },
      video: {
        name: 'Video Mensajes',
        icon: '🎥',
        color: '#EF4444',
        enabled: true,
        templates: ['tutorial', 'announcement', 'training', 'update']
      },
      infographic: {
        name: 'Infografías',
        icon: '📊',
        color: '#F59E0B',
        enabled: true,
        templates: ['report', 'statistics', 'process', 'timeline']
      },
      podcast: {
        name: 'Podcasts Internos',
        icon: '🎙️',
        color: '#8B5CF6',
        enabled: true,
        templates: ['executive_update', 'training', 'interview', 'news']
      }
    }
  }

  // Obtener todos los canales disponibles
  getAvailableChannels() {
    return Object.entries(this.channels)
      .filter(([key, channel]) => channel.enabled)
      .map(([key, channel]) => ({ id: key, ...channel }))
  }

  // Enviar mensaje multicanal
  async sendMultiChannelMessage(messageData) {
    try {
      const { channels, content, recipients, schedule, priority } = messageData
      
      const results = []
      
      for (const channelId of channels) {
        const channel = this.channels[channelId]
        if (!channel || !channel.enabled) continue
        
        const result = await this.sendToChannel(channelId, {
          ...content,
          recipients,
          schedule,
          priority
        })
        
        results.push({
          channel: channelId,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        })
      }
      
      return {
        success: true,
        results,
        totalChannels: channels.length,
        successfulChannels: results.filter(r => r.success).length
      }
    } catch (error) {
      console.error('Error sending multichannel message:', error)
      return { success: false, error: error.message }
    }
  }

  // Enviar a un canal específico
  async sendToChannel(channelId, messageData) {
    try {
      switch (channelId) {
        case 'email':
          return await this.sendEmail(messageData)
        case 'teams':
          return await this.sendToTeams(messageData)
        case 'slack':
          return await this.sendToSlack(messageData)
        case 'sms':
          return await this.sendSMS(messageData)
        case 'video':
          return await this.sendVideoMessage(messageData)
        case 'infographic':
          return await this.generateInfographic(messageData)
        case 'podcast':
          return await this.createPodcast(messageData)
        default:
          throw new Error(`Canal ${channelId} no soportado`)
      }
    } catch (error) {
      console.error(`Error sending to ${channelId}:`, error)
      return { success: false, error: error.message }
    }
  }

  // Enviar Email
  async sendEmail(messageData) {
    try {
      const { subject, body, recipients, attachments, useBrevo = true } = messageData
      
      // Verificar si Brevo está configurado para envío real
      const brevoConfig = brevoService.loadConfiguration()
      
      if (useBrevo && brevoConfig.apiKey) {
        // Usar Brevo para envío real
        try {
          const result = await brevoService.sendBulkEmail({
            to: recipients,
            subject: subject,
            htmlContent: body,
            sender: {
              name: brevoConfig.emailName || 'Brify AI',
              email: brevoConfig.emailSender || 'noreply@brify.ai'
            },
            testMode: brevoConfig.testMode || false
          })
          
          // Crear campaña en Brevo para seguimiento
          await brevoCampaignService.createCampaign({
            name: `Email: ${subject}`,
            type: 'email',
            subject: subject,
            content: body,
            senderName: brevoConfig.emailName || 'Brify AI',
            senderEmail: brevoConfig.emailSender || 'noreply@brify.ai',
            recipients: recipients.map(email => ({ email })),
            testMode: brevoConfig.testMode || false
          })
          
          return { success: true, messageId: result.messageId, provider: 'brevo' }
        } catch (brevoError) {
          console.warn('Error con Brevo, usando fallback:', brevoError.message)
          // Continuar con el método fallback
        }
      }
      
      // Método fallback (simulación)
      const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Guardar en base de datos
      const { data, error } = await supabase
        .from('communication_logs')
        .insert({
          id: messageId,
          channel: 'email',
          subject,
          content: body,
          recipients: recipients.join(','),
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: { attachments, provider: 'fallback' }
        })
      
      if (error) throw error
      
      return { success: true, messageId, provider: 'fallback' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Enviar a Microsoft Teams
  async sendToTeams(messageData) {
    try {
      const { title, body, recipients, channel } = messageData
      
      const messageId = `teams_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Guardar en base de datos
      const { data, error } = await supabase
        .from('communication_logs')
        .insert({
          id: messageId,
          channel: 'teams',
          subject: title,
          content: body,
          recipients: recipients.join(','),
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: { channel }
        })
      
      if (error) throw error
      
      return { success: true, messageId }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Enviar a Slack
  async sendToSlack(messageData) {
    try {
      const { text, recipients, channel } = messageData
      
      const messageId = `slack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Guardar en base de datos
      const { data, error } = await supabase
        .from('communication_logs')
        .insert({
          id: messageId,
          channel: 'slack',
          subject: 'Slack Message',
          content: text,
          recipients: recipients.join(','),
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: { channel }
        })
      
      if (error) throw error
      
      return { success: true, messageId }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Enviar SMS
  async sendSMS(messageData) {
    try {
      const { message, recipients, urgent, useBrevo = true } = messageData
      
      // Verificar si Brevo está configurado para envío real
      const brevoConfig = brevoService.loadConfiguration()
      
      if (useBrevo && brevoConfig.apiKey) {
        // Usar Brevo para envío real
        try {
          const result = await brevoService.sendBulkSMS({
            to: recipients,
            message: message,
            sender: brevoConfig.smsSender || 'BrifyAI',
            testMode: brevoConfig.testMode || false
          })
          
          // Crear campaña en Brevo para seguimiento
          await brevoCampaignService.createCampaign({
            name: `SMS: ${message.substring(0, 50)}...`,
            type: 'sms',
            content: message,
            senderName: brevoConfig.smsSender || 'BrifyAI',
            recipients: recipients.map(phone => ({ phoneNumber: phone })),
            testMode: brevoConfig.testMode || false
          })
          
          return { success: true, messageId: result.messageId, provider: 'brevo' }
        } catch (brevoError) {
          console.warn('Error con Brevo, usando fallback:', brevoError.message)
          // Continuar con el método fallback
        }
      }
      
      // Método fallback (simulación)
      const messageId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Guardar en base de datos
      const { data, error } = await supabase
        .from('communication_logs')
        .insert({
          id: messageId,
          channel: 'sms',
          subject: 'SMS',
          content: message,
          recipients: recipients.join(','),
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: { urgent, provider: 'fallback' }
        })
      
      if (error) throw error
      
      return { success: true, messageId, provider: 'fallback' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Crear y enviar video mensaje
  async sendVideoMessage(messageData) {
    try {
      const { title, script, duration, recipients, quality } = messageData
      
      const messageId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Simulación de creación de video
      const videoUrl = `https://videos.company.com/${messageId}.mp4`
      
      // Guardar en base de datos
      const { data, error } = await supabase
        .from('communication_logs')
        .insert({
          id: messageId,
          channel: 'video',
          subject: title,
          content: script,
          recipients: recipients.join(','),
          status: 'processing',
          sent_at: new Date().toISOString(),
          metadata: { duration, quality, videoUrl }
        })
      
      if (error) throw error
      
      return { success: true, messageId, videoUrl }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Generar infografía automática
  async generateInfographic(messageData) {
    try {
      const { title, data: infographicData, type, recipients, style } = messageData
      
      const messageId = `infographic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Simulación de generación de infografía
      const infographicUrl = `https://infographics.company.com/${messageId}.png`
      
      // Guardar en base de datos
      const { data: savedData, error } = await supabase
        .from('communication_logs')
        .insert({
          id: messageId,
          channel: 'infographic',
          subject: title,
          content: JSON.stringify(infographicData),
          recipients: recipients.join(','),
          status: 'processing',
          sent_at: new Date().toISOString(),
          metadata: { type, style, infographicUrl }
        })
      
      if (error) throw error
      
      return { success: true, messageId, infographicUrl }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Crear podcast interno
  async createPodcast(messageData) {
    try {
      const { title, content, duration, host, guests, recipients } = messageData
      
      const messageId = `podcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Simulación de creación de podcast
      const podcastUrl = `https://podcasts.company.com/${messageId}.mp3`
      
      // Guardar en base de datos
      const { data, error } = await supabase
        .from('communication_logs')
        .insert({
          id: messageId,
          channel: 'podcast',
          subject: title,
          content: content,
          recipients: recipients.join(','),
          status: 'processing',
          sent_at: new Date().toISOString(),
          metadata: { duration, host, guests, podcastUrl }
        })
      
      if (error) throw error
      
      return { success: true, messageId, podcastUrl }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Obtener estadísticas por canal
  async getChannelStats() {
    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('channel, status, sent_at')
        .order('sent_at', { ascending: false })
        .limit(1000)
      
      if (error) throw error
      
      const stats = {}
      const channels = this.getAvailableChannels()
      
      // Inicializar estadísticas
      channels.forEach(channel => {
        stats[channel.id] = {
          name: channel.name,
          icon: channel.icon,
          color: channel.color,
          sent: 0,
          delivered: 0,
          failed: 0,
          pending: 0,
          total: 0
        }
      })
      
      // Contar mensajes por canal y estado
      data.forEach(log => {
        if (stats[log.channel]) {
          stats[log.channel].total++
          stats[log.channel][log.status]++
        }
      })
      
      return stats
    } catch (error) {
      console.error('Error getting channel stats:', error)
      return {}
    }
  }

  // Obtener plantillas por canal
  getTemplatesByChannel(channelId) {
    const channel = this.channels[channelId]
    if (!channel) return []
    
    return channel.templates.map(template => ({
      id: `${channelId}_${template}`,
      name: template.charAt(0).toUpperCase() + template.slice(1),
      channel: channelId,
      channelName: channel.name
    }))
  }

  // Programar envío multicanal
  async scheduleMultiChannelMessage(messageData) {
    try {
      const { channels, content, recipients, scheduleTime, priority } = messageData
      
      const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Guardar programación en base de datos
      const { data, error } = await supabase
        .from('scheduled_messages')
        .insert({
          id: scheduleId,
          channels: channels.join(','),
          content: JSON.stringify(content),
          recipients: recipients.join(','),
          scheduled_time: scheduleTime,
          priority: priority || 'normal',
          status: 'scheduled',
          created_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      return { success: true, scheduleId }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Cargar datos de empleados desde la base de datos
  async loadEmployeeData() {
    try {
      // Cargar empleados desde el servicio en memoria
      this.employees = inMemoryEmployeeService.employees || []
      this.companies = inMemoryEmployeeService.companies || []
      
      console.log(`Cargados ${this.employees.length} empleados y ${this.companies.length} empresas`)
    } catch (error) {
      console.error('Error cargando datos de empleados:', error)
      this.employees = []
      this.companies = []
    }
  }

  // Obtener todos los empleados
  getEmployees() {
    return this.employees
  }

  // Obtener empleados por empresa
  getEmployeesByCompany(companyId) {
    return this.employees.filter(employee => employee.companyId === companyId)
  }

  // Obtener empleados por departamento
  getEmployeesByDepartment(department) {
    return this.employees.filter(employee => employee.department === department)
  }

  // Obtener empleados por región
  getEmployeesByRegion(region) {
    return this.employees.filter(employee => employee.region === region)
  }

  // Filtrar empleados con múltiples criterios
  filterEmployees(filters = {}) {
    let filteredEmployees = [...this.employees]
    
    if (filters.company) {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.company === filters.company || emp.companyId === filters.company
      )
    }
    
    if (filters.department) {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.department === filters.department
      )
    }
    
    if (filters.region) {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.region === filters.region
      )
    }
    
    if (filters.level) {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.level === filters.level
      )
    }
    
    if (filters.workMode) {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.workMode === filters.workMode
      )
    }
    
    if (filters.contractType) {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.contractType === filters.contractType
      )
    }
    
    return filteredEmployees
  }

  // Obtener destinatarios para comunicación multicanal
  getRecipientsForCommunication(filters = {}) {
    const filteredEmployees = this.filterEmployees(filters)
    
    return filteredEmployees.map(employee => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      company: employee.company,
      department: employee.department,
      region: employee.region,
      level: employee.level,
      position: employee.position,
      workMode: employee.workMode,
      contractType: employee.contractType,
      // Canales disponibles para este empleado
      availableChannels: this.getAvailableChannelsForEmployee(employee)
    }))
  }

  // Determinar canales disponibles para un empleado específico
  getAvailableChannelsForEmployee(employee) {
    const channels = []
    
    // Email - siempre disponible si hay email
    if (employee.email) {
      channels.push('email')
    }
    
    // SMS - disponible si hay teléfono
    if (employee.phone) {
      channels.push('sms')
    }
    
    // Teams - disponible para empleados corporativos
    if (employee.level === 'Senior' || employee.level === 'Manager' || employee.level === 'Director') {
      channels.push('teams')
    }
    
    // Slack - disponible para equipos de tecnología
    if (employee.department === 'Technology' || employee.department === 'Engineering') {
      channels.push('slack')
    }
    
    // Video mensajes - disponible para todos
    channels.push('video')
    
    // Infografías - disponible para todos
    channels.push('infographic')
    
    // Podcasts - disponible para niveles senior y gerenciales
    if (employee.level === 'Senior' || employee.level === 'Manager' || employee.level === 'Director') {
      channels.push('podcast')
    }
    
    return channels
  }

  // Enviar mensaje multicanal a empleados filtrados
  async sendMultiChannelMessageToEmployees(messageData, employeeFilters = {}) {
    try {
      const recipients = this.getRecipientsForCommunication(employeeFilters)
      
      if (recipients.length === 0) {
        return { success: false, error: 'No se encontraron empleados con los filtros especificados' }
      }
      
      // Extraer emails y teléfonos para los destinatarios
      const emailRecipients = recipients
        .filter(r => r.email && messageData.channels.includes('email'))
        .map(r => r.email)
      
      const smsRecipients = recipients
        .filter(r => r.phone && messageData.channels.includes('sms'))
        .map(r => r.phone)
      
      // Preparar datos para envío
      const enhancedMessageData = {
        ...messageData,
        recipients: {
          email: emailRecipients,
          sms: smsRecipients,
          all: recipients.map(r => r.id)
        }
      }
      
      // Enviar mensaje multicanal
      const result = await this.sendMultiChannelMessage(enhancedMessageData)
      
      // Registrar comunicación específica para empleados
      if (result.success) {
        await this.logEmployeeCommunication(result.results, recipients, employeeFilters)
      }
      
      return {
        ...result,
        recipientsCount: recipients.length,
        emailRecipients: emailRecipients.length,
        smsRecipients: smsRecipients.length
      }
    } catch (error) {
      console.error('Error sending multichannel message to employees:', error)
      return { success: false, error: error.message }
    }
  }

  // Registrar comunicación de empleados en la base de datos
  async logEmployeeCommunication(results, recipients, filters) {
    try {
      for (const result of results) {
        await supabase
          .from('employee_communication_logs')
          .insert({
            channel: result.channel,
            message_id: result.messageId,
            success: result.success,
            recipients_count: recipients.length,
            filters_applied: JSON.stringify(filters),
            recipients_list: recipients.map(r => r.id),
            sent_at: new Date().toISOString(),
            error: result.error || null
          })
      }
    } catch (error) {
      console.error('Error logging employee communication:', error)
    }
  }

  // Obtener estadísticas de comunicación por departamento
  async getCommunicationStatsByDepartment() {
    try {
      const departments = [...new Set(this.employees.map(emp => emp.department))]
      const stats = {}
      
      for (const department of departments) {
        const departmentEmployees = this.getEmployeesByDepartment(department)
        const { data, error } = await supabase
          .from('employee_communication_logs')
          .select('*')
          .in('recipients_list', departmentEmployees.map(emp => emp.id))
        
        if (!error && data) {
          stats[department] = {
            employeeCount: departmentEmployees.length,
            communicationsSent: data.length,
            successfulCommunications: data.filter(log => log.success).length,
            channelsUsed: [...new Set(data.map(log => log.channel))]
          }
        }
      }
      
      return stats
    } catch (error) {
      console.error('Error getting communication stats by department:', error)
      return {}
    }
  }

  // Obtener estadísticas de comunicación por empresa
  async getCommunicationStatsByCompany() {
    try {
      const stats = {}
      
      for (const company of this.companies) {
        const companyEmployees = this.getEmployeesByCompany(company.id)
        const { data, error } = await supabase
          .from('employee_communication_logs')
          .select('*')
          .in('recipients_list', companyEmployees.map(emp => emp.id))
        
        if (!error && data) {
          stats[company.name] = {
            employeeCount: companyEmployees.length,
            communicationsSent: data.length,
            successfulCommunications: data.filter(log => log.success).length,
            channelsUsed: [...new Set(data.map(log => log.channel))]
          }
        }
      }
      
      return stats
    } catch (error) {
      console.error('Error getting communication stats by company:', error)
      return {}
    }
  }

  // Sincronizar plantillas con el sistema existente
  syncTemplatesWithSystem(systemTemplates = []) {
    try {
      // Mapear plantillas del sistema a canales multicanal
      const templateMapping = {
        'WhatsApp': 'sms',
        'Telegram': 'sms',
        'Email': 'email',
        'Teams': 'teams',
        'Slack': 'slack'
      }
      
      systemTemplates.forEach(template => {
        const channelId = templateMapping[template.type]
        if (channelId && this.channels[channelId]) {
          // Agregar plantilla al canal correspondiente
          if (!this.channels[channelId].systemTemplates) {
            this.channels[channelId].systemTemplates = []
          }
          
          this.channels[channelId].systemTemplates.push({
            id: template.id,
            name: template.name,
            content: template.content,
            type: template.type,
            category: template.category,
            autoTrigger: template.autoTrigger
          })
        }
      })
      
      console.log('Plantillas sincronizadas con el sistema multicanal')
    } catch (error) {
      console.error('Error syncing templates with system:', error)
    }
  }

  // Obtener plantillas combinadas (nativas + del sistema)
  getCombinedTemplates(channelId) {
    const channel = this.channels[channelId]
    if (!channel) return []
    
    const templates = []
    
    // Plantillas nativas del canal
    if (channel.templates) {
      channel.templates.forEach(template => {
        templates.push({
          id: `${channelId}_${template}`,
          name: template.charAt(0).toUpperCase() + template.slice(1),
          content: '',
          type: 'native',
          category: 'general'
        })
      })
    }
    
    // Plantillas del sistema
    if (channel.systemTemplates) {
      templates.push(...channel.systemTemplates)
    }
    
    return templates
  }
}

const multiChannelService = new MultiChannelCommunicationService()
export default multiChannelService