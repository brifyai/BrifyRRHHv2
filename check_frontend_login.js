const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Usar anon key como lo usa el frontend
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkFrontendLogin() {
  try {
    const email = 'camiloalegriabarra@gmail.com';
    const plainPassword = 'Antonito26';
    
    console.log('🔧 Configuración Frontend:');
    console.log('URL:', supabaseUrl);
    console.log('Anon Key disponible:', !!supabaseAnonKey);
    console.log('Anon Key (primeros 10 chars):', supabaseAnonKey?.substring(0, 10) + '...');
    
    console.log(`\n🔍 Probando login como lo hace el frontend...`);
    
    // 1. Intentar login con las credenciales actuales
    console.log('\n📋 1. Intentando login con "Antonito26"...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: plainPassword
    });
    
    if (signInError) {
      console.log('❌ Error con "Antonito26":', signInError.message);
      console.log('📋 Código de error:', signInError.status);
      console.log('📋 Detalles:', JSON.stringify(signInError, null, 2));
      
      // 2. Si falla, intentar con una contraseña más simple
      console.log('\n📋 2. Intentando con contraseña más simple...');
      const simplePassword = 'Antonito';
      
      const { data: simpleData, error: simpleError } = await supabase.auth.signInWithPassword({
        email: email,
        password: simplePassword
      });
      
      if (simpleError) {
        console.log('❌ Error con contraseña simple:', simpleError.message);
        
        // 3. Intentar con la contraseña temporal que generamos antes
        console.log('\n📋 3. Intentando con contraseña temporal...');
        const tempPassword = 'Temp123456!';
        
        const { data: tempData, error: tempError } = await supabase.auth.signInWithPassword({
          email: email,
          password: tempPassword
        });
        
        if (tempError) {
          console.log('❌ Error con contraseña temporal:', tempError.message);
        } else {
          console.log('✅ Login exitoso con contraseña temporal:', tempPassword);
          console.log('📋 Usuario:', tempData.user?.email);
          console.log('📋 Session:', tempData.session ? 'Activa' : 'Inactiva');
        }
      } else {
        console.log('✅ Login exitoso con contraseña simple:', simplePassword);
        console.log('📋 Usuario:', simpleData.user?.email);
        console.log('📋 Session:', simpleData.session ? 'Activa' : 'Inactiva');
      }
    } else {
      console.log('✅ Login exitoso con "Antonito26":');
      console.log('📋 Usuario:', signInData.user?.email);
      console.log('📋 Session:', signInData.session ? 'Activa' : 'Inactiva');
      console.log('📋 User ID:', signInData.user?.id);
      console.log('📋 Email confirmado:', signInData.user?.email_confirmed_at ? 'Sí' : 'No');
    }
    
    // 4. Verificar si hay problemas con el almacenamiento local
    console.log('\n📋 4. Verificando almacenamiento local...');
    
    // Simular lo que haría el navegador
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Error al obtener sesión:', sessionError.message);
    } else {
      console.log('✅ Sesión actual:', session ? 'Activa' : 'Inactiva');
      if (session) {
        console.log('📋 Session user:', session.user?.email);
      }
    }
    
    // 5. Intentar signup seguido de login (como alternativa)
    console.log('\n📋 5. Intentando método alternativo - signup...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: plainPassword,
      options: {
        emailRedirectTo: undefined
      }
    });
    
    if (signUpError) {
      console.log('📋 Error en signup (esperado si usuario existe):', signUpError.message);
    } else {
      console.log('✅ Signup exitoso (usuario nuevo o actualizado)');
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkFrontendLogin();