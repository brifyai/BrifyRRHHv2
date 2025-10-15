#!/usr/bin/env node

/**
 * Script para configurar la base de datos completa con empleados y datos de ejemplo
 * Ejecuta el archivo SQL setup_complete_employee_database.sql
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  console.error('Asegúrate de tener REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuración completa de la base de datos...\n');

    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, '..', 'database', 'setup_complete_employee_database.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 Archivo SQL cargado correctamente');
    console.log(`📊 Tamaño del archivo: ${sqlContent.length} caracteres\n`);

    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Encontrados ${statements.length} statements SQL para ejecutar\n`);

    let executedCount = 0;
    let errorCount = 0;

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Saltar comentarios y líneas vacías
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }

      try {
        console.log(`⚡ Ejecutando statement ${executedCount + 1}/${statements.length}...`);

        // Para statements complejos, usar rpc o ejecutar directamente
        if (statement.includes('CREATE OR REPLACE FUNCTION') ||
            statement.includes('SELECT generate_employees()') ||
            statement.includes('SELECT generate_sample_messages()')) {

          // Ejecutar como query directa
          const { error } = await supabase.rpc('exec_sql', { sql: statement });

          if (error) {
            console.error(`❌ Error en statement ${executedCount + 1}:`, error.message);
            errorCount++;
          } else {
            console.log(`✅ Statement ${executedCount + 1} ejecutado correctamente`);
            executedCount++;
          }
        } else {
          // Para otros statements, intentar ejecutar directamente
          const { error } = await supabase.from('_supabase_exec_sql').insert({ sql: statement });

          if (error) {
            // Si falla, intentar con una consulta directa
            try {
              await supabase.rpc('exec', { query: statement });
              console.log(`✅ Statement ${executedCount + 1} ejecutado correctamente`);
              executedCount++;
            } catch (fallbackError) {
              console.error(`❌ Error en statement ${executedCount + 1}:`, fallbackError.message);
              errorCount++;
            }
          } else {
            console.log(`✅ Statement ${executedCount + 1} ejecutado correctamente`);
            executedCount++;
          }
        }

      } catch (error) {
        console.error(`❌ Error ejecutando statement ${executedCount + 1}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Resumen de ejecución:`);
    console.log(`✅ Statements ejecutados correctamente: ${executedCount}`);
    console.log(`❌ Statements con error: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 ¡Base de datos configurada exitosamente!');
      console.log('📋 Verificando datos insertados...\n');

      // Verificar datos
      await verifyData();
    } else {
      console.log('\n⚠️  Algunos statements fallaron. Revisa los errores arriba.');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
}

async function verifyData() {
  try {
    // Verificar empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('name', { count: 'exact' });

    if (!companiesError) {
      console.log(`🏢 Empresas: ${companies.length}`);
    }

    // Verificar empleados
    const { count: employeesCount, error: employeesError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });

    if (!employeesError) {
      console.log(`👥 Empleados: ${employeesCount}`);
    }

    // Verificar mensajes
    const { count: messagesCount, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    if (!messagesError) {
      console.log(`💬 Mensajes: ${messagesCount}`);
    }

    // Verificar plantillas
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('name', { count: 'exact' });

    if (!templatesError) {
      console.log(`📄 Plantillas: ${templates.length}`);
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };