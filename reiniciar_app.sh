#!/bin/bash

# Script para reiniciar la aplicación StaffHub
# Aplica los cambios de Google Drive en modo production

echo "🔄 REINICIANDO APLICACIÓN STAFFHUB..."
echo "📁 Google Drive configurado para PRODUCCIÓN"
echo ""

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Puerto $port está en uso"
        return 1
    else
        echo "✅ Puerto $port está libre"
        return 0
    fi
}

# Verificar puertos
echo "🔍 Verificando puertos..."
check_port 3000
check_port 3001
echo ""

# Función para terminar procesos en puertos específicos
kill_process_on_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🛑 Terminando proceso en puerto $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
        sleep 2
    fi
}

# Terminar procesos existentes
echo "🛑 Terminando procesos existentes..."
kill_process_on_port 3000
kill_process_on_port 3001
echo ""

# Esperar un momento para que los puertos se liberen
echo "⏳ Esperando liberación de puertos..."
sleep 3
echo ""

# Verificar que los puertos están libres
echo "✅ Verificando puertos libres..."
if check_port 3000 && check_port 3001; then
    echo ""
    echo "🚀 INICIANDO APLICACIÓN..."
    echo "📋 Modo: Desarrollo completo (servidor + React)"
    echo "🌐 Puertos: 3000 (backend) + 3001 (frontend)"
    echo "📁 Google Drive: PRODUCTION MODE"
    echo ""
    
    # Iniciar la aplicación
    npm run dev
    
else
    echo "❌ Error: Los puertos aún están en uso"
    echo "💡 Intenta ejecutar: lsof -ti:3000,3001 | xargs kill -9"
    exit 1
fi