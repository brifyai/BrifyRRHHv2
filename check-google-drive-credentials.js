const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGoogleDriveCredentials() {
  try {
    console.log('🔍 Verificando credenciales de Google Drive en la base de datos...')
    
    // 1. Verificar tabla user_credentials
    console.log('\n📋 Estructura de la tabla user_credentials:')
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_credentials')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error al acceder a la tabla user_credentials:', tableError)
    } else {
      console.log('✅ Tabla user_credentials accesible')
      if (tableInfo.length > 0) {
        console.log('📝 Columnas encontradas:', Object.keys(tableInfo[0]))
      }
    }
    
    // 2. Verificar si hay credenciales almacenadas
    console.log('\n🔍 Buscando credenciales de Google Drive...')
    const { data: credentials, error: credError } = await supabase
      .from('user_credentials')
      .select('*')
    
    if (credError) {
      console.error('❌ Error al buscar credenciales:', credError)
    } else {
      console.log(`📊 Se encontraron ${credentials.length} registros de credenciales`)
      
      if (credentials.length > 0) {
        credentials.forEach((cred, index) => {
          console.log(`\n🔑 Registro ${index + 1}:`)
          console.log(`   - User ID: ${cred.user_id}`)
          console.log(`   - Google Refresh Token: ${cred.google_refresh_token ? '✅ Presente' : '❌ Ausente'}`)
          console.log(`   - Google Access Token: ${cred.google_access_token ? '✅ Presente' : '❌ Ausente'}`)
          console.log(`   - Creado: ${cred.created_at}`)
          console.log(`   - Actualizado: ${cred.updated_at}`)
          
          if (cred.google_refresh_token) {
            console.log(`   - Token Length: ${cred.google_refresh_token.length} caracteres`)
          }
        })
      } else {
        console.log('❌ No se encontraron credenciales de Google Drive almacenadas')
      }
    }
    
    // 3. Verificar usuarios para comparar
    console.log('\n👥 Verificando usuarios en la tabla users...')
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .limit(5)
    
    if (userError) {
      console.error('❌ Error al obtener usuarios:', userError)
    } else {
      console.log(`📊 Se encontraron ${users.length} usuarios (mostrando primeros 5):`)
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - ID: ${user.id}`)
      })
    }
    
    // 4. Verificar si hay usuarios con credenciales
    if (credentials.length > 0 && users.length > 0) {
      console.log('\n🔗 Cruzando información de usuarios y credenciales:')
      credentials.forEach(cred => {
        const user = users.find(u => u.id === cred.user_id)
        if (user) {
          console.log(`✅ Usuario ${user.email} tiene credenciales de Google Drive`)
        } else {
          console.log(`⚠️  Se encontraron credenciales para user_id ${cred.user_id} pero no se encontró el usuario`)
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar la verificación
checkGoogleDriveCredentials()