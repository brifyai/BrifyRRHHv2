import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAllUsers() {
  try {
    console.log('Buscando todos los usuarios en la tabla users...')
    
    // Obtener todos los usuarios
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo usuarios:', error)
      return
    }
    
    console.log(`\nSe encontraron ${users.length} usuarios:`)
    console.log('=====================================')
    
    users.forEach((user, index) => {
      console.log(`\nUsuario ${index + 1}:`)
      console.log(`ID: ${user.id}`)
      console.log(`Email: ${user.email}`)
      console.log(`Name: ${user.name}`)
      console.log(`Created: ${user.created_at}`)
      console.log(`Is Active: ${user.is_active}`)
      console.log('---')
    })
    
    // Buscar específicamente usuarios con nombres que mencionan
    console.log('\n\nBúsqueda específica:')
    console.log('====================')
    
    const { data: specificUsers, error: specificError } = await supabase
      .from('users')
      .select('*')
      .or('name.ilike.%Camilo%,name.ilike.%Juan Pablo%')
    
    if (specificError) {
      console.error('Error en búsqueda específica:', specificError)
    } else {
      console.log(`\nUsuarios con nombres 'Camilo' o 'Juan Pablo':`)
      specificUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ID: ${user.id}`)
      })
    }
    
  } catch (error) {
    console.error('Error general:', error)
  }
}

checkAllUsers()