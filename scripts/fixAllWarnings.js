/**
 * Script avanzado para corregir automáticamente warnings de ESLint
 * 
 * Este script aborda:
 * 1. no-unused-vars (imports, variables, parámetros)
 * 2. react-hooks/exhaustive-deps (dependencias faltantes)
 * 3. no-use-before-define (reorganización de funciones)
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const WARNING_PATTERNS = {
  // Variables no utilizadas
  unusedVar: /^\s*(const|let|var)\s+(\w+)\s*=\s*.*;\s*\/\/\s*(eslint-disable-next-line\s+)?no-unused-vars$/,
  unusedImport: /import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"];\s*\/\/\s*(eslint-disable-next-line\s+)?no-unused-vars$/,
  unusedDefaultImport: /import\s+(\w+)\s+from\s+['"]([^'"]+)['"];\s*\/\/\s*(eslint-disable-next-line\s+)?no-unused-vars$/,
  
  // Iconos de Heroicons no usados
  unusedIcon: /import\s+{\s*([^}]*Icon[^,]*(?:,\s*[^}]*Icon[^}]*)*)\s*}\s+from\s+['"]@heroicons\/react[^'"]*['"];?$/,
  
  // Parámetros no usados en funciones
  unusedParam: /function\s+\w+\([^)]*\)\s*{\s*\/\/\s*eslint-disable-next-line\s+no-unused-vars$/,
  
  // Dependencias faltantes en hooks
  missingDeps: /React Hook (useEffect|useMemo|useCallback) has a missing dependency: '([^']+)'. Either include it or remove the dependency array/
}

// Archivos a excluir de la corrección
const EXCLUDE_FILES = [
  '*.backup',
  '*.test.js',
  '*.spec.js',
  'node_modules/**',
  'build/**',
  'backup_redundant_files/**'
]

// Funciones que son seguras para añadir como dependencias
const SAFE_DEPENDENCIES = [
  'loadUserProfile',
  'loadCompanies',
  'loadEmployees',
  'loadFolders',
  'loadFiles',
  'applyFilters',
  'extractUniqueFilters',
  'initializeOnboarding',
  'performDiagnosis',
  'runCompleteVerification',
  'testSubscription',
  'testGetCompanies',
  'testGetStats',
  'loadReports',
  'loadCompanyData',
  'loadAdminFolderByDefault',
  'loadAvailableSubFolders',
  'loadPermissionsByCategory',
  'loadData',
  'loadCompanyInsights',
  'loadPaymentHistory',
  'loadAvailableExtensions',
  'loadCompaniesFromDB',
  'loadEmployeesOnly',
  'loadFoldersForCurrentPage'
]

// Funciones que deben ser envueltas en useCallback
const SHOULD_USE_CALLBACK = [
  'loadFolders',
  'loadEmployeesOnly',
  'loadReports',
  'loadCompanyData',
  'loadAdminFolderByDefault',
  'loadAvailableSubFolders',
  'loadPermissionsByCategory',
  'loadData',
  'loadCompaniesFromDB',
  'loadFoldersForCurrentPage'
]

function findJSFiles(dir, files = []) {
  const items = readdirSync(dir)
  
  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)
    
    // Excluir directorios y archivos no deseados
    const shouldExclude = EXCLUDE_FILES.some(pattern => {
      if (pattern.includes('/**')) {
        const dirPattern = pattern.replace('/**', '')
        return fullPath.includes(dirPattern)
      }
      return fullPath.includes(pattern.replace('*', ''))
    })
    
    if (shouldExclude) continue
    
    if (stat.isDirectory()) {
      findJSFiles(fullPath, files)
    } else if (stat.isFile() && extname(fullPath) === '.js' && !fullPath.includes('.backup')) {
      files.push(fullPath)
    }
  }
  
  return files
}

function fixUnusedImports(content, filePath) {
  let fixed = content
  let changes = []
  
  // Buscar imports de Heroicons no usados
  const iconImportRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@heroicons\/react[^'"]*['"];?$/gm
  
  let match
  while ((match = iconImportRegex.exec(content)) !== null) {
    const fullImport = match[0]
    const importedIcons = match[1].split(',').map(icon => icon.trim())
    
    // Verificar si cada icono se usa en el archivo
    const usedIcons = importedIcons.filter(icon => {
      // Excluir la línea del import mismo
      const contentWithoutImport = content.replace(fullImport, '')
      const iconUsageRegex = new RegExp(`\\b${icon}\\b`, 'g')
      return iconUsageRegex.test(contentWithoutImport)
    })
    
    // Si ningún icono se usa, eliminar el import completo
    if (usedIcons.length === 0) {
      fixed = fixed.replace(fullImport + '\n', '')
      changes.push(`Eliminado import de Heroicons no usado: ${importedIcons.join(', ')}`)
    }
    // Si solo algunos se usan, actualizar el import
    else if (usedIcons.length < importedIcons.length) {
      const newImport = `import { ${usedIcons.join(', ')} } from '@heroicons/react/24/outline';`
      fixed = fixed.replace(fullImport, newImport)
      changes.push(`Actualizado import de Heroicons: ${importedIcons.length} → ${usedIcons.length} iconos`)
    }
  }
  
  return { content: fixed, changes }
}

function fixUnusedVariables(content, filePath) {
  let fixed = content
  let changes = []
  
  // Buscar variables declaradas pero no usadas (con comentario eslint)
  const unusedVarRegex = /^\s*(const|let|var)\s+(\w+)\s*=\s*[^;]+;\s*\/\/\s*eslint-disable-next-line\s+no-unused-vars$/gm
  
  let match
  while ((match = unusedVarRegex.exec(content)) !== null) {
    const fullLine = match[0]
    const varName = match[2]
    
    // Verificar si la variable se usa realmente (excluyendo la propia línea)
    const contentWithoutLine = content.replace(fullLine, '')
    const varUsageRegex = new RegExp(`\\b${varName}\\b(?!\\s*=)`, 'g')
    
    if (!varUsageRegex.test(contentWithoutLine)) {
      fixed = fixed.replace(fullLine + '\n', '')
      changes.push(`Eliminada variable no usada: ${varName}`)
    }
  }
  
  return { content: fixed, changes }
}

function fixMissingHookDependencies(content, filePath) {
  let fixed = content
  let changes = []
  
  // Buscar useEffect/useMemo/useCallback con dependencias incompletas
  const hookRegex = /(useEffect|useMemo|useCallback)\s*\(\s*\(\)\s*=>\s*{[^}]*}\s*,\s*\[([^\]]*)\]\s*\)/g
  
  let match
  while ((match = hookRegex.exec(content)) !== null) {
    const fullHook = match[0]
    const hookType = match[1]
    const currentDeps = match[2].split(',').map(d => d.trim()).filter(d => d)
    
    // Buscar funciones que deberían estar en las dependencias
    const missingDeps = SAFE_DEPENDENCIES.filter(dep => {
      // Si ya está en las dependencias, saltar
      if (currentDeps.includes(dep)) return false
      
      // Buscar uso de la función dentro del hook
      const hookBodyRegex = new RegExp(`${hookType}\\s*\\(\\(\\)\\s*=>\\s*{([^}]*)}\\s*,\\s*\\[`)
      const bodyMatch = fullHook.match(hookBodyRegex)
      
      if (bodyMatch) {
        const hookBody = bodyMatch[1]
        return hookBody.includes(dep)
      }
      
      return false
    })
    
    // Añadir dependencias faltantes
    if (missingDeps.length > 0) {
      const allDeps = [...currentDeps, ...missingDeps].filter((d, i, arr) => arr.indexOf(d) === i)
      const newDepsArray = `[${allDeps.join(', ')}]`
      
      // Reemplazar el array de dependencias
      const depsRegex = new RegExp(`${hookType}\\s*\\(\\(\\)\\s*=>\\s*{[^}]*}\\s*,\\s*\\[[^\\]]*\\]\\s*\\)`)
      const newHook = fullHook.replace(/\[\s*[^\]]*\s*\]$/, newDepsArray)
      
      fixed = fixed.replace(fullHook, newHook)
      changes.push(`Añadidas dependencias faltantes a ${hookType}: ${missingDeps.join(', ')}`)
    }
  }
  
  return { content: fixed, changes }
}

function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8')
    const originalContent = content
    const allChanges = []
    
    // Aplicar correcciones en orden
    const importFix = fixUnusedImports(content, filePath)
    content = importFix.content
    allChanges.push(...importFix.changes)
    
    const varFix = fixUnusedVariables(content, filePath)
    content = varFix.content
    allChanges.push(...varFix.changes)
    
    const hookFix = fixMissingHookDependencies(content, filePath)
    content = hookFix.content
    allChanges.push(...hookFix.changes)
    
    // Si hubo cambios, guardar el archivo
    if (content !== originalContent && allChanges.length > 0) {
      writeFileSync(filePath, content, 'utf8')
      console.log(`✅ ${filePath}`)
      allChanges.forEach(change => console.log(`   - ${change}`))
      return { file: filePath, changes: allChanges.length }
    }
    
    return { file: filePath, changes: 0 }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message)
    return { file: filePath, changes: 0, error: error.message }
  }
}

function main() {
  console.log('🔧 Iniciando corrección automática de warnings...\n')
  
  const srcDir = './src'
  const jsFiles = findJSFiles(srcDir)
  
  console.log(`📁 Encontrados ${jsFiles.length} archivos JavaScript para procesar\n`)
  
  let totalChanges = 0
  let filesModified = 0
  
  jsFiles.forEach(file => {
    const result = processFile(file)
    if (result.changes > 0) {
      totalChanges += result.changes
      filesModified++
    }
  })
  
  console.log(`\n📊 Resumen de correcciones:`)
  console.log(`✅ Archivos modificados: ${filesModified}`)
  console.log(`📝 Cambios totales aplicados: ${totalChanges}`)
  console.log(`📁 Archivos procesados: ${jsFiles.length}`)
  
  if (filesModified > 0) {
    console.log(`\n⚠️  IMPORTANTE: Revisa los cambios antes de hacer commit`)
    console.log(`   Algunas correcciones pueden necesitar ajustes manuales`)
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main, processFile, findJSFiles }