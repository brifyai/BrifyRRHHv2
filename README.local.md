# Instrucciones para Ejecutar el Proyecto en Entorno Local

## Requisitos Previos
- Node.js (versión 14 o superior)
- npm (normalmente viene con Node.js)

## Configuración Inicial

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Variables de entorno:**
   El archivo `.env.local` ya está configurado con los valores por defecto. Puedes modificarlo según tus necesidades.

## Ejecución del Proyecto

### Opción 1: Usar el script de inicio (recomendado)
```bash
./start-dev.sh
```

### Opción 2: Ejecutar servicios por separado

1. **Iniciar el servidor backend:**
   ```bash
   npm run server
   ```
   El servidor estará disponible en http://localhost:3002

2. **En otra terminal, iniciar el servidor frontend:**
   ```bash
   npm start
   ```
   El servidor estará disponible en http://localhost:3000

## Puertos Utilizados
- **Frontend:** http://localhost:3000
- **Backend (API):** http://localhost:3002

## Acceso a la Aplicación
Una vez que ambos servicios estén corriendo, puedes acceder a la aplicación en:
- http://localhost:3000

La API estará disponible en:
- http://localhost:3002/api

## Pruebas de Verificación
Puedes verificar que los servicios estén funcionando correctamente con:

```bash
# Verificar backend
curl http://localhost:3002/api/test

# Verificar frontend
curl -I http://localhost:3000
```

## Detener los Servicios
Para detener los servicios, usa `Ctrl+C` en cada terminal donde estén corriendo.