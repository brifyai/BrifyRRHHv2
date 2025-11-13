// Servicio combinado para contar usuarios reales + empleados virtuales
// Cuenta users + companies (employee_type = 'virtual')

import { supabase } from '../lib/supabase.js';

export const getEmployeeCount = async () => {
  try {
    // Contar usuarios reales
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (userError) {
      console.error('Error contando usuarios:', userError);
      return 0;
    }
    
    // Contar empleados virtuales en companies
    const { count: companyCount, error: companyError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('employee_type', 'virtual');
    
    if (companyError) {
      console.error('Error contando empresas virtuales:', companyError);
      return userCount || 0;
    }
    
    // Total es la suma de ambos
    const totalEmployees = (userCount || 0) + (companyCount || 0);
    
    console.log(`Usuarios reales: ${userCount}, Empresas virtuales: ${companyCount}, Total: ${totalEmployees}`);
    
    return totalEmployees;
  } catch (error) {
    console.error('Error obteniendo conteo de empleados:', error);
    return 0;
  }
};

export const getEmployeeFolders = async (page = 1, limit = 50) => {
  try {
    const offset = (page - 1) * limit;
    
    // Obtener usuarios reales
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .range(offset, offset + Math.floor(limit/2) - 1);
    
    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError);
    }
    
    // Obtener empleados virtuales de companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('employee_type', 'virtual')
      .range(offset, offset + Math.floor(limit/2) - 1);
    
    if (companiesError) {
      console.error('Error obteniendo empresas virtuales:', companiesError);
    }
    
    // Combinar y transformar datos
    const allEmployees = [
      ...(users || []).map(user => ({
        id: user.id,
        name: user.full_name || user.name || 'Sin nombre',
        email: user.email,
        type: 'real',
        department: user.department || 'Sin departamento',
        position: user.position || 'Sin posición',
        phone: user.phone || 'Sin teléfono',
        status: user.status || 'active',
        created_at: user.created_at,
        is_active: user.is_active
      })),
      ...(companies || []).map(company => ({
        id: company.id,
        name: company.name,
        email: company.email || `${company.name.toLowerCase().replace(/\s+/g, '.')}@staffhub.com`,
        type: 'virtual',
        department: company.department || 'Sin departamento',
        position: company.position || 'Sin posición',
        phone: company.phone || 'Sin teléfono',
        status: company.status || 'active',
        created_at: company.created_at,
        is_active: company.status === 'active'
      }))
    ];
    
    return allEmployees;
  } catch (error) {
    console.error('Error obteniendo carpetas de empleados:', error);
    return [];
  }
};

export const getEmployeeById = async (id) => {
  try {
    // Primero intentar buscar en users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!userError && user) {
      return {
        ...user,
        type: 'real'
      };
    }
    
    // Si no se encuentra en users, buscar en companies
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .eq('employee_type', 'virtual')
      .single();
    
    if (!companyError && company) {
      return {
        ...company,
        type: 'virtual',
        email: company.email || `${company.name.toLowerCase().replace(/\s+/g, '.')}@staffhub.com`
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo empleado por ID:', error);
    return null;
  }
};

export const updateEmployee = async (id, updates) => {
  try {
    // Primero intentar actualizar en users
    const { data: user, error: userError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (!userError && user) {
      return { ...user, type: 'real' };
    }
    
    // Si no se encuentra en users, intentar en companies
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .eq('employee_type', 'virtual')
      .select()
      .single();
    
    if (!companyError && company) {
      return { ...company, type: 'virtual' };
    }
    
    throw new Error('Empleado no encontrado');
  } catch (error) {
    console.error('Error actualizando empleado:', error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    // Primero intentar eliminar de users
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (!userError) {
      return true;
    }
    
    // Si no se encuentra en users, intentar eliminar de companies
    const { error: companyError } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('employee_type', 'virtual');
    
    if (!companyError) {
      return true;
    }
    
    throw new Error('Empleado no encontrado');
  } catch (error) {
    console.error('Error eliminando empleado:', error);
    throw error;
  }
};

export const searchEmployees = async (query, page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;
    
    // Buscar en users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},department.ilike.${searchTerm},position.ilike.${searchTerm}`)
      .range(offset, offset + Math.floor(limit/2) - 1);
    
    // Buscar en companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('employee_type', 'virtual')
      .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},department.ilike.${searchTerm},position.ilike.${searchTerm}`)
      .range(offset, offset + Math.floor(limit/2) - 1);
    
    // Combinar resultados
    const allEmployees = [
      ...(users || []).map(user => ({
        ...user,
        type: 'real'
      })),
      ...(companies || []).map(company => ({
        ...company,
        type: 'virtual'
      }))
    ];
    
    return allEmployees;
  } catch (error) {
    console.error('Error buscando empleados:', error);
    return [];
  }
};

export default {
  getEmployeeCount,
  getEmployeeFolders,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  searchEmployees
};