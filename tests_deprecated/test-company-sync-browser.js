// Script para probar el servicio de sincronización de empresas en el navegador
// Copiar y pegar este código en la consola del desarrollador en http://localhost:3000

console.log('🧪 Probando el servicio de sincronización de empresas en el navegador...');

// Función para esperar a que la aplicación cargue
function waitForApp() {
  return new Promise((resolve) => {
    const checkApp = () => {
      if (window.companySyncService || document.querySelector('[data-testid="dashboard"]')) {
        resolve();
      } else {
        setTimeout(checkApp, 100);
      }
    };
    checkApp();
  });
}

// Función principal de prueba
async function testCompanySyncService() {
  try {
    await waitForApp();
    
    // Intentar acceder al servicio a través de la ventana global o importarlo dinámicamente
    let companySyncService;
    
    if (window.companySyncService) {
      companySyncService = window.companySyncService;
    } else {
      // Intentar importar el servicio
      const module = await import('./src/services/companySyncService.js');
      companySyncService = module.default;
    }
    
    if (!companySyncService) {
      console.error('❌ No se pudo acceder al servicio de sincronización');
      return;
    }
    
    console.log('✅ Servicio de sincronización encontrado');
    
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
    try {
      const companies = await companySyncService.getCompanies();
      console.log(`✅ Se obtuvieron ${companies.length} empresas`);
      if (companies.length > 0) {
        console.log('📋 Primera empresa:', companies[0]);
      }
    } catch (error) {
      console.log('❌ Error obteniendo empresas:', error.message);
    }
    
    // Probar obtención de estadísticas
    console.log('\n📊 Probando obtención de estadísticas:');
    try {
      const stats = await companySyncService.getCompanyStats();
      console.log('✅ Estadísticas obtenidas:', stats);
    } catch (error) {
      console.log('❌ Error obteniendo estadísticas:', error.message);
    }
    
    console.log('\n🎉 Prueba completada. Revisa la consola para ver los resultados.');
    
  } catch (error) {
    console.error('❌ Error general en la prueba:', error);
  }
}

// Ejecutar la prueba
testCompanySyncService();