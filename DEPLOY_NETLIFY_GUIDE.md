# Guía Completa de Despliegue en Netlify - BrifyRRHH

## 🚀 Preparación para Despliegue

El build se ha completado exitosamente. La carpeta `build/` está lista para desplegar.

## 📋 Paso 1: Preparar Repositorio en GitHub

### 1.1 Subir código a GitHub (si no lo has hecho)
```bash
# Inicializar git si no está hecho
git init
git add .
git commit -m "Ready for Netlify deployment - BrifyRRHH"

# Conectar con GitHub
git branch -M main
git remote add origin https://github.com/TU_USUARIO/webrify.git
git push -u origin main
```

### 1.2 Asegurar que los archivos importantes estén en el repo
- ✅ `build/` folder (generado automáticamente)
- ✅ `netlify.toml` (configuración de Netlify)
- ✅ `package.json` (dependencias)
- ✅ `src/` (código fuente)

## 🔧 Paso 2: Configurar Backend en Vercel/Render

### Opción A: Vercel (Recomendado)
1. Ve a [Vercel](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm install`
   - **Output Directory**: `.` (para el server)
   - **Install Command**: `npm install`
4. En **Environment Variables**, agrega:
   ```
   NODE_ENV=production
   REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE
   REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id
   REACT_APP_GOOGLE_REDIRECT_URI=https://tu-dominio.vercel.app/auth/google/callback
   ```

### Opción B: Render
1. Ve a [Render](https://render.com)
2. Create New → Web Service
3. Conecta tu repositorio GitHub
4. Configura:
   - **Name**: `brifyrrhh-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Agrega las mismas variables de entorno

## 🌐 Paso 3: Desplegar Frontend en Netlify

### 3.1 Crear cuenta en Netlify
1. Ve a [Netlify](https://netlify.com)
2. Regístrate o inicia sesión con GitHub

### 3.2 Conectar Repositorio
1. Click en "Add new site" → "Import an existing project"
2. Conecta tu repositorio de GitHub
3. Selecciona el repositorio `webrify`

### 3.3 Configurar Build Settings
Netlify detectará automáticamente:
- **Build command**: `npm run build`
- **Publish directory**: `build`

### 3.4 Configurar Variables de Entorno
En "Site settings" → "Environment variables", agrega:

```
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id
REACT_APP_GOOGLE_REDIRECT_URI=https://tu-dominio.netlify.app/auth/google/callback
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key
REACT_APP_GROQ_API_KEY=tu_groq_api_key
```

### 3.5 Actualizar netlify.toml
Edita `netlify.toml` y reemplaza la URL del backend:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://tu-backend-url.vercel.app/api/:splat"
  status = 200
  force = true
```

### 3.6 Desplegar
Click en "Deploy site". Netlify construirá y desplegará tu aplicación.

## 🔧 Paso 4: Configurar Dominios (Opcional)

### 4.1 Dominio Personalizado
1. En Netlify, ve a "Site settings" → "Domain management"
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones de Netlify

### 4.2 Configurar Google OAuth
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. En tus credenciales OAuth 2.0, agrega:
   - `https://tu-dominio.netlify.app`
   - `https://tu-backend-url.vercel.app`

## ✅ Paso 5: Verificar Despliegue

### 5.1 Verificar Frontend
1. Visita tu URL de Netlify
2. Intenta iniciar sesión con:
   - Email: `camiloalegriabarra@gmail.com`
   - Password: `Antonito26`

### 5.2 Verificar Backend
1. Visita: `https://tu-backend-url.vercel.app/api/test`
2. Deberías ver: `{"success":true,"message":"API funcionando correctamente"}`

### 5.3 Verificar Conexión a Base de Datos
1. Inicia sesión en la aplicación
2. Verifica que los datos de empresas y empleados carguen correctamente

## 🚨 Paso 6: Solución de Problemas Comunes

### Problema: "Page Not Found"
**Solución**: Verifica que `netlify.toml` esté en la raíz del repositorio

### Problema: "API Connection Failed"
**Solución**: 
1. Verifica que el backend esté desplegado y funcionando
2. Actualiza la URL del backend en `netlify.toml`
3. Verifica las variables de entorno

### Problema: "Supabase Connection Failed"
**Solución**:
1. Verifica las credenciales de Supabase
2. Asegúrate de que las políticas RLS estén configuradas correctamente
3. Revisa la URL del proyecto Supabase

### Problema: "Google OAuth Error"
**Solución**:
1. Verifica que el dominio esté agregado en Google Cloud Console
2. Asegúrate de que el Client ID sea correcto
3. Revisa los redirect URIs

## 🎯 URLs Finales

Una vez completado el despliegue:

**Frontend (Netlify):**
- URL: `https://tu-dominio.netlify.app`
- Login: `camiloalegriabarra@gmail.com` / `Antonito26`

**Backend (Vercel/Render):**
- URL: `https://tu-backend-url.vercel.app`
- API: `https://tu-backend-url.vercel.app/api/test`

**Base de Datos (BrifyRRHH):**
- URL: `https://tmqglnycivlcjijoymwe.supabase.co`
- Usuario administrador: `camiloalegriabarra@gmail.com` / `Antonito26`
- Estado: ✅ Conectada y funcionando

## 📊 Monitoreo

### Netlify
- Revisa los logs de despliegue en Netlify Dashboard
- Configura notificaciones de errores

### Vercel/Render
- Monitorea el rendimiento del backend
- Revisa los logs de errores

### Supabase
- Monitorea el uso de la base de datos
- Revisa los logs de autenticación

## 🔄 Actualizaciones Futuras

Para actualizar la aplicación:
1. Haz cambios en el código
2. Sube a GitHub
3. Netlify y Vercel/Render desplegarán automáticamente

## 🎉 ¡Felicidades!

Tu aplicación BrifyRRHH está ahora en producción con:
- ✅ Frontend desplegado en Netlify
- ✅ Backend desplegado en Vercel/Render
- ✅ Base de datos conectada
- ✅ Usuario administrador funcionando
- ✅ Todos los datos cargados

**La aplicación está lista para uso en producción!**