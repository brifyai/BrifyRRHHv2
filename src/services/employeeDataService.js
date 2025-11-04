import { supabase } from '../lib/supabase';

class EmployeeDataService {
  // Nombres y apellidos comunes en Chile
  firstNames = [
    'Camila', 'Patricio', 'Víctor', 'Graciela', 'Jorge', 'Ricardo', 'Felipe', 'Arturo', 
    'Valentina', 'Isabel', 'César', 'Oscar', 'Carolina', 'Rodrigo', 'Francisco', 
    'Miguel', 'Alejandro', 'Daniela', 'Romina', 'Silvana', 'Guillermo', 'Fernanda', 
    'Claudia', 'Teresa', 'Víctor', 'Cristian', 'Diego', 'Natalia', 'Luis', 'Karina',
    'Andrés', 'Marcela', 'Verónica', 'Roberto', 'Tamara', 'Danielle', 'Macarena',
    'Sebastián', 'Pablo', 'Eduardo', 'Fernando', 'Constanza', 'Paulina', 'Catalina',
    'Ignacio', 'Renata', 'Matías', 'Camilo', 'Andrea', 'Nicole', 'José', 'Manuel'
  ];

  lastNames = [
    'Gutiérrez', 'Castro', 'Vargas', 'Reyes', 'Sepúlveda', 'Henríquez', 'Miranda',
    'López', 'Pizarro', 'Villarroel', 'Ramos', 'Morales', 'Álvarez', 'Cortés',
    'Rivera', 'Parra', 'Leiva', 'Silva', 'Fuentes', 'Zúñiga', 'Díaz', 'Muñoz',
    'Romero', 'Guzmán', 'Moraga', 'Contreras', 'Herrera', 'Roas', 'Aguilera',
    'Pérez', 'Sánchez', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez',
    'García', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno'
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
    'Marketing', 'Ventas', 'Auditoría', 'Legal', 'Calidad', 'Compras'
  ];

  levels = [
    'Asistente', 'Especialista', 'Supervisor', 'Coordinador', 
    'Jefatura', 'Gerente', 'Director', 'Operario'
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
    'Gerente de Ventas', 'Asistente de Tesorería', 'Auditor Interno'
  ];

  workModes = ['Presencial', 'Híbrido', 'Remoto'];
  contractTypes = ['Indefinido', 'Plazo Fijo', 'Honorarios'];

  // Generar un nombre aleatorio
  generateRandomName() {
    // Validar que los arrays de nombres no estén vacíos
    if (!this.firstNames || this.firstNames.length === 0) {
      throw new Error('No hay nombres disponibles para generar empleados');
    }
    if (!this.lastNames || this.lastNames.length === 0) {
      throw new Error('No hay apellidos disponibles para generar empleados');
    }
    
    const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    
    // Validar que los nombres generados no estén vacíos
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      throw new Error('Nombre generado inválido');
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      throw new Error('Apellido generado inválido');
    }
    
