# Configuración del Entorno Local

## Requisitos Previos

1. Node.js (versión 14 o superior)
2. PostgreSQL (para desarrollo local)
3. Supabase CLI (opcional pero recomendado)

## Configuración de Variables de Entorno

1. Copia el archivo `.env.local` a `.env`:
   ```bash
   cp .env.local .env
   ```

2. Verifica que las variables de entorno estén correctamente configuradas:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`

## Configuración de la Base de Datos Local

### Opción 1: Usar Supabase Localmente (Recomendado)

1. Instala Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Inicia el proyecto de Supabase:
   ```bash
   supabase init
   ```

3. Inicia los servicios de Supabase:
   ```bash
   supabase start
   ```

4. Aplica el esquema de base de datos:
   ```bash
   supabase db reset
   ```

5. Ejecuta el script de configuración:
   ```bash
   supabase db push
   ```

### Opción 2: Usar PostgreSQL Local

1. Crea una base de datos en tu servidor PostgreSQL local:
   ```sql
   CREATE DATABASE brify_local;
   ```

2. Conéctate a la base de datos y ejecuta el script de configuración:
   ```bash
   psql -d brify_local -f database/local_setup.sql
   ```

## Iniciar la Aplicación

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```

## Datos de Prueba

La aplicación incluye datos de prueba para las siguientes empresas:
- Ariztia
- Inchcape
- Achs
- Arcoprime
- Grupo Saesa
- Colbun
- AFP Habitat
- Copec
- Antofagasta Minerals
- Vida Cámara
- Enaex

## Solución de Problemas

### Error: "relation 'public.companies' does not exist"

Este error indica que las tablas no han sido creadas en la base de datos. Asegúrate de:

1. Ejecutar el script `database/local_setup.sql` en tu base de datos
2. Verificar que las variables de entorno apunten a la base de datos correcta
3. Reiniciar la aplicación después de crear las tablas

### Error de Conexión a Supabase

1. Verifica que la URL de Supabase y la clave anónima sean correctas
2. Asegúrate de que los servicios de Supabase estén corriendo
3. Verifica que no haya problemas de firewall o red

## Modo de Desarrollo

Cuando la aplicación se ejecuta en `localhost`, utiliza datos mock para mostrar la interfaz correctamente. Esto permite trabajar en el frontend incluso cuando la base de datos no está disponible.

## Estructura de la Base de Datos

### Tablas Principales

1. **companies** - Información de las empresas clientes
2. **employees** - Datos de los empleados de cada empresa
3. **projects** - Proyectos temporales
4. **skills** - Habilidades certificadas
5. **interests** - Intereses personales
6. **employee_skills** - Relación muchos a muchos entre empleados y habilidades
7. **employee_interests** - Relación muchos a muchos entre empleados e intereses
8. **communication_logs** - Registro de mensajes enviados

## Contribuir

1. Realiza un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios
4. Confirma tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
5. Empuja la rama (`git push origin feature/nueva-funcionalidad`)
6. Crea un nuevo Pull Request