const fs = require('fs');
const path = require('path');

// Leer el archivo SQL
const sqlFile = fs.readFileSync(path.join(__dirname, '../database/create_brevo_campaign_tables.sql'), 'utf8');

console.log('=== SCRIPT PARA CONFIGURAR TABLAS DE BREVO ===\n');
console.log('Para ejecutar este script, sigue estos pasos:');
console.log('\n1. Ve al panel de Supabase: https://app.supabase.com');
console.log('2. Selecciona tu proyecto: tmqglnycivlcjijoymwe');
console.log('3. Ve a "SQL Editor" en el menú lateral');
console.log('4. Crea una nueva consulta');
console.log('5. Copia y pega el siguiente código SQL:\n');

console.log('--- INICIO DEL CÓDIGO SQL ---');
console.log(sqlFile);
console.log('--- FIN DEL CÓDIGO SQL ---\n');

console.log('6. Haz clic en "Run" para ejecutar el script');
console.log('7. Verifica que todas las tablas se hayan creado correctamente');
console.log('\nLas tablas que se crearán son:');
console.log('- brevo_campaigns (campañas de SMS y Email)');
console.log('- brevo_campaign_recipients (destinatarios de campañas)');
console.log('- brevo_templates (plantillas de mensajes)');
console.log('- brevo_statistics (estadísticas de envío)');
console.log('- brevo_user_config (configuración por usuario)');

console.log('\n=== NOTAS IMPORTANTES ===');
console.log('- El script incluye políticas RLS para seguridad');
console.log('- Crea índices para optimizar consultas');
console.log('- Incluye triggers para actualizar timestamps automáticamente');
console.log('- Crea funciones para estadísticas agregadas');

// Guardar el SQL en un archivo separado para fácil copia
const outputPath = path.join(__dirname, '../brevo-setup.sql');
fs.writeFileSync(outputPath, sqlFile);
console.log(`\n✅ Script SQL guardado en: ${outputPath}`);