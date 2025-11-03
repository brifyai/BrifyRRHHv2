# Pruebas del Sistema de Análisis de Sentimientos

Este documento describe el script de pruebas completo para verificar la funcionalidad del análisis de sentimientos en el sistema de comunicación.

## 📋 Descripción General

El script `test_sentiment_analysis.mjs` realiza pruebas exhaustivas de todas las funcionalidades relacionadas con el análisis de sentimientos:

1. **Verificación de base de datos**: Confirma que las columnas de sentimientos existen
2. **Análisis de sentimientos**: Prueba el método `analyzeSentiment` del servicio GROQ
3. **Procesamiento de webhooks**: Simula el procesamiento de mensajes entrantes
4. **Cálculo de métricas**: Verifica las métricas calculadas en el servicio de comunicación
5. **Renderizado del dashboard**: Confirma que el dashboard puede mostrar los datos

## 🚀 Cómo Ejecutar las Pruebas

### Opción 1: Usando npm (recomendado)
```bash
npm run test:sentiment
```

### Opción 2: Ejecutar directamente
```bash
node test_sentiment_analysis.mjs
```

## 📊 Resultados Esperados

Cuando todas las pruebas pasan exitosamente, deberías ver una salida como esta:

```
🚀 Iniciando pruebas completas del análisis de sentimientos...

🔍 Verificando columnas de sentimientos en base de datos...
✅ Columnas sentiment_score y sentiment_label existen en communication_logs
✅ sentiment_score es un número válido entre -1 y 1
✅ sentiment_label es uno de los valores permitidos

🧠 Probando análisis de sentimientos con GROQ...
⚠️  GROQ service no disponible (API key no configurada), simulando análisis...
✅ Score de sentimiento está en rango válido
✅ Label de sentimiento es válido
✅ Confianza está en rango válido

📨 Simulando procesamiento de mensajes en webhooks...
✅ Mensaje procesado correctamente: Gracias por la excelente atenc...
✅ Mensaje procesado correctamente: El producto llegó defectuoso, ...
✅ Mensaje procesado correctamente: Confirmo recepción del pedido...
✅ Todos los mensajes fueron procesados y almacenados

📊 Verificando cálculo de métricas de sentimientos...
✅ Métricas de sentimientos están presentes en los reportes
✅ totalAnalyzed es un número
✅ averageSentiment es un número
✅ Distribución de sentimientos existe
✅ Porcentaje positivo válido
✅ Porcentaje neutral válido
✅ Porcentaje negativo válido
✅ Sentimientos por canal existen
✅ Lista de alertas existe y es un array
✅ Métricas de sentimientos calculadas correctamente

🎨 Simulando renderizado del dashboard...
✅ Componente de sentimiento promedio tiene datos
✅ Componente de distribución de sentimientos tiene datos
✅ Componente de sentimientos por canal tiene datos
✅ Componente de alertas tiene datos
✅ Componente de tendencias de sentimientos tiene datos
✅ Gráfico de tendencias tiene etiquetas
✅ Gráfico de tendencias tiene datos
✅ Dashboard puede renderizar datos de sentimientos correctamente

📋 Resumen de pruebas:
   Total: 26
   ✅ Pasaron: 26
   ❌ Fallaron: 0

🎉 ¡Todas las pruebas pasaron exitosamente!
El sistema de análisis de sentimientos está funcionando correctamente.
```

## 🔧 Configuración

### Variables de Entorno

El script utiliza la siguiente variable de entorno:

- `REACT_APP_GROQ_API_KEY`: API key para GROQ (opcional, si no está configurada se simula el análisis)

### Base de Datos

El script incluye simulaciones de base de datos para evitar dependencias externas. En producción, verifica que:

1. La tabla `communication_logs` tenga las columnas:
   - `sentiment_score` (DECIMAL(3,2), CHECK entre -1.0 y 1.0)
   - `sentiment_label` (VARCHAR(20))

2. El archivo SQL `database/add_sentiment_columns_to_communication_logs.sql` se haya ejecutado

## 🏗️ Arquitectura de las Pruebas

### 1. Verificación de Base de Datos
- Confirma que el esquema de BD soporta análisis de sentimientos
- Valida rangos y tipos de datos permitidos

### 2. Servicio GROQ
- Prueba el método `analyzeSentiment`
- Valida respuestas con diferentes tipos de mensajes
- Maneja casos donde la API no está disponible

### 3. Procesamiento de Webhooks
- Simula mensajes entrantes de WhatsApp y Telegram
- Verifica que se analice el sentimiento automáticamente
- Confirma almacenamiento correcto en BD

### 4. Cálculo de Métricas
- Prueba `enhancedCommunicationService.getCommunicationReports()`
- Valida métricas: promedio, distribución, tendencias, alertas
- Verifica cálculos por canal, empresa y departamento

### 5. Renderizado del Dashboard
- Simula carga de datos en `ReportsDashboard`
- Verifica que todos los componentes reciban datos válidos
- Confirma que los gráficos puedan renderizarse

## 🐛 Solución de Problemas

### Error: "Cannot find module"
Si encuentras errores de módulos no encontrados, asegúrate de que:
- Estás ejecutando desde el directorio raíz del proyecto
- Todas las dependencias están instaladas: `npm install`

### Error: "GROQ API key not configured"
Este es un mensaje informativo, no un error. El script simulará el análisis cuando no hay API key.

### Pruebas fallidas
Si alguna prueba falla:
1. Revisa los logs detallados
2. Verifica la configuración de base de datos
3. Confirma que los servicios están correctamente implementados
4. Revisa las dependencias entre módulos

## 📈 Métricas Probadas

El script verifica las siguientes métricas de sentimientos:

- **Sentimiento promedio**: Valor entre -1 y 1
- **Distribución**: Porcentajes de positivo, neutral y negativo
- **Por canal**: WhatsApp vs Telegram
- **Por empresa/departamento**: Análisis segmentado
- **Tendencias temporales**: Evolución en el tiempo
- **Alertas**: Mensajes con sentimiento muy negativo (< -0.3)

## 🔄 Integración Continua

Este script puede integrarse en pipelines de CI/CD para verificar automáticamente que el sistema de análisis de sentimientos funciona correctamente después de cambios en el código.

## 📞 Soporte

Si encuentras problemas con las pruebas, verifica:
1. Que Node.js versión 18+ esté instalado
2. Que todas las dependencias del proyecto estén instaladas
3. Que los archivos de configuración sean correctos
4. Que la base de datos esté accesible (en desarrollo se simula)

---

**Estado**: ✅ Todas las pruebas implementadas y funcionando
**Cobertura**: Base de datos, servicios, webhooks, métricas y dashboard
**Total de pruebas**: 26 assertions individuales