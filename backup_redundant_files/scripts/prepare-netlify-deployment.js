#!/usr/bin/env node

/**
 * Script para preparar el despliegue en Netlify
 * Verifica la configuración y genera los archivos necesarios
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando despliegue en Netlify para BrifyRRHH...\n');

// 1. Verificar que las variables de entorno críticas estén configuradas
console.log('📋 Verificando configuración...');

const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../.env.example');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  Archivo .env no encontrado. Usando .env.example como referencia.');
  
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example tampoco encontrado. Creando archivo de ejemplo...');
    createEnvExample();
  }
}

// 2. Verificar configuración de Supabase
console.log('\n🔍 Verificando configuración de Supabase...');

const supabaseConfig = {
  url: process.env.REACT_APP_SUPABASE_URL || 'https://tmqglnycivlcjijoymwe.supabase.co',
  key: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE'
};

console.log(`✅ URL de Supabase: ${supabaseConfig.url}`);
console.log(`✅ Key configurada: ${supabaseConfig.key ? 'Sí' : 'No'}`);

// 3. Verificar archivos críticos para el despliegue
console.log('\n📁 Verificando archivos críticos...');

const criticalFiles = [
  'package.json',
  'netlify.toml',
  'src/lib/supabase.js',
  'src/lib/databaseAdapter.js',
  'server.js'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} encontrado`);
  } else {
    console.error(`❌ ${file} NO encontrado - CRÍTICO`);
  }
});

// 4. Verificar configuración de netlify.toml
console.log('\n⚙️  Verificando netlify.toml...');

const netlifyConfigPath = path.join(__dirname, '../netlify.toml');
if (fs.existsSync(netlifyConfigPath)) {
  const netlifyConfig = fs.readFileSync(netlifyConfigPath, 'utf8');
  
  if (netlifyConfig.includes('npm run build')) {
    console.log('✅ Comando de build configurado correctamente');
  } else {
    console.log('⚠️  Comando de build no encontrado en netlify.toml');
  }
  
  if (netlifyConfig.includes('/api/*')) {
    console.log('✅ Redirecciones de API configuradas');
  } else {
    console.log('⚠️  Redirecciones de API no encontradas');
  }
} else {
  console.error('❌ netlify.toml no encontrado');
}

// 5. Generar archivo de variables de entorno para Netlify
console.log('\n📝 Generando archivo de variables para Netlify...');

const netlifyEnvVars = `
# Variables de Entorno para Netlify - BrifyRRHH
# Copia y pega estas variables en: Site settings → Environment variables

# Base de Datos Supabase (BrifyRRHH)
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE

# Google OAuth (reemplaza con tus valores reales)
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
REACT_APP_GOOGLE_REDIRECT_URI=https://tu-dominio.netlify.app/auth/google/callback

# APIs Externas (reemplaza con tus valores reales)
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_produccion
REACT_APP_GROQ_API_KEY=tu_groq_api_key_produccion

# Mercado Pago (opcional)
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=tu_mercadopago_public_key_produccion
REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=tu_mercadopago_access_token_produccion
`;

const netlifyEnvPath = path.join(__dirname, '../NETLIFY_ENV_VARS.txt');
fs.writeFileSync(netlifyEnvPath, netlifyEnvVars);
console.log(`✅ Archivo de variables creado: ${netlifyEnvPath}`);

// 6. Crear checklist de despliegue
console.log('\n📋 Creando checklist de despliegue...');

const deploymentChecklist = `
# Checklist de Despliegue en Netlify - BrifyRRHH

## ✅ Pre-Despliegue

- [ ] Código subido a GitHub
- [ ] Tests pasando localmente
- [ ] Base de datos BrifyRRHH conectada
- [ ] Variables de entorno configuradas en .env

## 🚀 Despliegue Frontend (Netlify)

1. [ ] Conectar repositorio GitHub a Netlify
2. [ ] Configurar variables de entorno (ver NETLIFY_ENV_VARS.txt)
3. [ ] Verificar configuración de build
4. [ ] Desplegar sitio

## 🔧 Despliegue Backend (Vercel/Render)

1. [ ] Conectar repositorio GitHub
2. [ ] Configurar variables de entorno para backend
3. [ ] Configurar comando de inicio: \`node server.js\`
4. [ ] Desplegar backend
5. [ ] Actualizar URL en netlify.toml

## 🧪 Post-Despliegue

- [ ] Verificar conexión a base de datos
- [ ] Probar inicio de sesión
- [ ] Verificar carga de datos
- [ ] Probar funcionalidades principales
- [ ] Configurar dominio personalizado (opcional)

## 🔗 URLs Finales

- Frontend: https://tu-dominio.netlify.app
- Backend: https://tu-backend-url.vercel.app
- Base de datos: https://tmqglnycivlcjijoymwe.supabase.co

## 👤 Usuario de Prueba

- Email: camiloalegriabarra@gmail.com
- Password: Antonito26
`;

const checklistPath = path.join(__dirname, '../DEPLOYMENT_CHECKLIST.md');
fs.writeFileSync(checklistPath, deploymentChecklist);
console.log(`✅ Checklist creado: ${checklistPath}`);

// 7. Resumen final
console.log('\n🎉 ¡Preparación completada!');
console.log('\n📁 Archivos generados:');
console.log(`   - NETLIFY_ENV_VARS.txt (variables de entorno)`);
console.log(`   - DEPLOYMENT_CHECKLIST.md (checklist de despliegue)`);
console.log('\n📋 Próximos pasos:');
console.log('   1. Sube tu código a GitHub');
console.log('   2. Configura las variables de entorno en Netlify');
console.log('   3. Despliega el frontend en Netlify');
console.log('   4. Despliega el backend en Vercel/Render');
console.log('   5. Sigue el checklist de verificación');

function createEnvExample() {
  const envExample = `# Supabase Configuration (Main Database)
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE

# Google Drive API Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_CLIENT_SECRET=your_google_client_secret
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Gemini API Configuration (for embeddings)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key

# Groq API Configuration
REACT_APP_GROQ_API_KEY=your_groq_api_key

# Mercado Pago Configuration
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=your_mercadopago_public_key
REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=your_mercadopago_access_token
`;
  
  fs.writeFileSync(envExamplePath, envExample);
  console.log(`✅ .env.example creado en ${envExamplePath}`);
}