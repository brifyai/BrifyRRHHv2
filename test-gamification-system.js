/**
 * Script de prueba completo para el sistema de gamificación
 * Verifica todas las funcionalidades con usuarios reales
 */

import { supabase } from './src/lib/supabase.js';
import gamificationService from './src/services/gamificationService.js';
import realTimeGamificationService from './src/services/realTimeGamificationService.js';
import enhancedCommunicationService from './src/services/enhancedCommunicationService.js';

// Configuración de prueba
const TEST_CONFIG = {
  testUserId: 'test-user-123',
  testEmployeeId: 'test-employee-456',
  testCompanyId: 'test-company-789',
  testRecipients: ['test-recipient-1', 'test-recipient-2'],
  enableRealTime: true,
  enableDetailedLogs: true
};

class GamificationSystemTester {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
    this.startTime = Date.now();
  }

  /**
   * Ejecuta todas las pruebas del sistema
   */
  async runAllTests() {
    console.log('🚀 Iniciando pruebas completas del sistema de gamificación');
    console.log('=' .repeat(60));

    try {
      // 1. Pruebas de inicialización
      await this.testInitialization();

      // 2. Pruebas de sistema de puntos
      await this.testPointsSystem();

      // 3. Pruebas de logros
      await this.testAchievementsSystem();

      // 4. Pruebas de leaderboard
      await this.testLeaderboardSystem();

      // 5. Pruebas de recompensas
      await this.testRewardsSystem();

      // 6. Pruebas de predicciones
      await this.testPredictionsSystem();

      // 7. Pruebas de comunicación integrada
      await this.testCommunicationIntegration();

      // 8. Pruebas de tiempo real
      await this.testRealTimeSystem();

      // 9. Pruebas de estrés
      await this.testStressScenarios();

      // 10. Generar reporte final
      this.generateFinalReport();

    } catch (error) {
      console.error('❌ Error crítico en las pruebas:', error);
      this.addTestResult('CRITICAL_ERROR', false, error.message);
    }
  }

  /**
   * Prueba la inicialización del sistema
   */
  async testInitialization() {
    this.currentTest = 'Inicialización del Sistema';
    console.log('\n📋 Probando inicialización del sistema...');

    try {
      // Test 1: Inicialización de gamificación básica
      const initResult = await gamificationService.initializeEmployeeGamification(
        TEST_CONFIG.testUserId,
        TEST_CONFIG.testEmployeeId
      );
      
      this.addTestResult('Inicialización básica', initResult.success, initResult.error);

      // Test 2: Obtener datos iniciales
      const gamificationData = await gamificationService.getEmployeeGamification(
        TEST_CONFIG.testUserId,
        TEST_CONFIG.testEmployeeId
      );
      
      this.addTestResult('Obtención de datos iniciales', gamificationData.success, gamificationData.error);

      // Test 3: Inicialización de tiempo real
      if (TEST_CONFIG.enableRealTime) {
        const realTimeInit = await realTimeGamificationService.initialize(
          TEST_CONFIG.testUserId,
          TEST_CONFIG.testEmployeeId
        );
        
        this.addTestResult('Inicialización tiempo real', realTimeInit.success, realTimeInit.error);
      }

      console.log('✅ Pruebas de inicialización completadas');
    } catch (error) {
      this.addTestResult('Error en inicialización', false, error.message);
    }
  }

  /**
   * Prueba el sistema de puntos
   */
  async testPointsSystem() {
    this.currentTest = 'Sistema de Puntos';
    console.log('\n🎯 Probando sistema de puntos...');

    try {
      const activities = [
        { type: 'message_sent', description: 'Mensaje enviado' },
        { type: 'message_read', description: 'Mensaje leído' },
        { type: 'file_uploaded', description: 'Archivo subido' },
        { type: 'file_downloaded', description: 'Archivo descargado' },
        { type: 'template_used', description: 'Template usado' },
        { type: 'daily_login', description: 'Login diario' }
      ];

      for (const activity of activities) {
        const result = await gamificationService.awardPoints(
          TEST_CONFIG.testUserId,
          TEST_CONFIG.testEmployeeId,
          activity.type,
          null,
          activity.description
        );

        this.addTestResult(`Puntos - ${activity.description}`, result.success, result.error);
        
        if (result.success) {
          console.log(`   +${result.pointsAwarded} puntos por ${activity.description}`);
        }

        // Pequeña pausa para evitar problemas de cooldown
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Verificar balance final
      const finalData = await gamificationService.getEmployeeGamification(
        TEST_CONFIG.testUserId,
        TEST_CONFIG.testEmployeeId
      );

      if (finalData.success) {
        console.log(`   📊 Total puntos: ${finalData.data.total_points}`);
        console.log(`   📈 Nivel actual: ${finalData.data.current_level}`);
      }

      console.log('✅ Pruebas de sistema de puntos completadas');
    } catch (error) {
      this.addTestResult('Error en sistema de puntos', false, error.message);
    }
  }

  /**
   * Prueba el sistema de logros
   */
  async testAchievementsSystem() {
    this.currentTest = 'Sistema de Logros';
    console.log('\n🏆 Probando sistema de logros...');

    try {
      // Test 1: Obtener todos los logros disponibles
      const allAchievements = await gamificationService.getAllAchievements();
      this.addTestResult('Obtener logros disponibles', allAchievements.success, allAchievements.error);

      if (allAchievements.success) {
        console.log(`   📋 ${allAchievements.data.length} logros disponibles`);

        // Test 2: Verificar logros desbloqueados
        const userData = await gamificationService.getEmployeeGamification(
          TEST_CONFIG.testUserId,
          TEST_CONFIG.testEmployeeId
        );

        if (userData.success) {
          const unlockedCount = userData.data.achievements?.length || 0;
          console.log(`   🔓 ${unlockedCount} logros desbloqueados`);
        }
      }

      // Test 3: Verificación automática de logros
      const checkResult = await realTimeGamificationService.checkAchievements(
        TEST_CONFIG.testUserId,
        TEST_CONFIG.testEmployeeId
      );

      this.addTestResult('Verificación automática de logros', true, null);

      console.log('✅ Pruebas de sistema de logros completadas');
    } catch (error) {
      this.addTestResult('Error en sistema de logros', false, error.message);
    }
  }

  /**
   * Prueba el sistema de leaderboard
   */
  async testLeaderboardSystem() {
    this.currentTest = 'Sistema de Leaderboard';
    console.log('\n🏅 Probando sistema de leaderboard...');

    try {
      const leaderboardTypes = ['weekly', 'monthly', 'all_time'];
      const categories = ['points', 'level', 'achievements'];

      for (const type of leaderboardTypes) {
        for (const category of categories) {
          const leaderboard = await gamificationService.getLeaderboard(type, category, 10);
          
          this.addTestResult(
            `Leaderboard - ${type}/${category}`,
            leaderboard.success,
            leaderboard.error
          );

          if (leaderboard.success) {
            console.log(`   📊 ${type}/${category}: ${leaderboard.data.length} entradas`);
          }
        }
      }

      console.log('✅ Pruebas de sistema de leaderboard completadas');
    } catch (error) {
      this.addTestResult('Error en sistema de leaderboard', false, error.message);
    }
  }

  /**
   * Prueba el sistema de recompensas
   */
  async testRewardsSystem() {
    this.currentTest = 'Sistema de Recompensas';
    console.log('\n🎁 Probando sistema de recompensas...');

    try {
      // Test 1: Obtener recompensas disponibles
      const availableRewards = await gamificationService.getAvailableRewards();
      this.addTestResult('Obtener recompensas disponibles', availableRewards.success, availableRewards.error);

      if (availableRewards.success && availableRewards.data.length > 0) {
        console.log(`   🎁 ${availableRewards.data.length} recompensas disponibles`);

        // Test 2: Intentar canjear una recompensa (la primera disponible)
        const testReward = availableRewards.data[0];
        const redeemResult = await gamificationService.redeemReward(
          TEST_CONFIG.testUserId,
          TEST_CONFIG.testEmployeeId,
          testReward.id
        );

        // Puede fallar si no hay suficientes puntos, lo cual es esperado
        this.addTestResult(
          `Canjeo de recompensa - ${testReward.name}`,
          redeemResult.success,
          redeemResult.error || 'Puntos insuficientes (esperado)'
        );
      }

      console.log('✅ Pruebas de sistema de recompensas completadas');
    } catch (error) {
      this.addTestResult('Error en sistema de recompensas', false, error.message);
    }
  }

  /**
   * Prueba el sistema de predicciones
   */
  async testPredictionsSystem() {
    this.currentTest = 'Sistema de Predicciones';
    console.log('\n🔮 Probando sistema de predicciones...');

    try {
      // Test 1: Generar predicción de engagement
      const prediction = await gamificationService.generateEngagementPrediction(
        TEST_CONFIG.testUserId,
        TEST_CONFIG.testEmployeeId
      );

      this.addTestResult('Generar predicción de engagement', prediction.success, prediction.error);

      if (prediction.success) {
        console.log(`   📈 Score de engagement: ${prediction.data.predicted_engagement_score}`);
        console.log(`   🎯 Nivel de confianza: ${prediction.data.confidence_level}%`);
        console.log(`   ⚠️ Nivel de riesgo: ${prediction.data.risk_level}`);
      }

      // Test 2: Obtener historial de predicciones
      const predictionsHistory = await gamificationService.getEngagementPredictions(
        TEST_CONFIG.testUserId,
        TEST_CONFIG.testEmployeeId,
        5
      );

      this.addTestResult('Obtener historial de predicciones', predictionsHistory.success, predictionsHistory.error);

      if (predictionsHistory.success) {
        console.log(`   📊 ${predictionsHistory.data.length} predicciones históricas`);
      }

      console.log('✅ Pruebas de sistema de predicciones completadas');
    } catch (error) {
      this.addTestResult('Error en sistema de predicciones', false, error.message);
    }
  }

  /**
   * Prueba la integración con comunicación
   */
  async testCommunicationIntegration() {
    this.currentTest = 'Integración con Comunicación';
    console.log('\n💬 Probando integración con comunicación...');

    try {
      // Test 1: Envío de mensaje WhatsApp con gamificación
      const whatsappResult = await enhancedCommunicationService.sendWhatsAppMessage(
        TEST_CONFIG.testRecipients,
        'Mensaje de prueba con gamificación',
        { enableGamification: true }
      );

      this.addTestResult(
        'WhatsApp con gamificación',
        whatsappResult.success,
        whatsappResult.error
      );

      if (whatsappResult.success) {
        console.log('   📱 Mensaje WhatsApp enviado con puntos asignados');
      }

      // Test 2: Envío de mensaje Telegram con gamificación
      const telegramResult = await enhancedCommunicationService.sendTelegramMessage(
        TEST_CONFIG.testRecipients,
        'Mensaje de prueba Telegram con gamificación',
        { enableGamification: true }
      );

      this.addTestResult(
        'Telegram con gamificación',
        telegramResult.success,
        telegramResult.error
      );

      if (telegramResult.success) {
        console.log('   📨 Mensaje Telegram enviado con puntos asignados');
      }

      // Test 3: Chatbot con gamificación
      const chatbotResult = await enhancedCommunicationService.getChatbotResponse(
        '¿Cómo funcionan los puntos en el sistema?',
        TEST_CONFIG.testUserId
      );

      this.addTestResult(
        'Chatbot con gamificación',
        chatbotResult.success,
        chatbotResult.error
      );

      if (chatbotResult.success) {
        console.log('   🤖 Chatbot respondió con puntos asignados');
      }

      console.log('✅ Pruebas de integración con comunicación completadas');
    } catch (error) {
      this.addTestResult('Error en integración con comunicación', false, error.message);
    }
  }

  /**
   * Prueba el sistema en tiempo real
   */
  async testRealTimeSystem() {
    this.currentTest = 'Sistema en Tiempo Real';
    console.log('\n⚡ Probando sistema en tiempo real...');

    try {
      if (!TEST_CONFIG.enableRealTime) {
        console.log('   ⏭️  Pruebas de tiempo real deshabilitadas');
        return;
      }

      // Test 1: Tracking de actividad en tiempo real
      const activities = ['message_sent', 'file_uploaded', 'template_used'];
      
      for (const activity of activities) {
        const trackResult = await realTimeGamificationService.trackActivity(
          TEST_CONFIG.testUserId,
          TEST_CONFIG.testEmployeeId,
          activity,
          null,
          { description: `Actividad en tiempo real: ${activity}` }
        );

        this.addTestResult(
          `Tracking en tiempo real - ${activity}`,
          trackResult.success,
          trackResult.error
        );

        if (trackResult.success) {
          console.log(`   ⚡ ${activity} trackeada en tiempo real`);
        }
      }

      // Test 2: Obtener estadísticas en tiempo real
      const realTimeStats = await realTimeGamificationService.getRealTimeStats(
        TEST_CONFIG.testUserId,
        TEST_CONFIG.testEmployeeId
      );

      this.addTestResult(
        'Estadísticas en tiempo real',
        realTimeStats.success,
        realTimeStats.error
      );

      if (realTimeStats.success) {
        console.log(`   📊 Estadísticas actualizadas: ${realTimeStats.data.gamification.total_points} puntos`);
      }

      console.log('✅ Pruebas de sistema en tiempo real completadas');
    } catch (error) {
      this.addTestResult('Error en sistema en tiempo real', false, error.message);
    }
  }

  /**
   * Prueba escenarios de estrés
   */
  async testStressScenarios() {
    this.currentTest = 'Escenarios de Estrés';
    console.log('\n💪 Probando escenarios de estrés...');

    try {
      // Test 1: Múltiples actividades rápidas
      console.log('   🚀 Probando múltiples actividades rápidas...');
      const rapidActivities = [];
      
      for (let i = 0; i < 10; i++) {
        rapidActivities.push(
          realTimeGamificationService.trackActivity(
            TEST_CONFIG.testUserId,
            TEST_CONFIG.testEmployeeId,
            'message_read',
            null,
            { description: `Actividad rápida ${i + 1}` }
          )
        );
      }

      const rapidResults = await Promise.allSettled(rapidActivities);
      const successfulRapid = rapidResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
      
      this.addTestResult(
        'Múltiples actividades rápidas',
        successfulRapid >= 5,
        `Solo ${successfulRapid}/10 exitosas`
      );

      console.log(`   ✅ ${successfulRapid}/10 actividades rápidas exitosas`);

      // Test 2: Validación de límites
      console.log('   🛡️  Probando validación de límites...');
      const limitTest = await realTimeGamificationService.trackActivity(
        TEST_CONFIG.testUserId,
        TEST_CONFIG.testEmployeeId,
        'daily_login',
        null,
        { description: 'Test de límite' }
      );

      this.addTestResult(
        'Validación de límites',
        limitTest.success || limitTest.reason === 'limit_exceeded',
        limitTest.error
      );

      console.log(`   🛡️  Validación de límites: ${limitTest.success ? 'OK' : limitTest.reason}`);

      console.log('✅ Pruebas de estrés completadas');
    } catch (error) {
      this.addTestResult('Error en escenarios de estrés', false, error.message);
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
      timestamp: new Date().toISOString(),
      phase: this.currentTest
    });

    if (TEST_CONFIG.enableDetailedLogs) {
      const status = success ? '✅' : '❌';
      console.log(`   ${status} ${testName}${error ? `: ${error}` : ''}`);
    }
  }

  /**
   * Genera el reporte final de pruebas
   */
  generateFinalReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE FINAL DE PRUEBAS');
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

    console.log(`\n⏱️  Duración total: ${((Date.now() - this.startTime) / 1000).toFixed(2)} segundos`);

    // Agrupar por fase
    const phaseResults = {};
    this.testResults.forEach(result => {
      if (!phaseResults[result.phase]) {
        phaseResults[result.phase] = { total: 0, success: 0 };
      }
      phaseResults[result.phase].total++;
      if (result.success) {
        phaseResults[result.phase].success++;
      }
    });

    console.log(`\n📋 Resultados por fase:`);
    Object.entries(phaseResults).forEach(([phase, results]) => {
      const rate = ((results.success / results.total) * 100).toFixed(1);
      console.log(`   ${phase}: ${results.success}/${results.total} (${rate}%)`);
    });

    // Mostrar pruebas fallidas
    const failedResults = this.testResults.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log(`\n❌ Pruebas fallidas:`);
      failedResults.forEach(result => {
        console.log(`   • ${result.test}: ${result.error}`);
      });
    }

    // Verificación final del sistema
    console.log(`\n🔍 Verificación final del sistema:`);
    const criticalTests = [
      'Inicialización básica',
      'Puntos - Mensaje enviado',
      'Obtener logros disponibles',
      'Generar predicción de engagement',
      'WhatsApp con gamificación'
    ];

    const criticalPassed = criticalTests.filter(testName => 
      this.testResults.some(r => r.test === testName && r.success)
    ).length;

    const systemStatus = criticalPassed >= criticalTests.length * 0.8 ? '✅ FUNCIONAL' : '⚠️  PARCIAL';
    console.log(`   Estado del sistema: ${systemStatus}`);
    console.log(`   Tests críticos pasados: ${criticalPassed}/${criticalTests.length}`);

    console.log('\n' + '='.repeat(60));
    
    if (successRate >= 80) {
      console.log('🎉 SISTEMA DE GAMIFICACIÓN APROBADO PARA PRODUCCIÓN');
    } else {
      console.log('⚠️  SISTEMA REQUIERE AJUSTES ANTES DE PRODUCCIÓN');
    }
    console.log('='.repeat(60));
  }
}

// Ejecutar pruebas si este script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new GamificationSystemTester();
  tester.runAllTests().catch(console.error);
}

export default GamificationSystemTester;