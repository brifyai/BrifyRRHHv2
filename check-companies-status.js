const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://tmqglnycivlcjijoymwe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCompaniesStatus() {
  try {
    console.log('🔍 Verificando estado de las empresas...')
    
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, status, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error:', error)
      return
    }
    
    console.log('📊 Total de empresas:', companies.length)
    
    const activeCompanies = companies.filter(c => c.status === 'active')
    const inactiveCompanies = companies.filter(c => c.status === 'inactive')
    const otherStatus = companies.filter(c => c.status !== 'active' && c.status !== 'inactive')
    
    console.log('✅ Activas (status = active):', activeCompanies.length)
    console.log('❌ Inactivas (status = inactive):', inactiveCompanies.length)
    console.log('🔄 Otro estado:', otherStatus.length)
    
    if (otherStatus.length > 0) {
      console.log('\n📋 Empresas con otro estado:')
      otherStatus.forEach(c => {
        console.log('   -', c.name, ':', c.status)
      })
    }
    
    console.log('\n📋 Lista completa:')
    companies.forEach((company, index) => {
      const icon = company.status === 'active' ? '✅' : '❌'
      console.log(`   ${index + 1}. ${icon} ${company.name} - ${company.status}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkCompaniesStatus()