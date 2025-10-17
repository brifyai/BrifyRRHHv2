/**
 * Script completo para configurar analíticas predictivas en producción
 * 1. Agrega columnas faltantes a users
 * 2. Crea tablas necesarias
 * 3. Genera 800 empleados
 * 4. Crea datos de muestra para analíticas
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class AnalyticsCompleteSetup {
  constructor() {
    this.setupResults = {
      columnsAdded: false,
      tablesCreated: false,
      employeesCreated: 0,
      sampleDataCreated: false,
      errors: []
    };
  }

  async addEmployeeColumns() {
    console.log('🔧 Agregando columnas de empleado a tabla users...');
    
    try {
      // Verificar si las columnas ya existen
      const { data: sampleUser, error: sampleError } = await supabase
        .from('users')
        .select('department, position, phone, status')
        .limit(1);
      
      if (!sampleError && sampleUser.length > 0) {
        const hasAllColumns = sampleUser[0].hasOwnProperty('department') &&
                             sampleUser[0].hasOwnProperty('position') &&
                             sampleUser[0].hasOwnProperty('phone') &&
                             sampleUser[0].hasOwnProperty('status');
        
        if (hasAllColumns) {
          console.log('✅ Columnas de empleado ya existen');
          this.setupResults.columnsAdded = true;
          return true;
        }
      }
      
      // Como no podemos ejecutar ALTER TABLE directamente, vamos a usar el método de migración
      console.log('⚠️ Las columnas deben agregarse manualmente ejecutando:');
      console.log('   database/add_employee_columns.sql en Supabase Dashboard');
      
      // Intentar actualizar el usuario existente para ver si las columnas existen
      const { error: updateError } = await supabase
        .from('users')
        .update({
          department: 'Administración',
          position: 'Administrador',
          phone: '+56 9 12345678',
          status: 'active'
        })
        .eq('email', 'juanpablo.riesco@example.com');
      
      if (updateError && updateError.code === 'PGRST204') {
        console.log('❌ Columnas no existen. Deben crearse manualmente.');
        this.setupResults.errors.push('Ejecutar database/add_employee_columns.sql manualmente');
        return false;
      } else if (updateError) {
        console.error('❌ Error actualizando usuario:', updateError);
        this.setupResults.errors.push(`Error actualizando: ${updateError.message}`);
        return false;
      } else {
        console.log('✅ Columnas agregadas y usuario actualizado');
        this.setupResults.columnsAdded = true;
        return true;
      }
      
    } catch (error) {
      console.error('❌ Error agregando columnas:', error);
      this.setupResults.errors.push(`Error columnas: ${error.message}`);
      return false;
    }
  }

  async createAnalyticsTables() {
    console.log('📊 Creando tablas para analíticas...');
    
    try {
      // Intentar crear tabla message_analysis
      const { error: messageError } = await supabase
        .from('message_analysis')
        .insert({
          original_message: 'test',
          channel: 'test',
          created_at: new Date().toISOString()
        });
      
      if (messageError && messageError.code === 'PGRST205') {
        console.log('❌ Tabla message_analysis no existe. Debe crearse manualmente:');
        console.log('   Ejecutar database/create_message_analysis_table.sql en Supabase Dashboard');
        this.setupResults.errors.push('Ejecutar database/create_message_analysis_table.sql manualmente');
        return false;
      } else if (messageError) {
        console.error('❌ Error creando message_analysis:', messageError);
        this.setupResults.errors.push(`Error message_analysis: ${messageError.message}`);
        return false;
      } else {
        // Limpiar el registro de prueba
        await supabase
          .from('message_analysis')
          .delete()
          .eq('original_message', 'test');
        
        console.log('✅ Tabla message_analysis verificada');
      }
      
      // Verificar tabla analytics_test_reports
      const { error: reportsError } = await supabase
        .from('analytics_test_reports')
        .insert({
          report_data: { test: true },
          environment: 'test',
          test_type: 'verification',
          created_at: new Date().toISOString()
        });
      
      if (reportsError && reportsError.code === 'PGRST205') {
        console.log('❌ Tabla analytics_test_reports no existe');
        this.setupResults.errors.push('Tabla analytics_test_reports debe crearse manualmente');
        return false;
      } else if (reportsError) {
        console.error('❌ Error creando analytics_test_reports:', reportsError);
        this.setupResults.errors.push(`Error analytics_test_reports: ${reportsError.message}`);
        return false;
      } else {
        // Limpiar el registro de prueba
        await supabase
          .from('analytics_test_reports')
          .delete()
          .eq('report_data', '{"test": true}');
        
        console.log('✅ Tabla analytics_test_reports verificada');
      }
      
      this.setupResults.tablesCreated = true;
      console.log('✅ Tablas de analíticas verificadas');
      return true;
      
    } catch (error) {
      console.error('❌ Error creando tablas:', error);
      this.setupResults.errors.push(`Error tablas: ${error.message}`);
      return false;
    }
  }

  async create800Employees() {
    console.log('👥 Creando 800 empleados para producción...');
    
    try {
      // Contar empleados actuales
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('❌ Error contando empleados:', countError);
        return false;
      }
      
      console.log(`📊 Empleados actuales: ${count}`);
      
      if (count >= 800) {
        console.log('✅ Ya hay suficientes empleados');
        this.setupResults.employeesCreated = count;
        return true;
      }
      
      const departments = ['Ventas', 'Marketing', 'Tecnología', 'Recursos Humanos', 'Finanzas', 'Operaciones'];
      const positions = [
        'Gerente', 'Supervisor', 'Analista', 'Especialista', 'Coordinador', 
        'Desarrollador', 'Diseñador', 'Consultor', 'Asistente', 'Director'
      ];
      
      const employeesToCreate = 800 - count;
      const employees = [];
      
      // Obtener el último número de empleado
      let startNumber = count + 1;
      
      for (let i = 0; i < employeesToCreate; i++) {
        const employeeNumber = startNumber + i;
        const department = departments[Math.floor(Math.random() * departments.length)];
        const position = positions[Math.floor(Math.random() * positions.length)];
        
        employees.push({
          email: `empleado${employeeNumber}@brify.com`,
          full_name: `Empleado ${employeeNumber}`,
          name: `Empleado ${employeeNumber}`,
          department,
          position,
          phone: `+56 9 ${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          status: 'active',
          is_active: true,
          registered_via: 'system',
          admin: false,
          onboarding_status: 'completed',
          registro_previo: false,
          created_at: new Date().toISOString()
        });
      }
      
      // Insertar en lotes de 50
      const batchSize = 50;
      let totalInserted = 0;
      
      for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize);
        
        try {
          const { data, error } = await supabase
            .from('users')
            .insert(batch)
            .select('id');
          
          if (error) {
            console.error(`❌ Error insertando lote ${Math.floor(i/batchSize) + 1}:`, error);
          } else {
            totalInserted += data.length;
            console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(employees.length/batchSize)} insertado (${data.length} empleados)`);
          }
        } catch (error) {
          console.error(`❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, error);
        }
      }
      
      this.setupResults.employeesCreated = totalInserted;
      
      if (totalInserted === employeesToCreate) {
        console.log(`✅ ${totalInserted} empleados creados exitosamente`);
        return true;
      } else {
        console.log(`⚠️ Solo se crearon ${totalInserted}/${employeesToCreate} empleados`);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error creando empleados:', error);
      this.setupResults.errors.push(`Error empleados: ${error.message}`);
      return false;
    }
  }

  async createSampleAnalyticsData() {
    console.log('📊 Creando datos de muestra para analíticas...');
    
    try {
      const sampleMessages = [
        {
          original_message: 'Recordatorio de reunión importante',
          optimized_message: '📅 Recordatorio: Tienes una reunión importante hoy a las 15:00. Por favor confirma tu asistencia.',
          channel: 'email'
        },
        {
          original_message: 'Nuevo proyecto disponible',
          optimized_message: '🚀 ¡Nuevo proyecto disponible! Revisa los detalles y postula antes del viernes. ¡No te lo pierdas!',
          channel: 'whatsapp'
        },
        {
          original_message: 'Actualización de sistema',
          optimized_message: '⚙️ Actualización del sistema completada. Todo funciona correctamente. Gracias por tu paciencia.',
          channel: 'slack'
        },
        {
          original_message: 'Resultado de evaluación',
          optimized_message: '📊 Tu evaluación está lista. Has obtenido excelentes resultados. ¡Felicidades por tu desempeño!',
          channel: 'email'
        },
        {
          original_message: 'Capacitación programada',
          optimized_message: '🎓 Tienes una capacitación programada para mañana. Los temas serán muy importantes para tu desarrollo profesional.',
          channel: 'whatsapp'
        }
      ];
      
      // Obtener algunos usuarios para asignar como user_id
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(10);
      
      if (usersError || users.length === 0) {
        console.error('❌ Error obteniendo usuarios para muestra:', usersError);
        return false;
      }
      
      const analyticsData = sampleMessages.map((msg, index) => ({
        ...msg,
        user_id: users[index % users.length].id,
        engagement_prediction: {
          score: 0.7 + (Math.random() * 0.3),
          confidence: 0.8 + (Math.random() * 0.2),
          prediction: Math.random() > 0.3 ? 'high' : 'medium',
          factors: {
            messageLength: 0.8,
            timeOfDay: 0.9,
            channel: msg.channel === 'whatsapp' ? 0.9 : 0.7,
            recipientCount: 0.6
          }
        },
        optimal_timing: {
          optimalSlots: ['09:00', '14:00', '16:00'],
          currentScore: 0.7 + Math.random() * 0.3,
          recommendations: ['Enviar en horario laboral', 'Personalizar mensaje']
        },
        optimizations: ['tone_optimization', 'clarity_optimization', 'personalization']
      }));
      
      const { data, error } = await supabase
        .from('message_analysis')
        .insert(analyticsData)
        .select('id');
      
      if (error) {
        console.error('❌ Error creando datos de muestra:', error);
        return false;
      }
      
      this.setupResults.sampleDataCreated = true;
      console.log(`✅ ${data.length} registros de muestra creados para analíticas`);
      return true;
      
    } catch (error) {
      console.error('❌ Error creando datos de muestra:', error);
      this.setupResults.errors.push(`Error datos muestra: ${error.message}`);
      return false;
    }
  }

  async generateSetupReport() {
    console.log('\n📋 Generando reporte de configuración...');
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: 'production',
      database: SUPABASE_URL,
      setupResults: this.setupResults,
      summary: {
        totalSteps: 4,
        completedSteps: 0,
        successRate: 0
      },
      recommendations: []
    };
    
    // Calcular pasos completados
    const steps = [
      this.setupResults.columnsAdded,
      this.setupResults.tablesCreated,
      this.setupResults.employeesCreated >= 800,
      this.setupResults.sampleDataCreated
    ];
    
    report.summary.completedSteps = steps.filter(Boolean).length;
    report.summary.successRate = (report.summary.completedSteps / report.summary.totalSteps * 100).toFixed(1);
    
    // Generar recomendaciones
    if (!this.setupResults.columnsAdded) {
      report.recommendations.push('Ejecutar database/add_employee_columns.sql en Supabase Dashboard');
    }
    
    if (!this.setupResults.tablesCreated) {
      report.recommendations.push('Ejecutar database/create_message_analysis_table.sql en Supabase Dashboard');
    }
    
    if (this.setupResults.employeesCreated < 800) {
      report.recommendations.push(`Completar creación de empleados: ${this.setupResults.employeesCreated}/800`);
    }
    
    if (!this.setupResults.sampleDataCreated) {
      report.recommendations.push('Crear datos de muestra para analíticas');
    }
    
    // Guardar reporte
    try {
      await supabase
        .from('analytics_test_reports')
        .insert({
          report_data: report,
          test_date: new Date().toISOString(),
          environment: 'production',
          test_type: 'setup_complete',
          employee_count: this.setupResults.employeesCreated
        });
      
      console.log('✅ Reporte guardado en base de datos');
    } catch (error) {
      console.warn('⚠️ No se pudo guardar reporte:', error);
    }
    
    return report;
  }

  async runCompleteSetup() {
    console.log('🚀 Iniciando Configuración Completa de Analíticas Predictivas\n');
    console.log(`📍 Base de datos: ${SUPABASE_URL}`);
    console.log(`🕐 Hora: ${new Date().toLocaleString('es-CL')}\n`);
    
    const steps = [
      { name: 'Agregar columnas de empleado', fn: () => this.addEmployeeColumns() },
      { name: 'Crear tablas de analíticas', fn: () => this.createAnalyticsTables() },
      { name: 'Crear 800 empleados', fn: () => this.create800Employees() },
      { name: 'Crear datos de muestra', fn: () => this.createSampleAnalyticsData() }
    ];
    
    let successfulSteps = 0;
    
    for (const step of steps) {
      console.log(`\n🔄 ${step.name}...`);
      const success = await step.fn();
      if (success) {
        successfulSteps++;
        console.log(`✅ ${step.name} completado`);
      } else {
        console.log(`❌ ${step.name} falló`);
      }
    }
    
    const report = await this.generateSetupReport();
    
    console.log('\n📊 Resumen de Configuración:');
    console.log(`✅ Pasos exitosos: ${report.summary.completedSteps}/${report.summary.totalSteps}`);
    console.log(`📈 Tasa de éxito: ${report.summary.successRate}%`);
    console.log(`👥 Empleados creados: ${this.setupResults.employeesCreated}`);
    console.log(`🔧 Columnas agregadas: ${this.setupResults.columnsAdded ? '✅' : '❌'}`);
    console.log(`📊 Tablas creadas: ${this.setupResults.tablesCreated ? '✅' : '❌'}`);
    console.log(`📋 Datos de muestra: ${this.setupResults.sampleDataCreated ? '✅' : '❌'}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recomendaciones:');
      report.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }
    
    const isReady = report.summary.successRate >= 75 && this.setupResults.employeesCreated >= 800;
    
    if (isReady) {
      console.log('\n✨ Configuración completada exitosamente');
      console.log('🚀 El sistema está listo para testing de analíticas predictivas');
      return true;
    } else {
      console.log('\n⚠️ Configuración incompleta - Revisar recomendaciones');
      console.log('🔧 Algunas configuraciones deben realizarse manualmente en Supabase Dashboard');
      return false;
    }
  }
}

// Ejecutar configuración si se llama directamente
if (require.main === module) {
  const setup = new AnalyticsCompleteSetup();
  setup.runCompleteSetup()
    .then(success => {
      if (success) {
        console.log('\n✨ Configuración completa finalizada');
        process.exit(0);
      } else {
        console.log('\n❌ Configuración completa falló');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error fatal en configuración:', error);
      process.exit(1);
    });
}

module.exports = AnalyticsCompleteSetup;