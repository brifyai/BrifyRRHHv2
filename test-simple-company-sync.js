// Script simple para probar la sincronización de empresas
console.log('🧪 Iniciando prueba simple...');

// Importar el servicio de sincronización
import companySyncService from './src/services/companySyncService.js';

console.log('📦 Servicio importado:', typeof companySyncService);
console.log('📦 Métodos disponibles:', Object.getOwnPropertyNames(companySyncService));

// Probar el método refreshCompanies
if (typeof companySyncService.refreshCompanies === 'function') {
  console.log('✅ Método refreshCompanies encontrado');
  
  try {
    const companies = await companySyncService.refreshCompanies();
    console.log('✅ Empresas obtenidas:', companies.length);
  } catch (error) {
    console.error('❌ Error al obtener empresas:', error);
  }
} else {
  console.log('❌ Método refreshCompanies no encontrado');
}