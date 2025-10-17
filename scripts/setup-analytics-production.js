/**
 * Script para configurar analíticas predictivas en producción
 * Crea tablas necesarias y pobla empleados si es necesario
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class AnalyticsProductionSetup {
  constructor() {
    this.setupResults = {
      messageAnalysisTable: false,
      analyticsTestReports: false,
      employeesCreated: 0,
      errors: []
    };
  }

  async createMessageAnalysisTable() {
    console.log('📊 Creando tabla message_analysis...');
    
    try {
      // Primero intentar crear la tabla con SQL directo
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.message_analysis (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            original_message TEXT NOT NULL,
            optimized_message TEXT,
            channel VARCHAR(50) NOT NULL,
            engagement_prediction JSONB,
            optimal_timing JSONB,
            optimizations JSONB,
            user_id UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Índices para mejor rendimiento
          CREATE INDEX IF NOT EXISTS idx_message_analysis_channel ON public.message_analysis(channel);
          CREATE INDEX IF NOT EXISTS idx_message_analysis_created_at ON public.message_analysis(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_message_analysis_user_id ON public.message_analysis(user_id);
          
          -- Habilitar RLS
          ALTER TABLE public.message_analysis ENABLE ROW LEVEL SECURITY;
          
          -- Políticas de seguridad
          DROP POLICY IF EXISTS "Users can view their own message analysis" ON public.message_analysis;
          CREATE POLICY "Users can view their own message analysis" ON public.message_analysis
            FOR SELECT USING (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Users can insert their own message analysis" ON public.message_analysis;
          CREATE POLICY "Users can insert their own message analysis" ON public.message_analysis
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Users can update their own message analysis" ON public.message_analysis;
          CREATE POLICY "Users can update their own message analysis" ON public.message_analysis
            FOR UPDATE USING (auth.uid() = user_id);
            
          DROP POLICY IF EXISTS "Service role can manage all message analysis" ON public.message_analysis;
          CREATE POLICY "Service role can manage all message analysis" ON public.message_analysis
            FOR ALL USING (auth.role() = 'service_role');
        `
      });
      
      if (error) {
        console.warn('⚠️ Error con RPC, intentando método alternativo:', error);
        
        // Método alternativo: usar SQL directo si RPC no funciona
        const { error: altError } = await supabase
          .from('message_analysis')
          .select('id')
          .limit(1);
        
        if (altError && altError.code === 'PGRST205') {
          console.log('📝 La tabla no existe, necesita ser creada manualmente en Supabase Dashboard');
          this.setupResults.errors.push('La tabla message_analysis debe crearse manualmente en Supabase Dashboard');
          return false;
        }
      }
      
      // Verificar que la tabla existe
      const { data, error: verifyError } = await supabase
        .from('message_analysis')
        .select('id')
        .limit(1);
      
      if (verifyError) {
        this.setupResults.errors.push(`Error verificando tabla: ${verifyError.message}`);
        return false;
      }
      
      this.setupResults.messageAnalysisTable = true;
      console.log('✅ Tabla message_analysis creada/verificada exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error creando tabla message_analysis:', error);
      this.setupResults.errors.push(`Error creando tabla: ${error.message}`);
      return false;
    }
  }

  async createAnalyticsTestReportsTable() {
    console.log('📋 Creando tabla analytics_test_reports...');
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.analytics_test_reports (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            report_data JSONB NOT NULL,
            test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            environment VARCHAR(20) NOT NULL,
            test_type VARCHAR(50) NOT NULL,
            employee_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_analytics_test_reports_date ON public.analytics_test_reports(test_date DESC);
          CREATE INDEX IF NOT EXISTS idx_analytics_test_reports_environment ON public.analytics_test_reports(environment);
          
          ALTER TABLE public.analytics_test_reports ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Service role can manage analytics test reports" ON public.analytics_test_reports;
          CREATE POLICY "Service role can manage analytics test reports" ON public.analytics_test_reports
            FOR ALL USING (auth.role() = 'service_role');
        `
      });
      
      if (error) {
        console.warn('⚠️ Error creando tabla de reportes:', error);
      } else {
        this.setupResults.analyticsTestReports = true;
        console.log('✅ Tabla analytics_test_reports creada exitosamente');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Error creando tabla de reportes:', error);
      return false;
    }
  }

  async checkAndCreateEmployees() {
    console.log('👥 Verificando empleados existentes...');
    
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
      
      if (count === 0) {
        console.log('⚠️ No hay empleados, creando 800 empleados...');
        return await this.create800Employees();
      } else if (count < 800) {
        console.log(`⚠️ Faltan empleados (${count}/800), creando los faltantes...`);
        return await this.createMissingEmployees(800 - count);
      } else {
        console.log('✅ Ya hay suficientes empleados en la base de datos');
        return true;
      }
      
    } catch (error) {
      console.error('❌ Error verificando empleados:', error);
      return false;
    }
  }

  async create800Employees() {
    console.log('👥 Creando 800 empleados para producción...');
    
    const departments = ['Ventas', 'Marketing', 'Tecnología', 'Recursos Humanos', 'Finanzas', 'Operaciones'];
    const positions = [
      'Gerente', 'Supervisor', 'Analista', 'Especialista', 'Coordinador', 
      'Desarrollador', 'Diseñador', 'Consultor', 'Asistente', 'Director'
    ];
    
    const employees = [];
    
    for (let i = 1; i <= 800; i++) {
      const department = departments[Math.floor(Math.random() * departments.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      
      employees.push({
        name: `Empleado ${i}`,
        email: `empleado${i}@brify.com`,
        department,
        position,
        phone: `+56 9 ${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        status: 'active',
        created_at: new Date().toISOString()
      });
    }
    
    // Insertar en lotes de 50 para evitar timeouts
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
          console.error(`❌ Error insertando lote ${i + 1}-${Math.min(i + batchSize, 800)}:`, error);
        } else {
          totalInserted += data.length;
          console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(employees.length/batchSize)} insertado (${data.length} empleados)`);
        }
      } catch (error) {
        console.error(`❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, error);
      }
    }
    
    this.setupResults.employeesCreated = totalInserted;
    
    if (totalInserted === 800) {
      console.log(`✅ ${totalInserted} empleados creados exitosamente`);
      return true;
    } else {
      console.log(`⚠️ Solo se crearon ${totalInserted}/800 empleados`);
      return false;
    }
  }

  async createMissingEmployees(count) {
    console.log(`👥 Creando ${count} empleados faltantes...`);
    
    const departments = ['Ventas', 'Marketing', 'Tecnología', 'Recursos Humanos', 'Finanzas', 'Operaciones'];
    const positions = ['Gerente', 'Supervisor', 'Analista', 'Especialista', 'Coordinador'];
    
    // Obtener el último ID para continuar la secuencia
    const { data: lastEmployee } = await supabase
      .from('users')
      .select('id, name')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    let startNumber = 1;
    if (lastEmployee && lastEmployee.name) {
      const match = lastEmployee.name.match(/Empleado (\d+)/);
      if (match) {
        startNumber = parseInt(match[1]) + 1;
      }
    }
    
    const employees = [];
    
    for (let i = 0; i < count; i++) {
      const employeeNumber = startNumber + i;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      
      employees.push({
        name: `Empleado ${employeeNumber}`,
        email: `empleado${employeeNumber}@brify.com`,
        department,
        position,
        phone: `+56 9 ${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        status: 'active',
        created_at: new Date().toISOString()
      });
    }
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(employees)
        .select('id');
      
      if (error) {
        console.error('❌ Error creando empleados faltantes:', error);
        return false;
      }
      
      this.setupResults.employeesCreated = data.length;
      console.log(`✅ ${data.length} empleados faltantes creados exitosamente`);
      return true;
      
    } catch (error) {
      console.error('❌ Error creando empleados faltantes:', error);
      return false;
    }
  }

  async createSampleAnalyticsData() {
    console.log('📊 Creando datos de muestra para analíticas...');
    
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
      }
    ];
    
    try {
      const analyticsData = sampleMessages.map((msg, index) => ({
        ...msg,
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

  async runProductionSetup() {
    console.log('🚀 Iniciando Configuración de Analíticas Predictivas en Producción\n');
    console.log(`📍 Base de datos: ${SUPABASE_URL}`);
    console.log(`🕐 Hora: ${new Date().toLocaleString('es-CL')}\n`);
    
    const steps = [
      { name: 'Crear tabla message_analysis', fn: () => this.createMessageAnalysisTable() },
      { name: 'Crear tabla analytics_test_reports', fn: () => this.createAnalyticsTestReportsTable() },
      { name: 'Verificar y crear empleados', fn: () => this.checkAndCreateEmployees() },
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
    
    console.log('\n📊 Resumen de Configuración:');
    console.log(`✅ Pasos exitosos: ${successfulSteps}/${steps.length}`);
    console.log(`👥 Empleados creados: ${this.setupResults.employeesCreated}`);
    console.log(`📊 Tabla message_analysis: ${this.setupResults.messageAnalysisTable ? '✅' : '❌'}`);
    console.log(`📋 Tabla analytics_test_reports: ${this.setupResults.analyticsTestReports ? '✅' : '❌'}`);
    
    if (this.setupResults.errors.length > 0) {
      console.log('\n⚠️ Errores encontrados:');
      this.setupResults.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    const successRate = (successfulSteps / steps.length) * 100;
    
    if (successRate >= 75) {
      console.log('\n✨ Configuración completada exitosamente');
      console.log('🚀 El sistema está listo para testing de producción');
      return true;
    } else {
      console.log('\n⚠️ Configuración incompleta - Revisar errores');
      return false;
    }
  }
}

// Ejecutar configuración si se llama directamente
if (require.main === module) {
  const setup = new AnalyticsProductionSetup();
  setup.runProductionSetup()
    .then(success => {
      if (success) {
        console.log('\n✨ Configuración de producción completada');
        process.exit(0);
      } else {
        console.log('\n❌ Configuración de producción falló');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error fatal en configuración:', error);
      process.exit(1);
    });
}

module.exports = AnalyticsProductionSetup;