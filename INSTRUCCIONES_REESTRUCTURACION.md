# 📋 INSTRUCCIONES COMPLETAS PARA REESTRUCTURAR LA BASE DE DATOS

## 🎯 OBJETIVO
Resolver el problema del contador de carpetas que muestra 0 en lugar de 800, reorganizando completamente la base de datos para que tenga una estructura lógica y ordenada.

## 📊 PROBLEMA ACTUAL
- La tabla `companies` contiene 800 registros con nombres "Empleado 1", "Empleado 2", etc.
- Las tablas `employees` y `folders` están vacías
- El dashboard muestra 0 carpetas en lugar de 800

## 🔍 SOLUCIÓN
Reestructurar la base de datos para:
1. **16 empresas reales** (Copec, Falabella, Cencosud, etc.)
2. **800 empleados** distribuidos entre las empresas
3. **800 carpetas** (una por cada empleado)

## 📝 PASOS A SEGUIR

### Paso 1: Ejecutar SQL para crear la estructura

1. Abre el panel de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto: `tmqglnycivlcjijoymwe`
3. Ve a la sección **SQL Editor**
4. Copia y pega el siguiente contenido del archivo `create-tables-structure.sql`:

```sql
-- SCRIPT PARA CREAR ESTRUCTURA CORRECTA DE TABLAS
-- Este script crea las tablas con la estructura correcta para la reorganización

-- 1. Crear tabla de empresas (limpiar y recrear)
DROP TABLE IF EXISTS companies CASCADE;
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    website VARCHAR(255),
    logo_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de empleados con estructura correcta
DROP TABLE IF EXISTS employees CASCADE;
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    position VARCHAR(100),
    department VARCHAR(100),
    company_id UUID REFERENCES companies(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de carpetas
DROP TABLE IF EXISTS folders CASCADE;
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    description TEXT,
    path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de documentos
DROP TABLE IF EXISTS documents CASCADE;
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    file_url TEXT,
    file_size BIGINT,
    file_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear tabla de logs de comunicación
DROP TABLE IF EXISTS communication_logs CASCADE;
CREATE TABLE communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    employee_id UUID REFERENCES employees(id),
    type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft',
    subject TEXT,
    content TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Asegurar que la tabla users existe (si no existe)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Crear índices para mejor rendimiento
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_folders_employee_id ON folders(employee_id);
CREATE INDEX idx_documents_folder_id ON documents(folder_id);
CREATE INDEX idx_documents_employee_id ON documents(employee_id);
CREATE INDEX idx_communication_logs_company_id ON communication_logs(company_id);
CREATE INDEX idx_communication_logs_employee_id ON communication_logs(employee_id);

-- 8. Habilitar Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas RLS básicas (permitir todo por ahora)
CREATE POLICY "Enable all operations for companies" ON companies FOR ALL USING (true);
CREATE POLICY "Enable all operations for employees" ON employees FOR ALL USING (true);
CREATE POLICY "Enable all operations for folders" ON folders FOR ALL USING (true);
CREATE POLICY "Enable all operations for documents" ON documents FOR ALL USING (true);
CREATE POLICY "Enable all operations for communication_logs" ON communication_logs FOR ALL USING (true);
CREATE POLICY "Enable all operations for users" ON users FOR ALL USING (true);
```

5. Haz clic en **Run** para ejecutar el SQL
6. Espera a que se complete la ejecución (debería mostrar "Success")

### Paso 2: Ejecutar el script de migración de datos

1. En tu terminal, ejecuta el script completo:

```bash
node complete-restructure.js
```

2. El script te pedirá que presiones Enter después de haber ejecutado el SQL
3. Presiona Enter para continuar con la migración de datos

### Paso 3: Verificar los resultados

1. Ejecuta el script de prueba:

```bash
node test-organized-database-service.js
```

2. Deberías ver resultados como estos:

```
📊 RESULTADO FINAL:
====================
🏢 Empresas: 16
👥 Empleados: 800
📁 Carpetas: 800

🎉 ¡TODO CORRECTO! La base de datos está organizada y funcionando:
   ✅ Empresas configuradas correctamente
   ✅ Empleados configurados correctamente
   ✅ Carpetas configuradas correctamente
   ✅ Contador de carpetas muestra 800
```

### Paso 4: Probar en la aplicación

1. Abre tu aplicación en http://localhost:3003/panel-principal
2. El contador de carpetas ahora debería mostrar **800** en lugar de 0
3. El dashboard debería mostrar las estadísticas correctas

## 🚀 RESULTADO ESPERADO

Una vez completada la reestructuración:

- ✅ **16 empresas reales** con nombres como Copec, Falabella, Cencosud, etc.
- ✅ **800 empleados** distribuidos equitativamente entre las empresas
- ✅ **800 carpetas** (una por cada empleado)
- ✅ **Contador de carpetas mostrando 800** en el dashboard
- ✅ **Base de datos organizada** con relaciones correctas entre tablas

## 🔧 SI HAY PROBLEMAS

### Error: "Could not find the table"
- Asegúrate de haber ejecutado el SQL completamente en el editor de Supabase
- Verifica que todas las tablas se hayan creado correctamente

### Error: "column does not exist"
- Ejecuta nuevamente el SQL para crear la estructura completa
- Asegúrate de que no haya errores en la ejecución del SQL

### El contador sigue mostrando 0
- Verifica que la tabla `folders` tenga 800 registros
- Ejecuta el script de prueba para diagnosticar el problema

## 📞 SOPORTE

Si tienes algún problema durante el proceso:

1. Revisa los mensajes de error en la terminal
2. Verifica que el SQL se haya ejecutado correctamente en Supabase
3. Ejecuta el script de prueba para obtener un diagnóstico detallado

## 🎉 ¡LISTO!

Una vez completados estos pasos, el problema del contador de carpetas estará resuelto y tu base de datos estará perfectamente organizada.