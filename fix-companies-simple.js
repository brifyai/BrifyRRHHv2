import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Empresas reales que deberían estar en la base de datos
const realCompanies = [
  'Copec',
  'Hogar Alemán', 
  'Falabella',
  'Cencosud',
  'Entel',
  'Movistar',
  'Banco de Chile',
  'Santander',
  'BCI',
  'Scotiabank',
  'Itaú',
  'Latam Airlines',
  'Codelco',
  'Ariztia',
  'Inchcape',
  'Achs'
];

async function fixCompaniesSimple() {
  console.log('🔄 Actualizando nombres de empresas (versión simple)...');
  
  try {
    // Obtener los primeros 16 registros
    const { data: existingCompanies, error: fetchError } = await supabase
      .from('companies')
      .select('id, name')
      .order('id', { ascending: true })
      .limit(16);
    
    if (fetchError) {
      console.error('❌ Error al obtener empresas:', fetchError);
      return;
    }
    
    console.log(`📊 Se encontraron ${existingCompanies.length} empresas para actualizar`);
    
    // Actualizar cada empresa con los nombres correctos
    for (let i = 0; i < existingCompanies.length && i < realCompanies.length; i++) {
      const company = existingCompanies[i];
      const realCompanyName = realCompanies[i];
      
      console.log(`🔄 Actualizando "${company.name}" -> "${realCompanyName}"`);
      
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          name: realCompanyName,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id);
      
      if (updateError) {
        console.error(`❌ Error actualizando empresa ${company.id}:`, updateError);
      } else {
        console.log(`✅ Empresa "${realCompanyName}" actualizada correctamente`);
      }
    }
    
    console.log('\n🎉 Actualización completada');
    
    // Verificar los resultados
    const { data: updatedCompanies, error: verifyError } = await supabase
      .from('companies')
      .select('id, name')
      .order('id', { ascending: true })
      .limit(16);
    
    if (verifyError) {
      console.error('❌ Error al verificar actualización:', verifyError);
    } else {
      console.log('\n📋 Empresas actualizadas:');
      updatedCompanies.forEach((company, index) => {
        console.log(`${index + 1}. ${company.name}`);
      });
    }
    
    // Contar el total de registros en la tabla
    const { count, error: countError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`\n📈 Total de registros en la tabla companies: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la actualización
fixCompaniesSimple();