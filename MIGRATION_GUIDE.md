# Guía Completa de Migración a Nueva Base de Datos y Despliegue en Netlify

## 📋 Resumen del Proceso

Esta guía te ayudará a:
1. Crear un nuevo proyecto en Supabase
2. Migrar toda la aplicación a la nueva base de datos
3. Configurar Google Drive API
4. Desplegar en Netlify

---

## 🗄️ Paso 1: Crear Nuevo Proyecto en Supabase

### 1.1 Crear el Proyecto
1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Haz clic en "New Project"
4. Configura el proyecto:
   - **Nombre**: `webrify-production` (o el que prefieras)
   - **Organización**: Selecciona tu organización
   - **Región**: `South America East` (o la más cercana)
   - **Contraseña de base de datos**: Crea una contraseña segura
5. Haz clic en "Create new project"

### 1.2 Obtener Credenciales
Una vez creado el proyecto, ve a:
- **Settings** → **API**
- Copia los siguientes valores:
  - **Project URL** (ej: `https://xxxxxxxxxxxxx.supabase.co`)
  - **Anon Key** (clave pública)
  - **Service Role Key** (clave de servicio - ¡mantener secreta!)

---

## 🔧 Paso 2: Configurar la Base de Datos

### 2.1 Ejecutar Script de Creación de Tablas
1. En tu proyecto Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `database/new-supabase-setup.sql`
3. Haz clic en "Run" para ejecutar el script
4. Espera a que se completen todas las tablas

### 2.2 Generar Datos de Ejemplo
1. En el mismo SQL Editor, copia y pega el contenido de `database/generate-sample-data.sql`
2. Haz clic en "Run" para generar los datos de ejemplo
3. Verifica que se hayan creado los empleados y empresas

---

## 🔑 Paso 3: Configurar Variables de Entorno

### 3.1 Actualizar Archivo .env Local
Reemplaza el contenido de tu archivo `.env` con:

```bash
# ============================================
# NUEVA CONFIGURACIÓN DE SUPABASE
# ============================================
REACT_APP_SUPABASE_URL=https://TU_NUEVO_PROYECTO.supabase.co
REACT_APP_SUPABASE_ANON_KEY=TU_ANON_KEY
SUPABASE_SERVICE_KEY=TU_SERVICE_ROLE_KEY

# ============================================
# CONFIGURACIÓN DE GOOGLE DRIVE API
# ============================================
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_aqui
REACT_APP_GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
REACT_APP_GOOGLE_REDIRECT_URI=https://TU_DOMINIO.netlify.app/auth/google/callback

# ============================================
# OTRAS APIS
# ============================================
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_aqui
REACT_APP_GROQ_API_KEY=tu_groq_api_key_aqui
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=tu_mercadopago_public_key_aqui
REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=tu_mercadopago_access_token_aqui
```

### 3.2 Configurar Google Drive API
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Google Drive API
   - Gmail API
4. Crea credenciales de OAuth 2.0:
   - Ve a **Credentials** → **Create Credentials** → **OAuth client ID**
   - Selecciona **Web application**
   - Agrega dominios autorizados:
     - `http://localhost:3000` (para desarrollo)
     - `https://TU_DOMINIO.netlify.app` (para producción)
5. Copia el Client ID y Client Secret

---

## 🚀 Paso 4: Probar Configuración Local

### 4.1 Actualizar Configuración en la Aplicación
La aplicación ya está configurada para usar las variables de entorno, pero asegúrate de:

1. **Reiniciar los servidores**:
   ```bash
   # Detener todos los procesos
   pkill -f "node server.js"
   pkill -f "react-scripts start"
   
   # Iniciar nuevamente
   npm run server
   PORT=3000 npm start
   ```

2. **Verificar conexión**:
   - Abre http://localhost:3000
   - Intenta iniciar sesión
   - Verifica que los datos se carguen correctamente

### 4.2 Probar Google Drive Integration
1. Ve a la sección de Google Drive en la aplicación
2. Intenta conectar tu cuenta de Google
3. Verifica que se puedan crear carpetas y subir archivos

---

## 🌐 Paso 5: Preparar para Netlify

### 5.1 Configurar Build Settings
Crea un archivo `netlify.toml` en la raíz del proyecto:

