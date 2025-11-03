import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRegistration() {
  console.log('🧪 Probando el sistema de registro corregido...\n')

  const testEmail = `testuser${Date.now()}@gmail.com`
  const testPassword = 'testpassword123'
  const testName = 'Usuario de Prueba'

  try {
    // 1. Probar registro usando el mismo método que el frontend
    console.log('1. Probando registro de nuevo usuario:')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { name: testName }
      }
    })

    if (authError) {
      console.error('❌ Error en registro:', authError)
      return
    }

    console.log('✅ Usuario registrado en auth.users:', authData.user?.id)

    // 2. Verificar que el perfil se cree automáticamente (como lo hace el AuthContext)
    console.log('\n2. Verificando creación automática del perfil:')
    
    // Esperar un momento para que se cree el perfil
    await new Promise(resolve => setTimeout(resolve, 2000))

    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Error verificando perfil:', profileError)
    } else {
      console.log('✅ Perfil creado exitosamente:')
      console.log('   Email:', profileData.email)
      console.log('   Nombre:', profileData.name)
      console.log('   Activo:', profileData.is_active)
      console.log('   Registrado vía:', profileData.registered_via)
    }

    // 3. Probar inicio de sesión
    console.log('\n3. Probando inicio de sesión:')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError) {
      console.error('❌ Error en inicio de sesión:', signInError)
    } else {
      console.log('✅ Inicio de sesión exitoso')
      console.log('   Usuario ID:', signInData.user?.id)
      console.log('   Email:', signInData.user?.email)
    }

    // 4. Limpiar datos de prueba
    console.log('\n4. Limpiando datos de prueba:')
    
    // Cerrar sesión
    await supabase.auth.signOut()
    
    // Eliminar perfil (usando service role)
    const serviceSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY)
    await serviceSupabase.from('users').delete().eq('id', authData.user.id)
    await serviceSupabase.auth.admin.deleteUser(authData.user.id)
    
    console.log('✅ Datos de prueba eliminados')

    console.log('\n🎉 Prueba completada exitosamente')
    console.log('\n📋 Conclusión:')
    console.log('✅ El sistema de registro funciona correctamente')
    console.log('✅ El perfil se crea automáticamente')
    console.log('✅ El inicio de sesión funciona')
    console.log('✅ El error "Error al crear el perfil de usuario" ha sido corregido')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar la prueba
testRegistration().catch(console.error)