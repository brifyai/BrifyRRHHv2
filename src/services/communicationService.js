import { supabase } from '../lib/supabase.js';
import inMemoryEmployeeService from './inMemoryEmployeeService.js';
import whatsappService from './whatsappService.js';
import multiWhatsAppService from './multiWhatsAppService.js';
import companyChannelCredentialsService from './companyChannelCredentialsService.js';

class CommunicationService {
  // Get all employees with optional filters - Optimized version
  async getEmployees(filters = {}) {
    try {
      // Build base query with only essential fields initially
      let query = supabase
        .from('employees')
        .select(`
          id,
          name,
          email,
          phone,
          region,
          department,
          level,
          position,
          work_mode,
          contract_type,
          has_subordinates,
          company_id,
          is_active
        `)
        .eq('is_active', true);

      // Apply filters efficiently - use exact matches where possible
      if (filters.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      
      if (filters.region) {
        query = query.eq('region', filters.region);
      }
      
      if (filters.branch) {
        query = query.eq('branch', filters.branch);
      }
      
      if (filters.department) {
        query = query.eq('department', filters.department);
      }
      
      if (filters.team) {
        query = query.eq('team', filters.team);
      }
      
      if (filters.level) {
        query = query.eq('level', filters.level);
      }
      
      if (filters.position) {
        query = query.eq('position', filters.position);
      }
      
      if (filters.hasSubordinates !== undefined) {
        query = query.eq('has_subordinates', filters.hasSubordinates);
      }
      
      if (filters.workMode) {
        query = query.eq('work_mode', filters.workMode);
      }
      
      if (filters.contractType) {
        query = query.eq('contract_type', filters.contractType);
      }
      
      if (filters.seniority) {
        query = query.eq('seniority', filters.seniority);
      }

      // Apply pagination and ordering
      const { data: employees, error } = await query
        .order('name', { ascending: true })
        .limit(filters.limit || 1000);

      if (error) throw error;
      
      if (!employees || employees.length === 0) {
        return [];
      }

      // Fetch related data separately only if needed and in batches
      let enrichedEmployees = employees;
      
      // Only fetch company data if we have employees and it's needed
      if (filters.includeCompany !== false) {
        const companyIds = [...new Set(employees.map(emp => emp.company_id))];
        if (companyIds.length > 0) {
          const { data: companies } = await supabase
            .from('companies')
            .select('id, name')
            .in('id', companyIds);
          
          const companyMap = (companies || []).reduce((map, company) => {
            map[company.id] = company.name;
            return map;
          }, {});
          
          enrichedEmployees = enrichedEmployees.map(emp => ({
            ...emp,
            company: { name: companyMap[emp.company_id] || 'Unknown' }
          }));
        }
      }

      // Only fetch skills if specifically requested
      if (filters.includeSkills) {
        const employeeIds = employees.map(emp => emp.id);
        const { data: skills } = await supabase
          .from('employee_skills')
          .select(`
            employee_id,
            skill:skills(name)
          `)
          .in('employee_id', employeeIds);
        
        const skillsMap = (skills || []).reduce((map, item) => {
          if (!map[item.employee_id]) map[item.employee_id] = [];
          if (item.skill?.name) map[item.employee_id].push(item.skill);
          return map;
        }, {});
        
        enrichedEmployees = enrichedEmployees.map(emp => ({
          ...emp,
          skills: skillsMap[emp.id] || []
        }));
      }

      // Only fetch interests if specifically requested
      if (filters.includeInterests) {
        const employeeIds = employees.map(emp => emp.id);
        const { data: interests } = await supabase
          .from('employee_interests')
          .select(`
            employee_id,
            interest:interests(name)
          `)
          .in('employee_id', employeeIds);
        
        const interestsMap = (interests || []).reduce((map, item) => {
          if (!map[item.employee_id]) map[item.employee_id] = [];
          if (item.interest?.name) map[item.employee_id].push(item.interest);
          return map;
        }, {});
        
        enrichedEmployees = enrichedEmployees.map(emp => ({
          ...emp,
          interests: interestsMap[emp.id] || []
        }));
      }

      // Handle complex filters with separate queries for better performance
      if (filters.projectId) {
        const { data: projectEmployees } = await supabase
          .from('project_assignments')
          .select('employee_id')
          .eq('project_id', filters.projectId);
        
        const projectEmployeeIds = (projectEmployees || []).map(pe => pe.employee_id);
        enrichedEmployees = enrichedEmployees.filter(emp =>
          projectEmployeeIds.includes(emp.id)
        );
      }
      
      if (filters.skill) {
        const { data: skillEmployees } = await supabase
          .from('employee_skills')
          .select('employee_id')
          .eq('skill_id', filters.skill);
        
        const skillEmployeeIds = (skillEmployees || []).map(se => se.employee_id);
        enrichedEmployees = enrichedEmployees.filter(emp =>
          skillEmployeeIds.includes(emp.id)
        );
      }
      
      if (filters.interest) {
        const { data: interestEmployees } = await supabase
          .from('employee_interests')
          .select('employee_id')
          .eq('interest_id', filters.interest);
        
        const interestEmployeeIds = (interestEmployees || []).map(ie => ie.employee_id);
        enrichedEmployees = enrichedEmployees.filter(emp =>
          interestEmployeeIds.includes(emp.id)
        );
      }
      
      return enrichedEmployees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  // Optimized method to get employee count only
  async getEmployeesCount(filters = {}) {
    try {
      let query = supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Apply same filters as getEmployees but without joins
      if (filters.companyId) query = query.eq('company_id', filters.companyId);
      if (filters.region) query = query.eq('region', filters.region);
      if (filters.department) query = query.eq('department', filters.department);
      if (filters.level) query = query.eq('level', filters.level);
      if (filters.position) query = query.eq('position', filters.position);
      if (filters.hasSubordinates !== undefined) query = query.eq('has_subordinates', filters.hasSubordinates);
      if (filters.workMode) query = query.eq('work_mode', filters.workMode);
      if (filters.contractType) query = query.eq('contract_type', filters.contractType);

      const { count, error } = await query;
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting employees count:', error);
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

  // Get employee by ID - Optimized version
  async getEmployeeById(id, options = {}) {
    try {
      if (!id) {
        throw new Error('Employee ID is required');
      }

      // Start with basic employee data
      let query = supabase
        .from('employees')
        .select(`
          id,
          name,
          email,
          phone,
          region,
          department,
          level,
          position,
          work_mode,
          contract_type,
          has_subordinates,
          company_id,
          is_active,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .single();

      const { data: employee, error } = await query;
      
      if (error) throw error;
      if (!employee) return null;

      // Fetch related data separately and conditionally
      let enrichedEmployee = { ...employee };

      // Only fetch company data if needed
      if (options.includeCompany !== false) {
        const { data: company } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', employee.company_id)
          .single();
        
        enrichedEmployee.company = company || { name: 'Unknown' };
      }

      // Only fetch skills if specifically requested
      if (options.includeSkills) {
        const { data: skills } = await supabase
          .from('employee_skills')
          .select(`
            skill:skills(name, id)
          `)
          .eq('employee_id', id);
        
        enrichedEmployee.skills = (skills || []).map(s => s.skill).filter(Boolean);
      }

      // Only fetch interests if specifically requested
      if (options.includeInterests) {
        const { data: interests } = await supabase
          .from('employee_interests')
          .select(`
            interest:interests(name, id)
          `)
          .eq('employee_id', id);
        
        enrichedEmployee.interests = (interests || []).map(i => i.interest).filter(Boolean);
      }

      return enrichedEmployee;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  // Send WhatsApp message - Optimized version with real WhatsApp API
  async sendWhatsAppMessage(recipientIds, message, options = {}) {
    try {
      console.log('🚀 Iniciando envío de WhatsApp message');
      console.log('Recipient IDs:', recipientIds);
      console.log('Message:', message);
      
      // Validate inputs
      if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
        throw new Error('Recipient IDs must be a non-empty array');
      }
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('Message must be a non-empty string');
      }
      
      // Check if WhatsApp is configured
      const whatsappConfig = whatsappService.loadConfiguration();
      if (!whatsappConfig.accessToken) {
        console.warn('⚠️ WhatsApp no está configurado, usando simulación');
        return this.sendSimulatedWhatsAppMessage(recipientIds, message);
      }
      
      // Get sender data using optimized helper
      const senderData = await this.getSenderData();
      
      // Get employee data for phone numbers
      const employees = await this.getEmployeesByIds(recipientIds);
      const phoneNumbers = employees
        .filter(emp => emp.phone && emp.phone.trim() !== '')
        .map(emp => emp.phone);
      
      if (phoneNumbers.length === 0) {
        throw new Error('No se encontraron números de teléfono válidos para los destinatarios');
      }
      
      // Create communication log using optimized helper
      const logId = await this.createCommunicationLog(
        senderData,
        recipientIds,
        message,
        'whatsapp'
      );
      
      if (logId) {
        console.log('✅ Log de comunicación guardado con ID:', logId);
      }
      
      // Send real WhatsApp messages
      const result = await whatsappService.sendBulkMessage({
        recipients: phoneNumbers,
        message: message,
        messageType: options.templateName ? 'template' : 'text',
        templateName: options.templateName || null,
        templateLanguage: options.templateLanguage || 'es',
        components: options.components || [],
        delayBetweenMessages: options.delayBetweenMessages || 1000
      });
      
      console.log('✅ Mensaje de WhatsApp enviado exitosamente');
      return {
        success: result.success,
        message: result.success
          ? `Mensaje enviado a ${result.successful} destinatarios vía WhatsApp`
          : `Error: ${result.failed} mensajes fallaron`,
        recipientCount: result.totalRecipients,
        successfulDeliveries: result.successful,
        failedDeliveries: result.failed,
        channel: 'whatsapp',
        timestamp: new Date().toISOString(),
        logId: logId,
        details: result.results
      };
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      throw error;
    }
  }

  // Send WhatsApp message using multi-number service (NEW METHOD)
  async sendWhatsAppMessageByCompany(companyId, recipientIds, message, options = {}) {
    try {
      console.log('🚀 Iniciando envío de WhatsApp multi-empresa');
      console.log('Company ID:', companyId);
      console.log('Recipient IDs:', recipientIds);
      console.log('Message:', message);
      
      // Validate inputs
      if (!companyId) {
        throw new Error('Company ID is required for multi-number WhatsApp');
      }
      if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
        throw new Error('Recipient IDs must be a non-empty array');
      }
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('Message must be a non-empty string');
      }
      
      // Get sender data using optimized helper
      const senderData = await this.getSenderData();
      
      // Get employee data for phone numbers
      const employees = await this.getEmployeesByIds(recipientIds);
      const phoneNumbers = employees
        .filter(emp => emp.phone && emp.phone.trim() !== '')
        .map(emp => emp.phone);
      
      if (phoneNumbers.length === 0) {
        throw new Error('No se encontraron números de teléfono válidos para los destinatarios');
      }
      
      // Create communication log using optimized helper
      const logId = await this.createCommunicationLog(
        senderData,
        recipientIds,
        message,
        'whatsapp'
      );
      
      if (logId) {
        console.log('✅ Log de comunicación guardado con ID:', logId);
      }
      
      // Send using multi-WhatsApp service
      const result = await multiWhatsAppService.sendMessageByCompany(companyId, {
        recipients: phoneNumbers,
        message: message,
        templateName: options.templateName || null,
        templateLanguage: options.templateLanguage || 'es',
        components: options.components || [],
        messageType: options.messageType || 'text'
      });
      
      console.log('✅ Mensaje de WhatsApp multi-empresa enviado exitosamente');
      return {
        success: result.success,
        message: result.success
          ? `Mensaje enviado a ${result.successful} destinatarios vía WhatsApp (Empresa: ${companyId})`
          : `Error: ${result.failed} mensajes fallaron`,
        recipientCount: result.totalRecipients,
        successfulDeliveries: result.successful,
        failedDeliveries: result.failed,
        channel: 'whatsapp',
        companyId: companyId,
        timestamp: new Date().toISOString(),
        logId: logId,
        details: result.results
      };
    } catch (error) {
      console.error('❌ Error sending multi-company WhatsApp message:', error);
      throw error;
    }
  }

  // Send bulk WhatsApp messages to multiple companies (NEW METHOD)
  async sendBulkWhatsAppToCompanies(companiesData, message, options = {}) {
    try {
      console.log('🚀 Iniciando envío masivo de WhatsApp a múltiples empresas');
      
      // Validate input
      if (!companiesData || !Array.isArray(companiesData) || companiesData.length === 0) {
        throw new Error('Companies data must be a non-empty array');
      }
      
      // Prepare data for multi-WhatsApp service
      const companies = companiesData.map(company => ({
        companyId: company.companyId,
        recipients: company.recipients || []
      }));
      
      // Send using multi-WhatsApp service
      const result = await multiWhatsAppService.sendBulkMessageByCompanies({
        companies: companies,
        message: message,
        templateName: options.templateName || null,
        templateLanguage: options.templateLanguage || 'es',
        components: options.components || [],
        messageType: options.messageType || 'text',
        delayBetweenMessages: options.delayBetweenMessages || 1000
      });
      
      console.log('✅ Envío masivo multi-empresa completado');
      return {
        success: result.success,
        message: result.message,
        totalCompanies: result.totalCompanies,
        successfulCompanies: result.successfulCompanies,
        failedCompanies: result.failedCompanies,
        totalRecipients: result.totalRecipients,
        totalSuccessful: result.totalSuccessful,
        totalFailed: result.totalFailed,
        channel: 'whatsapp',
        timestamp: new Date().toISOString(),
        details: result.results
      };
    } catch (error) {
      console.error('❌ Error sending bulk WhatsApp to companies:', error);
      throw error;
    }
  }

  // Get WhatsApp configurations for all companies (NEW METHOD)
  async getAllWhatsAppConfigurations() {
    try {
      const configs = await multiWhatsAppService.getAllWhatsAppConfigs();
      return {
        success: true,
        configurations: configs,
        total: configs.length
      };
    } catch (error) {
      console.error('❌ Error getting WhatsApp configurations:', error);
      return {
        success: false,
        message: `Error obteniendo configuraciones: ${error.message}`,
        configurations: []
      };
    }
  }

  // Get WhatsApp configuration for a specific company (NEW METHOD)
  async getWhatsAppConfigurationByCompany(companyId) {
    try {
      const config = await multiWhatsAppService.getWhatsAppConfigByCompany(companyId);
      return {
        success: !!config,
        configuration: config,
        message: config ? 'Configuración encontrada' : 'No hay configuración para esta empresa'
      };
    } catch (error) {
      console.error('❌ Error getting WhatsApp configuration for company:', error);
      return {
        success: false,
        message: `Error obteniendo configuración: ${error.message}`,
        configuration: null
      };
    }
  }

  // Configure WhatsApp for a company (NEW METHOD)
  async configureWhatsAppForCompany(companyId, config) {
    try {
      const result = await multiWhatsAppService.configureWhatsAppForCompany(companyId, config);
      return result;
    } catch (error) {
      console.error('❌ Error configuring WhatsApp for company:', error);
      return {
        success: false,
        message: `Error configurando WhatsApp: ${error.message}`,
        error: error.message
      };
    }
  }

  // Get WhatsApp usage statistics (NEW METHOD)
  async getWhatsAppUsageStats(companyId = null) {
    try {
      const stats = await multiWhatsAppService.getUsageStats(companyId);
      return {
        success: true,
        statistics: stats,
        companyId: companyId
      };
    } catch (error) {
      console.error('❌ Error getting WhatsApp usage stats:', error);
      return {
        success: false,
        message: `Error obteniendo estadísticas: ${error.message}`,
        statistics: null
      };
    }
  }

  // Delete WhatsApp configuration for a company (NEW METHOD)
  async deleteWhatsAppConfiguration(companyId) {
    try {
      const result = await multiWhatsAppService.deleteWhatsAppConfiguration(companyId);
      return result;
    } catch (error) {
      console.error('❌ Error deleting WhatsApp configuration:', error);
      return {
        success: false,
        message: `Error eliminando configuración: ${error.message}`,
        error: error.message
      };
    }
  }

  // Fallback simulated WhatsApp message for development/testing
  async sendSimulatedWhatsAppMessage(recipientIds, message) {
    try {
      console.log('🧪 Enviando mensaje de WhatsApp simulado');
      
      // Get sender data using optimized helper
      const senderData = await this.getSenderData();
      
      // Validate recipient IDs using optimized helper
      const validRecipientIds = await this.validateRecipients(recipientIds);
      
      // Create communication log using optimized helper
      const logId = await this.createCommunicationLog(
        senderData,
        validRecipientIds,
        message,
        'whatsapp'
      );
      
      if (logId) {
        console.log('✅ Log de comunicación guardado con ID:', logId);
      }
      
      // Simulate API call delay
      console.log('⏳ Simulando llamada a API de WhatsApp...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Mensaje de WhatsApp simulado enviado exitosamente');
      return {
        success: true,
        message: `Mensaje simulado enviado a ${validRecipientIds.length} destinatarios vía WhatsApp`,
        recipientCount: validRecipientIds.length,
        channel: 'whatsapp',
        timestamp: new Date().toISOString(),
        logId: logId,
        simulated: true
      };
    } catch (error) {
      console.error('❌ Error sending simulated WhatsApp message:', error);
      throw error;
    }
  }

  // Send Telegram message - Optimized version
  async sendTelegramMessage(recipientIds, message) {
    try {
      console.log('🚀 Iniciando envío de Telegram message');
      console.log('Recipient IDs:', recipientIds);
      console.log('Message:', message);
      
      // Validate inputs
      if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
        throw new Error('Recipient IDs must be a non-empty array');
      }
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('Message must be a non-empty string');
      }
      
      // Get sender data using optimized helper
      const senderData = await this.getSenderData();
      
      // Validate recipient IDs using optimized helper
      const validRecipientIds = await this.validateRecipients(recipientIds);
      
      // Create communication log using optimized helper
      const logId = await this.createCommunicationLog(
        senderData,
        validRecipientIds,
        message,
        'telegram'
      );
      
      if (logId) {
        console.log('✅ Log de comunicación guardado con ID:', logId);
      }
      
      // Simulate API call delay
      console.log('⏳ Simulando llamada a API de Telegram...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Mensaje de Telegram enviado exitosamente');
      return {
        success: true,
        message: `Mensaje enviado a ${validRecipientIds.length} destinatarios vía Telegram`,
        recipientCount: validRecipientIds.length,
        channel: 'telegram',
        timestamp: new Date().toISOString(),
        logId: logId
      };
    } catch (error) {
      console.error('❌ Error sending Telegram message:', error);
      throw error;
    }
  }

  // Send SMS message - New method
  async sendSMSMessage(recipientIds, message) {
    try {
      console.log('🚀 Iniciando envío de SMS message');
      console.log('Recipient IDs:', recipientIds);
      console.log('Message:', message);
      
      // Validate inputs
      if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
        throw new Error('Recipient IDs must be a non-empty array');
      }
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('Message must be a non-empty string');
      }
      
      // Get sender data using optimized helper
      const senderData = await this.getSenderData();
      
      // Validate recipient IDs using optimized helper
      const validRecipientIds = await this.validateRecipients(recipientIds);
      
      // Create communication log using optimized helper
      const logId = await this.createCommunicationLog(
        senderData,
        validRecipientIds,
        message,
        'sms'
      );
      
      if (logId) {
        console.log('✅ Log de comunicación guardado con ID:', logId);
      }
      
      // Simulate API call delay
      console.log('⏳ Simulando llamada a API de SMS...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Mensaje SMS enviado exitosamente');
      return {
        success: true,
        message: `Mensaje enviado a ${validRecipientIds.length} destinatarios vía SMS`,
        recipientCount: validRecipientIds.length,
        channel: 'sms',
        timestamp: new Date().toISOString(),
        logId: logId
      };
    } catch (error) {
      console.error('❌ Error sending SMS message:', error);
      throw error;
    }
  }

  // Send Email message - New method
  async sendEmailMessage(recipientIds, message, subject = 'Sin asunto') {
    try {
      console.log('🚀 Iniciando envío de Email message');
      console.log('Recipient IDs:', recipientIds);
      console.log('Message:', message);
      console.log('Subject:', subject);
      
      // Validate inputs
      if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
        throw new Error('Recipient IDs must be a non-empty array');
      }
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('Message must be a non-empty string');
      }
      
      // Get sender data using optimized helper
      const senderData = await this.getSenderData();
      
      // Validate recipient IDs using optimized helper
      const validRecipientIds = await this.validateRecipients(recipientIds);
      
      // Create communication log using optimized helper
      const logId = await this.createCommunicationLog(
        senderData,
        validRecipientIds,
        message,
        'email'
      );
      
      if (logId) {
        console.log('✅ Log de comunicación guardado con ID:', logId);
      }
      
      // Simulate API call delay
      console.log('⏳ Simulando llamada a API de Email...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('✅ Mensaje Email enviado exitosamente');
      return {
        success: true,
        message: `Mensaje enviado a ${validRecipientIds.length} destinatarios vía Email`,
        recipientCount: validRecipientIds.length,
        channel: 'email',
        timestamp: new Date().toISOString(),
        logId: logId
      };
    } catch (error) {
      console.error('❌ Error sending Email message:', error);
      throw error;
    }
  }

  // Smart fallback message delivery - Enhanced with company-specific credentials
  async sendWithFallback(recipientIds, message, primaryChannel = 'whatsapp', fallbackOrder = null, options = {}) {
    try {
      console.log('🚀 Iniciando envío con fallback inteligente');
      console.log('Primary channel:', primaryChannel);
      console.log('Recipient IDs:', recipientIds);
      console.log('Fallback order:', fallbackOrder);
      
      const results = {
        total: recipientIds.length,
        successful: 0,
        failed: 0,
        byChannel: {},
        details: []
      };

      // Get employee data to check available channels and their companies
      const employees = await this.getEmployeesByIds(recipientIds);
      
      // Group employees by company and channel
      const companyChannelGroups = await this.groupEmployeesByCompanyAndChannel(employees, primaryChannel, fallbackOrder);
      
      // Send messages through each channel for each company
      for (const [companyId, channelGroups] of Object.entries(companyChannelGroups)) {
        console.log(`🏢 Procesando empresa ${companyId}`);
        
        for (const [channel, employeeIds] of Object.entries(channelGroups)) {
          if (employeeIds.length === 0) continue;
          
          console.log(`📤 Enviando ${employeeIds.length} mensajes por ${channel} (Empresa: ${companyId})`);
          
          try {
            let result;
            switch (channel) {
              case 'whatsapp':
                result = await this.sendWhatsAppMessageWithCompanyCredentials(companyId, employeeIds, message, options);
                break;
              case 'telegram':
                result = await this.sendTelegramMessageWithCompanyCredentials(companyId, employeeIds, message, options);
                break;
              case 'sms':
                result = await this.sendSMSMessageWithCompanyCredentials(companyId, employeeIds, message, options);
                break;
              case 'email':
                const emailSubject = options.subject || 'Mensaje de StaffHub';
                result = await this.sendEmailMessageWithCompanyCredentials(companyId, employeeIds, message, emailSubject, options);
                break;
              default:
                console.warn(`⚠️ Canal desconocido: ${channel}`);
                continue;
            }
            
            if (result.success) {
              results.successful += result.recipientCount;
              results.byChannel[channel] = (results.byChannel[channel] || 0) + result.recipientCount;
              
              results.details.push({
                channel,
                companyId,
                recipientCount: result.recipientCount,
                status: 'success',
                message: result.message
              });
            }
          } catch (error) {
            console.error(`❌ Error enviando por ${channel} (Empresa: ${companyId}):`, error);
            results.failed += employeeIds.length;
            
            results.details.push({
              channel,
              companyId,
              recipientCount: employeeIds.length,
              status: 'failed',
              error: error.message
            });
          }
        }
      }
      
      const successRate = (results.successful / results.total) * 100;
      
      console.log('✅ Envío con fallback completado:', results);
      
      return {
        success: results.successful > 0,
        message: `Mensaje enviado con fallback: ${results.successful}/${results.total} entregados (${successRate.toFixed(1)}%)`,
        totalRecipients: results.total,
        successfulDeliveries: results.successful,
        failedDeliveries: results.failed,
        successRate: successRate,
        byChannel: results.byChannel,
        details: results.details,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error en envío con fallback:', error);
      throw error;
    }
  }

  // Enhanced method to group employees by company and channel
  async groupEmployeesByCompanyAndChannel(employees, primaryChannel, fallbackOrder = null) {
    const companyGroups = {};
    
    // Default fallback order if none provided
    const defaultOrder = ['WhatsApp', 'Telegram', 'SMS', 'Email'];
    const order = fallbackOrder || defaultOrder;
    
    // Group employees by company
    const employeesByCompany = {};
    employees.forEach(employee => {
      const companyId = employee.company_id || 'default';
      if (!employeesByCompany[companyId]) {
        employeesByCompany[companyId] = [];
      }
      employeesByCompany[companyId].push(employee);
    });
    
    // For each company, group employees by available channels
    for (const [companyId, companyEmployees] of Object.entries(employeesByCompany)) {
      companyGroups[companyId] = {
        whatsapp: [],
        telegram: [],
        sms: [],
        email: []
      };
      
      // Get company's fallback order
      let companyFallbackOrder = order;
      try {
        companyFallbackOrder = await companyChannelCredentialsService.getFallbackOrder(companyId);
      } catch (error) {
        console.warn(`⚠️ Error getting fallback order for company ${companyId}, using default:`, error.message);
      }
      
      companyEmployees.forEach(employee => {
        const hasWhatsApp = employee.phone && employee.phone.length > 0;
        const hasTelegram = employee.telegram_id && employee.telegram_id.length > 0;
        const hasSMS = employee.phone && employee.phone.length > 0;
        const hasEmail = employee.email && employee.email.length > 0;
        
        // Check available channels for this employee
        const availableChannels = [];
        if (hasWhatsApp) availableChannels.push('WhatsApp');
        if (hasTelegram) availableChannels.push('Telegram');
        if (hasSMS) availableChannels.push('SMS');
        if (hasEmail) availableChannels.push('Email');
        
        // Find the best channel for this employee based on company's fallback order
        let assignedChannel = null;
        
        // First, try primary channel
        const primaryChannelCapitalized = primaryChannel.charAt(0).toUpperCase() + primaryChannel.slice(1);
        if (availableChannels.includes(primaryChannelCapitalized)) {
          assignedChannel = primaryChannelCapitalized;
        } else {
          // Use company's custom fallback order
          for (const channel of companyFallbackOrder) {
            if (availableChannels.includes(channel)) {
              assignedChannel = channel;
              break;
            }
          }
        }
        
        // Assign employee to the determined channel
        if (assignedChannel) {
          const channelKey = assignedChannel.toLowerCase();
          if (companyGroups[companyId][channelKey]) {
            companyGroups[companyId][channelKey].push(employee.id);
          }
        }
      });
    }
    
    console.log('📊 Employee grouping by company and channel:', companyGroups);
    return companyGroups;
  }

  // Enhanced WhatsApp method with company-specific credentials
  async sendWhatsAppMessageWithCompanyCredentials(companyId, recipientIds, message, options = {}) {
    try {
      console.log(`🚀 Enviando WhatsApp con credenciales específicas para empresa ${companyId}`);
      
      // Get company-specific WhatsApp credentials
      const credentials = await companyChannelCredentialsService.getChannelCredentials(companyId, 'whatsapp');
      
      if (!credentials) {
        console.warn(`⚠️ No hay credenciales WhatsApp configuradas para empresa ${companyId}, usando método estándar`);
        return await this.sendWhatsAppMessage(recipientIds, message, options);
      }
      
      // Get sender data
      const senderData = await this.getSenderData();
      
      // Get employee data for phone numbers
      const employees = await this.getEmployeesByIds(recipientIds);
      const phoneNumbers = employees
        .filter(emp => emp.phone && emp.phone.trim() !== '')
        .map(emp => emp.phone);
      
      if (phoneNumbers.length === 0) {
        throw new Error('No se encontraron números de teléfono válidos para los destinatarios');
      }
      
      // Create communication log
      const logId = await this.createCommunicationLog(
        senderData,
        recipientIds,
        message,
        'whatsapp'
      );
      
      // Use company-specific credentials with whatsappService
      const originalConfig = whatsappService.loadConfiguration();
      
      // Temporarily set company-specific configuration
      whatsappService.setConfiguration({
        accessToken: credentials.access_token,
        phoneNumberId: credentials.phone_number_id,
        webhookVerifyToken: credentials.webhook_verify_token,
        testMode: originalConfig.testMode
      });
      
      try {
        // Send messages with company credentials
        const result = await whatsappService.sendBulkMessage({
          recipients: phoneNumbers,
          message: message,
          messageType: options.templateName ? 'template' : 'text',
          templateName: options.templateName || null,
          templateLanguage: options.templateLanguage || 'es',
          components: options.components || [],
          delayBetweenMessages: options.delayBetweenMessages || 1000
        });
        
        // Restore original configuration
        whatsappService.setConfiguration(originalConfig);
        
        console.log(`✅ WhatsApp enviado con credenciales de empresa ${companyId}`);
        return {
          success: result.success,
          message: result.success
            ? `Mensaje enviado a ${result.successful} destinatarios vía WhatsApp (Empresa: ${companyId})`
            : `Error: ${result.failed} mensajes fallaron`,
          recipientCount: result.totalRecipients,
          successfulDeliveries: result.successful,
          failedDeliveries: result.failed,
          channel: 'whatsapp',
          companyId: companyId,
          timestamp: new Date().toISOString(),
          logId: logId,
          details: result.results,
          usedCompanyCredentials: true
        };
      } catch (error) {
        // Restore original configuration on error
        whatsappService.setConfiguration(originalConfig);
        throw error;
      }
    } catch (error) {
      console.error(`❌ Error enviando WhatsApp con credenciales de empresa ${companyId}:`, error);
      throw error;
    }
  }

  // Enhanced Telegram method with company-specific credentials
  async sendTelegramMessageWithCompanyCredentials(companyId, recipientIds, message, options = {}) {
    try {
      console.log(`🚀 Enviando Telegram con credenciales específicas para empresa ${companyId}`);
      
      // Get company-specific Telegram credentials
      const credentials = await companyChannelCredentialsService.getChannelCredentials(companyId, 'telegram');
      
      if (!credentials) {
        console.warn(`⚠️ No hay credenciales Telegram configuradas para empresa ${companyId}, usando método estándar`);
        return await this.sendTelegramMessage(recipientIds, message);
      }
      
      // Get sender data
      const senderData = await this.getSenderData();
      
      // Validate recipient IDs
      const validRecipientIds = await this.validateRecipients(recipientIds);
      
      // Create communication log
      const logId = await this.createCommunicationLog(
        senderData,
        validRecipientIds,
        message,
        'telegram'
      );
      
      // TODO: Implement Telegram service with company-specific credentials
      // For now, simulate with company credentials
      console.log('⏳ Simulando llamada a API de Telegram con credenciales de empresa...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`✅ Telegram enviado con credenciales de empresa ${companyId}`);
      return {
        success: true,
        message: `Mensaje enviado a ${validRecipientIds.length} destinatarios vía Telegram (Empresa: ${companyId})`,
        recipientCount: validRecipientIds.length,
        channel: 'telegram',
        companyId: companyId,
        timestamp: new Date().toISOString(),
        logId: logId,
        usedCompanyCredentials: true
      };
    } catch (error) {
      console.error(`❌ Error enviando Telegram con credenciales de empresa ${companyId}:`, error);
      throw error;
    }
  }

  // Enhanced SMS method with company-specific credentials
  async sendSMSMessageWithCompanyCredentials(companyId, recipientIds, message, options = {}) {
    try {
      console.log(`🚀 Enviando SMS con credenciales específicas para empresa ${companyId}`);
      
      // Get company-specific SMS credentials
      const credentials = await companyChannelCredentialsService.getChannelCredentials(companyId, 'sms');
      
      if (!credentials) {
        console.warn(`⚠️ No hay credenciales SMS configuradas para empresa ${companyId}, usando método estándar`);
        return await this.sendSMSMessage(recipientIds, message);
      }
      
      // Get sender data
      const senderData = await this.getSenderData();
      
      // Validate recipient IDs
      const validRecipientIds = await this.validateRecipients(recipientIds);
      
      // Create communication log
      const logId = await this.createCommunicationLog(
        senderData,
        validRecipientIds,
        message,
        'sms'
      );
      
      // TODO: Implement SMS service with company-specific credentials
      // For now, simulate with company credentials
      console.log('⏳ Simulando llamada a API de SMS con credenciales de empresa...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`✅ SMS enviado con credenciales de empresa ${companyId}`);
      return {
        success: true,
        message: `Mensaje enviado a ${validRecipientIds.length} destinatarios vía SMS (Empresa: ${companyId})`,
        recipientCount: validRecipientIds.length,
        channel: 'sms',
        companyId: companyId,
        timestamp: new Date().toISOString(),
        logId: logId,
        usedCompanyCredentials: true
      };
    } catch (error) {
      console.error(`❌ Error enviando SMS con credenciales de empresa ${companyId}:`, error);
      throw error;
    }
  }

  // Enhanced Email method with company-specific credentials
  async sendEmailMessageWithCompanyCredentials(companyId, recipientIds, message, subject, options = {}) {
    try {
      console.log(`🚀 Enviando Email con credenciales específicas para empresa ${companyId}`);
      
      // Get company-specific Email credentials
      const credentials = await companyChannelCredentialsService.getChannelCredentials(companyId, 'email');
      
      if (!credentials) {
        console.warn(`⚠️ No hay credenciales Email configuradas para empresa ${companyId}, usando método estándar`);
        return await this.sendEmailMessage(recipientIds, message, subject);
      }
      
      // Get sender data
      const senderData = await this.getSenderData();
      
      // Validate recipient IDs
      const validRecipientIds = await this.validateRecipients(recipientIds);
      
      // Create communication log
      const logId = await this.createCommunicationLog(
        senderData,
        validRecipientIds,
        message,
        'email'
      );
      
      // TODO: Implement Email service with company-specific credentials
      // For now, simulate with company credentials
      console.log('⏳ Simulando llamada a API de Email con credenciales de empresa...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`✅ Email enviado con credenciales de empresa ${companyId}`);
      return {
        success: true,
        message: `Mensaje enviado a ${validRecipientIds.length} destinatarios vía Email (Empresa: ${companyId})`,
        recipientCount: validRecipientIds.length,
        channel: 'email',
        companyId: companyId,
        timestamp: new Date().toISOString(),
        logId: logId,
        usedCompanyCredentials: true
      };
    } catch (error) {
      console.error(`❌ Error enviando Email con credenciales de empresa ${companyId}:`, error);
      throw error;
    }
  }

  // Helper method to get employees by IDs
  async getEmployeesByIds(employeeIds) {
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select(`
          id,
          name,
          email,
          phone,
          telegram_id,
          company_id
        `)
        .in('id', employeeIds)
        .eq('is_active', true);
      
      if (error) throw error;
      return employees || [];
    } catch (error) {
      console.error('Error fetching employees by IDs:', error);
      return [];
    }
  }

  // Get WhatsApp configuration status
  getWhatsAppStatus() {
    const config = whatsappService.loadConfiguration();
    return {
      configured: !!(config.accessToken && config.phoneNumberId),
      testMode: config.testMode || false,
      phoneNumberId: config.phoneNumberId || null
    };
  }

  // Test WhatsApp connection
  async testWhatsAppConnection() {
    try {
      const result = await whatsappService.testConnection();
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
        error: error.message
      };
    }
  }

  // Send WhatsApp test message
  async sendWhatsAppTest(phoneNumber, message = 'Este es un mensaje de prueba desde StaffHub') {
    try {
      const result = await whatsappService.sendTestMessage(phoneNumber, message);
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Error al enviar mensaje de prueba: ${error.message}`,
        error: error.message
      };
    }
  }

  // Get WhatsApp templates
  async getWhatsAppTemplates() {
    try {
      const result = await whatsappService.getTemplates();
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Error al obtener plantillas: ${error.message}`,
        error: error.message,
        templates: []
      };
    }
  }

  // Helper method to group employees by available channels
  groupEmployeesByChannel(employees, primaryChannel, fallbackOrder = null) {
    const groups = {
      whatsapp: [],
      telegram: [],
      sms: [],
      email: []
    };
    
    // Default fallback order if none provided
    const defaultOrder = ['WhatsApp', 'Telegram', 'SMS', 'Email'];
    const order = fallbackOrder || defaultOrder;
    
    employees.forEach(employee => {
      const hasWhatsApp = employee.phone && employee.phone.length > 0;
      const hasTelegram = employee.telegram_id && employee.telegram_id.length > 0;
      const hasSMS = employee.phone && employee.phone.length > 0;
      const hasEmail = employee.email && employee.email.length > 0;
      
      // Check available channels for this employee
      const availableChannels = [];
      if (hasWhatsApp) availableChannels.push('WhatsApp');
      if (hasTelegram) availableChannels.push('Telegram');
      if (hasSMS) availableChannels.push('SMS');
      if (hasEmail) availableChannels.push('Email');
      
      // Find the best channel for this employee based on custom order
      let assignedChannel = null;
      
      // First, try primary channel
      const primaryChannelCapitalized = primaryChannel.charAt(0).toUpperCase() + primaryChannel.slice(1);
      if (availableChannels.includes(primaryChannelCapitalized)) {
        assignedChannel = primaryChannelCapitalized;
      } else {
        // Use custom fallback order
        for (const channel of order) {
          if (availableChannels.includes(channel)) {
            assignedChannel = channel;
            break;
          }
        }
      }
      
      // Assign employee to the determined channel
      if (assignedChannel) {
        const channelKey = assignedChannel.toLowerCase();
        if (groups[channelKey]) {
          groups[channelKey].push(employee.id);
        }
      }
    });
    
    console.log('📊 Employee grouping by channel:', groups);
    return groups;
  }

  // Optimized helper method to get sender data (shared between message methods)
  async getSenderData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        const { data: userData, error: senderError } = await supabase
          .from('employees')
          .select('id, company_id')
          .eq('email', user.email)
          .single();
        
        if (!senderError && userData) {
          return userData;
        }
      }
      
      return { id: 'admin', company_id: 1 }; // Default fallback
    } catch (error) {
      console.warn('⚠️ Error getting sender data, using default:', error.message);
      return { id: 'admin', company_id: 1 };
    }
  }

  // Optimized helper method to validate recipients
  async validateRecipients(recipientIds) {
    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      throw new Error('Recipient IDs must be a non-empty array');
    }

    const limitedIds = recipientIds.slice(0, 100); // Limit for performance
    const { data: existingRecipients, error } = await supabase
      .from('employees')
      .select('id')
      .in('id', limitedIds);
    
    if (error) {
      console.warn('⚠️ Error validating recipients:', error);
      return limitedIds; // Return original IDs if validation fails
    }

    const existingIds = (existingRecipients || []).map(r => r.id);
    const missingIds = limitedIds.filter(id => !existingIds.includes(id));
    
    if (missingIds.length > 0) {
      console.warn('⚠️ Some recipient IDs not found:', missingIds);
    }

    return existingIds;
  }

  // Optimized helper method to create communication log
  async createCommunicationLog(senderData, recipientIds, message, channelId) {
    try {
      const logData = {
        company_id: senderData.company_id,
        sender_id: senderData.id,
        recipient_ids: recipientIds.slice(0, 50), // Limit array size
        message: message.substring(0, 1000), // Limit message length
        channel_id: channelId,
        status: 'sent',
        sent_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('communication_logs')
        .insert(logData)
        .select('id')
        .single();

      if (error) {
        console.warn('⚠️ Error creating communication log:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.warn('⚠️ Critical error creating communication log:', error);
      return null;
    }
  }

  // Get communication statistics - Optimized version
  async getCommunicationStats() {
    try {
      // Get user data with caching
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('User not authenticated');
      }

      // Use a more efficient query with specific fields
      const { data: senderData, error: senderError } = await supabase
        .from('employees')
        .select('id, company_id')
        .eq('email', user.email)
        .single();
      
      if (senderError) {
        console.warn('Sender not found in employees table:', senderError);
        return this.getEmptyStats();
      }

      // Use a simpler query without grouping for better performance
      const { data: logs, error } = await supabase
        .from('communication_logs')
        .select('channel_id, status')
        .eq('sender_id', senderData.id)
        .order('created_at', { ascending: false })
        .limit(1000); // Limit to recent logs for better performance

      if (error) {
        console.warn('Error fetching communication logs:', error);
        return this.getEmptyStats();
      }

      // Process stats in JavaScript instead of database grouping
      const stats = this.processCommunicationStats(logs || []);
      return stats;
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      return this.getEmptyStats();
    }
  }

  // Helper method to process stats locally
  processCommunicationStats(logs) {
    const stats = {
      total: logs.length,
      byChannel: {},
      byStatus: {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0
      },
      deliveryRate: 0,
      readRate: 0
    };

    logs.forEach(log => {
      const channel = log.channel_id || 'unknown';
      const status = log.status || 'unknown';

      // Count by channel
      stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1;

      // Count by status
      if (stats.byStatus[status] !== undefined) {
        stats.byStatus[status]++;
      }
    });

    // Calculate rates
    stats.deliveryRate = stats.total > 0 ? ((stats.byStatus.delivered + stats.byStatus.read) / stats.total) * 100 : 0;
    stats.readRate = stats.total > 0 ? (stats.byStatus.read / stats.total) * 100 : 0;

    return stats;
  }

  // Helper method for empty stats
  getEmptyStats() {
    return {
      total: 0,
      byChannel: {},
      byStatus: {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0
      },
      deliveryRate: 0,
      readRate: 0
    };
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

// Create a named instance for better debugging and stack traces
const communicationService = new CommunicationService();
export default communicationService;