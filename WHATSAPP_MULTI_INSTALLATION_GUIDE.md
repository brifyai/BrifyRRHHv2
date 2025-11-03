# Guía de Instalación - Sistema Multi-WhatsApp para Agencias

## Resumen

Esta guía explica cómo configurar el sistema multi-WhatsApp que permite a las agencias gestionar múltiples números de WhatsApp para diferentes clientes.

## 🎯 Funcionalidades Implementadas

- ✅ Soporte para múltiples números de WhatsApp por empresa
- ✅ Gestión independiente de configuraciones por cliente
- ✅ Control de límites de uso por número
- ✅ Plantillas de mensajes personalizadas
- ✅ Estadísticas y análisis por cliente
- ✅ Interfaz intuitiva para agencias
- ✅ Compatibilidad con UUID para company_id (corregido)

## 📋 Pasos de Instalación

### 1. Configuración de la Base de Datos

**Importante:** Las tablas deben crearse manualmente en el panel de Supabase ya que requieren permisos de administrador.

#### Pasos:

1. **Abre el panel de Supabase**
   - Ve a: https://app.supabase.com
   - Inicia sesión con tu cuenta

2. **Navega al Editor SQL**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New query" para crear una nueva consulta

3. **Ejecuta el script SQL**
   - Abre el archivo `create-whatsapp-config-table-clean.sql` en tu editor
   - Copia todo el contenido del archivo
   - Pégalo en el editor SQL de Supabase
   - Haz clic en "Run" para ejecutar el script

#### Tablas que se crearán:

- `whatsapp_configs` - Configuraciones de WhatsApp por empresa
- `whatsapp_templates` - Plantillas de mensajes por empresa
- `whatsapp_logs` - Registro de actividad de WhatsApp
- `active_whatsapp_configs` - Vista de configuraciones activas

**Nota Importante**: El script SQL ha sido corregido para usar `UUID` en lugar de `BIGINT` para `company_id`, asegurando compatibilidad con la tabla `companies` existente.

### 2. Verificación de la Instalación

Una vez ejecutado el script SQL, verifica que las tablas se crearon correctamente:

1. En el panel de Supabase, ve a "Table Editor"
2. Deberías ver las nuevas tablas en la lista
3. Haz clic en cada tabla para verificar su estructura

### 3. Acceso al Sistema Multi-WhatsApp

El sistema ya está integrado en la aplicación. Puedes acceder a él de las siguientes maneras:

#### Opción 1: URL Directa
```
http://localhost:3000/whatsapp/multi-manager
```

#### Opción 2: Desde el Menú de Navegación
(Requiere agregar el enlace al menú principal)

## 🔧 Uso del Sistema

### Configuración de un Nuevo Número de WhatsApp

1. **Accede al Gestor Multi-WhatsApp**
   - Ve a la URL: `/whatsapp/multi-manager`

2. **Agrega una Nueva Configuración**
   - Haz clic en "Agregar Configuración de WhatsApp"
   - Selecciona la empresa/cliente
   - Ingresa el número de teléfono (formato: +569XXXXXXXX)
   - Configura los datos de la API de Meta
   - Establece los límites de uso

3. **Configura la API de Meta**
   - Obtén tus credenciales en: https://developers.facebook.com
   - Ingresa el Access Token
   - Configura el Webhook URL
   - Verifica la configuración

### Gestión de Múltiples Clientes

- **Vista General**: Verás todas las configuraciones activas
- **Estadísticas**: Monitorea el uso por cliente
- **Límites**: Controla el consumo mensual/diario
- **Plantillas**: Gestiona mensajes por empresa

## 📚 Documentación Adicional

- **Guía Completa**: `WHATSAPP_MULTI_AGENCY_GUIDE.md`
- **Referencia API**: Documentación en el mismo archivo
- **Buenas Prácticas**: Recomendaciones para agencias

## 🛠️ Arquitectura del Sistema

### Componentes Principales

1. **Base de Datos**
   - `whatsapp_configs`: Configuraciones por empresa
   - `whatsapp_templates`: Plantillas personalizadas
   - `whatsapp_logs`: Registro de actividad

2. **Servicios**
   - `multiWhatsAppService.js`: Lógica principal
   - `communicationService.js`: Integración con sistema existente

3. **Interfaz**
   - `MultiWhatsAppManager.js`: Panel de gestión
   - Integración con routing de React

### Flujo de Trabajo

```
Empresa A → Configuración A → Número WhatsApp A
Empresa B → Configuración B → Número WhatsApp B
Empresa C → Configuración C → Número WhatsApp C
```

## 🔍 Solución de Problemas

### Problemas Comunes

1. **Error de sintaxis: "syntax error at or near ====================="**
   - ✅ **Corregido**: Se creó `create-whatsapp-config-table-clean.sql` sin caracteres no válidos
   - Usa el archivo `clean.sql` para evitar errores de sintaxis

2. **Error de foreign key: "foreign key constraint cannot be implemented"**
   - ✅ **Corregido**: El script SQL ahora usa `UUID` para `company_id` y `created_by`
   - Asegúrate de usar la versión actualizada del script

3. **Error específico con created_by: "whatsapp_configs_created_by_fkey"**
   - ✅ **Corregido**: Todos los campos `created_by` ahora usan `UUID` para compatibilidad con la tabla `users`
   - Esto afecta a las tablas `whatsapp_configs` y `whatsapp_logs`

4. **Error específico con recipient_id: "whatsapp_logs_recipient_id_fkey"**
   - ✅ **Corregido**: El campo `recipient_id` ahora usa `UUID` para compatibilidad con la tabla `employees`
   - Esto afecta a la tabla `whatsapp_logs`

5. **Tablas no aparecen**
   - Verifica que el SQL se ejecutó sin errores
   - Revisa los permisos en Supabase
   - Confirma que usaste el script `create-whatsapp-config-table-clean.sql`

6. **Error de conexión**
   - Verifica las credenciales de Meta API
   - Confirma la configuración del webhook

7. **Límites de uso**
   - Revisa la configuración por empresa
   - Monitoriza el consumo en el panel

### Logs y Depuración

- Los errores se registran en `whatsapp_logs`
- Usa la consola del navegador para depuración
- Revisa el estado de las configuraciones activas

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. Revisa esta guía detalladamente
2. Consulta la documentación completa en `WHATSAPP_MULTI_AGENCY_GUIDE.md`
3. Verifica los logs de la aplicación
4. Contacta al equipo de desarrollo

## 🚀 Siguientes Pasos

Una vez completada la instalación:

1. Configura tus primeros clientes
2. Prueba el envío de mensajes
3. Establece límites de uso adecuados
4. Capacita a tu equipo en el uso del sistema

---

**Nota Importante:** Esta implementación está diseñada específicamente para agencias que necesitan gestionar múltiples números de WhatsApp para diferentes clientes, manteniendo la separación y control independientes por cada configuración.