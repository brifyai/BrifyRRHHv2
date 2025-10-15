# Sistema de Comunicación Interna

## Descripción General

Este sistema permite la comunicación interna masiva a través de WhatsApp y Telegram con capacidades avanzadas de filtrado. Está diseñado para empresas como Ariztia, Inchcape, Achs, Arcoprime, Grupo Saesa, Colbun, AFP Habitat, Copec, Antofagasta Minerals, Vida Cámara, Enaex, SQM, CMPC, Corporación Chilena - Alemana, Hogar Alemán y Empresas SB.

## Características Principales

### 1. Base de Datos de Empleados
- Almacena información estructurada de todos los empleados
- Incluye filtros por:
  - Región y sucursal
  - Departamento y equipo
  - Nivel jerárquico y cargo
  - Modalidad de trabajo y tipo de contrato
  - Proyectos y habilidades
  - Intereses personales

### 2. Sistema de Filtrado Avanzado
Permite crear segmentos específicos de empleados para comunicaciones dirigidas:
- Filtros combinados (AND/OR)
- Búsqueda por texto libre
- Selección por categorías múltiples

### 3. Envío de Mensajes
- Integración con WhatsApp Business API
- Integración con Telegram Bot API
- Plantillas de mensajes predefinidas
- Programación de envíos

### 4. Seguimiento y Estadísticas
- Tasa de entrega y lectura
- Histórico de comunicaciones
- Reportes de engagement

## Estructura de la Base de Datos

### Tablas Principales

1. **employees** - Información detallada de empleados
2. **companies** - Empresas clientes
3. **projects** - Proyectos temporales
4. **skills** - Habilidades certificadas
5. **interests** - Intereses personales
6. **communication_logs** - Registro de mensajes enviados

## Filtros Disponibles

### Estructurales y Geográficos
- Región (Ej: Región Metropolitana, Región de Valparaíso)
- Sucursal / Oficina Específica
- País
- Zona Horaria

### Funcionales y Departamentales
- Departamento (Recursos Humanos, Ventas, Marketing, etc.)
- Área o Equipo Específico
- Unidad de Negocio

### Rol y Jerarquía
- Nivel Jerárquico (Directores, Gerentes, Jefaturas, etc.)
- Cargo Específico
- Personal a Cargo

### Administrativos y Ciclo de Vida
- Modalidad de Trabajo (Presencial, Híbrido, Remoto)
- Tipo de Contrato (Indefinido, Plazo Fijo, etc.)
- Antigüedad
- Fecha de Aniversario Laboral
- Fecha de Cumpleaños

### Proyectos y Equipos Temporales
- Nombre del Proyecto
- Equipo Interdepartamental

### Habilidades e Intereses
- Habilidades Certificadas
- Participación en Comités
- Intereses (recogidos por encuestas)

## Ejemplo de Uso

### Caso: Nuevo Beneficio Dental

**Requisitos:**
- Solo para Región Metropolitana
- Solo para trabajadores con contrato indefinido
- Información diferente para gerentes

**Solución:**
1. **Comunicación para Colaboradores:**
   - Filtros: Región = "Metropolitana" Y Tipo de Contrato = "Indefinido" Y Nivel Jerárquico!= "Gerente"
   - Mensaje: "¡Buenas noticias! A partir de hoy tienes acceso a un nuevo beneficio dental..."

2. **Comunicación para Gerentes:**
   - Filtros: Región = "Metropolitana" Y Tipo de Contrato = "Indefinido" Y Nivel Jerárquico = "Gerente"
   - Mensaje: "Líderes: Estamos lanzando el nuevo beneficio dental para sus equipos..."

## Implementación Técnica

### Frontend (React)
- Componentes reutilizables
- Sistema de enrutamiento
- Estado gestionado con Context API

### Backend (Supabase)
- Base de datos PostgreSQL
- Funciones personalizadas
- Políticas de seguridad (RLS)

### APIs de Mensajería
- WhatsApp Business API para envíos masivos
- Telegram Bot API para comunicaciones

## Seguridad y Privacidad

- Autenticación de usuarios
- Control de acceso basado en roles
- Cifrado de datos en tránsito y en reposo
- Cumplimiento de GDPR y leyes locales

## Próximos Pasos

1. Implementar la conexión real con WhatsApp Business API
2. Implementar la conexión real con Telegram Bot API
3. Agregar funcionalidad de programación de mensajes
4. Desarrollar reportes avanzados de estadísticas
5. Implementar notificaciones en tiempo real