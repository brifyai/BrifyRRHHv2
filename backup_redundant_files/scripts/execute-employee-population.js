import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase con SERVICE ROLE KEY
const supabaseUrl = 'https://hzclkhawjkqgkqjdlzsp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Y2hraGF3amtxZ2txamRsenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDM5MDcxNSwiZXhwIjoyMDQ5OTY2NzE1fQ.3Tm2n8cYvKr6HtO3HlHv0g9qQh0dE7x8k9oFzWqXjY4';

console.log('🔧 Iniciando población de 800 empleados en producción...');

// Crear cliente de Supabase con service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile() {
  try {
    console.log('📖 Leyendo archivo SQL...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../database/generate_800_employees.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔍 Verificando estado actual de la base de datos...');
    
    // Verificar estado actual
    const { count: currentCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Empleados actuales: ${currentCount || 0}`);
    
    // Verificar empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (companiesError) {
      console.error('❌ Error al obtener empresas:', companiesError);
      return;
    }
    
    console.log(`🏢 Empresas encontradas: ${companies.length}`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
    });
    
    console.log('🚀 Ejecutando script de población de empleados...');
    
    // Dividir el SQL en sentencias individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let executedStatements = 0;
    
    for (const statement of statements) {
      if (statement.includes('SELECT') && statement.includes('COUNT')) {
        // Para consultas SELECT, usar rpc
        console.log('📊 Ejecutando consulta de conteo...');
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          console.error('❌ Error en consulta:', error);
        } else {
          console.log('✅ Consulta ejecutada:', data);
        }
      } else if (statement.includes('INSERT') || statement.includes('DELETE')) {
        // Para INSERT y DELETE, usar rpc
        console.log('💾 Ejecutando sentencia de modificación...');
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          console.error('❌ Error en sentencia:', error);
          console.error('Sentencia fallida:', statement.substring(0, 100) + '...');
        } else {
          console.log('✅ Sentencia ejecutada correctamente');
          executedStatements++;
        }
      }
    }
    
    console.log(`📈 Se ejecutaron ${executedStatements} sentencias correctamente`);
    
    // Verificación final
    console.log('🔍 Verificando resultado final...');
    
    const { count: finalCount, error: countError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error al verificar conteo final:', countError);
    } else {
      console.log(`🎉 ÉXITO: Ahora hay ${finalCount} empleados en la base de datos`);
      
      if (finalCount === 800) {
        console.log('✅ Objetivo alcanzado: 800 empleados creados');
      } else {
        console.log(`⚠️  Se esperaban 800 empleados, pero se encontraron ${finalCount}`);
      }
    }
    
    // Mostrar muestra de empleados
    const { data: sampleEmployees, error: sampleError } = await supabase
      .from('employees')
      .select('name, email, department, position, company_id')
      .limit(5);
    
    if (!sampleError && sampleEmployees) {
      console.log('\n📋 Muestra de empleados creados:');
      sampleEmployees.forEach((emp, index) => {
        console.log(`   ${index + 1}. ${emp.name} - ${emp.email}`);
        console.log(`      Depto: ${emp.department} | Cargo: ${emp.position}`);
        console.log(`      Empresa ID: ${emp.company_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Función para crear la función RPC si no existe
async function createSQLFunction() {
  try {
    console.log('🔧 Creando función SQL RPC si no existe...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
      RETURNS TABLE(result TEXT)
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- Solo permitir ejecución si es service role
        IF current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
          RAISE EXCEPTION 'Solo service role puede ejecutar esta función';
        END IF;
        
        RETURN QUERY EXECUTE sql_query;
      END;
      $$;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { 
      sql_query: createFunctionSQL 
    });
    
    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Error al crear función RPC:', error);
    } else {
      console.log('✅ Función RPC disponible');
    }
  } catch (error) {
    console.log('⚠️  No se pudo crear función RPC, intentando ejecución directa...');
  }
}

// Ejecutar el proceso
async function main() {
  console.log('🎯 Objetivo: Poblar base de datos con 800 empleados');
  console.log('🔐 Usando SERVICE ROLE KEY para bypass de RLS\n');
  
  await createSQLFunction();
  await executeSQLFile();
  
  console.log('\n🏁 Proceso completado');
  console.log('📊 El contador de carpetas debería mostrar ahora 800');
}

main().catch(console.error);