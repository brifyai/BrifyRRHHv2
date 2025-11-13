import { supabase } from '../lib/supabase.js'
import brevoService from './brevoService.js'

class BrevoCampaignService {
  constructor() {
    this.isInitialized = false
  }

  // Inicializar el servicio
  async initialize() {
    if (this.isInitialized) return
    
    try {
      // Verificar conexión con Brevo
      const config = brevoService.loadConfiguration()
      if (!config.apiKey) {
        console.warn('Brevo no está configurado')
        return
      }
      
      this.isInitialized = true
      console.log('BrevoCampaignService inicializado correctamente')
    } catch (error) {
      console.error('Error al inicializar BrevoCampaignService:', error)
    }
  }

  // Crear una nueva campaña
  async createCampaign(campaignData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const campaign = {
        user_id: user.id,
        name: campaignData.name,
        description: campaignData.description || null,
        campaign_type: campaignData.type, // 'sms' o 'email'
        status: 'draft',
        sender_name: campaignData.senderName || null,
        sender_email: campaignData.senderEmail || null,
        subject: campaignData.subject || null,
        content: campaignData.content,
        template_id: campaignData.templateId || null,
        scheduled_at: campaignData.scheduledAt || null,
        test_mode: campaignData.testMode || false,
        track_opens: campaignData.trackOpens !== false,
        track_clicks: campaignData.trackClicks !== false,
        total_recipients: campaignData.recipients?.length || 0
      }

      const { data, error } = await supabase
        .from('brevo_campaigns')
        .insert(campaign)
        .select()
        .single()

      if (error) throw error

      // Agregar destinatarios si se proporcionaron
      if (campaignData.recipients && campaignData.recipients.length > 0) {
        await this.addRecipients(data.id, campaignData.recipients)
      }

      return data
    } catch (error) {
      console.error('Error al crear campaña:', error)
      throw error
    }
  }

  // Agregar destinatarios a una campaña
  async addRecipients(campaignId, recipients) {
    try {
      const recipientData = recipients.map(recipient => ({
        campaign_id: campaignId,
        phone_number: recipient.phoneNumber || null,
        email: recipient.email || null,
        contact_name: recipient.name || null,
        custom_variables: recipient.customVariables || {},
        status: 'pending'
      }))

      const { data, error } = await supabase
        .from('brevo_campaign_recipients')
        .insert(recipientData)
        .select()

      if (error) throw error

      // Actualizar contador de destinatarios en la campaña
      await supabase
        .from('brevo_campaigns')
        .update({ total_recipients: recipientData.length })
        .eq('id', campaignId)

      return data
    } catch (error) {
      console.error('Error al agregar destinatarios:', error)
      throw error
    }
  }

  // Enviar una campaña
  async sendCampaign(campaignId) {
    try {
      // Obtener datos de la campaña
      const { data: campaign, error: campaignError } = await supabase
        .from('brevo_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError

      // Obtener destinatarios
      const { data: recipients, error: recipientsError } = await supabase
        .from('brevo_campaign_recipients')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('status', 'pending')

      if (recipientsError) throw recipientsError

      // Actualizar estado de la campaña
      await supabase
        .from('brevo_campaigns')
        .update({ 
          status: 'sending',
          sent_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      // Enviar mensajes según el tipo de campaña
      const results = []
      if (campaign.campaign_type === 'sms') {
        for (const recipient of recipients) {
          if (recipient.phone_number) {
            try {
              const result = await brevoService.sendSMS({
                to: recipient.phone_number,
                message: this.personalizeContent(campaign.content, recipient.custom_variables),
                sender: campaign.sender_name
              })
              
              results.push({
                recipientId: recipient.id,
                success: true,
                messageId: result.messageId
              })

              // Actualizar estado del destinatario
              await supabase
                .from('brevo_campaign_recipients')
                .update({
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                  brevo_message_id: result.messageId
                })
                .eq('id', recipient.id)

            } catch (error) {
              results.push({
                recipientId: recipient.id,
                success: false,
                error: error.message
              })

              // Actualizar estado del destinatario con error
              await supabase
                .from('brevo_campaign_recipients')
                .update({
                  status: 'failed',
                  error_message: error.message
                })
                .eq('id', recipient.id)
            }
          }
        }
      } else if (campaign.campaign_type === 'email') {
        for (const recipient of recipients) {
          if (recipient.email) {
            try {
              const result = await brevoService.sendEmail({
                to: recipient.email,
                subject: this.personalizeContent(campaign.subject, recipient.custom_variables),
                htmlContent: this.personalizeContent(campaign.content, recipient.custom_variables),
                sender: {
                  name: campaign.sender_name,
                  email: campaign.sender_email
                }
              })
              
              results.push({
                recipientId: recipient.id,
                success: true,
                messageId: result.messageId
              })

              // Actualizar estado del destinatario
              await supabase
                .from('brevo_campaign_recipients')
                .update({
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                  brevo_message_id: result.messageId
                })
                .eq('id', recipient.id)

            } catch (error) {
              results.push({
                recipientId: recipient.id,
                success: false,
                error: error.message
              })

              // Actualizar estado del destinatario con error
              await supabase
                .from('brevo_campaign_recipients')
                .update({
                  status: 'failed',
                  error_message: error.message
                })
                .eq('id', recipient.id)
            }
          }
        }
      }

      // Actualizar estadísticas de la campaña
      const successCount = results.filter(r => r.success).length
      const failedCount = results.filter(r => !r.success).length

      await supabase
        .from('brevo_campaigns')
        .update({
          status: 'completed',
          sent_count: successCount,
          failed_count: failedCount
        })
        .eq('id', campaignId)

      // Actualizar estadísticas diarias
      await this.updateDailyStatistics(campaign.user_id, campaign.campaign_type, {
        sent: successCount,
        failed: failedCount
      })

      return {
        success: true,
        totalRecipients: recipients.length,
        sentCount: successCount,
        failedCount: failedCount,
        results
      }

    } catch (error) {
      console.error('Error al enviar campaña:', error)
      
      // Actualizar estado de la campaña a error
      await supabase
        .from('brevo_campaigns')
        .update({ status: 'cancelled' })
        .eq('id', campaignId)
        
      throw error
    }
  }

  // Personalizar contenido con variables
  personalizeContent(content, variables) {
    let personalizedContent = content
    
    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach(key => {
        const placeholder = `{{${key}}}`
        const value = variables[key] || ''
        personalizedContent = personalizedContent.replace(new RegExp(placeholder, 'g'), value)
      })
    }
    
    return personalizedContent
  }

  // Obtener campañas del usuario
  async getCampaigns(filters = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      let query = supabase
        .from('brevo_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.type) {
        query = query.eq('campaign_type', filters.type)
      }
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al obtener campañas:', error)
      throw error
    }
  }

  // Obtener detalles de una campaña
  async getCampaignDetails(campaignId) {
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('brevo_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError

      const { data: recipients, error: recipientsError } = await supabase
        .from('brevo_campaign_recipients')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (recipientsError) throw recipientsError

      return {
        ...campaign,
        recipients
      }
    } catch (error) {
      console.error('Error al obtener detalles de campaña:', error)
      throw error
    }
  }

  // Obtener estadísticas de una campaña
  async getCampaignStatistics(campaignId) {
    try {
      const { data, error } = await supabase
        .rpc('get_brevo_campaign_stats', { p_campaign_id: campaignId })

      if (error) throw error
      return data[0] || {}
    } catch (error) {
      console.error('Error al obtener estadísticas de campaña:', error)
      throw error
    }
  }

  // Crear plantilla
  async createTemplate(templateData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const template = {
        user_id: user.id,
        name: templateData.name,
        description: templateData.description || null,
        template_type: templateData.type, // 'sms' o 'email'
        subject: templateData.subject || null,
        content: templateData.content,
        variables: JSON.stringify(templateData.variables || [])
      }

      const { data, error } = await supabase
        .from('brevo_templates')
        .insert(template)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al crear plantilla:', error)
      throw error
    }
  }

  // Obtener plantillas del usuario
  async getTemplates(type = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      let query = supabase
        .from('brevo_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (type) {
        query = query.eq('template_type', type)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Convertir variables de string a array
      return data.map(template => ({
        ...template,
        variables: JSON.parse(template.variables || '[]')
      }))
    } catch (error) {
      console.error('Error al obtener plantillas:', error)
      throw error
    }
  }

  // Actualizar estadísticas diarias
  async updateDailyStatistics(userId, campaignType, stats) {
    try {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      
      // Verificar si ya existen estadísticas para hoy
      const { data: existingStats, error: selectError } = await supabase
        .from('brevo_statistics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .eq('period_type', 'daily')
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError
      }

      if (existingStats) {
        // Actualizar estadísticas existentes
        const updateData = {}
        if (campaignType === 'sms') {
          updateData.sms_sent = existingStats.sms_sent + stats.sent
          updateData.sms_failed = existingStats.sms_failed + stats.failed
        } else if (campaignType === 'email') {
          updateData.email_sent = existingStats.email_sent + stats.sent
          updateData.email_failed = existingStats.email_failed + stats.failed
        }
        updateData.total_sent = existingStats.total_sent + stats.sent
        updateData.updated_at = new Date().toISOString()

        await supabase
          .from('brevo_statistics')
          .update(updateData)
          .eq('id', existingStats.id)
      } else {
        // Crear nuevas estadísticas
        const newStats = {
          user_id: userId,
          date: today,
          period_type: 'daily',
          sms_sent: campaignType === 'sms' ? stats.sent : 0,
          sms_failed: campaignType === 'sms' ? stats.failed : 0,
          email_sent: campaignType === 'email' ? stats.sent : 0,
          email_failed: campaignType === 'email' ? stats.failed : 0,
          total_sent: stats.sent
        }

        await supabase
          .from('brevo_statistics')
          .insert(newStats)
      }
    } catch (error) {
      console.error('Error al actualizar estadísticas diarias:', error)
      // No lanzar error para no interrumpir el envío
    }
  }

  // Obtener estadísticas generales
  async getGeneralStatistics(period = 'monthly') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('brevo_statistics')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_type', period)
        .order('date', { ascending: false })
        .limit(12) // Últimos 12 períodos

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error)
      throw error
    }
  }

  // Probar envío
  async testSend(testData) {
    try {
      const config = brevoService.loadConfiguration()
      if (!config.apiKey) {
        throw new Error('Brevo no está configurado')
      }

      if (testData.type === 'sms') {
        return await brevoService.sendSMS({
          to: testData.to,
          message: testData.message,
          sender: config.smsSender
        })
      } else if (testData.type === 'email') {
        return await brevoService.sendEmail({
          to: testData.to,
          subject: testData.subject,
          htmlContent: testData.message,
          sender: {
            name: config.emailName,
            email: config.emailSender
          }
        })
      }
    } catch (error) {
      console.error('Error en prueba de envío:', error)
      throw error
    }
  }
}

// Exportar una instancia única
const brevoCampaignService = new BrevoCampaignService()
export default brevoCampaignService