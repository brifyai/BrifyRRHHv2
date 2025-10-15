import { v4 as uuidv4 } from 'uuid';

class InMemoryEmployeeService {
  // Datos en memoria con las empresas correctas
  companies = [
    { id: '1', name: 'Ariztia' },
    { id: '2', name: 'Inchcape' },
    { id: '3', name: 'Achs' },
    { id: '4', name: 'Arcoprime' },
    { id: '5', name: 'Grupo Saesa' },
    { id: '6', name: 'Colbun' },
    { id: '7', name: 'AFP Habitat' },
    { id: '8', name: 'Copec' },
    { id: '9', name: 'Antofagasta Minerals' },
    { id: '10', name: 'Vida Cámara' },
    { id: '11', name: 'Enaex' },
    { id: '12', name: 'SQM' },
    { id: '13', name: 'CMPC' },
    { id: '14', name: 'Corporación Chilena - Alemana' },
    { id: '15', name: 'Hogar Alemán' },
    { id: '16', name: 'Empresas SB' }
  ];

  employees = [];

  // Nombres y apellidos comunes en Chile
  firstNames = [
    'Camila', 'Patricio', 'Víctor', 'Graciela', 'Jorge', 'Ricardo', 'Felipe', 'Arturo', 
    'Valentina', 'Isabel', 'César', 'Oscar', 'Carolina', 'Rodrigo', 'Francisco', 
    'Miguel', 'Alejandro', 'Daniela', 'Romina', 'Silvana', 'Guillermo', 'Fernanda', 
    'Claudia', 'Teresa', 'Víctor', 'Cristian', 'Diego', 'Natalia', 'Luis', 'Karina',
    'Andrés', 'Marcela', 'Verónica', 'Roberto', 'Tamara', 'Danielle', 'Macarena',
    'Sebastián', 'Pablo', 'Eduardo', 'Fernando', 'Constanza', 'Paulina', 'Catalina',
    'Ignacio', 'Renata', 'Matías', 'Camilo', 'Andrea', 'Nicole', 'José', 'Manuel',
    'María', 'Ana', 'Sofía', 'Lucía', 'Martina', 'Emma', 'Antonia', 'Agustina',
    'Josefa', 'Antonia', 'Florencia', 'Martín', 'Tomás', 'Benjamín', 'Joaquín',
    'Maximiliano', 'Simón', 'Julián', 'Gaspar', 'Vicente', 'Gonzalo', 'Renato',
    'Hernán', 'Esteban', 'Mario', 'Raúl', 'Hugo', 'Alberto', 'Enrique', 'Rafael'
  ];

  lastNames = [
    'Gutiérrez', 'Castro', 'Vargas', 'Reyes', 'Sepúlveda', 'Henríquez', 'Miranda',
    'López', 'Pizarro', 'Villarroel', 'Ramos', 'Morales', 'Álvarez', 'Cortés',
    'Rivera', 'Parra', 'Leiva', 'Silva', 'Fuentes', 'Zúñiga', 'Díaz', 'Muñoz',
    'Romero', 'Guzmán', 'Moraga', 'Contreras', 'Herrera', 'Roas', 'Aguilera',
    'Pérez', 'Sánchez', 'González', 'Rodríguez', 'Fernández', 'Martínez',
    'García', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Moreno',
    'Álvarez', 'Romero', 'Serrano', 'Torres', 'Delgado', 'Castillo', 'Ortega',
    'Rubio', 'Molina', 'Navarro', 'Ramos', 'Sanz', 'Blanco', 'Suárez', 'Mora',
    'Vega', 'Cruz', 'Flores', 'Herrero', 'Medina', 'Garrido', 'Campos', 'Vidal',
    'Saavedra', 'Cortés', 'Guerrero', 'Muñoz', 'Valenzuela', 'Rojas', 'Vásquez',
    'Espinoza', 'Bravo', 'Cárdenas', 'Mendoza', 'Vargas', 'Carrasco', 'Paredes'
  ];

  regions = [
    'Región de Tarapacá', 'Región de Antofagasta', 'Región de Atacama', 
    'Región de Coquimbo', 'Región de Valparaíso', 
    'Región del Libertador General Bernardo O\'Higgins', 'Región del Maule', 
    'Región de Ñuble', 'Región del Biobío', 'Región de La Araucanía', 
    'Región de Los Ríos', 'Región de Los Lagos', 
    'Región Aysén del General Carlos Ibáñez del Campo', 
    'Región de Magallanes y de la Antártica Chilena', 'Región Metropolitana'
  ];

  departments = [
    'Operaciones', 'TI', 'Seguridad', 'Producción', 'RRHH', 'Administración',
    'Planificación', 'Mantenimiento', 'Servicio al Cliente', 'Logística',
    'Investigación y Desarrollo', 'Contabilidad', 'Finanzas', 'Tesorería',
    'Marketing', 'Ventas', 'Auditoría', 'Legal', 'Calidad', 'Compras',
    'Comunicaciones', 'Innovación', 'Sostenibilidad', 'Riesgos', 'Cumplimiento'
  ];

