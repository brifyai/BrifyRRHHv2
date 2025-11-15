# 🚀 Instrucciones para Crear Tablas Core en Supabase

## 📋 Problema Identificado
El dashboard muestra datos fantasma porque las tablas `companies`, `employees` y `communication_logs` no existen en tu base de datos Supabase. Los servicios están generando datos simulados cuando las consultas fallan.

## 🎯 Solución
Ejecutar el script `create_core_tables.sql` en tu base de datos Supabase para crear las tablas esenciales.

---

## 🔧 PASO 1: Acceder a Supabase SQL Editor

1. Ve a tu panel de Supabase: https://app.supabase.com
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **"SQL Editor"**
4. Haz clic en **"New query"** para abrir un editor SQL

---

## 🔧 PASO 2: Ejecutar el Script

1. Copia todo el contenido del archivo `database/create_core_tables_final.sql` (versión final corregida)
2. Pégalo en el editor SQL de Supabase
3. Haz clic en **"Run"** o presiona `Ctrl + Enter`

**Nota:** Esta versión final corrige todos los errores de sintaxis de PostgreSQL y maneja tablas existentes.

---

## 🔧 PASO 3: Verificar Creación

El script mostrará:
- ✅ Confirmación de tablas creadas
- 📊 Lista de columnas y tipos de datos
- 🔒 Políticas RLS configuradas

**Tablas que se crearán:**
- `companies` - Empresas/organizaciones
- `employees` - Empleados vinculados a empresas
- `communication_logs` - Registro de mensajes enviados
- `company_insights` - Insights generados por IA
- `company_metrics` - Métricas por empresa

---

## 🔧 PASO 4: Verificar en el Dashboard

1. Refresca tu aplicación: http://localhost:3000/base-de-datos
2. Abre la consola del navegador (F12)
3. Busca los logs que empiezan con `🔍 DEBUG:`

**Deberías ver:**
- `🔍 DEBUG: Tabla companies existe: SÍ`
- `🔍 DEBUG: Tabla communication_logs existe: SÍ`
- `🔍 DEBUG: Logs encontrados para empresa: 0` (inicialmente vacío)

---

## 🎯 Resultado Esperado

Una vez ejecutado el script:
- ✅ **Mensajes Enviados**: Mostrará `0` en lugar de datos aleatorios
- ✅ **Tasa de Lectura**: Mostrará `0%` en lugar de porcentajes simulados
- ✅ **Análisis Inteligente**: Mostrará "Sin Datos" en lugar de insights falsos
- ✅ **Insights Clave**: Mostrará mensajes informativos sobre falta de actividad

---

## 🔄 Datos de Ejemplo

El script incluye 8 empresas de ejemplo:
- Aguas Andinas
- Banco de Chile
- Cencosud
- Codelco
- Enel
- Entel
- Falabella
- Latam Airlines

Estas empresas aparecerán en el selector pero con `0 mensajes` inicialmente.

---

## 🚨 Solución de Problemas

### Si el script falla:
1. **Error de permisos**: Asegúrate de tener permisos de administrador en Supabase
2. **Tablas existentes**: El script usa `IF NOT EXISTS`, así que es seguro ejecutarlo múltiples veces
3. **Conexión**: Verifica que estás en el proyecto correcto de Supabase

### Si los datos fantasma persisten:
1. Limpia la caché del navegador
2. Recarga la aplicación con `Ctrl + Shift + R`
3. Revisa la consola para ver los logs de depuración

---

## 📞 Próximos Pasos

Después de crear las tablas:
1. El dashboard mostrará estados vacíos correctamente
2. Cuando envíes mensajes reales, aparecerán en las estadísticas
3. Los insights de IA se generarán basados en datos reales

---

## ✅ Checklist de Verificación

- [ ] Script ejecutado sin errores en Supabase
- [ ] 5 tablas creadas correctamente
- [ ] Políticas RLS configuradas
- [ ] Dashboard muestra `0` en lugar de datos aleatorios
- [ ] Consola muestra logs `🔍 DEBUG:` confirmando tablas existentes
- [ ] Selector de empresas muestra las 8 empresas de ejemplo

---

**🎉 ¡Listo! Tu dashboard ahora mostrará datos reales o estados vacíos correctamente.**