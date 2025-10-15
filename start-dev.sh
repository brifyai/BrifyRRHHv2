#!/bin/bash

# Script para iniciar el entorno de desarrollo local
# Backend: puerto 3002
# Frontend: puerto 3000

echo "🚀 Iniciando entorno de desarrollo local..."

# Iniciar el backend en background
echo "Iniciando servidor backend en puerto 3002..."
npm run server &

# Esperar unos segundos para que el backend se inicie
sleep 3

# Iniciar el frontend
echo "Iniciando servidor frontend en puerto 3000..."
npm start

echo "Para acceder a la aplicación:"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3002/api"