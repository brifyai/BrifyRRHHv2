import { createClient } from '@supabase/supabase-js';

console.log('🔍 Verificando conteo de empleados en base de datos tmqglnycivlcjijoymwe...');

// Configuración de Supabase para PRODUCCIÓN
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.1bemvXK8mHpvoA4djXmjtzrtDGFqBY4VBb62QQKuyhw';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkEmployeeCount() {
  try {
    // Contar empleados
    const { count, error } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error al contar empleados:', error);
      return;
    }
    
    console.log(`📊 Total de empleados: ${count || 0}`);
    
    // Obtener distribución por empresa
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, employees(count)');
    
    if (companiesError) {
      console.error('❌ Error al obtener empresas:', companiesError);
    } else {
      console.log('\n🏢 Distribución por empresa:');
      companies.forEach((company, index) => {
        const employeeCount = company.employees || 0;
        console.log(`   ${index + 1}. ${company.name}: ${employeeCount} empleados`);
      });
    }
    
    // Verificar si el contador coincide con 800
    if (count >= 800) {
      console.log('\n✅ ÉXITO: Hay 800+ empleados en la base de datos');
      console.log('🎯 El contador de carpetas debería mostrar 800');
    } else {
      console.log(`\n⚠️  Se esperaban 800 empleados, pero hay ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkEmployeeCount();