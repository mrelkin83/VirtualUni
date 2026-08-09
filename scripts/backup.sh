#!/bin/bash

# VirtualUni - Backup Script
# Respalda la base de datos y la bitácora de sesiones.
#
# El volcado se intentaba únicamente por `docker-compose exec postgres`. Con el
# demonio de Docker parado --que es como corre este proyecto en local, contra
# PostgreSQL nativo-- el script abortaba en esa línea por `set -e`: dejaba un
# .sql de 0 bytes con pinta de respaldo y nunca llegaba a copiar la bitácora.
# Ahora prueba Docker, cae a un pg_dump local si hace falta, borra el archivo
# vacío cuando ninguna vía funciona, y la copia de la bitácora ya no depende de
# que el volcado haya salido bien: son cosas independientes.

set -uo pipefail

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="virtualuni_backup_${TIMESTAMP}.sql"
BITACORA_DIR="./docs/bitacora"
BITACORA_FILE="virtualuni_bitacora_${TIMESTAMP}.tar.gz"
ENV_BACKEND="./backend/.env"

fallos=0

echo "============================================"
echo " VirtualUni Platform - Backup Script"
echo "============================================"
echo ""

mkdir -p "$BACKUP_DIR"

# ─────────────────────────────────────────────── base de datos ──
echo "📦 Creando respaldo de la base de datos..."
echo "Archivo: $BACKUP_DIR/$BACKUP_FILE"

volcado_ok=0

if docker-compose exec -T postgres pg_dump -U postgres virtualuni \
     > "$BACKUP_DIR/$BACKUP_FILE" 2>/dev/null && [ -s "$BACKUP_DIR/$BACKUP_FILE" ]; then
  echo "   origen: contenedor de Docker"
  volcado_ok=1
elif [ -f "$ENV_BACKEND" ] && command -v pg_dump >/dev/null 2>&1; then
  # DATABASE_URL trae `?schema=public`, que es un parámetro de Prisma y libpq
  # rechaza: hay que recortarlo antes de pasárselo a pg_dump.
  DBURL=$(grep -E '^DATABASE_URL=' "$ENV_BACKEND" | head -1 | cut -d= -f2- \
          | tr -d '"'"'" | cut -d'?' -f1)
  if [ -n "$DBURL" ] && pg_dump "$DBURL" > "$BACKUP_DIR/$BACKUP_FILE" 2>/dev/null \
     && [ -s "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "   origen: PostgreSQL local (Docker no disponible)"
    volcado_ok=1
  fi
fi

if [ "$volcado_ok" -eq 1 ]; then
  gzip -f "$BACKUP_DIR/$BACKUP_FILE"
  echo "✅ Base de datos respaldada: $BACKUP_DIR/${BACKUP_FILE}.gz"
else
  # Sin esto queda un .sql de 0 bytes que aparenta ser un respaldo válido.
  rm -f "$BACKUP_DIR/$BACKUP_FILE"
  echo "❌ No se pudo respaldar la base de datos: ni Docker ni pg_dump local."
  fallos=$((fallos + 1))
fi
echo ""

# ──────────────────────────────────────────── bitácora de sesiones ──
# Va aparte del volcado porque es documentación, no datos: así se puede
# restaurar una sin tocar la otra, y un fallo en una no cancela la otra.
echo "📔 Actualizando bitácora de sesiones..."
if command -v node >/dev/null 2>&1; then
  node scripts/bitacora.mjs >/dev/null 2>&1 \
    || echo "⚠️  No se pudo regenerar; se respalda la versión existente."
else
  echo "⚠️  node no disponible; se respalda la bitácora existente sin actualizar."
fi

if [ -d "$BITACORA_DIR" ]; then
  if tar czf "$BACKUP_DIR/$BITACORA_FILE" "$BITACORA_DIR" 2>/dev/null; then
    echo "✅ Bitácora respaldada: $BACKUP_DIR/$BITACORA_FILE"
  else
    rm -f "$BACKUP_DIR/$BITACORA_FILE"
    echo "❌ No se pudo comprimir la bitácora."
    fallos=$((fallos + 1))
  fi
else
  echo "⚠️  No existe $BITACORA_DIR; se omite su respaldo."
fi
echo ""

# ───────────────────────────────────────────────────── retención ──
echo "🧹 Limpiando respaldos de más de 7 días..."
find "$BACKUP_DIR" -name "virtualuni_backup_*.sql.gz" -type f -mtime +7 -delete
find "$BACKUP_DIR" -name "virtualuni_bitacora_*.tar.gz" -type f -mtime +7 -delete

echo ""
echo "============================================"
if [ "$fallos" -eq 0 ]; then
  echo " Respaldo completo"
else
  # Salir con error para que el cron lo reporte en vez de darlo por bueno.
  echo " Respaldo INCOMPLETO: $fallos fallo(s)"
fi
echo "============================================"

exit "$fallos"
