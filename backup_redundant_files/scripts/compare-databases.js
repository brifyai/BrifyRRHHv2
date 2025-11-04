import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Comparando bases de datos de los diferentes entornos...\n');

// Configuración de bases de datos
const databases = {
  'LOCAL (.env)': {
    url: 'https://hzclkhawjkqgkqjdlzsp.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Y2tsaGF3amtxZ2txamRsenNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzOTA3MTUsImV4cCI6MjA0OTk2NjcxNX0.nHqP6qQyYJmBQJdZjRc9nFzKq8hXJmY7rKq9nFzKq8h'
  },
  'PRODUCCIÓN (.env.production)': {
    url: 'https://tmqglnycivlcjijoymwe.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'
  }
};

async function checkDatabase(name, config) {
  console.log(`📊 Verificando ${name}...`);
  console.log(`   URL: ${config.url}`);
  
  const supabase = createClient(config.url, config.key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Verificar empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5);
    
    if (companiesError) {
      console.log(`   ❌ Error al obtener empresas: ${companiesError.message}`);
      return null;
    }
    
    // Verificar empleados
    const { count: employeeCount, error: employeeError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (employeeError) {
      console.log(`   ❌ Error al contar empleados: ${employeeError.message}`);
      return null;
    }
    
    console.log(`   ✅ Empresas: ${companies.length} (mostrando primeras 5)`);
    console.log(`   ✅ Empleados: ${employeeCount || 0}`);
    
    if (companies.length > 0) {
      console.log('   📋 Empresas encontradas:');
      companies.forEach((company, index) => {
        console.log(`      ${index + 1}. ${company.name} (ID: ${company.id})`);
      });
    }
    
    return {
      name,
      url: config.url,
      companies: companies.length,
      employees: employeeCount || 0,
      sampleCompanies: companies
    };
    
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    return null;
  }
}

async function compareDatabases() {
  console.log('🎯 Análisis de Entornos:\n');
  console.log('📍 http://localhost:3000/panel-principal usa la base de datos LOCAL (.env)');
  console.log('📍 https://brifyrrhhapp.netlify.app/panel-principal usa la base de datos PRODUCCIÓN (.env.production)');
  console.log('');
  
  const results = [];
  
  for (const [name, config] of Object.entries(databases)) {
    const result = await checkDatabase(name, config);
    if (result) {
      results.push(result);
    }
    console.log('');
  }
  
  // Resumen comparativo
  console.log('📈 RESUMEN COMPARATIVO:');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    console.log(`${result.name}:`);
    console.log(`   Base de datos: ${result.url}`);
    console.log(`   Empleados: ${result.employees}`);
    console.log(`   Empresas: ${result.companies}`);
    console.log('');
  });
  
  // Verificar si tienen la misma cantidad de empleados
  if (results.length === 2) {
    const local = results.find(r => r.name.includes('LOCAL'));
    const prod = results.find(r => r.name.includes('PRODUCCIÓN'));
    
    if (local && prod) {
      if (local.employees === prod.employees) {
        console.log('✅ Ambas bases de datos tienen la misma cantidad de empleados');
      } else {
        console.log('⚠️  Las bases de datos tienen diferente cantidad de empleados:');
        console.log(`   Local: ${local.employees} empleados`);
        console.log(`   Producción: ${prod.employees} empleados`);
        console.log('');
        console.log('🔧 Esto explica por qué el contador muestra diferentes valores');
        console.log('   en cada entorno.');
      }
    }
  }
  
  console.log('');
  console.log('🎯 Conclusión:');
  console.log('   - Cada entorno apunta a una base de datos diferente');
  console.log('   - Para que ambos muestren lo mismo, deben sincronizarse');
  console.log('   - O configurar ambos entornos para usar la misma base de datos');
}

compareDatabases().catch(console.error);