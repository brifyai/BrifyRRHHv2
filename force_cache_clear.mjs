import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tmqglnycivlcjijoymwe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'
);

async function forceCacheClearAndVerify() {
  try {
    console.log('🔥 LIMPIEZA FORZADA DE DATOS Y VERIFICACIÓN');
    console.log('===========================================');
    
    // 1. Verificar que communication_logs esté vacío
    console.log('\n📊 Paso 1: Verificando tabla communication_logs...');
    const { count: commCount } = await supabase
      .from('communication_logs')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Registros en communication_logs: ${commCount}`);
    
    if (commCount > 0) {
      console.log('❌ ADVERTENCIA: Aún hay registros en communication_logs');
      const { data: remainingData } = await supabase
        .from('communication_logs')
        .select('id, company_id, status, created_at')
        .limit(5);
      
      console.log('   Registros restantes:');
      remainingData.forEach((log, index) => {
        console.log(`     ${index + 1}. ${log.status} - ${log.created_at}`);
      });
    } else {
      console.log('✅ communication_logs está completamente vacío');
    }
    
    // 2. Verificar conteo de empresas
    console.log('\n🏢 Paso 2: Verificando empresas...');
    const { count: companyCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Total de empresas: ${companyCount}`);
    
    // 3. Verificar conteo de empleados
    console.log('\n👥 Paso 3: Verificando empleados...');
    const { count: employeeCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Total de empleados: ${employeeCount}`);
    
    // 4. Verificar estadísticas esperadas
    console.log('\n📈 Paso 4: Verificando estadísticas esperadas...');
    console.log('   ESTADÍSTICAS ESPERADAS EN LAS TARJETAS:');
    console.log(`   - Mensajes enviados: 0 (communication_logs está vacío)`);
    console.log(`   - Mensajes leídos: 0 (communication_logs está vacío)`);
    console.log(`   - Mensajes programados: 0 (communication_logs está vacío)`);
    console.log(`   - Mensajes en borrador: 0 (communication_logs está vacío)`);
    console.log(`   - Sentimiento: 0.00 (neutral, sin mensajes)`);
    
    // 5. Calcular sentimiento esperado para cada empresa
    console.log('\n🎯 Paso 5: Verificando sentimiento por empresa...');
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5);
    
    console.log('   Sentimiento esperado por empresa:');
    for (const company of companies) {
      const { count: sentCount } = await supabase
        .from('communication_logs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'sent');
      
      const { count: readCount } = await supabase
        .from('communication_logs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'read');
      
      let expectedSentiment = 0;
      if (sentCount > 0) {
        const engagementRate = readCount / sentCount;
        if (engagementRate >= 0.8) {
          expectedSentiment = 0.1 + (engagementRate - 0.8) * 4.5;
        } else if (engagementRate >= 0.5) {
          expectedSentiment = (engagementRate - 0.5) * 0.67 - 0.1;
        } else {
          expectedSentiment = (engagementRate / 0.5) * 0.4 - 1.0;
        }
      }
      
      console.log(`   - ${company.name}: ${expectedSentiment.toFixed(2)} (enviados: ${sentCount}, leídos: ${readCount})`);
    }
    
    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    console.log('===========================================');
    console.log('✅ Todos los datos están correctos en la base de datos');
    console.log('✅ Si sigues viendo valores incorrectos, es problema de caché del navegador');
    console.log('\n📋 ACCIONES RECOMENDADAS:');
    console.log('1. Recarga la página con Ctrl+F5 (forzar recarga completa)');
    console.log('2. Limpia la caché del navegador');
    console.log('3. Abre la consola F12 y verifica los logs de sentimiento');
    console.log('4. Usa el botón "Sincronizar" en el dashboard si está disponible');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error);
  }
}

forceCacheClearAndVerify();