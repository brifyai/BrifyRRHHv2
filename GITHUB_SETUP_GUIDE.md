# Guía Completa para Configurar GitHub y Subir el Proyecto

## 🚀 Paso 1: Inicializar Repositorio Git

Abre tu terminal en la carpeta del proyecto (`/Users/camiloalegria/Downloads/BrifyRRHH`) y ejecuta:

```bash
# Inicializar repositorio Git
git init

# Configurar usuario (si no lo has hecho antes)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@example.com"
```

## 📋 Paso 2: Crear .gitignore

Primero, asegúrate de que los archivos sensibles no se suban a GitHub:

```bash
# Crear archivo .gitignore
echo "# Dependencies
node_modules/
/.pnp
.pnp.js

# Production
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
/coverage

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

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

# Mac OS
.DS_Store

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs
*.log" > .gitignore
```

## 📦 Paso 3: Agregar Archivos al Repositorio

```bash
# Agregar todos los archivos
git add .

# Verificar qué archivos se van a subir
git status

# Hacer el primer commit
git commit -m "Ready for Netlify deployment - BrifyRRHH with new database"
```

## 🌐 Paso 4: Crear Repositorio en GitHub

### Opción A: Via Web (Recomendado)

1. Ve a [GitHub](https://github.com)
2. Inicia sesión
3. Click en **"New repository"** (o "+" en la esquina superior derecha)
4. Configura el repositorio:
   - **Repository name**: `BrifyRRHH` (o el nombre que prefieras)
   - **Description**: `BrifyRRHH - Sistema de Recursos Humanos con Supabase`
   - **Visibility**: Private o Public (según prefieras)
   - **NO marques** "Add a README file" (ya tenemos archivos)
   - **NO marques** "Add .gitignore" (ya creamos uno)
5. Click en **"Create repository"**

### Opción B: Via CLI (si tienes GitHub CLI instalado)

```bash
# Crear repositorio en GitHub
gh repo create BrifyRRHH --public --description "BrifyRRHH - Sistema de Recursos Humanos con Supabase"

# O si prefieres privado
gh repo create BrifyRRHH --private --description "BrifyRRHH - Sistema de Recursos Humanos con Supabase"
```

## 🔗 Paso 5: Conectar Local con GitHub

Después de crear el repositorio en GitHub, te dará las instrucciones. Copia la URL y ejecuta:

```bash
# Reemplaza TU_USUARIO con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/BrifyRRHH.git

# Si la rama principal no es main, renombrarla
git branch -M main

# Subir los archivos a GitHub
git push -u origin main
```

## 🔐 Paso 6: Configurar Autenticación (si es necesario)

### Si usas HTTPS:

```bash
# Configurar credenciales (se te pedirá usuario y contraseña)
git push -u origin main
```

### Si usas SSH (recomendado):

```bash
# Generar clave SSH (si no tienes una)
ssh-keygen -t ed25519 -C "tu-email@example.com"

# Iniciar el agente SSH
eval "$(ssh-agent -s)"

# Agregar tu clave SSH
ssh-add ~/.ssh/id_ed25519

# Copiar tu clave pública
cat ~/.ssh/id_ed25519.pub

# Ir a GitHub → Settings → SSH and GPG keys → New SSH key
# Pegar la clave copiada

# Cambiar la URL del remote a SSH
git remote set-url origin git@github.com:TU_USUARIO/BrifyRRHH.git

# Subir archivos
git push -u origin main
```

## ✅ Verificación

Después de subir, verifica:

1. **Ve a tu repositorio en GitHub**
2. **Revisa que todos los archivos estén ahí**
3. **Verifica que no haya archivos sensibles** (como .env)

## 🚀 Paso 7: Listo para Netlify

Una vez que el código esté en GitHub:

1. **Ve a [Netlify](https://app.netlify.com)**
2. **"Add new site" → "Import an existing project"**
3. **Conecta tu cuenta de GitHub**
4. **Selecciona el repositorio `BrifyRRHH`**
5. **Configura las variables de entorno** (usa el archivo `NETLIFY_ENV_VARS.txt`)

## 📝 Resumen de Comandos

```bash
# 1. Inicializar Git
git init
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@example.com"

# 2. Crear .gitignore (ver contenido arriba)
echo "contenido del .gitignore" > .gitignore

# 3. Agregar y commitear
git add .
git commit -m "Ready for Netlify deployment - BrifyRRHH with new database"

# 4. Conectar con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/BrifyRRHH.git
git branch -M main
git push -u origin main
```

## 🎯 Archivos Importantes que se Subirán

- ✅ `src/` - Todo el código fuente
- ✅ `package.json` - Dependencias
- ✅ `netlify.toml` - Configuración de Netlify
- ✅ `server.js` - Backend
- ✅ `scripts/` - Scripts de configuración
- ✅ `database/` - Scripts de base de datos
- ✅ Documentación creada recientemente

## 🚫 Archivos que NO se Subirán (gracias a .gitignore)

- ❌ `node_modules/` - Dependencias
- ❌ `.env` - Variables de entorno
- ❌ `build/` - Build de producción
- ❌ Logs y archivos temporales

## 🎉 ¡Listo!

Una vez que completes estos pasos, tu proyecto estará en GitHub y listo para desplegar en Netlify con la nueva base de datos BrifyRRHH.