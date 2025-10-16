import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTableStructure() {
  try {
    console.log('Verificando estructura de la tabla users...')
    
    // Intentar obtener información de la tabla
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error verificando tabla users:', error)
      return
    }
    
    console.log('Estructura de la tabla users:')
    if (data && data.length > 0) {
      console.log('Columnas encontradas:', Object.keys(data[0]))
    } else {
      console.log('La tabla está vacía, intentando obtener información de columnas...')
      
      // Intentar con una consulta que muestre las columnas
      // Esto puede no funcionar con el rol anon, pero lo intentamos
      try {
        const { data: columnsData, error: columnsError } = await supabase
          .rpc('get_table_columns', { table_name: 'users' })
        
        if (columnsError) {
          console.log('No se puede obtener información de columnas con el rol actual')
          console.log('Error:', columnsError.message)
        } else {
          console.log('Columnas:', columnsData)
        }
      } catch (rpcError) {
        console.log('RPC no disponible, intentando método alternativo...')
      }
    }
    
    // Verificar si hay datos en auth.users
    console.log('\nVerificando usuarios en auth.users...')
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.log('No se puede acceder a auth.users con rol anon (esperado)')
        console.log('Error:', authError.message)
      } else {
        console.log(`Usuarios en auth.users: ${authUsers.users.length}`)
        authUsers.users.forEach(user => {
          console.log(`- ${user.email} (ID: ${user.id})`)
          console.log(`  Metadata:`, user.user_metadata)
        })
      }
    } catch (authError) {
      console.log('Error accediendo a auth.users:', authError.message)
    }
    
    // Verificar tablas existentes
    console.log('\nVerificando tablas existentes...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')
    
    if (tablesError) {
      console.error('Error obteniendo tablas:', tablesError)
    } else {
      console.log('Tablas disponibles:')
      tables.forEach(table => {
        console.log(`- ${table.table_name}`)
      })
    }
    
  } catch (error) {
    console.error('Error general:', error)
  }
}

checkTableStructure()