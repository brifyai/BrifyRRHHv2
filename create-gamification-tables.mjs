/**
 * Script para crear tablas de gamificación usando el cliente Supabase
 * Enfoque: Crear tablas básicas manualmente con datos de ejemplo
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class GamificationTableCreator {
  constructor() {
    this.results = [];
  }

  async createTables() {
    console.log('🏗️ Creando tablas de gamificación...');
    console.log('=' .repeat(50));

    try {
      // Nota: Las tablas deben crearse manualmente en la interfaz de Supabase
      // Este script verifica si existen y muestra instrucciones
      
      await this.checkExistingTables();
      await this.showInstructions();
      
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  async checkExistingTables() {
    console.log('\n🔍 Verificando tablas existentes...');
    
    const tables = [
      'gamification_levels',
      'achievements', 
      'employee_gamification',
      'points_history',
      'leaderboards',
      'rewards'
    ];

    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && error.code === 'PGRST116') {
          console.log(`   ❌ Tabla ${tableName} NO existe`);
          this.results.push({ table: tableName, exists: false });
        } else if (error) {
          console.log(`   ⚠️ Error verificando ${tableName}: ${error.message}`);
          this.results.push({ table: tableName, exists: false, error: error.message });
        } else {
          console.log(`   ✅ Tabla ${tableName} existe`);
          this.results.push({ table: tableName, exists: true });
        }
      } catch (error) {
        console.log(`   ❌ Error verificando ${tableName}: ${error.message}`);
        this.results.push({ table: tableName, exists: false, error: error.message });
      }
    }
  }

  async showInstructions() {
    console.log('\n📋 INSTRUCCIONES PARA CREAR TABLAS:');
    console.log('=' .repeat(50));
    
    console.log('\n1. Ve a la interfaz de Supabase: https://app.supabase.com');
    console.log('2. Selecciona tu proyecto: tmqglnycivlcjijoymwe');
    console.log('3. Ve a "SQL Editor" en el menú lateral');
    console.log('4. Ejecuta el siguiente SQL para crear las tablas:');
    
    console.log('\n```sql');
    console.log('-- Tablas de gamificación');
    console.log('CREATE TABLE IF NOT EXISTS gamification_levels (');
    console.log('  id SERIAL PRIMARY KEY,');
    console.log('  level_number INTEGER UNIQUE NOT NULL,');
    console.log('  name VARCHAR(100) NOT NULL,');
    console.log('  description TEXT,');
    console.log('  min_points INTEGER DEFAULT 0,');
    console.log('  badge_icon VARCHAR(50),');
    console.log('  badge_color VARCHAR(20),');
    console.log('  created_at TIMESTAMP DEFAULT NOW(),');
    console.log('  updated_at TIMESTAMP DEFAULT NOW()');
    console.log(');');
    
    console.log('\nCREATE TABLE IF NOT EXISTS achievements (');
    console.log('  id SERIAL PRIMARY KEY,');
    console.log('  name VARCHAR(100) NOT NULL,');
    console.log('  description TEXT,');
    console.log('  points_reward INTEGER DEFAULT 0,');
    console.log('  badge_icon VARCHAR(50),');
    console.log('  badge_color VARCHAR(20),');
    console.log('  conditions JSONB,');
    console.log('  is_active BOOLEAN DEFAULT true,');
    console.log('  created_at TIMESTAMP DEFAULT NOW(),');
    console.log('  updated_at TIMESTAMP DEFAULT NOW()');
    console.log(');');
    
    console.log('\nCREATE TABLE IF NOT EXISTS employee_gamification (');
    console.log('  id SERIAL PRIMARY KEY,');
    console.log('  user_id VARCHAR(255) NOT NULL,');
    console.log('  employee_id VARCHAR(255) NOT NULL,');
    console.log('  total_points INTEGER DEFAULT 0,');
    console.log('  current_level INTEGER DEFAULT 1,');
    console.log('  streak_days INTEGER DEFAULT 0,');
    console.log('  engagement_score DECIMAL(5,2) DEFAULT 0.00,');
    console.log('  achievements_unlocked INTEGER[] DEFAULT \'\',');
    console.log('  last_activity TIMESTAMP,');
    console.log('  created_at TIMESTAMP DEFAULT NOW(),');
    console.log('  updated_at TIMESTAMP DEFAULT NOW(),');
    console.log('  UNIQUE(user_id, employee_id)');
    console.log(');');
    
    console.log('\nCREATE TABLE IF NOT EXISTS points_history (');
    console.log('  id SERIAL PRIMARY KEY,');
    console.log('  user_id VARCHAR(255) NOT NULL,');
    console.log('  employee_id VARCHAR(255) NOT NULL,');
    console.log('  points INTEGER NOT NULL,');
    console.log('  activity_type VARCHAR(50) NOT NULL,');
    console.log('  activity_id VARCHAR(255),');
    console.log('  description TEXT,');
    console.log('  metadata JSONB,');
    console.log('  created_at TIMESTAMP DEFAULT NOW()');
    console.log(');');
    
    console.log('\nCREATE TABLE IF NOT EXISTS leaderboards (');
    console.log('  id SERIAL PRIMARY KEY,');
    console.log('  name VARCHAR(100) NOT NULL,');
    console.log('  description TEXT,');
    console.log('  type VARCHAR(20) NOT NULL, -- weekly, monthly, all_time');
    console.log('  category VARCHAR(20) NOT NULL, -- points, level, achievements');
    console.log('  is_active BOOLEAN DEFAULT true,');
    console.log('  start_date TIMESTAMP,');
    console.log('  end_date TIMESTAMP,');
    console.log('  created_at TIMESTAMP DEFAULT NOW(),');
    console.log('  updated_at TIMESTAMP DEFAULT NOW()');
    console.log(');');
    
    console.log('\nCREATE TABLE IF NOT EXISTS rewards (');
    console.log('  id SERIAL PRIMARY KEY,');
    console.log('  name VARCHAR(100) NOT NULL,');
    console.log('  description TEXT,');
    console.log('  cost_points INTEGER NOT NULL,');
    console.log('  category VARCHAR(50),');
    console.log('  is_active BOOLEAN DEFAULT true,');
    console.log('  availability_limit INTEGER,');
    console.log('  image_url VARCHAR(255),');
    console.log('  created_at TIMESTAMP DEFAULT NOW(),');
    console.log('  updated_at TIMESTAMP DEFAULT NOW()');
    console.log(');');
    console.log('```');
    
    console.log('\n5. Después de crear las tablas, ejecuta este script nuevamente');
    console.log('6. Luego ejecuta: node test-gamification-simple.mjs');
    
    console.log('\n📊 Estado actual:');
    const existingTables = this.results.filter(r => r.exists).length;
    const totalTables = this.results.length;
    console.log(`   Tablas existentes: ${existingTables}/${totalTables}`);
    
    if (existingTables === totalTables) {
      console.log('\n🎉 ¡Todas las tablas existen! Puedes ejecutar las pruebas.');
    } else {
      console.log(`\n⚠️ Faltan ${totalTables - existingTables} tablas por crear.`);
    }
  }
}

// Ejecutar verificación
const creator = new GamificationTableCreator();
creator.createTables().catch(console.error);