import { createClient } from '@supabase/supabase-js';

console.log('🔧 Corrigiendo permisos RLS para la tabla employees...');

// Configuración de Supabase con clave de servicio para poder modificar RLS
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.1bemvXK8mHpvoA4djXmjtzrtDGFqBY4VBb62QQKuyhw';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLSPolicies() {
  try {
    console.log('📊 Deshabilitando RLS para la tabla employees...');
    
    // Deshabilitar RLS temporalmente
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE employees DISABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log('⚠️  No se pudo deshabilitar RLS con RPC, intentando con SQL directo...');
      
      // Intentar con SQL directo
      const { error: directError } = await supabase
        .from('employees')
        .select('*')
        .limit(1);
      
      if (directError && directError.message.includes('row-level security')) {
        console.log('🔒 RLS está activado y bloqueando el acceso');
      }
    } else {
      console.log('✅ RLS deshabilitado correctamente');
    }
    
    // Crear política para permitir acceso público a la tabla employees
    console.log('📝 Creando política de acceso público para employees...');
    
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Enable read access for all users" ON employees;
        CREATE POLICY "Enable read access for all users" ON employees
          FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Enable insert for all users" ON employees;
        CREATE POLICY "Enable insert for all users" ON employees
          FOR INSERT WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Enable update for all users" ON employees;
        CREATE POLICY "Enable update for all users" ON employees
          FOR UPDATE USING (true);
        
        DROP POLICY IF EXISTS "Enable delete for all users" ON employees;
        CREATE POLICY "Enable delete for all users" ON employees
          FOR DELETE USING (true);
      `
    });
    
    if (policyError) {
      console.log('⚠️  No se pudo crear la política con RPC');
    } else {
      console.log('✅ Políticas creadas correctamente');
    }
    
    // Habilitar RLS nuevamente
    console.log('🔄 Habilitando RLS nuevamente...');
    
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE employees ENABLE ROW LEVEL SECURITY;'
    });
    
    if (enableError) {
      console.log('⚠️  No se pudo habilitar RLS');
    } else {
      console.log('✅ RLS habilitado correctamente');
    }
    
    // Verificar acceso con clave anónima
    console.log('🧪 Verificando acceso con clave anónima...');
    
    const supabaseAnon = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE');
    
    const { count, error: testError } = await supabaseAnon
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Error al acceder con clave anónima:', testError);
      console.log('🔧 Intentando solución alternativa: deshabilitar RLS completamente...');
      
      // Deshabilitar RLS completamente como última opción
      const { error: disableError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE employees DISABLE ROW LEVEL SECURITY;'
      });
      
      if (disableError) {
        console.error('❌ No se pudo deshabilitar RLS:', disableError);
      } else {
        console.log('✅ RLS deshabilitado completamente');
        
        // Verificar nuevamente
        const { count: finalCount, error: finalError } = await supabaseAnon
          .from('employees')
          .select('*', { count: 'exact', head: true });
        
        if (finalError) {
          console.error('❌ Aún hay error:', finalError);
        } else {
          console.log(`✅ ÉXITO: Ahora se pueden acceder a ${finalCount} empleados con clave anónima`);
        }
      }
    } else {
      console.log(`✅ ÉXITO: Se pueden acceder a ${count} empleados con clave anónima`);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

fixRLSPolicies();