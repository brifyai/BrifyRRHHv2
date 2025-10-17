# 🚀 PASOS PARA EJECUTAR EN SUPABASE

## 📋 Paso a Paso - GUIA DEFINITIVA

### Paso 1: Abrir Supabase Dashboard
1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto: **tmqglnycivlcjijoymwe**

### Paso 2: Abrir Editor SQL
1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Verás una pantalla con un área de texto grande

### Paso 3: Copiar y Pegar el Script
1. Abre el archivo: `database/supabase_complete_setup.sql`
2. Copia **TODO** el contenido del archivo (Ctrl+A, Ctrl+C)
3. Pega todo el contenido en el editor SQL de Supabase (Ctrl+V)

### Paso 4: Ejecutar el Script
1. Revisa que el contenido esté completo en el editor
2. Haz clic en el botón **"Run"** o **"Execute"** (generalmente en la esquina superior derecha)
3. Espera a que termine de ejecutar (puede tardar 1-2 minutos)

### Paso 5: Verificar Resultados
El script mostrará resultados como:
```
NOTICE:  Creando 799 empleados adicionales...
NOTICE:  Se crearon 799 empleados exitosamente
```

Y una tabla con los conteos:
```
table_name | total_count | system_users | with_department
-----------|-------------|--------------|----------------
USERS      | 800         | 799          | 800
```

## ✅ VERIFICACIÓN DESPUÉS DE EJECUTAR

### Verificación 1: En Supabase
Ejecuta esta consulta simple en el SQL Editor:
```sql
SELECT COUNT(*) as total_empleados FROM users;
```
Debe mostrar: **800**

### Verificación 2: En el Dashboard
1. Ve a: http://localhost:3003/panel-principal
2. El contador de carpetas debería mostrar **800**

### Verificación 3: Estructura de Tablas
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public' 
ORDER BY ordinal_position;
```
Debe incluir las columnas: `department`, `position`, `phone`, `status`

## 🚨 SI HAY ERRORES

### Error Común: "Permission denied"
- Asegúrate de tener permisos de administrador en el proyecto
- Verifica que estás en el proyecto correcto: `tmqglnycivlcjijoymwe`

### Error Común: "Column already exists"
- Es normal, el script usa `IF NOT EXISTS`
- Continúa con la ejecución

### Error Común: "Timeout"
- Ejecuta el script por partes más pequeñas
- Divide el script en 2-3 partes más pequeñas

## 📞 SI NO FUNCIONA

### Opción A: Ejecutar por Partes
Divide el script en estas partes:

**Parte 1: Columnas y Tablas**
```sql
-- Solo la sección 1-8 del script
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
-- ... (resto de ALTER TABLE)
```

**Parte 2: Crear Empleados**
```sql
-- Solo la sección 9 del script
DO $$
DECLARE
    current_count INTEGER;
    -- ... (resto del bloque)
END $$;
```

**Parte 3: Índices y Políticas**
```sql
-- Solo las secciones 10-12 del script
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
-- ... (resto de índices y políticas)
```

### Opción B: Contactarme
Si tienes problemas, envíame:
1. Captura de pantalla del error
2. Copia exacta del mensaje de error
3. Paso donde falló (1, 2, 3, 4 o 5)

## 🎯 RESULTADO ESPERADO FINAL

✅ **800 empleados** en la base de datos  
✅ **Dashboard muestra 800 carpetas**  
✅ **Tablas configuradas** para analíticas  
✅ **Sistema listo** para producción  

---

## 📝 NOTAS IMPORTANTES

1. **NO CIERRES** la pestaña mientras se ejecuta el script
2. **ESPERA** a que veas el mensaje de completado
3. **VERIFICA** los resultados antes de continuar
4. **GUARDA** una captura de pantalla del resultado final

---

**Listo para continuar con el siguiente paso después de ejecutar este script** 🚀