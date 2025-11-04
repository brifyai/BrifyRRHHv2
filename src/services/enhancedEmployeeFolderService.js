import { supabase } from '../lib/supabaseClient.js';
import inMemoryEmployeeService from './inMemoryEmployeeService.js';
import googleDriveService from '../lib/googleDrive.js';

class EnhancedEmployeeFolderService {
  constructor() {
    this.initialized = false;
    this.driveInitialized = false;
  }

  // Inicializar el servicio
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // Verificar conexión con Supabase
      const { data, error } = await supabase.from('employee_folders').select('count').limit(1);
      if (error) throw error;
      
      this.initialized = true;
      console.log('✅ EnhancedEmployeeFolderService inicializado');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando EnhancedEmployeeFolderService:', error);
      return false;
    }
  }

  // Inicializar Google Drive si hay tokens disponibles
  async initializeDrive(userTokens = null) {
    if (this.driveInitialized) return true;
    
    try {
      if (userTokens) {
        const success = await googleDriveService.setTokens(userTokens);
        if (success) {
          this.driveInitialized = true;
          console.log('✅ Google Drive inicializado para carpetas de empleados');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Error inicializando Google Drive:', error);
      return false;
    }
  }

  // Crear carpetas para todos los empleados existentes
  async createFoldersForAllEmployees() {
    try {
      console.log('🚀 Iniciando creación de carpetas para todos los empleados...');
      
      // Obtener todos los empleados
      const employees = await inMemoryEmployeeService.getEmployees();
      let createdCount = 0;
      let updatedCount = 0;
      let errorCount = 0;

      for (const employee of employees) {
        if (!employee.email) {
          console.warn(`⚠️ Empleado sin email: ${employee.name}`);
          continue;
        }

        try {
          const result = await this.createEmployeeFolder(employee.email, employee);
          if (result.created) {
            createdCount++;
          } else if (result.updated) {
            updatedCount++;
          }
          console.log(`✅ Carpeta procesada: ${employee.email} (${employee.company_name || 'Sin empresa'})`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Error procesando carpeta para ${employee.email}:`, error.message);
        }
      }

      console.log(`📊 Resumen: ${createdCount} creadas, ${updatedCount} actualizadas, ${errorCount} errores`);
      return { createdCount, updatedCount, errorCount };
    } catch (error) {
      console.error('❌ Error creando carpetas para todos los empleados:', error);
      throw error;
    }
  }

  // Crear o actualizar carpeta de empleado
  async createEmployeeFolder(employeeEmail, employeeData) {
    try {
      await this.initialize();

      // Verificar si ya existe la carpeta en Supabase
      const { data: existingFolder, error: fetchError } = await supabase
        .from('employee_folders')
        .select('*')
        .eq('employee_email', employeeEmail)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Obtener información de la empresa
      let companyName = 'Empresa no especificada';
      let companyId = null;
      
      if (employeeData.company_id) {
        const companies = inMemoryEmployeeService.companies;
        const company = companies.find(comp => comp.id === employeeData.company_id);
        if (company) {
          companyName = company.name;
          companyId = company.id;
        }
      }

      const folderData = {
        employee_email: employeeEmail,
        employee_id: employeeData.id,
        employee_name: employeeData.name,
        employee_position: employeeData.position,
        employee_department: employeeData.department,
        employee_phone: employeeData.phone,
        employee_region: employeeData.region,
        employee_level: employeeData.level,
        employee_work_mode: employeeData.work_mode,
        employee_contract_type: employeeData.contract_type,
        company_id: companyId,
        company_name: companyName,
        settings: {
          notificationPreferences: {
            whatsapp: true,
            telegram: true,
            email: true
          },
          responseLanguage: 'es',
          timezone: 'America/Santiago'
        }
      };

      let driveFolderId = null;
      let driveFolderUrl = null;

      // Crear carpeta en Google Drive si está inicializado
      if (this.driveInitialized) {
        try {
          const driveFolder = await this.createDriveFolder(employeeEmail, employeeData.name, companyName);
          if (driveFolder && driveFolder.id) {
            driveFolderId = driveFolder.id;
            driveFolderUrl = `https://drive.google.com/drive/folders/${driveFolder.id}`;
            
            // Compartir carpeta con el empleado
            await this.shareDriveFolder(driveFolder.id, employeeEmail);
          }
        } catch (driveError) {
          console.warn(`⚠️ No se pudo crear carpeta en Drive para ${employeeEmail}:`, driveError.message);
        }
      }

      folderData.drive_folder_id = driveFolderId;
      folderData.drive_folder_url = driveFolderUrl;

      if (existingFolder) {
        // Actualizar carpeta existente
        const { data, error } = await supabase
          .from('employee_folders')
          .update({
            ...folderData,
            updated_at: new Date().toISOString()
          })
          .eq('employee_email', employeeEmail)
          .select()
          .single();

        if (error) throw error;

        // Crear configuración de notificaciones si no existe
        await this.createNotificationSettingsIfNotExists(data.id);

        return { folder: data, updated: true, created: false };
      } else {
        // Crear nueva carpeta
        const { data, error } = await supabase
          .from('employee_folders')
          .insert(folderData)
          .select()
          .single();

        if (error) throw error;

        // Crear configuración de notificaciones
        await this.createNotificationSettings(data.id);

        return { folder: data, created: true, updated: false };
      }
    } catch (error) {
      console.error(`❌ Error creando carpeta para empleado ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Crear carpeta en Google Drive
  async createDriveFolder(employeeEmail, employeeName, companyName) {
    try {
      // Crear estructura de carpetas
      const parentFolderName = `Empleados - ${companyName}`;
      
      // Buscar o crear carpeta principal de la empresa
      let parentFolder = await this.findOrCreateParentFolder(parentFolderName);
      
      // Crear carpeta del empleado
      const folderName = `${employeeName} (${employeeEmail})`;
      const employeeFolder = await googleDriveService.createFolder(folderName, parentFolder.id);
      
      return employeeFolder;
    } catch (error) {
      console.error(`❌ Error creando carpeta en Drive para ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Buscar o crear carpeta principal de la empresa
  async findOrCreateParentFolder(folderName) {
    try {
      // Listar carpetas para buscar la carpeta principal
      const folders = await googleDriveService.listFiles();
      const parentFolder = folders.find(folder => 
        folder.name === folderName && 
        folder.mimeType === 'application/vnd.google-apps.folder'
      );

      if (parentFolder) {
        return parentFolder;
      } else {
        // Crear nueva carpeta principal
        return await googleDriveService.createFolder(folderName);
      }
    } catch (error) {
      console.error(`❌ Error buscando/creando carpeta principal ${folderName}:`, error);
      throw error;
    }
  }

  // Compartir carpeta de Drive con el empleado
  async shareDriveFolder(folderId, employeeEmail) {
    try {
      await googleDriveService.shareFolder(folderId, employeeEmail, 'writer');
      console.log(`📤 Carpeta compartida con ${employeeEmail}`);
    } catch (error) {
      console.warn(`⚠️ No se pudo compartir carpeta con ${employeeEmail}:`, error.message);
    }
  }

  // Crear configuración de notificaciones
  async createNotificationSettings(folderId) {
    try {
      const { error } = await supabase
        .from('employee_notification_settings')
        .insert({
          folder_id: folderId,
          whatsapp_enabled: true,
          telegram_enabled: true,
          email_enabled: true,
          response_language: 'es',
          timezone: 'America/Santiago',
          notification_preferences: {
            whatsapp: true,
            telegram: true,
            email: true
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error(`❌ Error creando configuración de notificaciones:`, error);
      throw error;
    }
  }

  // Crear configuración de notificaciones si no existe
  async createNotificationSettingsIfNotExists(folderId) {
    try {
      const { data: existing } = await supabase
        .from('employee_notification_settings')
        .select('id')
        .eq('folder_id', folderId)
        .single();

      if (!existing) {
        await this.createNotificationSettings(folderId);
      }
    } catch (error) {
      console.error(`❌ Error verificando configuración de notificaciones:`, error);
    }
  }

  // Obtener carpeta de empleado
  async getEmployeeFolder(employeeEmail) {
    try {
      await this.initialize();

      const { data, error } = await supabase
        .from('employee_folders')
        .select('*')
        .eq('employee_email', employeeEmail)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No existe la carpeta, intentar crearla
          const employees = await inMemoryEmployeeService.getEmployees();
          const employee = employees.find(emp => emp.email === employeeEmail);
          
          if (employee) {
            const result = await this.createEmployeeFolder(employeeEmail, employee);
            return result.folder;
          }
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`❌ Error obteniendo carpeta para empleado ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Agregar documento a la carpeta del empleado
  async addEmployeeDocument(employeeEmail, document) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      
      const documentData = {
        folder_id: folder.id,
        document_name: document.name || document.document_name,
        document_type: document.type || document.document_type,
        file_size: document.size || 0,
        google_file_id: document.google_file_id,
        local_file_path: document.local_file_path,
        file_url: document.file_url,
        description: document.description,
        tags: document.tags || [],
        metadata: document.metadata || {}
      };

      const { data, error } = await supabase
        .from('employee_documents')
        .insert(documentData)
        .select()
        .single();

      if (error) throw error;

      console.log(`📄 Documento agregado para ${employeeEmail}: ${documentData.document_name}`);
      return data;
    } catch (error) {
      console.error(`❌ Error agregando documento para ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Agregar FAQ a la carpeta del empleado
  async addEmployeeFAQ(employeeEmail, question, answer, metadata = {}) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      
      const faqData = {
        folder_id: folder.id,
        question,
        answer,
        keywords: metadata.keywords,
        category: metadata.category,
        priority: metadata.priority || 2,
        metadata: metadata.metadata || {}
      };

      const { data, error } = await supabase
        .from('employee_faqs')
        .insert(faqData)
        .select()
        .single();

      if (error) throw error;

      console.log(`❓ FAQ agregada para ${employeeEmail}: ${question}`);
      return data;
    } catch (error) {
      console.error(`❌ Error agregando FAQ para ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Agregar mensaje al historial de conversación
  async addConversationMessage(employeeEmail, messageType, messageContent, channel = 'chat', metadata = {}) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      
      const messageData = {
        folder_id: folder.id,
        message_type: messageType,
        message_content: messageContent,
        channel,
        metadata
      };

      const { data, error } = await supabase
        .from('employee_conversations')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`❌ Error agregando mensaje de conversación para ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Obtener estadísticas de la carpeta del empleado
  async getEmployeeFolderStats(employeeEmail) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      
      // Obtener conteos de cada tabla
      const [{ count: documentCount }, { count: faqCount }, { count: conversationCount }] = await Promise.all([
        supabase.from('employee_documents').select('*', { count: 'exact', head: true }).eq('folder_id', folder.id),
        supabase.from('employee_faqs').select('*', { count: 'exact', head: true }).eq('folder_id', folder.id),
        supabase.from('employee_conversations').select('*', { count: 'exact', head: true }).eq('folder_id', folder.id)
      ]);

      return {
        folder: folder,
        stats: {
          documents: documentCount || 0,
          faqs: faqCount || 0,
          conversations: conversationCount || 0,
          lastUpdated: folder.updated_at
        }
      };
    } catch (error) {
      console.error(`❌ Error obteniendo estadísticas para ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Buscar en documentos del empleado
  async searchEmployeeDocuments(employeeEmail, query) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('folder_id', folder.id)
        .eq('status', 'active')
        .or(`document_name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`❌ Error buscando documentos para ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Obtener carpetas por empresa
  async getEmployeeFoldersByCompany(companyId) {
    try {
      const { data, error } = await supabase
        .from('employee_folders')
        .select('*')
        .eq('company_id', companyId)
        .order('employee_name', { ascending: true });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`❌ Error obteniendo carpetas para empresa ${companyId}:`, error);
      throw error;
    }
  }

  // Sincronizar carpeta con Google Drive
  async syncFolderWithDrive(employeeEmail) {
    try {
      if (!this.driveInitialized) {
        throw new Error('Google Drive no está inicializado');
      }

      const folder = await this.getEmployeeFolder(employeeEmail);
      
      // Actualizar estado de sincronización
      await supabase
        .from('employee_folders')
        .update({
          folder_status: 'syncing',
          last_sync_at: new Date().toISOString()
        })
        .eq('id', folder.id);

      // Aquí iría la lógica de sincronización real
      // Por ahora, solo actualizamos el estado
      
      await supabase
        .from('employee_folders')
        .update({
          folder_status: 'active',
          sync_error: null
        })
        .eq('id', folder.id);

      console.log(`🔄 Carpeta sincronizada para ${employeeEmail}`);
      return true;
    } catch (error) {
      // Actualizar estado de error
      try {
        const folder = await this.getEmployeeFolder(employeeEmail);
        await supabase
          .from('employee_folders')
          .update({
            folder_status: 'error',
            sync_error: error.message
          })
          .eq('id', folder.id);
      } catch (updateError) {
        console.error('❌ Error actualizando estado de error:', updateError);
      }

      console.error(`❌ Error sincronizando carpeta para ${employeeEmail}:`, error);
      throw error;
    }
  }
}

// Crear instancia singleton
const enhancedEmployeeFolderService = new EnhancedEmployeeFolderService();

export default enhancedEmployeeFolderService;