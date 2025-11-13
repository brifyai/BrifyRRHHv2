import { supabase } from '../lib/supabase.js'

/**
 * Servicio de Gestión Multi-Empresa para Agencias
 * 
 * Este servicio proporciona funcionalidades completas para:
 * - Gestión de múltiples empresas/clientes
 * - Control de límites de uso y costos
 * - Aislamiento completo de datos
 * - Facturación y reportes por empresa
 * - Gestión de roles y permisos por empresa
 */

class MultiCompanyManagementService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutos
  }

  // ========================================
  // GESTIÓN DE EMPRESAS/CLIENTES
  // ========================================

  /**
   * Crear nueva empresa/cliente para una agencia
   * @param {Object} companyData - Datos de la empresa
   * @param {string} agencyId - ID de la agencia
   * @returns {Promise<Object>} Resultado de la creación
   */
  async createCompany(companyData, agencyId) {
    try {
      console.log(`🏢 Creando empresa para agencia ${agencyId}`);

      // Validar que la agencia existe y tiene permisos
      const agency = await this.getAgency(agencyId);
      if (!agency) {
        throw new Error('Agencia no encontrada o sin permisos');
      }

      // Verificar límite de empresas para la agencia
      const companyCount = await this.getCompanyCount(agencyId);
      if (companyCount >= agency.max_companies) {
        throw new Error(`Límite de empresas alcanzado (${agency.max_companies})`);
      }

      // Crear empresa con configuración por defecto
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          agency_id: agencyId,
          status: 'active',
          created_at: new Date().toISOString(),
          // Configuración por defecto para límites
          monthly_limit: companyData.monthlyLimit || agency.default_monthly_limit || 1000,
          daily_limit: companyData.dailyLimit || Math.floor((companyData.monthlyLimit || 1000) / 30),
          message_cost: companyData.messageCost || 0.0525,
          billing_cycle: companyData.billingCycle || 'monthly',
          billing_email: companyData.billingEmail || companyData.contact_email,
          // Configuración de WhatsApp por defecto
          whatsapp_configured: false,
          whatsapp_status: 'not_configured',
          // Configuración de canales por defecto
          email_enabled: true,
          sms_enabled: true,
          telegram_enabled: false,
          whatsapp_enabled: false,
          groq_enabled: false,
          google_enabled: false,
          microsoft_enabled: false,
          slack_enabled: false,
          teams_enabled: false,
          hubspot_enabled: false,
          salesforce_enabled: false
        })
        .select()
        .single();

      if (error) throw error;

      // Crear configuración inicial de uso
      await this.initializeUsageTracking(company.id);

      // Crear configuración de facturación
      await this.initializeBilling(company.id, companyData);

      console.log(`✅ Empresa ${company.name} creada exitosamente`);
      
      return {
        success: true,
        company,
        message: `Empresa ${company.name} creada exitosamente`
      };

    } catch (error) {
      console.error('❌ Error creando empresa:', error);
      return {
        success: false,
        message: `Error creando empresa: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Obtener todas las empresas de una agencia
   * @param {string} agencyId - ID de la agencia
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Array>} Lista de empresas
   */
  async getAgencyCompanies(agencyId, options = {}) {
    const {
      status = null,
      limit = 50,
      offset = 0,
      search = null
    } = options;

    const cacheKey = `agency_companies_${agencyId}_${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('companies')
        .select('*')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,rut.ilike.%${search}%`);
      }

      const { data, error } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Obtener estadísticas de uso para cada empresa
      const companiesWithStats = await Promise.all(
        (data || []).map(async (company) => {
          const stats = await this.getCompanyUsageStats(company.id);
          return {
            ...company,
            usage_stats: stats
          };
        })
      );

      this.setCache(cacheKey, companiesWithStats);
      return companiesWithStats;

    } catch (error) {
      console.error('Error obteniendo empresas de agencia:', error);
      return [];
    }
  }

  /**
   * Actualizar información de una empresa
   * @param {string} companyId - ID de la empresa
   * @param {Object} updateData - Datos a actualizar
   * @param {string} agencyId - ID de la agencia (para verificación)
   * @returns {Promise<Object>} Resultado de la actualización
   */
  async updateCompany(companyId, updateData, agencyId) {
    try {
      // Verificar que la empresa pertenece a la agencia
      const company = await this.getCompany(companyId);
      if (!company || company.agency_id !== agencyId) {
        throw new Error('Empresa no encontrada o sin permisos');
      }

      const { data, error } = await supabase
        .from('companies')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;

      // Limpiar cache
      this.clearCache(`agency_companies_${agencyId}_`);
      this.clearCache(`company_${companyId}`);

      return {
        success: true,
        company: data,
        message: 'Empresa actualizada exitosamente'
      };

    } catch (error) {
      console.error('Error actualizando empresa:', error);
      return {
        success: false,
        message: `Error actualizando empresa: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Suspender o reactivar una empresa
   * @param {string} companyId - ID de la empresa
   * @param {string} status - Nuevo estado (active/suspended)
   * @param {string} agencyId - ID de la agencia
   * @returns {Promise<Object>} Resultado de la operación
   */
  async setCompanyStatus(companyId, status, agencyId) {
    return this.updateCompany(companyId, {
      status,
      suspended_at: status === 'suspended' ? new Date().toISOString() : null,
      reactivated_at: status === 'active' ? new Date().toISOString() : null
    }, agencyId);
  }

  // ========================================
  // CONTROL DE LÍMITES Y COSTOS
  // ========================================

  /**
   * Verificar si una empresa puede enviar mensajes
   * @param {string} companyId - ID de la empresa
   * @param {number} messageCount - Cantidad de mensajes a enviar
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async checkMessageLimits(companyId, messageCount = 1) {
    try {
      const company = await this.getCompany(companyId);
      if (!company) {
        throw new Error('Empresa no encontrada');
      }

      // Obtener uso actual
      const currentUsage = await this.getCurrentUsage(companyId);
      
      // Verificar límite diario
      const dailyRemaining = company.daily_limit - currentUsage.daily_count;
      if (dailyRemaining < messageCount) {
        return {
          canSend: false,
          reason: `Límite diario alcanzado. Restantes: ${dailyRemaining}`,
          dailyLimit: company.daily_limit,
          dailyUsed: currentUsage.daily_count,
          dailyRemaining
        };
      }

      // Verificar límite mensual
      const monthlyRemaining = company.monthly_limit - currentUsage.monthly_count;
      if (monthlyRemaining < messageCount) {
        return {
          canSend: false,
          reason: `Límite mensual alcanzado. Restantes: ${monthlyRemaining}`,
          monthlyLimit: company.monthly_limit,
          monthlyUsed: currentUsage.monthly_count,
          monthlyRemaining
        };
      }

      // Calcular costo estimado
      const estimatedCost = messageCount * company.message_cost;

      return {
        canSend: true,
        dailyRemaining: dailyRemaining - messageCount,
        monthlyRemaining: monthlyRemaining - messageCount,
        estimatedCost,
        costPerMessage: company.message_cost
      };

    } catch (error) {
      console.error('Error verificando límites:', error);
      return {
        canSend: false,
        reason: `Error verificando límites: ${error.message}`
      };
    }
  }

  /**
   * Registrar uso de mensajes para una empresa
   * @param {string} companyId - ID de la empresa
   * @param {Object} usageData - Datos del uso
   * @returns {Promise<Object>} Resultado del registro
   */
  async recordUsage(companyId, usageData) {
    try {
      const {
        messageCount = 1,
        messageType = 'text',
        channel = 'whatsapp',
        cost = null,
        recipientCount = 1,
        metadata = {}
      } = usageData;

      const company = await this.getCompany(companyId);
      const actualCost = cost || (messageCount * company.message_cost);

      // Registrar en tabla de uso
      const { data, error } = await supabase
        .from('company_usage_logs')
        .insert({
          company_id: companyId,
          message_count: messageCount,
          message_type: messageType,
          channel,
          cost: actualCost,
          recipient_count: recipientCount,
          metadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar contadores en la tabla de empresas
      await this.updateCompanyUsageCounters(companyId, messageCount, actualCost);

      // Limpiar cache
      this.clearCache(`company_usage_${companyId}`);

      return {
        success: true,
        usage: data,
        actualCost,
        message: 'Uso registrado exitosamente'
      };

    } catch (error) {
      console.error('Error registrando uso:', error);
      return {
        success: false,
        message: `Error registrando uso: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Obtener estadísticas de uso de una empresa
   * @param {string} companyId - ID de la empresa
   * @param {Object} options - Opciones del período
   * @returns {Promise<Object>} Estadísticas de uso
   */
  async getCompanyUsageStats(companyId, options = {}) {
    const {
      period = 'month', // day, week, month, year
      startDate = null,
      endDate = null
    } = options;

    const cacheKey = `company_usage_stats_${companyId}_${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Construir filtro de fechas
      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter = {
          start: startDate,
          end: endDate
        };
      } else {
        dateFilter = this.getDateRange(period);
      }

      const { data, error } = await supabase
        .from('company_usage_logs')
        .select('*')
        .eq('company_id', companyId)
        .gte('created_at', dateFilter.start)
        .lte('created_at', dateFilter.end)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Procesar estadísticas
      const stats = {
        period,
        dateRange: dateFilter,
        totalMessages: data?.reduce((sum, log) => sum + log.message_count, 0) || 0,
        totalCost: data?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0,
        totalRecipients: data?.reduce((sum, log) => sum + log.recipient_count, 0) || 0,
        avgCostPerMessage: 0,
        usageByChannel: {},
        usageByType: {},
        dailyUsage: {},
        weeklyUsage: {},
        monthlyUsage: {}
      };

      // Calcular promedio
      if (stats.totalMessages > 0) {
        stats.avgCostPerMessage = stats.totalCost / stats.totalMessages;
      }

      // Agrupar por canal
      data?.forEach(log => {
        if (!stats.usageByChannel[log.channel]) {
          stats.usageByChannel[log.channel] = {
            messages: 0,
            cost: 0,
            recipients: 0
          };
        }
        stats.usageByChannel[log.channel].messages += log.message_count;
        stats.usageByChannel[log.channel].cost += log.cost || 0;
        stats.usageByChannel[log.channel].recipients += log.recipient_count;
      });

      // Agrupar por tipo
      data?.forEach(log => {
        if (!stats.usageByType[log.message_type]) {
          stats.usageByType[log.message_type] = {
            messages: 0,
            cost: 0
          };
        }
        stats.usageByType[log.message_type].messages += log.message_count;
        stats.usageByType[log.message_type].cost += log.cost || 0;
      });

      this.setCache(cacheKey, stats);
      return stats;

    } catch (error) {
      console.error('Error obteniendo estadísticas de uso:', error);
      return {
        period,
        dateRange: this.getDateRange(period),
        totalMessages: 0,
        totalCost: 0,
        totalRecipients: 0,
        avgCostPerMessage: 0,
        usageByChannel: {},
        usageByType: {}
      };
    }
  }

  // ========================================
  // FACTURACIÓN Y BILLING
  // ========================================

  /**
   * Generar factura para una empresa
   * @param {string} companyId - ID de la empresa
   * @param {Object} billingOptions - Opciones de facturación
   * @returns {Promise<Object>} Factura generada
   */
  async generateInvoice(companyId, billingOptions = {}) {
    try {
      const {
        period = 'monthly',
        startDate = null,
        endDate = null,
        includeDetails = true
      } = billingOptions;

      const company = await this.getCompany(companyId);
      if (!company) {
        throw new Error('Empresa no encontrada');
      }

      // Obtener estadísticas de uso del período
      const usageStats = await this.getCompanyUsageStats(companyId, {
        period,
        startDate,
        endDate
      });

      // Calcular detalles de facturación
      const invoiceDetails = {
        company_id: companyId,
        company_name: company.name,
        company_rut: company.rut,
        billing_email: company.billing_email,
        period,
        date_range: usageStats.dateRange,
        invoice_number: await this.generateInvoiceNumber(companyId),
        issue_date: new Date().toISOString(),
        due_date: this.calculateDueDate(company.billing_cycle),
        status: 'pending',
        subtotal: usageStats.totalCost,
        tax_rate: 0.19, // 19% IVA en Chile
        tax_amount: usageStats.totalCost * 0.19,
        total_amount: usageStats.totalCost * 1.19,
        currency: 'CLP',
        usage_summary: {
          total_messages: usageStats.totalMessages,
          total_recipients: usageStats.totalRecipients,
          avg_cost_per_message: usageStats.avgCostPerMessage,
          usage_by_channel: usageStats.usageByChannel,
          usage_by_type: usageStats.usageByType
        }
      };

      // Guardar factura
      const { data: invoice, error } = await supabase
        .from('company_invoices')
        .insert(invoiceDetails)
        .select()
        .single();

      if (error) throw error;

      // Generar PDF de la factura (si se solicita)
      let invoicePdf = null;
      if (includeDetails) {
        invoicePdf = await this.generateInvoicePDF(invoice, company, usageStats);
      }

      console.log(`✅ Factura generada para ${company.name}: ${invoice.invoice_number}`);

      return {
        success: true,
        invoice,
        invoicePdf,
        message: `Factura ${invoice.invoice_number} generada exitosamente`
      };

    } catch (error) {
      console.error('Error generando factura:', error);
      return {
        success: false,
        message: `Error generando factura: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Obtener facturas de una empresa
   * @param {string} companyId - ID de la empresa
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Array>} Lista de facturas
   */
  async getCompanyInvoices(companyId, options = {}) {
    const {
      status = null,
      limit = 50,
      offset = 0
    } = options;

    try {
      let query = supabase
        .from('company_invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('issue_date', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error obteniendo facturas:', error);
      return [];
    }
  }

  // ========================================
  // MÉTODOS UTILITARIAS
  // ========================================

  /**
   * Obtener información de una empresa
   * @param {string} companyId - ID de la empresa
   * @returns {Promise<Object>} Información de la empresa
   */
  async getCompany(companyId) {
    const cacheKey = `company_${companyId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) return null;

      this.setCache(cacheKey, data);
      return data;

    } catch (error) {
      console.error('Error obteniendo empresa:', error);
      return null;
    }
  }

  /**
   * Obtener información de una agencia
   * @param {string} agencyId - ID de la agencia
   * @returns {Promise<Object>} Información de la agencia
   */
  async getAgency(agencyId) {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', agencyId)
        .single();

      if (error) return null;

      return data;

    } catch (error) {
      console.error('Error obteniendo agencia:', error);
      return null;
    }
  }

  /**
   * Obtener cantidad de empresas de una agencia
   * @param {string} agencyId - ID de la agencia
   * @returns {Promise<number>} Cantidad de empresas
   */
  async getCompanyCount(agencyId) {
    try {
      const { count, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', agencyId);

      return count || 0;

    } catch (error) {
      console.error('Error contando empresas:', error);
      return 0;
    }
  }

  /**
   * Inicializar tracking de uso para una empresa
   * @param {string} companyId - ID de la empresa
   * @returns {Promise<void>}
   */
  async initializeUsageTracking(companyId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('company_usage_counters')
        .insert({
          company_id: companyId,
          date: today,
          daily_count: 0,
          monthly_count: 0,
          daily_cost: 0,
          monthly_cost: 0,
          created_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error inicializando tracking de uso:', error);
    }
  }

  /**
   * Inicializar configuración de facturación
   * @param {string} companyId - ID de la empresa
   * @param {Object} companyData - Datos de la empresa
   * @returns {Promise<void>}
   */
  async initializeBilling(companyId, companyData) {
    try {
      await supabase
        .from('company_billing_config')
        .insert({
          company_id: companyId,
          billing_cycle: companyData.billingCycle || 'monthly',
          billing_email: companyData.billingEmail || companyData.contact_email,
          auto_generate_invoices: true,
          payment_method: 'manual',
          tax_rate: 0.19,
          currency: 'CLP',
          created_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error inicializando facturación:', error);
    }
  }

  /**
   * Obtener uso actual de una empresa
   * @param {string} companyId - ID de la empresa
   * @returns {Promise<Object>} Uso actual
   */
  async getCurrentUsage(companyId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = today.substring(0, 7); // YYYY-MM

      // Obtener contador diario
      const { data: dailyData } = await supabase
        .from('company_usage_counters')
        .select('daily_count, daily_cost')
        .eq('company_id', companyId)
        .eq('date', today)
        .single();

      // Obtener contador mensual
      const { data: monthlyData } = await supabase
        .from('company_usage_counters')
        .select('monthly_count, monthly_cost')
        .eq('company_id', companyId)
        .eq('date', currentMonth)
        .single();

      return {
        daily_count: dailyData?.daily_count || 0,
        daily_cost: dailyData?.daily_cost || 0,
        monthly_count: monthlyData?.monthly_count || 0,
        monthly_cost: monthlyData?.monthly_cost || 0
      };

    } catch (error) {
      console.error('Error obteniendo uso actual:', error);
      return {
        daily_count: 0,
        daily_cost: 0,
        monthly_count: 0,
        monthly_cost: 0
      };
    }
  }

  /**
   * Actualizar contadores de uso de una empresa
   * @param {string} companyId - ID de la empresa
   * @param {number} messageCount - Cantidad de mensajes
   * @param {number} cost - Costo total
   * @returns {Promise<void>}
   */
  async updateCompanyUsageCounters(companyId, messageCount, cost) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = today.substring(0, 7); // YYYY-MM

      // Actualizar contador diario
      await supabase.rpc('increment_daily_usage', {
        p_company_id: companyId,
        p_date: today,
        p_message_count: messageCount,
        p_cost: cost
      });

      // Actualizar contador mensual
      await supabase.rpc('increment_monthly_usage', {
        p_company_id: companyId,
        p_month: currentMonth,
        p_message_count: messageCount,
        p_cost: cost
      });

    } catch (error) {
      console.error('Error actualizando contadores:', error);
    }
  }

  /**
   * Generar número de factura único
   * @param {string} companyId - ID de la empresa
   * @returns {Promise<string>} Número de factura
   */
  async generateInvoiceNumber(companyId) {
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();

      const companyCode = company?.name?.substring(0, 3).toUpperCase() || 'EMP';
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').substring(0, 12);
      
      return `INV-${companyCode}-${timestamp}`;

    } catch (error) {
      console.error('Error generando número de factura:', error);
      return `INV-${Date.now()}`;
    }
  }

  /**
   * Calcular fecha de vencimiento
   * @param {string} billingCycle - Ciclo de facturación
   * @returns {string} Fecha de vencimiento
   */
  calculateDueDate(billingCycle) {
    const now = new Date();
    
    switch (billingCycle) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'biweekly':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString();
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, 15).toISOString();
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  /**
   * Generar PDF de factura (placeholder)
   * @param {Object} invoice - Datos de la factura
   * @param {Object} company - Datos de la empresa
   * @param {Object} usageStats - Estadísticas de uso
   * @returns {Promise<string>} URL del PDF generado
   */
  async generateInvoicePDF(invoice, company, usageStats) {
    // Placeholder para generación de PDF
    // En una implementación real, aquí se usaría una librería como jsPDF o Puppeteer
    return `https://api.ejemplo.com/invoices/${invoice.id}/pdf`;
  }

  /**
   * Obtener rango de fechas
   * @param {string} period - Período (day, week, month, year)
   * @returns {Object} Rango de fechas
   */
  getDateRange(period) {
    const now = new Date();
    const end = now.toISOString();
    
    let start;
    switch (period) {
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1).toISOString();
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    return { start, end };
  }

  // ========================================
  // MÉTODOS DE CACHE
  // ========================================

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// Crear instancia global del servicio
const multiCompanyManagementService = new MultiCompanyManagementService();

export default multiCompanyManagementService;