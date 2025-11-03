/**
 * Script para verificar la estructura actual de la base de datos
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkDatabaseStructure() {
  console.log('🔍 Verificando estructura de la base de datos...\n');
  
  try {
    // Verificar tablas existentes
    console.log('📋 Tablas disponibles:');
    
    const tables = [
      'users',
      'message_analysis',
      'analytics_test_reports',
      'communication_logs',
      'companies',
      'user_credentials',
      'user_tokens_usage'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.code === 'PGRST205') {
          console.log(`   ❌ ${table} - No existe`);
        } else if (error) {
          console.log(`   ⚠️  ${table} - Error: ${error.message}`);
        } else {
          console.log(`   ✅ ${table} - Existe (${data.length > 0 ? 'con datos' : 'vacía'})`);
          
          // Mostrar estructura de la tabla users
          if (table === 'users' && data.length > 0) {
            console.log(`      Columnas: ${Object.keys(data[0]).join(', ')}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ ${table} - Error: ${error.message}`);
      }
    }
    
    // Verificar estructura detallada de users
    console.log('\n👥 Estructura detallada de tabla users:');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('❌ Error obteniendo estructura users:', error);
      } else if (data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log('   Columnas encontradas:');
        columns.forEach(col => console.log(`      - ${col}`));
        
        // Verificar si tiene department
        const hasDepartment = columns.includes('department');
        const hasPosition = columns.includes('position');
        const hasPhone = columns.includes('phone');
        const hasStatus = columns.includes('status');
        
        console.log('\n   Columnas faltantes para empleados completos:');
        if (!hasDepartment) console.log('      - department');
        if (!hasPosition) console.log('      - position');
        if (!hasPhone) console.log('      - phone');
        if (!hasStatus) console.log('      - status');
        
        if (hasDepartment && hasPosition && hasPhone && hasStatus) {
          console.log('   ✅ Estructura completa para empleados');
        }
      } else {
        console.log('   ⚠️ Tabla users vacía');
      }
    } catch (error) {
      console.error('❌ Error verificando users:', error);
    }
    
    // Contar usuarios actuales
    console.log('\n📊 Conteo de usuarios:');
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Error contando usuarios:', error);
      } else {
        console.log(`   Total usuarios: ${count}`);
        
        if (count > 0) {
          // Mostrar ejemplo de usuario
          const { data, error: sampleError } = await supabase
            .from('users')
            .select('*')
            .limit(1);
          
          if (!sampleError && data.length > 0) {
            console.log('   Ejemplo de usuario:');
            Object.entries(data[0]).forEach(([key, value]) => {
              console.log(`      ${key}: ${value}`);
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error en conteo:', error);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar verificación
checkDatabaseStructure();