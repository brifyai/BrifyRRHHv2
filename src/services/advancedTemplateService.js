/**
 * Advanced Template Service
 * Servicio para gestionar plantillas avanzadas con variables dinámicas
 * por canal (WhatsApp, Email, SMS) e industria
 * 
 * ✅ NO MODIFICA código existente
 * ✅ Completamente independiente
 * ✅ Puede ser desactivado sin afectar el sistema
 */

import { supabase } from '../lib/supabase'

class AdvancedTemplateService {
  constructor() {
    this.templates = new Map()
    this.cache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutos
  }

  /**
   * Crear una nueva plantilla avanzada
   * @param {Object} templateData - Datos de la plantilla
   * @returns {Promise<Object>} Plantilla creada
   */
  async createTemplate(templateData) {
    try {
      const {
        name,
        description,
        channel_type, // 'whatsapp', 'email', 'sms'
        industry_sector,
        content,
        variables = [],
        preview_html
      } = templateData

      // Validar datos
      if (!name || !channel_type || !content) {
        return {
          error: 'Faltan campos requeridos: name, channel_type, content',
          success: false
        }
      }

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('advanced_templates')
        .insert([
          {
            name,
            description,
            channel_type,
            industry_sector,
            content,
            variables,
            preview_html,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        console.error('Error creating template:', error)
        return { error: error.message, success: false }
      }

      // Limpiar caché
      this.clearCache()

      return {
        data: data[0],
        success: true,
        message: 'Plantilla creada exitosamente'
      }
    } catch (error) {
      console.error('Error in createTemplate:', error)
      return { error: error.message, success: false }
    }
  }

  /**
   * Obtener plantillas por canal
   * @param {string} channel - Tipo de canal
   * @returns {Promise<Array>} Plantillas del canal
   */
  async getTemplatesByChannel(channel) {
    try {
      const cacheKey = `templates_channel_${channel}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const { data, error } = await supabase
        .from('advanced_templates')
        .select('*')
        .eq('channel_type', channel)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching templates:', error)
        return []
      }

      this.setCache(cacheKey, data)
      return data || []
    } catch (error) {
      console.error('Error in getTemplatesByChannel:', error)
      return []
    }
  }

  /**
   * Obtener plantillas por industria
   * @param {string} industry - Sector industrial
   * @returns {Promise<Array>} Plantillas de la industria
   */
  async getTemplatesByIndustry(industry) {
    try {
      const cacheKey = `templates_industry_${industry}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const { data, error } = await supabase
        .from('advanced_templates')
        .select('*')
        .eq('industry_sector', industry)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching templates:', error)
        return []
      }

      this.setCache(cacheKey, data)
      return data || []
    } catch (error) {
      console.error('Error in getTemplatesByIndustry:', error)
      return []
    }
  }

  /**
   * Renderizar plantilla con variables dinámicas
   * @param {string} templateId - ID de la plantilla
   * @param {Object} variables - Variables a reemplazar
   * @returns {Promise<string>} Contenido renderizado
   */
  async renderTemplate(templateId, variables = {}) {
    try {
      const { data, error } = await supabase
        .from('advanced_templates')
        .select('content, variables')
        .eq('id', templateId)
        .single()

      if (error) {
        console.error('Error fetching template:', error)
        return ''
      }

      let content = data.content

      // Reemplazar variables dinámicas
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        content = content.replace(regex, value || '')
      })

      return content
    } catch (error) {
      console.error('Error in renderTemplate:', error)
      return ''
    }
  }

  /**
   * Actualizar plantilla
   * @param {string} templateId - ID de la plantilla
   * @param {Object} updates - Actualizaciones
   * @returns {Promise<Object>} Plantilla actualizada
   */
  async updateTemplate(templateId, updates) {
    try {
      const { data, error } = await supabase
        .from('advanced_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()

      if (error) {
        console.error('Error updating template:', error)
        return { error: error.message, success: false }
      }

      this.clearCache()

      return {
        data: data[0],
        success: true,
        message: 'Plantilla actualizada exitosamente'
      }
    } catch (error) {
      console.error('Error in updateTemplate:', error)
      return { error: error.message, success: false }
    }
  }

  /**
   * Eliminar plantilla
   * @param {string} templateId - ID de la plantilla
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteTemplate(templateId) {
    try {
      const { error } = await supabase
        .from('advanced_templates')
        .delete()
        .eq('id', templateId)

      if (error) {
        console.error('Error deleting template:', error)
        return { error: error.message, success: false }
      }

      this.clearCache()

      return {
        success: true,
        message: 'Plantilla eliminada exitosamente'
      }
    } catch (error) {
      console.error('Error in deleteTemplate:', error)
      return { error: error.message, success: false }
    }
  }

  /**
   * Obtener todas las plantillas
   * @returns {Promise<Array>} Todas las plantillas
   */
  async getAllTemplates() {
    try {
      const cacheKey = 'all_templates'
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const { data, error } = await supabase
        .from('advanced_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching templates:', error)
        return []
      }

      this.setCache(cacheKey, data)
      return data || []
    } catch (error) {
      console.error('Error in getAllTemplates:', error)
      return []
    }
  }

  /**
   * Obtener plantilla por ID
   * @param {string} templateId - ID de la plantilla
   * @returns {Promise<Object>} Plantilla
   */
  async getTemplateById(templateId) {
    try {
      const { data, error } = await supabase
        .from('advanced_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) {
        console.error('Error fetching template:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getTemplateById:', error)
      return null
    }
  }

  /**
   * Validar variables en plantilla
   * @param {string} content - Contenido de la plantilla
   * @returns {Array} Variables encontradas
   */
  extractVariables(content) {
    const regex = /{{(\w+)}}/g
    const variables = []
    let match

    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    return variables
  }

  /**
   * Generar preview HTML
   * @param {string} content - Contenido de la plantilla
   * @param {Object} sampleVariables - Variables de ejemplo
   * @returns {string} HTML de preview
   */
  generatePreview(content, sampleVariables = {}) {
    let preview = content

    Object.entries(sampleVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      preview = preview.replace(regex, value || `[${key}]`)
    })

    return preview
  }

  // Métodos de caché
  getFromCache(key) {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clearCache() {
    this.cache.clear()
  }
}

export default new AdvancedTemplateService()
