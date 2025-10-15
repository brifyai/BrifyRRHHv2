import { supabase } from '../lib/supabase';

class DatabaseEmployeeService {
  // Obtener todos los empleados con filtros opcionales
  async getEmployees(filters = {}) {
    try {
      let query = supabase
        .from('employees')
        .select(`
          *,
          companies (
            id,
            name
          )
        `);

      // Aplicar filtros
      if (filters.companyId) {
        query = query.eq('company_id', filters.companyId);
      }

      if (filters.region) {
        query = query.ilike('region', `%${filters.region}%`);
      }

      if (filters.department) {
        query = query.ilike('department', `%${filters.department}%`);
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

      // Solo empleados activos por defecto
      query = query.eq('is_active', true);

      // Ordenar por nombre
      query = query.order('name');

      // Limitar resultados
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data: employees, error } = await query;

      if (error) {
        console.error('Error obteniendo empleados:', error);
        throw error;
      }

      // Formatear respuesta para mantener compatibilidad
      return employees.map(employee => ({
        ...employee,
        company: employee.companies || null
      }));

    } catch (error) {
      console.error('Error obteniendo empleados:', error);
      throw error;
    }
  }

  // Obtener todas las empresas
  async getCompanies() {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error obteniendo empresas:', error);
        throw error;
      }

      return companies;
    } catch (error) {
      console.error('Error obteniendo empresas:', error);
      throw error;
    }
  }

  // Obtener empleado por ID
  async getEmployeeById(id) {
    try {
      const { data: employee, error } = await supabase
        .from('employees')
        .select(`
          *,
          companies (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error obteniendo empleado:', error);
        throw error;
      }

      if (!employee) {
        throw new Error('Empleado no encontrado');
      }

      return {
        ...employee,
        company: employee.companies || null
      };
    } catch (error) {
      console.error('Error obteniendo empleado:', error);
      throw error;
    }
  }

  // Obtener conteo de empleados por empresa
  async getEmployeeCountByCompany(companyId) {
    try {
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (error) {
        console.error('Error obteniendo conteo de empleados:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error obteniendo conteo de empleados:', error);
      throw error;
    }
  }

  // Obtener estadísticas de mensajes por empresa
  async getMessageStatsByCompany(companyId) {
    try {
      const { data: stats, error } = await supabase
        .from('messages')
        .select('status')
        .eq('company_id', companyId);

      if (error) {
        console.error('Error obteniendo estadísticas de mensajes:', error);
        throw error;
      }

      // Contar por status
      const messageStats = {
        scheduled: 0,
        draft: 0,
        sent: 0,
        read: 0,
        total: stats.length
      };

      stats.forEach(message => {
        if (messageStats[message.status] !== undefined) {
          messageStats[message.status]++;
        }
      });

      return messageStats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de mensajes:', error);
      throw error;
    }
  }

  // Obtener próximo mensaje programado
  async getNextScheduledMessage(companyId) {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'scheduled')
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error obteniendo próximo mensaje programado:', error);
        throw error;
      }

      return message || null;
    } catch (error) {
      console.error('Error obteniendo próximo mensaje programado:', error);
      throw error;
    }
  }

  // Obtener estadísticas generales para el dashboard
  async getDashboardStats() {
    try {
      // Total empleados
      const { count: totalEmployees, error: employeesError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (employeesError) {
        console.error('Error obteniendo total empleados:', employeesError);
        throw employeesError;
      }

      // Total mensajes enviados
      const { count: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent');

      if (sentError) {
        console.error('Error obteniendo mensajes enviados:', sentError);
        throw sentError;
      }

      // Total mensajes leídos
      const { count: readMessages, error: readError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'read');

      if (readError) {
        console.error('Error obteniendo mensajes leídos:', readError);
        throw readError;
      }

      // Calcular tasa de lectura
      const readRate = sentMessages > 0 ? Math.round((readMessages / sentMessages) * 100) : 100;

      return {
        totalEmployees: totalEmployees || 0,
        sentMessages: sentMessages || 0,
        readRate: readRate
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error);
      throw error;
    }
  }
}

export default new DatabaseEmployeeService();