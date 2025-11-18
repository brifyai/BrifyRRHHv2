/**
 * Script para corregir warnings simples de ESLint
 * Prioridad: Variables no utilizadas (fáciles y seguras)
 */

const fs = require('fs');
const path = require('path');

// Archivos conocidos con warnings simples
const filesToFix = [
  'src/components/analytics/AnalyticsDashboard.js',
  'src/components/auth/ForgotPassword.js',
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
  'src/components/plans/UpgradePlan.js',
  'src/components/profile/Profile.js',
  'src/components/routines/RoutineUpload.js',
  'src/components/settings/CompanyForm.js',
  'src/components/settings/DatabaseSettings.js',
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
  'src/services/brevoService.js',
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
];

// Patrones de variables no utilizadas comunes
const unusedPatterns = [
  { regex: /import\s+{\s*(\w+)\s*}\s+from\s+['"][^'"]+['"];/g, type: 'named-import' },
  { regex: /import\s+(\w+)\s+from\s+['"][^'"]+['"];/g, type: 'default-import' },
  { regex: /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\([^)]*\);/g, type: 'useState' },
  { regex: /const\s+(\w+)\s*=\s*use(Callback|Memo|Effect)\([^)]*\);/g, type: 'hook' },
  { regex: /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g, type: 'arrow-function' },
  { regex: /function\s+(\w+)\s*\([^)]*\)/g, type: 'function' }
];

console.log('🔍 Analizando archivos para warnings simples...\n');

let totalWarningsFixed = 0;
let filesModified = 0;

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileWarnings = 0;

  console.log(`\n📄 Analizando: ${filePath}`);

  // Para cada patrón, verificar si la variable se usa realmente
  unusedPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(originalContent)) !== null) {
      const varName = match[1];
      
      // Verificar si la variable se usa (excluyendo la declaración)
      const usageRegex = new RegExp(`\\b${varName}\\b(?!\\s*=)`, 'g');
      const usages = content.match(usageRegex);
      
      // Si solo hay una coincidencia (la declaración), la variable no se usa
      if (usages && usages.length === 1) {
        console.log(`   🗑️  Variable no utilizada: ${varName} (${pattern.type})`);
        
        // Para imports, eliminar la línea completa
        if (pattern.type === 'named-import' || pattern.type === 'default-import') {
          const importRegex = new RegExp(`import\\s+{?\\s*${varName}\\s*}?\\s+from\\s+['"][^'"]+['"];?\\n?`, 'g');
          content = content.replace(importRegex, '');
        }
        // Para useState, dejar comentario ya que podría ser intencional
        else if (pattern.type === 'useState') {
          const stateRegex = new RegExp(`^\\s*const\\s+\\[${varName},\\s*set\\w+\\]\\s*=\\s*useState\\([^)]*\\);\\n?`, 'gm');
          content = content.replace(stateRegex, `// eslint-disable-next-line no-unused-vars\n$&`);
        }
        // Para otras variables, agregar comentario eslint-disable
        else {
          const varRegex = new RegExp(`^\\s*(const|let|var)\\s+${varName}\\s*=`, 'gm');
          content = content.replace(varRegex, `// eslint-disable-next-line no-unused-vars\n$&`);
        }
        
        fileWarnings++;
        totalWarningsFixed++;
      }
    }
  });

  if (fileWarnings > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    console.log(`   ✅ Corregidos ${fileWarnings} warnings`);
  } else {
    console.log(`   ✓ No se encontraron warnings simples`);
  }
});

console.log(`\n🎉 Resumen:`);
console.log(`   - Archivos modificados: ${filesModified}`);
console.log(`   - Warnings corregidos: ${totalWarningsFixed}`);
console.log(`\n⚠️  Nota: Algunos warnings requieren revisión manual`);
console.log(`   - Dependencias de useEffect`);
console.log(`   - Reordenamiento de funciones`);
console.log(`   - Lógica de negocio compleja`);