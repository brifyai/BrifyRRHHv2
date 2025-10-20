# Guía de Implementación: Orden de Fallback Personalizable

## 🎯 Objetivo
Implementar un sistema de orden de fallback de comunicación personalizable por empresa, permitiendo que cada organización defina su propio orden preferido para los canales de comunicación (WhatsApp, Telegram, SMS, Email).

## ✅ Implementación Completada

### 1. Componentes Modificados

#### `src/components/communication/SendMessages.js`
- ✅ Agregada función `getCompanyFallbackConfig()` para obtener configuración dinámica
- ✅ Modificada función `handleSendWithFallback()` para usar orden personalizado
- ✅ Actualizada UI para mostrar el orden real de fallback en el modal de confirmación

#### `src/services/communicationService.js`
- ✅ Modificado método `sendWithFallback()` para aceptar parámetro `fallbackOrder`
- ✅ Actualizado método `groupEmployeesByChannel()` para usar orden personalizado
- ✅ Implementada lógica inteligente de asignación de canales por empleado

#### `src/components/settings/CompanyForm.js`
- ✅ Agregada interfaz completa para configurar orden de fallback
- ✅ Implementadas funciones `moveChannelUp()`, `moveChannelDown()`, `resetFallbackOrder()`
- ✅ Integrado estado `fallbackOrder` con actualización en tiempo real
- ✅ Agregados iconos y UI intuitiva para reordenamiento

### 2. Base de Datos

#### Schema Requerido
```sql
-- Columna a agregar en la tabla companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS fallback_config JSONB DEFAULT '{"order": ["WhatsApp", "Telegram", "SMS", "Email"]}';

-- Actualizar empresas existentes
UPDATE companies 
SET fallback_config = '{"order": ["WhatsApp", "Telegram", "SMS", "Email"]}' 
WHERE fallback_config IS NULL;

-- Índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_companies_fallback_config ON companies USING GIN (fallback_config);

-- Comentario
COMMENT ON COLUMN companies.fallback_config IS 'Configuración del orden de fallback para canales de comunicación';
```

## 🚀 Pasos para Completar la Implementación

### Paso 1: Ejecutar Migración SQL

1. Acceda al panel de Supabase: https://supabase.com/dashboard
2. Seleccione su proyecto: `tmqglnycivlcjijoymwe`
3. Vaya a **SQL Editor**
4. Copie y ejecute el siguiente SQL:

```sql
-- Agregar columna fallback_config a la tabla companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS fallback_config JSONB DEFAULT '{"order": ["WhatsApp", "Telegram", "SMS", "Email"]}';

-- Actualizar empresas existentes con la configuración por defecto
UPDATE companies 
SET fallback_config = '{"order": ["WhatsApp", "Telegram", "SMS", "Email"]}' 
WHERE fallback_config IS NULL;

-- Crear índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_companies_fallback_config ON companies USING GIN (fallback_config);

-- Comentario sobre la columna
COMMENT ON COLUMN companies.fallback_config IS 'Configuración del orden de fallback para canales de comunicación';
```

### Paso 2: Verificar Migración

Ejecute el script de verificación:
```bash
node execute-fallback-migration.js
```

### Paso 3: Probar la Funcionalidad

1. **Configurar Orden de Fallback:**
   - Vaya a `http://localhost:3001/configuracion/empresas`
   - Seleccione una empresa existente o cree una nueva
   - En la sección "🔄 Orden de Fallback de Comunicación", use las flechas para reordenar los canales
   - Guarde los cambios

2. **Probar Envío con Fallback:**
   - Vaya a la sección de comunicación
   - Seleccione empleados
   - Redacte un mensaje
   - Use el botón "🔄 Fallback Inteligente"
   - Verifique que el modal muestra el orden personalizado

## 🔧 Funcionalidades Implementadas

