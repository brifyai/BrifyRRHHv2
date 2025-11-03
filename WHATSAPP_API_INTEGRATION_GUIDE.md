# Guía de Integración de APIs de WhatsApp

## Overview

Esta guía explica cómo utilizar el sistema de integración múltiple de WhatsApp que incluye:
- **WhatsApp Official API** - La API oficial de Meta
- **WhatsApp WAHA API** - API de waha.devike.pro
- **WhatsApp Legacy API** - API existente (compatible hacia atrás)

## Configuración

### 1. Configurar APIs

Las APIs se configuran en la sección de integraciones:
```
http://localhost:3000/configuracion/integraciones
```

### 2. Variables de Entorno

Las siguientes variables de entorno deben estar configuradas en el archivo `.env`:

```env
# WhatsApp Official API
WHATSAPP_OFFICIAL_ACCESS_TOKEN=tu_token_oficial
WHATSAPP_OFFICIAL_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_OFFICIAL_WEBHOOK_VERIFY_TOKEN=tu_webhook_token
WHATSAPP_OFFICIAL_VERSION=v18.0

# WhatsApp WAHA API
WHATSAPP_WAHA_API_URL=https://waha.devike.pro
WHATSAPP_WAHA_SESSION_ID=tu_session_id
WHATSAPP_WAHA_API_KEY=tu_api_key

# WhatsApp Legacy API (existente)
WHATSAPP_ACCESS_TOKEN=tu_token_legacy
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_legacy
WHATSAPP_WEBHOOK_VERIFY_TOKEN=tu_webhook_token_legacy
```

## Uso del Sistema

### 1. Seleccionar API Preferida

En la configuración de integraciones, puedes seleccionar cuál API será la preferida para enviar mensajes:

- **official**: Usa la API oficial de Meta
- **waha**: Usa la API de waha.devike.pro
- **legacy**: Usa la API existente (default)

### 2. Enviar Mensajes

El sistema automáticamente usará la API preferida configurada. Para enviar mensajes:

```javascript
import communicationService from './services/communicationService'

// Enviar mensaje usando la API preferida
const result = await communicationService.sendWhatsAppMessageWithAPI(
  ['employee-id-1', 'employee-id-2'],
  'Mensaje de prueba',
  { apiType: 'auto' } // 'auto' usa la API preferida
)

// Enviar mensaje usando una API específica
const result = await communicationService.sendWhatsAppMessageWithAPI(
  ['employee-id-1'],
  'Mensaje de prueba',
  { apiType: 'official' } // 'official', 'waha', o 'legacy'
)
```

### 3. Verificar Estado de APIs

Para verificar el estado de todas las APIs:

```javascript
import communicationService from './services/communicationService'

// Obtener estado de todas las APIs
const status = communicationService.getWhatsAppAPIsStatus()
console.log(status)

// Probar todas las APIs
const testResults = await communicationService.testWhatsAppAPIs()
console.log(testResults)
```

## Componente de Prueba

Para probar la integración, puedes acceder al componente de prueba:

```
http://localhost:3000/test-whatsapp-apis
```

Este componente permite:
- Ver el estado de todas las APIs
- Probar la conexión de cada API
- Enviar mensajes de prueba con cada API
- Limpiar configuraciones

## Configuración de APIs Individualmente

### WhatsApp Official API

1. Obtén un token de acceso desde la [Meta Developers Console](https://developers.facebook.com/)
2. Crea una aplicación de WhatsApp Business
3. Obtén el Phone Number ID
4. Configura el webhook si es necesario

### WhatsApp WAHA API

1. Regístrate en [waha.devike.pro](https://waha.devike.pro)
2. Obtén tu API key
3. Crea una sesión de WhatsApp
4. Configura el session ID

### WhatsApp Legacy API

Esta API ya está configurada en el sistema y mantiene compatibilidad con el código existente.

## Manejo de Errores

El sistema incluye manejo automático de errores y fallback:

1. Si la API preferida falla, el sistema intentará con las otras APIs disponibles
2. Los errores se registran en la consola para depuración
3. Se muestra notificaciones al usuario sobre el estado del envío

## Consideraciones

- **Modo de Prueba**: Todas las APIs soportan modo de prueba para desarrollo
- **Rate Limiting**: Cada API tiene sus propios límites de uso
- **Formato de Números**: Usa formato internacional (+56912345678)
- **Validación**: El sistema valida los números antes de enviar

## Ejemplos de Uso

### Enviar Mensaje Simple

```javascript
const result = await communicationService.sendWhatsAppMessageWithAPI(
  ['employee-123'],
  'Hola, este es un mensaje de prueba',
  { apiType: 'official' }
)

if (result.success) {
  console.log('Mensaje enviado:', result.messageId)
} else {
  console.error('Error:', result.error)
}
```

### Enviar Mensaje con Media

```javascript
const result = await communicationService.sendWhatsAppMessageWithAPI(
  ['employee-123'],
  'Mira esta imagen',
  { 
    apiType: 'waha',
    media: {
      type: 'image',
      url: 'https://ejemplo.com/imagen.jpg'
    }
  }
)
```

### Enviar Mensaje a Múltiples Empleados

```javascript
const employeeIds = ['emp-1', 'emp-2', 'emp-3']
const result = await communicationService.sendWhatsAppMessageWithAPI(
  employeeIds,
  'Mensaje para todos',
  { apiType: 'auto' }
)
```

## Soporte

Para problemas o preguntas:
1. Revisa el componente de prueba en `/test-whatsapp-apis`
2. Verifica la consola del navegador para errores
3. Confirma que las variables de entorno estén configuradas correctamente
4. Asegúrate de que las APIs estén activas y configuradas

## Actualizaciones Futuras

El sistema está diseñado para ser extensible. Se pueden agregar nuevas APIs de WhatsApp siguiendo el mismo patrón de implementación.