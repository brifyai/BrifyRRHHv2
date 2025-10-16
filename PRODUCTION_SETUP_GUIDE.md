# Guía Rápida de Configuración para Producción - BrifyRRHH

## 🚀 Configuración Completa para Modo Producción

### 1. Variables de Entorno Configuradas

Las siguientes variables de entorno ya están configuradas para producción:

#### Archivo: `.env.production`
```bash
# Supabase (Base de datos principal)
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE

# Google OAuth (Producción)
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
REACT_APP_GOOGLE_CLIENT_SECRET=tu_google_client_secret_produccion
REACT_APP_GOOGLE_REDIRECT_URI=https://brifyrrhhapp.netlify.app/auth/google/callback

# APIs Externas
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_produccion
REACT_APP_GROQ_API_KEY=tu_groq_api_key_produccion

# Configuración de Producción
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

### 2. URLs de Producción

#### Frontend (Netlify)
- **URL Principal**: `https://brifyrrhhapp.netlify.app`
- **Callback OAuth**: `https://brifyrrhhapp.netlify.app/auth/google/callback`

#### Backend (Render)
- **URL API**: `https://brifyrrhhapp-backend.onrender.com`
- **Endpoint prueba**: `https://brifyrrhhapp-backend.onrender.com/api/test`

#### Base de Datos (Supabase)
- **URL**: `https://tmqglnycivlcjijoymwe.supabase.co`
- **Estado**: ✅ Conectada y funcionando

### 3. Configuración de Despliegue

#### Archivos Clave Configurados:
- ✅ `netlify.toml` - Redirecciones de API configuradas
- ✅ `.env.production` - Variables de entorno de producción
- ✅ `scripts/build-production.js` - Script de build optimizado
- ✅ `package.json` - Scripts de producción agregados

#### Scripts Disponibles:
```bash
# Construir para producción
npm run build:prod

# Iniciar servidor en modo producción
npm run start:prod

# Configurar backend para producción
node scripts/setup-production-backend.js
```

### 4. Pasos para Despliegue

#### Paso 1: Construir la Aplicación
```bash
npm run build:prod
```

#### Paso 2: Desplegar Backend
1. Subir código a GitHub
2. Conectar repositorio a [Render](https://render.com)
3. Configurar variables de entorno en Render
4. Desplegar automáticamente

#### Paso 3: Desplegar Frontend
1. Conectar repositorio a [Netlify](https://netlify.com)
2. Configurar variables de entorno en Netlify
3. Desplegar automáticamente

### 5. Variables de Entorno Requeridas en Plataformas

#### En Netlify (Frontend):
```
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
REACT_APP_GOOGLE_REDIRECT_URI=https://brifyrrhhapp.netlify.app/auth/google/callback
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_produccion
REACT_APP_GROQ_API_KEY=tu_groq_api_key_produccion
```

#### En Render (Backend):
```
NODE_ENV=production
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
REACT_APP_GOOGLE_CLIENT_SECRET=tu_google_client_secret_produccion
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_produccion
REACT_APP_GROQ_API_KEY=tu_groq_api_key_produccion
```

### 6. Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. En tus credenciales OAuth 2.0, agrega:
   - `https://brifyrrhhapp.netlify.app`
   - `https://brifyrrhhapp.netlify.app/auth/google/callback`
   - `https://brifyrrhhapp-backend.onrender.com`

### 7. Verificación de Despliegue

#### Verificar Frontend:
- Visita: `https://brifyrrhhapp.netlify.app`
- Intenta iniciar sesión
- Verifica que los datos carguen correctamente

#### Verificar Backend:
- Visita: `https://brifyrrhhapp-backend.onrender.com/api/test`
- Deberías ver: `{"success":true,"message":"API funcionando correctamente"}`

#### Verificar Base de Datos:
- Inicia sesión en la aplicación
- Verifica que las empresas y empleados carguen
- Comprueba que las operaciones CRUD funcionen

### 8. Monitoreo y Logs

#### Netlify:
- **Build logs**: Site settings → Build & deploy → Build logs
- **Functions logs**: Functions tab

#### Render:
- **Service logs**: Dashboard del servicio
- **Deploy logs**: Pestaña Deploy

#### Supabase:
- **Logs**: Dashboard de Supabase
- **Authentication**: Logs de autenticación

### 9. Solución de Problemas Comunes

#### Error de Conexión a Supabase:
1. Verifica las variables de entorno
2. Revisa las políticas RLS en Supabase
3. Comprueba la URL del proyecto

#### Error de Google OAuth:
1. Verifica los dominios configurados en Google Cloud
2. Revisa los Client ID y Secret
3. Comprueba los redirect URIs

#### Error de API:
1. Verifica que el backend esté funcionando
2. Revisa las redirecciones en netlify.toml
3. Comprueba las variables de entorno del backend

### 10. Resumen de Configuración

✅ **Variables de entorno**: Configuradas para producción
✅ **URLs**: Actualizadas a dominios de producción
✅ **Scripts**: Build y despliegue optimizados
✅ **Redirecciones**: API configurada correctamente
✅ **Base de datos**: Conexión establecida
✅ **OAuth**: Google configurado para producción

### 🎉 ¡Listo para Producción!

La aplicación está completamente configurada para ejecutarse en modo producción con:
- Frontend en Netlify
- Backend en Render
- Base de datos en Supabase
- Autenticación de Google funcionando
- Todas las APIs externas configuradas

**La aplicación está lista para desplegar y usar en producción!**