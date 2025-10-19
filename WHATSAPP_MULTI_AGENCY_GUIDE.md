# Guía Completa: WhatsApp Multi-Empresa para Agencias

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Configuración Inicial](#configuración-inicial)
4. [Gestión de Múltiples Números](#gestión-de-múltiples-números)
5. [Envío de Mensajes](#envío-de-mensajes)
6. [Estadísticas y Reportes](#estadísticas-y-reportes)
7. [Buenas Prácticas](#buenas-prácticas)
8. [Solución de Problemas](#solución-de-problemas)
9. [API y Desarrollo](#api-y-desarrollo)

---

## 🚀 Introducción

El sistema Multi-WhatsApp de StaffHub está diseñado específicamente para agencias de comunicación que necesitan gestionar múltiples números de WhatsApp para diferentes clientes. Esta solución permite:

- **Gestión Centralizada**: Administrar todos los números de WhatsApp desde una única interfaz
- **Aislamiento de Datos**: Cada cliente tiene su propia configuración y estadísticas
- **Escalabilidad**: Agregar nuevos clientes sin afectar a los existentes
- **Control de Costos**: Monitoreo individual del uso por cliente
- **Cumplimiento**: Mantener separación completa entre clientes

### Beneficios Clave

✅ **Un número por cliente**: Evita confusiones y mantiene la identidad de marca  
✅ **Estadísticas independientes**: Reportes detallados por cliente  
✅ **Límites de uso configurables**: Control de costos por cliente  
✅ **Gestión de plantillas**: Plantillas personalizadas por cliente  
✅ **Logs detallados**: Registro completo de todas las comunicaciones  

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    StaffHub Multi-WhatsApp                  │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React)                                           │
│  ├── MultiWhatsAppManager.js                               │
│  ├── WhatsAppConfigForm.js                                 │
│  └── WhatsAppAnalytics.js                                  │
├─────────────────────────────────────────────────────────────┤
│  Backend (Node.js)                                          │
│  ├── multiWhatsAppService.js                               │
│  ├── communicationService.js                               │
│  └── whatsappService.js                                    │
├─────────────────────────────────────────────────────────────┤
│  Base de Datos (Supabase)                                   │
│  ├── whatsapp_configs                                      │
│  ├── whatsapp_logs                                         │
│  ├── whatsapp_templates                                    │
│  └── companies                                             │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Configuración**: Cada empresa/cliente tiene su propia configuración de WhatsApp
2. **Envío**: Los mensajes se enrutan automáticamente al número correcto según la empresa
3. **Registro**: Todas las interacciones se guardan con referencia a la empresa
4. **Análisis**: Estadísticas generadas por empresa y consolidadas

---

## ⚙️ Configuración Inicial

### 1. Preparar la Base de Datos

Ejecutar el script SQL para crear las tablas necesarias:

```sql
-- Ejecutar el archivo create-whatsapp-config-table.sql
-- Esto creará todas las tablas y vistas necesarias
```

### 2. Obtener Credenciales de Meta

Para cada cliente, necesitarás:

1. **Business Account** de Meta
2. **WhatsApp Business API** acceso
3. **Access Token** permanente
4. **Phone Number ID** del número de WhatsApp

### 3. Configurar Webhooks (Opcional)

Para cada número de WhatsApp, puedes configurar webhooks para recibir:
- Mensajes entrantes
- Confirmaciones de entrega
- Actualizaciones de estado

---

## 📱 Gestión de Múltiples Números

### Interfaz de Administración

Accede al gestor multi-WhatsApp en: `/whatsapp/manager`

#### Funcionalidades Principales

1. **Agregar Nueva Configuración**
   - Seleccionar empresa/cliente
   - Ingresar credenciales de Meta
   - Configurar límites de uso
   - Establecer número como por defecto (opcional)

2. **Ver Configuraciones Existentes**
   - Estado de conexión
   - Estadísticas de uso
   - Calidad del número
   - Límites consumidos

3. **Editar Configuración**
   - Actualizar credenciales
   - Modificar límites
   - Cambiar estado activo/inactivo

4. **Probar Conexión**
   - Enviar mensaje de prueba
   - Verificar estado del número
   - Validar credenciales

### Campos de Configuración

| Campo | Descripción | Requerido |
|-------|-------------|-----------|
| Empresa | Cliente asociado | ✅ |
| Access Token | Token de API de Meta | ✅ |
| Phone Number ID | ID del número WhatsApp | ✅ |
| Webhook Verify Token | Token para webhooks | ❌ |
| Modo Prueba | Enviar mensajes de prueba | ❌ |
| Es Por Defecto | Número principal del sistema | ❌ |
| Límite Diario | Máximo de mensajes/día | ✅ |
| Límite Mensual | Máximo de mensajes/mes | ✅ |

---

## 📤 Envío de Mensajes

### Métodos Disponibles

#### 1. Envío por Empresa Individual

```javascript
// Enviar mensaje para una empresa específica
const result = await communicationService.sendWhatsAppMessageByCompany(
  companyId,           // ID de la empresa
  recipientIds,        // Array de IDs de empleados
  message,             // Mensaje a enviar
  options              // Opciones adicionales
);
```

#### 2. Envío Masivo a Múltiples Empresas

```javascript
// Enviar a múltiples empresas
const companiesData = [
  {
    companyId: 1,
    recipients: [1, 2, 3]  // IDs de empleados
  },
  {
    companyId: 2,
    recipients: [4, 5, 6]
  }
];

const result = await communicationService.sendBulkWhatsAppToCompanies(
  companiesData,
  message,
  options
);
```

#### 3. Envío con Fallback Inteligente

```javascript
// Intenta WhatsApp primero, luego otros canales
const result = await communicationService.sendWithFallback(
  recipientIds,
  message,
  'whatsapp',  // Canal primario
  options
);
```

### Opciones de Envío

```javascript
const options = {
  templateName: 'nombre_plantilla',      // Para plantillas pre-aprobadas
  templateLanguage: 'es',                // Idioma de la plantilla
  components: [],                        // Componentes de la plantilla
  messageType: 'text',                   // 'text' o 'template'
  delayBetweenMessages: 1000             // Delay entre mensajes (ms)
};
```

### Plantillas de Mensaje

Para enviar mensajes a usuarios que no han iniciado conversación, usa plantillas pre-aprobadas:

```javascript
const templateOptions = {
  messageType: 'template',
  templateName: 'bienvenida_cliente',
  templateLanguage: 'es',
  components: [
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: 'Nombre del Cliente'
        }
      ]
    }
  ]
};
```

---

## 📊 Estadísticas y Reportes

### Métricas Disponibles

#### Por Empresa

- **Total de mensajes enviados**
- **Tasa de entrega**
- **Tasa de lectura**
- **Costo total**
- **Uso diario/mensual**
- **Calidad del número**

#### Consolidadas

- **Comparación entre clientes**
- **Tendencias de uso**
- **Costos totales**
- **Rendimiento general**

### Acceso a Estadísticas

```javascript
// Estadísticas por empresa
const stats = await communicationService.getWhatsAppUsageStats(companyId);

// Todas las configuraciones
const configs = await communicationService.getAllWhatsAppConfigurations();
```

### Dashboard Analítico

El sistema incluye un dashboard completo con:

- **Gráficos de uso** por cliente
- **Tendencias temporales**
- **Análisis de costos**
- **Alertas de límites**
- **Informes exportables**

---

## 💡 Buenas Prácticas

### 1. Organización de Clientes

- **Un número por cliente**: Nunca compartas números entre clientes
- **Nombres descriptivos**: Usa nombres claros para cada configuración
- **Documentación**: Mantén registro de credenciales y configuraciones

### 2. Gestión de Límites

```javascript
// Configura límites realistas según el plan del cliente
const limits = {
  small: { daily: 100, monthly: 3000 },
  medium: { daily: 500, monthly: 15000 },
  large: { daily: 1000, monthly: 30000 }
};
```

### 3. Monitoreo Proactivo

- **Alertas de uso**: Configura notificaciones al alcanzar 80% del límite
- **Calidad del número**: Monitorea el rating de calidad de Meta
- **Estado de conexión**: Verifica regularmente la conectividad

### 4. Seguridad

- **Cifrado de tokens**: Almacena access tokens de forma segura
- **Rotación de credenciales**: Actualiza tokens periódicamente
- **Auditoría**: Mantén logs de cambios de configuración

### 5. Comunicación con Clientes

- **Reportes mensuales**: Envía estadísticas a tus clientes
- **Transparencia de costos**: Detalla el uso y costos
- **Notificaciones**: Informa sobre límites y problemas

---

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. Error de Conexión

**Síntomas**: No se pueden enviar mensajes, error de autenticación

**Soluciones**:
```javascript
// Verificar configuración
const config = await communicationService.getWhatsAppConfigurationByCompany(companyId);

// Probar conexión
const testResult = await communicationService.testWhatsAppConnection();

// Validar token
const response = await fetch(`https://graph.facebook.com/v18.0/me`, {
  headers: {
    'Authorization': `Bearer ${config.access_token}`
  }
});
```

#### 2. Límites Alcanzados

**Síntomas**: Mensajes rechazados por límite excedido

**Soluciones**:
```javascript
// Verificar uso actual
const stats = await communicationService.getWhatsAppUsageStats(companyId);

// Aumentar límites si es necesario
await communicationService.configureWhatsAppForCompany(companyId, {
  ...config,
  dailyLimit: nuevoLimiteDiario,
  monthlyLimit: nuevoLimiteMensual
});
```

#### 3. Baja Calidad del Número

**Síntomas**: Baja tasa de entrega, warnings de Meta

**Soluciones**:
- Reducir frecuencia de mensajes
- Mejorar contenido y relevancia
- Evitar mensajes spam
- Usar plantillas aprobadas

#### 4. Problemas con Webhooks

**Síntomas**: No se reciben confirmaciones de entrega

**Soluciones**:
- Verificar URL del webhook
- Validar verify token
- Chequear configuración de firewall
- Revisar logs de errores

### Herramientas de Depuración

```javascript
// Modo prueba para desarrollo
const testConfig = {
  ...config,
  testMode: true
};

// Logs detallados
console.log('WhatsApp Debug:', {
  companyId,
  phoneNumber: config.display_phone_number,
  message: 'Test message',
  timestamp: new Date().toISOString()
});
```

---

## 🔌 API y Desarrollo

### Endpoints Principales

#### Configuración

```javascript
// GET /api/whatsapp/configurations
// Obtiene todas las configuraciones

// POST /api/whatsapp/configure
// Configura WhatsApp para una empresa

// PUT /api/whatsapp/configure/:id
// Actualiza configuración existente

// DELETE /api/whatsapp/configure/:id
// Elimina configuración
```

#### Envío de Mensajes

```javascript
// POST /api/whatsapp/send/company/:companyId
// Envía mensaje para empresa específica

// POST /api/whatsapp/send/bulk
// Envío masivo a múltiples empresas

// POST /api/whatsapp/test/:companyId
// Envía mensaje de prueba
```

#### Estadísticas

```javascript
// GET /api/whatsapp/stats/:companyId
// Estadísticas por empresa

// GET /api/whatsapp/stats/all
// Estadísticas consolidadas
```

### Integración con Sistemas Externos

```javascript
// Ejemplo: Integración con CRM
class CRMIntegration {
  async syncWhatsAppConfig(crmClientId) {
    // Obtener configuración de WhatsApp
    const config = await communicationService.getWhatsAppConfigurationByCompany(crmClientId);
    
    // Sincronizar con CRM
    await this.updateCRM({
      clientId: crmClientId,
      whatsappNumber: config.display_phone_number,
      status: config.is_active ? 'active' : 'inactive'
    });
  }
  
  async sendCRMNotification(clientId, message) {
    // Enviar notificación via WhatsApp
    return await communicationService.sendWhatsAppMessageByCompany(
      clientId,
      this.getClientContacts(clientId),
      message
    );
  }
}
```

### Webhooks Personalizados

```javascript
// Manejo de webhooks entrantes
app.post('/webhooks/whatsapp/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const payload = req.body;
  
  // Procesar mensaje entrante
  if (payload.object === 'whatsapp_business_account') {
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          await this.handleIncomingMessage(companyId, change.value);
        }
      }
    }
  }
  
  res.status(200).send('OK');
});
```

---

## 📈 Escalabilidad y Rendimiento

### Optimización para Grandes Volúmenes

1. **Batch Processing**: Agrupar mensajes por empresa
2. **Rate Limiting**: Control automático de frecuencia
3. **Caching**: Cache de configuraciones activas
4. **Queue System**: Cola de mensajes para alta demanda

### Monitoreo de Rendimiento

```javascript
// Métricas a monitorear
const performanceMetrics = {
  messageLatency: 'Tiempo promedio de entrega',
  throughput: 'Mensajes por segundo',
  errorRate: 'Tasa de errores',
  queueSize: 'Tamaño de cola pendiente'
};
```

### Escalado Horizontal

- **Load Balancer**: Distribuir carga entre múltiples instancias
- **Database Sharding**: Separar datos por cliente si es necesario
- **CDN**: Para recursos estáticos y plantillas

---

## 📋 Checklist de Implementación

### Pre-Implementación

- [ ] Obtener credenciales de Meta para cada cliente
- [ ] Preparar base de datos con tablas necesarias
- [ ] Configurar entorno de desarrollo
- [ ] Definir límites de uso por cliente

### Implementación

- [ ] Instalar y configurar componentes
- [ ] Configurar primeras empresas
- [ ] Probar envío de mensajes
- [ ] Validar webhooks (si aplica)

### Post-Implementación

- [ ] Configurar monitoreo y alertas
- [ ] Documentar procesos
- [ ] Capacitar equipo
- [ ] Establecer procedimientos de respaldo

---

## 🆘 Soporte y Contacto

### Recursos Adicionales

- **Documentación de Meta WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **Guía de Buenas Prácticas**: Ver sección de Buenas Prácticas
- **API Reference**: Ver sección API y Desarrollo

### Soporte Técnico

Para problemas técnicos o preguntas sobre la implementación:

1. **Revisar logs** del sistema
2. **Consultar sección** de Solución de Problemas
3. **Verificar estado** de la API de Meta
4. **Contactar al equipo** de desarrollo

---

## 📝 Notas de Versión

### v1.0.0 (Actual)
- Gestión multi-empresa completa
- Envío masivo optimizado
- Estadísticas detalladas
- Interface de administración
- Soporte para plantillas

### Próximas Características

- [ ] Chatbot multi-idioma
- [ ] Integración con IA para respuestas
- [ ] Análisis predictivo de engagement
- [ ] Integración con más plataformas de mensajería

---

**Última actualización**: Octubre 2024  
**Versión**: 1.0.0  
**Compatibilidad**: StaffHub v2.0+