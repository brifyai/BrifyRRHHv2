import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyUpdatedCompanies() {
  console.log('🔍 Verificando empresas que deberían haber sido actualizadas...');
  
  try {
    // Buscar específicamente las empresas que deberían tener los nuevos nombres
    const expectedCompanies = ['Copec', 'Hogar Alemán', 'Falabella', 'Cencosud', 'Entel', 'Movistar', 'Banco de Chile', 'Santander', 'BCI', 'Scotiabank', 'Itaú', 'Latam Airlines', 'Codelco', 'Ariztia', 'Inchcape', 'Achs'];
    
    console.log('\n🎯 Buscando empresas con los nombres esperados:');
    
    for (const companyName of expectedCompanies) {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('name', companyName)
        .limit(1);
      
      if (!error && data && data.length > 0) {
        console.log(`✅ Encontrada: ${companyName}`);
        console.log(`   ID: ${data[0].id}`);
        console.log(`   Nombre: ${data[0].name}`);
        console.log(`   Estado: ${data[0].status}`);
      } else {
        console.log(`❌ No encontrada: ${companyName}`);
      }
    }
    
    // También verificar si hay algún registro que tenga un nombre diferente a "Empleado X"
    console.log('\n🔍 Buscando registros que NO comiencen con "Empleado":');
    const { data: nonEmployeeRecords, error: searchError } = await supabase
      .from('companies')
      .select('id, name')
      .not('name', 'like', 'Empleado%')
      .limit(20);
    
    if (!searchError && nonEmployeeRecords && nonEmployeeRecords.length > 0) {
      console.log(`✅ Encontrados ${nonEmployeeRecords.length} registros que no son "Empleado":`);
      nonEmployeeRecords.forEach((record, index) => {
        console.log(`${index + 1}. ${record.name} (ID: ${record.id})`);
      });
    } else {
      console.log('❌ No se encontraron registros que no comiencen con "Empleado"');
    }
    
    // Verificar los primeros 20 registros ordenados por ID para ver si hay cambios
    console.log('\n📋 Primeros 20 registros ordenados por ID:');
    const { data: firstRecords, error: firstError } = await supabase
      .from('companies')
      .select('id, name')
      .order('id', { ascending: true })
      .limit(20);
    
    if (!firstError && firstRecords) {
      firstRecords.forEach((record, index) => {
        console.log(`${index + 1}. ${record.name} (ID: ${record.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la verificación
verifyUpdatedCompanies();