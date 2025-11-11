# 🔧 Solución: Error 400 redirect_uri_mismatch

## ❌ **Problema Identificado:**

```
Error 400: redirect_uri_mismatch
```

**Causa:** Las URIs de redirección en Google Cloud Console no incluyen la URL de producción de Netlify.

## 🛠️ **Solución Paso a Paso:**

### **Paso 1: Obtener la URL de tu aplicación en Netlify**

1. Ve a [Netlify Dashboard](https://app.netlify.com/)
2. Selecciona tu proyecto BrifyRRHH
3. Ve a la sección **"Settings" > "Domain management"**
4. Copia tu URL de producción, por ejemplo:
   ```
   https://brifyrrh.com.netlify.app
   ```

### **Paso 2: Configurar URIs en Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto (el mismo que usaste para desarrollo)
3. Ve a **"APIs y servicios" > "Credenciales"**
4. Haz clic en el **ID de cliente OAuth 2.0** que creaste
5. En **"URI de redirección autorizados"**, agrega las siguientes URIs:

#### **Para Desarrollo (ya debe estar):**
```
http://localhost:3000/auth/google/callback
```

#### **Para Producción (NUEVO - agregar esto):**
```
https://brifyrrhhv2.netlify.app/auth/google/callback
```

#### **Ejemplo completo:**
Si tu app de Netlify es `https://brifyrrhhv2.netlify.app`, agrega:
```
https://brifyrrhhv2.netlify.app/auth/google/callback
```

### **Paso 3: Verificar la configuración**

1. Guarda los cambios
2. Espera 5-10 minutos para que los cambios surtan efecto
3. Prueba la funcionalidad en producción

## 🔄 **Configuración Automática Implementada:**

El código ya detecta automáticamente el ambiente:

```javascript
// En src/lib/googleDrive.js
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const redirectUri = isDevelopment ? 
  'http://localhost:3000/auth/google/callback' : 
  `${window.location.origin}/auth/google/callback`
```

## 📋 **URIs que necesitas agregar según tu caso:**

### **Si tu app es:**
- `https://brifyrrh.com.netlify.app` → Agregar: `https://brifyrrh.com.netlify.app/auth/google/callback`
- `https://miapp.netlify.app` → Agregar: `https://miapp.netlify.app/auth/google/callback`
- `https://brifyrrhh-dashboard.netlify.app` → Agregar: `https://brifyrrhh-dashboard.netlify.app/auth/google/callback`

## ✅ **Verificación:**

1. ✅ Re-despliega la aplicación en Netlify con los últimos cambios
2. ✅ Ve a la aplicación en producción
3. ✅ Haz clic en "Configurar Google Drive"
4. ✅ Debe abrirse la ventana de Google OAuth sin errores
5. ✅ Al autorizar, debe regresar a tu app de Netlify

## 🆘 **Si sigue sin funcionar:**

1. **Espera 10-15 minutos** (los cambios de Google pueden tardar en aplicarse)
2. **Verifica la URL exacta** en Netlify
3. **Asegúrate de que no haya espacios** en la URI
4. **Revisa la consola del navegador** en Netlify para otros errores

## 📞 **Soporte:**

Si después de seguir estos pasos sigues teniendo problemas:
1. Verifica que la URL de Netlify sea exactamente la misma
2. Asegúrate de que no haya caracteres especiales
3. Revisa que los cambios se hayan guardado en Google Cloud Console