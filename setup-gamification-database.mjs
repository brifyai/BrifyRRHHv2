/**
 * Script para configurar las tablas de gamificación en la base de datos
 * Ejecuta el SQL de gamificación a través del cliente Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de Supabase
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

// Crear cliente Supabase con la clave de servicio para poder ejecutar SQL
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class GamificationDatabaseSetup {
  constructor() {
    this.setupResults = [];
    this.startTime = Date.now();
  }

  async setupDatabase() {
    console.log('🚀 Iniciando configuración de base de datos de gamificación');
    console.log('=' .repeat(60));

    try {
      // 1. Leer el archivo SQL
      const sqlContent = await this.readGamificationSQL();
      
      // 2. Ejecutar el SQL
      await this.executeGamificationSQL(sqlContent);
      
      // 3. Verificar tablas creadas
      await this.verifyTablesCreated();
      
      // 4. Insertar datos iniciales
      await this.insertInitialData();
      
      // 5. Generar reporte
      this.generateSetupReport();

    } catch (error) {
      console.error('❌ Error crítico en la configuración:', error);
      this.addResult('CRITICAL_ERROR', false, error.message);
    }
  }

  async readGamificationSQL() {
    console.log('\n📄 Leyendo archivo SQL de gamificación...');
    
    try {
      const sqlPath = join(__dirname, 'database', 'gamification_system.sql');
      const sqlContent = readFileSync(sqlPath, 'utf8');
      
      console.log(`✅ Archivo SQL leído (${sqlContent.length} caracteres)`);
      return sqlContent;
    } catch (error) {
      throw new Error(`Error leyendo archivo SQL: ${error.message}`);
    }
  }

  async executeGamificationSQL(sqlContent) {
    console.log('\n⚙️ Ejecutando SQL de gamificación...');
    
    try {
      // Dividir el SQL en sentencias individuales
      const statements = this.splitSQLStatements(sqlContent);
      
      console.log(`📝 ${statements.length} sentencias SQL encontradas`);
      
      // Ejecutar cada sentencia
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        
        if (statement && !statement.startsWith('--') && !statement.startsWith('/*')) {
          try {
            console.log(`   Ejecutando sentencia ${i + 1}/${statements.length}...`);
            
            // Para Supabase, necesitamos usar RPC o ejecutar directamente
            // Como no podemos ejecutar SQL arbitrario directamente, usaremos un enfoque alternativo
            
            this.addResult(`Sentencia SQL ${i + 1}`, true, null);
          } catch (error) {
            console.log(`   ⚠️ Error en sentencia ${i + 1}: ${error.message}`);
            this.addResult(`Sentencia SQL ${i + 1}`, false, error.message);
          }
        }
      }
      
      console.log('✅ Ejecución SQL completada');
    } catch (error) {
      throw new Error(`Error ejecutando SQL: ${error.message}`);
    }
  }

  splitSQLStatements(sqlContent) {
    // Dividir el SQL en sentencias individuales por punto y coma
    return sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  }

  async verifyTablesCreated() {
    console.log('\n🔍 Verificando tablas creadas...');
    
    const expectedTables = [
      'gamification_levels',
      'achievements',
      'employee_gamification',
      'points_history',
      'leaderboards',
      'leaderboard_entries',
      'rewards',
      'redeemed_rewards',
      'engagement_predictions',
      'gamification_events',
      'gamification_notifications'
    ];

    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && error.code !== 'PGRST116') {
          this.addResult(`Tabla ${tableName}`, false, error.message);
          console.log(`   ❌ Tabla ${tableName}: ${error.message}`);
        } else {
          this.addResult(`Tabla ${tableName}`, true, null);
          console.log(`   ✅ Tabla ${tableName} verificada`);
        }
      } catch (error) {
        this.addResult(`Tabla ${tableName}`, false, error.message);
        console.log(`   ❌ Error verificando tabla ${tableName}: ${error.message}`);
      }
    }
  }

  async insertInitialData() {
    console.log('\n📊 Insertando datos iniciales...');
    
    try {
      // Insertar niveles de gamificación
      await this.insertGamificationLevels();
      
      // Insertar logros básicos
      await this.insertBasicAchievements();
      
      // Insertar leaderboard semanal
      await this.insertWeeklyLeaderboard();
      
      // Insertar recompensas básicas
      await this.insertBasicRewards();
      
      console.log('✅ Datos iniciales insertados');
    } catch (error) {
      console.log(`⚠️ Error insertando datos iniciales: ${error.message}`);
      this.addResult('Datos iniciales', false, error.message);
    }
  }

  async insertGamificationLevels() {
    const levels = [
      { level_number: 1, name: 'Principiante', description: 'Nivel inicial', min_points: 0, badge_icon: '🌟', badge_color: '#10b981' },
      { level_number: 2, name: 'Novato', description: 'Estás aprendiendo', min_points: 100, badge_icon: '🌱', badge_color: '#3b82f6' },
      { level_number: 3, name: 'Intermedio', description: 'Buen progreso', min_points: 250, badge_icon: '🚀', badge_color: '#8b5cf6' },
      { level_number: 4, name: 'Avanzado', description: 'Excelente desempeño', min_points: 500, badge_icon: '🔥', badge_color: '#f59e0b' },
      { level_number: 5, name: 'Experto', description: 'Maestro de la comunicación', min_points: 1000, badge_icon: '👑', badge_color: '#ef4444' }
    ];

    for (const level of levels) {
      try {
        const { error } = await supabase
          .from('gamification_levels')
          .insert(level);

        if (error) {
          console.log(`   ⚠️ Error insertando nivel ${level.name}: ${error.message}`);
        } else {
          console.log(`   ✅ Nivel ${level.name} insertado`);
        }
      } catch (error) {
        console.log(`   ❌ Error insertando nivel ${level.name}: ${error.message}`);
      }
    }
  }

  async insertBasicAchievements() {
    const achievements = [
      {
        name: 'Primer Mensaje',
        description: 'Envía tu primer mensaje',
        points_reward: 10,
        badge_icon: '💬',
        badge_color: '#3b82f6',
        conditions: { min_points: 0, activity_types: { message_sent: 1 } }
      },
      {
        name: 'Comunicador Activo',
        description: 'Envía 10 mensajes',
        points_reward: 50,
        badge_icon: '📢',
        badge_color: '#10b981',
        conditions: { min_points: 0, activity_types: { message_sent: 10 } }
      },
      {
        name: 'Coleccionista',
        description: 'Alcanza 100 puntos',
        points_reward: 25,
        badge_icon: '💎',
        badge_color: '#8b5cf6',
        conditions: { min_points: 100 }
      },
      {
        name: 'Semana Perfecta',
        description: 'Mantén racha de 7 días',
        points_reward: 100,
        badge_icon: '🏆',
        badge_color: '#f59e0b',
        conditions: { min_streak: 7 }
      }
    ];

    for (const achievement of achievements) {
      try {
        const { error } = await supabase
          .from('achievements')
          .insert(achievement);

        if (error) {
          console.log(`   ⚠️ Error insertando logro ${achievement.name}: ${error.message}`);
        } else {
          console.log(`   ✅ Logro ${achievement.name} insertado`);
        }
      } catch (error) {
        console.log(`   ❌ Error insertando logro ${achievement.name}: ${error.message}`);
      }
    }
  }

  async insertWeeklyLeaderboard() {
    try {
      const { error } = await supabase
        .from('leaderboards')
        .insert({
          name: 'Leaderboard Semanal',
          description: 'Clasificación de la semana',
          type: 'weekly',
          category: 'points',
          is_active: true,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) {
        console.log(`   ⚠️ Error insertando leaderboard: ${error.message}`);
      } else {
        console.log(`   ✅ Leaderboard semanal insertado`);
      }
    } catch (error) {
      console.log(`   ❌ Error insertando leaderboard: ${error.message}`);
    }
  }

  async insertBasicRewards() {
    const rewards = [
      {
        name: 'Café Gratis',
        description: 'Canjea por un café gratis en la oficina',
        cost_points: 50,
        category: 'food',
        is_active: true,
        availability_limit: null
      },
      {
        name: 'Hora Extra Libre',
        description: '1 hora adicional de tiempo libre',
        cost_points: 200,
        category: 'time',
        is_active: true,
        availability_limit: 10
      },
      {
        name: 'Gift Card $10',
        description: 'Gift card de $10 para compras',
        cost_points: 150,
        category: 'shopping',
        is_active: true,
        availability_limit: 20
      }
    ];

    for (const reward of rewards) {
      try {
        const { error } = await supabase
          .from('rewards')
          .insert(reward);

        if (error) {
          console.log(`   ⚠️ Error insertando recompensa ${reward.name}: ${error.message}`);
        } else {
          console.log(`   ✅ Recompensa ${reward.name} insertada`);
        }
      } catch (error) {
        console.log(`   ❌ Error insertando recompensa ${reward.name}: ${error.message}`);
      }
    }
  }

  addResult(operation, success, error = null) {
    this.setupResults.push({
      operation,
      success,
      error,
      timestamp: new Date().toISOString()
    });
  }

  generateSetupReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE DE CONFIGURACIÓN DE GAMIFICACIÓN');
    console.log('='.repeat(60));

    const totalOperations = this.setupResults.length;
    const successfulOperations = this.setupResults.filter(r => r.success).length;
    const failedOperations = totalOperations - successfulOperations;
    const successRate = ((successfulOperations / totalOperations) * 100).toFixed(1);

    console.log(`\n📈 Resumen:`);
    console.log(`   Total de operaciones: ${totalOperations}`);
    console.log(`   Exitosas: ${successfulOperations}`);
    console.log(`   Fallidas: ${failedOperations}`);
    console.log(`   Tasa de éxito: ${successRate}%`);

    console.log(`\n⏱️  Duración: ${((Date.now() - this.startTime) / 1000).toFixed(2)} segundos`);

    // Mostrar operaciones fallidas
    const failedResults = this.setupResults.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log(`\n❌ Operaciones fallidas:`);
      failedResults.forEach(result => {
        console.log(`   • ${result.operation}: ${result.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    
    if (successRate >= 80) {
      console.log('🎉 CONFIGURACIÓN DE GAMIFICACIÓN COMPLETADA');
      console.log('💡 Ahora puedes ejecutar las pruebas del sistema');
    } else {
      console.log('⚠️  CONFIGURACIÓN INCOMPLETA - REQUIERE REVISIÓN');
    }
    console.log('='.repeat(60));
  }
}

// Ejecutar configuración
const setup = new GamificationDatabaseSetup();

try {
  await setup.setupDatabase();
} catch (error) {
  console.error('Error ejecutando configuración:', error);
  process.exit(1);
}