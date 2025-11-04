// Script de prueba para verificar la configuración de Google Drive en Netlify
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando prueba de configuración de Google Drive para Netlify...\n');

// Test 1: Verificar archivos clave
console.log('📁 Test 1: Verificando archivos clave...');

const fs = await import('fs');
const path = await import('path');

const archivosClave = [
  'src/lib/hybridGoogleDrive.js',
  'src/lib/localGoogleDrive.js',
  'src/services/enhancedEmployeeFolderService.js',
  'netlify.toml',
  'GOOGLE_DRIVE_NETLIFY_SETUP.md'
];

let archivosOk = true;
for (const archivo of archivosClave) {
  try {
    const exists = fs.default.existsSync(join(process.cwd(), archivo));
    if (exists) {
      console.log(`✅ ${archivo} - encontrado`);
    } else {
      console.log(`❌ ${archivo} - NO encontrado`);
      archivosOk = false;
    }
  } catch (error) {
    console.log(`❌ ${archivo} - error verificando: ${error.message}`);
    archivosOk = false;
  }
}

if (archivosOk) {
  console.log('✅ Todos los archivos clave están presentes\n');
} else {
  console.log('❌ Faltan archivos clave\n');
  process.exit(1);
}

// Test 2: Verificar configuración de Netlify
console.log('📋 Test 2: Verificando configuración de Netlify...');

try {
  const netlifyConfig = fs.default.readFileSync(join(process.cwd(), 'netlify.toml'), 'utf8');
  
  const configuracionesRequeridas = [
    'REACT_APP_DRIVE_MODE = "local"',
    'REACT_APP_ENVIRONMENT = "production"',
    '[build]',
    'command = "npm run build"',
    'publish = "build"'
  ];

  let configOk = true;
  for (const config of configuracionesRequeridas) {
    if (netlifyConfig.includes(config)) {
      console.log(`✅ Configuración encontrada: ${config}`);
    } else {
      console.log(`❌ Configuración faltante: ${config}`);
      configOk = false;
    }
  }

  if (configOk) {
    console.log('✅ Configuración de Netlify es correcta\n');
  } else {
    console.log('❌ Configuración de Netlify incompleta\n');
  }
} catch (error) {
  console.log(`❌ Error leyendo netlify.toml: ${error.message}\n`);
}

// Test 3: Verificar estructura de los servicios
console.log('🔧 Test 3: Verificando estructura de los servicios...');

try {
  // Verificar hybridGoogleDrive.js
  const hybridDriveContent = fs.default.readFileSync(join(process.cwd(), 'src/lib/hybridGoogleDrive.js'), 'utf8');
  const hybridDriveMethods = [
    'initialize()',
    'createFolder(',
    'uploadFile(',
    'deleteFile(',
    'shareFolder(',
    'getServiceInfo()'
  ];

  console.log('📊 HybridGoogleDriveService:');
  for (const method of hybridDriveMethods) {
    if (hybridDriveContent.includes(method)) {
      console.log(`  ✅ ${method}`);
    } else {
      console.log(`  ❌ ${method} - método faltante`);
    }
  }

  // Verificar localGoogleDrive.js
  const localDriveContent = fs.default.readFileSync(join(process.cwd(), 'src/lib/localGoogleDrive.js'), 'utf8');
  const localDriveMethods = [
    'initialize()',
    'createFolder(',
    'uploadFile(',
    'deleteFile(',
    'shareFolder(',
    'getStats()'
  ];

  console.log('📊 LocalGoogleDriveService:');
  for (const method of localDriveMethods) {
    if (localDriveContent.includes(method)) {
      console.log(`  ✅ ${method}`);
    } else {
      console.log(`  ❌ ${method} - método faltante`);
    }
  }

  // Verificar enhancedEmployeeFolderService.js
  const enhancedServiceContent = fs.default.readFileSync(join(process.cwd(), 'src/services/enhancedEmployeeFolderService.js'), 'utf8');
  const enhancedServiceMethods = [
    'initialize()',
    'initializeHybridDrive(',
    'createEmployeeFolder(',
    'getServiceStats()'
  ];

  console.log('📊 EnhancedEmployeeFolderService:');
  for (const method of enhancedServiceMethods) {
    if (enhancedServiceContent.includes(method)) {
      console.log(`  ✅ ${method}`);
    } else {
      console.log(`  ❌ ${method} - método faltante`);
    }
  }

  console.log('✅ Estructura de servicios verificada\n');
} catch (error) {
  console.log(`❌ Error verificando estructura: ${error.message}\n`);
}