### 1. Interfaz de Configuración
- ✅ Botones arriba/abajo para reordenar canales
- ✅ Botón de reset para restaurar orden por defecto
- ✅ Vista previa en tiempo real del orden
- ✅ Validación automática
- ✅ Guardado automático al enviar formulario

### 2. Lógica de Fallback Inteligente
- ✅ Respeta el canal principal seleccionado
- ✅ Usa orden personalizado para fallback
- ✅ Asigna empleados al mejor canal disponible
- ✅ Maneja casos donde empleados no tienen ciertos canales

### 3. Experiencia de Usuario
- ✅ Modal de confirmación muestra orden real
- ✅ Indicadores visuales claros
- ✅ Retroalimentación en tiempo real
- ✅ Manejo elegante de errores

## 📊 Estructura de Datos

### Formato de `fallback_config`
```json
{
  "order": ["WhatsApp", "Telegram", "SMS", "Email"]
}
```

### Ejemplos de Configuración
```json
// Empresa que prefiere Email primero
{
  "order": ["Email", "WhatsApp", "Telegram", "SMS"]
}

// Empresa que prefiere SMS
{
  "order": ["SMS", "WhatsApp", "Email", "Telegram"]
}
```

## 🔄 Flujo de Trabajo

1. **Configuración:** Administrador define orden en formulario de empresa
2. **Almacenamiento:** Configuración guardada en `companies.fallback_config`
3. **Recuperación:** Sistema obtiene configuración al enviar mensajes
4. **Ejecución:** Sistema usa orden personalizado para fallback inteligente

## 🛠️ Scripts y Herramientas

### `execute-fallback-migration.js`
- Verifica si la columna `fallback_config` existe
- Muestra instrucciones SQL si no existe
- Confirma estado de la migración

### `add_fallback_config_column.sql`
- Script SQL completo para la migración
- Incluye creación de columna, actualización de datos e índices

## 🎨 UI/UX Mejoras

### Iconos Utilizados
- **ArrowUpIcon:** Subir canal en el orden
- **ArrowDownIcon:** Bajar canal en el orden  
- **ArrowsUpDownIcon:** Reset al orden por defecto

### Colores y Estilos
- Verde para canales disponibles
- Gris para canales no disponibles
- Gradientes para mejor experiencia visual

## 🔍 Consideraciones Técnicas

### Performance
- Índice GIN en columna JSONB para consultas rápidas
- Caché de configuración a nivel de empresa
- Lazy loading de datos de empleados

### Seguridad
- Validación de datos en frontend y backend
- Sanitización de orden de canales
- Manejo de casos límite

### Escalabilidad
- Diseño modular para agregar nuevos canales
- Configuración flexible por empresa
- Compatibilidad con sistemas existentes

## 🚨 Errores Comunes y Soluciones

### Error: "column companies.fallback_config does not exist"
**Solución:** Ejecute el script SQL en el panel de Supabase

### Error: "No se encontraron empleados seleccionados"
**Solución:** Seleccione empleados desde la base de datos antes de enviar mensajes

### Error: "Configuración de fallback inválida"
**Solución:** Asegúrese que todos los canales estén presentes y no haya duplicados

## ✅ Checklist de Implementación

- [ ] Ejecutar migración SQL en Supabase
- [ ] Verificar migración con script de verificación
- [ ] Probar configuración en formulario de empresa
- [ ] Probar envío con fallback inteligente
- [ ] Verificar que el orden personalizado se respete
- [ ] Probar con diferentes empresas y configuraciones
- [ ] Validar manejo de errores y casos límite

## 🎉 Resultado Esperado

Una vez completada la implementación, cada empresa podrá:

1. **Personalizar** el orden de sus canales de comunicación
2. **Visualizar** el orden configurado en tiempo real
3. **Utilizar** automáticamente el orden personalizado en envíos con fallback
4. **Modificar** la configuración en cualquier momento
5. **Optimizar** la entrega de mensajes según sus preferencias

Esto proporciona una experiencia mucho más flexible y personalizada para la comunicación multi-canal.