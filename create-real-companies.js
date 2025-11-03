import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRealCompanies() {
  console.log('🏢 Creando empresas reales...');

  try {
    // 1. Primero, renombrar la tabla actual a employees_backup
    console.log('1. Creando backup de la tabla actual...');
    const { error: backupError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE companies RENAME TO employees_backup;'
    });

    if (backupError) {
      console.error('❌ Error creando backup:', backupError);
      // Si no se puede renombrar, continuamos con el plan B
    }

    // 2. Crear la nueva tabla companies
    console.log('2. Creando nueva tabla companies...');
    const { error: createCompaniesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS companies (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          industry VARCHAR(100),
          size VARCHAR(50),
          location VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createCompaniesError) {
      console.error('❌ Error creando tabla companies:', createCompaniesError);
    }

    // 3. Crear la nueva tabla employees
    console.log('3. Creando nueva tabla employees...');
    const { error: createEmployeesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS employees (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          position VARCHAR(255),
          department VARCHAR(255),
          role VARCHAR(100),
          employee_id VARCHAR(100),
          phone VARCHAR(50),
          salary DECIMAL(10,2),
          hire_date DATE,
          manager_id UUID REFERENCES employees(id),
          status VARCHAR(50) DEFAULT 'active',
          employee_type VARCHAR(50),
          location VARCHAR(255),
          bio TEXT,
          description TEXT,
          company_id UUID REFERENCES companies(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createEmployeesError) {
      console.error('❌ Error creando tabla employees:', createEmployeesError);
    }

    // 4. Insertar empresas reales
    console.log('4. Insertando empresas reales...');
    const realCompanies = [
      { name: 'Brify AI', industry: 'Tecnología', size: 'Mediana', location: 'Santiago, Chile' },
      { name: 'Microsoft', industry: 'Tecnología', size: 'Grande', location: 'Redmond, WA' },
      { name: 'Google', industry: 'Tecnología', size: 'Grande', location: 'Mountain View, CA' },
      { name: 'Amazon', industry: 'E-commerce', size: 'Grande', location: 'Seattle, WA' },
      { name: 'Apple', industry: 'Tecnología', size: 'Grande', location: 'Cupertino, CA' },
      { name: 'Meta', industry: 'Tecnología', size: 'Grande', location: 'Menlo Park, CA' },
      { name: 'Tesla', industry: 'Automotriz', size: 'Grande', location: 'Austin, TX' },
      { name: 'Netflix', industry: 'Entretenimiento', size: 'Grande', location: 'Los Gatos, CA' },
      { name: 'Spotify', industry: 'Música', size: 'Grande', location: 'Stockholm, Suecia' },
      { name: 'Adobe', industry: 'Software', size: 'Grande', location: 'San Jose, CA' },
      { name: 'Salesforce', industry: 'CRM', size: 'Grande', location: 'San Francisco, CA' },
      { name: 'Oracle', industry: 'Base de Datos', size: 'Grande', location: 'Austin, TX' },
      { name: 'IBM', industry: 'Consultoría TI', size: 'Grande', location: 'Armonk, NY' },
      { name: 'Intel', industry: 'Semiconductores', size: 'Grande', location: 'Santa Clara, CA' },
      { name: 'NVIDIA', industry: 'Hardware', size: 'Grande', location: 'Santa Clara, CA' },
      { name: 'Startup Chile', industry: 'Acceleradora', size: 'Pequeña', location: 'Santiago, Chile' }
    ];

    for (const company of realCompanies) {
      const { error: insertError } = await supabase
        .from('companies')
        .insert([company]);

      if (insertError) {
        console.error(`❌ Error insertando ${company.name}:`, insertError);
      } else {
        console.log(`✅ Empresa ${company.name} creada`);
      }
    }

    // 5. Obtener los IDs de las empresas creadas
    const { data: companiesData, error: fetchError } = await supabase
      .from('companies')
      .select('id, name')
      .order('name');

    if (fetchError) {
      console.error('❌ Error obteniendo empresas:', fetchError);
      return;
    }

    console.log('5. Empresas creadas:', companiesData);

    // 6. Mover algunos empleados de la tabla backup a la nueva tabla employees
    console.log('6. Moviendo empleados a la nueva estructura...');
    
    // Obtener algunos empleados de la tabla backup
    const { data: backupEmployees, error: backupFetchError } = await supabase
      .from('employees_backup')
      .select('*')
      .limit(100);

    if (backupFetchError) {
      console.error('❌ Error obteniendo empleados del backup:', backupFetchError);
    } else {
      // Asignar empleados a empresas aleatoriamente
      for (const employee of backupEmployees.slice(0, 50)) {
        const randomCompany = companiesData[Math.floor(Math.random() * companiesData.length)];
        
        const { error: insertEmployeeError } = await supabase
          .from('employees')
          .insert([{
            name: employee.name,
            email: employee.email,
            position: employee.position,
            department: employee.department,
            role: employee.role,
            employee_id: employee.employee_id,
            phone: employee.phone,
            salary: employee.salary,
            hire_date: employee.hire_date,
            status: employee.status,
            employee_type: employee.employee_type,
            location: employee.location,
            bio: employee.bio,
            description: employee.description,
            company_id: randomCompany.id
          }]);

        if (insertEmployeeError) {
          console.error(`❌ Error insertando empleado ${employee.name}:`, insertEmployeeError);
        }
      }
    }

    console.log('✅ Proceso completado');
    console.log(`📊 Resumen: ${companiesData.length} empresas creadas`);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar script
createRealCompanies();