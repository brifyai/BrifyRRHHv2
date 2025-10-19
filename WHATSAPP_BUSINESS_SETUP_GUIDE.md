# 🚀 Guía Completa de Configuración de WhatsApp Business

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración en Meta Developers](#configuración-en-meta-developers)
3. [Uso del Asistente de Configuración](#uso-del-asistente-de-configuración)
4. [Gestión de Múltiples Números](#gestión-de-múltiples-números)
5. [Configuración de Webhooks](#configuración-de-webhooks)
6. [Envío de Mensajes](#envío-de-mensajes)
7. [Respuestas Automáticas](#respuestas-automáticas)
8. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Una cuenta de Facebook Business verificada
- ✅ Un número de teléfono con WhatsApp Business
- ✅ Acceso a la cuenta de WhatsApp Business
- ✅ Permisos de administrador en StaffHub

---

## 🛠️ Configuración en Meta Developers

### Paso 1: Crear Cuenta en Meta Developers

1. Visita [developers.facebook.com](https://developers.facebook.com)
2. Inicia sesión con tu cuenta de Facebook
3. Haz clic en "Mis Aplicaciones" → "Crear Aplicación"
4. Selecciona "Negocio" como tipo de aplicación

### Paso 2: Configurar WhatsApp

1. En el panel de tu aplicación, busca "WhatsApp" en el menú izquierdo
2. Haz clic en "Configurar"
3. Selecciona o crea una cuenta de WhatsApp Business
4. Verifica tu número de teléfono

### Paso 3: Obtener Credenciales

1. Ve a WhatsApp → Configuración → API de WhatsApp
2. Genera un **Token de Acceso Permanente** (empieza con `EAAZA...`)
3. Copia tu **Phone Number ID** (número largo)
4. Configura un **Webhook Verify Token** (opcional pero recomendado)

---

## 🎨 Uso del Asistente de Configuración

### Acceder al Asistente

1. Inicia sesión en StaffHub
2. Haz clic en **"Configurar WhatsApp"** en el menú de navegación
3. Sigue el asistente paso a paso

### Paso 1: Seleccionar Empresa

- Elige la empresa que estará asociada a este número de WhatsApp
- Si no ves tu empresa, contacta al administrador

### Paso 2: Configurar Meta Developers

- Sigue las instrucciones visuales para configurar tu aplicación en Meta
- Obtén tus credenciales como se explica arriba

### Paso 3: Ingresar Credenciales

- **Access Token**: Pega el token permanente (EAAZA...)
- **Phone Number ID**: Ingresa el ID numérico de tu número
- **Webhook Verify Token**: Genera uno automáticamente o crea el tuyo

### Paso 4: Probar Conexión

- Haz clic en "Probar Conexión"
- El sistema verificará tus credenciales
- Se enviará un mensaje de prueba automáticamente

### Paso 5: Finalizar

- Revisa el resumen de configuración
- Haz clic en "Finalizar Configuración"
- ¡Tu WhatsApp Business estará listo para usar!

---

## 📱 Gestión de Múltiples Números

### Acceder al Gestor Multi-WhatsApp

1. Ve a **"WhatsApp Multi"** en el menú de navegación
2. Verás todos tus números configurados

### Agregar Nuevo Número

1. Haz clic en **"Agregar WhatsApp"**
2. Completa el formulario con las nuevas credenciales
3. Asigna a una empresa específica
4. Configura opciones adicionales (respuestas automáticas, límites, etc.)

### Gestión por Empresa

Cada número puede estar asociado a una empresa diferente:
- **Empresa A**: +56912345678
- **Empresa B**: +56987654321
- **Empresa C**: +56911223344

### Estadísticas y Logs

- **Dashboard**: Ve estadísticas de uso por número
- **Logs**: Revisa el historial de mensajes enviados/recibidos
- **Plantillas**: Gestiona plantillas de mensajes por empresa

---

## 🔧 Configuración de Webhooks

### ¿Qué es un Webhook?

Un webhook permite que WhatsApp envíe mensajes entrantes a tu sistema en tiempo real.

### Configurar Webhook

1. En Meta Developers, ve a WhatsApp → Configuración
2. Haz clic en "Configurar Webhook"
3. Ingresa la URL: `https://tu-dominio.com/api/webhook/whatsapp/TU_TOKEN`
4. Selecciona los campos:
   - ✅ Messages
   - ✅ Message template status update
   - ✅ Account update

### Verificar Webhook

El sistema verificará automáticamente tu webhook cuando lo configures.

---

## 📤 Envío de Mensajes

### Mensajes Individuales

1. Ve al gestor de comunicación
2. Selecciona la empresa y el número de WhatsApp
3. Escribe tu mensaje
4. Envía a contactos individuales

### Mensajes Masivos

1. Selecciona múltiples contactos
2. Usa plantillas predefinidas
3. Programa envíos automáticos
4. Monitorea el estado de entrega

### Tipos de Mensajes Soportados

- ✅ Mensajes de texto
- ✅ Imágenes con subtítulos
- ✅ Mensajes de audio
- ✅ Videos
- ✅ Documentos
- ✅ Ubicación
- ✅ Mensajes interactivos (botones)

---

## 🤖 Respuestas Automáticas

### Configurar Respuestas Automáticas

1. En el gestor multi-WhatsApp, edita una configuración
2. Activa "Respuestas Automáticas"
3. Personaliza el mensaje:

```
Hola {name}, gracias por contactar a {company}!
Te responderemos a la brevedad posible.
Hora: {time}
```

### Variables Disponibles

- `{name}`: Nombre del contacto
- `{company}`: Nombre de la empresa
- `{time}`: Hora actual

---

## 📊 Estadísticas y Monitoreo

### Métricas Disponibles

- **Mensajes enviados hoy**: Contador diario
- **Mensajes recibidos hoy**: Contador diario
- **Mensajes enviados mes**: Contador mensual
- **Mensajes recibidos mes**: Contador mensual
- **Estado del webhook**: Conectado/Desconectado
- **Calidad del número**: Green/Yellow/Red

### Logs Detallados

- Timestamp exacto de cada mensaje
- Contenido del mensaje
- Estado de entrega
- Errores y soluciones

---

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. "Token de acceso inválido"

**Solución:**
- Verifica que el token comience con `EAAZA...`
- Asegúrate de que sea un token permanente, no temporal
- Regenera el token si es necesario

#### 2. "ID de teléfono inválido"

**Solución:**
- Verifica el Phone Number ID en Meta Developers
- Asegúrate de que el número esté verificado
- Revisa que el número esté activo

#### 3. "Webhook no responde"

**Solución:**
- Verifica que la URL del webhook sea correcta
- Asegúrate de que el puerto esté abierto
- Revisa los logs del servidor

#### 4. "Mensaje no enviado"

**Solución:**
- Verifica el límite diario de mensajes
- Revisa el estado del número de teléfono
- Asegúrate de que el destinatario tenga WhatsApp

### Límites de Uso

- **Mensajes diarios**: Configurable por número
- **Mensajes mensuales**: Configurable por número
- **Tipos de contenido**: Todos los formatos soportados

### Calidad del Número

- **🟢 Green**: Alto límite de envío
- **🟡 Yellow**: Límite moderado
- **🔴 Red**: Límite bajo, necesita mejorar calidad

---

## 📞 Soporte

### Contacto

Si necesitas ayuda adicional:

1. **Soporte Técnico**: [soporte@staffhub.com](mailto:soporte@staffhub.com)
2. **Documentación**: [docs.staffhub.com](https://docs.staffhub.com)
3. **Comunidad**: [community.staffhub.com](https://community.staffhub.com)

### Recursos Adicionales

- [Documentación oficial de WhatsApp API](https://developers.facebook.com/docs/whatsapp)
- [Políticas de WhatsApp Business](https://www.facebook.com/business/policies/whatsapp-business-policy)
- [Guías de mejores prácticas](https://www.facebook.com/business/learn/whatsapp-business-best-practices)

---

## 🎉 ¡Felicidades!

Has configurado exitosamente WhatsApp Business en StaffHub. Ahora puedes:

- ✅ Enviar mensajes a tus clientes
- ✅ Recibir mensajes entrantes
- ✅ Usar respuestas automátáticas
- ✅ Gestionar múltiples números
- ✅ Monitorear estadísticas en tiempo real

**Próximos pasos recomendados:**

1. Configura tus plantillas de mensajes
2. Importa tu lista de contactos
3. Programa tus primeros mensajes
4. Monitorea las estadísticas de uso

---

*Última actualización: Octubre 2024*
*Versión: 1.0*