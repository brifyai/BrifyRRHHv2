# Cómo ejecutar la sincronización de datos de empleados

Este documento explica cómo ejecutar todos los scripts necesarios para sincronizar los datos de empleados con las cantidades mostradas en el dashboard.

## Requisitos previos

1. Acceso a la base de datos PostgreSQL con Supabase
2. Cliente psql instalado
3. Node.js instalado (para el script de inicialización)
4. Variables de entorno configuradas en `.env`

## Paso 1: Verificar la estructura de la base de datos

Primero, asegúrate de que la base de datos tiene la estructura correcta:

```bash
# Conectarse a la base de datos
psql -h <host> -p <puerto> -U <usuario> -d <nombre_base_datos>

# Verificar que existen las tablas necesarias
\dt companies
\dt employees
```

## Paso 2: Generar datos de empleados iniciales

Si no hay datos de empleados, ejecuta el script de inicialización:

```bash
# Ejecutar el script de inicialización
node setup_employee_data.js
```

## Paso 3: Verificar los datos generados

Ejecuta el script de verificación para asegurarte de que los datos se generaron correctamente:

```bash
# Conectarse a la base de datos
psql -h <host> -p <puerto> -U <usuario> -d <nombre_base_datos>

# Ejecutar el script de verificación
\i database/verify_employee_data.sql
```

## Paso 4: Sincronizar con el dashboard

Para sincronizar los datos con las cantidades del dashboard:

```bash
# Conectarse a la base de datos
psql -h <host> -p <puerto> -U <usuario> -d <nombre_base_datos>

# Ejecutar el script de sincronización
\i database/sync_employees_with_dashboard.sql
```

## Paso 5: Verificar la sincronización

Después de la sincronización, verifica que los datos coinciden:

```bash
# Ejecutar el script de verificación
\i database/verify_employee_data.sql
```

## Paso 6: Usar desde la interfaz web

1. Accede al dashboard en http://localhost:3002/dashboard
2. Verifica que el "Resumen por Empresa" muestra los datos correctos
3. Haz clic en el botón "Sincronizar" si es necesario
4. Accede a la base de datos de comunicación en http://localhost:3002/communication/database
5. Verifica que se muestran todos los empleados correctamente

## Scripts disponibles

### Generar datos de empleados realistas
```bash
# Generar datos para todas las empresas
psql -h <host> -p <puerto> -U <usuario> -d <nombre_base_datos> -f database/generate_real_employee_data.sql
```

### Sincronizar con el dashboard
```bash
# Sincronizar empleados con las cantidades del dashboard
psql -h <host> -p <puerto> -U <usuario> -d <nombre_base_datos> -f database/sync_employees_with_dashboard.sql
```

### Verificar datos
```bash
# Verificar que los datos son correctos
psql -h <host> -p <puerto> -U <usuario> -d <nombre_base_datos> -f database/verify_employee_data.sql
```

## Solución de problemas

### Error de conexión a la base de datos
1. Verifica que las variables de entorno están correctamente configuradas
2. Asegúrate de que el servicio de base de datos está corriendo
3. Verifica las credenciales de acceso

### No se generan empleados
1. Verifica que existen empresas en la tabla `companies`
2. Revisa los logs del script de inicialización
3. Asegúrate de que hay espacio suficiente en la base de datos

### Las cantidades no coinciden
1. Forzar sincronización desde la interfaz web
2. Verificar los scripts SQL de sincronización
3. Revisar los logs del servicio de empleados

## Mantenimiento regular

Se recomienda ejecutar la sincronización periódicamente:

```bash
# Ejecutar sincronización semanal
0 0 * * 0 psql -h <host> -p <puerto> -U <usuario> -d <nombre_base_datos> -f database/sync_employees_with_dashboard.sql
```

## Personalización

### Modificar cantidades por empresa
Edita el script `sync_employees_with_dashboard.sql` y modifica los valores en la tabla `desired_employee_counts`.

### Modificar datos generados
Edita el servicio `employeeDataService.js` y modifica las listas de nombres, departamentos, etc.

## Verificación automatizada

Para verificar automáticamente que todo funciona correctamente:

```bash
# Ejecutar verificación
node -e "
const { exec } = require('child_process');
exec('psql -h <host> -p <puerto> -U <usuario> -d <nombre_base_datos> -c \"SELECT COUNT(*) FROM employees;\"', (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Total de empleados:', stdout);
});
"
```