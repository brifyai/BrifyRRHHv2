#!/usr/bin/env node

// Script para construir la aplicación para producción
// Este script prepara la aplicación para despliegue en Netlify

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando construcción para producción...');

// 1. Verificar que estemos en el modo correcto
const nodeEnv = process.env.NODE_ENV || 'production';
console.log(`📋 Modo: ${nodeEnv}`);

// 2. Limpiar build anterior
if (fs.existsSync('build')) {
  console.log('🧹 Limpiando build anterior...');
  fs.rmSync('build', { recursive: true, force: true });
}

// 3. Ejecutar build de React
console.log('🔨 Construyendo aplicación React...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completado exitosamente');
} catch (error) {
  console.error('❌ Error en el build:', error.message);
  process.exit(1);
}

// 4. Verificar que se haya creado la carpeta build
if (!fs.existsSync('build')) {
  console.error('❌ No se pudo crear la carpeta build');
  process.exit(1);
}

// 5. Crear archivo de información de producción
const buildInfo = {
  buildTime: new Date().toISOString(),
  version: require('../package.json').version,
  nodeEnv: nodeEnv,
  mode: 'production',
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || 'https://tmqglnycivlcjijoymwe.supabase.co',
  googleRedirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'https://brifyrrhhapp.netlify.app/auth/google/callback'
};

fs.writeFileSync(
  path.join('build', 'build-info.json'),
  JSON.stringify(buildInfo, null, 2)
);

console.log('📄 Archivo build-info.json creado');

// 6. Verificar archivos críticos
const criticalFiles = [
  'build/index.html',
  'build/static/js/main.*.js',
  'build/static/css/main.*.css'
];

let allFilesExist = true;
for (const filePattern of criticalFiles) {
  const files = fs.readdirSync(path.dirname(filePattern))
    .filter(file => file.includes(path.basename(filePattern).split('*')[0]));
  
  if (files.length === 0) {
    console.error(`❌ Archivo crítico no encontrado: ${filePattern}`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('❌ Faltan archivos críticos en el build');
  process.exit(1);
}

// 7. Crear archivo .htaccess para producción (opcional)
const htaccessContent = `# Configuración de producción para Netlify
# Este archivo es manejado principalmente por netlify.toml

# Habilitar compresión
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache para archivos estáticos
<IfModule mod_expires.c>
  ExpiresActive on
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/ico "access plus 1 year"
  ExpiresByType image/icon "access plus 1 year"
  ExpiresByType text/html "access plus 1 hour"
</IfModule>
`;

fs.writeFileSync(
  path.join('build', '.htaccess'),
  htaccessContent
);

console.log('📄 Archivo .htaccess creado');

// 8. Resumen del build
console.log('\n🎉 Build completado exitosamente!');
console.log('\n📊 Resumen:');
console.log(`- Versión: ${buildInfo.version}`);
console.log(`- Modo: ${buildInfo.mode}`);
console.log(`- Fecha: ${buildInfo.buildTime}`);
console.log(`- Supabase URL: ${buildInfo.supabaseUrl}`);
console.log(`- Google Redirect URI: ${buildInfo.googleRedirectUri}`);

console.log('\n📂 Estructura del build:');
const buildFiles = fs.readdirSync('build');
buildFiles.forEach(file => {
  const stats = fs.statSync(path.join('build', file));
  if (stats.isDirectory()) {
    console.log(`  📁 ${file}/`);
  } else {
    console.log(`  📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  }
});

console.log('\n✅ La aplicación está lista para desplegar en Netlify');
console.log('\n🚀 Siguientes pasos:');
console.log('1. Sube los cambios a tu repositorio GitHub');
console.log('2. Conecta el repositorio a Netlify');
console.log('3. Configura las variables de entorno en Netlify');
console.log('4. Despliega la aplicación');