# 🚀 Configuración Rápida de Google Drive - 5 Minutos ⏱️

## 🎯 **Objetivo: Configurar Google Drive en 5 minutos sin complicaciones**

Esta guía simplificada te permite integrar Google Drive con BrifyRRHH v2 de forma rápida y sencilla.

---

## 🔧 **Método 1: Configuración Automática (Recomendado)**

### Paso 1: Crear Proyecto Google Cloud (2 minutos)
1. Ve a [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta Google
3. Haz clic en **"Seleccionar un proyecto"** → **"NUEVO PROYECTO"**
4. Nombre: `BrifyRRHH-Drive` → **"CREAR"**

### Paso 2: Habilitar API (1 minuto)
1. En el menú, busca **"APIs y servicios"** → **"Biblioteca"**
2. Busca: **"Google Drive API"**
3. Haz clic en **"HABILITAR"**

### Paso 3: Configurar Acceso (1 minuto)
1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento OAuth"**
2. Selecciona **"Externo"** → **"CREAR"**
3. **Nombre de la aplicación:** `BrifyRRHH Drive`
4. **Correo electrónico:** tu-email@dominio.com
5. **Dominios autorizados:**
   - `localhost`
   - `127.0.0.1`
6. **Despliega "Usuarios de prueba"** y agrega tu email
7. **Haz clic en "GUARDAR Y CONTINUAR"**

### Paso 4: Crear Credenciales (1 minuto)
1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"**
3. Selecciona **"ID de cliente de OAuth"**
4. **Tipo de aplicación:** **"Aplicación web"**
5. **Nombre:** `BrifyRRHH Client`
6. **URIs de redireccionamiento autorizados:**
   ```
   http://localhost:3000/auth/google/callback
   ```
7. **Haz clic en "CREAR"**

### Paso 5: Obtener Credenciales (30 segundos)
1. **COPIA** el **ID de cliente** que aparece
2. **COPIA** el **Cliente secreto** (haz clic en "MOSTRAR")
3. **Guarda estos datos** - los necesitarás en la aplicación

---

## 🔗 **Método 2: Usar Credenciales Existentes**

Si ya tienes un proyecto Google Cloud con Google Drive API habilitada:

1. **Ve a** [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. **Selecciona tu proyecto existente**
3. **Crea nuevas credenciales OAuth 2.0** (si no tienes)
4. **Copia el ID de cliente y secreto**

---

## ⚙️ **Configuración en BrifyRRHH v2**

### Opción A: Configuración Manual
1. En la aplicación, ve a **Configuración** → **Integraciones** → **Google Drive**
2. Ingresa:
   - **ID de Cliente:** `TU_ID_DE_CLIENTE_AQUI`
   - **Cliente Secreto:** `TU_CLIENTE_SECRETO_AQUI`
3. Haz clic en **"Guardar"**
4. Haz clic en **"Conectar con Google"**
5. Autoriza cuando te redirija a Google

### Opción B: Variables de Entorno
Agrega a tu archivo `.env`:
```env
REACT_APP_GOOGLE_CLIENT_ID=TU_ID_DE_CLIENTE_AQUI
REACT_APP_GOOGLE_CLIENT_SECRET=TU_CLIENTE_SECRETO_AQUI
```

---

## 🧪 **Verificación Rápida**

### ✅ **Checklist de 3 Pasos:**
- [ ] **API habilitada:** Ve a [APIs habilitadas](https://console.cloud.google.com/apis/dashboard) y busca "Google Drive API"
- [ ] **Credenciales creadas:** Ve a [Credenciales](https://console.cloud.google.com/apis/credentials) y verifica tu ID de cliente
- [ ] **Conexión funcionando:** En la app, Google Drive debe mostrar "Conectado"

### 🧪 **Prueba Simple:**
1. En BrifyRRHH v2, ve a **Configuración** → **Integraciones**
2. Busca **Google Drive** - debe mostrar **"Conectado"** ✅
3. Intenta crear una carpeta de empleado
4. Verifica que aparezca en tu Google Drive

---

## 🚨 **Solución de Problemas Rápidos**

### ❌ **"redirect_uri_mismatch"**
**Solución:** Asegúrate de que en Google Cloud Console → Credenciales → tu ID de cliente, el URI sea exactamente:
```
http://localhost:3000/auth/google/callback
```

### ❌ **"access_denied"**
**Solución:** 
1. Verifica que tu email esté en "Usuarios de prueba"
2. Vuelve a publicar la pantalla de consentimiento
3. Intenta autorizar nuevamente

### ❌ **"invalid_client"**
**Solución:** Copia el ID de cliente directamente desde la consola de Google (sin espacios extra)

### ❌ **"API key not valid"**
**Solución:** No necesitas clave de API para OAuth 2.0, solo el ID de cliente y secreto.

---

## 🎯 **Configuración para Producción (Netlify)**

### Actualizar URIs de Redireccionamiento:
1. Ve a [Credenciales de Google](https://console.cloud.google.com/apis/credentials)
2. Edita tu ID de cliente OAuth
3. Agrega: `https://tu-dominio.netlify.app/auth/google/callback`
4. Guarda los cambios

### Variables de Entorno en Netlify:
1. En Netlify, ve a **Site settings** → **Environment variables**
2. Agrega:
   - `REACT_APP_GOOGLE_CLIENT_ID`
   - `REACT_APP_GOOGLE_CLIENT_SECRET`

---

## 📱 **Enlaces Directos (Ahorrar Tiempo)**

- **Google Cloud Console:** https://console.cloud.google.com/
- **APIs y Servicios:** https://console.cloud.google.com/apis/dashboard
- **Credenciales:** https://console.cloud.google.com/apis/credentials
- **Pantalla de Consentimiento:** https://console.cloud.google.com/apis/credentials/consent

---

## ⚡ **Tip Pro: Usar el Mismo Proyecto**

Si ya tienes Google Drive configurado para otra aplicación:
1. **Usa el mismo proyecto** de Google Cloud
2. **Crea nuevas credenciales** OAuth 2.0 para BrifyRRHH
3. **Reutiliza la configuración** existente

---

## 🎉 **¡Listo!**

En 5 minutos tienes:
- ✅ Google Drive API configurada
- ✅ Credenciales OAuth 2.0 creadas
- ✅ BrifyRRHH v2 conectado
- ✅ Carpetas de empleados sincronizadas

---

## 🆘 **¿Necesitas Ayuda?**

- **Revisa esta guía** paso a paso
- **Verifica los 3 pasos** del checklist
- **Usa los enlaces directos** para ahorrar tiempo
- **Contacta soporte** si persisten los problemas

**¡Google Drive está listo para usar con BrifyRRHH v2!** 🚀