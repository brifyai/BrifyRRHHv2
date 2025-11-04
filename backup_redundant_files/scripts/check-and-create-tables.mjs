#!/usr/bin/env node

// Script para verificar y crear tablas si no existen
// Este script debe ejecutarse con una service key válida

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

console.log('🔍 Verificando y creando tablas si no existen...');

// Configurar cliente de Supabase con service key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Por favor asegúrate de tener REACT_APP_SUPABASE_URL y SUPABASE_SERVICE_KEY en tu .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Verificar si las tablas existen
async function checkTables() {
  try {
    console.log('📋 Verificando si las tablas existen...');
    
    // Verificar tabla companies
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    
    if (companiesError) {
      console.log('❌ Tabla companies no existe o no es accesible');
      return false;
    }
    
    // Verificar tabla employees
    const { data: employeesData, error: employeesError } = await supabase
      .from('employees')
      .select('id')
      .limit(1);
    
    if (employeesError) {
      console.log('❌ Tabla employees no existe o no es accesible');
      return false;
    }
    
    console.log('✅ Ambas tablas existen');
    return true;
  } catch (error) {
    console.error('❌ Error verificando tablas:', error.message);
    return false;
  }
}

// Crear tablas si no existen
async function createTables() {
  try {
    console.log('🔧 Creando tablas...');
    
    // Crear tabla companies
    const { error: companiesError } = await supabase.rpc('create_companies_table');
    
    if (companiesError) {
      console.log('ℹ️  La función create_companies_table no existe, creando tabla manualmente...');
      
      // Crear tabla companies manualmente
      const companiesTableSQL = `
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createCompaniesError } = await supabase.rpc('execute_sql', { sql: companiesTableSQL });
      if (createCompaniesError) {
        console.error('❌ Error creando tabla companies:', createCompaniesError);
        throw createCompaniesError;
      }
    }
    
    // Crear tabla employees
    const { error: employeesError } = await supabase.rpc('create_employees_table');
    
    if (employeesError) {
      console.log('ℹ️  La función create_employees_table no existe, creando tabla manualmente...');
      
      // Crear tabla employees manualmente
      const employeesTableSQL = `
        CREATE TABLE IF NOT EXISTS employees (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID NOT NULL REFERENCES companies(id),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20),
          region VARCHAR(100),
          department VARCHAR(100),
          level VARCHAR(50),
          position VARCHAR(100),
          work_mode VARCHAR(20),
          contract_type VARCHAR(50),
          is_active BOOLEAN DEFAULT true,
          has_subordinates BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createEmployeesError } = await supabase.rpc('execute_sql', { sql: employeesTableSQL });
      if (createEmployeesError) {
        console.error('❌ Error creando tabla employees:', createEmployeesError);
        throw createEmployeesError;
      }
    }
    
    console.log('✅ Tablas creadas exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
    return false;
  }
}

// Insertar empresas de ejemplo
async function insertCompanies() {
  try {
    console.log('🏢 Insertando empresas de ejemplo...');
    
    const companies = [
      'Ariztia',
      'Inchcape',
      'Achs',
      'Arcoprime',
      'Grupo Saesa',
      'Colbun',
      'AFP Habitat',
      'Copec',
      'Antofagasta Minerals',
      'Vida Cámara',
      'Enaex',
      'SQM',
      'CMPC',
      'Corporación Chilena - Alemana',
      'Hogar Alemán',
      'Empresas SB'
    ];
    
    const companyData = companies.map(name => ({ name }));
    
    const { error } = await supabase
      .from('companies')
      .upsert(companyData, { onConflict: 'name' });
    
    if (error) {
      console.error('❌ Error insertando empresas:', error);
      throw error;
    }
    
    console.log(`✅ ${companies.length} empresas insertadas`);
    return true;
  } catch (error) {
    console.error('❌ Error insertando empresas:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando verificación y creación de tablas...');
    
    // Verificar si las tablas existen
    const tablesExist = await checkTables();
    
    if (!tablesExist) {
      console.log('🔧 Creando tablas...');
      const tablesCreated = await createTables();
      
      if (!tablesCreated) {
        console.log('❌ No se pudieron crear las tablas');
        process.exit(1);
      }
      
      console.log('🏢 Insertando empresas...');
      const companiesInserted = await insertCompanies();
      
      if (!companiesInserted) {
        console.log('❌ No se pudieron insertar las empresas');
        process.exit(1);
      }
    } else {
      console.log('✅ Las tablas ya existen');
    }
    
    console.log('\n✨ ¡Proceso completado exitosamente!');
    console.log('\n📋 Siguientes pasos:');
    console.log('1. Ejecuta el script database/setup-complete.sql en el SQL Editor de Supabase');
    console.log('2. O ejecuta: node scripts/setup-database.mjs (una vez que tengas la service key correcta)');
    console.log('3. Verifica que cada empresa tenga 50 empleados');
    
  } catch (error) {
    console.error('\n💥 Error en el proceso:', error.message);
    process.exit(1);
  }
}

// Ejecutar si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkTables, createTables, insertCompanies };