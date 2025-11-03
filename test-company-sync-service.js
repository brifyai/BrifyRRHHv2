// Script para probar el servicio de sincronización de empresas
import companySyncService from './src/services/companySyncService.js';

console.log('🧪 Probando el servicio de sincronización de empresas...');

// Probar que el servicio tiene todos los métodos necesarios
const requiredMethods = [
  'getCompanies',
  'refreshCompanies',
  'createCompany',
  'updateCompany',
  'deleteCompany',
  'subscribe',
  'unsubscribe',
  'getCompanyStats'
];

console.log('\n📋 Verificando métodos disponibles:');
requiredMethods.forEach(method => {
  if (typeof companySyncService[method] === 'function') {
    console.log(`✅ ${method} - disponible`);
  } else {
    console.log(`❌ ${method} - no disponible`);
  }
});

// Probar suscripción a eventos
console.log('\n📡 Probando sistema de suscripción:');
try {
  const subscriptionId = companySyncService.subscribe('companies-updated', (data) => {
    console.log('📢 Evento recibido:', data);
  });
  
  console.log(`✅ Suscripción creada con ID: ${subscriptionId}`);
  
  // Probar cancelación de suscripción
  companySyncService.unsubscribe('companies-updated', subscriptionId);
  console.log('✅ Suscripción cancelada correctamente');
} catch (error) {
  console.log('❌ Error en sistema de suscripción:', error.message);
}

// Probar obtención de empresas
console.log('\n🏢 Probando obtención de empresas:');
companySyncService.getCompanies()
  .then(companies => {
    console.log(`✅ Se obtuvieron ${companies.length} empresas`);
    if (companies.length > 0) {
      console.log('📋 Primera empresa:', companies[0]);
    }
  })
  .catch(error => {
    console.log('❌ Error obteniendo empresas:', error.message);
  });

// Probar obtención de estadísticas
console.log('\n📊 Probando obtención de estadísticas:');
companySyncService.getCompanyStats()
  .then(stats => {
    console.log('✅ Estadísticas obtenidas:', stats);
  })
  .catch(error => {
    console.log('❌ Error obteniendo estadísticas:', error.message);
  });

console.log('\n🎉 Prueba completada. Revisa la consola para ver los resultados.');