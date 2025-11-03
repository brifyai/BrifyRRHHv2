import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Verificando estructura de tablas en Supabase...');
  
  try {
    // Verificar estructura de la tabla companies
    console.log('\n📊 Estructura de la tabla companies:');
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);
    
    if (companiesError) {
      console.error('❌ Error al obtener estructura de companies:', companiesError);
    } else if (companiesData && companiesData.length > 0) {
      console.log('Columnas en companies:', Object.keys(companiesData[0]));
      console.log('Datos de ejemplo:', companiesData[0]);
    }
    
    // Buscar tablas que puedan contener "achs" o empresas reales
    console.log('\n🔍 Buscando posibles tablas con datos de empresas:');
    
    // Intentar obtener información de todas las tablas posibles
    const possibleTables = [
      'companies',
      'empresas', 
      'company',
      'empresa',
      'organizations',
      'organization'
    ];
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error && data && data.length > 0) {
          console.log(`✅ Tabla encontrada: ${tableName}`);
          console.log(`   Columnas: ${Object.keys(data[0]).join(', ')}`);
          console.log(`   Registro ejemplo:`, data[0]);
          
          // Buscar si hay alguna empresa con nombre real
          const { data: realCompanies, error: searchError } = await supabase
            .from(tableName)
            .select('*')
            .or('name.ilike.%Copec%,name.ilike.%Falabella%,name.ilike.%Cencosud%,name.ilike.%Entel%,name.ilike.%Achs%')
            .limit(5);
          
          if (!searchError && realCompanies && realCompanies.length > 0) {
            console.log(`   🎯 Empresas reales encontradas en ${tableName}:`);
            realCompanies.forEach(company => {
              console.log(`     - ${company.name || company.nombre || 'Sin nombre'}`);
            });
          }
        }
      } catch (err) {
        // Ignorar errores de tablas que no existen
      }
    }
    
    // Verificar cuántas empresas hay y sus nombres actuales
    console.log('\n📋 Análisis de empresas actuales:');
    const { data: allCompanies, error: allError } = await supabase
      .from('companies')
      .select('id, name, status')
      .order('name', { ascending: true })
      .limit(20);
    
    if (!allError && allCompanies) {
      console.log(`Total de empresas: ${allCompanies.length}`);
      console.log('Primeras 20 empresas:');
      allCompanies.forEach((company, index) => {
        console.log(`${index + 1}. ${company.name} (${company.status || 'sin estado'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la verificación
checkTableStructure();
