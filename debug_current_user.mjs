import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugCurrentUser() {
  try {
    console.log('=== DEPURACIÓN DEL USUARIO ACTUAL ===')
    
    // 1. Intentar obtener el usuario autenticado actual
    console.log('\n1. Verificando usuario autenticado...')
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.log('Error obteniendo usuario autenticado:', authError.message)
      } else if (user) {
        console.log('Usuario autenticado encontrado:')
        console.log(`- ID: ${user.id}`)
        console.log(`- Email: ${user.email}`)
        console.log(`- User Metadata:`, user.user_metadata)
        console.log(`- App Metadata:`, user.app_metadata)
      } else {
        console.log('No hay usuario autenticado')
      }
    } catch (error) {
      console.log('Error verificando autenticación:', error.message)
    }
    
    // 2. Verificar si hay usuarios en la tabla users (incluso sin la columna name)
    console.log('\n2. Verificando tabla users...')
    try {
      // Intentar seleccionar solo las columnas que deberían existir
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name')
      
      if (usersError) {
        console.log('Error obteniendo usuarios:', usersError.message)
        
        // Intentar con columnas básicas
        try {
          const { data: basicUsers, error: basicError } = await supabase
            .from('users')
            .select('*')
            .limit(5)
          
          if (basicError) {
            console.log('Error con consulta básica:', basicError.message)
          } else {
            console.log('Usuarios encontrados (consulta básica):', basicUsers)
          }
        } catch (e) {
          console.log('Error en consulta básica:', e.message)
        }
      } else {
        console.log(`Se encontraron ${users.length} usuarios:`)
        users.forEach(user => {
          console.log(`- ID: ${user.id}`)
          console.log(`  Email: ${user.email}`)
          console.log(`  Full Name: ${user.full_name || 'No definido'}`)
          console.log('---')
        })
      }
    } catch (error) {
      console.log('Error verificando tabla users:', error.message)
    }
    
    // 3. Buscar usuarios que contengan "Camilo" en algún campo
    console.log('\n3. Buscando usuarios con "Camilo"...')
    try {
      // Intentar buscar en diferentes posibles columnas
      const searchQueries = [
        { table: 'users', field: 'email' },
        { table: 'users', field: 'full_name' },
        { table: 'users', field: 'name' }
      ]
      
      for (const query of searchQueries) {
        try {
          const { data, error } = await supabase
            .from(query.table)
            .select('*')
            .ilike(query.field, '%camilo%')
          
          if (error) {
            console.log(`Error buscando en ${query.field}:`, error.message)
          } else if (data && data.length > 0) {
            console.log(`Encontrados ${data.length} resultados en ${query.field}:`)
            data.forEach(item => console.log(`- ${JSON.stringify(item)}`))
          }
        } catch (e) {
          console.log(`Error en búsqueda ${query.field}:`, e.message)
        }
      }
    } catch (error) {
      console.log('Error en búsqueda de Camilo:', error.message)
    }
    
    // 4. Verificar la estructura actual de la tabla
    console.log('\n4. Verificando estructura de la tabla...')
    try {
      // Intentar insertar un registro temporal para ver qué columnas existen
      const testId = 'test-structure-check'
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: testId,
          email: 'test@example.com',
          name: 'Test Name',
          full_name: 'Test Full Name'
        })
        .select()
      
      if (error) {
        console.log('Error en inserción de prueba (esto muestra qué columnas faltan):')
        console.log(error.message)
        
        // Extraer información del error sobre columnas faltantes
        if (error.message.includes('column')) {
          const columnMatch = error.message.match(/column "([^"]+)" of "([^"]+)"/)
          if (columnMatch) {
            console.log(`Columna faltante detectada: ${columnMatch[1]} en tabla ${columnMatch[2]}`)
          }
        }
      } else {
        console.log('Inserción de prueba exitosa, estructura parece correcta')
        
        // Limpiar el registro de prueba
        await supabase.from('users').delete().eq('id', testId)
      }
    } catch (error) {
      console.log('Error en verificación de estructura:', error.message)
    }
    
    // 5. Recomendaciones
    console.log('\n=== RECOMENDACIONES ===')
    console.log('1. Si hay un usuario con nombre "Camilo Alegria", necesita ser actualizado')
    console.log('2. Si la tabla no tiene la estructura correcta, ejecutar fix_users_structure.sql')
    console.log('3. Si no hay usuarios, iniciar sesión en la aplicación para crear el perfil')
    console.log('4. Limpiar el caché del navegador y localStorage si el problema persiste')
    
  } catch (error) {
    console.error('Error general en depuración:', error)
  }
}

debugCurrentUser()