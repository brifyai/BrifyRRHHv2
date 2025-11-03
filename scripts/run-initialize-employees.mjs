// Script para inicializar empleados (50 por empresa)
// Este script se ejecuta desde el directorio raíz del proyecto

console.log('🚀 Iniciando inicialización de empleados...');

// Importar el servicio de empleados
import('../src/services/employeeDataService.js').then(async (module) => {
  const employeeDataService = module.default;
  
  try {
    console.log('🔧 Ejecutando proceso para asegurar 50 empleados por empresa...');
    
    // Ejecutar el proceso de inicialización
    const result = await employeeDataService.ensure50EmployeesPerCompany((progress) => {
      console.log(`📊 ${progress}`);
    });
    
    if (result.success) {
      console.log('\n🎉 ¡Proceso completado exitosamente!');
      console.log('✅ Todas las empresas ahora tienen exactamente 50 empleados.');
    } else {
      console.log('\n⚠️ Hubo un problema durante el proceso.');
      console.log('❌ Error:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Error en el proceso:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}).catch((error) => {
  console.error('Error al importar el servicio:', error);
  process.exit(1);
});