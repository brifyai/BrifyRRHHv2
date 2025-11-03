/**
 * Script de prueba simplificado para el sistema de gamificación
 * Versión compatible con Node.js ES Modules
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

// Crear cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuración de prueba
const TEST_CONFIG = {
  testUserId: 'test-user-' + Date.now(),
  testEmployeeId: 'test-employee-' + Date.now(),
  testCompanyId: 'test-company-' + Date.now()
};

class SimpleGamificationTester {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  /**
   * Ejecuta pruebas básicas del sistema
   */
  async runBasicTests() {
    console.log('🚀 Iniciando pruebas básicas del sistema de gamificación');
    console.log('=' .repeat(60));

    try {
      // 1. Prueba de conexión a la base de datos
      await this.testDatabaseConnection();

      // 2. Prueba de tablas de gamificación
      await this.testGamificationTables();

      // 3. Prueba de inserción de datos
      await this.testDataInsertion();

      // 4. Prueba de funciones de gamificación
      await this.testGamificationFunctions();

      // 5. Generar reporte
      this.generateReport();

    } catch (error) {
      console.error('❌ Error crítico en las pruebas:', error);
      this.addTestResult('CRITICAL_ERROR', false, error.message);
    }
  }

  /**
   * Prueba la conexión a la base de datos
   */
  async testDatabaseConnection() {
    console.log('\n🔌 Probando conexión a la base de datos...');

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1);

      if (error) {
        throw new Error(`Error de conexión: ${error.message}`);
      }

      this.addTestResult('Conexión a base de datos', true, null);
      console.log('✅ Conexión exitosa a la base de datos');
    } catch (error) {
      this.addTestResult('Conexión a base de datos', false, error.message);
      console.log('❌ Error de conexión:', error.message);
    }
  }

  /**
   * Prueba las tablas de gamificación
   */
  async testGamificationTables() {
    console.log('\n📊 Probando tablas de gamificación...');

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

        if (error && error.code !== 'PGRST116') {
          throw new Error(`Error en tabla ${tableName}: ${error.message}`);
        }

        this.addTestResult(`Tabla ${tableName}`, true, null);
        console.log(`   ✅ Tabla ${tableName} accesible`);
      } catch (error) {
        this.addTestResult(`Tabla ${tableName}`, false, error.message);
        console.log(`   ❌ Error en tabla ${tableName}:`, error.message);
      }
    }
  }

  /**
   * Prueba la inserción de datos
   */
  async testDataInsertion() {
    console.log('\n💾 Probando inserción de datos...');

    try {
      // Test 1: Insertar en employee_gamification
      const { data: empData, error: empError } = await supabase
        .from('employee_gamification')
        .insert({
          user_id: TEST_CONFIG.testUserId,
          employee_id: TEST_CONFIG.testEmployeeId,
          total_points: 0,
          current_level: 1,
          streak_days: 0,
          engagement_score: 0,
          achievements_unlocked: [],
          last_activity: new Date().toISOString()
        })
        .select()
        .single();

      if (empError) {
        throw new Error(`Error insertando employee_gamification: ${empError.message}`);
      }

      this.addTestResult('Inserción employee_gamification', true, null);
      console.log('   ✅ Datos de empleado insertados');

      // Test 2: Insertar en points_history
      const { data: pointsData, error: pointsError } = await supabase
        .from('points_history')
        .insert({
          user_id: TEST_CONFIG.testUserId,
          employee_id: TEST_CONFIG.testEmployeeId,
          points: 5,
          activity_type: 'message_sent',
          activity_id: null,
          description: 'Mensaje de prueba',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (pointsError) {
        throw new Error(`Error insertando points_history: ${pointsError.message}`);
      }

      this.addTestResult('Inserción points_history', true, null);
      console.log('   ✅ Historial de puntos insertado');

    } catch (error) {
      this.addTestResult('Inserción de datos', false, error.message);
      console.log('   ❌ Error en inserción:', error.message);
    }
  }

  /**
   * Prueba las funciones de gamificación
   */
  async testGamificationFunctions() {
    console.log('\n⚙️ Probando funciones de gamificación...');

    try {
      // Test 1: Obtener datos del empleado
      const { data: empData, error: empError } = await supabase
        .from('employee_gamification')
        .select('*')
        .eq('user_id', TEST_CONFIG.testUserId)
        .eq('employee_id', TEST_CONFIG.testEmployeeId)
        .single();

      if (empError) {
        throw new Error(`Error obteniendo datos: ${empError.message}`);
      }

      this.addTestResult('Obtener datos empleado', true, null);
      console.log('   ✅ Datos del empleado obtenidos');

      // Test 2: Obtener logros disponibles
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .limit(5);

      if (achievementsError) {
        throw new Error(`Error obteniendo logros: ${achievementsError.message}`);
      }

      this.addTestResult('Obtener logros disponibles', true, null);
      console.log(`   ✅ ${achievements.length} logros disponibles`);

      // Test 3: Obtener leaderboard
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('is_active', true)
        .limit(3);

      if (leaderboardError) {
        throw new Error(`Error obteniendo leaderboard: ${leaderboardError.message}`);
      }

      this.addTestResult('Obtener leaderboards', true, null);
      console.log(`   ✅ ${leaderboard.length} leaderboards activos`);

    } catch (error) {
      this.addTestResult('Funciones de gamificación', false, error.message);
      console.log('   ❌ Error en funciones:', error.message);
    }
  }

  /**
   * Agrega un resultado de prueba
   */
  addTestResult(testName, success, error = null) {
    this.testResults.push({
      test: testName,
      success,
      error,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Genera el reporte de pruebas
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE DE PRUEBAS DE GAMIFICACIÓN');
    console.log('='.repeat(60));

    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const successRate = ((successfulTests / totalTests) * 100).toFixed(1);

    console.log(`\n📈 Resumen:`);
    console.log(`   Total de pruebas: ${totalTests}`);
    console.log(`   Exitosas: ${successfulTests}`);
    console.log(`   Fallidas: ${failedTests}`);
    console.log(`   Tasa de éxito: ${successRate}%`);

    console.log(`\n⏱️  Duración: ${((Date.now() - this.startTime) / 1000).toFixed(2)} segundos`);

    // Mostrar pruebas fallidas
    const failedResults = this.testResults.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log(`\n❌ Pruebas fallidas:`);
      failedResults.forEach(result => {
        console.log(`   • ${result.test}: ${result.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    
    if (successRate >= 80) {
      console.log('🎉 SISTEMA DE GAMIFICACIÓN BÁSICO FUNCIONAL');
    } else {
      console.log('⚠️  SISTEMA REQUIERE REVISIÓN');
    }
    console.log('='.repeat(60));
  }

  /**
   * Limpia los datos de prueba
   */
  async cleanup() {
    console.log('\n🧹 Limpiando datos de prueba...');

    try {
      // Eliminar datos de prueba
      await supabase
        .from('points_history')
        .delete()
        .eq('user_id', TEST_CONFIG.testUserId);

      await supabase
        .from('employee_gamification')
        .delete()
        .eq('user_id', TEST_CONFIG.testUserId);

      console.log('✅ Datos de prueba eliminados');
    } catch (error) {
      console.log('⚠️ Error limpiando datos:', error.message);
    }
  }
}

// Ejecutar pruebas
const tester = new SimpleGamificationTester();

try {
  await tester.runBasicTests();
  await tester.cleanup();
} catch (error) {
  console.error('Error ejecutando pruebas:', error);
  process.exit(1);
}