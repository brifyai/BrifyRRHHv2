import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function investigateNameSource() {
  try {
    console.log('=== INVESTIGACIÓN COMPLETA DE LA FUENTE DEL NOMBRE ===')
    
    // 1. Intentar iniciar sesión con credenciales para obtener el usuario actual
    console.log('\n1. Intentando obtener información del usuario actual...')
    
    // Como no podemos iniciar sesión desde aquí, vamos a buscar en todas las tablas posibles
    // que podrían contener información del usuario
    
    // 2. Buscar en todas las tablas que puedan contener nombres
    console.log('\n2. Buscando en todas las tablas posibles...')
    
    const tablesToSearch = [
      'users',
      'carpeta_administrador',
      'sub_carpetas_administrador', 
      'carpetas_usuario',
      'documentos_entrenador',
      'documentos_usuario_entrenador',
      'user_credentials',
      'user_tokens_usage'
    ]
    
    for (const tableName of tablesToSearch) {
      try {
        console.log(`\n--- Buscando en tabla: ${tableName} ---`)
        
        // Primero intentar obtener la estructura
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (sampleError) {
          console.log(`Error accediendo a ${tableName}:`, sampleError.message)
          continue
        }
        
        if (sampleData && sampleData.length > 0) {
          console.log(`Estructura de ${tableName}:`, Object.keys(sampleData[0]))
          
          // Buscar registros que contengan "Camilo"
          const searchFields = Object.keys(sampleData[0]).filter(key => 
            key.toLowerCase().includes('name') || 
            key.toLowerCase().includes('correo') || 
            key.toLowerCase().includes('email') ||
            key.toLowerCase().includes('administrador') ||
            key.toLowerCase().includes('entrenador')
          )
          
          console.log(`Campos a buscar en ${tableName}:`, searchFields)
          
          for (const field of searchFields) {
            try {
              const { data: searchResults, error: searchError } = await supabase
                .from(tableName)
                .select('*')
                .ilike(field, '%camilo%')
              
              if (searchError) {
                console.log(`Error buscando en ${field}:`, searchError.message)
              } else if (searchResults && searchResults.length > 0) {
                console.log(`¡ENCONTRADO! ${searchResults.length} resultados en ${tableName}.${field}:`)
                searchResults.forEach((result, index) => {
                  console.log(`  Resultado ${index + 1}:`)
                  console.log(`    ${JSON.stringify(result, null, 2)}`)
                })
              }
            } catch (e) {
              console.log(`Error en búsqueda ${field}:`, e.message)
            }
          }
        } else {
          console.log(`Tabla ${tableName} está vacía o no accesible`)
        }
        
      } catch (error) {
        console.log(`Error general con tabla ${tableName}:`, error.message)
      }
    }
    
    // 3. Intentar verificar si hay algún patrón en los datos
    console.log('\n3. Búsqueda genérica de "Camilo" en todas partes...')
    
    // Intentar una búsqueda más amplia
    try {
      // Buscar en cualquier campo de texto que pueda contener "Camilo"
      const { data: genericResults, error: genericError } = await supabase
        .from('users')
        .select('*')
        .or('email.ilike.%camilo%,full_name.ilike.%camilo%')
      
      if (genericError) {
        console.log('Error en búsqueda genérica:', genericError.message)
      } else if (genericResults && genericResults.length > 0) {
        console.log('Resultados genéricos:', genericResults)
      }
    } catch (e) {
      console.log('Error en búsqueda genérica:', e.message)
    }
    
    // 4. Verificar si hay datos de ejemplo o datos fijos en el código
    console.log('\n4. Análisis del problema...')
    console.log('Si no se encuentra "Camilo Alegria" en la base de datos, podría estar:')
    console.log('- Hardcodeado en algún componente de React')
    console.log('- En los metadatos del usuario autenticado (auth.users)')
    console.log('- En localStorage o sessionStorage del navegador')
    console.log('- En algún archivo de configuración o datos de ejemplo')
    
    // 5. Recomendaciones específicas
    console.log('\n=== ACCIONES RECOMENDADAS ===')
    console.log('1. Ejecutar el script fix_users_structure.sql en Supabase')
    console.log('2. Iniciar sesión en la aplicación para crear el perfil del usuario')
    console.log('3. Revisar el código fuente buscando "Camilo Alegria" hardcoded')
    console.log('4. Limpiar localStorage y sessionStorage en el navegador')
    console.log('5. Verificar los metadatos del usuario en auth.users')
    
    // 6. Crear un usuario con el nombre correcto para prueba
    console.log('\n6. Intentando crear usuario con nombre correcto...')
    try {
      // Necesitamos un UUID válido para el ID
      const validUUID = '00000000-0000-0000-0000-000000000001'
      
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .upsert({
          id: validUUID,
          email: 'test@juanspablo.com',
          full_name: 'Juan Pablo Riesco',
          is_active: true
        })
        .select()
      
      if (insertError) {
        console.log('Error creando usuario de prueba:', insertError.message)
      } else {
        console.log('Usuario de prueba creado:', insertData)
      }
    } catch (error) {
      console.log('Error creando usuario:', error.message)
    }
    
  } catch (error) {
    console.error('Error general en investigación:', error)
  }
}

investigateNameSource()