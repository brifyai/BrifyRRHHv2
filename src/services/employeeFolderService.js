import inMemoryEmployeeService from './inMemoryEmployeeService.js';

class EmployeeFolderService {
  // Simulamos un sistema de archivos en memoria
  employeeFolders = new Map();

  constructor() {
    // Inicializar las carpetas de empleados
    this.initializeEmployeeFolders();
  }

  // Inicializar carpetas para todos los empleados
  async initializeEmployeeFolders() {
    try {
      console.log('Inicializando carpetas de empleados...');
      const employees = await inMemoryEmployeeService.getEmployees();
      
      employees.forEach(employee => {
        if (employee.email) {
          // Crear una carpeta para cada empleado usando su email como identificador
          this.createEmployeeFolder(employee.email, employee);
        }
      });
      
      console.log(`Inicialización completada - ${this.employeeFolders.size} carpetas de empleados creadas`);
    } catch (error) {
      console.error('Error inicializando carpetas de empleados:', error);
    }
  }

  // Crear una carpeta para un empleado
  createEmployeeFolder(employeeEmail, employeeData) {
    try {
      // Verificar si ya existe una carpeta para este empleado
      if (this.employeeFolders.has(employeeEmail)) {
        return this.employeeFolders.get(employeeEmail);
      }
      
      // Obtener el nombre de la empresa desde los datos del empleado
      let companyName = 'Empresa no especificada';
      if (employeeData.company_id) {
        // Buscar la empresa en el servicio de empresas
        const companies = inMemoryEmployeeService.companies;
        const company = companies.find(comp => comp.id === employeeData.company_id);
        if (company) {
          companyName = company.name;
        }
      }
      
      // Creamos una estructura de carpeta por empleado
      const folderStructure = {
        email: employeeEmail,
        employeeId: employeeData.id,
        employeeName: employeeData.name,
        employeePosition: employeeData.position,
        employeeDepartment: employeeData.department,
        employeePhone: employeeData.phone,
        employeeRegion: employeeData.region,
        employeeLevel: employeeData.level,
        employeeWorkMode: employeeData.work_mode,
        employeeContractType: employeeData.contract_type,
        companyName: companyName,
        companyId: employeeData.company_id,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        knowledgeBase: {
          // Base de conocimiento específica para este empleado
          faqs: [],
          documents: [],
          policies: [],
          procedures: []
        },
        conversationHistory: [],
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
      
      this.employeeFolders.set(employeeEmail, folderStructure);
      // console.log(`Carpeta creada para empleado: ${employeeEmail} (${companyName})`);
      return folderStructure;
    } catch (error) {
      console.error(`Error creando carpeta para empleado ${employeeEmail}:`, error);
      return null;
    }
  }

  // Obtener la carpeta de un empleado
  async getEmployeeFolder(employeeEmail) {
    try {
      let folder = this.employeeFolders.get(employeeEmail);
      
      // Si no existe la carpeta, crear una nueva basada en los datos del empleado
      if (!folder) {
        const employees = await inMemoryEmployeeService.getEmployees();
        const employee = employees.find(emp => emp.email === employeeEmail);
        
        if (employee) {
          folder = this.createEmployeeFolder(employeeEmail, employee);
          return folder;
        }
        
        throw new Error(`Empleado con email ${employeeEmail} no encontrado`);
      }
      
      // Actualizar datos del empleado si es necesario
      const employees = await inMemoryEmployeeService.getEmployees();
      const employee = employees.find(emp => emp.email === employeeEmail);
      
      if (employee) {
        folder.employeeName = employee.name;
        folder.employeePosition = employee.position;
        folder.employeeDepartment = employee.department;
        folder.employeePhone = employee.phone;
        folder.employeeRegion = employee.region;
        folder.employeeLevel = employee.level;
        folder.employeeWorkMode = employee.work_mode;
        folder.employeeContractType = employee.contract_type;
        folder.employeeId = employee.id;
        folder.companyId = employee.company_id;
        
        // Actualizar el nombre de la empresa
        if (employee.company_id) {
          const companies = inMemoryEmployeeService.companies;
          const company = companies.find(comp => comp.id === employee.company_id);
          if (company) {
            folder.companyName = company.name;
          } else {
            folder.companyName = 'Empresa no especificada';
          }
        } else {
          folder.companyName = 'Empresa no especificada';
        }
        
        folder.lastUpdated = new Date().toISOString();
        this.employeeFolders.set(employeeEmail, folder);
      }
      
      return folder;
    } catch (error) {
      console.error(`Error obteniendo carpeta para empleado ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Actualizar la base de conocimiento de un empleado
  async updateEmployeeKnowledgeBase(employeeEmail, knowledgeType, content) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      
      if (!folder.knowledgeBase[knowledgeType]) {
        folder.knowledgeBase[knowledgeType] = [];
      }
      
      // Agregar nuevo contenido a la base de conocimiento
      folder.knowledgeBase[knowledgeType].push({
        id: Date.now().toString(),
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      folder.lastUpdated = new Date().toISOString();
      this.employeeFolders.set(employeeEmail, folder);
      
      console.log(`Base de conocimiento actualizada para empleado: ${employeeEmail}`);
      return folder;
    } catch (error) {
      console.error(`Error actualizando base de conocimiento para empleado ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Obtener la base de conocimiento de un empleado
  async getEmployeeKnowledgeBase(employeeEmail) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      return folder.knowledgeBase;
    } catch (error) {
      console.error(`Error obteniendo base de conocimiento para empleado ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Agregar un documento a la carpeta del empleado
  async addEmployeeDocument(employeeEmail, document) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      
      folder.knowledgeBase.documents.push({
        id: Date.now().toString(),
        ...document,
        uploadedAt: new Date().toISOString()
      });
      
      folder.lastUpdated = new Date().toISOString();
      this.employeeFolders.set(employeeEmail, folder);
      
      console.log(`Documento agregado para empleado: ${employeeEmail}`);
      return folder;
    } catch (error) {
      console.error(`Error agregando documento para empleado ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Agregar una FAQ a la carpeta del empleado
  async addEmployeeFAQ(employeeEmail, question, answer) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      
      folder.knowledgeBase.faqs.push({
        id: Date.now().toString(),
        question: question,
        answer: answer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      folder.lastUpdated = new Date().toISOString();
      this.employeeFolders.set(employeeEmail, folder);
      
      console.log(`FAQ agregada para empleado: ${employeeEmail}`);
      return folder;
    } catch (error) {
      console.error(`Error agregando FAQ para empleado ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Obtener todas las carpetas de empleados de una empresa
  async getEmployeeFoldersByCompany(companyId) {
    try {
      const employees = await inMemoryEmployeeService.getEmployees({ companyId: companyId });
      const folders = [];
      
      for (const employee of employees) {
        if (employee.email) {
          const folder = await this.getEmployeeFolder(employee.email);
          folders.push(folder);
        }
      }
      
      return folders;
    } catch (error) {
      console.error(`Error obteniendo carpetas de empleados para empresa ${companyId}:`, error);
      throw error;
    }
  }

  // Buscar en la base de conocimiento de un empleado
  async searchEmployeeKnowledge(employeeEmail, query) {
    try {
      const knowledgeBase = await this.getEmployeeKnowledgeBase(employeeEmail);
      const results = [];
      
      // Buscar en FAQs
      knowledgeBase.faqs.forEach(faq => {
        if (faq.question.toLowerCase().includes(query.toLowerCase()) || 
            faq.answer.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            type: 'faq',
            ...faq
          });
        }
      });
      
      // Buscar en documentos
      knowledgeBase.documents.forEach(doc => {
        if (doc.name.toLowerCase().includes(query.toLowerCase()) || 
            (doc.description && doc.description.toLowerCase().includes(query.toLowerCase()))) {
          results.push({
            type: 'document',
            ...doc
          });
        }
      });
      
      // Buscar en políticas
      knowledgeBase.policies.forEach(policy => {
        if (policy.content.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            type: 'policy',
            ...policy
          });
        }
      });
      
      // Buscar en procedimientos
      knowledgeBase.procedures.forEach(procedure => {
        if (procedure.content.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            type: 'procedure',
            ...procedure
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error(`Error buscando en base de conocimiento para empleado ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Agregar mensaje al historial de conversación
  async addConversationMessage(employeeEmail, message) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      
      folder.conversationHistory.push({
        id: Date.now().toString(),
        ...message,
        timestamp: new Date().toISOString()
      });
      
      // Mantener solo los últimos 100 mensajes para evitar sobrecarga
      if (folder.conversationHistory.length > 100) {
        folder.conversationHistory = folder.conversationHistory.slice(-100);
      }
      
      folder.lastUpdated = new Date().toISOString();
      this.employeeFolders.set(employeeEmail, folder);
      
      return folder;
    } catch (error) {
      console.error(`Error agregando mensaje de conversación para empleado ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Obtener historial de conversación
  async getConversationHistory(employeeEmail) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      return folder.conversationHistory;
    } catch (error) {
      console.error(`Error obteniendo historial de conversación para empleado ${employeeEmail}:`, error);
      throw error;
    }
  }

  // Obtener estadísticas de la carpeta del empleado
  async getEmployeeFolderStats(employeeEmail) {
    try {
      const folder = await this.getEmployeeFolder(employeeEmail);
      
      return {
        email: folder.email,
        companyName: folder.companyName,
        createdAt: folder.createdAt,
        lastUpdated: folder.lastUpdated,
        knowledgeStats: {
          faqs: folder.knowledgeBase.faqs.length,
          documents: folder.knowledgeBase.documents.length,
          policies: folder.knowledgeBase.policies.length,
          procedures: folder.knowledgeBase.procedures.length
        },
        conversationStats: {
          totalMessages: folder.conversationHistory.length,
          lastMessage: folder.conversationHistory.length > 0 ? 
            folder.conversationHistory[folder.conversationHistory.length - 1].timestamp : null
        }
      };
    } catch (error) {
      console.error(`Error obteniendo estadísticas para empleado ${employeeEmail}:`, error);
      throw error;
    }
  }
}

// Create a named instance for better debugging and stack traces
const employeeFolderService = new EmployeeFolderService();
export default employeeFolderService;