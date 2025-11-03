// Script para probar la página de configuración de empresas
import companySyncService from './src/services/companySyncService.js';

console.log('🧪 Iniciando prueba de la página de configuración de empresas...');

// Prueba 1: Verificar que el companySyncService esté disponible
try {
  console.log('✅ companySyncService importado correctamente:', typeof companySyncService);
  
  // Prueba 2: Verificar que los métodos existan
  const methods = [
    'getCompanies',
    'getCompanyById', 
    'createCompany',
    'updateCompany',
    'deleteCompany',
    'toggleCompanyStatus',
    'getEmployees',
    'createEmployee',
    'updateEmployee',
    'deleteEmployee',
    'getCompanyStats',
    'syncCompanyData',
    'validateCompanyData',
    'validateEmployeeData'
  ];
  
  console.log('🔍 Verificando métodos del companySyncService...');
  methods.forEach(method => {
    if (typeof companySyncService[method] === 'function') {
      console.log(`✅ Método ${method} disponible`);
    } else {
      console.error(`❌ Método ${method} no disponible`);
    }
  });
  
  // Prueba 3: Intentar cargar empresas
  console.log('🔄 Probando carga de empresas...');
  companySyncService.getCompanies()
    .then(companies => {
      console.log('✅ Empresas cargadas exitosamente:', companies.length, 'empresas encontradas');
      
      // Prueba 4: Intentar obtener estadísticas
      if (companies.length > 0) {
        const firstCompany = companies[0];
        console.log('🔄 Probando obtención de estadísticas para empresa:', firstCompany.name);
        
        return companySyncService.getCompanyStats(firstCompany.id)
          .then(stats => {
            console.log('✅ Estadísticas obtenidas exitosamente:', stats);
            console.log('🎉 Todas las pruebas superadas exitosamente');
          })
          .catch(error => {
            console.error('❌ Error obteniendo estadísticas:', error);
          });
      } else {
        console.log('ℹ️ No hay empresas para probar estadísticas');
      }
    })
    .catch(error => {
      console.error('❌ Error cargando empresas:', error);
    });
    
} catch (error) {
  console.error('❌ Error en la prueba:', error);
}

console.log('🏁 Prueba completada. Revisa la consola para ver los resultados.');