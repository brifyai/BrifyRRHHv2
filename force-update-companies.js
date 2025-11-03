import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceUpdateCompanies() {
  console.log('🔄 Forzando actualización de empresas...');
  
  try {
    // Primero, intentar actualizar solo un registro para probar
    const testId = '0061c339-8a1a-4da0-b770-80250794c176'; // ID del primer registro
    
    console.log(`🧪 Probando actualización con ID: ${testId}`);
    
    // Verificar el registro actual
    const { data: currentRecord, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', testId)
      .single();
    
    if (fetchError) {
      console.error('❌ Error obteniendo registro actual:', fetchError);
      return;
    }
    
    console.log(`📋 Registro actual: ${currentRecord.name}`);
    
    // Intentar actualizar con diferentes métodos
    console.log('🔄 Intentando actualización...');
    
    const { data: updateResult, error: updateError } = await supabase
      .from('companies')
      .update({ 
        name: 'Copec',
        updated_at: new Date().toISOString()
      })
      .eq('id', testId)
      .select();
    
    if (updateError) {
      console.error('❌ Error en actualización:', updateError);
      
      // Intentar con RPC si falla
      console.log('🔄 Intentando con RPC...');
      const { data: rpcResult, error: rpcError } = await supabase.rpc('update_company_name', {
        company_id: testId,
        new_name: 'Copec'
      });
      
      if (rpcError) {
        console.error('❌ Error con RPC:', rpcError);
      } else {
        console.log('✅ Actualización con RPC exitosa:', rpcResult);
      }
    } else {
      console.log('✅ Actualización exitosa:', updateResult);
    }
    
    // Verificar el resultado
    console.log('🔍 Verificando resultado...');
    const { data: verifyRecord, error: verifyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', testId)
      .single();
    
    if (!verifyError && verifyRecord) {
      console.log(`📋 Nuevo nombre: ${verifyRecord.name}`);
      
      if (verifyRecord.name === 'Copec') {
        console.log('🎉 ¡Actualización verificada con éxito!');
        
        // Si funcionó, actualizar los demás
        console.log('🔄 Actualizando el resto de las empresas...');
        
        const companiesToUpdate = [
          { id: '009352a9-55cb-41b2-8c24-8839286386b5', name: 'Hogar Alemán' },
          { id: '00db7a88-742d-4c4b-97e2-69240cce7b14', name: 'Falabella' },
          { id: '00e4b373-638e-4399-bbb5-8eea516fc229', name: 'Cencosud' },
          { id: '0118f477-5d2c-4734-ac66-06d9ce57a325', name: 'Entel' },
          { id: '01766c0a-5078-4e4f-b502-1fe2b5ebaf8b', name: 'Movistar' },
          { id: '01e3622c-af61-4341-9690-07733beda52b', name: 'Banco de Chile' },
          { id: '0218aeff-b141-40b9-a400-3a8c527251f8', name: 'Santander' },
          { id: '0232204a-2f28-45b8-9e3d-ef3d7fb4be08', name: 'BCI' },
          { id: '02ced56f-3612-4423-9ef6-3d887257f658', name: 'Scotiabank' },
          { id: '02e1429e-656f-4483-9791-2016f233f1cb', name: 'Itaú' },
          { id: '0380c642-91bc-4598-86c6-cbcea66b9f1d', name: 'Latam Airlines' },
          { id: '03e1d925-15b6-41fb-919a-c1d7f10a79ef', name: 'Codelco' },
          { id: '040150c3-cbd9-4a00-8388-73ea9bde9a03', name: 'Ariztia' },
          { id: '0432bcc7-c2de-4c78-8027-408a2daea310', name: 'Inchcape' },
          { id: '044a3c95-e166-4703-9125-8fe78f737390', name: 'Achs' }
        ];
        
        for (const company of companiesToUpdate) {
          console.log(`🔄 Actualizando ${company.name}...`);
          
          const { error: error } = await supabase
            .from('companies')
            .update({ 
              name: company.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', company.id);
          
          if (error) {
            console.error(`❌ Error actualizando ${company.name}:`, error);
          } else {
            console.log(`✅ ${company.name} actualizado`);
          }
        }
        
        console.log('🎉 ¡Actualización masiva completada!');
        
      } else {
        console.log('❌ La actualización no se reflejó correctamente');
      }
    } else {
      console.error('❌ Error verificando resultado:', verifyError);
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la actualización forzada
forceUpdateCompanies();