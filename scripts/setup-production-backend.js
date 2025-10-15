#!/usr/bin/env node

// Script para configurar el backend para producción
// Este script ayuda a preparar el servidor para despliegue en Render/Vercel

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando backend para producción...');

// 1. Crear archivo vercel.json para despliegue en Vercel
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
};

fs.writeFileSync(
  path.join(__dirname, '../vercel.json'),
  JSON.stringify(vercelConfig, null, 2)
);

console.log('✅ vercel.json creado');

// 2. Crear archivo render.yaml para despliegue en Render
const renderConfig = `services:
  - type: web
    name: webrify-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/test
`;

fs.writeFileSync(
  path.join(__dirname, '../render.yaml'),
  renderConfig
);

console.log('✅ render.yaml creado');

// 3. Actualizar package.json para producción
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Asegurar que tenga los scripts necesarios
packageJson.scripts = {
  ...packageJson.scripts,
  "start:prod": "NODE_ENV=production node server.js",
  "build": "react-scripts build"
};

// Agregar engines para especificar versión de Node
packageJson.engines = {
  "node": ">=18.0.0",
  "npm": ">=8.0.0"
};

fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJson, null, 2)
);

console.log('✅ package.json actualizado');

// 4. Crear .gitignore para producción
const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test
`;

fs.writeFileSync(
  path.join(__dirname, '../.gitignore'),
  gitignoreContent
);

console.log('✅ .gitignore actualizado');

// 5. Crear README para despliegue
const deployReadme = `# Despliegue del Backend Webrify

## Opciones de Despliegue

### 1. Vercel (Recomendado)
1. Instala Vercel CLI: \`npm i -g vercel\`
2. Ejecuta: \`vercel --prod\`
3. Configura las variables de entorno en el dashboard de Vercel

### 2. Render
1. Crea una cuenta en [Render](https://render.com)
2. Conecta tu repositorio de GitHub
3. Render detectará automáticamente el archivo \`render.yaml\`
4. Configura las variables de entorno en el dashboard de Render

### 3. Railway
1. Instala Railway CLI: \`npm install -g @railway/cli\`
2. Ejecuta: \`railway login\`
3. Ejecuta: \`railway init\`
4. Ejecuta: \`railway up\`

## Variables de Entorno Requeridas

\`\`\`bash
NODE_ENV=production
REACT_APP_SUPABASE_URL=tu_supabase_url
REACT_APP_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_KEY=tu_supabase_service_key
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id
REACT_APP_GOOGLE_CLIENT_SECRET=tu_google_client_secret
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key
REACT_APP_GROQ_API_KEY=tu_groq_api_key
\`\`\`

## Verificación

Una vez desplegado, verifica que el backend esté funcionando:
- GET /api/test - Debe retornar un JSON con éxito
- GET / - Debe mostrar la página de información del servidor

## URLs de Producción

- Frontend (Netlify): https://webrify.netlify.app
- Backend (Vercel): https://webrify-backend.vercel.app
- Backend (Render): https://webrify-backend.onrender.com
`;

fs.writeFileSync(
  path.join(__dirname, '../DEPLOY_BACKEND.md'),
  deployReadme
);

console.log('✅ DEPLOY_BACKEND.md creado');

console.log('\n🎉 Configuración completada!');
console.log('\n📋 Siguientes pasos:');
console.log('1. Sube los cambios a tu repositorio GitHub');
console.log('2. Elige tu plataforma de despliegue (Vercel recomendado)');
console.log('3. Configura las variables de entorno en la plataforma elegida');
console.log('4. Actualiza la URL del backend en netlify.toml');
console.log('\n📚 Consulta DEPLOY_BACKEND.md para más detalles');