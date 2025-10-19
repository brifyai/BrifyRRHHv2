import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompanies() {
  console.log('🔍 Verificando empresas en la base de datos...');
  
  try {
    // Obtener todas las empresas
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Error al obtener empresas:', error);
      return;
    }
    
    console.log(`📊 Total de empresas encontradas: ${companies.length}`);
    
    if (companies.length === 0) {
      console.log('⚠️ No hay empresas en la base de datos');
      return;
    }
    
    console.log('\n📋 Lista de empresas:');
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name} - ${company.industry || 'Sin industria'} - ${company.status || 'Sin estado'}`);
    });
    
    // Verificar si hay nombres como "Copec", "Hogar Alemán", etc.
    const expectedCompanies = ['Copec', 'Hogar Alemán', 'Cencosud', 'Falabella', 'Entel', 'Movistar'];
    const foundCompanies = companies.filter(company => 
      expectedCompanies.some(expected => 
        company.name.toLowerCase().includes(expected.toLowerCase())
      )
    );
    
    console.log(`\n🎯 Empresas esperadas encontradas: ${foundCompanies.length}`);
    foundCompanies.forEach(company => {
      console.log(`✅ ${company.name}`);
    });
    
    if (foundCompanies.length === 0) {
      console.log('\n⚠️ No se encontraron las empresas esperadas (Copec, Hogar Alemán, etc.)');
      console.log('💡 Las empresas en la base de datos tienen nombres diferentes a los esperados');
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la verificación
checkCompanies();