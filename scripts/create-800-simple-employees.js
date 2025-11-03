/**
 * Script simplificado para crear 800 empleados
 * Usa solo las columnas existentes y genera UUIDs manualmente
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });
const { v4: uuidv4 } = require('uuid');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class SimpleEmployeeCreator {
  constructor() {
    this.createdCount = 0;
    this.errors = [];
  }

  async checkCurrentEmployees() {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count;
    } catch (error) {
      console.error('❌ Error contando empleados:', error);
      return 0;
    }
  }

  async createSimpleEmployees() {
    console.log('👥 Creando 800 empleados simplificados...\n');
    
    try {
      const currentCount = await this.checkCurrentEmployees();
      console.log(`📊 Empleados actuales: ${currentCount}`);
      
      if (currentCount >= 800) {
        console.log('✅ Ya hay suficientes empleados');
        this.createdCount = currentCount;
        return true;
      }
      
      const employeesToCreate = 800 - currentCount;
      console.log(`📝 Necesitamos crear ${employeesToCreate} empleados\n`);
      
      // Crear empleados uno por uno para evitar errores
      for (let i = 1; i <= employeesToCreate; i++) {
        const employeeNumber = currentCount + i;
        
        const employee = {
          id: uuidv4(), // Generar UUID manualmente
          email: `empleado${employeeNumber}@brify.com`,
          full_name: `Empleado ${employeeNumber}`,
          name: `Empleado ${employeeNumber}`,
          is_active: true,
          registered_via: 'system',
          admin: false,
          onboarding_status: 'completed',
          registro_previo: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        try {
          const { data, error } = await supabase
            .from('users')
            .insert(employee)
            .select('id')
            .single();
          
          if (error) {
            console.error(`❌ Error creando empleado ${employeeNumber}:`, error.message);
            this.errors.push(`Empleado ${employeeNumber}: ${error.message}`);
          } else {
            this.createdCount++;
            
            // Mostrar progreso cada 50 empleados
            if (this.createdCount % 50 === 0) {
              console.log(`✅ Creados ${this.createdCount}/${employeesToCreate} empleados`);
            }
          }
        } catch (error) {
          console.error(`❌ Error fatal creando empleado ${employeeNumber}:`, error);
          this.errors.push(`Empleado ${employeeNumber}: ${error.message}`);
        }
        
        // Pequeña pausa para no sobrecargar la BD
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      const finalCount = await this.checkCurrentEmployees();
      console.log(`\n📊 Resultado final: ${finalCount} empleados en la base de datos`);
      
      return finalCount >= 800;
      
    } catch (error) {
      console.error('❌ Error general creando empleados:', error);
      this.errors.push(`Error general: ${error.message}`);
      return false;
    }
  }

  async createSimpleAnalyticsData() {
    console.log('\n📊 Creando datos simples para analíticas...');
    
    try {
      // Obtener algunos usuarios para asignar a los datos
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name')
        .limit(10);
      
      if (usersError || users.length === 0) {
        console.log('⚠️ No hay usuarios suficientes para crear datos de muestra');
        return false;
      }
      
      // Crear datos usando companies como tabla alternativa
      const sampleData = users.map((user, index) => ({
        id: uuidv4(),
        name: `Análisis ${user.full_name}`,
        description: `Datos de análisis para ${user.full_name}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { data, error } = await supabase
        .from('companies')
        .insert(sampleData)
        .select('id');
      
      if (error) {
        console.error('❌ Error creando datos de muestra:', error);
        return false;
      }
      
      console.log(`✅ ${data.length} registros de muestra creados en companies`);
      return true;
      
    } catch (error) {
      console.error('❌ Error creando datos de muestra:', error);
      return false;
    }
  }

  async verifyFinalCount() {
    console.log('\n🔍 Verificando conteo final...');
    
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      console.log(`📊 Total final de empleados: ${count}`);
      
      if (count >= 800) {
        console.log('✅ Objetivo de 800 empleados alcanzado');
        return true;
      } else {
        console.log(`⚠️ Faltan ${800 - count} empleados para alcanzar el objetivo`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error verificando conteo final:', error);
      return false;
    }
  }

  async runSimpleCreation() {
    console.log('🚀 Iniciando Creación Simplificada de Empleados\n');
    console.log(`📍 Base de datos: ${SUPABASE_URL}`);
    console.log(`🕐 Hora: ${new Date().toLocaleString('es-CL')}\n`);
    
    const success = await this.createSimpleEmployees();
    
    if (success) {
      await this.createSimpleAnalyticsData();
      await this.verifyFinalCount();
      
      console.log('\n✨ Proceso completado exitosamente');
      console.log('🎯 El dashboard ahora debería mostrar 800 carpetas');
      console.log('🌐 Verificar en: http://localhost:3003/panel-principal');
      
      if (this.errors.length > 0) {
        console.log(`\n⚠️ Se encontraron ${this.errors.length} errores durante el proceso`);
      }
      
      return true;
    } else {
      console.log('\n❌ No se pudo completar la creación de empleados');
      console.log(`💡 Empleados creados: ${this.createdCount}`);
      console.log(`❌ Errores: ${this.errors.length}`);
      
      if (this.errors.length > 0) {
        console.log('\n📋 Lista de errores:');
        this.errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
        if (this.errors.length > 10) {
          console.log(`   ... y ${this.errors.length - 10} errores más`);
        }
      }
      
      return false;
    }
  }
}

// Ejecutar creación si se llama directamente
if (require.main === module) {
  const creator = new SimpleEmployeeCreator();
  creator.runSimpleCreation()
    .then(success => {
      if (success) {
        console.log('\n✨ Creación de empleados finalizada');
        process.exit(0);
      } else {
        console.log('\n❌ Creación de empleados falló');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error fatal en creación:', error);
      process.exit(1);
    });
}

module.exports = SimpleEmployeeCreator;