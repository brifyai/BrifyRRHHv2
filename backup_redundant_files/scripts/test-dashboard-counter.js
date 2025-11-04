import { createClient } from '@supabase/supabase-js';

console.log('🧪 Probando el contador de carpetas del dashboard...');

// Configuración de Supabase para PRODUCCIÓN (misma que usa la app React)
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDashboardCounter() {
  try {
    console.log('📊 Conectando a la base de datos tmqglnycivlcjijoymwe...');
    
    // Contar empleados (como lo hace el dashboard)
    const { count, error } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error al contar empleados:', error);
      return;
    }
    
    console.log(`📈 Total de empleados encontrados: ${count}`);
    
    // Verificar si el contador es 800
    if (count === 800) {
      console.log('✅ ÉXITO: El contador debería mostrar 800 en el dashboard');
      console.log('🎯 La aplicación en http://localhost:3000/panel-principal debería mostrar 800 carpetas');
    } else if (count > 0) {
      console.log(`⚠️  Se encontraron ${count} empleados, pero se esperaban 800`);
    } else {
      console.log('❌ No se encontraron empleados');
    }
    
    // Obtener muestra de datos para verificar
    const { data: sample, error: sampleError } = await supabase
      .from('employees')
      .select('name, email, department, position')
      .limit(3);
    
    if (!sampleError && sample && sample.length > 0) {
      console.log('\n📋 Muestra de empleados:');
      sample.forEach((emp, index) => {
        console.log(`   ${index + 1}. ${emp.name} - ${emp.email}`);
        console.log(`      Depto: ${emp.department} | Cargo: ${emp.position}`);
      });
    }
    
    // Verificar conexión con empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5);
    
    if (!companiesError && companies && companies.length > 0) {
      console.log('\n🏢 Muestra de empresas:');
      companies.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
      });
    }
    
    console.log('\n🔗 Resumen:');
    console.log(`   - Base de datos: tmqglnycivlcjijoymwe.supabase.co`);
    console.log(`   - Empleados totales: ${count}`);
    console.log(`   - URL del dashboard: http://localhost:3000/panel-principal`);
    console.log(`   - Contador esperado: 800`);
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testDashboardCounter();