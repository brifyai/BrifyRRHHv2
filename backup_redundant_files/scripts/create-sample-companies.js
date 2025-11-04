import { supabase } from '../src/lib/supabase.js'

const sampleCompanies = [
  { name: 'Ariztia', status: 'active', industry: 'Alimentos' },
  { name: 'Inchcape', status: 'active', industry: 'Automotriz' },
  { name: 'Achs', status: 'active', industry: 'Seguridad' },
  { name: 'Arcoprime', status: 'active', industry: 'Construcción' },
  { name: 'Grupo Saesa', status: 'active', industry: 'Energía' },
  { name: 'Falabella', status: 'active', industry: 'Retail' },
  { name: 'Cencosud', status: 'active', industry: 'Retail' },
  { name: 'Latam Airlines', status: 'active', industry: 'Aviación' },
  { name: 'Codelco', status: 'active', industry: 'Minería' },
  { name: 'Entel', status: 'active', industry: 'Telecomunicaciones' },
  { name: 'Movistar', status: 'active', industry: 'Telecomunicaciones' },
  { name: 'Banco de Chile', status: 'active', industry: 'Banca' },
  { name: 'Santander', status: 'active', industry: 'Banca' },
  { name: 'BCI', status: 'active', industry: 'Banca' },
  { name: 'Scotiabank', status: 'active', industry: 'Banca' },
  { name: 'Itaú', status: 'active', industry: 'Banca' }
]

async function createSampleCompanies() {
  console.log('🚀 Creando empresas de muestra...')
  
  try {
    // Verificar si ya existen empresas
    const { data: existingCompanies, error: fetchError } = await supabase
      .from('companies')
      .select('name')
    
    if (fetchError) {
      console.error('❌ Error verificando empresas existentes:', fetchError)
      return
    }
    
    const existingNames = existingCompanies.map(c => c.name)
    const companiesToInsert = sampleCompanies.filter(company => !existingNames.includes(company.name))
    
    if (companiesToInsert.length === 0) {
      console.log('✅ Todas las empresas de muestra ya existen')
      return
    }
    
    console.log(`📝 Insertando ${companiesToInsert.length} empresas nuevas...`)
    
    // Insertar empresas con timestamps
    const companiesWithTimestamps = companiesToInsert.map(company => ({
      ...company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    const { data, error } = await supabase
      .from('companies')
      .insert(companiesWithTimestamps)
      .select()
    
    if (error) {
      console.error('❌ Error insertando empresas:', error)
      return
    }
    
    console.log(`✅ ${data.length} empresas creadas exitosamente:`)
    data.forEach(company => {
      console.log(`   - ${company.name} (${company.industry})`)
    })
    
  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar el script
createSampleCompanies()
  .then(() => {
    console.log('🎉 Proceso completado')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })