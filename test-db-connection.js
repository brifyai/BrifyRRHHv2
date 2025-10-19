const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase desde el archivo .env.local
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

console.log('Intentando conectar a Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// Probar la conexión obteniendo la versión
async function testConnection() {
  try {
    // Intentar obtener información del usuario (esto requerirá autenticación)
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('Error al conectar con la base de datos:');
      console.log('Código de error:', error.code);
      console.log('Mensaje de error:', error.message);
      
      // Si es un error de autorización, probablemente las credenciales sean incorrectas
      if (error.code === '401' || error.message.includes('Unauthorized')) {
        console.log('⚠️  Las credenciales de Supabase pueden ser incorrectas');
      }
    } else {
      console.log('✅ Conexión exitosa a la base de datos');
      console.log('Datos obtenidos:', data);
    }
  } catch (err) {
    console.log('❌ Error al intentar conectar:');
    console.log(err.message);
  }
}

testConnection();