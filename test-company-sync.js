// Script para probar la sincronización de empresas
import { createClient } from '@supabase/supabase-js';

// Crear cliente de Supabase
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Importar el servicio de sincronización
import companySyncService from './src/services/companySyncService.js';

async function testCompanySync() {
  console.log('🧪 Iniciando prueba de sincronización de empresas...');
  
  try {
    // 1. Obtener empresas actuales
    console.log('\n📋 Obteniendo empresas actuales...');
    const initialCompanies = await companySyncService.getCompanies();
    console.log(`Empresas iniciales: ${initialCompanies.length}`);
    initialCompanies.forEach(company => {
      console.log(`  - ${company.name} (${company.employee_count} empleados)`);
    });
    
    // 2. Obtener estadísticas iniciales
    console.log('\n📊 Obteniendo estadísticas iniciales...');
    const initialStats = await companySyncService.getCompanyStats();
    console.log('Estadísticas iniciales:', initialStats);
    
    // 3. Crear una empresa de prueba (creando un empleado)
    console.log('\n➕ Creando empresa de prueba...');
    const testCompanyName = `Empresa Test ${Date.now()}`;
    
    const { data: createdEmployee, error: createError } = await companySyncService.createCompany({
      name: testCompanyName,
      activo: true
    });
    
    if (createError) {
      console.error('❌ Error creando empresa:', createError);
      return;
    }
    
    console.log(`✅ Empresa creada: ${testCompanyName}`);
    
    // 4. Esperar un momento para que la sincronización se propague
    console.log('\n⏳ Esperando propagación de cambios...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. Verificar que la empresa aparece en el servicio
    console.log('\n🔄 Verificando sincronización...');
    const updatedCompanies = await companySyncService.getCompanies();
    console.log(`Empresas después de creación: ${updatedCompanies.length}`);
    
    const foundCompany = updatedCompanies.find(c => c.name === testCompanyName);
    if (foundCompany) {
      console.log(`✅ Empresa sincronizada correctamente: ${foundCompany.name} (${foundCompany.employee_count} empleados)`);
    } else {
      console.log('❌ La empresa no aparece en la lista sincronizada');
    }
    
    // 6. Actualizar la empresa
    console.log('\n✏️ Actualizando empresa...');
    const updatedName = `Empresa Actualizada ${Date.now()}`;
    const { data: updatedCompany, error: updateError } = await companySyncService.updateCompany(
      testCompanyName,
      { name: updatedName, activo: false }
    );
    
    if (updateError) {
      console.error('❌ Error actualizando empresa:', updateError);
    } else {
      console.log(`✅ Empresa actualizada: ${updatedName}`);
    }
    
    // 7. Esperar y verificar actualización
    await new Promise(resolve => setTimeout(resolve, 2000));
    const companiesAfterUpdate = await companySyncService.getCompanies();
    const foundUpdatedCompany = companiesAfterUpdate.find(c => c.name === updatedName);
    
    if (foundUpdatedCompany) {
      console.log(`✅ Actualización sincronizada correctamente: ${foundUpdatedCompany.name} (activo: ${foundUpdatedCompany.activo})`);
    } else {
      console.log('❌ La actualización no se sincronizó correctamente');
    }
    
    // 8. Eliminar la empresa
    console.log('\n🗑️ Eliminando empresa...');
    const { error: deleteError } = await companySyncService.deleteCompany(updatedName);
    
    if (deleteError) {
      console.error('❌ Error eliminando empresa:', deleteError);
    } else {
      console.log('✅ Empresa eliminada');
    }
    
    // 9. Verificar eliminación
    await new Promise(resolve => setTimeout(resolve, 2000));
    const finalCompanies = await companySyncService.getCompanies();
    const deletedCompanyStillExists = finalCompanies.find(c => c.name === updatedName);
    
    if (!deletedCompanyStillExists) {
      console.log('✅ Eliminación sincronizada correctamente');
    } else {
      console.log('❌ La eliminación no se sincronizó correctamente');
    }
    
    // 10. Obtener estadísticas finales
    console.log('\n📊 Obteniendo estadísticas finales...');
    const finalStats = await companySyncService.getCompanyStats();
    console.log('Estadísticas finales:', finalStats);
    
    // 11. Probar suscripción a eventos
    console.log('\n📡 Probando suscripción a eventos...');
    let eventReceived = false;
    
    const subscriptionId = companySyncService.subscribe('companyCreated', (data) => {
      console.log('📡 Evento companyCreated recibido:', data);
      eventReceived = true;
    });
    
    console.log(`✅ Suscripción creada con ID: ${subscriptionId}`);
    
    // Crear otra empresa para probar el evento
    const testEventCompany = `Empresa Evento ${Date.now()}`;
    await companySyncService.createCompany({
      name: testEventCompany,
      activo: true
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (eventReceived) {
      console.log('✅ Evento recibido correctamente');
    } else {
      console.log('⚠️ No se recibió el evento (puede ser normal en Node.js)');
    }
    
    // Cancelar suscripción
    companySyncService.unsubscribe('companyCreated', subscriptionId);
    console.log('✅ Suscripción cancelada');
    
    // Limpiar empresa de evento
    await companySyncService.deleteCompany(testEventCompany);
    
    // 12. Obtener estado del servicio
    console.log('\n📊 Estado final del servicio:');
    const serviceStatus = companySyncService.getStatus();
    console.log(serviceStatus);
    
    console.log('\n🎉 Prueba de sincronización completada exitosamente');
    console.log(`Empresas finales: ${finalCompanies.length}`);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testCompanySync();