```toml
[build]
  base = "/"
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://TU_BACKEND_URL/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 404
```

### 5.2 Actualizar Package.json
Asegúrate de que tu `package.json` tenga el script de build:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "start": "react-scripts start",
    "server": "node server.js",
    "dev": "concurrently \"npm run server\" \"npm start\""
  }
}
```

---

## 🚢 Paso 6: Despliegue en Netlify

### 6.1 Desplegar Frontend
1. Ve a [Netlify](https://netlify.com)
2. Conecta tu repositorio de GitHub
3. Configura los ajustes de build:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
4. En **Environment variables**, agrega:
   ```
   REACT_APP_SUPABASE_URL=https://TU_NUEVO_PROYECTO.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=TU_ANON_KEY
   REACT_APP_GOOGLE_CLIENT_ID=TU_GOOGLE_CLIENT_ID
   REACT_APP_GOOGLE_REDIRECT_URI=https://TU_DOMINIO.netlify.app/auth/google/callback
   REACT_APP_GEMINI_API_KEY=TU_GEMINI_API_KEY
   REACT_APP_GROQ_API_KEY=TU_GROQ_API_KEY
   ```
5. Haz clic en "Deploy site"

### 6.2 Configurar Backend (Opción A: Vercel/Render)
Para el backend, tienes varias opciones:

#### Opción A1: Vercel
1. Crea un archivo `vercel.json`:
```json
{
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
    }
  ]
}
```

#### Opción A2: Render
1. Sube tu código a un repositorio en GitHub
2. Ve a [Render](https://render.com)
3. Crea un nuevo **Web Service**
4. Conecta tu repositorio
5. Configura:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

### 6.3 Configurar Backend (Opción B: Supabase Edge Functions)
1. Crea una carpeta `supabase/functions`
2. Mueve tu lógica de API a functions de Supabase
3. Despliega usando Supabase CLI

---

## 🔧 Paso 7: Configurar Dominios y Redirecciones

### 7.1 Actualizar Google OAuth
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. En tus credenciales OAuth, agrega:
   - `https://TU_DOMINIO.netlify.app/auth/google/callback`

### 7.2 Configurar Supabase Auth
1. En tu proyecto Supabase, ve a **Authentication** → **Settings**
2. En **Site URL**, agrega: `https://TU_DOMINIO.netlify.app`
3. En **Redirect URLs**, agrega:
   - `https://TU_DOMINIO.netlify.app/**`

---

## ✅ Paso 8: Verificación Final

### 8.1 Checklist de Verificación
- [ ] Frontend desplegado en Netlify
- [ ] Backend desplegado y funcionando
- [ ] Base de datos conectada y con datos
- [ ] Google Drive API funcionando
- [ ] Autenticación funcionando
- [ ] Todas las páginas cargan correctamente
- [ ] No hay errores en la consola

### 8.2 Pruebas Funcionales
1. **Registro e inicio de sesión**
2. **Conexión con Google Drive**
3. **Subida de archivos**
4. **Gestión de empleados**
5. **Dashboard y reportes**

---

## 🚨 Solución de Problemas Comunes

### Problema: CORS errors
**Solución**: Configura CORS en tu backend para permitir tu dominio de Netlify

### Problema: Google OAuth redirect error
**Solución**: Asegúrate de que el redirect URI coincida exactamente con el configurado en Google Cloud Console

### Problema: Database connection failed
**Solución**: Verifica que las variables de entorno sean correctas y que la base de datos esté activa

### Problema: Build fails on Netlify
**Solución**: Revisa los logs de build y asegúrate de que todas las dependencias estén instaladas

---

## 📞 Soporte

Si encuentras algún problema durante la migración:
1. Revisa los logs de error detalladamente
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que los dominios estén autorizados en Google OAuth
4. Contacta al equipo de soporte si el problema persiste

---

## 🎉 ¡Felicidades!

Una vez completados todos estos pasos, tu aplicación estará:
- ✅ Migrada a una nueva base de datos limpia
- ✅ Desplegada en Netlify
- ✅ Configurada con Google Drive API
- ✅ Lista para producción

**URLs finales:**
- Frontend: `https://TU_DOMINIO.netlify.app`
- Backend: `https://TU_BACKEND_URL`
- Base de datos: `https://TU_PROYECTO.supabase.co`