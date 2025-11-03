#!/bin/bash

# Script para poblar 800 empleados usando curl y REST API de Supabase
# Usa SERVICE ROLE KEY para bypass de RLS

echo "🔧 Poblando 800 empleados en producción usando REST API..."

# Variables de configuración
SUPABASE_URL="https://hzclkhawjkqgkqjdlzsp.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Y2ssaGF3amtxZ2txamRsenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDM5MDcxNSwiZXhwIjoyMDQ5OTY2NzE1fQ.3Tm2b8cYvKr6HtO3HlHv0g9qQh0dE7x8k9oFzWqXjY4"

# Primero verificar estado actual
echo "📊 Verificando estado actual de empleados..."
CURRENT_COUNT=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/count_employees" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' | jq -r '.[0].count // 0' 2>/dev/null || echo "0")

echo "📊 Empleados actuales: $CURRENT_COUNT"

# Verificar empresas
echo "🏢 Verificando empresas existentes..."
COMPANIES=$(curl -s -X GET "$SUPABASE_URL/rest/v1/companies?id,name" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Accept: application/json" 2>/dev/null)

if [ $? -eq 0 ] && [ "$COMPANIES" != "null" ] && [ "$COMPANIES" != "" ]; then
  echo "✅ Empresas encontradas:"
  echo "$COMPANIES" | jq -r '.[] | "   \(.name) (ID: \(.id))"' 2>/dev/null || echo "   (Error al formatear)"
else
  echo "❌ Error al obtener empresas"
  exit 1
fi

# Limpiar empleados existentes
echo "🧹 Limpiando empleados existentes..."
DELETE_RESULT=$(curl -s -X DELETE "$SUPABASE_URL/rest/v1/employees" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Prefer: return=minimal" 2>/dev/null)

if [ $? -eq 0 ]; then
  echo "✅ Empleados existentes eliminados"
else
  echo "⚠️  No se pudieron eliminar empleados existentes"
fi

# Generar y insertar empleados en lotes
echo "🚀 Generando 800 empleados (50 por empresa)..."

# Obtener IDs de empresas
COMPANY_IDS=$(echo "$COMPANIES" | jq -r '.[].id' 2>/dev/null)

if [ -z "$COMPANY_IDS" ]; then
  echo "❌ No se pudieron obtener IDs de empresas"
  exit 1
fi

BATCH_SIZE=50
TOTAL_EMPLOYEES=0

for company_id in $COMPANY_IDS; do
  echo "📝 Creando 50 empleados para empresa ID: $company_id"
  
  # Generar 50 empleados para esta empresa
  for i in $(seq 1 $BATCH_SIZE); do
    # Generar datos aleatorios
    NAMES=("Camilo" "Patricio" "Víctor" "Graciela" "Jorge" "Ricardo" "Felipe" "Arturo" "Valentina" "Isabel" "César" "Oscar" "Carolina" "Rodrigo" "Francisco" "Miguel" "Alejandro" "Daniela" "Romina" "Silvana" "Guillermo" "Fernanda" "Claudia" "Teresa" "Cristian" "Diego" "Natalia" "Luis" "Karina" "Andrés" "Marcela" "Verónica" "Roberto" "Tamara" "Danielle" "Macarena" "Sebastián" "Pablo" "Eduardo")
    SURNAMES=("Gutiérrez" "Castro" "Vargas" "Reyes" "Sepúlveda" "Henríquez" "Miranda" "López" "Pizarro" "Villarroel" "Ramos" "Morales" "Álvarez" "Cortés" "Rivera" "Parra" "Leiva" "Silva" "Fuentes" "Zúñiga" "Díaz" "Muñoz" "Romero" "Guzmán" "Moraga" "Contreras" "Herrera" "Roas" "Aguilera" "Pérez" "Sánchez" "González" "Rodríguez")
    DEPARTMENTS=("Operaciones" "TI" "Seguridad" "Producción" "RRHH" "Administración" "Planificación" "Mantenimiento" "Servicio al Cliente" "Logística" "Investigación y Desarrollo" "Contabilidad" "Finanzas" "Tesorería" "Marketing" "Ventas" "Auditoría" "Legal" "Calidad" "Compras")
    POSITIONS=("Jefe de Operaciones" "Desarrollador" "Supervisor de Seguridad" "Jefe de Producción" "Reclutador" "Especialista en Seguridad" "Técnico de Soporte" "Operario de Producción" "Coordinador Administrativo" "Planificador" "Administrativo" "Gerente de Mantenimiento" "Ejecutivo de Servicio" "Supervisor de Logística" "Desarrollador de Producto" "Asistente Contable" "Asistente de Calidad" "Jefe Administrativo" "Jefe de Mantenimiento" "Coordinador Administrativo" "Gerente Contable" "Gerente Financiero" "Asistente de Mantenimiento" "Asistente Financiero" "Jefe de Calidad" "Jefe de RRHH" "Supervisor de Operaciones" "Analista de Tesorería" "Supervisor de Producción" "Especialista en Marketing" "Ejecutivo de Ventas" "Jefe de Tesorería" "Contador" "Asistente de Auditoría" "Especialista en Cumplimiento" "Asistente de Mantenimiento" "Jefe de Logística" "Coordinador de Marketing" "Gerente de Auditoría" "Gerente Legal" "Gerente de Ventas" "Asistente de Tesorería" "Auditor Interno")
    REGIONS=("Región Metropolitana" "Región de Valparaíso" "Región del Biobío" "Región de Araucanía" "Región de Los Lagos" "Región de Antofagasta" "Región de Coquimbo" "Región de Los Ríos" "Región del Maule" "Región de Tarapacá" "Región de Atacama" "Región de Ñuble" "Región de Aysén" "Región de Magallanes" "Región del Libertador O'Higgins")
    WORK_MODES=("Presencial" "Híbrido" "Remoto")
    CONTRACT_TYPES=("Indefinido" "Plazo Fijo" "Honorarios")
    LEVELS=("Asistente" "Especialista" "Supervisor" "Coordinador" "Jefatura" "Gerente" "Director" "Operario")
    
    # Seleccionar aleatoriamente
    NAME=${NAMES[$((RANDOM % ${#NAMES[@]}))]}
    SURNAME=${SURNAMES[$((RANDOM % ${#SURNAMES[@]}))]}
    DEPARTMENT=${DEPARTMENTS[$((RANDOM % ${#DEPARTMENTS[@]}))]}
    POSITION=${POSITIONS[$((RANDOM % ${#POSITIONS[@]}))]}
    REGION=${REGIONS[$((RANDOM % ${#REGIONS[@]}))]}
    WORK_MODE=${WORK_MODES[$((RANDOM % ${#WORK_MODES[@]}))]}
    CONTRACT_TYPE=${CONTRACT_TYPES[$((RANDOM % ${#CONTRACT_TYPES[@]}))]}
    LEVEL=${LEVELS[$((RANDOM % ${#LEVELS[@]}))]}
    
    # Generar email único
    EMAIL=$(echo "${NAME,,}${SURNAME,,}${company_id}${i}@company${company_id}.cl" | tr -d ' ')
    
    # Generar teléfono
    PHONE="+56 9 $(printf "%08d" $((RANDOM % 100000000)))"
    
    # Crear empleado
    EMPLOYEE_DATA=$(cat <<EOF
{
  "company_id": "$company_id",
  "name": "$NAME $SURNAME",
  "email": "$EMAIL",
  "phone": "$PHONE",
  "region": "$REGION",
  "department": "$DEPARTMENT",
  "level": "$LEVEL",
  "position": "$POSITION",
  "work_mode": "$WORK_MODE",
  "contract_type": "$CONTRACT_TYPE",
  "is_active": true,
  "has_subordinates": $((RANDOM % 2))
}
EOF
)
    
    # Insertar empleado
    INSERT_RESULT=$(curl -s -X POST "$SUPABASE_URL/rest/v1/employees" \
      -H "apikey: $SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      -d "$EMPLOYEE_DATA" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
      TOTAL_EMPLOYEES=$((TOTAL_EMPLOYEES + 1))
      if [ $((TOTAL_EMPLOYEES % 50)) -eq 0 ]; then
        echo "   ✅ Creados $TOTAL_EMPLOYEES empleados hasta ahora..."
      fi
    else
      echo "   ❌ Error al crear empleado $i para empresa $company_id"
    fi
  done
done

echo "🎉 Proceso completado!"
echo "📊 Total de empleados creados: $TOTAL_EMPLOYEES"

# Verificación final
echo "🔍 Verificando resultado final..."
FINAL_COUNT=$(curl -s -X GET "$SUPABASE_URL/rest/v1/employees?select=count" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Accept: application/json" \
  -H "Prefer: count=exact" 2>/dev/null | grep -i "content-range" | cut -d'/' -f2 | tr -d ' \r\n')

if [ -z "$FINAL_COUNT" ]; then
  FINAL_COUNT=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/get_employee_count" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d '{}' | jq -r '.[0].count // 0' 2>/dev/null || echo "desconocido")
fi

echo "📊 Empleados en base de datos: $FINAL_COUNT"

if [ "$FINAL_COUNT" = "800" ] || [ "$TOTAL_EMPLOYEES" -ge 800 ]; then
  echo "✅ ÉXITO: Se alcanzó el objetivo de 800 empleados"
  echo "🎯 El contador de carpetas debería mostrar ahora 800"
else
  echo "⚠️  Se esperaban 800 empleados, pero se encontraron $FINAL_COUNT"
fi

echo "🏁 Script finalizado"