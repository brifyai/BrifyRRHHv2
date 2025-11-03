import { supabase } from '../lib/supabase';

class DatabaseEmployeeService {
  // Obtener todos los empleados con filtros opcionales
  async getEmployees(filters = {}) {
    try {
      let query = supabase
        .from('companies')
        .select('*');

      // Aplicar filtros
      if (filters.companyId) {
        query = query.eq('id', filters.companyId);
      }

      if (filters.region) {
        query = query.ilike('location', `%${filters.region}%`);
      }

      if (filters.department) {
        query = query.ilike('department', `%${filters.department}%`);
      }

      if (filters.position) {
        query = query.ilike('position', `%${filters.position}%`);
      }

      if (filters.role) {
        query = query.ilike('role', `%${filters.role}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Solo empleados activos por defecto
      query = query.eq('status', 'active');

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
        company: employee.name || null
      }));

    } catch (error) {
      console.error('Error obteniendo empleados:', error);
      throw error;
    }
  }

  // Obtener todas las empresas
  async getCompanies() {
    try {
      // Las empresas están definidas en el backend, obtener desde allí
      const companies = [
        'Achs', 'AFP Habitat', 'Antofagasta Minerals', 'Arcoprime', 'Ariztia',
        'CMPC', 'Colbun', 'Copec', 'Corporación Chilena - Alemana', 'Empresas SB',
        'Enaex', 'Grupo Saesa', 'Hogar Alemán', 'Inchcape', 'SQM', 'Vida Cámara'
      ];

      // Formatear para el selector
      const formattedCompanies = companies.map((companyName, index) => ({
        id: companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        name: companyName
      }));

      console.log('Empresas cargadas desde configuración:', formattedCompanies.length);
      return formattedCompanies;
    } catch (error) {
      console.error('Error obteniendo empresas:', error);
      // Fallback a lista simulada si hay error
      const fallbackCompanies = [
        { id: 'staffhub', name: 'StaffHub' },
        { id: 'microsoft', name: 'Microsoft' },
        { id: 'google', name: 'Google' },
        { id: 'amazon', name: 'Amazon' },
        { id: 'apple', name: 'Apple' },
        { id: 'meta', name: 'Meta' },
        { id: 'tesla', name: 'Tesla' },
        { id: 'netflix', name: 'Netflix' },
        { id: 'spotify', name: 'Spotify' },
        { id: 'adobe', name: 'Adobe' },
        { id: 'salesforce', name: 'Salesforce' },
        { id: 'oracle', name: 'Oracle' },
        { id: 'ibm', name: 'IBM' },
        { id: 'intel', name: 'Intel' },
        { id: 'nvidia', name: 'NVIDIA' },
        { id: 'startup-chile', name: 'Startup Chile' }
      ];
      return fallbackCompanies;
    }
  }

  // Obtener empleado por ID
  async getEmployeeById(id) {
    try {
      const { data: employee, error } = await supabase
        .from('companies')
        .select('*')
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
        company: employee.name || null
      };
    } catch (error) {
      console.error('Error obteniendo empleado:', error);
      throw error;
    }
  }

  // Obtener conteo de empleados por empresa
  async getEmployeeCountByCompany(companyId) {
    try {
      // Simular conteo de empleados por empresa
      const employeeCounts = {
        'staffhub': 45,
        'microsoft': 120,
        'google': 150,
        'amazon': 200,
        'apple': 80,
        'meta': 90,
        'tesla': 65,
        'netflix': 110,
        'spotify': 85,
        'adobe': 95,
        'salesforce': 88,
        'oracle': 70,
        'ibm': 75,
        'intel': 60,
        'nvidia': 55,
        'startup-chile': 35
      };

      return employeeCounts[companyId] || Math.floor(Math.random() * 100) + 20;
    } catch (error) {
      console.error('Error obteniendo conteo de empleados:', error);
      throw error;
    }
  }

  // Obtener estadísticas de mensajes por empresa
  async getMessageStatsByCompany(companyId) {
    try {
      // Generar estadísticas simuladas consistentes basadas en el companyId
      const companyStats = {
        'staffhub': { scheduled: 8, draft: 3, sent: 45, read: 38 },
        'microsoft': { scheduled: 12, draft: 5, sent: 120, read: 95 },
        'google': { scheduled: 15, draft: 7, sent: 150, read: 130 },
        'amazon': { scheduled: 10, draft: 4, sent: 200, read: 180 },
        'apple': { scheduled: 6, draft: 2, sent: 80, read: 75 },
        'meta': { scheduled: 9, draft: 3, sent: 90, read: 82 },
        'tesla': { scheduled: 7, draft: 2, sent: 65, read: 60 },
        'netflix': { scheduled: 11, draft: 4, sent: 110, read: 100 },
        'spotify': { scheduled: 8, draft: 3, sent: 85, read: 78 },
        'adobe': { scheduled: 10, draft: 4, sent: 95, read: 88 },
        'salesforce': { scheduled: 9, draft: 3, sent: 88, read: 80 },
        'oracle': { scheduled: 7, draft: 2, sent: 70, read: 65 },
        'ibm': { scheduled: 8, draft: 3, sent: 75, read: 70 },
        'intel': { scheduled: 6, draft: 2, sent: 60, read: 55 },
        'nvidia': { scheduled: 5, draft: 1, sent: 55, read: 52 },
        'startup-chile': { scheduled: 4, draft: 1, sent: 35, read: 32 }
      };

      const stats = companyStats[companyId] || {
        scheduled: Math.floor(Math.random() * 10) + 5,
        draft: Math.floor(Math.random() * 5) + 2,
        sent: Math.floor(Math.random() * 50) + 20,
        read: Math.floor(Math.random() * 40) + 15,
      };
      
      stats.total = stats.scheduled + stats.draft + stats.sent + stats.read;

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de mensajes:', error);
      throw error;
    }
  }

  // Obtener próximo mensaje programado
  async getNextScheduledMessage(companyId) {
    try {
      // Como no hay tabla de mensajes, retornamos null
      return null;
    } catch (error) {
      console.error('Error obteniendo próximo mensaje programado:', error);
      throw error;
    }
  }

  // Obtener estadísticas generales para el dashboard
  async getDashboardStats() {
    try {
      // Total empleados (empresas activas)
      const { count: totalEmployees, error: employeesError } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (employeesError) {
        console.error('Error obteniendo total empleados:', employeesError);
        throw employeesError;
      }

      // Generar estadísticas simuladas para mensajes
      const sentMessages = Math.floor(Math.random() * 200) + 100;
      const readMessages = Math.floor(sentMessages * 0.8);
      const readRate = Math.round((readMessages / sentMessages) * 100);

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