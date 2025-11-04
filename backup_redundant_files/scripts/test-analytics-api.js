/**
 * Script de Testing para Analíticas Predictivas via API
 * Valida el funcionamiento del sistema mejorado con IA usando endpoints HTTP
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de producción
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.4rLd1i8GJ8wXjYhK7X3X9X7X9X7X9X7X9X7X9X7X9X7X';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class AnalyticsAPITester {
  constructor() {
    this.testResults = {
      databaseConnection: false,
      messageAnalysisTable: false,
      employeeData: false,
      communicationLogs: false,
      performance: {}
    };
  }

  async testDatabaseConnection() {
    console.log('🔗 Test 1: Conexión a Base de Datos');
    
    try {
      const startTime = Date.now();
      
      // Test conexión básica
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error) throw error;
      
      this.testResults.databaseConnection = {
        success: true,
        responseTime,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Conexión exitosa (${responseTime}ms)`);
      return true;
      
    } catch (error) {
      console.error('❌ Error en conexión a BD:', error);
      this.testResults.databaseConnection = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      return false;
    }
  }

  async testMessageAnalysisTable() {
    console.log('\n📊 Test 2: Tabla de Análisis de Mensajes');
    
    try {
      const startTime = Date.now();
      
      // Verificar si existe la tabla y tiene datos
      const { data, error } = await supabase
        .from('message_analysis')
        .select('*')
        .limit(5);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      this.testResults.messageAnalysisTable = {
        success: true,
        hasData: data && data.length > 0,
        recordCount: data ? data.length : 0,
        responseTime,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Tabla message_analysis accesible (${responseTime}ms)`);
      console.log(`   Registros encontrados: ${data ? data.length : 0}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error accediendo a message_analysis:', error);
      this.testResults.messageAnalysisTable = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      return false;
    }
  }

  async testEmployeeData() {
    console.log('\n👥 Test 3: Datos de Empleados');
    
    try {
      const startTime = Date.now();
      
      // Contar empleados y verificar estructura
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, department, company')
        .limit(10);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error) throw error;
      
      this.testResults.employeeData = {
        success: true,
        sampleCount: data.length,
        hasRequiredFields: data.every(emp => emp.id && emp.name && emp.email),
        responseTime,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Datos de empleados accesibles (${responseTime}ms)`);
      console.log(`   Muestra: ${data.length} empleados`);
      console.log(`   Campos requeridos: ${data.every(emp => emp.id && emp.name && emp.email) ? '✅' : '❌'}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error accediendo a datos de empleados:', error);
      this.testResults.employeeData = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      return false;
    }
  }

  async testCommunicationLogs() {
    console.log('\n📝 Test 4: Logs de Comunicación');
    
    try {
      const startTime = Date.now();
      
      // Verificar logs de comunicación recientes
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      this.testResults.communicationLogs = {
        success: true,
        hasData: data && data.length > 0,
        recordCount: data ? data.length : 0,
        responseTime,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Logs de comunicación accesibles (${responseTime}ms)`);
      console.log(`   Registros recientes: ${data ? data.length : 0}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error accediendo a communication_logs:', error);
      this.testResults.communicationLogs = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      return false;
    }
  }

  async testPerformanceMetrics() {
    console.log('\n⚡ Test 5: Métricas de Rendimiento');
    
    const performanceTests = [
      {
        name: 'Consulta simple de usuarios',
        test: () => supabase.from('users').select('id').limit(1)
      },
      {
        name: 'Consulta con JOIN',
        test: () => supabase.from('users').select('*, companies(name)').limit(1)
      },
      {
        name: 'Consulta con agregación',
        test: () => supabase.from('users').select('count', { count: 'exact', head: true })
      }
    ];
    
    for (const perfTest of performanceTests) {
      const times = [];
      
      // Ejecutar 3 veces para obtener promedio
      for (let i = 0; i < 3; i++) {
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
        console.log(`   Rango: ${minTime}ms - ${maxTime}ms`);
      }
    }
  }

  async createSampleMessageAnalysis() {
    console.log('\n🧪 Test 6: Creación de Análisis de Muestra');
    
    try {
      const sampleData = {
        original_message: 'Test message for analytics',
        optimized_message: 'Test message optimized with AI',
        channel: 'whatsapp',
        engagement_prediction: {
          score: 0.75,
          confidence: 0.8,
          prediction: 'high'
        },
        optimal_timing: {
          optimalSlots: ['09:00', '14:00'],
          currentScore: 0.6
        },
        optimizations: ['tone_optimization', 'clarity_optimization'],
        created_at: new Date().toISOString()
      };
      
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('message_analysis')
        .insert(sampleData)
        .select('id')
        .single();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error) throw error;
      
      console.log(`✅ Análisis de muestra creado (${responseTime}ms)`);
      console.log(`   ID: ${data.id}`);
      
      return data.id;
      
    } catch (error) {
      console.error('❌ Error creando análisis de muestra:', error);
      return null;
    }
  }

  async generateTestReport() {
    console.log('\n📋 Generando Reporte de Testing API...');
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: 'production',
      api: 'supabase',
      summary: {
        totalTests: 5,
        passedTests: 0,
        failedTests: 0,
        successRate: 0
      },
      results: this.testResults,
      recommendations: []
    };
    
    // Calcular totales
    const tests = [
      'databaseConnection',
      'messageAnalysisTable',
      'employeeData',
      'communicationLogs'
    ];
    
    tests.forEach(test => {
      if (this.testResults[test]) {
        report.summary.totalTests++;
        if (this.testResults[test].success) {
          report.summary.passedTests++;
        } else {
          report.summary.failedTests++;
        }
      }
    });
    
    report.summary.successRate = (report.summary.passedTests / report.summary.totalTests * 100).toFixed(1);
    
    // Generar recomendaciones
    if (report.summary.successRate < 100) {
      report.recommendations.push('Revisar configuración de base de datos y permisos');
    }
    
    if (this.testResults.performance) {
      Object.entries(this.testResults.performance).forEach(([test, metrics]) => {
        if (parseFloat(metrics.avgTime) > 500) {
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
          environment: 'production',
          test_type: 'api_validation'
        });
      
      console.log('✅ Reporte guardado en base de datos');
    } catch (error) {
      console.warn('⚠️ No se pudo guardar reporte en BD:', error);
    }
    
    return report;
  }

  async runFullAPITestSuite() {
    console.log('🧪 Iniciando Suite Completa de Testing API para Analíticas Predictivas\n');
    
    await this.testDatabaseConnection();
    await this.testMessageAnalysisTable();
    await this.testEmployeeData();
    await this.testCommunicationLogs();
    await this.testPerformanceMetrics();
    await this.createSampleMessageAnalysis();
    
    const report = await this.generateTestReport();
    
    console.log('\n🎉 Testing API Completado!');
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
  const tester = new AnalyticsAPITester();
  tester.runFullAPITestSuite()
    .then(report => {
      if (report && report.summary.successRate >= 80) {
        console.log('\n✨ Testing API completado exitosamente - Sistema listo para producción');
        process.exit(0);
      } else {
        console.log('\n⚠️ Testing API completado con advertencias - Revisar configuración');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error fatal en testing API:', error);
      process.exit(1);
    });
}

module.exports = AnalyticsAPITester;