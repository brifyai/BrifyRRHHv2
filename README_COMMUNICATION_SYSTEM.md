# Sistema de Comunicación Interna

## Descripción

Este sistema permite seleccionar empleados de una base de datos y enviar mensajes masivos a través de WhatsApp o Telegram. Los datos de empleados se generan en memoria sin necesidad de utilizar una base de datos real.

## Componentes Principales

### 1. Servicio en Memoria (inMemoryEmployeeService.js)

- Genera datos de empleados en memoria
- Crea 50 empleados por cada una de las 5 empresas predefinidas
- Incluye datos realistas de empleados chilenos con:
  - Nombres y apellidos comunes en Chile
  - Regiones chilenas
  - Departamentos empresariales
  - Niveles jerárquicos
  - Cargos
  - Modalidades de trabajo (Presencial, Híbrido, Remoto)
  - Tipos de contrato (Indefinido, Plazo Fijo, Honorarios)

### 2. Selector de Empleados (EmployeeSelector.js)

- Interfaz para seleccionar empleados de la base de datos
- Filtros por empresa, región, departamento, nivel, modalidad y tipo de contrato
- Visualización en tabla de empleados con sus datos de contacto
- Posibilidad de seleccionar/deseleccionar empleados individualmente o en grupo

### 3. Envío de Mensajes (SendMessages.js)

- Interfaz para crear y enviar mensajes masivos
- Campo de texto para escribir mensajes
- Posibilidad de adjuntar archivos (imágenes, videos, documentos)
- Envío por WhatsApp o Telegram
- Plantillas de mensajes predefinidas
- Confirmación de envío

### 4. Dashboard de Comunicación (WebrifyCommunicationDashboard.js)

- Panel principal del sistema de comunicación
- Navegación entre las diferentes secciones
- Métricas de uso del sistema

## Flujo de Uso

1. **Acceder al sistema**: Navegar a `/communication/database`
2. **Seleccionar empleados**: 
   - Usar los filtros para encontrar empleados específicos
   - Seleccionar empleados individualmente o en grupo
3. **Enviar mensajes**: 
   - Hacer clic en "Enviar Mensajes" con empleados seleccionados
   - Escribir el mensaje o seleccionar una plantilla
   - Adjuntar archivos si es necesario
   - Enviar por WhatsApp o Telegram

## Características

- **Sin base de datos**: Todos los datos se generan y almacenan en memoria
- **Datos realistas**: Información de empleados basada en datos chilenos reales
- **Filtrado avanzado**: Múltiples opciones para encontrar empleados específicos
- **Envío masivo**: Posibilidad de enviar mensajes a múltiples empleados simultáneamente
- **Soporte multimedia**: Envío de texto, imágenes, videos y documentos
- **Plantillas**: Mensajes predefinidos para situaciones comunes
- **Responsive**: Interfaz adaptable a diferentes dispositivos

## Empresas Incluidas

1. Constructora ABC
2. Minera XYZ
3. Agrícola DEF
4. Pesquera GHI
5. Forestal JKL

## Empleados por Empresa

Cada empresa incluye exactamente 50 empleados con datos generados aleatoriamente pero realistas.

## Tecnologías Utilizadas

- React.js
- React Router para navegación
- Tailwind CSS para estilos
- Heroicons para iconos

## Rutas Disponibles

- `/communication` - Dashboard principal
- `/communication/database` - Base de datos de empleados
- `/communication/send` - Envío de mensajes
- `/communication/templates` - Plantillas de mensajes
- `/communication/reports` - Reportes de comunicación

## Notas de Implementación

- Los datos se generan automáticamente al iniciar la aplicación
- No se requiere conexión a base de datos ni configuración adicional
- Los mensajes se simulan como enviados (no hay integración real con WhatsApp o Telegram)
- El sistema está diseñado para demostración y pruebas
