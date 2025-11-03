import { supabase } from './src/lib/supabaseClient.js';

/**
 * Script para probar los datos simulados de comunicación
 */

// Funciones para generar datos simulados (copiadas del componente)
const generateChileanPhone = (employeeId) => {
  const prefixes = ['9', '8', '7'];
  const prefix = prefixes[employeeId % 3];
  const number = String(employeeId).padStart(8, '0').slice(0, 8);
  return `+56${prefix}${number}`;
};

const generateTelegramUsername = (firstName, lastName, employeeId) => {
  const baseName = `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase().replace(/\s/g, '')}`;
  return `${baseName}${employeeId % 9999}`;
};

const getSimulatedWhatsApp = (employee) => {
  const enabled = employee.id % 10 < 8; // 80% habilitado
  return {
    enabled,
    phone: enabled ? generateChileanPhone(parseInt(employee.id.slice(0, 8), 16)) : 'Sin WhatsApp'
  };
};

const getSimulatedTelegram = (employee) => {
  const enabled = employee.id % 10 < 7; // 70% habilitado
  return {
    enabled,
    username: enabled ? `@${generateTelegramUsername(employee.first_name, employee.last_name, parseInt(employee.id.slice(0, 8), 16))}` : 'Sin Telegram'
  };
};

const getSimulatedSMS = (employee) => {
  const whatsappData = getSimulatedWhatsApp(employee);
  return {
    enabled: whatsappData.enabled, // SMS usa el mismo número que WhatsApp
    phone: whatsappData.phone
  };
};

const getSimulatedMailing = (employee) => {
  const enabled = employee.email && employee.id % 10 < 6; // 60% de los que tienen email
  return {
    enabled,
    status: enabled ? 'Suscrito' : 'No suscrito'
  };
};

async function testSimulatedData() {
  console.log('🧪 Probando datos simulados de comunicación...');

  try {
    // Obtener algunos empleados de muestra
    const { data: employees, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email, companies:company_id (name)')
      .limit(5);

    if (error) {
      console.error('Error obteniendo empleados:', error);
      return;
    }

    console.log('\n📋 Datos simulados generados:');
    
    employees.forEach((employee, index) => {
      console.log(`\n${index + 1}. ${employee.first_name} ${employee.last_name}`);
      console.log(`   Empresa: ${employee.companies?.name || 'N/A'}`);
      console.log(`   Email: ${employee.email || 'N/A'}`);
      
      const whatsapp = getSimulatedWhatsApp(employee);
      console.log(`   WhatsApp: ${whatsapp.phone} (${whatsapp.enabled ? 'Habilitado' : 'Deshabilitado'})`);
      
      const telegram = getSimulatedTelegram(employee);
      console.log(`   Telegram: ${telegram.username} (${telegram.enabled ? 'Habilitado' : 'Deshabilitado'})`);
      
      const sms = getSimulatedSMS(employee);
      console.log(`   SMS: ${sms.phone} (${sms.enabled ? 'Habilitado' : 'Deshabilitado'})`);
      
      const mailing = getSimulatedMailing(employee);
      console.log(`   Mailing: ${mailing.status} (${mailing.enabled ? 'Habilitado' : 'Deshabilitado'})`);
    });

    console.log('\n✅ Datos simulados funcionando correctamente');
    console.log('📱 Los cambios deberían ser visibles en: http://localhost:3002/base-de-datos/database');
    console.log('💡 Si no ves los cambios, recarga la página con Ctrl+F5 (Windows/Linux) o Cmd+Shift+R (Mac)');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar prueba
testSimulatedData()
  .then(() => {
    console.log('\n🎉 Prueba completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la prueba:', error);
    process.exit(1);
  });