# 🔄 PLAN DE MIGRACIÓN GOOGLE DRIVE UNIFICADO

## 📊 SITUACIÓN ACTUAL
- **9 servicios Google Drive duplicados**
- **21 archivos** usando servicios individuales
- **0 archivos** usando servicio unificado
- **Memory leak** por múltiples instancias

## 🎯 OBJETIVO
Migrar de **9 servicios → 2 servicios** (unificado + persistencia)

## 📋 PLAN DE MIGRACIÓN GRADUAL

### **FASE 1: PREPARACIÓN (5 minutos)**
1. ✅ Crear alias de compatibilidad para `unifiedGoogleDriveService`
2. ✅ Verificar que el servicio unificado funciona correctamente
3. ✅ Crear backup de servicios originales

### **FASE 2: MIGRACIÓN GRADUAL (15 minutos)**
1. **Prioridad Alta** (Archivos críticos):
   - `src/components/settings/Settings.js`
   - `src/components/auth/GoogleAuthCallback.js`
   - `src/components/integrations/Integrations.js`

2. **Prioridad Media** (Componentes dashboard):
   - `src/components/dashboard/Dashboard.js`
   - `src/components/files/Files.js`
   - `src/components/folders/Folders.js`

3. **Prioridad Baja** (Servicios internos):
   - `src/services/fileService.js`
   - `src/services/companyKnowledgeService.js`
   - `src/hooks/useFileUpload.js`

### **FASE 3: LIMPIEZA (10 minutos)**
1. Eliminar servicios duplicados no utilizados
2. Actualizar imports en package.json si es necesario
3. Verificar que no hay referencias rotas

## 🛠️ COMANDOS DE MIGRACIÓN

### **Paso 1: Crear Alias de Compatibilidad**
```javascript
// En src/lib/index.js (crear si no existe)
export { default as googleDriveService } from './unifiedGoogleDriveService.js';
export { default as googleDriveAuthService } from './googleDriveAuthService.js';
export { default as googleDriveCallbackHandler } from './googleDriveCallbackHandler.js';
```

### **Paso 2: Migrar Imports Críticos**
```javascript
// ANTES
import googleDriveService from '../../lib/googleDrive.js';

// DESPUÉS  
import googleDriveService from '../../lib/unifiedGoogleDriveService.js';
```

### **Paso 3: Verificar Funcionamiento**
```bash
# Test de funcionalidad
npm run dev
curl http://localhost:3000
```

## ⚠️ RIESGOS Y MITIGACIÓN

### **Riesgos Identificados**
1. **Funcionalidad rota** durante migración
2. **Referencias circulares** entre servicios
3. **Perdida de tokens** de autenticación

### **Mitigación**
1. **Migración incremental** por archivo
2. **Testing continuo** después de cada cambio
3. **Backup automático** antes de eliminar servicios

## 📈 MÉTRICAS DE ÉXITO

| Métrica | Antes | Objetivo | Mejora |
|---------|-------|----------|---------|
| **Servicios Google Drive** | 9 | 2 | 78% reducción |
| **Archivos usando unificado** | 0 | 21 | 100% migración |
| **Memory usage** | ~160 KB | < 100 KB | 38% reducción |
| **Tiempo de carga** | Lento | Rápido | Optimizado |

## 🚀 SIGUIENTE PASO
Iniciar migración con archivos de **Prioridad Alta**