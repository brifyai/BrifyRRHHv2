import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Verificando 800 empleados en la base de datos...');

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyEmployees() {
  try {
    // Contar empleados
    const { count, error: countError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error al contar empleados:', countError);
      return;
    }
    
    console.log(`📊 Total de empleados: ${count || 0}`);
    
    // Contar empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (companiesError) {
      console.error('❌ Error al obtener empresas:', companiesError);
      return;
    }
    
    console.log(`🏢 Total de empresas: ${companies.length}`);
    
    // Mostrar distribución por empresa
    for (const company of companies) {
      const { count: employeeCount, error: empCountError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id);
      
      if (!empCountError) {
        console.log(`   ${company.name}: ${employeeCount || 0} empleados`);
      }
    }
    
    // Mostrar muestra de empleados
    const { data: sample, error: sampleError } = await supabase
      .from('employees')
      .select('name, email, department, position')
      .limit(5);
    
    if (!sampleError && sample) {
      console.log('\n📋 Muestra de empleados:');
      sample.forEach((emp, index) => {
        console.log(`   ${index + 1}. ${emp.name} - ${emp.email}`);
        console.log(`      Depto: ${emp.department} | Cargo: ${emp.position}`);
      });
    }
    
    if (count >= 800) {
      console.log('\n✅ ÉXITO: Hay 800 o más empleados en la base de datos');
      console.log('🎯 El contador de carpetas debería mostrar 800');
    } else {
      console.log(`\n⚠️  Se esperaban 800 empleados, pero hay ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

verifyEmployees();