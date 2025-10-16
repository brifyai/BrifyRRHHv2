# 📋 Checklist de Verificación de Producción - BrifyRRHH

## 🔍 Guía Completa para Verificar Configuración de Producción

### 1. 🟢 Supabase Authentication Settings

#### **Site URL**
✅ **Debe ser**: `https://brifyrrhhapp.netlify.app`
❌ **No debe ser**: `http://localhost:3000`

#### **Redirect URLs**
✅ **Deben incluir**:
- `https://brifyrrhhapp.netlify.app/auth/google/callback`
- `https://brifyrrhhapp.netlify.app/**`
- `https://brifyrrhhapp.netlify.app`

#### **Pasos para Verificar**:
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: `tmqglnycivlcjijoymwe`
3. Ve a **Authentication** → **Settings**
4. Verifica **Site URL** y **Redirect URLs**

---

### 2. 🟢 Google Cloud Console OAuth 2.0

#### **Authorized JavaScript origins**
✅ **Deben incluir**:
- `https://brifyrrhhapp.netlify.app`
- `https://brifyrrhhapp-backend.onrender.com`

#### **Authorized redirect URIs**
✅ **Deben incluir**:
- `https://brifyrrhhapp.netlify.app/auth/google/callback`
- `https://brifyrrhhapp-backend.onrender.com/auth/google/callback`

#### **Pasos para Verificar**:
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Ve a **APIs & Services** → **Credentials**
3. Busca tus **OAuth 2.0 Client IDs**
4. Verifica las URLs autorizadas

---

### 3. 🟢 Netlify Environment Variables

#### **Variables Obligatorias**
✅ **Deben estar configuradas**:
```
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
REACT_APP_GOOGLE_REDIRECT_URI=https://brifyrrhhapp.netlify.app/auth/google/callback
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_produccion
REACT_APP_GROQ_API_KEY=tu_groq_api_key_produccion
```

#### **Pasos para Verificar**:
1. Ve a [Netlify Dashboard](https://app.netlify.com)
2. Selecciona tu sitio: `brifyrrhhapp`
3. Ve a **Site settings** → **Environment variables**
4. Verifica todas las variables estén presentes y correctas

---

### 4. 🟢 Render Environment Variables (Backend)

#### **Variables Obligatorias**
✅ **Deben estar configuradas**:
```
NODE_ENV=production
REACT_APP_SUPABASE_URL=https://tmqglnycivlcjijoymwe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcWdsbnljaXZsY2ppam95bXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTQ1NDYsImV4cCI6MjA3NjEzMDU0Nn0.ILwxm7pKdFZtG-Xz8niMSHaTwMvE4S7VlU8yDSgxOpE
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id_produccion
REACT_APP_GOOGLE_CLIENT_SECRET=tu_google_client_secret_produccion
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_produccion
REACT_APP_GROQ_API_KEY=tu_groq_api_key_produccion
```

#### **Pasos para Verificar**:
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio: `brifyrrhhapp-backend`
3. Ve a **Environment**
4. Verifica todas las variables

---

## 🧪 Tests de Verificación Funcional

### **Test 1: Acceso a la Aplicación**
✅ **URL**: `https://brifyrrhhapp.netlify.app`
✅ **Debe cargar**: Página de inicio de BrifyRRHH

### **Test 2: API Backend**
✅ **URL**: `https://brifyrrhhapp-backend.onrender.com/api/test`
✅ **Debe retornar**: `{"success":true,"message":"API funcionando correctamente"}`

### **Test 3: Autenticación Google**
✅ **Pasos**:
1. Ve a `https://brifyrrhhapp.netlify.app`
2. Click en "Iniciar sesión con Google"
3. Debe redirigir a Google OAuth
4. Después del login, debe volver a `https://brifyrrhhapp.netlify.app/auth/google/callback`

### **Test 4: Conexión a Base de Datos**
✅ **Verificar**:
- Los datos de empresas cargan correctamente
- Los datos de empleados son visibles
- Las operaciones CRUD funcionan

---

## 🚨 Problemas Comunes y Soluciones

### **Error: "URL no autorizada"**
❌ **Causa**: URL no configurada en Google Cloud Console
✅ **Solución**: Agregar `https://brifyrrhhapp.netlify.app` a JavaScript origins

### **Error: "Redirect URI mismatch"**
❌ **Causa**: Callback URL no configurada en Google OAuth
✅ **Solución**: Agregar `https://brifyrrhhapp.netlify.app/auth/google/callback` a redirect URIs

### **Error: "Supabase connection failed"**
❌ **Causa**: Variables de entorno incorrectas en Netlify
✅ **Solución**: Verificar `REACT_APP_SUPABASE_URL` y `REACT_APP_SUPABASE_ANON_KEY`

### **Error: "API not responding"**
❌ **Causa**: Backend no desplegado o variables incorrectas en Render
✅ **Solución**: Verificar variables de entorno en Render y que el servicio esté activo

---

## ✅ Checklist Final de Verificación

### **Supabase**
- [ ] Site URL: `https://brifyrrhhapp.netlify.app`
- [ ] Redirect URLs configuradas correctamente
- [ ] Políticas RLS activas y funcionando

### **Google Cloud Console**
- [ ] JavaScript origins: `https://brifyrrhhapp.netlify.app`
- [ ] Redirect URIs: `https://brifyrrhhapp.netlify.app/auth/google/callback`
- [ ] Client ID y Secret correctos

### **Netlify**
- [ ] Todas las variables de entorno configuradas
- [ ] Build automático funcionando
- [ ] Dominio `brifyrrhhapp.netlify.app` activo

### **Render**
- [ ] Backend desplegado y funcionando
- [ ] Variables de entorno configuradas
- [ ] URL `brifyrrhhapp-backend.onrender.com` activa

### **Funcionalidad**
- [ ] Aplicación carga correctamente
- [ ] Autenticación Google funciona
- [ ] Base de datos conectada
- [ ] API respondiendo correctamente

---

## 🎉 Verificación Completa

Si todos los items anteriores están marcados como ✅, tu aplicación BrifyRRHH está completamente configurada y funcionando en producción.

**URLs Finales de Producción**:
- **Frontend**: `https://brifyrrhhapp.netlify.app`
- **Backend**: `https://brifyrrhhapp-backend.onrender.com`
- **Base de Datos**: `https://tmqglnycivlcjijoymwe.supabase.co`