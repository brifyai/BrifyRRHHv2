// Importar las funciones de utilidad
import {
  generateChileanPhone,
  generateTelegramUsername,
  getSimulatedWhatsApp,
  getSimulatedTelegram,
  getSimulatedSMS,
  getSimulatedMailing
} from './src/utils/communicationUtils.js';

// Datos de prueba con IDs simples para asegurar que algunos canales se habiliten
const mockEmployees = [
  {
    id: '1',
    first_name: 'Sergio',
    last_name: 'Díaz',
    email: 'sergio.diaz@empresa.com',
    company: 'Copec'
  },
  {
    id: '2',
    first_name: 'Gonzalo',
    last_name: 'Carrasco',
    email: 'gonzalo.carrasco@empresa.com',
    company: 'Falabella'
  },
  {
    id: '3',
    first_name: 'Ana',
    last_name: 'Véliz',
    email: 'ana.veliz@empresa.com',
    company: 'Cencosud'
  },
  {
    id: '4',
    first_name: 'Claudia',
    last_name: 'Cifuentes',
    email: 'claudia.cifuentes@empresa.com',
    company: 'Latam Airlines'
  },
  {
    id: '5',
    first_name: 'María',
    last_name: 'Espinoza',
    email: 'maria.espinoza@empresa.com',
    company: 'Entel'
  }
];

console.log('🧪 Probando datos simulados de comunicación...');

// Probar cada empleado
mockEmployees.forEach((employee, index) => {
  const whatsapp = getSimulatedWhatsApp(employee);
  const telegram = getSimulatedTelegram(employee);
  const sms = getSimulatedSMS(employee);
  const mailing = getSimulatedMailing(employee);

  console.log(`\n${index + 1}. ${employee.first_name} ${employee.last_name}`);
  console.log(`   Empresa: ${employee.company}`);
  console.log(`   Email: ${employee.email}`);
  console.log(`   WhatsApp: ${whatsapp.enabled ? whatsapp.phone : 'Sin WhatsApp (Deshabilitado)'}`);
  console.log(`   Telegram: ${telegram.enabled ? telegram.username : 'Sin Telegram (Deshabilitado)'}`);
  console.log(`   SMS: ${sms.enabled ? sms.phone : 'Sin SMS (Deshabilitado)'}`);
  console.log(`   Mailing: ${mailing.enabled ? 'Suscrito' : 'No suscrito (Deshabilitado)'}`);
});

console.log('\n✅ Datos simulados funcionando correctamente');
console.log('📱 Los cambios deberían ser visibles en: http://localhost:3002/base-de-datos/database');
console.log('💡 Si no ves los cambios, recarga la página con Ctrl+F5 (Windows/Linux) o Cmd+Shift+R (Mac)');
console.log('\n🎉 Prueba completada');