import { supabase } from '../lib/supabaseClient.js';
import { CACHE_CONFIG, TIMEOUT_CONFIG, LIMITS_CONFIG, DEV_CONFIG } from '../config/constants.js';

/**
 * SERVICIO DE BASE DE DATOS ORGANIZADA
 * 
 * Este servicio proporciona una interfaz limpia y organizada
 * para interactuar con la base de datos reestructurada.
 * 
 * Estructura de tablas:
 * - users: Usuarios del sistema
 * - companies: Empresas reales (16 empresas)
 * - employees: Empleados (800 empleados distribuidos entre empresas)
 * - folders: Carpetas (una por cada empleado = 800 carpetas)
 * - documents: Documentos (relacionados con carpetas)
 * - communication_logs: Logs de comunicación
 */

class OrganizedDatabaseService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = CACHE_CONFIG.DASHBOARD_STATS_DURATION; // Usar configuración centralizada
    
    // Logging en desarrollo
    this.log = DEV_CONFIG.ENABLE_LOGGING ?
      (...args) => console.log('[OrganizedDatabaseService]', ...args) :
      () => {};
  }

  // ========================================
  // MÉTODOS DE EMPRESAS
  // ========================================

  async getCompanies() {
    const cacheKey = 'companies';
    
    // 🛡️ PRODUCTION FIX: Bypass cache in production to avoid stale data
    const useCache = process.env.NODE_ENV !== 'production';
    const cached = useCache ? this.getFromCache(cacheKey) : null;
    
    if (cached) {
      console.log('🔍 DEBUG: organizedDatabaseService.getCompanies() - Usando caché:', cached.length, 'empresas');
      return cached;
    }

    try {
      console.log('🔍 DEBUG: organizedDatabaseService.getCompanies() - Consultando BD (Production mode: ' + (process.env.NODE_ENV || 'development') + ')...');
      
      // ⚡ PERFORMANCE FIX: Optimize query for production
      const selectFields = process.env.NODE_ENV === 'production'
        ? 'id, name, industry, employee_count, created_at'
        : '*';

      const { data, error } = await supabase
        .from('companies')
        .select(selectFields)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo empresas:', error);
        throw error;
      }

      console.log('✅ DEBUG: organizedDatabaseService.getCompanies() - Empresas obtenidas:', data?.length || 0);
      
      // 🛡️ PRODUCTION FIX: Don't cache in production
      if (useCache) {
        this.setCache(cacheKey, data);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error en getCompanies():', error);
      return [];
    }
  }

  async getCompanyById(id) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error obteniendo empresa por ID:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error en getCompanyById():', error);
      return null;
    }
}

  /**
   * Obtiene empresas con estadísticas combinadas
   * Método requerido por DatabaseCompanySummary.js
   */
  /**
   * Obtiene empresas con estadísticas combinadas
   * Método requerido por DatabaseCompanySummary.js
   */
  async getCompaniesWithStats() {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.getCompaniesWithStats() - INICIO');
      
      // Obtener empresas básicas
      const companies = await this.getCompanies();
      console.log('🔍 DEBUG: getCompaniesWithStats() - Empresas obtenidas:', companies.length);
      
      if (companies.length === 0) {
        console.log('⚠️ DEBUG: getCompaniesWithStats() - No hay empresas, retornando array vacío');
        return [];
      }

      // Obtener empleados para calcular estadísticas
      const employees = await this.getEmployees();
      console.log('🔍 DEBUG: getCompaniesWithStats() - Empleados obtenidos:', employees.length);

      // Calcular estadísticas por empresa
      const companiesWithStats = companies.map(company => {
        const companyEmployees = employees.filter(emp => emp.company_id === company.id);
        
        // Calcular estadísticas básicas
        const employeeCount = companyEmployees.length;
        const sentMessages = Math.floor(Math.random() * 1000) + 100; // Placeholder
        const readMessages = Math.floor(sentMessages * 0.8); // 80% de lectura
        const sentimentScore = (Math.random() - 0.5) * 2; // Entre -1 y 1
        const engagementRate = Math.floor(Math.random() * 30) + 70; // Entre 70-100%
        
        return {
          ...company,
          employeeCount,
          sentMessages,
          readMessages,
          sentimentScore,
          engagementRate,
          scheduledMessages: Math.floor(Math.random() * 50),
          draftMessages: Math.floor(Math.random() * 20),
          nextScheduledDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        };
      });

      console.log('✅ DEBUG: getCompaniesWithStats() - Estadísticas calculadas para', companiesWithStats.length, 'empresas');
      return companiesWithStats;
      
    } catch (error) {
      console.error('❌ Error en getCompaniesWithStats():', error);
      throw error;
    }
  }

  async createCompany(companyData) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando empresa:', error);
        throw error;
      }

      // Limpiar caché de empresas
      this.clearCache('companies');
      
      return data;
    } catch (error) {
      console.error('❌ Error en createCompany():', error);
      throw error;
    }
  }

  async updateCompany(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando empresa:', error);
        throw error;
      }

      // Limpiar caché de empresas
      this.clearCache('companies');
      
      return data;
    } catch (error) {
      console.error('❌ Error en updateCompany():', error);
      throw error;
    }
  }

  async deleteCompany(id) {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando empresa:', error);
        throw error;
      }

      // Limpiar caché de empresas
      this.clearCache('companies');
      
      return true;
    } catch (error) {
      console.error('❌ Error en deleteCompany():', error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS DE EMPLEADOS
  // ========================================

  async getEmployees(companyId = null) {
    const cacheKey = `employees_${companyId || 'all'}`;
    
    // 🛡️ PRODUCTION FIX: Bypass cache in production
    const useCache = process.env.NODE_ENV !== 'production';
    const cached = useCache ? this.getFromCache(cacheKey) : null;
    
    if (cached) {
      console.log('🔍 DEBUG: organizedDatabaseService.getEmployees() - Usando caché:', cached.length, 'empleados');
      return cached;
    }

    try {
      console.log('🔍 DEBUG: organizedDatabaseService.getEmployees() - Consultando empleados...');
      
      let query = supabase
        .from('employees')
        .select('*');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo empleados:', error);
        throw error;
      }

      console.log('✅ DEBUG: organizedDatabaseService.getEmployees() - Empleados obtenidos:', data?.length || 0);
      
      // 🛡️ PRODUCTION FIX: Don't cache in production
      if (useCache) {
        this.setCache(cacheKey, data);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error en getEmployees():', error);
      return [];
    }
  }

  async getEmployeeById(id) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error obteniendo empleado por ID:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error en getEmployeeById():', error);
      return null;
    }
  }

  async createEmployee(employeeData) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando empleado:', error);
        throw error;
      }

      // Limpiar caché de empleados
      this.clearCache('employees');
      
      return data;
    } catch (error) {
      console.error('❌ Error en createEmployee():', error);
      throw error;
    }
  }

  async updateEmployee(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando empleado:', error);
        throw error;
      }

      // Limpiar caché de empleados
      this.clearCache('employees');
      
      return data;
    } catch (error) {
      console.error('❌ Error en updateEmployee():', error);
      throw error;
    }
  }

  async deleteEmployee(id) {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando empleado:', error);
        throw error;
      }

      // Limpiar caché de empleados
      this.clearCache('employees');
      
      return true;
    } catch (error) {
      console.error('❌ Error en deleteEmployee():', error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS DE DOCUMENTOS
  // ========================================

  async getDocuments(folderId = null) {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.getDocuments() - Consultando documentos...');
      
      let query = supabase
        .from('documents')
        .select('*');

      if (folderId) {
        query = query.eq('folder_id', folderId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo documentos:', error);
        throw error;
      }

      console.log('✅ DEBUG: organizedDatabaseService.getDocuments() - Documentos obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getDocuments():', error);
      return [];
    }
  }

  async getDocumentCount(folderId = null) {
    try {
      let query = supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      if (folderId) {
        query = query.eq('folder_id', folderId);
      }

      const { count, error } = await query;

      if (error) {
        console.error('❌ Error obteniendo conteo de documentos:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ Error en getDocumentCount():', error);
      return 0;
    }
  }

  // ========================================
  // MÉTODOS DE COMUNICACIÓN
  // ========================================

  async getCommunicationLogs(companyId = null) {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.getCommunicationLogs() - Consultando logs...');
      
      let query = supabase
        .from('communication_logs')
        .select(`
          *,
          companies (
            id,
            name
          )
        `);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      query = query.order('created_at', { ascending: false }).limit(1000);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error obteniendo logs de comunicación:', error);
        throw error;
      }

      console.log('✅ DEBUG: organizedDatabaseService.getCommunicationLogs() - Logs obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getCommunicationLogs():', error);
      return [];
    }
  }

  async getCommunicationStats(companyId = null) {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.getCommunicationStats() - Calculando estadísticas...');
      
      // 🛡️ FALLBACK: Usar solo columnas que sabemos que existen
      let query = supabase
        .from('communication_logs')
        .select('id, company_id, status, created_at');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error obteniendo estadísticas de comunicación:', error);
        // 🔄 FALLBACK: Retornar estadísticas vacías en lugar de fallar
        return {
          total: 0,
          byType: { sms: 0, email: 0, whatsapp: 0, telegram: 0 },
          byStatus: { draft: 0, sent: 0, delivered: 0, read: 0, failed: 0 },
          recent: []
        };
      }

      // Procesar estadísticas con datos disponibles
      const stats = {
        total: data?.length || 0,
        byType: {
          sms: data?.filter(item => item.message_type === 'sms').length || 0,
          email: data?.filter(item => item.message_type === 'email').length || 0,
          whatsapp: data?.filter(item => item.message_type === 'whatsapp').length || 0,
          telegram: data?.filter(item => item.message_type === 'telegram').length || 0
        },
        byStatus: {
          draft: data?.filter(item => item.status === 'draft').length || 0,
          sent: data?.filter(item => item.status === 'sent').length || 0,
          delivered: data?.filter(item => item.status === 'delivered').length || 0,
          read: data?.filter(item => item.status === 'read').length || 0,
          failed: data?.filter(item => item.status === 'failed').length || 0
        },
        recent: data?.slice(0, 10) || []
      };

      console.log('✅ DEBUG: organizedDatabaseService.getCommunicationStats() - Estadísticas calculadas');
      return stats;
    } catch (error) {
      console.error('❌ Error en getCommunicationStats():', error);
      return { total: 0, byType: {}, byStatus: {}, recent: [] };
    }
  }

  // ========================================
  // MÉTODOS DE ESTADÍSTICAS DASHBOARD
  // ========================================

  async getDashboardStats() {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.getDashboardStats() - Calculando estadísticas del dashboard...');
      
      // Ejecutar consultas en paralelo para mejor rendimiento
      const [
        companiesResult,
        employeesResult,
        documentsResult,
        communicationStats
      ] = await Promise.all([
        this.getCompanies(),
        this.getEmployees(),
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        this.getCommunicationStats()
      ]);

      const companies = companiesResult || [];
      const employees = employeesResult || [];
      const documentCount = documentsResult.count || 0;
      const commStats = communicationStats || { total: 0, byType: {}, byStatus: {}, recent: [] };

      // Calcular estadísticas adicionales
      const stats = {
        companies: {
          total: companies.length,
          active: companies.filter(c => c.status === 'active').length,
          inactive: companies.filter(c => c.status === 'inactive').length
        },
        employees: {
          total: employees.length,
          byCompany: this.groupEmployeesByCompany(employees)
        },
        documents: {
          total: documentCount
        },
        communication: commStats,
        lastUpdated: new Date().toISOString()
      };

      console.log('✅ DEBUG: organizedDatabaseService.getDashboardStats() - Estadísticas calculadas');
      return stats;
    } catch (error) {
      console.error('❌ Error en getDashboardStats():', error);
      throw error;
    }
  }

  groupEmployeesByCompany(employees) {
    const grouped = {};
    employees.forEach(employee => {
      const companyId = employee.company_id;
      if (!grouped[companyId]) {
        grouped[companyId] = 0;
      }
      grouped[companyId]++;
    });
    return grouped;
  }

  // ========================================
  // MÉTODOS DE USUARIOS
  // ========================================

  async getUsers() {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.getUsers() - Consultando usuarios...');
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles (
            id,
            name,
            permissions
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo usuarios:', error);
        throw error;
      }

      console.log('✅ DEBUG: organizedDatabaseService.getUsers() - Usuarios obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getUsers():', error);
      return [];
    }
  }

  async getRoles() {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.getRoles() - Consultando roles...');
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo roles:', error);
        throw error;
      }

      console.log('✅ DEBUG: organizedDatabaseService.getRoles() - Roles obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getRoles():', error);
      return [];
    }
  }

  async createUser(userData) {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.createUser() - Creando usuario:', userData.email);
      
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando usuario:', error);
        throw error;
      }

      console.log('✅ DEBUG: organizedDatabaseService.createUser() - Usuario creado:', data.id);
      
      // Limpiar caché de usuarios
      this.clearCache('users');
      
      return data;
    } catch (error) {
      console.error('❌ Error en createUser():', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.updateUser() - Actualizando usuario:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando usuario:', error);
        throw error;
      }

      console.log('✅ DEBUG: organizedDatabaseService.updateUser() - Usuario actualizado:', userId);
      
      // Limpiar caché de usuarios
      this.clearCache('users');
      
      return data;
    } catch (error) {
      console.error('❌ Error en updateUser():', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.deleteUser() - Eliminando usuario:', userId);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ Error eliminando usuario:', error);
        throw error;
      }

      console.log('✅ DEBUG: organizedDatabaseService.deleteUser() - Usuario eliminado:', userId);
      
      // Limpiar caché de usuarios
      this.clearCache('users');
      
      return true;
    } catch (error) {
      console.error('❌ Error en deleteUser():', error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS DE CACHÉ
  // ========================================

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
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

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  async healthCheck() {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.healthCheck() - Verificando salud...');
      
      // Verificar conexión básica
      const { data, error } = await supabase
        .from('companies')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Error en healthCheck:', error);
        return { healthy: false, error: error.message };
      }

      console.log('✅ DEBUG: organizedDatabaseService.healthCheck() - Servicio saludable');
      return { 
        healthy: true, 
        timestamp: new Date().toISOString(),
        cacheSize: this.cache.size
      };
    } catch (error) {
      console.error('❌ Error en healthCheck():', error);
      return { healthy: false, error: error.message };
    }
  }

  // ========================================
  // MÉTODOS DE BÚSQUEDA Y FILTRADO
  // ========================================

  async searchCompanies(query, filters = {}) {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.searchCompanies() - Buscando:', query);
      
      let supabaseQuery = supabase
        .from('companies')
        .select('*');

      // Aplicar búsqueda de texto
      if (query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,industry.ilike.%${query}%`);
      }

      // Aplicar filtros
      if (filters.status) {
        supabaseQuery = supabaseQuery.eq('status', filters.status);
      }

      if (filters.industry) {
        supabaseQuery = supabaseQuery.eq('industry', filters.industry);
      }

      const { data, error } = await supabaseQuery.order('name', { ascending: true });

      if (error) {
        console.error('❌ Error buscando empresas:', error);
        throw error;
      }

      console.log('✅ DEBUG: organizedDatabaseService.searchCompanies() - Resultados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en searchCompanies():', error);
      return [];
    }
  }

  async searchEmployees(query, companyId = null) {
    try {
      console.log('🔍 DEBUG: organizedDatabaseService.searchEmployees() - Buscando:', query);
      
      let supabaseQuery = supabase
        .from('employees')
        .select('*');

      // Aplicar búsqueda de texto
      if (query) {
        supabaseQuery = supabaseQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);
      }

      // Filtrar por empresa si se especifica
      if (companyId) {
        supabaseQuery = supabaseQuery.eq('company_id', companyId);
      }

      const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error buscando empleados:', error);
        throw error;
      }

      console.log('✅ DEBUG: organizedDatabaseService.searchEmployees() - Resultados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en searchEmployees():', error);
      return [];
    }
  }
}

// Exportar instancia única del servicio
const organizedDatabaseService = new OrganizedDatabaseService();
export default organizedDatabaseService;