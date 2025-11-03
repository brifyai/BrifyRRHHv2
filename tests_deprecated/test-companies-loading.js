import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompaniesLoading() {
  console.log('🔍 Probando carga de empresas desde la base de datos...');
  
  try {
    // 1. Verificar tabla employees
    console.log('\n📋 Verificando tabla employees:');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('company')
      .not('company', 'is', null)
      .not('company', 'eq', '')
      .limit(10);
    
    if (employeesError) {
      console.error('❌ Error en tabla employees:', employeesError);
    } else {
      console.log('✅ Datos en tabla employees:', employees);
      const uniqueCompanies = [...new Set(employees.map(emp => emp.company))];
      console.log('📊 Empresas únicas en employees:', uniqueCompanies);
    }
    
    // 2. Verificar tabla companies
    console.log('\n📋 Verificando tabla companies:');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(10);
    
    if (companiesError) {
      console.error('❌ Error en tabla companies:', companiesError);
    } else {
      console.log('✅ Datos en tabla companies:', companies);
    }
    
    // 3. Listar todas las tablas
    console.log('\n📋 Listando tablas disponibles:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%employee%')
      .or('table_name.like.%company%');
    
    if (tablesError) {
      console.error('❌ Error listando tablas:', tablesError);
    } else {
      console.log('✅ Tablas encontradas:', tables);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testCompaniesLoading();