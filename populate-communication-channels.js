import { supabase } from './src/lib/supabaseClient.js';

/**
 * Script para poblar los canales de comunicación de los empleados
 * - WhatsApp y SMS: mismos números (formato chileno)
 * - Telegram: nombres de usuario únicos
 */

async function populateCommunicationChannels() {
  console.log('🔧 Poblando canales de comunicación para empleados...');

  try {
    // 1. Obtener todos los empleados
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email')
      .order('last_name');

    if (employeesError) {
      console.error('Error obteniendo empleados:', employeesError);
      return;
    }

    console.log(`Encontrados ${employees.length} empleados para actualizar`);

    // 2. Función para generar número de teléfono chileno
    function generateChileanPhone() {
      // Formato chileno: +56 9 XXXX XXXX
      const prefixes = ['9', '8', '7']; // Prefijos comunes en Chile
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      return `+56${prefix}${number}`;
    }

    // 3. Función para generar username de Telegram
    function generateTelegramUsername(firstName, lastName) {
      // Base del nombre: primera letra del nombre + apellido completo + número aleatorio
      const baseName = `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase().replace(/\s/g, '')}`;
      const randomSuffix = Math.floor(Math.random() * 9999);
      return `${baseName}${randomSuffix}`;
    }

    // 4. Función para determinar si un canal está habilitado (80% de probabilidad)
    function isChannelEnabled() {
      return Math.random() < 0.8; // 80% de probabilidad de estar habilitado
    }

    // 5. Actualizar cada empleado con canales de comunicación
    let updatedCount = 0;
    let whatsappEnabledCount = 0;
    let telegramEnabledCount = 0;
    let smsEnabledCount = 0;
    let emailEnabledCount = 0;

    console.log('\n📱 Generando canales de comunicación...');

    for (const employee of employees) {
      const phoneNumber = generateChileanPhone();
      const telegramUsername = generateTelegramUsername(employee.first_name, employee.last_name);
      
      // Determinar qué canales están habilitados
      const hasPhone = isChannelEnabled();
      const hasEmail = employee.email && isChannelEnabled();
      const hasTelegram = isChannelEnabled();

      const updateData = {
        // WhatsApp y SMS usan el mismo número
        whatsapp_phone: hasPhone ? phoneNumber : null,
        whatsapp_enabled: hasPhone,
        sms_phone: hasPhone ? phoneNumber : null,
        sms_enabled: hasPhone,
        
        // Telegram usa username
        telegram_username: hasTelegram ? telegramUsername : null,
        telegram_enabled: hasTelegram,
        
        // Email
        email_enabled: hasEmail,
        
        // Mailing list (70% de los que tienen email)
        mailing_list: hasEmail ? (Math.random() < 0.7) : false
      };

      const { error: updateError } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employee.id);

      if (updateError) {
        console.error(`Error actualizando empleado ${employee.id}:`, updateError);
      } else {
        updatedCount++;
        if (hasPhone) {
          whatsappEnabledCount++;
          smsEnabledCount++;
        }
        if (hasTelegram) telegramEnabledCount++;
        if (hasEmail) emailEnabledCount++;
        
        // Mostrar progreso cada 50 empleados
        if (updatedCount % 50 === 0) {
          console.log(`✅ Procesados ${updatedCount} empleados...`);
        }
      }
    }

    // 6. Verificar resultados
    console.log('\n📊 Resultados de la actualización:');
    console.log(`✅ Empleados actualizados: ${updatedCount}/${employees.length}`);
    console.log(`📱 WhatsApp habilitado: ${whatsappEnabledCount} (${Math.round((whatsappEnabledCount/updatedCount)*100)}%)`);
    console.log(`📨 SMS habilitado: ${smsEnabledCount} (${Math.round((smsEnabledCount/updatedCount)*100)}%)`);
    console.log(`💬 Telegram habilitado: ${telegramEnabledCount} (${Math.round((telegramEnabledCount/updatedCount)*100)}%)`);
    console.log(`📧 Email habilitado: ${emailEnabledCount} (${Math.round((emailEnabledCount/updatedCount)*100)}%)`);

    // 7. Mostrar ejemplos
    console.log('\n📋 Ejemplos de empleados actualizados:');
    const { data: sampleEmployees } = await supabase
      .from('employees')
      .select('first_name, last_name, whatsapp_phone, telegram_username, sms_phone, email_enabled, mailing_list')
      .limit(5);

    sampleEmployees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.first_name} ${emp.last_name}:`);
      console.log(`   WhatsApp/SMS: ${emp.whatsapp_phone || 'No disponible'}`);
      console.log(`   Telegram: @${emp.telegram_username || 'No disponible'}`);
      console.log(`   Email: ${emp.email_enabled ? 'Habilitado' : 'Deshabilitado'}`);
      console.log(`   Mailing: ${emp.mailing_list ? 'Suscrito' : 'No suscrito'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  }
}

// Ejecutar script
populateCommunicationChannels()
  .then(() => {
    console.log('\n🎉 Poblado de canales de comunicación completado');
    console.log('📱 Ahora los empleados tienen números de WhatsApp/SMS y usuarios de Telegram');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el poblado:', error);
    process.exit(1);
  });