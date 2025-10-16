# 🚀 Guía Completa de Configuración para Producción - BrifyRRHH

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
3. [Despliegue del Backend](#despliegue-del-backend)
4. [Despliegue del Frontend](#despliegue-del-frontend)
5. [Configuración de Google OAuth](#configuración-de-google-oauth)
6. [Configuración de Dominios](#configuración-de-dominios)
7. [Verificación y Testing](#verificación-y-testing)
8. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
9. [Solución de Problemas](#solución-de-problemas)

## 🔧 Requisitos Previos

### Cuentas Necesarias
- [x] Cuenta de Netlify (para frontend)
- [x] Cuenta de Vercel o Render (para backend)
- [x] Cuenta de Supabase (base de datos)
- [x] Cuenta de Google Cloud Console (OAuth)
- [x] Repositorio en GitHub

### Archivos del Proyecto
Asegúrate de tener estos archivos en tu repositorio:
- ✅ `package.json` (dependencias)
- ✅ `server.js` (backend)
- ✅ `src/` (código fuente del frontend)
- ✅ `netlify.toml` (configuración de Netlify)
- ✅ `vercel.json` (opcional, para Vercel)
- ✅ `.env.example` (plantilla de variables)

## ⚙️ Configuración de Variables de Entorno

### 1. Variables para Producción

Crea un archivo `.env.production` localmente con:

```bash
# Base de Datos
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
REACT_APP_GOOGLE_CLIENT_SECRET=tu_google_client_secret_produccion

# APIs Externas
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_produccion
REACT_APP_GROQ_API_KEY=tu_groq_api_key_produccion

# URLs de Producción
REACT_APP_NETLIFY_URL=https://brifyrrhhapp.netlify.app
REACT_APP_BACKEND_URL=https://tu-backend-url.vercel.app

# Mercado Pago (opcional)
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=tu_mercadopago_public_key
REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=tu_mercadopago_access_token
```

### 2. Variables para Netlify (Frontend)

En Netlify Dashboard → Site settings → Environment variables:

```bash
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_produccion
REACT_APP_GROQ_API_KEY=tu_groq_api_key_produccion
REACT_APP_NETLIFY_URL=https://brifyrrhhapp.netlify.app
REACT_APP_BACKEND_URL=https://tu-backend-url.vercel.app
```

### 3. Variables para Vercel/Render (Backend)

En Vercel/Render Dashboard → Environment Variables:

```bash
NODE_ENV=production
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
REACT_APP_GOOGLE_CLIENT_SECRET=tu_google_client_secret_produccion
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_produccion
REACT_APP_GROQ_API_KEY=tu_groq_api_key_produccion
REACT_APP_NETLIFY_URL=https://brifyrrhhapp.netlify.app
REACT_APP_BACKEND_URL=https://tu-backend-url.vercel.app
```

## 🚀 Despliegue del Backend

### Opción A: Vercel (Recomendado)

1. **Conectar Repositorio**
   - Ve a [Vercel](https://vercel.com)
   - Click en "New Project"
   - Conecta tu repositorio de GitHub

2. **Configuración del Proyecto**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: npm install
   Start Command: node server.js
   Node.js Version: 18.x
   ```

3. **Configurar Variables de Entorno**
   - Agrega todas las variables del backend (ver sección 2.3)

4. **Desplegar**
   - Click en "Deploy"
   - Espera el despliegue y anota la URL generada

### Opción B: Render

1. **Crear Web Service**
   - Ve a [Render](https://render.com)
   - Click "New" → "Web Service"
   - Conecta tu repositorio GitHub

2. **Configuración**
   ```
   Name: brifyrrhh-backend
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   Instance Type: Free
   ```

3. **Variables de Entorno**
   - Agrega las mismas variables que en Vercel

## 🌐 Despliegue del Frontend

### 1. Preparar netlify.toml

Asegúrate que tu archivo `netlify.toml` esté configurado:

```toml
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "https://tu-backend-url.vercel.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  REACT_APP_ENV = "production"
```

### 2. Despliegue en Netlify

1. **Conectar Repositorio**
   - Ve a [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Conecta tu repositorio GitHub

2. **Configuración de Build**
   ```
   Build command: npm run build
   Publish directory: build
   ```

3. **Variables de Entorno**
   - Agrega las variables del frontend (ver sección 2.2)

4. **Desplegar**
   - Click en "Deploy site"
   - Tu sitio estará disponible en: `https://brifyrrhhapp.netlify.app`

## 🔐 Configuración de Google OAuth

### 1. Actualizar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Ve a "APIs & Services" → "Credentials"
3. Edita tu "OAuth 2.0 Client ID"
4. Agrega estos "Authorized redirect URIs":
   ```
   https://brifyrrhhapp.netlify.app/auth/google/callback
   https://tu-backend-url.vercel.app/auth/google/callback
   ```
5. Agrega estos "Authorized JavaScript origins":
   ```
   https://brifyrrhhapp.netlify.app
   https://tu-backend-url.vercel.app
   ```

### 2. Verificar Configuración

Asegúrate de que:
- ✅ Client ID: `tu_google_client_id_produccion`
- ✅ Client Secret: `tu_google_client_secret_produccion`
- ✅ Dominios de producción agregados

## 🌍 Configuración de Dominios

### 1. Dominio Netlify (Frontend)

1. En Netlify Dashboard → "Domain management"
2. Agrega tu dominio personalizado (opcional)
3. Configura los DNS según las instrucciones de Netlify

### 2. Actualizar URLs en Variables

Actualiza todas las variables de entorno con las URLs finales:
- Frontend: `https://brifyrrhhapp.netlify.app`
- Backend: `https://tu-backend-url.vercel.app`

## ✅ Verificación y Testing

### 1. Checklist de Verificación

#### Backend
- [ ] Visita: `https://tu-backend-url.vercel.app/api/test`
- [ ] Deberías ver: `{"success":true,"message":"API funcionando correctamente"}`
- [ ] Verifica logs de errores

#### Frontend
- [ ] Visita: `https://brifyrrhhapp.netlify.app`
- [ ] La página carga correctamente
- [ ] No hay errores en la consola del navegador

#### Base de Datos
- [ ] Intenta iniciar sesión con: `camiloalegriabarra@gmail.com` / `Antonito26`
- [ ] Verifica que los datos de empresas carguen
- [ ] Verifica que los 800 empleados aparezcan
- [ ] El contador de carpetas muestra 800

#### Google OAuth
- [ ] Click en "Iniciar sesión con Google"
- [ ] Redirige correctamente a Google
- [ ] Vuelve a la aplicación con sesión iniciada

### 2. Testing Funcional

```bash
# Test de conexión a la API
curl https://tu-backend-url.vercel.app/api/test

# Test de conexión a Supabase
curl -X POST https://tu-backend-url.vercel.app/api/auth/test \
  -H "Content-Type: application/json" \
  -d '{"email":"camiloalegriabarra@gmail.com"}'
```

## 📊 Monitoreo y Mantenimiento

### 1. Netlify

**Logs y Monitoreo:**
- Ve a "Site settings" → "Build & deploy" → "Build logs"
- Configura notificaciones de errores
- Monitorea el rendimiento con "Analytics"

**Actualizaciones:**
- Cada push a main despliega automáticamente
- Para deploy manual: "Deploys" → "Trigger deploy"

### 2. Vercel/Render

**Logs:**
- Revisa "Logs" en el dashboard
- Monitorea errores de runtime
- Configura alertas

**Performance:**
- Monitorea el uso de recursos
- Configura scaling si es necesario

### 3. Supabase

**Monitoreo:**
- Ve al dashboard de Supabase
- Revisa "Logs" → "Database"
- Monitorea "Authentication"

**Backups:**
- Configura backups automáticos
- Verifica el plan de recuperación

## 🚨 Solución de Problemas

### Problemas Comunes

#### 1. "API Connection Failed"
**Causa:** Backend no accesible o URL incorrecta
**Solución:**
```bash
# Verificar que el backend esté online
curl https://tu-backend-url.vercel.app/api/test

# Verificar configuración en netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://tu-backend-url.vercel.app/api/:splat"
  status = 200
```

#### 2. "Supabase Connection Failed"
**Causa:** Credenciales incorrectas o políticas RLS
**Solución:**
```bash
# Verificar variables de entorno
echo $REACT_APP_SUPABASE_URL
echo $REACT_APP_SUPABASE_ANON_KEY

# Verificar políticas RLS en Supabase
# Ve a Supabase Dashboard → Authentication → Policies
```

#### 3. "Google OAuth Error"
**Causa:** Dominios no configurados en Google Cloud
**Solución:**
1. Ve a Google Cloud Console
2. Agrega dominios de producción
3. Verifica Client ID y Secret

#### 4. "Build Failed"
**Causa:** Errores en el código o dependencias
**Solución:**
```bash
# Test local del build
npm run build

# Verificar dependencias
npm install
npm audit fix
```

### Debugging Tools

```bash
# Verificar variables de entorno en producción
# En Netlify: Site settings → Environment variables
# En Vercel: Settings → Environment Variables

# Test de endpoints
curl -I https://tu-backend-url.vercel.app/api/test
curl -I https://brifyrrhhapp.netlify.app

# Verificar CORS
curl -H "Origin: https://brifyrrhhapp.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://tu-backend-url.vercel.app/api/test
```

## 📈 Optimización para Producción

### 1. Performance

```javascript
// Configurar caching en netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "no-cache"
```

### 2. Security

```javascript
// Headers de seguridad en netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 3. SEO y Meta Tags

```javascript
// Asegurar que public/index.html tenga meta tags
<meta name="description" content="BrifyRRHH - Sistema de Gestión de RRHH">
<meta property="og:title" content="BrifyRRHH">
<meta property="og:description" content="Sistema completo de gestión de recursos humanos">
<meta property="og:url" content="https://brifyrrhhapp.netlify.app">
```

## 🎯 URLs Finales de Producción

Una vez completada la configuración:

**Frontend (Netlify):**
- URL: `https://brifyrrhhapp.netlify.app`
- Login: `camiloalegriabarra@gmail.com` / `Antonito26`

**Backend (Vercel/Render):**
- URL: `https://tu-backend-url.vercel.app`
- API Test: `https://tu-backend-url.vercel.app/api/test`

**Base de Datos (Supabase):**
- URL: `https://tmqglnycivlcjijoymwe.supabase.co`
- Dashboard: `https://app.supabase.com/project/tmqglnycivlcjijoymwe`

**Google OAuth:**
- Client ID: `tu_google_client_id_produccion`
- Redirect URI: `https://brifyrrhhapp.netlify.app/auth/google/callback`

## 🔄 Proceso de Actualización

### Para actualizar la aplicación:

1. **Cambios en el código**
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push origin main
   ```

2. **Despliegue automático**
   - Netlify despliega automáticamente el frontend
   - Vercel/Render despliega automáticamente el backend

3. **Verificación**
   - Visita las URLs de producción
   - Verifica que todo funcione correctamente

## 🎉 ¡Listo para Producción!

Tu aplicación BrifyRRHH está ahora completamente configurada para producción con:

- ✅ **Backend** desplegado en Vercel/Render
- ✅ **Frontend** desplegado en Netlify
- ✅ **Base de datos** conectada y funcionando
- ✅ **Autenticación** de Google configurada
- ✅ **800 empleados** cargados y visibles
- ✅ **Contador de carpetas** mostrando 800
- ✅ **Monitoreo** y logging configurado
- ✅ **Seguridad** y optimización aplicados

**La aplicación está lista para uso en producción!** 🚀

---

## 📞 Soporte y Contacto

Si encuentras problemas durante el despliegue:

1. **Revisa los logs** en Netlify y Vercel/Render
2. **Verifica las variables de entorno**
3. **Consulta esta guía** paso a paso
4. **Contacta al equipo de soporte** si el problema persiste

**Importante:** Mantén esta guía actualizada con cualquier cambio en la configuración de producción.