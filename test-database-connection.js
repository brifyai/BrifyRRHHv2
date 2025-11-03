#!/usr/bin/env node

// Script para probar la conexión a la nueva base de datos BrifyRRHH
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Probando conexión a la base de datos BrifyRRHH...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '✅ Configurada' : '❌ No configurada');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas correctamente');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n📊 Probando conexión básica...');
    
    // Probar conexión básica
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error en conexión básica:', error);
      return false;
    }
    
    console.log('✅ Conexión básica exitosa');
    
    // Probar obtener empresas
    console.log('\n🏢 Probando obtención de empresas...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(5);
    
    if (companiesError) {
      console.error('❌ Error obteniendo empresas:', companiesError);
      return false;
    }
    
    console.log(`✅ Se encontraron ${companies.length} empresas`);
    companies.forEach(company => {
      console.log(`   - ${company.name} (${company.is_active ? 'Activa' : 'Inactiva'})`);
    });
    
    // Probar obtener empleados
    console.log('\n👥 Probando obtención de empleados...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .limit(5);
    
    if (employeesError) {
      console.error('❌ Error obteniendo empleados:', employeesError);
      return false;
    }
    
    console.log(`✅ Se encontraron ${employees.length} empleados`);
    employees.forEach(employee => {
      console.log(`   - ${employee.name} (${employee.email})`);
    });
    
    // Probar obtener usuarios
    console.log('\n👤 Probando obtención de usuarios...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError);
      return false;
    }
    
    console.log(`✅ Se encontraron ${users.length} usuarios`);
    users.forEach(user => {
      console.log(`   - ${user.email}`);
    });
    
    console.log('\n🎉 Todas las pruebas de conexión exitosas!');
    console.log('✅ La base de datos BrifyRRHH está completamente conectada y funcionando');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error general en pruebas:', error);
    return false;
  }
}

// Ejecutar pruebas
testConnection().then(success => {
  if (success) {
    console.log('\n🚀 El sistema está listo para usar solo la nueva base de datos BrifyRRHH');
    process.exit(0);
  } else {
    console.log('\n💥 Hubo problemas con la conexión a la base de datos');
    process.exit(1);
  }
});