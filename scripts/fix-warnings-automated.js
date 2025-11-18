#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

// Patrones para identificar y corregir warnings automáticamente
const WARNING_PATTERNS = {
  // Variables no utilizadas
  unusedVars: [
    // useState no usado
    {
      pattern: /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\([^)]*\);?\s*\n(?![\s\S]*\b\1\b)/g,
      description: 'useState no utilizado'
    },
    // useCallback no usado
    {
      pattern: /const\s+(\w+)\s*=\s*useCallback\([^)]*\);?\s*\n(?![\s\S]*\b\1\b)/g,
      description: 'useCallback no utilizado'
    },
    // useMemo no usado
    {
      pattern: /const\s+(\w+)\s*=\s*useMemo\([^)]*\);?\s*\n(?![\s\S]*\b\1\b)/g,
      description: 'useMemo no utilizado'
    },
    // Iconos importados no usados (Heroicons)
    {
      pattern: /import\s+\{\s*(\w+),\s*\w*\}\s*from\s*['"]@heroicons\/react[^'"]*['"];?\s*\n(?![\s\S]*\b\1\b)/g,
      description: 'Icono no utilizado'
    },
    {
      pattern: /import\s+\{\s*(\w+)\}\s*from\s*['"]@heroicons\/react[^'"]*['"];?\s*\n(?![\s\S]*\b\1\b)/g,
      description: 'Icono no utilizado'
    },
    // Servicios importados no usados
    {
      pattern: /import\s+(\w+)\s*from\s*['"][^'"]*services\/[^'"]*['"];?\s*\n(?![\s\S]*\b\1\b)/g,
      description: 'Servicio importado no utilizado'
    },
    // Variables simples no usadas
    {
      pattern: /const\s+(\w+)\s*=\s*[^;]+;?\s*\n(?![\s\S]*\b\1\b)/g,
      description: 'Variable no utilizada'
    }
  ],
  
  // Dependencias de useEffect
  missingDeps: [
    {
      pattern: /useEffect\(\(\)\s*=>\s*\{[^}]*loadAnalyticsData[^}]*\},\s*\[\]\)/g,
      replacement: "useEffect(() => { loadAnalyticsData() }, [loadAnalyticsData])",
      description: 'Añadir loadAnalyticsData a dependencias'
    },
    {
      pattern: /useEffect\(\(\)\s*=>\s*\{[^}]*loadRealTimeStats[^}]*\},\s*\[\]\)/g,
      replacement: "useEffect(() => { loadRealTimeStats() }, [loadRealTimeStats])",
      description: 'Añadir loadRealTimeStats a dependencias'
    },
    {
      pattern: /useEffect\(\(\)\s*=>\s*\{[^}]*applyFilters[^}]*\},\s*\[\]\)/g,
      replacement: "useEffect(() => { applyFilters() }, [applyFilters])",
      description: 'Añadir applyFilters a dependencias'
    },
    {
      pattern: /useEffect\(\(\)\s*=>\s*\{[^}]*extractUniqueFilters[^}]*\},\s*\[\]\)/g,
      replacement: "useEffect(() => { extractUniqueFilters() }, [extractUniqueFilters])",
      description: 'Añadir extractUniqueFilters a dependencias'
    },
    {
      pattern: /useEffect\(\(\)\s*=>\s*\{[^}]*loadCompanies[^}]*\},\s*\[\]\)/g,
      replacement: "useEffect(() => { loadCompanies() }, [loadCompanies])",
      description: 'Añadir loadCompanies a dependencias'
    },
    {
      pattern: /useEffect\(\(\)\s*=>\s*\{[^}]*loadEmployees[^}]*\},\s*\[\]\)/g,
      replacement: "useEffect(() => { loadEmployees() }, [loadEmployees])",
      description: 'Añadir loadEmployees a dependencias'
    }
  ]
}

