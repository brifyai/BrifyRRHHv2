# Sincronización de Datos de Empleados

Este documento explica cómo sincronizar los datos de empleados en la base de datos para que coincidan con las cantidades mostradas en el resumen por empresa del dashboard.

## Descripción

El sistema genera automáticamente datos de empleados realistas para cada empresa, asegurando que la cantidad de empleados en la base de datos coincida con lo mostrado en el resumen por empresa del dashboard.

## Componentes principales

1. **DatabaseCompanySummary.js** - Componente que muestra el resumen de empresas con datos reales de la base de datos
2. **employeeDataService.js** - Servicio que maneja la generación y sincronización de datos de empleados
3. **Scripts SQL** - Scripts para generar y verificar datos de empleados en la base de datos

## Funcionalidades

### Sincronización automática
El sistema sincroniza automáticamente los datos de empleados con las cantidades mostradas en el dashboard:

- Verifica cuántos empleados hay por empresa en la base de datos
- Ajusta la cantidad de empleados para que coincida con las cantidades del dashboard
- Genera datos realistas para empleados nuevos (nombres, emails, departamentos, etc.)

### Generación de datos realistas
Los datos generados incluyen:
- Nombres y apellidos chilenos comunes
- Emails corporativos basados en el nombre y empresa
- Teléfonos chilenos válidos
- Regiones de Chile (de norte a sur)
- Departamentos empresariales comunes
- Niveles jerárquicos (Asistente, Especialista, Gerente, etc.)
- Posiciones específicas por departamento
- Modalidades de trabajo (Presencial, Híbrido, Remoto)
- Tipos de contrato (Indefinido, Plazo Fijo, Honorarios)

## Scripts SQL disponibles

### 1. generate_real_employee_data.sql
Genera datos de empleados realistas para todas las empresas:
```sql
-- Ejecutar el script completo para generar datos
\i database/generate_real_employee_data.sql
```

### 2. sync_employees_with_dashboard.sql
Sincroniza los empleados con las cantidades del dashboard:
```sql
-- Ejecutar el script para sincronizar datos
\i database/sync_employees_with_dashboard.sql
```

### 3. verify_employee_data.sql
Verifica que los datos se han generado correctamente:
```sql
-- Ejecutar el script para verificar datos
\i database/verify_employee_data.sql
```

## Uso desde la interfaz web

### Dashboard
1. Acceder al dashboard en http://localhost:3002/dashboard
2. El resumen por empresa muestra datos en tiempo real desde la base de datos
3. El botón "Sincronizar" actualiza los datos para que coincidan con el dashboard

### Base de datos de comunicación
1. Acceder a la base de datos en http://localhost:3002/communication/database
2. Utilizar los filtros para seleccionar empleados
3. Seleccionar empleados y hacer clic en "Enviar Mensajes"
4. Los datos se sincronizan automáticamente con el dashboard

## Cómo funciona la sincronización

1. **Obtención de datos del dashboard**: El sistema obtiene las cantidades de empleados por empresa del dashboard
2. **Comparación con base de datos**: Compara estas cantidades con los datos reales en la base de datos
3. **Ajuste de datos**: 
   - Si hay menos empleados en la base de datos, genera nuevos empleados realistas
   - Si hay más empleados en la base de datos, elimina empleados aleatoriamente
4. **Verificación**: Muestra los resultados actualizados en el dashboard

## Personalización

### Modificar cantidades por empresa
Para modificar las cantidades de empleados por empresa:
1. Editar el script `sync_employees_with_dashboard.sql`
2. Modificar los valores en la tabla `desired_employee_counts`
3. Ejecutar el script

### Modificar datos generados
Para modificar los datos generados:
1. Editar el servicio `employeeDataService.js`
2. Modificar las listas de nombres, departamentos, etc.
3. Los cambios se aplicarán a nuevos empleados generados

## Verificación

### Verificar desde la base de datos
```sql
-- Verificar el total de empleados por empresa
SELECT 
  c.name AS company,
  COUNT(e.id) AS employee_count
FROM companies c
LEFT JOIN employees e ON c.id = e.company_id
GROUP BY c.id, c.name
ORDER BY c.name;
```

### Verificar desde la interfaz
1. Acceder al dashboard
2. Verificar que las cantidades en "Resumen por Empresa" coinciden con las esperadas
3. Acceder a la base de datos de comunicación
4. Verificar que se muestran todos los empleados correctamente

## Solución de problemas

### No se muestran empleados
1. Verificar que la base de datos tiene datos:
   ```sql
   SELECT COUNT(*) FROM employees;
   ```
2. Verificar que las empresas existen:
   ```sql
   SELECT * FROM companies;
   ```
3. Verificar las políticas de seguridad:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'employees';
   ```

### Las cantidades no coinciden
1. Forzar sincronización desde el dashboard
2. Verificar los scripts SQL de sincronización
3. Revisar los logs del servicio de empleados

### Errores en la generación de datos
1. Verificar que las listas de nombres y datos en `employeeDataService.js` son correctas
2. Revisar los logs de la aplicación
3. Verificar los permisos de la base de datos