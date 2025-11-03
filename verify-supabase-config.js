/**
 * Script para verificar que todas las configuraciones de Supabase
 * apunten al proyecto correcto: tmqglnycivlcjijoymwe
 */

const fs = require('fs');
const path = require('path');

const CORRECT_PROJECT = 'tmqglnycivlcjijoymwe';
const INCORRECT_PROJECT = 'leoyybfbnjajkktprhro';

console.log('🔍 Verificando configuración de Supabase...\n');

// Función para buscar en archivos
function searchInFile(filePath, patterns) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        results.push({
          pattern,
          match: match[0],
          line: content.substring(0, match.index).split('\n').length,
          context: content.split('\n')[Math.max(0, content.substring(0, match.index).split('\n').length - 1)].trim()
        });
      }
    });
    
    return results;
  } catch (error) {
    return [];
  }
}

// Función para buscar recursivamente en directorio
function searchInDirectory(dirPath, patterns, extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.env', '.env.production']) {
  const results = [];
  
  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'build') {
        walkDir(filePath);
      } else if (stat.isFile()) {
        const ext = path.extname(file);
        if (extensions.includes(ext)) {
          const fileResults = searchInFile(filePath, patterns);
          if (fileResults.length > 0) {
            results.push({
              file: filePath,
              matches: fileResults
            });
          }
        }
      }
    }
  }
  
  walkDir(dirPath);
  return results;
}

// Patrones a buscar
const patterns = [
  INCORRECT_PROJECT,
  'https://leoyybfbnjajkktprhro\\.supabase\\.co',
  'leoyybfbnjajkktprhro\\.supabase\\.co',
  'REACT_APP_SUPABASE_URL.*leoyybfbnjajkktprhro'
];

console.log(`📁 Buscando referencias al proyecto incorrecto (${INCORRECT_PROJECT})...`);

const results = searchInDirectory('.', patterns);

if (results.length === 0) {
  console.log('✅ No se encontraron referencias al proyecto incorrecto');
} else {
  console.log(`❌ Se encontraron ${results.length} archivo(s) con referencias al proyecto incorrecto:\n`);
  
  results.forEach(result => {
    console.log(`📄 ${result.file}`);
    result.matches.forEach(match => {
      console.log(`   Línea ${match.line}: ${match.match}`);
      console.log(`   Contexto: ${match.context}`);
    });
    console.log('');
  });
}

console.log(`\n📁 Buscando referencias al proyecto correcto (${CORRECT_PROJECT})...`);

const correctResults = searchInDirectory('.', [
  CORRECT_PROJECT,
  'https://tmqglnycivlcjijoymwe\\.supabase\\.co',
  'tmqglnycivlcjijoymwe\\.supabase\\.co'
]);

if (correctResults.length > 0) {
  console.log(`✅ Se encontraron ${correctResults.length} archivo(s) con referencias al proyecto correcto:\n`);
  
  correctResults.forEach(result => {
    console.log(`📄 ${result.file}`);
    result.matches.forEach(match => {
      console.log(`   Línea ${match.line}: ${match.match}`);
    });
  });
} else {
  console.log('⚠️  No se encontraron referencias al proyecto correcto');
}

// Verificar archivos de configuración específicos
console.log('\n🔧 Verificando archivos de configuración clave...');

const configFiles = [
  '.env',
  '.env.production',
  'src/config/constants.js',
  'src/lib/supabaseClient.js',
  'src/services/databaseService.js'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasCorrect = content.includes(CORRECT_PROJECT);
    const hasIncorrect = content.includes(INCORRECT_PROJECT);
    
    console.log(`📄 ${file}:`);
    console.log(`   ✅ Proyecto correcto: ${hasCorrect ? 'SÍ' : 'NO'}`);
    console.log(`   ❌ Proyecto incorrecto: ${hasIncorrect ? 'SÍ' : 'NO'}`);
    
    if (hasIncorrect) {
      console.log(`   ⚠️  ¡ESTE ARCHIVO TIENE CONFIGURACIÓN INCORRECTA!`);
    }
  } else {
    console.log(`📄 ${file}: ❌ No existe`);
  }
});

console.log('\n🎯 Resumen:');
console.log(`- Proyecto correcto: ${CORRECT_PROJECT}`);
console.log(`- Proyecto incorrecto: ${INCORRECT_PROJECT}`);
console.log(`- Archivos con configuración incorrecta: ${results.length}`);
console.log(`- Archivos con configuración correcta: ${correctResults.length}`);

if (results.length === 0 && correctResults.length > 0) {
  console.log('\n🎉 ¡TODA LA CONFIGURACIÓN ES CORRECTA!');
} else {
  console.log('\n⚠️  Se encontraron problemas de configuración que deben ser corregidos');
}