# 🔑 URLs de Redirección OAuth 2.0 - Google Cloud Console

## 🎯 **URIs que DEBEN estar autorizadas en Google Cloud Console**

Para que la conexión de Google Drive funcione correctamente, necesitas registrar estas URLs en Google Cloud Console:

### **URLs de Desarrollo (FUNCIONALES)**
```
http://localhost:3000/auth/google/callback
http://127.0.0.1:3000/auth/google/callback
```

### **URLs de Producción (DISPONIBLES)**
```
https://brifyrrhhv2.netlify.app/auth/google/callback
```

### **URLs NO Disponibles**
```
https://brifyrrhhv2.netlify.app/auth/google/callback
```

## 📋 **Pasos para actualizar Google Cloud Console:**

### 1. **Acceder a Google Cloud Console**
- Ve a: https://console.cloud.google.com/
- Selecciona tu proyecto: "BrifyRRHH"
- Ve a **APIs y servicios** > **Credenciales**

### 2. **Editar el Cliente OAuth 2.0**
- Busca: "BrifyRRHH Web Client" o "Client ID: 341525707325-qkftt6ektjnqfko7iunqr7t03iepbr3q"
- Haz clic en él para editar

### 3. **Agregar URIs de Redirección Autorizados**
En la sección **"URI de redirección autorizados"**, agrega estas URLs:

```
http://localhost:3000/auth/google/callback
http://127.0.0.1:3000/auth/google/callback
https://brifyrrhhv2.netlify.app/auth/google/callback
https://brifyrrhhv2.netlify.app/auth/google/callback
```

### 4. **Guardar cambios**
- Haz clic en **"Guardar"**
- Espera 5-10 minutos para que los cambios se propaguen

## ✅ **Verificación**

Después de configurar las URIs, puedes verificar que la conexión funciona:

1. **En desarrollo**: Conecta desde `http://localhost:3000`
2. **En producción**: Conecta desde `https://staffhubapp.netlify.app`

## 🚨 **Errores comunes:**

### Error: "redirect_uri_mismatch"
- **Causa**: La URL de redirección no está registrada en Google Cloud Console
- **Solución**: Agrega la URL exacta a la lista de URIs autorizados

### Error: "access_denied"
- **Causa**: La URL de redirección no coincide exactamente
- **Solución**: Verifica que las URLs sean idénticas (sin espacios extra)

### Error: "invalid_client"
- **Causa**: Client ID o Client Secret incorrecto
- **Solución**: Verifica las credenciales en el archivo `.env`

## 📱 **Para dispositivos móviles (si aplica):**

Si planeas usar la app en móviles, también agrega:

```
urn:ietf:wg:oauth:2.0:oob
```

---

**💡 Tip**: Guarda este documento para referencia futura. Cada vez que cambies de dominio o deploys en un nuevo entorno, necesitarás agregar la nueva URL a la lista de URIs autorizados.