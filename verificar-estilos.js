// Script para verificar que los estilos personalizados se cargan correctamente
const fs = require('fs');
const path = require('path');

// Verificar que el archivo CSS existe y contiene las clases personalizadas
const cssPath = path.join(__dirname, 'src', 'index.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

console.log('Verificando archivo CSS...');
console.log('Ruta del archivo:', cssPath);

// Verificar que las clases personalizadas existen
const requiredClasses = [
  '.logo-container',
  '.logo-image',
  '.btn-primary',
  '.btn-secondary',
  '.alert-warning',
  '.text-engage-black',
  '.bg-engage-black',
  '.text-engage-yellow',
  '.bg-engage-yellow',
  '.text-engage-blue',
  '.bg-engage-blue'
];

console.log('\nVerificando clases personalizadas:');
requiredClasses.forEach(className => {
  if (cssContent.includes(className)) {
    console.log(`✓ ${className} - Encontrada`);
  } else {
    console.log(`✗ ${className} - No encontrada`);
  }
});

// Verificar que los colores personalizados existen
const requiredColors = [
  '--engage-black: #000000',
  '--engage-yellow: #fcb900',
  '--engage-blue: #0693e3'
];

console.log('\nVerificando colores personalizados:');
requiredColors.forEach(color => {
  if (cssContent.includes(color)) {
    console.log(`✓ ${color} - Encontrado`);
  } else {
    console.log(`✗ ${color} - No encontrado`);
  }
});

// Verificar que el logo existe
const logoPath = path.join(__dirname, 'public', 'images', 'Mesa-de-trabajo-105-1.png');
if (fs.existsSync(logoPath)) {
  console.log('\n✓ Logo encontrado:', logoPath);
  const stats = fs.statSync(logoPath);
  console.log(`  Tamaño: ${stats.size} bytes`);
} else {
  console.log('\n✗ Logo no encontrado:', logoPath);
}

console.log('\nVerificación completada.');