  levels = [
    'Asistente', 'Especialista', 'Supervisor', 'Coordinador', 
    'Jefatura', 'Gerente', 'Director', 'Operario', 'Analista', 'Consultor'
  ];

  positions = [
    'Jefe de Operaciones', 'Desarrollador', 'Supervisor de Seguridad',
    'Jefe de Producción', 'Reclutador', 'Especialista en Seguridad',
    'Técnico de Soporte', 'Operario de Producción', 'Coordinador Administrativo',
    'Planificador', 'Administrativo', 'Gerente de Mantenimiento',
    'Ejecutivo de Servicio', 'Supervisor de Logística', 'Desarrollador de Producto',
    'Asistente Contable', 'Asistente de Calidad', 'Jefe Administrativo',
    'Jefe de Mantenimiento', 'Coordinador Administrativo', 'Gerente Contable',
    'Gerente Financiero', 'Asistente de Mantenimiento', 'Asistente Financiero',
    'Jefe de Calidad', 'Jefe de RRHH', 'Supervisor de Operaciones',
    'Analista de Tesorería', 'Supervisor de Producción', 'Especialista en Marketing',
    'Ejecutivo de Ventas', 'Jefe de Tesorería', 'Contador', 'Asistente de Auditoría',
    'Especialista en Cumplimiento', 'Asistente de Mantenimiento', 'Jefe de Logística',
    'Coordinador de Marketing', 'Gerente de Auditoría', 'Gerente Legal',
    'Gerente de Ventas', 'Asistente de Tesorería', 'Auditor Interno',
    'Director de Innovación', 'Especialista en Sostenibilidad', 'Gerente de Riesgos',
    'Coordinador de Comunicaciones', 'Analista de Datos', 'Consultor Senior',
    'Director de Tecnología', 'Gerente de Proyectos', 'Especialista en Capacitación'
  ];

  workModes = ['Presencial', 'Híbrido', 'Remoto'];
  contractTypes = ['Indefinido', 'Plazo Fijo', 'Honorarios'];

  constructor() {
    // Inicializar con 50 empleados por empresa
    this.initializeEmployees();
  }

  // Generar un nombre aleatorio
  generateRandomName() {
    const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    const lastName1 = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    const lastName2 = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    return `${firstName} ${lastName1} ${lastName2}`;
  }

  // Generar un email basado en el nombre y empresa
  generateEmail(name, companyName) {
    const cleanName = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    const cleanCompany = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    return `${cleanName}@${cleanCompany}.cl`;
  }

  // Generar un teléfono aleatorio
  generatePhone() {
    const prefixes = ['9', '2', '3', '4', '5', '6', '7'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 10000000);
    return `+56 ${prefix} ${number.toString().padStart(8, '0')}`;
  }

  // Generar datos de empleado aleatorios
  generateEmployeeData(companyId, companyName) {
    const name = this.generateRandomName();
    return {
      id: uuidv4(),
      company_id: companyId,
      name: name,
      email: this.generateEmail(name, companyName),
      phone: this.generatePhone(),
      region: this.regions[Math.floor(Math.random() * this.regions.length)],
      department: this.departments[Math.floor(Math.random() * this.departments.length)],
      level: this.levels[Math.floor(Math.random() * this.levels.length)],
      position: this.positions[Math.floor(Math.random() * this.positions.length)],
      work_mode: this.workModes[Math.floor(Math.random() * this.workModes.length)],
      contract_type: this.contractTypes[Math.floor(Math.random() * this.contractTypes.length)],
      is_active: true,
      has_subordinates: Math.random() > 0.7
    };
  }

  // Inicializar empleados (50 por empresa)
  initializeEmployees() {
    console.log('Inicializando empleados en memoria...');
    
    // Para cada empresa, generar exactamente 50 empleados
    this.companies.forEach(company => {
      console.log(`Generando 50 empleados para ${company.name}`);
      
      for (let i = 0; i < 50; i++) {
        this.employees.push(this.generateEmployeeData(company.id, company.name));
      }
    });
    
    console.log(`Inicialización completada - ${this.employees.length} empleados en total`);
  }

