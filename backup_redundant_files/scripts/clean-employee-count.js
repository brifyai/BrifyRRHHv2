import { createClient } from '@supabase/supabase-js';

console.log('🧹 Limpiando empleados para dejar exactamente 800...');

// Configuración de Supabase para PRODUCCIÓN
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.1bemvXK8mHpvoA4djXmjtzrtDGFqBY4VBb62QQKuyhw';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanEmployeeCount() {
  try {
    // Contar empleados actuales
    const { count: currentCount, error: countError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error al contar empleados:', countError);
      return;
    }
    
    console.log(`📊 Empleados actuales: ${currentCount}`);
    
    if (currentCount <= 800) {
      console.log('✅ Ya hay 800 o menos empleados, no es necesario limpiar');
      return;
    }
    
    // Eliminar todos los empleados
    console.log('🗑️  Eliminando todos los empleados...');
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos los UUIDs válidos
    
    if (deleteError) {
      console.error('❌ Error al eliminar empleados:', deleteError);
      return;
    }
    
    console.log('✅ Empleados eliminados correctamente');
    
    // Obtener empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (companiesError) {
      console.error('❌ Error al obtener empresas:', companiesError);
      return;
    }
    
    // Generar exactamente 800 empleados (50 por empresa)
    console.log('🚀 Generando exactamente 800 empleados...');
    
    const names = [
      'Camilo', 'Patricio', 'Víctor', 'Graciela', 'Jorge', 'Ricardo', 'Felipe', 'Arturo',
      'Valentina', 'Isabel', 'César', 'Oscar', 'Carolina', 'Rodrigo', 'Francisco', 'Miguel',
      'Alejandro', 'Daniela', 'Romina', 'Silvana', 'Guillermo', 'Fernanda', 'Claudia', 'Teresa',
      'Cristian', 'Diego', 'Natalia', 'Luis', 'Karina', 'Andrés', 'Marcela', 'Verónica',
      'Roberto', 'Tamara', 'Danielle', 'Macarena', 'Sebastián', 'Pablo', 'Eduardo', 'Matías',
      'Ignacio', 'Fernando', 'Martín', 'Benjamín', 'Vicente', 'Joaquín', 'Diego', 'Tomás'
    ];

    const surnames = [
      'Gutiérrez', 'Castro', 'Vargas', 'Reyes', 'Sepúlveda', 'Henríquez', 'Miranda', 'López',
      'Pizarro', 'Villarroel', 'Ramos', 'Morales', 'Álvarez', 'Cortés', 'Rivera', 'Parra',
      'Leiva', 'Silva', 'Fuentes', 'Zúñiga', 'Díaz', 'Muñoz', 'Romero', 'Guzmán', 'Moraga',
      'Contreras', 'Herrera', 'Roas', 'Aguilera', 'Pérez', 'Sánchez', 'González', 'Rodríguez'
    ];

    const departments = [
      'Operaciones', 'TI', 'Seguridad', 'Producción', 'RRHH', 'Administración',
      'Planificación', 'Mantenimiento', 'Servicio al Cliente', 'Logística',
      'Investigación y Desarrollo', 'Contabilidad', 'Finanzas', 'Tesorería',
      'Marketing', 'Ventas', 'Auditoría', 'Legal', 'Calidad', 'Compras'
    ];

    const positions = [
      'Jefe de Operaciones', 'Desarrollador', 'Supervisor de Seguridad', 'Jefe de Producción',
      'Reclutador', 'Especialista en Seguridad', 'Técnico de Soporte', 'Operario de Producción',
      'Coordinador Administrativo', 'Planificador', 'Administrativo', 'Gerente de Mantenimiento',
      'Ejecutivo de Servicio', 'Supervisor de Logística', 'Desarrollador de Producto',
      'Asistente Contable', 'Asistente de Calidad', 'Jefe Administrativo', 'Jefe de Mantenimiento',
      'Coordinador Administrativo', 'Gerente Contable', 'Gerente Financiero', 'Asistente de Mantenimiento',
      'Asistente Financiero', 'Jefe de Calidad', 'Jefe de RRHH', 'Supervisor de Operaciones',
      'Analista de Tesorería', 'Supervisor de Producción', 'Especialista en Marketing',
      'Ejecutivo de Ventas', 'Jefe de Tesorería', 'Contador', 'Asistente de Auditoría',
      'Especialista en Cumplimiento', 'Asistente de Mantenimiento', 'Jefe de Logística',
      'Coordinador de Marketing', 'Gerente de Auditoría', 'Gerente Legal', 'Gerente de Ventas',
      'Asistente de Tesorería', 'Auditor Interno'
    ];

    const regions = [
      'Región Metropolitana', 'Región de Valparaíso', 'Región del Biobío', 'Región de Araucanía',
      'Región de Los Lagos', 'Región de Antofagasta', 'Región de Coquimbo', 'Región de Los Ríos',
      'Región del Maule', 'Región de Tarapacá', 'Región de Atacama', 'Región de Ñuble',
      'Región de Aysén', 'Región de Magallanes', 'Región del Libertador O\'Higgins'
    ];

    const workModes = ['Presencial', 'Híbrido', 'Remoto'];
    const contractTypes = ['Indefinido', 'Plazo Fijo', 'Honorarios'];
    const levels = ['Asistente', 'Especialista', 'Supervisor', 'Coordinador', 'Jefatura', 'Gerente', 'Director', 'Operario'];

    function getRandomElement(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function generatePhone() {
      return '+56 9 ' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    }

    const employeesPerCompany = 50;
    let totalCreated = 0;
    
    for (const company of companies) {
      console.log(`📝 Creando ${employeesPerCompany} empleados para ${company.name}...`);
      
      for (let i = 0; i < employeesPerCompany; i++) {
        const name = getRandomElement(names);
        const surname = getRandomElement(surnames);
        const email = `${name.toLowerCase()}${surname.toLowerCase()}${company.id}${i}@company${company.id}.cl`;
        
        const employee = {
          company_id: company.id,
          name: `${name} ${surname}`,
          email: email,
          phone: generatePhone(),
          region: getRandomElement(regions),
          department: getRandomElement(departments),
          level: getRandomElement(levels),
          position: getRandomElement(positions),
          work_mode: getRandomElement(workModes),
          contract_type: getRandomElement(contractTypes),
          is_active: true,
          has_subordinates: Math.random() > 0.7
        };
        
        const { error: insertError } = await supabase
          .from('employees')
          .insert(employee);
        
        if (insertError) {
          console.error(`❌ Error al crear empleado ${i + 1}:`, insertError.message);
        } else {
          totalCreated++;
          if (totalCreated % 50 === 0) {
            console.log(`   ✅ Creados ${totalCreated} empleados hasta ahora...`);
          }
        }
      }
    }
    
    // Verificación final
    console.log('🔍 Verificando resultado final...');
    const { count: finalCount, error: finalCountError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (finalCountError) {
      console.error('❌ Error al verificar conteo final:', finalCountError);
    } else {
      console.log(`🎉 ÉXITO: Se crearon ${finalCount} empleados`);
      
      if (finalCount === 800) {
        console.log('✅ Objetivo alcanzado: Exactamente 800 empleados');
        console.log('🎯 El contador de carpetas ahora mostrará 800');
      } else {
        console.log(`⚠️  Se esperaban 800 empleados, pero hay ${finalCount}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

cleanEmployeeCount();