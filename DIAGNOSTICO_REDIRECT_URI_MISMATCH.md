# 🚨 Diagnóstico: Error 400 redirect_uri_mismatch en Google OAuth

## 📋 Descripción del Error

**Mensaje del error**: "Error 400: redirect_uri_mismatch"  
**Usuario afectado**: camiloalegriabarra@gmail.com  
**Contexto**: Autenticación de Google para BrifyRRHH

## 🔍 Análisis del Problema

### **Causa Raíz**
El error `redirect_uri_mismatch` ocurre cuando:
1. **El URI de redireccionamiento** configurado en Google Cloud Console
2. **NO coincide** con el URI que está enviando Supabase a Google

### **Flujo Actual del Problema**
1. Usuario intenta autenticarse con Google
2. Supabase envía una solicitud a Google con un `redirect_uri`
3. Google verifica que ese URI esté configurado en Google Cloud Console
4. **❌ El URI no coincide** → Google devuelve error 400
5. Usuario ve "Acceso bloqueado: La solicitud de BrifyRRHH no es válida"

## 🛠️ Solución Requerida

### **Paso 1: Identificar el Redirect URI Correcto**

Basado en el código analizado, el redirect URI debería ser:
```
http://localhost:3000/auth/google/callback
```

### **Paso 2: Configurar en Google Cloud Console**

El administrador debe agregar este URI en:
1. **Google Cloud Console** → APIs & Services → Credentials
2. Seleccionar el **OAuth 2.0 Client ID** de BrifyRRHH
3. En **Authorized redirect URIs** agregar:
   ```
   http://localhost:3000/auth/google/callback
   ```

### **Paso 3: Configuración para Producción**

Para producción, también se necesita:
```
https://tu-dominio.com/auth/google/callback
```

## 📊 Configuración Actual Detectada

### **Desde el código fuente:**
- **Callback Route**: `/auth/google/callback` (en App.js línea 183)
- **Supabase Project**: `tmqglnycivlcjijoymwe.supabase.co`
- **Auth Flow**: PKCE (configurado en supabaseClient.js)

### **Configuración de Supabase:**
```javascript
// En supabaseClient.js
auth: {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
  flow: 'pkce', // ✅ Flow correcto
}
```

## 🔧 Acciones Inmediatas

### **Para el Administrador:**

1. **Acceder a Google Cloud Console**
   - Ir a: https://console.cloud.google.com/
   - Proyecto: BrifyRRHH (o el proyecto correspondiente)

2. **Navegar a Credenciales**
   - APIs & Services → Credentials
   - Buscar el OAuth 2.0 Client ID de BrifyRRHH

3. **Actualizar Authorized Redirect URIs**
   - Hacer clic en el OAuth Client ID
   - En "Authorized redirect URIs" agregar:
     ```
     http://localhost:3000/auth/google/callback
     ```

4. **Guardar y esperar 5-10 minutos**
   - Los cambios de Google pueden tardar en propagarse

### **Para el Usuario:**

1. **Limpiar caché del navegador**
   - Ctrl+Shift+Delete (Chrome/Edge)
   - Limpiar cookies y caché del sitio

2. **Intentar nuevamente en 5-10 minutos**
   - Después de que el administrador actualice la configuración

## 🧪 Verificación de la Solución

### **Método 1: Verificación en Google Cloud Console**

1. Ir a Google Cloud Console
2. APIs & Services → Credentials
3. Verificar que el URI esté en la lista:
   ```
   ✅ http://localhost:3000/auth/google/callback
   ```

### **Método 2: Verificación Técnica**

1. Abrir DevTools (F12)
2. Ir a Network tab
3. Intentar autenticarse
4. Buscar la solicitud a Google OAuth
5. Verificar el parámetro `redirect_uri` en la URL

## 📋 Checklist de Solución

- [ ] **Admin configura Google Cloud Console**
- [ ] **URI agregado**: `http://localhost:3000/auth/google/callback`
- [ ] **Esperar propagación** (5-10 minutos)
- [ ] **Usuario limpia caché**
- [ ] **Usuario intenta nuevamente**
- [ ] **Verificar que funcione la autenticación**

## 🚨 Si el Problema Persiste

### **Posibles Causas Adicionales:**

1. **Múltiples OAuth Client IDs**
   - Verificar que se esté usando el Client ID correcto

2. **Configuración de Supabase**
   - Revisar que el proyecto de Supabase esté configurado correctamente

3. **Environment Variables**
   - Verificar `REACT_APP_GOOGLE_CLIENT_ID` si existe

4. **HTTPS en Producción**
   - Para producción, el URI debe ser HTTPS

### **Pasos Adicionales:**

1. **Verificar configuración de Supabase Dashboard**
   - Authentication → Providers → Google
   - Confirmar que esté habilitado y configurado

2. **Revisar logs de Supabase**
   - En Supabase Dashboard → Logs
   - Buscar errores relacionados con Google OAuth

## 📞 Contacto de Soporte

Si después de seguir estos pasos el problema persiste:

1. **Capturar screenshots** de:
   - Configuración de Google Cloud Console
   - Error exacto que aparece
   - Network tab de DevTools

2. **Información a proporcionar**:
   - Email del usuario: camiloalegriabarra@gmail.com
   - URL exacta donde ocurre el error
   - Hora y fecha del intento

## 🎯 Solución Esperada

Una vez configurado correctamente el redirect URI:
- ✅ Usuario podrá autenticarse con Google
- ✅ Redirección funcionará correctamente
- ✅ No más error 400 redirect_uri_mismatch
- ✅ Flujo de autenticación completo funcionando

## 📚 Documentación Adicional

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console Help](https://cloud.google.com/docs/authentication/getting-started)