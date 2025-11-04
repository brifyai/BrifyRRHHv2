import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://hzclkhawjkqgkqjdlzsp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Y2ssaGF3amtxZ2txamRsenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDM5MDcxNSwiZXhwIjoyMDQ5OTY2NzE1fQ.3Tm2b8cYvKr6HtO3HlHv0g9qQh0dE7x8k9oFzWqXjY4';

console.log('🔧 Probando conexión a Supabase...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('📊 Verificando conexión básica...');
    
    // Intentar obtener empresas
    console.log('🏢 Obteniendo empresas...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5);
    
    if (companiesError) {
      console.error('❌ Error al obtener empresas:', companiesError);
      return;
    }
    
    console.log('✅ Empresas encontradas:', companies.length);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
    });
    
    // Verificar empleados actuales
    console.log('\n👥 Verificando empleados actuales...');
    const { count: employeeCount, error: countError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error al contar empleados:', countError);
    } else {
      console.log(`📊 Empleados actuales: ${employeeCount || 0}`);
    }
    
    // Si hay empresas, intentar crear un empleado de prueba
    if (companies.length > 0) {
      console.log('\n🧪 Creando empleado de prueba...');
      const testEmployee = {
        company_id: companies[0].id,
        name: 'Empleado Prueba',
        email: `test${Date.now()}@test.com`,
        phone: '+56 9 12345678',
        region: 'Región Metropolitana',
        department: 'TI',
        level: 'Especialista',
        position: 'Desarrollador',
        work_mode: 'Remoto',
        contract_type: 'Indefinido',
        is_active: true,
        has_subordinates: false
      };
      
      const { data: newEmployee, error: insertError } = await supabase
        .from('employees')
        .insert(testEmployee)
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error al crear empleado de prueba:', insertError);
      } else {
        console.log('✅ Empleado de prueba creado:', newEmployee.name);
        
        // Eliminar empleado de prueba
        const { error: deleteError } = await supabase
          .from('employees')
          .delete()
          .eq('id', newEmployee.id);
        
        if (deleteError) {
          console.error('❌ Error al eliminar empleado de prueba:', deleteError);
        } else {
          console.log('✅ Empleado de prueba eliminado');
        }
      }
    }
    
    console.log('\n🎉 Conexión verificada exitosamente');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack:', error.stack);
  }
}

testConnection();