    return `${firstName} ${lastName}`;
  }

  // Generar un email basado en el nombre y empresa
  generateEmail(name, companyName) {
    // Validar parámetros de entrada
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Nombre es requerido y no puede estar vacío para generar email');
    }
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      throw new Error('Nombre de empresa es requerido y no puede estar vacío para generar email');
    }
    
    const cleanName = name.toLowerCase().replace(/\s+/g, '.');
    const cleanCompany = companyName.toLowerCase().replace(/\s+/g, '');
    
    // Validar que la limpieza no resulte en strings vacíos
    if (!cleanName || cleanName.trim().length === 0) {
      throw new Error('Nombre limpio inválido para generar email');
    }
    if (!cleanCompany || cleanCompany.trim().length === 0) {
      throw new Error('Nombre de empresa limpio inválido para generar email');
    }
    
    const email = `${cleanName}@${cleanCompany}.cl`;
    
    // Validación básica del formato del email
    if (!email.includes('@') || !email.endsWith('.cl')) {
      throw new Error('Formato de email generado inválido');
    }
    
    return email;
  }

  // Generar un teléfono aleatorio
  generatePhone() {
    // Validar que el rango de números sea válido
    const maxNumber = 10000000;
    const number = Math.floor(Math.random() * maxNumber);
    
    // Validar que el número generado esté en el rango correcto
    if (typeof number !== 'number' || number < 0 || number >= maxNumber) {
      throw new Error('Número telefónico generado inválido');
    }
    
    const phone = `+56 9 ${number.toString().padStart(8, '0')}`;
    
    // Validar formato del teléfono
    if (!phone.startsWith('+56 9 ') || phone.length !== 13) {
      throw new Error('Formato de teléfono generado inválido');
    }
    
    return phone;
  }

  // Generar datos de empleado aleatorios
  generateEmployeeData(companyId, companyName) {
    // Validar parámetros de entrada
    if (!companyId || typeof companyId !== 'string') {
      throw new Error('ID de empresa es requerido y debe ser string para generar empleado');
    }
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      throw new Error('Nombre de empresa es requerido y no puede estar vacío para generar empleado');
    }
    
    const name = this.generateRandomName();
    
    // Validar que los arrays de datos no estén vacíos
    if (!this.regions || this.regions.length === 0) {
      throw new Error('No hay regiones disponibles para asignar al empleado');
    }
    if (!this.departments || this.departments.length === 0) {
      throw new Error('No hay departamentos disponibles para asignar al empleado');
    }
    if (!this.levels || this.levels.length === 0) {
      throw new Error('No hay niveles disponibles para asignar al empleado');
    }
    if (!this.positions || this.positions.length === 0) {
      throw new Error('No hay posiciones disponibles para asignar al empleado');
    }
    if (!this.workModes || this.workModes.length === 0) {
      throw new Error('No hay modos de trabajo disponibles para asignar al empleado');
    }
    if (!this.contractTypes || this.contractTypes.length === 0) {
      throw new Error('No hay tipos de contrato disponibles para asignar al empleado');
    }
    
    const employeeData = {
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
    
    // Validar los datos generados antes de retornarlos
    this.validateEmployeeData(employeeData);
    
    return employeeData;
  }

  // Validar datos de empresa
  validateCompanyData(company) {
    if (!company || typeof company !== 'object') {
      throw new Error('Datos de empresa inválidos');
    }
    if (!company.id || typeof company.id !== 'string') {
      throw new Error('ID de empresa es requerido y debe ser string');
    }
    if (!company.name || typeof company.name !== 'string' || company.name.trim().length === 0) {
      throw new Error('Nombre de empresa es requerido y no puede estar vacío');
    }
    return true;
  }

  // Validar datos de empleado
  validateEmployeeData(employee) {
    if (!employee || typeof employee !== 'object') {
      throw new Error('Datos de empleado inválidos');
    }
    if (!employee.company_id || typeof employee.company_id !== 'string') {
      throw new Error('ID de empresa es requerido y debe ser string');
    }
    if (!employee.name || typeof employee.name !== 'string' || employee.name.trim().length === 0) {
      throw new Error('Nombre de empleado es requerido y no puede estar vacío');
    }
    if (!employee.email || typeof employee.email !== 'string' || !employee.email.includes('@')) {
      throw new Error('Email de empleado es requerido y debe ser válido');
    }
    if (employee.phone && (typeof employee.phone !== 'string' || employee.phone.trim().length === 0)) {
      throw new Error('Teléfono debe ser string válido o nulo');
    }
    return true;
  }

  // Validar límites de empleados
  validateEmployeeCount(count, operation = 'operación') {
    if (typeof count !== 'number' || count < 0) {
      throw new Error(`El conteo de empleados debe ser un número positivo para ${operation}`);
    }
    if (count > 1000) {
      throw new Error(`El conteo de empleados no puede exceder 1000 para ${operation}`);
    }
    return true;
  }

  // Obtener el conteo de empleados por empresa del dashboard
  async getDashboardEmployeeCounts() {
    try {
      // Obtener todas las empresas
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');
      
      if (companiesError) throw companiesError;
      
      // Validar que se obtuvieron empresas
      if (!companies || companies.length === 0) {
        console.warn('No se encontraron empresas en la base de datos');
        return [];
      }
      
      // Validar cada empresa antes de procesar
      companies.forEach(company => this.validateCompanyData(company));
      
      // Para cada empresa, devolver siempre 50 empleados (como solicitado)
      const companyCounts = companies.map((company) => ({
        companyId: company.id,
        companyName: company.name,
        desiredCount: 50 // Exactamente 50 empleados por empresa
      }));
      
      return companyCounts;
    } catch (error) {
      console.error('Error getting dashboard employee counts:', error);
      throw error;
    }
  }

  // Sincronizar empleados con los conteos deseados
  async syncEmployeesWithDashboard() {
    try {
      console.log('Sincronizando empleados con el dashboard...');
      
      // Obtener los conteos deseados
      const companyCounts = await this.getDashboardEmployeeCounts();
      
      // Para cada empresa, ajustar el número de empleados
      for (const companyCount of companyCounts) {
        await this.adjustEmployeeCountForCompany(
          companyCount.companyId, 
          companyCount.companyName, 
          companyCount.desiredCount
        );
      }
      
      console.log('Sincronización completada');
      return { success: true };
    } catch (error) {
      console.error('Error sincronizando empleados:', error);
      throw error;
    }
  }

  // Ajustar el número de empleados para una empresa específica
  async adjustEmployeeCountForCompany(companyId, companyName, desiredCount) {
    try {
      // Validar parámetros de entrada
      if (!companyId || typeof companyId !== 'string') {
        throw new Error('ID de empresa es requerido y debe ser string');
      }
      if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
        throw new Error('Nombre de empresa es requerido y no puede estar vacío');
      }
      this.validateEmployeeCount(desiredCount, 'ajuste de empleados');
      
      // Obtener el conteo actual de empleados
      const { count: currentCount, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);
      
      if (countError) throw countError;
      
      console.log(`Empresa: ${companyName}, Actual: ${currentCount}, Deseado: ${desiredCount}`);
      
      if (currentCount < desiredCount) {
        // Necesitamos agregar empleados
        const employeesToAdd = desiredCount - currentCount;
        this.validateEmployeeCount(employeesToAdd, 'agregar empleados');
        console.log(`Agregando ${employeesToAdd} empleados a ${companyName}`);
        
        const employeesData = [];
        for (let i = 0; i < employeesToAdd; i++) {
          const employeeData = this.generateEmployeeData(companyId, companyName);
          this.validateEmployeeData(employeeData);
          employeesData.push(employeeData);
        }
        
        // Validar que no haya duplicados por email antes de insertar
        const emails = employeesData.map(emp => emp.email);
        const { data: existingEmployees, error: checkError } = await supabase
          .from('employees')
          .select('email')
          .in('email', emails)
          .eq('company_id', companyId);
        
        if (checkError) throw checkError;
        
        if (existingEmployees && existingEmployees.length > 0) {
          const existingEmails = existingEmployees.map(emp => emp.email);
          const duplicates = emails.filter(email => existingEmails.includes(email));
          throw new Error(`Ya existen empleados con los emails: ${duplicates.join(', ')}`);
        }
        
        const { error: insertError } = await supabase
          .from('employees')
          .insert(employeesData);
        
        if (insertError) throw insertError;
      } else if (currentCount > desiredCount) {
        // Necesitamos eliminar empleados
        const employeesToRemove = currentCount - desiredCount;
        this.validateEmployeeCount(employeesToRemove, 'eliminar empleados');
        console.log(`Eliminando ${employeesToRemove} empleados de ${companyName}`);
        
        // Validar que no se eliminen todos los empleados
        if (desiredCount === 0) {
          throw new Error('No se pueden eliminar todos los empleados de una empresa');
        }
        
        // Obtener IDs de empleados para eliminar
        const { data: employeesToDelete, error: selectError } = await supabase
          .from('employees')
          .select('id')
          .eq('company_id', companyId)
          .limit(employeesToRemove);
        
        if (selectError) throw selectError;
        
        if (!employeesToDelete || employeesToDelete.length === 0) {
          throw new Error('No se encontraron empleados para eliminar');
        }
        
        const employeeIds = employeesToDelete.map(emp => emp.id);
        
        // Validar que los IDs sean válidos
        if (employeeIds.some(id => !id || typeof id !== 'string')) {
          throw new Error('IDs de empleados inválidos para eliminar');
        }
        
        const { error: deleteError } = await supabase
          .from('employees')
          .delete()
          .in('id', employeeIds);
        
        if (deleteError) throw deleteError;
      }
    } catch (error) {
      console.error(`Error ajustando empleados para ${companyName}:`, error);
      throw error;
    }
  }

  // Generar datos de empleados para todas las empresas (50 por empresa)
  async generateEmployeesForAllCompanies() {
    try {
      // console.log('Generando datos de empleados para todas las empresas...');
      
      // Obtener todas las empresas
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');
      
      if (companiesError) throw companiesError;
      
      // Validar que se obtuvieron empresas
      if (!companies || companies.length === 0) {
        throw new Error('No se encontraron empresas para generar empleados');
      }
      
      // Validar cada empresa antes de procesar
      companies.forEach(company => this.validateCompanyData(company));
      
      // Para cada empresa, generar exactamente 50 empleados
      for (const company of companies) {
        const employeeCount = 50; // Exactamente 50 empleados por empresa
        // console.log(`Generando ${employeeCount} empleados para ${company.name}`);
        
        // Primero verificar cuántos empleados existen actualmente
        const { count: currentCount, error: countError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id);
        
        if (countError) throw countError;
        
        this.validateEmployeeCount(currentCount, 'conteo actual de empleados');
        
        // Si ya hay 50 empleados, no hacer nada
        if (currentCount === 50) {
          console.log(`Empresa ${company.name} ya tiene 50 empleados`);
          continue;
        }
        
        // Si hay menos de 50, generar los que faltan
        if (currentCount < 50) {
          const employeesToAdd = 50 - currentCount;
          this.validateEmployeeCount(employeesToAdd, 'agregar empleados');
          console.log(`Agregando ${employeesToAdd} empleados a ${company.name}`);
          
          const employeesData = [];
          const emails = new Set(); // Para evitar duplicados en el mismo lote
          
          for (let i = 0; i < employeesToAdd; i++) {
            let employeeData;
            let attempts = 0;
            const maxAttempts = 10;
            
            // Reintentar generar datos si el email ya existe
            do {
              employeeData = this.generateEmployeeData(company.id, company.name);
              attempts++;
              if (attempts > maxAttempts) {
                throw new Error(`No se pudo generar un email único después de ${maxAttempts} intentos para ${company.name}`);
              }
            } while (emails.has(employeeData.email));
            
            emails.add(employeeData.email);
            this.validateEmployeeData(employeeData);
            employeesData.push(employeeData);
          }
          
          // Verificar duplicados en la base de datos antes de insertar
          const emailList = Array.from(emails);
          const { data: existingEmployees, error: checkError } = await supabase
            .from('employees')
            .select('email')
            .in('email', emailList)
            .eq('company_id', company.id);
          
          if (checkError) throw checkError;
          
          if (existingEmployees && existingEmployees.length > 0) {
            const existingEmails = existingEmployees.map(emp => emp.email);
            throw new Error(`Ya existen empleados con los emails: ${existingEmails.join(', ')}`);
          }
          
          // Insertar empleados en lotes de 100 para evitar problemas de memoria
          for (let i = 0; i < employeesData.length; i += 100) {
            const batch = employeesData.slice(i, i + 100);
            const { error: insertError } = await supabase
              .from('employees')
              .insert(batch);
            
            if (insertError) throw insertError;
          }
        }
        // Si hay más de 50, eliminar los excedentes
        else if (currentCount > 50) {
          const employeesToRemove = currentCount - 50;
          this.validateEmployeeCount(employeesToRemove, 'eliminar empleados');
          console.log(`Eliminando ${employeesToRemove} empleados de ${company.name}`);
          
          // Validar que no se eliminen todos los empleados
          if (50 === 0) {
            throw new Error('No se pueden eliminar todos los empleados de una empresa');
          }
          
          // Obtener IDs de empleados para eliminar
          const { data: employeesToDelete, error: selectError } = await supabase
            .from('employees')
            .select('id')
            .eq('company_id', company.id)
            .limit(employeesToRemove);
          
          if (selectError) throw selectError;
          
          if (!employeesToDelete || employeesToDelete.length === 0) {
            throw new Error('No se encontraron empleados para eliminar');
          }
          
          const employeeIds = employeesToDelete.map(emp => emp.id);
          
          // Validar que los IDs sean válidos
          if (employeeIds.some(id => !id || typeof id !== 'string')) {
            throw new Error('IDs de empleados inválidos para eliminar');
          }
          
          const { error: deleteError } = await supabase
            .from('employees')
            .delete()
            .in('id', employeeIds);
          
          if (deleteError) throw deleteError;
        }
      }
      
      console.log('Generación de empleados completada - 50 empleados por empresa');
      return { success: true };
    } catch (error) {
      console.error('Error generando empleados:', error);
      throw error;
    }
  }

  // Asegurar que cada empresa tenga exactamente 50 empleados
  async ensure50EmployeesPerCompany(progressCallback) {
    try {
      if (progressCallback) progressCallback('Asegurando 50 empleados por empresa...');
      
      // Obtener todas las empresas
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');
      
      if (companiesError) throw companiesError;
      
      // Validar que se obtuvieron empresas
      if (!companies || companies.length === 0) {
        throw new Error('No se encontraron empresas para procesar');
      }
      
      // Validar cada empresa antes de procesar
      companies.forEach(company => this.validateCompanyData(company));
      
      if (progressCallback) progressCallback(`Encontradas ${companies.length} empresas`);
      
      // Para cada empresa, asegurar que tenga exactamente 50 empleados
      for (const company of companies) {
        if (progressCallback) progressCallback(`Procesando empresa: ${company.name}`);
        
        // Obtener el conteo actual de empleados
        const { count: currentCount, error: countError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id);
        
        if (countError) throw countError;
        
        this.validateEmployeeCount(currentCount, 'conteo actual de empleados');
        
        if (progressCallback) progressCallback(`Empresa ${company.name} tiene actualmente ${currentCount} empleados`);
        
        // Si ya hay 50 empleados, continuar con la siguiente empresa
        if (currentCount === 50) {
          if (progressCallback) progressCallback(`Empresa ${company.name} ya tiene exactamente 50 empleados`);
          continue;
        }
        
        // Si hay menos de 50, generar los que faltan
        if (currentCount < 50) {
          const employeesToAdd = 50 - currentCount;
          this.validateEmployeeCount(employeesToAdd, 'agregar empleados');
          if (progressCallback) progressCallback(`Agregando ${employeesToAdd} empleados a ${company.name}`);
          
          const employeesData = [];
          const emails = new Set(); // Para evitar duplicados en el mismo lote
          
          for (let i = 0; i < employeesToAdd; i++) {
            let employeeData;
            let attempts = 0;
            const maxAttempts = 10;
            
            // Reintentar generar datos si el email ya existe
            do {
              employeeData = this.generateEmployeeData(company.id, company.name);
              attempts++;
              if (attempts > maxAttempts) {
                throw new Error(`No se pudo generar un email único después de ${maxAttempts} intentos para ${company.name}`);
              }
            } while (emails.has(employeeData.email));
            
            emails.add(employeeData.email);
            this.validateEmployeeData(employeeData);
            employeesData.push(employeeData);
          }
          
          // Verificar duplicados en la base de datos antes de insertar
          const emailList = Array.from(emails);
          const { data: existingEmployees, error: checkError } = await supabase
            .from('employees')
            .select('email')
            .in('email', emailList)
            .eq('company_id', company.id);
          
          if (checkError) throw checkError;
          
          if (existingEmployees && existingEmployees.length > 0) {
            const existingEmails = existingEmployees.map(emp => emp.email);
            throw new Error(`Ya existen empleados con los emails: ${existingEmails.join(', ')}`);
          }
          
          // Insertar empleados en lotes
          for (let i = 0; i < employeesData.length; i += 100) {
            const batch = employeesData.slice(i, i + 100);
            const { error: insertError } = await supabase
              .from('employees')
              .insert(batch);
            
            if (insertError) throw insertError;
          }
          
          if (progressCallback) progressCallback(`Agregados ${employeesToAdd} empleados a ${company.name}`);
        }
        // Si hay más de 50, eliminar los excedentes
        else if (currentCount > 50) {
          const employeesToRemove = currentCount - 50;
          this.validateEmployeeCount(employeesToRemove, 'eliminar empleados');
          if (progressCallback) progressCallback(`Eliminando ${employeesToRemove} empleados de ${company.name}`);
          
          // Validar que no se eliminen todos los empleados
          if (50 === 0) {
            throw new Error('No se pueden eliminar todos los empleados de una empresa');
          }
          
          // Obtener IDs de empleados para eliminar (aleatoriamente)
          const { data: employeesToDelete, error: selectError } = await supabase
            .from('employees')
            .select('id')
            .eq('company_id', company.id)
            .limit(employeesToRemove);
          
          if (selectError) throw selectError;
          
          if (!employeesToDelete || employeesToDelete.length === 0) {
            throw new Error('No se encontraron empleados para eliminar');
          }
          
          const employeeIds = employeesToDelete.map(emp => emp.id);
          
          // Validar que los IDs sean válidos
          if (employeeIds.some(id => !id || typeof id !== 'string')) {
            throw new Error('IDs de empleados inválidos para eliminar');
          }
          
          const { error: deleteError } = await supabase
            .from('employees')
            .delete()
            .in('id', employeeIds);
          
          if (deleteError) throw deleteError;
          
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

  // Limpiar todos los empleados (solo para desarrollo)
  async clearAllEmployees(confirmationToken = null) {
    try {
      // Validación de seguridad para operación destructiva
      const expectedToken = 'CLEAR_ALL_EMPLOYEES_CONFIRMED';
      if (confirmationToken !== expectedToken) {
        throw new Error('Operación de limpieza requiere confirmación explícita. Use el token: ' + expectedToken);
      }
      
      console.log('Limpiando todos los empleados...');
      
      // Verificar cuántos empleados se van a eliminar
      const { count: totalEmployees, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      if (totalEmployees === 0) {
        console.log('No hay empleados para eliminar');
        return { success: true, deletedCount: 0 };
      }
      
      console.warn(`ADVERTENCIA: Se eliminarán ${totalEmployees} empleados`);
      
      // Realizar la eliminación en lotes para mejor control
      const batchSize = 100;
      let deletedCount = 0;
      
      for (let i = 0; i < totalEmployees; i += batchSize) {
        const { error } = await supabase
          .from('employees')
          .delete()
          .limit(batchSize);
        
        if (error) throw error;
        deletedCount += Math.min(batchSize, totalEmployees - i);
      }
      
      console.log(`${deletedCount} empleados eliminados`);
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Error limpiando empleados:', error);
      throw error;
    }
  }

  // Nuevo método para validar la integridad de los datos
  async validateDataIntegrity() {
    try {
      console.log('Validando integridad de datos de empleados...');
      
      // Verificar empleados sin empresa válida
      const { data: orphanEmployees, error: orphanError } = await supabase
        .from('employees')
        .select('id, name, email, company_id')
        .is('company_id', null);
      
      if (orphanError) throw orphanError;
      
      if (orphanEmployees && orphanEmployees.length > 0) {
        console.warn(`Se encontraron ${orphanEmployees.length} empleados sin empresa asignada`);
      }
      
      // Verificar emails duplicados
      const { data: duplicateEmails, error: duplicateError } = await supabase
        .from('employees')
        .select('email, company_id')
        .group('email, company_id')
        .having('count(*) > 1');
      
      if (duplicateError) throw duplicateError;
      
      if (duplicateEmails && duplicateEmails.length > 0) {
        console.warn(`Se encontraron ${duplicateEmails.length} emails duplicados`);
      }
      
      // Verificar datos inválidos
      const { data: invalidEmployees, error: invalidError } = await supabase
        .from('employees')
        .select('id, name, email')
        .or('name.is.null,name.eq.,email.is.null,email.eq.');
      
      if (invalidError) throw invalidError;
      
      if (invalidEmployees && invalidEmployees.length > 0) {
        console.warn(`Se encontraron ${invalidEmployees.length} empleados con datos inválidos`);
      }
      
      return {
        orphanEmployees: orphanEmployees?.length || 0,
        duplicateEmails: duplicateEmails?.length || 0,
        invalidEmployees: invalidEmployees?.length || 0,
        isValid: (orphanEmployees?.length || 0) === 0 &&
                (duplicateEmails?.length || 0) === 0 &&
                (invalidEmployees?.length || 0) === 0
      };
    } catch (error) {
      console.error('Error validando integridad de datos:', error);
      throw error;
    }
  }
}

export default new EmployeeDataService();