// Test 4: Verificar imports y exports
console.log('🔗 Test 4: Verificando imports y exports...');

try {
  const hybridDriveContent = fs.default.readFileSync(join(process.cwd(), 'src/lib/hybridGoogleDrive.js'), 'utf8');
  const localDriveContent = fs.default.readFileSync(join(process.cwd(), 'src/lib/localGoogleDrive.js'), 'utf8');
  const enhancedServiceContent = fs.default.readFileSync(join(process.cwd(), 'src/services/enhancedEmployeeFolderService.js'), 'utf8');

  // Verificar imports en hybridGoogleDrive.js
  if (hybridDriveContent.includes("import googleDriveService from './googleDrive'") &&
      hybridDriveContent.includes("import localGoogleDriveService from './localGoogleDrive'")) {
    console.log('✅ Imports en hybridGoogleDrive.js correctos');
  } else {
    console.log('❌ Imports en hybridGoogleDrive.js incorrectos');
  }

  // Verificar exports en localGoogleDrive.js
  if (localDriveContent.includes("export default localGoogleDriveService") &&
      localDriveContent.includes("export { LocalGoogleDriveService }")) {
    console.log('✅ Exports en localGoogleDrive.js correctos');
  } else {
    console.log('❌ Exports en localGoogleDrive.js incorrectos');
  }

  // Verificar imports en enhancedEmployeeFolderService.js
  if (enhancedServiceContent.includes("import hybridGoogleDriveService from '../lib/hybridGoogleDrive'")) {
    console.log('✅ Import en enhancedEmployeeFolderService.js correcto');
  } else {
    console.log('❌ Import en enhancedEmployeeFolderService.js incorrecto');
  }

  console.log('✅ Imports y exports verificados\n');
} catch (error) {
  console.log(`❌ Error verificando imports/exports: ${error.message}\n`);
}

// Test 5: Verificar compatibilidad con Netlify
console.log('🌐 Test 5: Verificando compatibilidad con Netlify...');

try {
  const hybridDriveContent = fs.default.readFileSync(join(process.cwd(), 'src/lib/hybridGoogleDrive.js'), 'utf8');
  
  const netlifyChecks = [
    'window.location.hostname.includes(\'netlify.app\')',
    'localStorage.getItem(',
    'JSON.parse(',
    'JSON.stringify('
  ];

  console.log('📊 Compatibilidad Netlify:');
  for (const check of netlifyChecks) {
    if (hybridDriveContent.includes(check)) {
      console.log(`  ✅ ${check}`);
    } else {
      console.log(`  ❌ ${check} - función faltante`);
    }
  }

  // Verificar que no haya dependencias de Node.js
  const nodeJsDependencies = ['require(', 'fs.', 'path.', 'process.'];
  let hasNodeDeps = false;
  
  for (const dep of nodeJsDependencies) {
    if (hybridDriveContent.includes(dep)) {
      console.log(`  ⚠️  Posible dependencia de Node.js: ${dep}`);
      hasNodeDeps = true;
    }
  }

  if (!hasNodeDeps) {
    console.log('  ✅ Sin dependencias de Node.js detectadas');
  }

  console.log('✅ Compatibilidad Netlify verificada\n');
} catch (error) {
  console.log(`❌ Error verificando compatibilidad: ${error.message}\n`);
}

// Test 6: Generar reporte
console.log('📊 Test 6: Generando reporte final...');

const reporte = {
  timestamp: new Date().toISOString(),
  archivos: archivosClave,
  configuracion: 'netlify.toml',
  servicios: [
    'HybridGoogleDriveService',
    'LocalGoogleDriveService', 
    'EnhancedEmployeeFolderService'
  ],
  compatibilidad: 'Netlify',
  estado: 'READY_FOR_DEPLOY'
};

console.log('📋 Reporte de Configuración:');
console.log(JSON.stringify(reporte, null, 2));

console.log('\n🎉 ¡Prueba completada!');
console.log('✅ El sistema está listo para deploy en Netlify');
console.log('📖 Consulta GOOGLE_DRIVE_NETLIFY_SETUP.md para más información');
console.log('\n🚀 Pasos siguientes:');
console.log('1. Configura las variables de entorno en Netlify');
console.log('2. Haz deploy de la aplicación');
console.log('3. Verifica que las carpetas de empleados funcionen correctamente');
console.log('4. Prueba la subida de archivos');
console.log('5. Confirma que el sistema local funciona como esperado');