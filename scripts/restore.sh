#!/bin/bash

# VirtualUni - Restore Script
# This script restores a database backup

set -e

BACKUP_DIR="./backups"

echo "============================================"
echo " VirtualUni Platform - Restore Script"
echo "============================================"
echo ""

# List available backups
echo "Available backups:"
echo ""
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found."
echo ""

# Ask for backup file
read -p "Enter backup filename (e.g., virtualuni_backup_20250101_120000.sql.gz): " backup_file

BACKUP_PATH="$BACKUP_DIR/$backup_file"

if [ ! -f "$BACKUP_PATH" ]; then
    echo "❌ Backup file not found: $BACKUP_PATH"
    exit 1
fi

# Confirm restoration
echo ""
echo "⚠️  WARNING: This will replace the current database!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restoration cancelled."
    exit 0
fi

echo ""
echo "🗄️  Restoring database from backup..."

# Decompress backup
gunzip -c "$BACKUP_PATH" | docker-compose exec -T postgres psql -U postgres -d virtualuni

echo ""
echo "✅ Database restored successfully!"
echo ""
echo "Please restart the backend service:"
echo "  docker-compose restart backend"
echo ""
echo "============================================"
echo " Restore Complete!"
echo "============================================"
