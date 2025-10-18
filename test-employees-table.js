import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmployeesTable() {
  console.log('🔍 Verificando estructura y datos de la tabla employees...');
  
  try {
    // 1. Verificar si existe la tabla employees y obtener algunos registros
    console.log('\n📋 Verificando tabla employees:');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .limit(5);
    
    if (employeesError) {
      console.error('❌ Error en tabla employees:', employeesError);
    } else {
      console.log('✅ Estructura de employees:', employees);
      if (employees.length > 0) {
        console.log('📊 Columnas disponibles:', Object.keys(employees[0]));
      }
    }
    
    // 2. Verificar si hay company_id o company_name
    console.log('\n📋 Buscando campos de empresa:');
    const { data: companyFields, error: companyFieldsError } = await supabase
      .from('employees')
      .select('company_id, company_name, company')
      .limit(5);
    
    if (companyFieldsError) {
      console.error('❌ Error buscando campos de empresa:', companyFieldsError);
    } else {
      console.log('✅ Campos de empresa encontrados:', companyFields);
    }
    
    // 3. Contar total de registros
    console.log('\n📊 Contando registros:');
    const { count, error: countError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error contando registros:', countError);
    } else {
      console.log(`✅ Total de registros en employees: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testEmployeesTable();