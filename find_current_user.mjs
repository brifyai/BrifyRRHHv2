import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function findCurrentUser() {
  try {
    console.log('=== IDENTIFICANDO USUARIO ACTUAL ===')
    
    // 1. Intentar obtener sesión actual
    console.log('\n1. Verificando sesión actual...')
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.log('Error obteniendo sesión:', sessionError.message)
      } else if (session?.user) {
        console.log('✅ Sesión encontrada:')
        console.log(`- ID: ${session.user.id}`)
        console.log(`- Email: ${session.user.email}`)
        console.log(`- User Metadata:`, session.user.user_metadata)
        console.log(`- App Metadata:`, session.user.app_metadata)
        
        // Generar SQL específico para este usuario
        console.log('\n=== SQL PARA ESTE USUARIO ===')
        console.log('-- Copia y ejecuta este SQL en el panel de Supabase:')
        console.log(`UPDATE auth.users SET user_metadata = jsonb_set(COALESCE(user_metadata, '{}'), '{name}', '"Juan Pablo Riesco"') WHERE id = '${session.user.id}';`)
        
        return session.user
      } else {
        console.log('❌ No hay sesión activa')
      }
    } catch (error) {
      console.log('Error verificando sesión:', error.message)
    }
    
    // 2. Intentar con getUser()
    console.log('\n2. Intentando con getUser()...')
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.log('Error con getUser():', userError.message)
      } else if (user) {
        console.log('✅ Usuario encontrado:')
        console.log(`- ID: ${user.id}`)
        console.log(`- Email: ${user.email}`)
        console.log(`- User Metadata:`, user.user_metadata)
        
        // Generar SQL específico para este usuario
        console.log('\n=== SQL PARA ESTE USUARIO ===')
        console.log('-- Copia y ejecuta este SQL en el panel de Supabase:')
        console.log(`UPDATE auth.users SET user_metadata = jsonb_set(COALESCE(user_metadata, '{}'), '{name}', '"Juan Pablo Riesco"') WHERE id = '${user.id}';`)
        
        return user
      } else {
        console.log('❌ No se encontró usuario')
      }
    } catch (error) {
      console.log('Error con getUser():', error.message)
    }
    
    // 3. Si no hay sesión, mostrar instrucciones manuales
    console.log('\n=== INSTRUCCIONES MANUALES ===')
    console.log('1. Inicia sesión en la aplicación web')
    console.log('2. Una vez iniciada la sesión, vuelve a ejecutar este script')
    console.log('3. O ve al panel de Supabase → Authentication → Users')
    console.log('4. Busca el usuario que tenga "Camilo Alegria" en sus metadatos')
    console.log('5. Edita los metadatos y cambia el nombre a "Juan Pablo Riesco"')
    
    // 4. Mostrar SQL genérico para buscar usuarios con "Camilo"
    console.log('\n=== SQL PARA BUSCAR USUARIOS CON "CAMILO" ===')
    console.log('-- Ejecuta este SQL en el panel de Supabase para encontrar el usuario:')
    console.log('SELECT id, email, user_metadata->>\'name\' as display_name, user_metadata FROM auth.users WHERE user_metadata->>\'name\' ILIKE \'%camilo%\';')
    
  } catch (error) {
    console.error('Error general:', error)
  }
}

findCurrentUser()