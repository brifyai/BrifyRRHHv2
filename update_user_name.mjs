import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateUserName() {
  try {
    console.log('Verificando estructura actual de la tabla users...')
    
    // Intentar verificar si la columna 'name' existe ahora
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, full_name')
        .limit(1)
      
      if (error) {
        console.error('Error verificando estructura:', error)
        console.log('Es necesario ejecutar primero el script fix_users_structure.sql en el panel de Supabase')
        return
      }
      
      console.log('Estructura verificada correctamente')
      
      // Mostrar usuarios actuales
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
      
      if (usersError) {
        console.error('Error obteniendo usuarios:', usersError)
        return
      }
      
      console.log(`\nUsuarios actuales (${users.length}):`)
      users.forEach(user => {
        console.log(`- ID: ${user.id}`)
        console.log(`  Email: ${user.email}`)
        console.log(`  Name: ${user.name || 'No definido'}`)
        console.log(`  Full Name: ${user.full_name || 'No definido'}`)
        console.log('---')
      })
      
      // Si no hay usuarios, intentamos crear uno con el nombre correcto
      if (users.length === 0) {
        console.log('\nNo hay usuarios. Intentando crear usuario con nombre correcto...')
        
        // Buscar si hay algún usuario en auth.users mediante el email
        // Como no podemos acceder a auth.users directamente, necesitamos que el usuario
        // inicie sesión primero para que se cree su perfil
        
        console.log('Para solucionar el problema:')
        console.log('1. Ejecuta el script fix_users_structure.sql en el panel de Supabase')
        console.log('2. Inicia sesión en la aplicación web')
        console.log('3. Vuelve a ejecutar este script')
        console.log('4. O actualiza manualmente el nombre en la base de datos')
        
        // Crear un usuario de ejemplo con el nombre correcto para demostración
        const demoUserId = 'demo-user-id'
        const { data: demoData, error: demoError } = await supabase
          .from('users')
          .upsert({
            id: demoUserId,
            email: 'demo@example.com',
            name: 'Juan Pablo Riesco',
            full_name: 'Juan Pablo Riesco',
            is_active: true,
            registered_via: 'web',
            admin: false,
            onboarding_status: 'completed',
            registro_previo: true
          })
          .select()
        
        if (demoError) {
          console.error('Error creando usuario demo:', demoError)
        } else {
          console.log('Usuario demo creado con nombre correcto:', demoData)
        }
      } else {
        // Actualizar todos los usuarios existentes para que tengan el nombre correcto
        console.log('\nActualizando nombres de usuarios existentes...')
        
        for (const user of users) {
          const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({
              name: 'Juan Pablo Riesco',
              full_name: 'Juan Pablo Riesco'
            })
            .eq('id', user.id)
            .select()
          
          if (updateError) {
            console.error(`Error actualizando usuario ${user.email}:`, updateError)
          } else {
            console.log(`Usuario ${user.email} actualizado con nombre correcto`)
          }
        }
      }
      
      // Verificación final
      console.log('\nVerificación final:')
      const { data: finalUsers, error: finalError } = await supabase
        .from('users')
        .select('id, email, name, full_name')
      
      if (finalError) {
        console.error('Error en verificación final:', finalError)
      } else {
        console.log('Estado final de los usuarios:')
        finalUsers.forEach(user => {
          console.log(`- ${user.name || user.full_name || 'Sin nombre'} (${user.email})`)
        })
      }
      
    } catch (error) {
      console.error('Error general:', error)
    }
    
  } catch (error) {
    console.error('Error en la función principal:', error)
  }
}

updateUserName()