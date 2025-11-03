import { createClient } from '@supabase/supabase-js';

console.log('🧪 Probando el contador de carpetas con clave de servicio...');

// Configuración de Supabase con clave de servicio
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.1bemvXK8mHpvoA4djXmjtzrtDGFqBY4VBb62QQKuyhw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDashboardWithServiceKey() {
  try {
    console.log('📊 Conectando con clave de servicio a tmqglnycivlcjijoymwe...');
    
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
      console.log('🔧 La modificación de supabaseClient.js debería resolver el problema');
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
    
    console.log('\n🔗 Resumen final:');
    console.log(`   - Base de datos: tmqglnycivlcjijoymwe.supabase.co`);
    console.log(`   - Empleados totales: ${count}`);
    console.log(`   - URL del dashboard: http://localhost:3000/panel-principal`);
    console.log(`   - Contador esperado: 800`);
    console.log(`   - Configuración: Clave de servicio en desarrollo`);
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testDashboardWithServiceKey();