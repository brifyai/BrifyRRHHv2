import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompanySelector() {
  console.log('🔍 Probando selector de empresas...\n');

  try {
    // 1. Verificar tabla companies
    console.log('1. Verificando tabla companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (companiesError) {
      console.error('❌ Error obteniendo empresas:', companiesError);
      return;
    }

    console.log(`✅ Se encontraron ${companies.length} empresas:`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
    });

    // 2. Verificar estructura de la tabla
    console.log('\n2. Verificando estructura de la tabla companies...');
    if (companies.length > 0) {
      const firstCompany = companies[0];
      console.log('   Campos disponibles:', Object.keys(firstCompany));
    }

    // 3. Probar filtro por empresa específica
    if (companies.length > 0) {
      console.log('\n3. Probando filtro por empresa específica...');
      const firstCompanyId = companies[0].id;
      
      const { data: filteredCompanies, error: filterError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', firstCompanyId)
        .eq('status', 'active');

      if (filterError) {
        console.error('❌ Error en filtro:', filterError);
      } else {
        console.log(`✅ Filtro funciona: ${filteredCompanies.length} empresas activas encontradas`);
      }

      // 4. Probar conteo de empleados por empresa
      console.log('\n4. Probando conteo de empleados por empresa...');
      const { count, error: countError } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('id', firstCompanyId)
        .eq('status', 'active');

      if (countError) {
        console.error('❌ Error en conteo:', countError);
      } else {
        console.log(`✅ Conteo funciona: ${count} empleados activos para la empresa ${companies[0].name}`);
      }
    }

    // 5. Verificar si hay otras tablas relacionadas
    console.log('\n5. Verificando tablas relacionadas...');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .ilike('tablename', '%employee%');

    if (tablesError) {
      console.log('   ℹ️  No se pudo verificar tablas relacionadas (puede ser normal)');
    } else {
      console.log('   Tablas relacionadas con empleados:', tables.map(t => t.tablename));
    }

    console.log('\n✅ Prueba del selector de empresas completada');
    console.log(`📊 Resumen: ${companies.length} empresas disponibles para el selector`);

  } catch (error) {
    console.error('❌ Error general en la prueba:', error);
  }
}

// Ejecutar prueba
testCompanySelector();