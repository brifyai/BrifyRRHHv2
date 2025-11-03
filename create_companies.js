const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tmqglnycivlcjijoymwe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'
);

const companies = [
  'Ariztia', 'Inchcape', 'Copec', 'CMPC', 'Achs', 'Arcoprime',
  'Grupo Saesa', 'Colbun', 'AFP Habitat', 'Antofagasta Minerals',
  'Vida Cámara', 'Enaex', 'SQM', 'Corporación Chilena',
  'Hogar Alemán', 'Empresas SB'
];

async function createCompanies() {
  console.log('Creando compañías...');

  for (const companyName of companies) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({ name: companyName })
        .select();

      if (error) {
        console.log(`Compañía ${companyName} ya existe o error:`, error.message);
      } else {
        console.log(`✅ Compañía ${companyName} creada`);
      }
    } catch (err) {
      console.error(`Error creando ${companyName}:`, err.message);
    }
  }

  console.log('Verificando compañías creadas...');
  const { data, error } = await supabase
    .from('companies')
    .select('name')
    .order('name');

  if (error) {
    console.error('Error verificando:', error);
  } else {
    console.log(`Total compañías: ${data.length}`);
    console.log('Compañías:', data.map(c => c.name));
  }
}

createCompanies();