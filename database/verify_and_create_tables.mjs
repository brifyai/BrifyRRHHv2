#!/usr/bin/env node

/**
 * Script para verificar y crear tablas necesarias en Supabase
 * Tablas: company_metrics, communication_logs, company_insights
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Error: No se encontró SUPABASE_SERVICE_KEY o REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Definiciones de tablas
const tableDefinitions = {
  communication_logs: `
    CREATE TABLE IF NOT EXISTS communication_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
      employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
      channel_id TEXT,
      message_type TEXT,
      status TEXT CHECK (status IN ('sent', 'read', 'scheduled', 'draft', 'failed')),
      subject TEXT,
      content TEXT,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_communication_logs_company_id ON communication_logs(company_id);
    CREATE INDEX IF NOT EXISTS idx_communication_logs_employee_id ON communication_logs(employee_id);
    CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
    CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at ON communication_logs(created_at DESC);
  `,
  
  company_insights: `
    CREATE TABLE IF NOT EXISTS company_insights (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_name TEXT NOT NULL,
      insight_type TEXT CHECK (insight_type IN ('front', 'back')),
      insight_category TEXT,
      title TEXT NOT NULL,
      description TEXT,
      confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
      data_source TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
    );
    
    CREATE INDEX IF NOT EXISTS idx_company_insights_company_name ON company_insights(company_name);
    CREATE INDEX IF NOT EXISTS idx_company_insights_insight_type ON company_insights(insight_type);
    CREATE INDEX IF NOT EXISTS idx_company_insights_is_active ON company_insights(is_active) WHERE is_active = true;
    CREATE INDEX IF NOT EXISTS idx_company_insights_created_at ON company_insights(created_at DESC);
  `,
  
  company_metrics: `
    CREATE TABLE IF NOT EXISTS company_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
      company_name TEXT UNIQUE NOT NULL,
      employee_count INTEGER DEFAULT 0,
      total_messages INTEGER DEFAULT 0,
      sent_messages INTEGER DEFAULT 0,
      read_messages INTEGER DEFAULT 0,
      scheduled_messages INTEGER DEFAULT 0,
      draft_messages INTEGER DEFAULT 0,
      engagement_rate REAL DEFAULT 0,
      delivery_rate REAL DEFAULT 0,
      read_rate REAL DEFAULT 0,
      sentiment_score REAL DEFAULT 0,
      most_active_hour INTEGER DEFAULT 9,
      most_active_day INTEGER DEFAULT 1,
      preferred_channel TEXT DEFAULT 'whatsapp',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_company_metrics_company_id ON company_metrics(company_id);
    CREATE INDEX IF NOT EXISTS idx_company_metrics_company_name ON company_metrics(company_name);
    CREATE INDEX IF NOT EXISTS idx_company_metrics_engagement_rate ON company_metrics(engagement_rate DESC);
    CREATE INDEX IF NOT EXISTS idx_company_metrics_updated_at ON company_metrics(updated_at DESC);
  `
};

async function verifyAndCreateTables() {
  console.log('🔍 Verificando tablas en Supabase...');
  console.log(`URL: ${supabaseUrl}`);
  
  const results = {
    existing: [],
    created: [],
    errors: []
  };

  for (const [tableName, createSQL] of Object.entries(tableDefinitions)) {
    try {
      console.log(`\n📋 Verificando tabla: ${tableName}`);
      
      // Intentar consultar la tabla para verificar si existe
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') { // Table does not exist
          console.log(`   ❌ Tabla ${tableName} no existe. Creando...`);
          
          // Crear la tabla
          const { error: createError } = await supabase.rpc('exec_sql', {
            sql: createSQL
          });
          
          if (createError) {
            console.error(`   ❌ Error creando tabla ${tableName}:`, createError.message);
            results.errors.push({ table: tableName, error: createError.message });
          } else {
            console.log(`   ✅ Tabla ${tableName} creada exitosamente`);
            results.created.push(tableName);
          }
        } else {
          console.error(`   ❌ Error verificando tabla ${tableName}:`, error.message);
          results.errors.push({ table: tableName, error: error.message });
        }
      } else {
        console.log(`   ✅ Tabla ${tableName} ya existe (${data ? data.length : 0} registros)`);
        results.existing.push(tableName);
      }
      
    } catch (error) {
      console.error(`   ❌ Error inesperado con tabla ${tableName}:`, error.message);
      results.errors.push({ table: tableName, error: error.message });
    }
  }
  
  // Mostrar resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Tablas existentes: ${results.existing.length} (${results.existing.join(', ')})`);
  console.log(`🆕 Tablas creadas: ${results.created.length} (${results.created.join(', ')})`);
  console.log(`❌ Errores: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\nDetalles de errores:');
    results.errors.forEach(err => {
      console.log(`  - ${err.table}: ${err.error}`);
    });
  }
  
  // Verificar si necesitamos crear la función exec_sql
  if (results.created.length > 0) {
    console.log('\n🔧 Verificando función exec_sql...');
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
      if (error) {
        console.log('   ❌ Función exec_sql no existe. Creando...');
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `;
        
        const { error: funcError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
        if (funcError) {
          console.error('   ❌ Error creando función exec_sql:', funcError.message);
        } else {
          console.log('   ✅ Función exec_sql creada exitosamente');
        }
      } else {
        console.log('   ✅ Función exec_sql ya existe');
      }
    } catch (error) {
      console.error('   ❌ Error verificando función exec_sql:', error.message);
    }
  }
  
  return results;
}

// Ejecutar
verifyAndCreateTables()
  .then(results => {
    if (results.errors.length === 0) {
      console.log('\n🎉 ¡Todas las tablas verificadas/creadas exitosamente!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Algunas tablas tuvieron errores');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });