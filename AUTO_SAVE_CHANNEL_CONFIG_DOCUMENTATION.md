# Sistema de Auto-Guardado de Configuración de Canales

## Overview

Este documento describe la implementación del sistema de auto-guardado para la configuración de canales de comunicación en el formulario de empresas. El sistema permite guardar automáticamente las credenciales de cada canal a medida que el usuario las completa, sin necesidad de esperar al guardado final del formulario.

## Regla de Negocio Implementada

**Regla principal**: "Primero seleccionar el canal y llenar los campos de dicho canal y que se vaya guardando automáticamente para ir completando los demás canales y luego hacer click en guardar configuración y ahí se guarda todo como corresponde. Si selecciono un medio y no lleno nada y no hago click en nada no tiene por qué aparecer un mensaje de error o de campo o etc."

## Arquitectura del Sistema

### 1. Funciones Principales

#### `saveChannelConfig(channelType, channelData)`
- **Propósito**: Guarda automáticamente la configuración de un canal específico en la base de datos
- **Parámetros**:
  - `channelType`: Tipo de canal (email, sms, telegram, etc.)
  - `channelData`: Objeto con todos los datos del canal
- **Comportamiento**:
  - Solo funciona en modo empresa específica (`isCompanySpecificMode`)
  - Actualiza solo los campos del canal específico
  - Incluye timestamp de actualización
  - Maneja errores de forma silenciosa (solo logging en consola)

#### `handleChannelChange(field, value)`
- **Propósito**: Maneja cambios en los campos de canales con auto-guardado diferido
- **Parámetros**:
  - `field`: Nombre del campo (ej: `email_sender_name`)
  - `value`: Nuevo valor del campo
- **Comportamiento**:
  - Actualiza el estado local inmediatamente
  - Extrae el tipo de canal del nombre del campo
  - Recopila todos los datos actuales del canal
  - Programa auto-guardado con 500ms de delay (debounce)

### 2. Flujo de Auto-Guardado

```
Usuario modifica campo → handleChannelChange() → Actualizar estado → setTimeout(500ms) → saveChannelConfig() → Guardar en BD
```

### 3. Modos de Operación

#### Modo Específico (`isCompanySpecificMode = true`)
- **Auto-guardado**: Activo para todos los campos de canales
- **Validación**: Solo requiere nombre de empresa
- **Guardado final**: Guarda toda la configuración completa

#### Modo Normal (`isCompanySpecificMode = false`)
- **Auto-guardado**: Inactivo
- **Validación**: Requiere todos los campos obligatorios
- **Guardado final**: Proceso estándar de creación/edición

## Implementación Técnica

### 1. Campos Actualizados

Todos los campos de canales ahora usan `handleChannelChange` en lugar de `handleInputChange`:

#### Canales de Comunicación
- **Email**: `email_enabled`, `email_sender_name`, `email_sender_email`, `email_reply_to`
- **SMS**: `sms_enabled`, `sms_sender_name`, `sms_sender_phone`
- **Telegram**: `telegram_enabled`, `telegram_bot_token`, `telegram_bot_username`, `telegram_webhook_url`
- **WhatsApp**: `whatsapp_enabled`, `whatsapp_access_token`, `whatsapp_phone_number_id`, `whatsapp_webhook_verify_token`

#### Inteligencia Artificial
- **Groq AI**: `groq_enabled`, `groq_api_key`, `groq_model`, `groq_temperature`, `groq_max_tokens`

#### Productividad y Colaboración
- **Google**: `google_enabled`, `google_api_key`, `google_client_id`, `google_client_secret`
- **Microsoft**: `microsoft_enabled`, `microsoft_client_id`, `microsoft_client_secret`, `microsoft_tenant_id`
- **Slack**: `slack_enabled`, `slack_bot_token`, `slack_signing_secret`, `slack_default_channel`
- **Teams**: `teams_enabled`, `teams_app_id`, `teams_client_secret`, `teams_tenant_id`

#### CRM y Ventas
- **HubSpot**: `hubspot_enabled`, `hubspot_api_key`, `hubspot_portal_id`
- **Salesforce**: `salesforce_enabled`, `salesforce_consumer_key`, `salesforce_consumer_secret`, `salesforce_username`, `salesforce_password`

### 2. Estructura de Datos

```javascript
// Ejemplo de datos guardados para canal Email
{
  email_enabled: true,
  email_sender_name: "Empresa XYZ",
  email_sender_email: "noreply@empresa.cl",
  email_reply_to: "soporte@empresa.cl",
  updated_at: "2025-10-20T04:21:50.363Z"
}
```

### 3. Manejo de Errores

