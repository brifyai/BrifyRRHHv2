import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://tmqglnycivlcjijoymwe.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.pBfkSsN_x5-t9y2GlOVKKbG8GjvlHNfKjvvXNPZvyUo'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugRegistration() {
  console.log('🔍 Diagnosticando problema de registro...\n')

  try {
    // 1. Verificar estructura de la tabla users
    console.log('1. Verificando estructura de la tabla users:')
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error al acceder a la tabla users:', tableError)
      return
    } else {
      console.log('✅ Tabla users accesible')
      if (tableInfo && tableInfo.length > 0) {
        console.log('   Columnas encontradas:', Object.keys(tableInfo[0]))
      } else {
        console.log('   Tabla users está vacía (esto es normal si no hay usuarios)')
      }
    }

    // 2. Probar creación de usuario de prueba
    console.log('\n2. Probando creación de usuario de prueba:')
    const testEmail = `test_${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    // Primero crear en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })

    if (authError) {
      console.error('❌ Error creando usuario en auth:', authError)
      return
    }

    console.log('✅ Usuario creado en auth.users:', authData.user.id)

    // Luego crear perfil en users table
    const userProfile = {
      id: authData.user.id,
      email: testEmail,
      name: 'Usuario de Prueba',
      telegram_id: null,
      is_active: true,
      current_plan_id: null,
      plan_expiration: null,
      used_storage_bytes: 0,
      registered_via: 'web',
      admin: false,
      onboarding_status: 'pending',
      registro_previo: true
    }

    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([userProfile])
      .select()

    if (profileError) {
      console.error('❌ Error creando perfil en users:', profileError)
      console.error('   Detalles del error:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code
      })
    } else {
      console.log('✅ Perfil creado exitosamente en users table')
      console.log('   Datos del perfil:', profileData)
    }

    // 3. Verificar si el usuario existe después de la creación
    console.log('\n3. Verificando si el usuario existe:')
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (verifyError) {
      console.error('❌ Error verificando usuario:', verifyError)
    } else {
      console.log('✅ Usuario verificado exitosamente:', verifyData.email)
    }

    // 4. Limpiar usuario de prueba
    console.log('\n4. Limpiando usuario de prueba:')
    const { error: deleteProfileError } = await supabase
      .from('users')
      .delete()
      .eq('id', authData.user.id)

    if (deleteProfileError) {
      console.error('❌ Error eliminando perfil:', deleteProfileError)
    } else {
      console.log('✅ Perfil eliminado')
    }

    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(authData.user.id)
    if (deleteAuthError) {
      console.error('❌ Error eliminando usuario auth:', deleteAuthError)
    } else {
      console.log('✅ Usuario auth eliminado')
    }

    console.log('\n🎯 Diagnóstico completado')
    console.log('\n📋 Resumen:')
    console.log('- Si todos los pasos fueron ✅, el sistema funciona correctamente')
    console.log('- Si hay errores ❌, el problema está en los permisos o estructura')
    console.log('- El error "Error al crear el perfil de usuario" puede ser un falso positivo')

  } catch (error) {
    console.error('❌ Error general en el diagnóstico:', error)
  }
}

debugRegistration()