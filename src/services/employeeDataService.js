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
    const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    return `${firstName} ${lastName}`;
  }

  // Generar un email basado en el nombre y empresa
  generateEmail(name, companyName) {
    const cleanName = name.toLowerCase().replace(/\s+/g, '.');
    const cleanCompany = companyName.toLowerCase().replace(/\s+/g, '');
    return `${cleanName}@${cleanCompany}.cl`;
  }

  // Generar un teléfono aleatorio
  generatePhone() {
    const number = Math.floor(Math.random() * 10000000);
    return `+56 9 ${number.toString().padStart(8, '0')}`;
  }

  // Generar datos de empleado aleatorios
  generateEmployeeData(companyId, companyName) {
    const name = this.generateRandomName();
    return {
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

  // Obtener el conteo de empleados por empresa del dashboard
  async getDashboardEmployeeCounts() {
    try {
      // Obtener todas las empresas
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');
      
      if (companiesError) throw companiesError;
      
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
        console.log(`Agregando ${employeesToAdd} empleados a ${companyName}`);
        
        const employeesData = [];
        for (let i = 0; i < employeesToAdd; i++) {
          employeesData.push(this.generateEmployeeData(companyId, companyName));
        }
        
        const { error: insertError } = await supabase
          .from('employees')
          .insert(employeesData);
        
        if (insertError) throw insertError;
      } else if (currentCount > desiredCount) {
        // Necesitamos eliminar empleados
        const employeesToRemove = currentCount - desiredCount;
        console.log(`Eliminando ${employeesToRemove} empleados de ${companyName}`);
        
        // Obtener IDs de empleados para eliminar
        const { data: employeesToDelete, error: selectError } = await supabase
          .from('employees')
          .select('id')
          .eq('company_id', companyId)
          .limit(employeesToRemove);
        
        if (selectError) throw selectError;
        
        const employeeIds = employeesToDelete.map(emp => emp.id);
        
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
      console.log('Generando datos de empleados para todas las empresas...');
      
      // Obtener todas las empresas
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');
      
      if (companiesError) throw companiesError;
      
      // Para cada empresa, generar exactamente 50 empleados
      for (const company of companies) {
        const employeeCount = 50; // Exactamente 50 empleados por empresa
        console.log(`Generando ${employeeCount} empleados para ${company.name}`);
        
        // Primero verificar cuántos empleados existen actualmente
        const { count: currentCount, error: countError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id);
        
        if (countError) throw countError;
        
        // Si ya hay 50 empleados, no hacer nada
        if (currentCount === 50) {
          console.log(`Empresa ${company.name} ya tiene 50 empleados`);
          continue;
        }
        
        // Si hay menos de 50, generar los que faltan
        if (currentCount < 50) {
          const employeesToAdd = 50 - currentCount;
          console.log(`Agregando ${employeesToAdd} empleados a ${company.name}`);
          
          const employeesData = [];
          for (let i = 0; i < employeesToAdd; i++) {
            employeesData.push(this.generateEmployeeData(company.id, company.name));
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
          console.log(`Eliminando ${employeesToRemove} empleados de ${company.name}`);
          
          // Obtener IDs de empleados para eliminar
          const { data: employeesToDelete, error: selectError } = await supabase
            .from('employees')
            .select('id')
            .eq('company_id', company.id)
            .limit(employeesToRemove);
          
          if (selectError) throw selectError;
          
          const employeeIds = employeesToDelete.map(emp => emp.id);
          
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
          
          const employeesData = [];
          for (let i = 0; i < employeesToAdd; i++) {
            employeesData.push(this.generateEmployeeData(company.id, company.name));
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
          if (progressCallback) progressCallback(`Eliminando ${employeesToRemove} empleados de ${company.name}`);
          
          // Obtener IDs de empleados para eliminar (aleatoriamente)
          const { data: employeesToDelete, error: selectError } = await supabase
            .from('employees')
            .select('id')
            .eq('company_id', company.id)
            .limit(employeesToRemove);
          
          if (selectError) throw selectError;
          
          const employeeIds = employeesToDelete.map(emp => emp.id);
          
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
  async clearAllEmployees() {
    try {
      console.log('Limpiando todos los empleados...');
      
      const { error } = await supabase
        .from('employees')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Condición que siempre es verdadera
      
      if (error) throw error;
      
      console.log('Empleados eliminados');
      return { success: true };
    } catch (error) {
      console.error('Error limpiando empleados:', error);
      throw error;
    }
  }
}

export default new EmployeeDataService();