- **Errores de auto-guardado**: Solo se registran en consola, no interrumpen la experiencia del usuario
- **Errores de guardado final**: Se muestran al usuario con toast notifications
- **Validación**: En modo específico, solo se valida el nombre de la empresa

## Características Especiales

### 1. Debounce de 500ms
- Evita múltiples llamadas a la base de datos durante escritura rápida
- Permite experiencia de usuario fluida
- Reduce carga en el servidor

### 2. Detección Automática de Tipo de Canal
```javascript
const channelType = field.split('_')[0] // 'email_sender_name' → 'email'
```

### 3. Recopilación Inteligente de Datos
```javascript
const channelData = {}
Object.keys(formData).forEach(key => {
  if (key.startsWith(`${channelType}_`)) {
    channelData[key] = formData[key]
  }
})
```

### 4. Logging Detallado
- Cada operación de auto-guardado se registra en consola
- Facilita depuración y monitoreo
- Incluye timestamps y detalles de operación

## Ventajas del Sistema

### 1. Experiencia de Usuario Mejorada
- **Sin pérdida de datos**: La información se guarda automáticamente
- **Sin interrupciones**: No aparecen mensajes de error prematuros
- **Flujo continuo**: Usuario puede completar canales en cualquier orden

### 2. Robustez
- **Tolerante a fallos**: Si el auto-guardado falla, el usuario puede continuar
- **Recuperación**: El guardado final asegura que todos los datos se persistan
- **Consistencia**: Mantiene coherencia entre estado local y base de datos

### 3. Performance
- **Debounce inteligente**: Reduce llamadas innecesarias a la API
- **Actualizaciones parciales**: Solo guarda los campos modificados
- **Operaciones asíncronas**: No bloquea la interfaz de usuario

## Casos de Uso

### 1. Flujo Típico de Configuración
1. Usuario accede a configuración específica de empresa
2. Selecciona canal "Email"
3. Completa `email_sender_name` → se auto-guarda después de 500ms
4. Completa `email_sender_email` → se auto-guarda después de 500ms
5. Cambia a canal "SMS"
6. Completa datos de SMS → se auto-guardan automáticamente
7. Finalmente hace clic en "Guardar Configuración" → guarda todo completamente

### 2. Escenario de Error
1. Usuario selecciona canal "Telegram"
2. No completa ningún campo
3. Cambia a otro canal
4. **Resultado**: No aparece ningún mensaje de error, el sistema continúa funcionando normalmente

### 3. Escenario de Recuperación
1. Usuario completa parcialmente un canal
2. El auto-guardado falla (error de red, etc.)
3. Usuario completa el resto de los campos
4. Hace clic en "Guardar Configuración"
5. **Resultado**: Todos los datos se guardan correctamente en el guardado final

## Consideraciones Técnicas

### 1. Dependencias
- React hooks (`useState`, `useEffect`)
- Supabase client
- React Hot Toast (para notificaciones)

### 2. Compatibilidad
- Compatible con modo específico y modo normal
- No afecta funcionalidades existentes
- Mantenimiento de estado consistente

### 3. Escalabilidad
- Fácil agregar nuevos canales siguiendo el patrón establecido
- Configuración de tiempo de debounce ajustable
- Extensible para diferentes tipos de validación

## Testing y Validación

### 1. Pruebas Recomendadas
- **Auto-guardado**: Verificar que los datos se guardan después de 500ms
- **Debounce**: Comprobar que no se hacen múltiples llamadas rápidas
- **Errores**: Simular fallos de red y verificar recuperación
- **Cambio de canales**: Validar que los datos se mantienen al cambiar entre pestañas

### 2. Casos Límite
- Conexión intermitente
- Cambios rápidos entre campos
- Navegación away/back durante configuración
- Múltiples pestañas abiertas

## Mantenimiento Futuro

### 1. Posibles Mejoras
- Indicador visual de "guardando..." durante auto-guardado
- Sincronización offline con cola de operaciones
- Validación específica por canal antes de auto-guardar
- Historial de cambios de configuración

### 2. Monitoreo
- Logs de operaciones de auto-guardado
- Métricas de éxito/fracaso de operaciones
- Tiempos de respuesta de guardado automático
- Patrones de uso de canales

## Conclusión

El sistema de auto-guardado implementado proporciona una experiencia de usuario robusta y fluida para la configuración de canales de comunicación. Siguiendo la regla de negocio especificada, permite a los usuarios completar la configuración de manera flexible sin preocuparse por la pérdida de datos o mensajes de error prematuros.

La implementación es escalable, mantenible y compatible con las funcionalidades existentes del sistema.