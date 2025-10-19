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
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      this.setCache(cacheKey, data);
      return data || [];
    } catch (error) {
      console.error('Error fetching companies:', error);
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

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching company by ID:', error);
      return null;
    }
  }

  async createCompany(companyData) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          ...companyData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      this.clearCache('companies');
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  async updateCompany(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      this.clearCache('companies');
      return data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  async deleteCompany(id) {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      this.clearCache('companies');
      return true;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS DE EMPLEADOS
  // ========================================

  async getEmployees(companyId = null) {
    const cacheKey = `employees_${companyId || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('employees')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            industry
          )
        `);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('last_name', { ascending: true });

      if (error) throw error;
      
      this.setCache(cacheKey, data);
      return data || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  async getEmployeeById(id) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            industry
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
      return null;
    }
  }

  async getEmployeeCountByCompany(companyId) {
    try {
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting employees:', error);
      return 0;
    }
  }

  // ========================================
  // MÉTODOS DE CARPETAS
  // ========================================

  async getFolders(employeeId = null) {
    const cacheKey = `folders_${employeeId || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('folders')
        .select(`
          *,
          employees:employee_id (
            id,
            first_name,
            last_name,
            employee_id
          )
        `);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      
      this.setCache(cacheKey, data);
      return data || [];
    } catch (error) {
      console.error('Error fetching folders:', error);
      return [];
    }
  }

  async getFolderCount() {
    try {
      const { count, error } = await supabase
        .from('folders')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting folders:', error);
      return 0;
    }
  }

  async createFolder(folderData) {
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([{
          ...folderData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      this.clearCache('folders');
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS DE DOCUMENTOS
  // ========================================

  async getDocuments(folderId = null) {
    try {
      let query = supabase
        .from('documents')
        .select(`
          *,
          folders:folder_id (
            id,
            name,
            employee_id
          ),
          employees:employee_id (
            id,
            first_name,
            last_name
          )
        `);

      if (folderId) {
        query = query.eq('folder_id', folderId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  async getDocumentCount() {
    try {
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting documents:', error);
      return 0;
    }
  }

  // ========================================
  // MÉTODOS DE COMUNICACIÓN
  // ========================================

  async getCommunicationLogs(companyId = null) {
    try {
      let query = supabase
        .from('communication_logs')
        .select(`
          *,
          companies:company_id (
            id,
            name
          ),
          employees:employee_id (
            id,
            first_name,
            last_name
          )
        `);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching communication logs:', error);
      return [];
    }
  }

  async getCommunicationStats(companyId = null) {
    try {
      let query = supabase
        .from('communication_logs')
        .select('status');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        sent: 0,
        scheduled: 0,
        draft: 0,
        failed: 0,
        total: data?.length || 0
      };

      data?.forEach(log => {
        if (stats[log.status] !== undefined) {
          stats[log.status]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      return { sent: 0, scheduled: 0, draft: 0, failed: 0, total: 0 };
    }
  }

  // ========================================
  // MÉTODOS DE ESTADÍSTICAS GENERALES
  // ========================================

  async getDashboardStats() {
    const cacheKey = 'dashboard_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔍 OrganizedDatabase: Cargando estadísticas del dashboard...');
      
      // Obtener conteos en paralelo con timeout individual
      const queries = [
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('folders').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase.from('communication_logs').select('*', { count: 'exact', head: true })
      ];

      // Agregar timeout a cada consulta usando configuración centralizada
      const queriesWithTimeout = queries.map(query =>
        Promise.race([
          query,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), TIMEOUT_CONFIG.DATABASE_QUERY)
          )
        ])
      );

      const [
        companiesResult,
        employeesResult,
        foldersResult,
        documentsResult,
        communicationResult
      ] = await Promise.allSettled(queriesWithTimeout);

      // Extraer resultados de manera segura
      const extractCount = (result) => {
        if (result.status === 'fulfilled' && result.value) {
          return result.value.count || 0;
        }
        console.warn('⚠️ Query fallida:', result.reason?.message || 'Error desconocido');
        return 0;
      };

      const totalCompanies = extractCount(companiesResult);
      const totalEmployees = extractCount(employeesResult);
      const totalFolders = extractCount(foldersResult);
      const totalDocuments = extractCount(documentsResult);
      const totalCommunications = extractCount(communicationResult);
      
      console.log('📊 Datos básicos cargados:', {
        companies: totalCompanies,
        employees: totalEmployees,
        folders: totalFolders,
        documents: totalDocuments,
        communications: totalCommunications
      });

      // Calcular métricas adicionales con manejo de errores
      let monthlyGrowth = 0;
      let successRate = 0;

      try {
        // Calcular crecimiento mensual (con timeout)
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const newEmployeesResult = await Promise.race([
          supabase.from('employees').select('*', { count: 'exact', head: true })
            .gte('created_at', oneMonthAgo.toISOString()),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Monthly growth query timeout')), TIMEOUT_CONFIG.DATABASE_QUERY)
          )
        ]);
        
        const newEmployeesThisMonth = newEmployeesResult?.count || 0;
        monthlyGrowth = totalEmployees > 0
          ? Math.round((newEmployeesThisMonth / totalEmployees) * 100)
          : 0;
      } catch (error) {
        console.warn('⚠️ Error calculando crecimiento mensual:', error.message);
        monthlyGrowth = 0;
      }

      try {
        // Calcular tasa de éxito (con timeout)
        const commStatsResult = await Promise.race([
          supabase.from('communication_logs')
            .select('status')
            .in('status', ['sent', 'read'])
            .limit(LIMITS_CONFIG.MAX_PAGE_SIZE), // Usar configuración centralizada
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Success rate query timeout')), TIMEOUT_CONFIG.DATABASE_QUERY)
          )
        ]);
        
        const successfulCommunications = commStatsResult?.data?.length || 0;
        successRate = totalCommunications > 0
          ? Math.round((successfulCommunications / totalCommunications) * 100)
          : 0;
      } catch (error) {
        console.warn('⚠️ Error calculando tasa de éxito:', error.message);
        successRate = 0;
      }

      // Calcular almacenamiento real (basado en documentos)
      const avgDocumentSize = 50 * 1024; // 50KB promedio por documento
      const storageUsed = totalDocuments * avgDocumentSize;

      const stats = {
        companies: totalCompanies,
        employees: totalEmployees,
        folders: totalFolders,
        documents: totalDocuments,
        communications: totalCommunications,
        tokensUsed: totalCommunications, // Usar comunicaciones como proxy de tokens
        storageUsed: storageUsed,
        monthlyGrowth: monthlyGrowth,
        successRate: successRate,
        activeUsers: totalEmployees // Usar empleados como usuarios activos
      };

      console.log('✅ Estadísticas del dashboard calculadas:', stats);
      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('❌ Error crítico en getDashboardStats:', error);
      
      // Retornar valores seguros en caso de error crítico
      const fallbackStats = {
        companies: 0,
        employees: 0,
        folders: 0,
        documents: 0,
        communications: 0,
        tokensUsed: 0,
        storageUsed: 0,
        monthlyGrowth: 0,
        successRate: 0,
        activeUsers: 0
      };
      
      // Cache por menos tiempo para reintentar pronto
      this.setCache(cacheKey, fallbackStats);
      return fallbackStats;
    }
  }

  // ========================================
  // MÉTODOS DE EMPRESAS CON ESTADÍSTICAS
  // ========================================

  async getCompaniesWithStats() {
    const cacheKey = 'companies_with_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔍 Obteniendo empresas con estadísticas detalladas...');
      
      // Obtener empresas
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (companiesError) throw companiesError;

      if (!companies || companies.length === 0) {
        console.log('⚠️ No se encontraron empresas en la base de datos');
        return [];
      }

      // Para cada empresa, obtener sus estadísticas
      const companiesWithStats = await Promise.all(
        companies.map(async (company) => {
          try {
            // Obtener conteo de empleados
            const { count: employeeCount } = await supabase
              .from('employees')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company.id);

            // Obtener estadísticas de comunicación
            const { data: commLogs, error: commError } = await supabase
              .from('communication_logs')
              .select('status, created_at')
              .eq('company_id', company.id);

            let sentMessages = 0;
            let readMessages = 0;
            let scheduledMessages = 0;
            let draftMessages = 0;
            let nextScheduledDate = null;

            if (!commError && commLogs) {
              sentMessages = commLogs.filter(log => log.status === 'sent').length;
              readMessages = commLogs.filter(log => log.status === 'read').length;
              scheduledMessages = commLogs.filter(log => log.status === 'scheduled').length;
              draftMessages = commLogs.filter(log => log.status === 'draft').length;
              
              // Encontrar la próxima fecha programada
              const scheduledLogs = commLogs
                .filter(log => log.status === 'scheduled' && log.created_at)
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
              
              if (scheduledLogs.length > 0) {
                nextScheduledDate = scheduledLogs[0].created_at;
              }
            }

            // Calcular sentimiento promedio (simulado por ahora)
            const sentimentScore = Math.random() * 2 - 1; // Entre -1 y 1

            return {
              ...company,
              employeeCount: employeeCount || 0,
              sentMessages,
              readMessages,
              scheduledMessages,
              draftMessages,
              nextScheduledDate,
              sentimentScore,
              engagementRate: sentMessages > 0 ? Math.round((readMessages / sentMessages) * 100) : 0
            };
          } catch (error) {
            console.error(`Error obteniendo estadísticas para empresa ${company.id}:`, error);
            return {
              ...company,
              employeeCount: 0,
              sentMessages: 0,
              readMessages: 0,
              scheduledMessages: 0,
              draftMessages: 0,
              nextScheduledDate: null,
              sentimentScore: 0,
              engagementRate: 0
            };
          }
        })
      );

      console.log(`✅ Se obtuvieron ${companiesWithStats.length} empresas con estadísticas`);
      
      this.setCache(cacheKey, companiesWithStats);
      return companiesWithStats;
    } catch (error) {
      console.error('❌ Error en getCompaniesWithStats:', error);
      return [];
    }
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

  // ========================================
  // MÉTODOS DE VERIFICACIÓN
  // ========================================

  async verifyDatabaseStructure() {
    const tables = ['companies', 'employees', 'folders', 'documents', 'users', 'communication_logs'];
    const results = {};

    for (const tableName of tables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        results[tableName] = {
          exists: !error,
          count: count || 0,
          error: error?.message
        };
      } catch (err) {
        results[tableName] = {
          exists: false,
          count: 0,
          error: err.message
        };
      }
    }

    return results;
  }
}

// Exportar instancia única
const organizedDatabaseService = new OrganizedDatabaseService();
export default organizedDatabaseService;