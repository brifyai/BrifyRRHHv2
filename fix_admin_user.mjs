import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixAdminUser() {
  try {
    console.log('=== CORRECCIÓN DEL USUARIO ADMINISTRADOR ===')
    
    // 1. Verificar si existe el usuario con email camiloalegriabarra@gmail.com
    console.log('\n1. Buscando usuario administrador...')
    
    try {
      // Intentar buscar por email (si la columna existe)
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'camiloalegriabarra@gmail.com')
        .maybeSingle()
      
      if (adminError) {
        console.log('Error buscando usuario administrador:', adminError.message)
        
        // Si falla por columna name, intentar solo con las columnas básicas
        if (adminError.message.includes('column')) {
          console.log('Intentando con columnas básicas...')
          const { data: basicUser, error: basicError } = await supabase
            .from('users')
            .select('id, email, full_name')
            .eq('email', 'camiloalegriabarra@gmail.com')
            .maybeSingle()
          
          if (basicError) {
            console.log('Error con consulta básica:', basicError.message)
          } else if (basicUser) {
            console.log('Usuario administrador encontrado (consulta básica):', basicUser)
            
            // Actualizar el nombre del usuario
            await updateUserName(basicUser.id)
          }
        }
      } else if (adminUser) {
        console.log('Usuario administrador encontrado:', adminUser)
        
        // Actualizar el nombre del usuario
        await updateUserName(adminUser.id)
      } else {
        console.log('No se encontró usuario con email camiloalegriabarra@gmail.com')
      }
      
    } catch (error) {
      console.log('Error en búsqueda de administrador:', error.message)
    }
    
    // 2. Buscar cualquier usuario que contenga "Camilo" en su nombre
    console.log('\n2. Buscando cualquier usuario con "Camilo"...')
    
    try {
      // Intentar diferentes campos donde podría estar el nombre
      const searchFields = ['name', 'full_name', 'email']
      
      for (const field of searchFields) {
        try {
          const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .ilike(field, '%camilo%')
          
          if (error) {
            console.log(`Error buscando en campo ${field}:`, error.message)
          } else if (users && users.length > 0) {
            console.log(`Encontrados ${users.length} usuarios con "Camilo" en ${field}:`)
            users.forEach(user => {
              console.log(`- ID: ${user.id}`)
              console.log(`  Email: ${user.email}`)
              console.log(`  Name: ${user.name || 'No definido'}`)
              console.log(`  Full Name: ${user.full_name || 'No definido'}`)
              console.log('---')
              
              // Actualizar este usuario
              updateUserName(user.id)
            })
          }
        } catch (e) {
          console.log(`Error en búsqueda ${field}:`, e.message)
        }
      }
      
    } catch (error) {
      console.log('Error en búsqueda general:', error.message)
    }
    
    // 3. Verificar todos los usuarios existentes
    console.log('\n3. Verificando todos los usuarios existentes...')
    
    try {
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('id, email, name, full_name')
      
      if (error) {
        console.log('Error obteniendo todos los usuarios:', error.message)
      } else {
        console.log(`Total de usuarios: ${allUsers.length}`)
        
        if (allUsers.length > 0) {
          allUsers.forEach(user => {
            console.log(`- ${user.name || user.full_name || 'Sin nombre'} (${user.email})`)
          })
        } else {
          console.log('No hay usuarios en la tabla users')
          console.log('El problema podría estar en auth.users o en caché del navegador')
        }
      }
    } catch (error) {
      console.log('Error verificando usuarios:', error.message)
    }
    
    // 4. Recomendaciones finales
    console.log('\n=== RECOMENDACIONES FINALES ===')
    console.log('1. Si se encontró y actualizó el usuario, recargar la página web')
    console.log('2. Limpiar el caché del navegador (Ctrl+F5 o Cmd+Shift+R)')
    console.log('3. Si el problema persiste, cerrar y volver a iniciar sesión')
    console.log('4. Verificar que no haya datos en localStorage del navegador')
    
    async function updateUserName(userId) {
      try {
        console.log(`\nActualizando nombre del usuario ${userId}...`)
        
        const { data, error } = await supabase
          .from('users')
          .update({
            name: 'Juan Pablo Riesco',
            full_name: 'Juan Pablo Riesco'
          })
          .eq('id', userId)
          .select()
        
        if (error) {
          console.log('Error actualizando usuario:', error.message)
        } else {
          console.log('Usuario actualizado exitosamente:', data)
        }
      } catch (error) {
        console.log('Error en actualización:', error.message)
      }
    }
    
  } catch (error) {
    console.error('Error general en corrección:', error)
  }
}

fixAdminUser()