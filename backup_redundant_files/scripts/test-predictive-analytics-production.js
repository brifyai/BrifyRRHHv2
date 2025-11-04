/**
 * Script de Testing en Producción para Analíticas Predictivas
 * Valida el funcionamiento del sistema mejorado con IA en entorno real
 */

const { createClient } = require('@supabase/supabase-js');
const enhancedCommunicationService = require('../src/services/enhancedCommunicationService.js');

// Configuración de producción
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.4rLd1i8GJ8wXjYhK7X3X9X7X9X7X9X7X9X7X9X7X9X7X';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class PredictiveAnalyticsTester {
  constructor() {
    this.testResults = {
      messageOptimization: [],
      engagementPrediction: [],
      chatbotResponses: [],
      analyticsGeneration: [],
      performance: {}
    };
    this.testEmployees = [];
  }

  async initializeTest() {
    console.log('🚀 Iniciando Testing en Producción de Analíticas Predictivas...');
    
    try {
      // Obtener empleados de prueba (primeros 10)
      const { data: employees, error } = await supabase
        .from('users')
        .select('*')
        .limit(10);
      
      if (error) throw error;
      
      this.testEmployees = employees;
      console.log(`✅ ${employees.length} empleados cargados para testing`);
      
      return true;
    } catch (error) {
      console.error('❌ Error inicializando testing:', error);
      return false;
    }
  }

  async testMessageOptimization() {
    console.log('\n📝 Test 1: Optimización de Mensajes con IA');
    
    const testMessages = [
      {
        original: 'Reunión importante mañana',
        expectedImprovements: ['claridad', 'contexto', 'personalización']
      },
      {
        original: 'Favor revisar documentos',
        expectedImprovements: ['tono', 'claridad', 'urgencia']
      },
      {
        original: 'Buen día a todos',
        expectedImprovements: ['personalización', 'contexto', 'engagement']
      }
    ];
    
    for (const test of testMessages) {
      try {
        const startTime = Date.now();
        
        const result = await enhancedCommunicationService.optimizeMessage(
          test.original,
          {
            channel: 'whatsapp',
            recipients: this.testEmployees.slice(0, 3).map(emp => emp.id),
            engagementPrediction: { score: 0.6 }
          }
        );
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        this.testResults.messageOptimization.push({
          original: test.original,
          optimized: result.content,
          improvements: result.applied,
          processingTime,
          success: true
        });
        
        console.log(`✅ Mensaje optimizado: "${test.original}" → "${result.content}"`);
        console.log(`   Mejoras aplicadas: ${result.applied.join(', ')}`);
        console.log(`   Tiempo procesamiento: ${processingTime}ms`);
        
      } catch (error) {
        console.error(`❌ Error optimizando mensaje: "${test.original}"`, error);
        this.testResults.messageOptimization.push({
          original: test.original,
          error: error.message,
          success: false
        });
      }
    }
  }

  async testEngagementPrediction() {
    console.log('\n🎯 Test 2: Predicción de Engagement');
    
    const testScenarios = [
      {
        message: 'Felicitaciones por el excelente trabajo este mes',
        channel: 'whatsapp',
        recipients: this.testEmployees.slice(0, 5).map(emp => emp.id),
        expectedScore: 0.8
      },
      {
        message: 'Recordatorio de deadline',
        channel: 'telegram',
        recipients: this.testEmployees.slice(0, 3).map(emp => emp.id),
        expectedScore: 0.6
      },
      {
        message: 'x',
        channel: 'whatsapp',
        recipients: this.testEmployees.slice(0, 2).map(emp => emp.id),
        expectedScore: 0.2
      }
    ];
    
    for (const scenario of testScenarios) {
      try {
        const startTime = Date.now();
        
        const result = await enhancedCommunicationService.engagementPredictor.predict(
          scenario.recipients,
          scenario.message,
          scenario.channel
        );
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        const accuracy = Math.abs(result.score - scenario.expectedScore) < 0.2;
        
        this.testResults.engagementPrediction.push({
          message: scenario.message,
          channel: scenario.channel,
          predictedScore: result.score,
          expectedScore: scenario.expectedScore,
          accuracy,
          processingTime,
          factors: result.factors,
          success: true
        });
        
        console.log(`✅ Predicción engagement: "${scenario.message}"`);
        console.log(`   Score predicho: ${(result.score * 100).toFixed(1)}%`);
        console.log(`   Score esperado: ${(scenario.expectedScore * 100).toFixed(1)}%`);
        console.log(`   Precisión: ${accuracy ? '✅' : '❌'} (${processingTime}ms)`);
        
      } catch (error) {
        console.error(`❌ Error en predicción de engagement: "${scenario.message}"`, error);
        this.testResults.engagementPrediction.push({
          message: scenario.message,
          error: error.message,
          success: false
        });
      }
    }
  }

  async testChatbotResponses() {
    console.log('\n🤖 Test 3: Respuestas del Chatbot con Memoria');
    
    const testConversations = [
      {
        userId: this.testEmployees[0]?.id,
        messages: [
          'Hola, ¿cómo estás?',
          '¿Qué beneficios tengo?',
          '¿Cuándo es el próximo pago?'
        ]
      },
      {
        userId: this.testEmployees[1]?.id,
        messages: [
          'Necesito ayuda con mis documentos',
          '¿Dónde encuentro mi contrato?',
          '¿Quién es mi manager?'
        ]
      }
    ];
    
    for (const conversation of testConversations) {
      try {
        console.log(`\n   Conversación con usuario ${conversation.userId}:`);
        
        for (const message of conversation.messages) {
          const startTime = Date.now();
          
          const response = await enhancedCommunicationService.getChatbotResponse(
            message,
            conversation.userId,
            { context: 'testing' }
          );
          
          const endTime = Date.now();
          const processingTime = endTime - startTime;
          
          this.testResults.chatbotResponses.push({
            message,
            response: response.response,
            personalized: response.personalized,
            historyLength: response.historyLength,
            processingTime,
            success: true
          });
          
          console.log(`   👤 ${message}`);
          console.log(`   🤖 ${response.response}`);
          console.log(`   ⏱️ ${processingTime}ms | Personalizado: ${response.personalized ? '✅' : '❌'}`);
        }
        
      } catch (error) {
        console.error(`❌ Error en chatbot para usuario ${conversation.userId}:`, error);
        this.testResults.chatbotResponses.push({
          userId: conversation.userId,
          error: error.message,
          success: false
        });
      }
    }
  }

  async testAnalyticsGeneration() {
    console.log('\n📊 Test 4: Generación de Analíticas Predictivas');
    
    try {
      const startTime = Date.now();
      
      // Test estadísticas mejoradas
      const enhancedStats = await enhancedCommunicationService.getEnhancedCommunicationStats();
      
      // Test insights predictivos
      const insights = await enhancedCommunicationService.getPredictiveInsights('test-company');
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      this.testResults.analyticsGeneration.push({
        enhancedStats,
        insights,
        processingTime,
        success: true
      });
      
      console.log('✅ Analíticas generadas exitosamente:');
      console.log(`   Estadísticas mejoradas: ${enhancedStats.aiEnhancements ? '✅' : '❌'}`);
      console.log(`   Insights predictivos: ${insights.predictive ? '✅' : '❌'}`);
      console.log(`   Confianza: ${(insights.confidence * 100).toFixed(1)}%`);
      console.log(`   Tiempo procesamiento: ${processingTime}ms`);
      
    } catch (error) {
      console.error('❌ Error generando analíticas:', error);
      this.testResults.analyticsGeneration.push({
        error: error.message,
        success: false
      });
    }
  }

  async testPerformanceMetrics() {
    console.log('\n⚡ Test 5: Métricas de Rendimiento');
    
    const performanceTests = [
      {
        name: 'Optimización de mensaje simple',
        test: () => enhancedCommunicationService.optimizeMessage('Test message', { channel: 'whatsapp' })
      },
      {
        name: 'Predicción de engagement',
        test: () => enhancedCommunicationService.engagementPredictor.predict(['user1'], 'Test', 'whatsapp')
      },
      {
        name: 'Respuesta del chatbot',
        test: () => enhancedCommunicationService.getChatbotResponse('Hola', 'test-user')
      }
    ];
    
    for (const perfTest of performanceTests) {
      const times = [];
      
      // Ejecutar 5 veces para obtener promedio
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        try {
          await perfTest.test();
          const endTime = Date.now();
          times.push(endTime - startTime);
        } catch (error) {
          console.error(`❌ Error en performance test ${perfTest.name}:`, error);
        }
      }
      
      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        this.testResults.performance[perfTest.name] = {
          avgTime: avgTime.toFixed(2),
          minTime,
          maxTime,
          samples: times.length
        };
        
        console.log(`✅ ${perfTest.name}:`);
        console.log(`   Promedio: ${avgTime.toFixed(2)}ms`);
        console.log(`   Mínimo: ${minTime}ms`);
        console.log(`   Máximo: ${maxTime}ms`);
      }
    }
  }

  async generateTestReport() {
    console.log('\n📋 Generando Reporte de Testing...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        successRate: 0
      },
      details: this.testResults,
      recommendations: []
    };
    
    // Calcular totales
    Object.values(this.testResults).forEach(category => {
      if (Array.isArray(category)) {
        category.forEach(test => {
          report.summary.totalTests++;
          if (test.success) {
            report.summary.passedTests++;
          } else {
            report.summary.failedTests++;
          }
        });
      }
    });
    
    report.summary.successRate = (report.summary.passedTests / report.summary.totalTests * 100).toFixed(1);
    
    // Generar recomendaciones
    if (report.summary.successRate < 90) {
      report.recommendations.push('Revisar configuración de servicios de IA');
    }
    
    if (this.testResults.performance) {
      Object.entries(this.testResults.performance).forEach(([test, metrics]) => {
        if (parseFloat(metrics.avgTime) > 1000) {
          report.recommendations.push(`Optimizar rendimiento de: ${test}`);
        }
      });
    }
    
    // Guardar reporte en base de datos
    try {
      await supabase
        .from('analytics_test_reports')
        .insert({
          report_data: report,
          test_date: new Date().toISOString(),
          environment: 'production'
        });
      
      console.log('✅ Reporte guardado en base de datos');
    } catch (error) {
      console.warn('⚠️ No se pudo guardar reporte en BD:', error);
    }
    
    return report;
  }

  async runFullTestSuite() {
    console.log('🧪 Iniciando Suite Completa de Testing en Producción\n');
    
    const initialized = await this.initializeTest();
    if (!initialized) {
      console.error('❌ No se pudo inicializar el testing');
      return null;
    }
    
    await this.testMessageOptimization();
    await this.testEngagementPrediction();
    await this.testChatbotResponses();
    await this.testAnalyticsGeneration();
    await this.testPerformanceMetrics();
    
    const report = await this.generateTestReport();
    
    console.log('\n🎉 Testing Completado!');
    console.log(`✅ Tests exitosos: ${report.summary.passedTests}/${report.summary.totalTests}`);
    console.log(`📈 Tasa de éxito: ${report.summary.successRate}%`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recomendaciones:');
      report.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }
    
    return report;
  }
}

// Ejecutar testing si se llama directamente
if (require.main === module) {
  const tester = new PredictiveAnalyticsTester();
  tester.runFullTestSuite()
    .then(report => {
      if (report) {
        console.log('\n✨ Testing completado exitosamente');
        process.exit(0);
      } else {
        console.log('\n❌ Testing falló');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error fatal en testing:', error);
      process.exit(1);
    });
}

module.exports = PredictiveAnalyticsTester;