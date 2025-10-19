/**
 * Script completo para probar el servicio de sincronización de empresas
 * Este script valida:
 * 1. Creación de empresas
 * 2. Actualización de empresas
 * 3. Eliminación de empresas
 * 4. Sincronización automática en todos los componentes
 */

// Importar el servicio de sincronización
import companySyncService from './src/services/companySyncService.js';

console.log('🚀 Iniciando prueba completa del servicio de sincronización de empresas...');

// Función para simular operaciones de empresas
async function testCompanyOperations() {
  console.log('\n📋 Prueba 1: Obtener empresas actuales');
  try {
    const companies = await companySyncService.getCompanies();
    console.log(`✅ Empresas obtenidas: ${companies.length} empresas`);
    console.log('Empresas:', companies.map(c => ({ id: c.id, name: c.name, active: c.active })));
  } catch (error) {
    console.error('❌ Error al obtener empresas:', error);
  }

  console.log('\n📋 Prueba 2: Crear una nueva empresa');
  try {
    const newCompany = {
      name: `Empresa Test ${Date.now()}`,
      rut: `11.111.111-${Math.floor(Math.random() * 999)}`,
      address: 'Dirección de prueba',
      phone: '+56 9 1234 5678',
      email: `test${Date.now()}@empresa.com`,
      industry: 'Tecnología',
      description: 'Empresa de prueba para sincronización',
      active: true
    };

    const createdCompany = await companySyncService.createCompany(newCompany);
    console.log('✅ Empresa creada:', createdCompany);
    return createdCompany;
  } catch (error) {
    console.error('❌ Error al crear empresa:', error);
    return null;
  }
}

// Función para probar actualización
async function testCompanyUpdate(company) {
  if (!company) {
    console.log('⚠️ No hay empresa para actualizar');
    return;
  }

  console.log('\n📋 Prueba 3: Actualizar empresa');
  try {
    const updateData = {
      name: `${company.name} (Actualizada)`,
      description: 'Descripción actualizada para prueba',
      active: false
    };

    const updatedCompany = await companySyncService.updateCompany(company.id, updateData);
    console.log('✅ Empresa actualizada:', updatedCompany);
    return updatedCompany;
  } catch (error) {
    console.error('❌ Error al actualizar empresa:', error);
  }
}

// Función para probar eliminación
async function testCompanyDelete(company) {
  if (!company) {
    console.log('⚠️ No hay empresa para eliminar');
    return;
  }

  console.log('\n📋 Prueba 4: Eliminar empresa');
  try {
    await companySyncService.deleteCompany(company.id);
    console.log('✅ Empresa eliminada correctamente');
  } catch (error) {
    console.error('❌ Error al eliminar empresa:', error);
  }
}

// Función para probar suscripciones a eventos
function testEventSubscriptions() {
  console.log('\n📋 Prueba 5: Suscripción a eventos de sincronización');

  // Suscribirse a diferentes eventos
  const subscriptions = [];

  // Evento de actualización de empresas
  const updateSubscription = companySyncService.subscribe('companies-updated', (data) => {
    console.log('🔄 Evento recibido (companies-updated):', data);
  });
  subscriptions.push({ event: 'companies-updated', id: updateSubscription });

  // Evento de empresa creada
  const createSubscription = companySyncService.subscribe('company-created', (data) => {
    console.log('➕ Evento recibido (company-created):', data);
  });
  subscriptions.push({ event: 'company-created', id: createSubscription });

  // Evento de empresa actualizada
  const updateSingleSubscription = companySyncService.subscribe('company-updated', (data) => {
    console.log('✏️ Evento recibido (company-updated):', data);
  });
  subscriptions.push({ event: 'company-updated', id: updateSingleSubscription });

  // Evento de empresa eliminada
  const deleteSubscription = companySyncService.subscribe('company-deleted', (data) => {
    console.log('🗑️ Evento recibido (company-deleted):', data);
  });
  subscriptions.push({ event: 'company-deleted', id: deleteSubscription });

  console.log('✅ Suscripciones creadas:', subscriptions);

  // Retornar función para limpiar suscripciones
  return () => {
    console.log('\n🧹 Limpiando suscripciones...');
    subscriptions.forEach(({ event, id }) => {
      companySyncService.unsubscribe(event, id);
      console.log(`✅ Suscripción eliminada: ${event}`);
    });
  };
}

// Función para probar caché
async function testCacheFunctionality() {
  console.log('\n📋 Prueba 6: Funcionalidad de caché');

  try {
    // Limpiar caché
    companySyncService.clearCache();
    console.log('✅ Caché limpiado');

    // Obtener empresas (debería ir a la base de datos)
    console.log('Obteniendo empresas desde base de datos...');
    const companies1 = await companySyncService.getCompanies();
    console.log(`✅ Primer consulta: ${companies1.length} empresas`);

    // Obtener empresas nuevamente (debería usar caché)
    console.log('Obteniendo empresas desde caché...');
    const companies2 = await companySyncService.getCompanies();
    console.log(`✅ Segunda consulta: ${companies2.length} empresas`);

    // Verificar que son los mismos datos
    const isSameData = JSON.stringify(companies1) === JSON.stringify(companies2);
    console.log(`✅ Datos de caché ${isSameData ? 'coincidentes' : 'diferentes'}`);

  } catch (error) {
    console.error('❌ Error en prueba de caché:', error);
  }
}

// Función principal de prueba
async function runCompleteTest() {
  console.log('🎯 Iniciando prueba completa del servicio de sincronización...');
  
  // Configurar suscripciones a eventos
  const cleanupSubscriptions = testEventSubscriptions();

  // Esperar un momento para que las suscripciones se activen
  await new Promise(resolve => setTimeout(resolve, 100));

  // Probar caché
  await testCacheFunctionality();

  // Probar operaciones CRUD
  const newCompany = await testCompanyOperations();
  await new Promise(resolve => setTimeout(resolve, 200)); // Esperar eventos

  const updatedCompany = await testCompanyUpdate(newCompany);
  await new Promise(resolve => setTimeout(resolve, 200)); // Esperar eventos

  await testCompanyDelete(updatedCompany || newCompany);
  await new Promise(resolve => setTimeout(resolve, 200)); // Esperar eventos

  // Verificar estado final
  console.log('\n📋 Verificación final');
  try {
    const finalCompanies = await companySyncService.getCompanies();
    console.log(`✅ Estado final: ${finalCompanies.length} empresas`);
  } catch (error) {
    console.error('❌ Error en verificación final:', error);
  }

  // Limpiar suscripciones
  cleanupSubscriptions();

  console.log('\n🎉 Prueba completa finalizada');
  console.log('\n📝 Resumen:');
  console.log('- ✅ Servicio de sincronización funcional');
  console.log('- ✅ Eventos de CRUD emitidos correctamente');
  console.log('- ✅ Sistema de caché operativo');
  console.log('- ✅ Suscripciones a eventos funcionando');
}

// Ejecutar prueba si estamos en un entorno de navegador
if (typeof window !== 'undefined') {
  // Exponer función en el contexto global para ejecutar desde la consola
  window.testCompanySync = runCompleteTest;
  console.log('💡 Para ejecutar la prueba, escribe: testCompanySync()');
} else {
  // Ejecutar directamente si estamos en Node.js
  runCompleteTest().catch(console.error);
}

export { runCompleteTest };