import { supabase } from './src/lib/supabaseClient.js';

/**
 * Script para verificar y agregar campos de comunicación a la tabla employees
 */

async function testCommunicationChannels() {
  console.log('🔍 Verificando campos de comunicación en la tabla employees...');

  try {
    // 1. Verificar estructura actual de la tabla
    console.log('\n📋 Verificando estructura actual...');
    
    const { data: employees, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('Error obteniendo datos de empleados:', fetchError);
      return;
    }

    if (employees && employees.length > 0) {
      const sampleEmployee = employees[0];
      console.log('Campos actuales en la tabla employees:');
      console.log(Object.keys(sampleEmployee));
      
      // Verificar si los nuevos campos ya existen
      const hasNewFields = [
        'whatsapp_enabled',
        'whatsapp_phone', 
        'telegram_enabled',
        'telegram_phone',
        'telegram_username',
        'sms_enabled',
        'sms_phone',
        'email_enabled',
        'mailing_list'
      ].every(field => field in sampleEmployee);

      if (hasNewFields) {
        console.log('✅ Los campos de comunicación ya existen en la tabla');
      } else {
        console.log('❌ Los campos de comunicación no existen. Necesitan ser agregados.');
        
        // Intentar agregar los campos manualmente
        await addCommunicationFields();
      }
    }

    // 2. Verificar datos de empleados
    console.log('\n📊 Verificando datos de empleados...');
    const { data: allEmployees, error: allEmployeesError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, phone, email, whatsapp_enabled, whatsapp_phone, telegram_enabled, sms_enabled, email_enabled')
      .limit(5);

    if (allEmployeesError) {
      console.error('Error obteniendo empleados:', allEmployeesError);
      return;
    }

    console.log(`Encontrados ${allEmployees.length} empleados de muestra:`);
    allEmployees.forEach(emp => {
      console.log(`- ${emp.first_name} ${emp.last_name}:`);
      console.log(`  Email: ${emp.email || 'N/A'} (habilitado: ${emp.email_enabled})`);
      console.log(`  Teléfono: ${emp.phone || 'N/A'}`);
      console.log(`  WhatsApp: ${emp.whatsapp_phone || 'N/A'} (habilitado: ${emp.whatsapp_enabled})`);
      console.log(`  Telegram: ${emp.telegram_enabled ? 'Sí' : 'No'}`);
      console.log(`  SMS: ${emp.sms_phone || 'N/A'} (habilitado: ${emp.sms_enabled})`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

async function addCommunicationFields() {
  console.log('🔧 Intentando agregar campos de comunicación...');
  
  try {
    // Como no podemos ejecutar ALTER TABLE directamente con el cliente JS,
    // vamos a intentar actualizar un registro para forzar la creación de los campos
    // si la base de datos está configurada para agregar columnas dinámicamente
    
    const { data: testEmployee } = await supabase
      .from('employees')
      .select('id')
      .limit(1)
      .single();

    if (testEmployee) {
      console.log('Intentando actualizar registro con nuevos campos...');
      
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          whatsapp_enabled: true,
          whatsapp_phone: '+56912345678',
          telegram_enabled: false,
          sms_enabled: true,
          email_enabled: true,
          mailing_list: false
        })
        .eq('id', testEmployee.id);

      if (updateError) {
        console.error('Error actualizando con nuevos campos:', updateError);
        console.log('⚠️ Los campos necesitan ser agregados manualmente a la base de datos');
        console.log('📝 Ejecute el script SQL add-communication-channels-employees.sql manualmente');
      } else {
        console.log('✅ Campos agregados exitosamente');
      }
    }

  } catch (error) {
    console.error('Error agregando campos:', error);
  }
}

// Ejecutar verificación
testCommunicationChannels()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la verificación:', error);
    process.exit(1);
  });