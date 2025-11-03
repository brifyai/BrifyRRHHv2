# Documentación Completa del Sistema Multi-Empresa

## 📋 Tabla de Contenidos

1. [Overview](#overview)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes Principales](#componentes-principales)
4. [Base de Datos](#base-de-datos)
5. [Servicios](#servicios)
6. [Componentes de UI](#componentes-de-ui)
7. [Configuración y Despliegue](#configuración-y-despliegue)
8. [Guía de Implementación](#guía-de-implementación)
9. [API Reference](#api-reference)
10. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## 🎯 Overview

El Sistema Multi-Empresa es una solución completa para agencias que necesitan gestionar múltiples clientes con configuraciones independientes, control de costos, facturación y aislamiento completo de datos.

### Características Principales

- ✅ **Gestión de Agencias**: Sistema completo para manejar múltiples agencias
- ✅ **Múltiples Clientes**: Soporte ilimitado de empresas por agencia
- ✅ **Configuración Independiente**: Canales y credenciales separadas por empresa
- ✅ **Control de Límites**: Límites diarios y mensuales personalizables
- ✅ **Sistema de Facturación**: Facturación automática por empresa
- ✅ **Aislamiento de Datos**: Row Level Security (RLS) completo
- ✅ **WhatsApp Multi-Empresa**: Números independientes por cliente
- ✅ **Analytics Avanzado**: Estadísticas y reportes detallados
- ✅ **Gestión de Roles**: Control de acceso basado en roles por empresa

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ MultiCompany    │  │ Analytics       │  │ WhatsApp      │ │
│  │ Dashboard       │  │ Dashboard       │  │ Config        │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ MultiCompany    │  │ Analytics       │  │ MultiWhatsApp │ │
│  │ Management      │  │ Services        │  │ Service       │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Company Channel │  │ Company Reports │  │ Billing       │ │
│  │ Credentials     │  │ Services        │  │ Services      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Supabase (PostgreSQL)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Agencies        │  │ Companies       │  │ Usage Logs    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Channel Creds   │  │ WhatsApp Config │  │ Invoices      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Company Users   │  │ Company Roles   │  │ Notifications │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Usuario autenticado** → Frontend
2. **Frontend** → Services (API calls)
3. **Services** → Supabase (con RLS)
4. **Supabase** → Validación y almacenamiento
5. **Notificaciones** → Usuario (email, dashboard, etc.)

---

## 🧩 Componentes Principales

### 1. Gestión de Agencias
- **Agencies**: Tabla principal para agencias
- **Configuración de límites**: Definición de límites por defecto
- **Plan types**: Diferentes planes para agencias

### 2. Gestión de Empresas/Clientes
- **Companies**: Empresas/clientes por agencia
- **Configuración independiente**: Canales y credenciales separadas
- **Límites personalizados**: Diarios y mensuales por empresa

### 3. Sistema de Canales
- **Email**: Configuración SMTP por empresa
- **SMS**: Proveedores independientes
- **WhatsApp**: Números separados por cliente
- **Telegram**: Bots independientes
- **Otros**: Groq, Google, Microsoft, etc.

### 4. Control de Uso y Costos
- **Límites en tiempo real**: Validación antes de envío
- **Contadores diarios/mensuales**: Tracking automático
- **Costos por mensaje**: Configurables por canal
- **Alertas de límites**: Notificaciones automáticas

### 5. Sistema de Facturación
- **Facturación automática**: Generación periódica
- **Múltiples ciclos**: Semanal, mensual, trimestral, etc.
- **Impuestos configurables**: Por país/agencia
- **Múltiples monedas**: Soporte internacional

---

## 🗄️ Base de Datos

### Estructura Principal

#### Tablas Principales

1. **agencies**
   - Información de agencias
   - Configuración de límites por defecto
   - Planes y suscripciones

2. **companies**
   - Empresas/clientes
   - Configuración de canales
   - Límites y costos personalizados

3. **company_channel_credentials**
   - Credenciales por canal y empresa
   - Configuración específica
   - Estados de conexión

4. **whatsapp_configs**
   - Configuración de WhatsApp por empresa
   - Números y tokens de Meta
   - Estadísticas de uso

5. **company_usage_logs**
   - Logs detallados de uso
   - Costos por mensaje
   - Metadata adicional

6. **company_invoices**
   - Facturas por empresa
   - Detalles de cobro
   - Estados de pago

#### Tablas de Soporte

7. **company_roles**
   - Roles por empresa
   - Permisos específicos
   - Roles de sistema

8. **company_users**
   - Usuarios por empresa
   - Asignación de roles
   - Control de acceso

9. **company_notifications**
   - Notificaciones por empresa
   - Alertas de límites
   - Recordatorios de pago

10. **company_integrations**
    - Integraciones externas
    - Webhooks y APIs
    - Sincronización de datos

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas que aseguran:
- **Aislamiento completo**: Las empresas solo ven sus datos
- **Control por agencia**: Las agencias solo ven sus empresas
- **Jerarquía de permisos**: Admins pueden ver todo, usuarios solo su empresa

### Índices Optimizados

Índices estratégicos para consultas frecuentes:
- Por company_id en todas las tablas
- Por status y fechas
- Compuestos para búsquedas complejas
- Para analytics y reportes

---

## 🔧 Servicios

### 1. MultiCompanyManagementService

**Archivo**: `src/services/multiCompanyManagementService.js`

**Funcionalidades**:
- Gestión de empresas/clientes
- Control de límites y costos
- Generación de facturas
- Estadísticas de uso

**Métodos principales**:
```javascript
// Crear empresa
await multiCompanyManagementService.createCompany(companyData, agencyId);

// Verificar límites
const limits = await multiCompanyManagementService.checkMessageLimits(companyId, messageCount);

// Registrar uso
await multiCompanyManagementService.recordUsage(companyId, usageData);

// Generar factura
const invoice = await multiCompanyManagementService.generateInvoice(companyId);
```

### 2. MultiWhatsAppService

**Archivo**: `src/services/multiWhatsAppService.js`

**Funcionalidades**:
- Configuración de WhatsApp por empresa
- Rate limiting por número
- Estadísticas de uso
- Gestión de templates

**Métodos principales**:
```javascript
// Configurar WhatsApp para empresa
await multiWhatsAppService.configureWhatsAppForCompany(companyId, config);

// Enviar mensaje
await multiWhatsAppService.sendMessage(companyId, messageData);

// Obtener estadísticas
const stats = await multiWhatsAppService.getCompanyStats(companyId);
```

### 3. CompanyChannelCredentialsService

**Archivo**: `src/services/companyChannelCredentialsService.js`

**Funcionalidades**:
- Gestión de credenciales por canal
- Validación de conexiones
- Fallback a configuración global
- Encriptación de datos

**Métodos principales**:
```javascript
// Obtener credenciales
const credentials = await companyChannelCredentialsService.getChannelCredentials(companyId, channelType);

// Guardar credenciales
await companyChannelCredentialsService.saveChannelCredentials(companyId, channelType, credentials);

// Validar conexión
const isValid = await companyChannelCredentialsService.validateConnection(companyId, channelType);
```

### 4. Analytics Services

**Archivos**: 
- `src/services/analyticsInsightsService.js`
- `src/services/realTimeStatsService.js`
- `src/services/companyReportsService.js`

**Funcionalidades**:
- Análisis con IA (Groq)
- Estadísticas en tiempo real
- Reportes comparativos
- Insights inteligentes

---

## 🎨 Componentes de UI

### 1. MultiCompanyDashboard

**Archivo**: `src/components/agency/MultiCompanyDashboard.js`

**Características**:
- Vista completa de empresas
- Estadísticas de la agencia
- Gestión de límites
- Acciones rápidas

**Funcionalidades**:
- Crear/editar empresas
- Suspender/reactivar
- Generar facturas
- Ver detalles

### 2. AnalyticsDashboard

**Archivo**: `src/components/analytics/AnalyticsDashboard.js`

**Características**:
- Gráficos interactivos
- Datos en tiempo real
- Insights con IA
- Exportación de datos

### 3. WhatsApp Configuration

**Archivos**: 
- `src/components/whatsapp/WhatsAppOnboarding.js`
- Componentes específicos por empresa

**Características**:
- Onboarding guiado
- Validación de conexión
- Gestión de templates
- Estadísticas por número

---

## ⚙️ Configuración y Despliegue

### 1. Configuración de Base de Datos

**Ejecutar script**:
```bash
# En Supabase SQL Editor
psql -h your-host -U your-user -d your-database < create-multi-company-database.sql
```

**Variables de entorno**:
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp
META_API_VERSION=v18.0
WHATSAPP_WEBHOOK_SECRET=your_webhook_secret

# Analytics
GROQ_API_KEY=your_groq_api_key

# Email (para facturas)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

### 2. Configuración de RLS

**Políticas por defecto**:
- Usuarios autenticados pueden leer/escribir
- Aislamiento por company_id
- Admins tienen acceso completo

**Personalización**:
```sql
-- Ejemplo: Política específica para empresa
CREATE POLICY "Company users can read their company data" ON companies
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM company_users 
            WHERE company_id = companies.id AND is_active = true
        )
    );
```

### 3. Configuración de Webhooks

**WhatsApp Webhook**:
```javascript
// Endpoint: /api/whatsapp/webhook/{companyId}
// Método: POST
// Headers: X-Hub-Signature-256

app.post('/api/whatsapp/webhook/:companyId', async (req, res) => {
    const { companyId } = req.params;
    const signature = req.headers['x-hub-signature-256'];
    
    // Validar firma
    if (!validateWebhookSignature(signature, req.body, companyId)) {
        return res.status(401).send('Unauthorized');
    }
    
    // Procesar mensaje
    await processWhatsAppMessage(companyId, req.body);
    
    res.status(200).send('OK');
});
```

---

## 📖 Guía de Implementación

### Paso 1: Preparación

1. **Crear proyecto en Supabase**
2. **Ejecutar script SQL**
3. **Configurar variables de entorno**
4. **Instalar dependencias**

```bash
npm install @supabase/supabase-js @heroicons/react chart.js react-chartjs-2
```

### Paso 2: Configuración de Servicios

1. **Configurar Supabase client**
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

2. **Configurar servicios**
```javascript
// src/services/index.js
import multiCompanyManagementService from './multiCompanyManagementService';
import multiWhatsAppService from './multiWhatsAppService';
import companyChannelCredentialsService from './companyChannelCredentialsService';

export {
    multiCompanyManagementService,
    multiWhatsAppService,
    companyChannelCredentialsService
};
```

### Paso 3: Implementación de UI

1. **Crear ruta principal**
```javascript
// App.js
import MultiCompanyDashboard from './components/agency/MultiCompanyDashboard';

<Route path="/agency/:agencyId/dashboard" element={<MultiCompanyDashboard />} />
```

2. **Implementar middleware de autenticación**
```javascript
// src/components/auth/ProtectedRoute.js
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" />;
    if (requiredRole && !hasRole(user, requiredRole)) return <Navigate to="/unauthorized" />;
    
    return children;
};
```

### Paso 4: Testing

1. **Tests unitarios**
```javascript
// __tests__/multiCompany.test.js
import multiCompanyManagementService from '../src/services/multiCompanyManagementService';

test('should create company successfully', async () => {
    const companyData = {
        name: 'Test Company',
        rut: '12.345.678-9',
        contact_email: 'test@example.com'
    };
    
    const result = await multiCompanyManagementService.createCompany(companyData, 'agency-id');
    
    expect(result.success).toBe(true);
    expect(result.company.name).toBe('Test Company');
});
```

2. **Tests de integración**
```javascript
// __tests__/integration.test.js
test('should send WhatsApp message with company config', async () => {
    // Configurar empresa
    await multiWhatsAppService.configureWhatsAppForCompany(companyId, whatsappConfig);
    
    // Enviar mensaje
    const result = await multiWhatsAppService.sendMessage(companyId, {
        to: '+56912345678',
        message: 'Test message'
    });
    
    expect(result.success).toBe(true);
});
```

---

## 📚 API Reference

### MultiCompanyManagementService

#### `createCompany(companyData, agencyId)`

**Descripción**: Crea una nueva empresa para una agencia

**Parámetros**:
- `companyData` (Object): Datos de la empresa
- `agencyId` (String): ID de la agencia

**Retorna**: Promise<Object>
```javascript
{
    success: boolean,
    company: Object,
    message: string
}
```

**Ejemplo**:
```javascript
const result = await multiCompanyManagementService.createCompany({
    name: 'Mi Empresa',
    rut: '76.123.456-7',
    contact_email: 'contacto@miempresa.cl',
    monthlyLimit: 2000,
    dailyLimit: 100
}, 'agency-uuid');
```

#### `checkMessageLimits(companyId, messageCount)`

**Descripción**: Verifica si una empresa puede enviar mensajes

**Parámetros**:
- `companyId` (String): ID de la empresa
- `messageCount` (Number): Cantidad de mensajes a verificar

**Retorna**: Promise<Object>
```javascript
{
    canSend: boolean,
    reason?: string,
    dailyRemaining?: number,
    monthlyRemaining?: number,
    estimatedCost?: number
}
```

#### `recordUsage(companyId, usageData)`

**Descripción**: Registra uso de mensajes para una empresa

**Parámetros**:
- `companyId` (String): ID de la empresa
- `usageData` (Object): Datos del uso

**Retorna**: Promise<Object>
```javascript
{
    success: boolean,
    usage: Object,
    actualCost: number,
    message: string
}
```

### MultiWhatsAppService

#### `configureWhatsAppForCompany(companyId, config)`

**Descripción**: Configura WhatsApp para una empresa

**Parámetros**:
- `companyId` (String): ID de la empresa
- `config` (Object): Configuración de WhatsApp

**Retorna**: Promise<Object>
```javascript
{
    success: boolean,
    config: Object,
    message: string
}
```

#### `sendMessage(companyId, messageData)`

**Descripción**: Envía mensaje de WhatsApp

**Parámetros**:
- `companyId` (String): ID de la empresa
- `messageData` (Object): Datos del mensaje

**Retorna**: Promise<Object>
```javascript
{
    success: boolean,
    messageId?: string,
    status?: string,
    error?: string
}
```

---

## 🔒 Consideraciones de Seguridad

### 1. Row Level Security (RLS)

**Implementación completa**:
- Todas las tablas con RLS habilitado
- Políticas granulares por rol
- Validación de company_id en todas las consultas

**Best practices**:
```sql
-- Siempre incluir company_id en consultas
SELECT * FROM companies WHERE company_id = current_setting('app.current_company_id');

-- Validar pertenencia a empresa
CREATE POLICY "Users can only access their company data" ON table_name
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );
```

### 2. Encriptación de Datos

**Credenciales sensibles**:
```javascript
// Usar Supabase Vault para credenciales
const { data, error } = await supabase
    .from('company_channel_credentials')
    .update({
        credentials: supabase.rpc('encrypt_sensitive_data', { data: credentials })
    })
    .eq('company_id', companyId);
```

### 3. Validación de Entrada

**Sanitización de datos**:
```javascript
// Validar RUT chileno
function validateChileanRUT(rut) {
    const cleanRut = rut.replace(/[^\dKk]/g, '');
    // Implementar algoritmo de validación
    return isValidRUT(cleanRut);
}

// Validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
```

### 4. Rate Limiting

**Implementación por empresa**:
```javascript
// Middleware de rate limiting
app.use('/api/messages', async (req, res, next) => {
    const companyId = req.headers['x-company-id'];
    const limits = await getCompanyLimits(companyId);
    
    if (limits.remaining <= 0) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    next();
});
```

---

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error: "Company not found"

**Causa**: El usuario no tiene permisos para acceder a la empresa

**Solución**:
```sql
-- Verificar asignación de usuario a empresa
SELECT * FROM company_users 
WHERE user_id = auth.uid() AND company_id = 'company-uuid';

-- Verificar estado del usuario
SELECT is_active FROM company_users 
WHERE user_id = auth.uid();
```

#### 2. Error: "Rate limit exceeded"

**Causa**: La empresa alcanzó su límite diario/mensual

**Solución**:
```javascript
// Verificar límites actuales
const limits = await multiCompanyManagementService.checkMessageLimits(companyId, 1);
console.log('Daily remaining:', limits.dailyRemaining);
console.log('Monthly remaining:', limits.monthlyRemaining);

// Aumentar límites si es necesario
await multiCompanyManagementService.updateCompany(companyId, {
    daily_limit: newLimit,
    monthly_limit: newMonthlyLimit
}, agencyId);
```

#### 3. Error: "WhatsApp configuration not found"

**Causa**: La empresa no tiene WhatsApp configurado

**Solución**:
```javascript
// Configurar WhatsApp para la empresa
await multiWhatsAppService.configureWhatsAppForCompany(companyId, {
    accessToken: 'your-access-token',
    phoneNumberId: 'your-phone-number-id',
    phoneNumber: '+56912345678'
});
```

#### 4. Error: "RLS policy violation"

**Causa**: Las políticas RLS están bloqueando el acceso

**Solución**:
```sql
-- Revisar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('companies', 'company_users', 'company_channel_credentials');

-- Verificar configuración actual
SELECT current_setting('request.jwt.claims', true);
```

### Debug Tools

#### 1. Logs de Supabase
```sql
-- Activar logs detallados
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 0;
SELECT pg_reload_conf();
```

#### 2. Debug en frontend
```javascript
// Activar debug mode
localStorage.setItem('debug', 'multi-company:*');

// Verificar estado actual
console.log('Current company:', localStorage.getItem('currentCompanyId'));
console.log('User permissions:', localStorage.getItem('userPermissions'));
```

---

## ❓ FAQ

### Preguntas Frecuentes

#### 1. ¿Cómo puedo agregar un nuevo canal de comunicación?

**Respuesta**: 
1. Agregar el canal a la tabla `company_channel_credentials`
2. Implementar el servicio específico del canal
3. Agregar soporte en el UI
4. Actualizar las políticas RLS

```javascript
// Ejemplo: Agregar canal "slack"
const slackConfig = {
    channelType: 'slack',
    credentials: {
        botToken: 'xoxb-your-token',
        signingSecret: 'your-secret'
    }
};

await companyChannelCredentialsService.saveChannelCredentials(companyId, 'slack', slackConfig);
```

#### 2. ¿Cómo funciona la facturación automática?

**Respuesta**: 
- Se configura un cron job que se ejecuta según el ciclo de facturación
- El sistema genera facturas automáticamente
- Envía notificaciones por email
- Puedes personalizar plantillas y monedas

```javascript
// Configurar facturación automática
await multiCompanyManagementService.updateCompany(companyId, {
    billing_cycle: 'monthly',
    billing_email: 'billing@company.com',
    auto_generate_invoices: true
}, agencyId);
```

#### 3. ¿Puedo tener diferentes roles por empresa?

**Respuesta**: Sí, el sistema soporta roles específicos por empresa:
- Roles de sistema (admin, manager, user)
- Roles personalizados por empresa
- Permisos granulares por funcionalidad

```sql
-- Crear rol personalizado
INSERT INTO company_roles (company_id, name, description, permissions)
VALUES (
    'company-uuid',
    'marketing_manager',
    'Gestor de marketing',
    '["send_messages", "view_reports", "manage_templates"]'
);
```

#### 4. ¿Cómo se maneja la escalabilidad?

**Respuesta**: 
- Base de datos optimizada con índices
- Cache en servicios (5 minutos)
- Rate limiting por empresa
- Arquitectura microservicios lista
- Soporte para horizontal scaling

#### 5. ¿Es compatible con proveedores locales chilenos?

**Respuesta**: Sí, el sistema está diseñado para Chile:
- Validación de RUT chileno
- Formato de moneda CLP
- Impuestos (IVA 19%)
- Proveedores locales de SMS y email
- Cumplimiento de normativa local

---

## 📈 Métricas y Monitoring

### KPIs del Sistema

#### 1. Métricas de Uso
- Mensajes enviados por empresa
- Costos acumulados
- Límites alcanzados
- Canales más utilizados

#### 2. Métricas de Performance
- Tiempo de respuesta de API
- Uso de base de datos
- Cache hit rate
- Error rate por servicio

#### 3. Métricas de Negocio
- Empresas activas vs inactivas
- Revenue por agencia
- Churn rate
- Customer satisfaction

### Monitoring Setup

```javascript
// Ejemplo: Configurar monitoring
import { monitorPerformance } from './utils/monitoring';

// Monitorear uso de servicios
monitorPerformance('multiCompanyManagementService', async () => {
    return await multiCompanyManagementService.getAgencyCompanies(agencyId);
});

// Alertas automáticas
if (usagePercentage > 90) {
    await sendAlert({
        type: 'limit_warning',
        companyId,
        message: `Company ${companyName} has reached ${usagePercentage}% of their limit`
    });
}
```

---

## 🚀 Futuras Mejoras

### Roadmap

#### Version 2.0 (Próximo trimestre)
- [ ] Soporte para múltiples monedas
- [ ] Integración con payment gateways
- [ ] Advanced analytics con ML
- [ ] Mobile app para agencias

#### Version 2.1 (Sig. trimestre)
- [ ] White-label options
- [ ] API pública para partners
- [ ] Advanced workflows
- [ ] Custom integrations marketplace

#### Version 3.0 (Mediano plazo)
- [ ] Multi-region support
- [ ] Enterprise features
- [ ] Advanced security features
- [ ] AI-powered automation

### Contribuciones

El sistema es modular y extensible. Para contribuir:

1. **Fork del repositorio**
2. **Crear feature branch**
3. **Implementar con tests**
4. **Documentar cambios**
5. **Submit Pull Request**

---

## 📞 Soporte

### Contacto
- **Email**: support@brify.cl
- **Documentation**: https://docs.brify.cl
- **Status Page**: https://status.brify.cl
- **Community**: https://community.brify.cl

### Niveles de Soporte
- **Basic**: Email y documentación
- **Pro**: Chat y soporte prioritario
- **Enterprise**: Dedicated support y SLA

---

## 📄 Licencia

Este software está bajo licencia MIT. Ver archivo LICENSE para más detalles.

---

**Última actualización**: 20 de Octubre de 2025
**Versión**: 1.0.0
**Autores**: Brify Development Team