// Script para verificar la estructura de la base de datos
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
  console.log('🔍 Verificando estructura de la base de datos...');
  
  try {
    // Verificar tabla companies
    console.log('\n📋 Verificando tabla companies...');
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(5);
    
    if (companiesError) {
      console.error('❌ Error en tabla companies:', companiesError);
    } else {
      console.log('✅ Tabla companies encontrada');
      console.log(`📊 Total de empresas: ${companiesData.length}`);
      if (companiesData.length > 0) {
        console.log('Ejemplo de empresa:', companiesData[0]);
      }
    }
    
    // Verificar tabla users
    console.log('\n👥 Verificando tabla users...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, company, company_id')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error en tabla users:', usersError);
    } else {
      console.log('✅ Tabla users encontrada');
      console.log(`📊 Total de usuarios (muestra): ${usersData.length}`);
      if (usersData.length > 0) {
        console.log('Ejemplo de usuario:', usersData[0]);
      }
    }
    
    // Verificar columnas en tabla users
    console.log('\n🔎 Verificando columnas en tabla users...');
    const { data: columnsData, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' });
    
    if (columnsError) {
      console.error('❌ Error obteniendo columnas:', columnsError);
      
      // Alternativa: intentar obtener un usuario y ver sus propiedades
      console.log('\n🔄 Intentando alternativa para verificar columnas...');
      const { data: sampleUser, error: sampleError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Error obteniendo usuario de muestra:', sampleError);
      } else if (sampleUser && sampleUser.length > 0) {
        console.log('✅ Columnas encontradas:', Object.keys(sampleUser[0]));
      }
    } else {
      console.log('✅ Columnas de users:', columnsData);
    }
    
    // Verificar empresas únicas en la columna company de users
    console.log('\n🏢 Verificando empresas únicas en tabla users...');
    const { data: uniqueCompanies, error: uniqueError } = await supabase
      .from('users')
      .select('company')
      .not('company', 'is', null);
    
    if (uniqueError) {
      console.error('❌ Error obteniendo empresas únicas:', uniqueError);
    } else {
      const companies = [...new Set(uniqueCompanies.map(u => u.company).filter(Boolean))];
      console.log(`✅ Se encontraron ${companies.length} empresas únicas:`);
      companies.slice(0, 10).forEach((company, index) => {
        console.log(`  ${index + 1}. ${company}`);
      });
      if (companies.length > 10) {
        console.log(`  ... y ${companies.length - 10} más`);
      }
    }
    
    // Contar empleados por empresa
    console.log('\n📈 Contando empleados por empresa...');
    const { data: employeeCounts, error: countError } = await supabase
      .from('users')
      .select('company')
      .not('company', 'is', null);
    
    if (countError) {
      console.error('❌ Error contando empleados:', countError);
    } else {
      const counts = {};
      employeeCounts.forEach(emp => {
        if (emp.company) {
          counts[emp.company] = (counts[emp.company] || 0) + 1;
        }
      });
      
      console.log('Empleados por empresa:');
      Object.entries(counts).slice(0, 10).forEach(([company, count]) => {
        console.log(`  ${company}: ${count} empleados`);
      });
      
      const totalEmployees = Object.values(counts).reduce((sum, count) => sum + count, 0);
      console.log(`\n📊 Total de empleados con empresa asignada: ${totalEmployees}`);
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la verificación
checkDatabaseStructure();