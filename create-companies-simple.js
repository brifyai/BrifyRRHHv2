import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCompaniesSimple() {
  console.log('🏢 Creando empresas simples...');

  try {
    // 1. Crear tabla de empresas reales
    console.log('1. Creando tabla real_companies...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS real_companies (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          industry VARCHAR(100),
          size VARCHAR(50),
          location VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.error('❌ Error creando tabla real_companies:', createError);
    }

    // 2. Insertar empresas reales
    console.log('2. Insertando empresas reales...');
    const realCompanies = [
      { name: 'Brify AI', industry: 'Tecnología', size: 'Mediana', location: 'Santiago, Chile' },
      { name: 'Microsoft', industry: 'Tecnología', size: 'Grande', location: 'Redmond, WA' },
      { name: 'Google', industry: 'Tecnología', size: 'Grande', location: 'Mountain View, CA' },
      { name: 'Amazon', industry: 'E-commerce', size: 'Grande', location: 'Seattle, WA' },
      { name: 'Apple', industry: 'Tecnología', size: 'Grande', location: 'Cupertino, CA' },
      { name: 'Meta', industry: 'Tecnología', size: 'Grande', location: 'Menlo Park, CA' },
      { name: 'Tesla', industry: 'Automotriz', size: 'Grande', location: 'Austin, TX' },
      { name: 'Netflix', industry: 'Entretenimiento', size: 'Grande', location: 'Los Gatos, CA' },
      { name: 'Spotify', industry: 'Música', size: 'Grande', location: 'Stockholm, Suecia' },
      { name: 'Adobe', industry: 'Software', size: 'Grande', location: 'San Jose, CA' },
      { name: 'Salesforce', industry: 'CRM', size: 'Grande', location: 'San Francisco, CA' },
      { name: 'Oracle', industry: 'Base de Datos', size: 'Grande', location: 'Austin, TX' },
      { name: 'IBM', industry: 'Consultoría TI', size: 'Grande', location: 'Armonk, NY' },
      { name: 'Intel', industry: 'Semiconductores', size: 'Grande', location: 'Santa Clara, CA' },
      { name: 'NVIDIA', industry: 'Hardware', size: 'Grande', location: 'Santa Clara, CA' },
      { name: 'Startup Chile', industry: 'Acceleradora', size: 'Pequeña', location: 'Santiago, Chile' }
    ];

    for (const company of realCompanies) {
      const { error: insertError } = await supabase
        .from('real_companies')
        .insert([company]);

      if (insertError) {
        console.error(`❌ Error insertando ${company.name}:`, insertError);
      } else {
        console.log(`✅ Empresa ${company.name} creada`);
      }
    }

    // 3. Verificar empresas creadas
    const { data: companiesData, error: fetchError } = await supabase
      .from('real_companies')
      .select('*')
      .order('name');

    if (fetchError) {
      console.error('❌ Error obteniendo empresas:', fetchError);
      return;
    }

    console.log('✅ Proceso completado');
    console.log(`📊 Resumen: ${companiesData.length} empresas creadas`);
    console.log('Empresas disponibles:', companiesData.map(c => c.name));

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar script
createCompaniesSimple();