/**
 * Script de Testing para Analíticas Predictivas con Variables de Entorno
 * Usa las credenciales del entorno para testing en producción
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

// Obtener credenciales de variables de entorno
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: No se encontraron las variables de entorno necesarias');
  console.log('   REACT_APP_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.log('   REACT_APP_SUPABASE_SERVICE_ROLE_KEY:', process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  console.log('   REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class AnalyticsProductionTester {
  constructor() {
    this.testResults = {
      databaseConnection: false,
      messageAnalysisTable: false,
      employeeCount: 0,
      communicationLogs: false,
      performance: {},
      analyticsFunctionality: false
    };
  }

  async testDatabaseConnection() {
    console.log('🔗 Test 1: Conexión a Base de Datos Producción');
    
    try {
      const startTime = Date.now();
      
      // Test conexión básica
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error) throw error;
      
      this.testResults.databaseConnection = {
        success: true,
        responseTime,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Conexión exitosa a producción (${responseTime}ms)`);
      return true;
      
    } catch (error) {
      console.error('❌ Error en conexión a BD producción:', error);
      this.testResults.databaseConnection = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      return false;
    }
  }

  async testEmployeeCount() {
    console.log('\n👥 Test 2: Conteo de Empleados (debe ser 800)');
    
    try {
      const startTime = Date.now();
      
      // Contar todos los empleados
      const { data, error } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error) throw error;
      
      const employeeCount = data || 0;
      this.testResults.employeeCount = employeeCount;
      
      const isCorrect = employeeCount === 800;
      
      console.log(`✅ Conteo de empleados: ${employeeCount} (${responseTime}ms)`);
      console.log(`   Expected: 800 | ${isCorrect ? '✅' : '❌'} ${isCorrect ? 'Correcto' : `Diferencia: ${Math.abs(employeeCount - 800)}`}`);
      
      return isCorrect;
      
    } catch (error) {
      console.error('❌ Error contando empleados:', error);
      return false;
    }
  }

  async testMessageAnalysisTable() {
    console.log('\n📊 Test 3: Tabla de Análisis de Mensajes');
    
    try {
      const startTime = Date.now();
      
      // Verificar si existe la tabla y tiene estructura correcta
      const { data, error } = await supabase
        .from('message_analysis')
        .select('*')
        .limit(1);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error && error.code !== 'PGRST116') {
        // Si la tabla no existe, crearla
        console.log('⚠️ Tabla message_analysis no existe, creándola...');
        await this.createMessageAnalysisTable();
        
        // Reintentar después de crear
        const retry = await supabase
          .from('message_analysis')
          .select('*')
          .limit(1);
        
        if (retry.error) throw retry.error;
      }
      
      this.testResults.messageAnalysisTable = {
        success: true,
        hasData: data && data.length > 0,
        responseTime,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Tabla message_analysis accesible (${responseTime}ms)`);
      return true;
      
    } catch (error) {
      console.error('❌ Error con message_analysis:', error);
      this.testResults.messageAnalysisTable = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      return false;
    }
  }

  async createMessageAnalysisTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS message_analysis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        original_message TEXT NOT NULL,
        optimized_message TEXT,
        channel VARCHAR(50) NOT NULL,
        engagement_prediction JSONB,
        optimal_timing JSONB,
        optimizations JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_message_analysis_channel ON message_analysis(channel);
      CREATE INDEX IF NOT EXISTS idx_message_analysis_created_at ON message_analysis(created_at DESC);
      
      ALTER TABLE message_analysis ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users can manage their message analysis" ON message_analysis;
      CREATE POLICY "Users can manage their message analysis" ON message_analysis
          FOR ALL USING (auth.role() = 'authenticated');
    `;
    
    // Ejecutar cada sentencia por separado
    const statements = createTableSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      try {
        await supabase.rpc('exec_sql', { sql_query: statement.trim() });
      } catch (error) {
        console.warn('Advertencia creando tabla:', error.message);
      }
    }
  }

  async testAnalyticsFunctionality() {
    console.log('\n🤖 Test 4: Funcionalidad de Analíticas');
    
    try {
      // Crear un registro de prueba
      const testData = {
        original_message: 'Test de analíticas predictivas',
        optimized_message: 'Test optimizado con IA para mayor engagement',
        channel: 'whatsapp',
        engagement_prediction: {
          score: 0.85,
          confidence: 0.9,
          prediction: 'high',
          factors: {
            messageLength: 0.8,
            timeOfDay: 0.9,
            channel: 0.8,
            recipientCount: 0.7
          }
        },
        optimal_timing: {
          optimalSlots: ['09:00', '14:00', '16:00'],
          currentScore: 0.7,
          recommendations: ['Enviar en horario laboral']
        },
        optimizations: ['tone_optimization', 'clarity_optimization', 'personalization']
      };
      
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('message_analysis')
        .insert(testData)
        .select('id')
        .single();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error) throw error;
      
      // Verificar que se pueda recuperar el dato
      const { data: retrieved, error: retrieveError } = await supabase
        .from('message_analysis')
        .select('*')
        .eq('id', data.id)
        .single();
      
      if (retrieveError) throw retrieveError;
      
      this.testResults.analyticsFunctionality = {
        success: true,
        createdId: data.id,
        responseTime,
        hasCorrectStructure: retrieved.engagement_prediction && retrieved.optimizations,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Funcionalidad de analíticas verificada (${responseTime}ms)`);
      console.log(`   ID creado: ${data.id}`);
      console.log(`   Estructura correcta: ${retrieved.engagement_prediction && retrieved.optimizations ? '✅' : '❌'}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error en funcionalidad de analíticas:', error);
      this.testResults.analyticsFunctionality = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      return false;
    }
  }

  async testPerformanceMetrics() {
    console.log('\n⚡ Test 5: Métricas de Rendimiento en Producción');
    
    const performanceTests = [
      {
        name: 'Consulta de empleados (tabla grande)',
        test: () => supabase.from('users').select('id, name, email, department').limit(100)
      },
      {
        name: 'Consulta con agregación',
        test: () => supabase.from('users').select('count', { count: 'exact', head: true })
      },
      {
        name: 'Inserción en message_analysis',
        test: () => supabase.from('message_analysis').insert({
          original_message: 'Performance test',
          channel: 'test',
          created_at: new Date().toISOString()
        }).select('id').single()
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
        
        // Evaluar rendimiento
        if (avgTime > 500) {
          console.log(`   ⚠️  Rendimiento lento (>500ms)`);
        } else if (avgTime > 200) {
          console.log(`   ⚠️  Rendimiento moderado (200-500ms)`);
        } else {
          console.log(`   ✅ Rendimiento óptimo (<200ms)`);
        }
      }
    }
  }

  async generateProductionReport() {
    console.log('\n📋 Generando Reporte de Testing en Producción...');
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: 'production',
      database: SUPABASE_URL,
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
      'employeeCount',
      'messageAnalysisTable',
      'analyticsFunctionality'
    ];
    
    tests.forEach(test => {
      if (test === 'employeeCount') {
        report.summary.totalTests++;
        if (this.testResults[test] === 800) {
          report.summary.passedTests++;
        } else {
          report.summary.failedTests++;
        }
      } else if (this.testResults[test]) {
        report.summary.totalTests++;
        if (this.testResults[test].success) {
          report.summary.passedTests++;
        } else {
          report.summary.failedTests++;
        }
      }
    });
    
    report.summary.successRate = (report.summary.passedTests / report.summary.totalTests * 100).toFixed(1);
    
    // Generar recomendaciones específicas para producción
    if (this.testResults.employeeCount !== 800) {
      report.recommendations.push(`Verificar conteo de empleados: Actual ${this.testResults.employeeCount}, Expected 800`);
    }
    
    if (!this.testResults.messageAnalysisTable.success) {
      report.recommendations.push('Revisar configuración de tabla message_analysis');
    }
    
    if (!this.testResults.analyticsFunctionality.success) {
      report.recommendations.push('Revisar funcionalidad de analíticas predictivas');
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
          test_type: 'production_validation',
          employee_count: this.testResults.employeeCount
        });
      
      console.log('✅ Reporte guardado en base de datos de producción');
    } catch (error) {
      console.warn('⚠️ No se pudo guardar reporte en BD:', error);
    }
    
    return report;
  }

  async runProductionTestSuite() {
    console.log('🚀 Iniciando Suite Completa de Testing en Producción para Analíticas Predictivas\n');
    console.log(`📍 Base de datos: ${SUPABASE_URL}`);
    console.log(`🕐 Hora: ${new Date().toLocaleString('es-CL')}\n`);
    
    await this.testDatabaseConnection();
    await this.testEmployeeCount();
    await this.testMessageAnalysisTable();
    await this.testAnalyticsFunctionality();
    await this.testPerformanceMetrics();
    
    const report = await this.generateProductionReport();
    
    console.log('\n🎉 Testing en Producción Completado!');
    console.log(`✅ Tests exitosos: ${report.summary.passedTests}/${report.summary.totalTests}`);
    console.log(`📈 Tasa de éxito: ${report.summary.successRate}%`);
    console.log(`👥 Empleados verificados: ${this.testResults.employeeCount}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recomendaciones para producción:');
      report.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }
    
    // Verificar si el sistema está listo para escalar
    const isReadyForScaling = 
      report.summary.successRate >= 80 && 
      this.testResults.employeeCount === 800 &&
      this.testResults.analyticsFunctionality.success;
    
    if (isReadyForScaling) {
      console.log('\n✨ Sistema listo para escalar a todos los empleados');
      console.log('🚀 Puede proceder con los siguientes pasos:');
      console.log('   1. Activar analíticas para todos los usuarios');
      console.log('   2. Configurar monitoreo continuo');
      console.log('   3. Implementar optimización automática');
    } else {
      console.log('\n⚠️ Sistema necesita ajustes antes de escalar');
    }
    
    return report;
  }
}

// Ejecutar testing si se llama directamente
if (require.main === module) {
  const tester = new AnalyticsProductionTester();
  tester.runProductionTestSuite()
    .then(report => {
      if (report) {
        console.log('\n✨ Testing en producción completado');
        process.exit(0);
      } else {
        console.log('\n❌ Testing en producción falló');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error fatal en testing producción:', error);
      process.exit(1);
    });
}

module.exports = AnalyticsProductionTester;