#!/bin/bash

# VirtualUni - Setup Script
# This script sets up the development or production environment

set -e

echo "============================================"
echo " VirtualUni Platform - Setup Script"
echo "============================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration."
    echo ""
fi

# Check if backend/.env file exists
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env file not found. Creating from example..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env file. Please edit it with your configuration."
    echo ""
fi

# Ask for environment type
echo "Which environment are you setting up?"
echo "1) Development (local)"
echo "2) Production (Docker)"
read -p "Enter choice [1-2]: " env_choice

case $env_choice in
    1)
        echo ""
        echo "Setting up DEVELOPMENT environment..."
        echo ""

        # Install frontend dependencies
        echo "📦 Installing frontend dependencies..."
        npm install

        # Install backend dependencies
        echo "📦 Installing backend dependencies..."
        cd backend
        npm install

        # Generate Prisma Client
        echo "🔧 Generating Prisma Client..."
        npx prisma generate

        # Ask if user wants to run migrations
        read -p "Do you want to run database migrations? (y/n): " run_migrations
        if [ "$run_migrations" = "y" ]; then
            echo "🗄️  Running database migrations..."
            npx prisma migrate deploy
        fi

        # Ask if user wants to seed database
        read -p "Do you want to seed the database with sample data? (y/n): " run_seed
        if [ "$run_seed" = "y" ]; then
            echo "🌱 Seeding database..."
            npx prisma db seed
        fi

        cd ..

        echo ""
        echo "✅ Development environment setup complete!"
        echo ""
        echo "To start the development servers:"
        echo "  Frontend: npm run dev"
        echo "  Backend:  cd backend && npm run start:dev"
        ;;

    2)
        echo ""
        echo "Setting up PRODUCTION environment with Docker..."
        echo ""

        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker first."
            exit 1
        fi

        if ! command -v docker-compose &> /dev/null; then
            echo "❌ Docker Compose is not installed. Please install Docker Compose first."
            exit 1
        fi

        echo "🐳 Docker and Docker Compose are installed."
        echo ""

        # Build Docker images
        echo "🔨 Building Docker images..."
        docker-compose build

        echo ""
        echo "✅ Production environment setup complete!"
        echo ""
        echo "To start the application:"
        echo "  docker-compose up -d"
        echo ""
        echo "To run database migrations:"
        echo "  docker-compose exec backend npx prisma migrate deploy"
        echo ""
        echo "To seed the database:"
        echo "  docker-compose exec backend npx prisma db seed"
        ;;

    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "============================================"
echo " Setup Complete!"
echo "============================================"
