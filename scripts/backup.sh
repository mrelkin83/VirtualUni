#!/bin/bash

# VirtualUni - Backup Script
# This script creates a backup of the database

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="virtualuni_backup_${TIMESTAMP}.sql"
BITACORA_DIR="./docs/bitacora"
BITACORA_FILE="virtualuni_bitacora_${TIMESTAMP}.tar.gz"

echo "============================================"
echo " VirtualUni Platform - Backup Script"
echo "============================================"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "📦 Creating database backup..."
echo "File: $BACKUP_DIR/$BACKUP_FILE"
echo ""

# Create backup
docker-compose exec -T postgres pg_dump -U postgres virtualuni > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo ""
echo "✅ Backup created successfully!"
echo "📁 Location: $BACKUP_DIR/${BACKUP_FILE}.gz"
echo ""

# Bitácora de sesiones: se regenera y se respalda junto con la base de datos.
# Va aparte del dump porque es documentación, no datos: así se puede restaurar
# una sin tocar la otra.
echo "📔 Actualizando bitácora de sesiones..."
if command -v node >/dev/null 2>&1; then
  node scripts/bitacora.mjs || echo "⚠️  La bitácora no se pudo actualizar; se respalda la versión existente."
else
  echo "⚠️  node no disponible; se respalda la bitácora existente sin actualizar."
fi

if [ -d "$BITACORA_DIR" ]; then
  echo "🗜️  Comprimiendo bitácora..."
  tar czf "$BACKUP_DIR/$BITACORA_FILE" "$BITACORA_DIR"
  echo "📁 Location: $BACKUP_DIR/$BITACORA_FILE"
else
  echo "⚠️  No existe $BITACORA_DIR; se omite su respaldo."
fi
echo ""

# Clean old backups (keep last 7 days)
echo "🧹 Cleaning old backups (keeping last 7)..."
find "$BACKUP_DIR" -name "virtualuni_backup_*.sql.gz" -type f -mtime +7 -delete
find "$BACKUP_DIR" -name "virtualuni_bitacora_*.tar.gz" -type f -mtime +7 -delete

echo ""
echo "============================================"
echo " Backup Complete!"
echo "============================================"