  // Obtener todos los empleados con filtros opcionales
  async getEmployees(filters = {}) {
    try {
      let filteredEmployees = [...this.employees];

      // Aplicar filtros
      if (filters.companyId) {
        filteredEmployees = filteredEmployees.filter(emp => emp.company_id === filters.companyId);
      }

      if (filters.region) {
        filteredEmployees = filteredEmployees.filter(emp =>
          emp.region.toLowerCase().includes(filters.region.toLowerCase())
        );
      }

      if (filters.department) {
        filteredEmployees = filteredEmployees.filter(emp =>
          emp.department.toLowerCase().includes(filters.department.toLowerCase())
        );
      }

      if (filters.level) {
        filteredEmployees = filteredEmployees.filter(emp =>
          emp.level.toLowerCase().includes(filters.level.toLowerCase())
        );
      }

      if (filters.position) {
        filteredEmployees = filteredEmployees.filter(emp =>
          emp.position.toLowerCase().includes(filters.position.toLowerCase())
        );
      }

      if (filters.hasSubordinates !== undefined) {
        filteredEmployees = filteredEmployees.filter(emp => emp.has_subordinates === filters.hasSubordinates);
      }

      if (filters.workMode) {
        filteredEmployees = filteredEmployees.filter(emp =>
          emp.work_mode.toLowerCase().includes(filters.workMode.toLowerCase())
        );
      }

      if (filters.contractType) {
        filteredEmployees = filteredEmployees.filter(emp =>
          emp.contract_type.toLowerCase().includes(filters.contractType.toLowerCase())
        );
      }

      // Vincular información de empresa a cada empleado
      filteredEmployees = filteredEmployees.map(employee => {
        const company = this.companies.find(comp => comp.id === employee.company_id);
        return {
          ...employee,
          company: company || null
        };
      });

      // Ordenar por nombre
      filteredEmployees.sort((a, b) => a.name.localeCompare(b.name));

      // Limitar resultados
      if (filters.limit) {
        filteredEmployees = filteredEmployees.slice(0, filters.limit);
      }

      return filteredEmployees;
    } catch (error) {
      console.error('Error obteniendo empleados:', error);
      throw error;
    }
  }

  // Obtener todas las empresas
  async getCompanies() {
    try {
      return this.companies;
    } catch (error) {
      console.error('Error obteniendo empresas:', error);
      throw error;
    }
  }

  // Obtener empleado por ID
  async getEmployeeById(id) {
    try {
      const employee = this.employees.find(emp => emp.id === id);
      if (!employee) {
        throw new Error('Empleado no encontrado');
      }
      
      // Agregar información de la empresa
      const company = this.companies.find(comp => comp.id === employee.company_id);
      return {
        ...employee,
        company: company
      };
    } catch (error) {
      console.error('Error obteniendo empleado:', error);
      throw error;
    }
  }

  // Obtener conteo de empleados por empresa
  async getEmployeeCountByCompany(companyId) {
    try {
      const count = this.employees.filter(emp => emp.company_id === companyId).length;
      return count;
    } catch (error) {
      console.error('Error obteniendo conteo de empleados:', error);
      throw error;
    }
  }

  // Asegurar que cada empresa tenga exactamente 50 empleados
  async ensure50EmployeesPerCompany(progressCallback) {
    try {
      if (progressCallback) progressCallback('Asegurando 50 empleados por empresa...');
      
      if (progressCallback) progressCallback(`Encontradas ${this.companies.length} empresas`);
      
      // Para cada empresa, asegurar que tenga exactamente 50 empleados
      for (const company of this.companies) {
        if (progressCallback) progressCallback(`Procesando empresa: ${company.name}`);
        
        // Obtener el conteo actual de empleados
        const currentCount = this.employees.filter(emp => emp.company_id === company.id).length;
        
        if (progressCallback) progressCallback(`Empresa ${company.name} tiene actualmente ${currentCount} empleados`);
        
        // Si ya hay 50 empleados, continuar con la siguiente empresa
        if (currentCount === 50) {
          if (progressCallback) progressCallback(`Empresa ${company.name} ya tiene exactamente 50 empleados`);
          continue;
        }
        
        // Si hay menos de 50, generar los que faltan
        if (currentCount < 50) {
          const employeesToAdd = 50 - currentCount;
          if (progressCallback) progressCallback(`Agregando ${employeesToAdd} empleados a ${company.name}`);
          
          const newEmployees = [];
          for (let i = 0; i < employeesToAdd; i++) {
            newEmployees.push(this.generateEmployeeData(company.id, company.name));
          }
          
          this.employees = [...this.employees, ...newEmployees];
          
          if (progressCallback) progressCallback(`Agregados ${employeesToAdd} empleados a ${company.name}`);
        }
        // Si hay más de 50, eliminar los excedentes
        else if (currentCount > 50) {
          const employeesToRemove = currentCount - 50;
          if (progressCallback) progressCallback(`Eliminando ${employeesToRemove} empleados de ${company.name}`);
          
          // Obtener IDs de empleados para eliminar (aleatoriamente)
          const companyEmployees = this.employees.filter(emp => emp.company_id === company.id);
          const employeesToDelete = companyEmployees.slice(0, employeesToRemove);
          const employeeIdsToDelete = employeesToDelete.map(emp => emp.id);
          
          this.employees = this.employees.filter(emp => !employeeIdsToDelete.includes(emp.id));
          
          if (progressCallback) progressCallback(`Eliminados ${employeesToRemove} empleados de ${company.name}`);
        }
      }
      
      if (progressCallback) progressCallback('Proceso completado - todas las empresas tienen 50 empleados');
      return { success: true };
    } catch (error) {
      console.error('Error asegurando 50 empleados por empresa:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new InMemoryEmployeeService();