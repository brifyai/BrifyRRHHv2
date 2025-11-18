/**
 * Script seguro para corregir warnings críticos
 * SOLO corrige imports no utilizados que son 100% seguros
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Corrigiendo warnings críticos de forma segura...\n');

// Warnings 100% seguros de corregir (imports que no se usan para nada)
const safeFixes = [
  {
    file: 'src/components/auth/ForgotPassword.js',
    line: "import LoadingSpinner from '../common/LoadingSpinner.js';",
    reason: 'LoadingSpinner importado pero nunca usado'
  },
  {
    file: 'src/components/embeddings/AIChat.js',
    line: "import LoadingSpinner from '../common/LoadingSpinner.js';",
    reason: 'LoadingSpinner importado pero nunca usado'
  },
  {
    file: 'src/components/embeddings/SemanticSearch.js',
    line: "import LoadingSpinner from '../common/LoadingSpinner.js';",
    reason: 'LoadingSpinner importado pero nunca usado'
  },
  {
    file: 'src/components/settings/DatabaseSettings.js',
    line: /import.*'@heroicons\/react\/24\/outline';/,
    reason: 'Heroicons importados pero nunca usados'
  }
];

let fixedCount = 0;

safeFixes.forEach(fix => {
  if (!fs.existsSync(fix.file)) {
    console.log(`⚠️  Archivo no encontrado: ${fix.file}`);
    return;
  }

  let content = fs.readFileSync(fix.file, 'utf8');
  const originalContent = content;

  // Para líneas exactas
  if (typeof fix.line === 'string') {
    if (content.includes(fix.line)) {
      content = content.replace(fix.line + '\n', '');
      console.log(`✅ Corregido: ${fix.file}`);
      console.log(`   🗑️  Eliminado: ${fix.line.trim()}`);
      fixedCount++;
    }
  }
  // Para patrones regex
  else if (fix.line instanceof RegExp) {
    const match = content.match(fix.line);
    if (match) {
      content = content.replace(fix.line, '');
      console.log(`✅ Corregido: ${fix.file}`);
      console.log(`   🗑️  Eliminado: ${match[0].trim()}`);
      fixedCount++;
    }
  }

  // Solo escribir si hubo cambios
  if (content !== originalContent) {
    fs.writeFileSync(fix.file, content, 'utf8');
  }
});

console.log(`\n🎉 Resumen:`);
console.log(`   - Warnings corregidos: ${fixedCount}`);
console.log(`   - Archivos modificados: ${fixedCount > 0 ? 'Sí' : 'No'}`);
console.log(`\n✅ Solo se corrigieron warnings 100% seguros`);
console.log(`   - Imports que no se usan para nada`);
console.log(`   - Sin afectar funcionalidad`);