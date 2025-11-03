// Adaptador de Base de Datos - Exclusivamente Supabase
// Conectado únicamente a la nueva base de datos StaffHub

import { supabase } from './supabase.js';

class DatabaseAdapter {
  constructor() {
    this.mode = 'supabase'; // Forzado a Supabase únicamente
    this.isInitialized = false;
  }

  // Inicializar la base de datos (solo Supabase)
  async init() {
    if (this.isInitialized) return;

    this.isInitialized = true;
    console.log('Base de datos inicializada en modo: Supabase (StaffHub)');
  }

  // Operaciones CRUD unificadas

  // EMPRESAS (Companies)
  async getCompanies(options = {}) {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo empresas de Supabase:', error);
      return [];
    }
  }

  async createCompany(companyData) {
    await this.init();

    const { data, error } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // EMPLEADOS (Employees)
  async getEmployees(options = {}) {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo empleados de Supabase:', error);
      return [];
    }
  }

  async getEmployeeCountByCompany(companyId) {
    await this.init();

    try {
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error obteniendo conteo de empleados:', error);
      return 0;
    }
  }

  async createEmployee(employeeData) {
    await this.init();

    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // USUARIOS (Users)
  async getUsers(options = {}) {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo usuarios de Supabase:', error);
      return [];
    }
  }

  async createUser(userData) {
    await this.init();

    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // CREDENCIALES DE USUARIO (User Credentials)
  async getUserCredentials(userId) {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('user_credentials')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data || null;
    } catch (error) {
      console.error('Error obteniendo credenciales:', error);
      return null;
    }
  }

  async updateUserCredentials(userId, credentialsData) {
    await this.init();

    const { data, error } = await supabase
      .from('user_credentials')
      .upsert({ ...credentialsData, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // USO DE TOKENS (Token Usage)
  async getTokenUsage(userId) {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('user_tokens_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error obteniendo uso de tokens:', error);
      return null;
    }
  }

  async updateTokenUsage(userId, usageData) {
    await this.init();

    const { data, error } = await supabase
      .from('user_tokens_usage')
      .upsert({ ...usageData, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // CARPETAS DE EMPLEADOS (Employee Folders)
  async getEmployeeFolder(employeeEmail) {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('carpetas_usuario')
        .select('*')
        .eq('administrador', employeeEmail)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error obteniendo carpeta de empleado:', error);
      return null;
    }
  }

  async createEmployeeFolder(folderData) {
    await this.init();

    const { data, error } = await supabase
      .from('carpetas_usuario')
      .insert(folderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // DOCUMENTOS DE ENTRENADOR (Training Documents)
  async getTrainingDocuments(trainerEmail) {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('documentos_entrenador')
        .select('*')
        .eq('entrenador', trainerEmail);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo documentos de entrenador:', error);
      return [];
    }
  }

  // PLANES (Plans)
  async getPlans() {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo planes:', error);
      return [];
    }
  }

  // EXTENSIONES DE PLANES (Plan Extensions)
  async getUserExtensions(userId) {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('plan_extensiones')
        .select(`
          *,
          extensiones (
            id,
            name,
            name_es,
            description,
            description_es,
            price
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo extensiones de usuario:', error);
      return [];
    }
  }

  // CALENDARIO GOOGLE (Google Calendar)
  async getGoogleCalendarSubscriptions(userId) {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('google_calendar_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo suscripciones de Google Calendar:', error);
      return [];
    }
  }

  async createGoogleCalendarEvent(eventData) {
    await this.init();

    const { data, error } = await supabase
      .from('google_calendar_events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // MICROSOFT 365 (Microsoft 365)
  async getMicrosoft365Subscriptions(userId) {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('microsoft365_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo suscripciones de Microsoft 365:', error);
      return [];
    }
  }

  async createMicrosoft365Notification(notificationData) {
    await this.init();

    const { data, error } = await supabase
      .from('microsoft365_notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // LOGS DE COMUNICACIÓN (Communication Logs)
  async createCommunicationLog(logData) {
    await this.init();

    // Los logs de comunicación se almacenan en Supabase
    const { data, error } = await supabase
      .from('communication_logs')
      .insert(logData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCommunicationLogs(options = {}) {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo logs de comunicación:', error);
      return [];
    }
  }

  // PLANTILLAS DE MENSAJES (Message Templates)
  async getMessageTemplates() {
    await this.init();

    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo plantillas de mensajes:', error);
      return [];
    }
  }

  async createMessageTemplate(templateData) {
    await this.init();

    const { data, error } = await supabase
      .from('message_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Utilidades

  // Obtener estadísticas
  async getStats() {
    // Para Supabase, devolver info básica
    return {
      provider: 'Supabase (StaffHub)',
      stores: [
        { name: 'companies', count: 'Conectado' },
        { name: 'employees', count: 'Conectado' },
        { name: 'users', count: 'Conectado' }
      ]
    };
  }

  // Exportar datos
  async exportData() {
    console.warn('Exportación desde Supabase no implementada aún');
    return { data: {} };
  }

  // Importar datos
  async importData(data) {
    console.warn('Importación a Supabase no implementada aún');
  }

  // Limpiar datos
  async clearData() {
    console.warn('Limpieza de Supabase no implementada (demasiado peligroso)');
  }
}

// Crear instancia singleton
const databaseAdapter = new DatabaseAdapter();

export default databaseAdapter;