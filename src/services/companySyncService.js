import { supabase } from '../lib/supabase.js';

class CompanySyncService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // Obtener todas las empresas
  async getCompanies() {
    try {
      const cacheKey = 'companies_all';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      this.setCache(cacheKey, data);
      return data || [];
    } catch (error) {
      console.error('Error getting companies:', error);
      throw error;
    }
  }

  // Obtener empresa por ID
  async getCompanyById(id) {
    try {
      const cacheKey = 'company_' + id;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting company by ID:', error);
      throw error;
    }
  }

  // Crear nueva empresa
  async createCompany(companyData) {
    try {
      const validation = this.validateCompanyData(companyData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const { data, error } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidar caché
      this.invalidateCache('companies_all');
      
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  // Actualizar empresa
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

      // Invalidar cachés relevantes
      this.invalidateCache('companies_all');
      this.invalidateCache('company_' + id);

      return data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  // Eliminar empresa
  async deleteCompany(id) {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalidar cachés relevantes
      this.invalidateCache('companies_all');
      this.invalidateCache('company_' + id);

      return true;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  // Cambiar estado de empresa (activa/inactiva)
  async toggleCompanyStatus(id) {
    try {
      // Primero obtener el estado actual
      const company = await this.getCompanyById(id);
      if (!company) {
        throw new Error('Company not found');
      }

      const newStatus = company.status === 'active' ? 'inactive' : 'active';
      
      const { data, error } = await supabase
        .from('companies')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Invalidar cachés
      this.invalidateCache('companies_all');
      this.invalidateCache('company_' + id);

      return data;
    } catch (error) {
      console.error('Error toggling company status:', error);
      throw error;
    }
  }

  // Obtener empleados (opcionalmente filtrados por empresa)
  async getEmployees(companyId = null) {
    try {
      const cacheKey = companyId ? 'employees_company_' + companyId : 'employees_all';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      let query = supabase
        .from('employees')
        .select('*')
        .eq('is_active', true);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;

      this.setCache(cacheKey, data || []);
      return data || [];
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  }

  // Crear nuevo empleado
  async createEmployee(employeeData) {
    try {
      const validation = this.validateEmployeeData(employeeData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const { data, error } = await supabase
        .from('employees')
        .insert({
          ...employeeData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidar caché de empleados
      this.invalidateCache('employees_all');
      if (employeeData.company_id) {
        this.invalidateCache('employees_company_' + employeeData.company_id);
      }

      return data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  // Actualizar empleado
  async updateEmployee(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Invalidar cachés de empleados
      this.invalidateCache('employees_all');
      
      // Si tenemos el company_id, invalidar caché específica
      if (data && data.company_id) {
        this.invalidateCache('employees_company_' + data.company_id);
      }

      return data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  // Eliminar empleado (marcar como inactivo)
  async deleteEmployee(id) {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Invalidar cachés de empleados
      this.invalidateCache('employees_all');

      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  // Obtener estadísticas de una empresa
  async getCompanyStats(companyId) {
    try {
      const cacheKey = 'company_stats_' + companyId;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Obtener número de empleados
      const { count: employeeCount, error: employeeError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (employeeError) throw employeeError;

      // Obtener número de comunicaciones recientes
      const { count: communicationCount, error: commError } = await supabase
        .from('communication_logs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 30 días

      if (commError) throw commError;

      const stats = {
        employeeCount: employeeCount || 0,
        communicationCount: communicationCount || 0,
        lastUpdated: new Date().toISOString()
      };

      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error getting company stats:', error);
      throw error;
    }
  }

  // Sincronizar datos de una empresa
  async syncCompanyData(companyId) {
    try {
      // Invalidar todas las cachés relacionadas con la empresa
      this.invalidateCache('company_' + companyId);
      this.invalidateCache('employees_company_' + companyId);
      this.invalidateCache('company_stats_' + companyId);
      this.invalidateCache('companies_all');

      // Forzar recarga de datos
      const [company, employees, stats] = await Promise.all([
        this.getCompanyById(companyId),
        this.getEmployees(companyId),
        this.getCompanyStats(companyId)
      ]);

      return {
        company,
        employees,
        stats,
        syncedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error syncing company data:', error);
      throw error;
    }
  }

  // Validar datos de empresa
  validateCompanyData(companyData) {
    if (!companyData.name || typeof companyData.name !== 'string' || companyData.name.trim().length === 0) {
      return {
        isValid: false,
        error: 'El nombre de la empresa es obligatorio y debe ser una cadena de texto válida'
      };
    }

    if (companyData.name.length > 100) {
      return {
        isValid: false,
        error: 'El nombre de la empresa no puede exceder los 100 caracteres'
      };
    }

    if (companyData.description && companyData.description.length > 500) {
      return {
        isValid: false,
        error: 'La descripción no puede exceder los 500 caracteres'
      };
    }

    if (companyData.status && !['active', 'inactive'].includes(companyData.status)) {
      return {
        isValid: false,
        error: 'El estado debe ser "active" o "inactive"'
      };
    }

    return { isValid: true };
  }

  // Validar datos de empleado
  validateEmployeeData(employeeData) {
    if (!employeeData.name || typeof employeeData.name !== 'string' || employeeData.name.trim().length === 0) {
      return {
        isValid: false,
        error: 'El nombre del empleado es obligatorio y debe ser una cadena de texto válida'
      };
    }

    if (employeeData.name.length > 100) {
      return {
        isValid: false,
        error: 'El nombre del empleado no puede exceder los 100 caracteres'
      };
    }

    if (!employeeData.email || typeof employeeData.email !== 'string' || employeeData.email.trim().length === 0) {
      return {
        isValid: false,
        error: 'El email del empleado es obligatorio y debe ser una cadena de texto válida'
      };
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeData.email)) {
      return {
        isValid: false,
        error: 'El email del empleado no tiene un formato válido'
      };
    }

    if (!employeeData.company_id) {
      return {
        isValid: false,
        error: 'El ID de la empresa es obligatorio'
      };
    }

    return { isValid: true };
  }

  // Métodos de caché
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

  invalidateCache(key) {
    this.cache.delete(key);
  }

  clearCache() {
    this.cache.clear();
  }
}

// Crear y exportar una instancia única
const companySyncService = new CompanySyncService();
export default companySyncService;
