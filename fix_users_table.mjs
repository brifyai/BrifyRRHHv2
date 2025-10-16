import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixUsersTable() {
  try {
    console.log('Intentando verificar y corregir la estructura de la tabla users...')
    
    // Primero, intentar insertar una columna 'name' si no existe
    // Esto probablemente falle con el rol anon, pero lo intentamos
    try {
      const { data, error } = await supabase
        .rpc('exec_sql', { 
          sql: `
            DO $$
            BEGIN
                -- Agregar columna 'name' si no existe
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'name'
                ) THEN
                    ALTER TABLE users ADD COLUMN name VARCHAR(255);
                    RAISE NOTICE 'Columna name agregada a la tabla users';
                END IF;
                
                -- También agregar otras columnas que faltan según el código
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'current_plan_id'
                ) THEN
                    ALTER TABLE users ADD COLUMN current_plan_id UUID;
                    RAISE NOTICE 'Columna current_plan_id agregada a la tabla users';
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'plan_expiration'
                ) THEN
                    ALTER TABLE users ADD COLUMN plan_expiration TIMESTAMP WITH TIME ZONE;
                    RAISE NOTICE 'Columna plan_expiration agregada a la tabla users';
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'used_storage_bytes'
                ) THEN
                    ALTER TABLE users ADD COLUMN used_storage_bytes BIGINT DEFAULT 0;
                    RAISE NOTICE 'Columna used_storage_bytes agregada a la tabla users';
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'registered_via'
                ) THEN
                    ALTER TABLE users ADD COLUMN registered_via VARCHAR(50) DEFAULT 'web';
                    RAISE NOTICE 'Columna registered_via agregada a la tabla users';
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'admin'
                ) THEN
                    ALTER TABLE users ADD COLUMN admin BOOLEAN DEFAULT false;
                    RAISE NOTICE 'Columna admin agregada a la tabla users';
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'onboarding_status'
                ) THEN
                    ALTER TABLE users ADD COLUMN onboarding_status VARCHAR(50) DEFAULT 'pending';
                    RAISE NOTICE 'Columna onboarding_status agregada a la tabla users';
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'registro_previo'
                ) THEN
                    ALTER TABLE users ADD COLUMN registro_previo BOOLEAN DEFAULT false;
                    RAISE NOTICE 'Columna registro_previo agregada a la tabla users';
                END IF;
            END $$;
          `
        })
      
      if (error) {
        console.log('No se puede ejecutar SQL directamente con rol anon (esperado):', error.message)
      } else {
        console.log('Estructura de tabla actualizada exitosamente')
      }
    } catch (sqlError) {
      console.log('Error ejecutando SQL:', sqlError.message)
    }
    
    // Ahora intentar verificar si podemos insertar un usuario de prueba
    console.log('\nIntentando crear/verificar usuario de prueba...')
    
    // Primero verificar si hay algún usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('No hay usuario autenticado:', authError.message)
      
      // Intentar crear un usuario de prueba con datos fijos
      const testUserId = '00000000-0000-0000-0000-000000000001'
      const testEmail = 'test@example.com'
      
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .upsert({
          id: testUserId,
          email: testEmail,
          name: 'Juan Pablo Riesco', // Nombre correcto
          full_name: 'Juan Pablo Riesco',
          current_plan_id: null,
          is_active: true,
          plan_expiration: null,
          used_storage_bytes: 0,
          registered_via: 'web',
          admin: false,
          onboarding_status: 'pending',
          registro_previo: true
        })
        .select()
      
      if (insertError) {
        console.error('Error insertando usuario de prueba:', insertError)
      } else {
        console.log('Usuario de prueba creado/actualizado:', insertData)
      }
    } else {
      console.log('Usuario autenticado encontrado:', user.id, user.email)
      
      // Crear perfil para el usuario autenticado
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: 'Juan Pablo Riesco', // Nombre correcto
          full_name: 'Juan Pablo Riesco',
          current_plan_id: null,
          is_active: true,
          plan_expiration: null,
          used_storage_bytes: 0,
          registered_via: 'web',
          admin: false,
          onboarding_status: 'pending',
          registro_previo: true
        })
        .select()
      
      if (profileError) {
        console.error('Error creando perfil:', profileError)
      } else {
        console.log('Perfil creado/actualizado:', profileData)
      }
    }
    
    // Verificar usuarios después de la corrección
    console.log('\nVerificando usuarios después de la corrección...')
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*')
    
    if (finalError) {
      console.error('Error verificando usuarios finales:', finalError)
    } else {
      console.log(`Se encontraron ${finalUsers.length} usuarios:`)
      finalUsers.forEach(user => {
        console.log(`- ${user.name || user.full_name || 'Sin nombre'} (${user.email})`)
      })
    }
    
  } catch (error) {
    console.error('Error general:', error)
  }
}

fixUsersTable()