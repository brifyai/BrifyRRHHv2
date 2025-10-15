# Configuración de Producción para Netlify - BrifyRRHH

## 📋 Variables de Entorno para Netlify

Estas son las variables de entorno que debes configurar en Netlify para el despliegue en producción:

### 🔐 Variables Principales (Obligatorias)

```
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE
```

### 🔗 Google OAuth

```
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
REACT_APP_GOOGLE_REDIRECT_URI=https://tu-dominio.netlify.app/auth/google/callback
```

### 🤖 APIs Externas

```
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_produccion
REACT_APP_GROQ_API_KEY=tu_groq_api_key_produccion
```

### 💳 Mercado Pago (Opcional)

```
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=tu_mercadopago_public_key_produccion
REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=tu_mercadopago_access_token_produccion
```

## 🚀 Configuración Paso a Paso

### 1. Acceder a Configuración de Netlify

1. Ve a [Netlify](https://app.netlify.com)
2. Selecciona tu sitio
3. Ve a **Site settings** → **Environment variables**

### 2. Agregar Variables de Entorno

Para cada variable:
1. Click en **Edit variables**
2. Click en **Add new variable**
3. Ingresa el **Key** y el **Value**
4. Click en **Save**

### 3. Variables Importantes para la Base de Datos

Asegúrate de que estas variables sean exactamente como se muestran:

**Key:** `REACT_APP_SUPABASE_URL`
**Value:** `https://tmqglnycivlcjijoymwe.supabase.co`

**Key:** `REACT_APP_SUPABASE_ANON_KEY`
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE`

## 🔧 Configuración del Backend

El backend debe estar desplegado en Vercel o Render con las mismas variables de entorno:

### Variables para Backend (Vercel/Render)

```
NODE_ENV=production
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
REACT_APP_GOOGLE_CLIENT_SECRET=tu_google_client_secret_produccion
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_produccion
REACT_APP_GROQ_API_KEY=tu_groq_api_key_produccion
```

## 🌐 Actualizar netlify.toml

Asegúrate de que `netlify.toml` apunte a tu backend:

```toml
# Redirecciones para API (backend separado)
[[redirects]]
  from = "/api/*"
  to = "https://tu-backend-url.vercel.app/api/:splat"
  status = 200
  force = true
```

## ✅ Verificación

Después de configurar las variables:

1. **Despliega tu sitio** en Netlify
2. **Verifica la conexión** a la base de datos:
   - Visita tu sitio
   - Intenta iniciar sesión
   - Verifica que los datos carguen correctamente

3. **Verifica el backend**:
   - Visita: `https://tu-backend-url.vercel.app/api/test`
   - Deberías ver: `{"success":true,"message":"API funcionando correctamente"}`

## 🚨 Solución de Problemas

### Error: "Supabase connection failed"

1. **Verifica las variables de entorno**:
   - Asegúrate de que `REACT_APP_SUPABASE_URL` sea correcta
   - Verifica que `REACT_APP_SUPABASE_ANON_KEY` sea válida

2. **Verifica las políticas RLS** en Supabase:
   - Asegúrate de que las políticas permitan el acceso anónimo

### Error: "Google OAuth not working"

1. **Verifica el dominio** en Google Cloud Console:
   - Agrega `https://tu-dominio.netlify.app`
   - Agrega `https://tu-dominio.netlify.app/auth/google/callback`

2. **Verifica las variables de entorno**:
   - `REACT_APP_GOOGLE_CLIENT_ID`
   - `REACT_APP_GOOGLE_REDIRECT_URI`

## 📊 Monitoreo

### Logs en Netlify
- Ve a **Site settings** → **Build & deploy** → **Build logs**
- Revisa los errores de despliegue

### Logs en Supabase
- Ve al dashboard de Supabase
- Revisa los logs de autenticación y base de datos

## 🎉 ¡Listo para Producción!

Una vez configuradas todas las variables de entorno, tu aplicación BrifyRRHH estará completamente funcional en producción con:
- ✅ Base de datos BrifyRRHH conectada
- ✅ Autenticación de Google funcionando
- ✅ APIs externas configuradas
- ✅ Sistema completo operativo