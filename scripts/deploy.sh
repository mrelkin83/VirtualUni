#!/bin/bash

# VirtualUni - Deployment Script
# This script deploys the application to production

set -e

echo "============================================"
echo " VirtualUni Platform - Deployment Script"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  This script should be run as root or with sudo"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Docker and Docker Compose are installed."
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main || true

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T backend npx prisma migrate deploy

# Restart backend to ensure everything is loaded
echo "🔄 Restarting backend..."
docker-compose restart backend

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Services status:"
docker-compose ps

echo ""
echo "============================================"
echo " Deployment Complete!"
echo "============================================"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:80"
echo "  Backend API: http://localhost:3001"
echo "  Prisma Studio: http://localhost:5555 (run: docker-compose --profile tools up -d)"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop: docker-compose down"
echo "  Restart: docker-compose restart"
