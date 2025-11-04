import { supabase } from '../src/lib/supabase.js';
import employeeDataService from '../src/services/employeeDataService.js';

async function ensure50EmployeesPerCompany() {
  try {
    console.log('Asegurando que cada empresa tenga exactamente 50 empleados...');
    
    // Usar el método existente del servicio
    const result = await employeeDataService.ensure50EmployeesPerCompany();
    
    if (result.success) {
      console.log('¡Proceso completado exitosamente!');
      console.log('Todas las empresas ahora tienen exactamente 50 empleados.');
    } else {
      console.log('Hubo un problema durante el proceso.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejecutar la función
ensure50EmployeesPerCompany();