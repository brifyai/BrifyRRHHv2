/**
 * Script para verificar la configuración de gamificación
 * Funciona tanto antes como después de crear las tablas
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = 'https://tmqglnycivlcjijoymwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class GamificationVerifier {
  constructor() {
    this.results = [];
  }

  async verifySetup() {
    console.log('🔍 VERIFICACIÓN DEL SISTEMA DE GAMIFICACIÓN');
    console.log('=' .repeat(50));

    try {
      // 1. Verificar conexión básica
      await this.verifyBasicConnection();
      
      // 2. Verificar tablas de gamificación
      await this.verifyGamificationTables();
      
      // 3. Verificar datos iniciales
      await this.verifyInitialData();
      
      // 4. Generar reporte final
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Error en verificación:', error);
    }
  }

  async verifyBasicConnection() {
    console.log('\n🔌 Verificando conexión básica...');
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1);

      if (error) {
        throw new Error(`Error de conexión: ${error.message}`);
      }

      this.addResult('Conexión a Supabase', true, 'Conexión exitosa');
      console.log('   ✅ Conexión a Supabase exitosa');
    } catch (error) {
      this.addResult('Conexión a Supabase', false, error.message);
      console.log(`   ❌ Error de conexión: ${error.message}`);
    }
  }

  async verifyGamificationTables() {
    console.log('\n📊 Verificando tablas de gamificación...');
    
    const tables = [
      { name: 'gamification_levels', description: 'Niveles de gamificación' },
      { name: 'achievements', description: 'Logros desbloqueables' },
      { name: 'employee_gamification', description: 'Datos de gamificación por empleado' },
      { name: 'points_history', description: 'Historial de puntos' },
      { name: 'leaderboards', description: 'Clasificaciones competitivas' },
      { name: 'rewards', description: 'Recompensas canjeables' }
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);

        if (error && error.code === 'PGRST116') {
          this.addResult(`Tabla ${table.name}`, false, 'Tabla no existe');
          console.log(`   ❌ ${table.description}: Tabla no existe`);
        } else if (error) {
          this.addResult(`Tabla ${table.name}`, false, error.message);
          console.log(`   ⚠️ ${table.description}: ${error.message}`);
        } else {
          this.addResult(`Tabla ${table.name}`, true, 'Tabla existe y es accesible');
          console.log(`   ✅ ${table.description}: Tabla verificada`);
        }
      } catch (error) {
        this.addResult(`Tabla ${table.name}`, false, error.message);
        console.log(`   ❌ ${table.description}: ${error.message}`);
      }
    }
  }

  async verifyInitialData() {
    console.log('\n📋 Verificando datos iniciales...');
    
    // Verificar niveles
    try {
      const { data: levels, error: levelsError } = await supabase
        .from('gamification_levels')
        .select('*');

      if (!levelsError && levels) {
        console.log(`   ✅ Niveles de gamificación: ${levels.length} niveles encontrados`);
        this.addResult('Datos iniciales - Niveles', true, `${levels.length} niveles`);
      } else {
        console.log(`   ⚠️ Niveles de gamificación: No accesible`);
        this.addResult('Datos iniciales - Niveles', false, 'No accesible');
      }
    } catch (error) {
      console.log(`   ❌ Error verificando niveles: ${error.message}`);
      this.addResult('Datos iniciales - Niveles', false, error.message);
    }

    // Verificar logros
    try {
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');

      if (!achievementsError && achievements) {
        console.log(`   ✅ Logros: ${achievements.length} logros encontrados`);
        this.addResult('Datos iniciales - Logros', true, `${achievements.length} logros`);
      } else {
        console.log(`   ⚠️ Logros: No accesible`);
        this.addResult('Datos iniciales - Logros', false, 'No accesible');
      }
    } catch (error) {
      console.log(`   ❌ Error verificando logros: ${error.message}`);
      this.addResult('Datos iniciales - Logros', false, error.message);
    }

    // Verificar recompensas
    try {
      const { data: rewards, error: rewardsError } = await supabase
        .from('rewards')
        .select('*');

      if (!rewardsError && rewards) {
        console.log(`   ✅ Recompensas: ${rewards.length} recompensas encontradas`);
        this.addResult('Datos iniciales - Recompensas', true, `${rewards.length} recompensas`);
      } else {
        console.log(`   ⚠️ Recompensas: No accesible`);
        this.addResult('Datos iniciales - Recompensas', false, 'No accesible');
      }
    } catch (error) {
      console.log(`   ❌ Error verificando recompensas: ${error.message}`);
      this.addResult('Datos iniciales - Recompensas', false, error.message);
    }
  }

  addResult(test, success, details) {
    this.results.push({
      test,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 REPORTE DE VERIFICACIÓN');
    console.log('=' .repeat(50));

    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const successRate = ((successfulTests / totalTests) * 100).toFixed(1);

    console.log(`\n📈 Resumen:`);
    console.log(`   Total de verificaciones: ${totalTests}`);
    console.log(`   Exitosas: ${successfulTests}`);
    console.log(`   Fallidas: ${failedTests}`);
    console.log(`   Tasa de éxito: ${successRate}%`);

    // Mostrar resultados fallidos
    const failedResults = this.results.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log(`\n❌ Verificaciones fallidas:`);
      failedResults.forEach(result => {
        console.log(`   • ${result.test}: ${result.details}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    
    if (successRate >= 80) {
      console.log('🎉 SISTEMA DE GAMIFICACIÓN CONFIGURADO CORRECTAMENTE');
      console.log('💡 El sistema está listo para usar');
    } else {
      console.log('⚠️ SISTEMA REQUIERE CONFIGURACIÓN ADICIONAL');
      console.log('💡 Ejecuta el SQL en Supabase para completar la configuración');
    }
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    if (successRate < 100) {
      console.log('1. Copia el contenido del archivo: database/gamification-tables-only.sql');
      console.log('2. Ve a https://app.supabase.com/project/tmqglnycivlcjijoymwe/sql');
      console.log('3. Pega y ejecuta el SQL');
      console.log('4. Vuelve a ejecutar este script de verificación');
    } else {
      console.log('1. El sistema está listo para usar');
      console.log('2. Prueba el dashboard en: http://localhost:3003/panel-principal');
      console.log('3. Verifica que el contador de carpetas muestra 800');
    }
    
    console.log('=' .repeat(50));
  }
}

// Ejecutar verificación
const verifier = new GamificationVerifier();
verifier.verifySetup().catch(console.error);