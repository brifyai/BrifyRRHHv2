import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeDatabaseStructure() {
  console.log('🔍 ANALISIS COMPLETO DE LA ESTRUCTURA DE LA BASE DE DATOS');
  console.log('=' .repeat(60));
  
  // Lista de tablas probables basadas en los archivos del proyecto
  const probableTables = [
    'users',
    'companies', 
    'employees',
    'folders',
    'documents',
    'communication_logs',
    'user_credentials',
    'user_tokens_usage',
    'drive_notifications',
    'watch_channels',
    'sentiment_analysis',
    'extensions',
    'rutinas_usuarios',
    'documentos_usuario_entrenador',
    'sub_carpetas_administrador'
  ];
  
  console.log('\n📊 ANALIZANDO TABLAS EXISTENTES:');
  console.log('-'.repeat(40));
  
  const existingTables = [];
  const tableStructures = {};
  
  for (const tableName of probableTables) {
    try {
      console.log(`\n🔍 Analizando tabla: ${tableName}`);
      
      // Intentar obtener estructura y datos de muestra
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ Tabla no accesible: ${error.message}`);
        continue;
      }
      
      console.log(`   ✅ Tabla encontrada - Registros: ${count || 0}`);
      existingTables.push(tableName);
      
      // Obtener estructura detallada
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!sampleError && sampleData && sampleData.length > 0) {
        const columns = Object.keys(sampleData[0]);
        console.log(`   📋 Columnas (${columns.length}): ${columns.join(', ')}`);
        
        // Guardar estructura para análisis posterior
        tableStructures[tableName] = {
          columns,
          sampleData: sampleData[0],
          recordCount: count || 0
        };
        
        // Mostrar datos de muestra formateados
        console.log('   📄 Datos de muestra:');
        Object.entries(sampleData[0]).forEach(([key, value]) => {
          const displayValue = typeof value === 'string' && value.length > 50 
            ? value.substring(0, 50) + '...' 
            : value;
          console.log(`      ${key}: ${displayValue}`);
        });
      }
      
    } catch (err) {
      console.log(`   ❌ Error analizando ${tableName}: ${err.message}`);
    }
  }
  
  console.log('\n\n📋 RESUMEN DE TABLAS ENCONTRADAS:');
  console.log('-'.repeat(40));
  existingTables.forEach((table, index) => {
    const structure = tableStructures[table];
    console.log(`${index + 1}. ${table} (${structure?.recordCount || 0} registros, ${structure?.columns?.length || 0} columnas)`);
  });
  
  console.log('\n\n🚨 PROBLEMAS IDENTIFICADOS:');
  console.log('-'.repeat(40));
  
  // Analizar problemas específicos
  if (tableStructures.companies) {
    console.log('❌ TABLA "companies":');
    console.log(`   - Tiene ${tableStructures.companies.recordCount} registros`);
    console.log(`   - Debería ser empresas, pero contiene datos de empleados`);
    console.log(`   - Columnas: ${tableStructures.companies.columns.join(', ')}`);
    
    // Verificar si hay nombres que parezcan de empleados
    const { data: employeeNames } = await supabase
      .from('companies')
      .select('name')
      .like('name', 'Empleado%')
      .limit(5);
    
    if (employeeNames && employeeNames.length > 0) {
      console.log(`   - Ejemplos de nombres: ${employeeNames.map(e => e.name).join(', ')}`);
    }
  }
  
  // Buscar tablas que podrían contener empresas reales
  console.log('\n🔍 BUSCANDO EMPRESAS REALES:');
  const realCompanyNames = ['Copec', 'Falabella', 'Cencosud', 'Entel', 'Movistar', 'Banco de Chile', 'Santander', 'BCI'];
  
  for (const tableName of existingTables) {
    for (const companyName of realCompanyNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .or(`name.ilike.%${companyName}%,nombre.ilike.%${companyName}%`)
          .limit(1);
        
        if (!error && data && data.length > 0) {
          console.log(`   ✅ Empresa "${companyName}" encontrada en tabla "${tableName}"`);
        }
      } catch (err) {
        // Ignorar errores
      }
    }
  }
  
  console.log('\n\n📊 ESTADÍSTICAS GENERALES:');
  console.log('-'.repeat(40));
  let totalRecords = 0;
  existingTables.forEach(table => {
    const count = tableStructures[table]?.recordCount || 0;
    totalRecords += count;
    console.log(`${table}: ${count} registros`);
  });
  console.log(`TOTAL: ${totalRecords} registros en todas las tablas`);
  
  return {
    existingTables,
    tableStructures,
    totalRecords
  };
}

// Ejecutar análisis
analyzeDatabaseStructure().then(result => {
  console.log('\n\n✅ ANÁLISIS COMPLETADO');
  console.log('Resultados guardados para siguiente paso de reestructuración');
}).catch(error => {
  console.error('❌ Error en el análisis:', error);
});