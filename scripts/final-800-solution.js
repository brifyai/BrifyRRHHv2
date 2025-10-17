/**
 * Solución definitiva para crear 800 empleados
 * Funciona con la base de datos configurada correctamente
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });
const { v4: uuidv4 } = require('uuid');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class FinalEmployeeSolution {
  constructor() {
    this.createdCount = 0;
    this.errors = [];
  }

  async checkDatabaseStructure() {
    console.log('🔍 Verificando estructura de la base de datos...');
    
    try {
      // Verificar tabla users
      const { data: usersColumns, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        console.error('❌ Error verificando tabla users:', usersError);
        return false;
      }
      
      if (usersColumns.length > 0) {
        const columns = Object.keys(usersColumns[0]);
        const hasRequiredColumns = columns.includes('department') && 
                                  columns.includes('position') && 
                                  columns.includes('phone') && 
                                  columns.includes('status');
        
        console.log(`✅ Tabla users verificada - Columnas: ${columns.join(', ')}`);
        console.log(`   ¿Tiene columnas requeridas? ${hasRequiredColumns ? '✅' : '❌'}`);
        
        if (!hasRequiredColumns) {
          console.log('⚠️ Ejecuta database/complete_database_setup.sql en Supabase Dashboard');
          return false;
        }
      }
      
      // Verificar tabla message_analysis
      const { data: messageAnalysis, error: analysisError } = await supabase
        .from('message_analysis')
        .select('*')
        .limit(1);
      
      if (analysisError && analysisError.code === 'PGRST205') {
        console.log('⚠️ Tabla message_analysis no existe');
        console.log('   Ejecuta database/complete_database_setup.sql en Supabase Dashboard');
        return false;
      } else if (analysisError) {
        console.error('❌ Error verificando message_analysis:', analysisError);
        return false;
      } else {
        console.log('✅ Tabla message_analysis verificada');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error verificando estructura:', error);
      return false;
    }
  }

  async getCurrentEmployeeCount() {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('❌ Error contando empleados:', error);
      return 0;
    }
  }

  async create800Employees() {
    console.log('\n👥 Creando 800 empleados con estructura completa...\n');
    
    try {
      const currentCount = await this.getCurrentEmployeeCount();
      console.log(`📊 Empleados actuales: ${currentCount}`);
      
      if (currentCount >= 800) {
        console.log('✅ Ya hay suficientes empleados');
        this.createdCount = currentCount;
        return true;
      }
      
      const employeesToCreate = 800 - currentCount;
      console.log(`📝 Necesitamos crear ${employeesToCreate} empleados\n`);
      
      const departments = ['Ventas', 'Marketing', 'Tecnología', 'Recursos Humanos', 'Finanzas', 'Operaciones'];
      const positions = [
        'Gerente', 'Supervisor', 'Analista', 'Especialista', 'Coordinador', 
        'Desarrollador', 'Diseñador', 'Consultor', 'Asistente', 'Director'
      ];
      
      // Crear empleados en lotes más pequeños para evitar timeouts
      const batchSize = 25;
      let totalInserted = 0;
      
      for (let i = 0; i < employeesToCreate; i += batchSize) {
        const batch = [];
        const batchEnd = Math.min(i + batchSize, employeesToCreate);
        
        for (let j = i; j < batchEnd; j++) {
          const employeeNumber = currentCount + j + 1;
          const department = departments[(employeeNumber - 1) % departments.length];
          const position = positions[(employeeNumber - 1) % positions.length];
          
          batch.push({
            id: uuidv4(),
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        
        try {
          const { data, error } = await supabase
            .from('users')
            .insert(batch)
            .select('id');
          
          if (error) {
            console.error(`❌ Error insertando lote ${Math.floor(i/batchSize) + 1}:`, error.message);
            this.errors.push(`Lote ${Math.floor(i/batchSize) + 1}: ${error.message}`);
          } else {
            totalInserted += data.length;
            console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(employeesToCreate/batchSize)} insertado (${data.length} empleados)`);
          }
        } catch (error) {
          console.error(`❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, error.message);
          this.errors.push(`Lote ${Math.floor(i/batchSize) + 1}: ${error.message}`);
        }
        
        // Pausa entre lotes
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      this.createdCount = totalInserted + currentCount;
      
      console.log(`\n📊 Total empleados creados: ${totalInserted}`);
      console.log(`📊 Total empleados en BD: ${this.createdCount}`);
      
      return this.createdCount >= 800;
      
    } catch (error) {
      console.error('❌ Error general creando empleados:', error);
      this.errors.push(`Error general: ${error.message}`);
      return false;
    }
  }

  async createSampleAnalyticsData() {
    console.log('\n📊 Creando datos de muestra para analíticas...');
    
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
      
      // Obtener algunos usuarios para asignar
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(10);
      
      if (usersError || users.length === 0) {
        console.log('⚠️ No hay usuarios suficientes para crear datos de muestra');
        return false;
      }
      
      const analyticsData = sampleMessages.map((msg, index) => ({
        original_message: msg.original_message,
        optimized_message: msg.optimized_message,
        channel: msg.channel,
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
      
      console.log(`✅ ${data.length} registros de muestra creados para analíticas`);
      return true;
      
    } catch (error) {
      console.error('❌ Error creando datos de muestra:', error);
      return false;
    }
  }

  async verifyFinalResult() {
    console.log('\n🔍 Verificando resultado final...');
    
    try {
      const finalCount = await this.getCurrentEmployeeCount();
      
      console.log(`📊 Total final de empleados: ${finalCount}`);
      
      if (finalCount >= 800) {
        console.log('✅ Objetivo de 800 empleados alcanzado');
        console.log('🌐 El dashboard ahora debería mostrar 800 carpetas');
        console.log('🌐 Verificar en: http://localhost:3003/panel-principal');
        return true;
      } else {
        console.log(`⚠️ Faltan ${800 - finalCount} empleados para alcanzar el objetivo`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error verificando resultado:', error);
      return false;
    }
  }

  async createTestReport() {
    console.log('\n📋 Creando reporte de prueba...');
    
    try {
      const report = {
        timestamp: new Date().toISOString(),
        environment: 'production',
        database: SUPABASE_URL,
        employees_created: this.createdCount,
        errors: this.errors,
        success: this.createdCount >= 800,
        test_type: 'final_800_solution'
      };
      
      const { data, error } = await supabase
        .from('analytics_test_reports')
        .insert({
          report_data: report,
          test_date: new Date().toISOString(),
          environment: 'production',
          test_type: 'final_800_solution',
          employee_count: this.createdCount
        })
        .select('id');
      
      if (error) {
        console.warn('⚠️ No se pudo guardar reporte:', error);
      } else {
        console.log('✅ Reporte guardado en base de datos');
      }
    } catch (error) {
      console.warn('⚠️ Error creando reporte:', error);
    }
  }

  async runFinalSolution() {
    console.log('🚀 Iniciando Solución Definitiva para 800 Empleados\n');
    console.log(`📍 Base de datos: ${SUPABASE_URL}`);
    console.log(`🕐 Hora: ${new Date().toLocaleString('es-CL')}\n`);
    
    // Paso 1: Verificar estructura
    const structureOk = await this.checkDatabaseStructure();
    if (!structureOk) {
      console.log('\n❌ La estructura de la base de datos no es correcta');
      console.log('💡 Ejecuta database/complete_database_setup.sql en Supabase Dashboard');
      return false;
    }
    
    // Paso 2: Crear empleados
    const employeesOk = await this.create800Employees();
    
    if (employeesOk) {
      // Paso 3: Crear datos de muestra
      await this.createSampleAnalyticsData();
      
      // Paso 4: Verificar resultado
      await this.verifyFinalResult();
      
      // Paso 5: Crear reporte
      await this.createTestReport();
      
      console.log('\n✨ Solución definitiva completada exitosamente');
      console.log('🎯 El dashboard ahora debería mostrar 800 carpetas');
      console.log('🌐 Verificar en: http://localhost:3003/panel-principal');
      console.log('\n📋 Resumen:');
      console.log(`   - Empleados creados: ${this.createdCount}`);
      console.log(`   - Errores: ${this.errors.length}`);
      console.log(`   - Estado: ✅ Completado`);
      
      return true;
    } else {
      console.log('\n❌ No se pudo completar la creación de 800 empleados');
      console.log(`💡 Empleados creados: ${this.createdCount}`);
      console.log(`❌ Errores: ${this.errors.length}`);
      
      if (this.errors.length > 0) {
        console.log('\n📋 Primeros errores:');
        this.errors.slice(0, 5).forEach(error => console.log(`   - ${error}`));
        if (this.errors.length > 5) {
          console.log(`   ... y ${this.errors.length - 5} errores más`);
        }
      }
      
      return false;
    }
  }
}

// Ejecutar solución si se llama directamente
if (require.main === module) {
  const solution = new FinalEmployeeSolution();
  solution.runFinalSolution()
    .then(success => {
      if (success) {
        console.log('\n✨ Solución definitiva finalizada');
        process.exit(0);
      } else {
        console.log('\n❌ Solución definitiva falló');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error fatal en solución definitiva:', error);
      process.exit(1);
    });
}

module.exports = FinalEmployeeSolution;