// Archivos a procesar (basados en el output del build)
const FILES_TO_PROCESS = [
  'src/components/analytics/AnalyticsDashboard.js',
  'src/components/auth/ForgotPassword.js',
  'src/components/auth/GoogleAuthCallback.js',
  'src/components/auth/ResetPassword.js',
  'src/components/common/DragDropUpload.js',
  'src/components/communication/BrevoStatisticsDashboard.js',
  'src/components/communication/BrevoTemplatesManager.js',
  'src/components/communication/EmployeeFolders.js',
  'src/components/communication/EmployeeSelector.js',
  'src/components/communication/ReportsDashboard.js',
  'src/components/communication/WebrifyCommunicationDashboard.js',
  'src/components/dashboard/DatabaseCompanySummary.js',
  'src/components/embeddings/AIChat.js',
  'src/components/embeddings/SemanticSearch.js',
  'src/components/files/Files.js',
  'src/components/folders/Folders.js',
  'src/components/legal/BusquedaLeyes.js',
  'src/components/plans/UpgradePlan.js',
  'src/components/profile/Profile.js',
  'src/components/routines/RoutineUpload.js',
  'src/components/settings/CompanyForm.js',
  'src/components/settings/Settings.js',
  'src/components/settings/UserForm.js',
  'src/components/settings/UserManagement.js',
  'src/components/test/CompanySyncTest.js',
  'src/components/test/GoogleDriveConnectionVerifier.js',
  'src/components/test/GoogleDriveLocalTest.js',
  'src/components/test/GoogleDriveProductionDiagnosis.js',
  'src/components/test/GoogleDriveURIChecker.js',
  'src/components/whatsapp/WhatsAppOnboarding.js',
  'src/lib/distributedLockService.js',
  'src/lib/embeddings.js',
  'src/lib/googleDriveAuthService.js',
  'src/lib/superLockService.js',
  'src/services/companyKnowledgeService.js',
  'src/services/companyReportsService.js',
  'src/services/databaseEmployeeService.js',
  'src/services/enhancedCommunicationService.js',
  'src/services/googleDrivePersistenceService.js',
  'src/services/multiWhatsAppService.js',
  'src/services/trendsAnalysisService.js',
  'src/services/unifiedEmployeeFolderService.js',
  'src/services/whatsappComplianceService.js',
  'src/services/whatsappService.js'
]

let totalFixes = 0
let filesModified = 0

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let originalContent = content
  let fixes = 0

  // 1. Corregir variables no utilizadas
  WARNING_PATTERNS.unusedVars.forEach(({ pattern, description }) => {
    const matches = content.match(pattern)
    if (matches) {
      content = content.replace(pattern, '')
      fixes += matches.length
      console.log(`   ✓ Eliminado ${matches.length} ${description} en ${filePath}`)
    }
  })

  // 2. Corregir dependencias de useEffect
  WARNING_PATTERNS.missingDeps.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern)
    if (matches) {
      content = content.replace(pattern, replacement)
      fixes += matches.length
      console.log(`   ✓ Corregido ${matches.length} ${description} en ${filePath}`)
    }
  })

  // 3. Corregir caracteres de escape innecesarios en regex
  // Cambiar /[\s\-\(\)]/g por /[\s-()]/g
  const escapePattern = /\[\\s\\\\\\-\\(\\)\\]/g
  if (escapePattern.test(content)) {
    content = content.replace(escapePattern, '[\\s-()]')
    fixes++
    console.log(`   ✓ Corregido caracteres de escape en regex en ${filePath}`)
  }

  if (fixes > 0) {
    fs.writeFileSync(filePath, content, 'utf8')
    filesModified++
    totalFixes += fixes
    console.log(`📝 ${filePath}: ${fixes} correcciones aplicadas`)
  }
}

console.log('🔧 Iniciando corrección automatizada de warnings...\n')

// Procesar archivos en paralelo para mejor performance
FILES_TO_PROCESS.forEach(processFile)

console.log('\n' + '='.repeat(60))
console.log('📊 RESUMEN DE CORRECCIONES')
console.log('='.repeat(60))
console.log(`✅ Archivos modificados: ${filesModified}`)
console.log(`✅ Total de correcciones: ${totalFixes}`)
console.log('\n🎯 Siguientes pasos:')
console.log('   1. Revisar manualmente los archivos modificados')
console.log('   2. Ejecutar npm run build para verificar')
console.log('   3. Corregir manualmente casos especiales si es necesario')
console.log('\n⚠️  Algunos warnings requieren corrección manual:')
console.log('   - Funciones definidas después de uso (useCallback necesario)')
console.log('   - Casos complejos de dependencias circulares')
console.log('   - Lógica de negocio que requiere revisión')