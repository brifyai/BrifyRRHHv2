import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Ejecutando SQL directo para deshabilitar RLS...');

// Configuración de Supabase con clave de servicio
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU1NDU0NiwiZXhwIjoyMDc2MTMwNTQ2fQ.1bemvXK8mHpvoA4djXmjtzrtDGFqBY4VBb62QQKuyhw';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLDirect() {
  try {
    console.log('📊 Ejecutando SQL para deshabilitar RLS...');
    
    // SQL directo para deshabilitar RLS
    const sqlStatements = [
      'ALTER TABLE employees DISABLE ROW LEVEL SECURITY;',
      'SELECT COUNT(*) as employee_count FROM employees;'
    ];
    
    for (const sql of sqlStatements) {
      console.log(`🔧 Ejecutando: ${sql}`);
      
      // Usar el endpoint REST de Supabase para ejecutar SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql })
      });
      
      if (!response.ok) {
        console.log(`⚠️  Error en: ${sql}`);
        console.log(`Status: ${response.status}`);
        continue;
      }
      
      const result = await response.json();
      console.log(`✅ Resultado:`, result);
    }
    
    // Verificar acceso con clave anónima
    console.log('🧪 Verificando acceso con clave anónima...');
    
    const supabaseAnon = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE');
    
    const { count, error: testError } = await supabaseAnon
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Error al acceder con clave anónima:', testError);
    } else {
      console.log(`✅ ÉXITO: Se pueden acceder a ${count} empleados con clave anónima`);
      console.log('🎯 El dashboard ahora debería mostrar el contador correcto');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

executeSQLDirect();