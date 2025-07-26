#!/bin/bash

# StockFilter Pro - Development Setup Script
# This script sets up the development environment for the StockFilter Pro MVP

set -e

echo "🚀 Setting up StockFilter Pro Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "⚠️ PostgreSQL is not found locally. Make sure Docker is running or install PostgreSQL."
fi

# Check if Redis is available
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️ Redis is not found locally. Make sure Docker is running or install Redis."
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup backend
echo "🔧 Setting up backend..."
cd backend

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
    echo "⚠️ Please update the .env file with your configuration"
else
    echo "✅ Backend .env file already exists"
fi

# Go back to root
cd ..

# Setup frontend
echo "🔧 Setting up frontend..."
cd frontend

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cp .env.example .env
    echo "✅ Frontend .env file created"
else
    echo "✅ Frontend .env file already exists"
fi

# Go back to root
cd ..

# Check if Docker is available for database setup
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Docker found. You can use Docker Compose to start services:"
    echo "   docker-compose up -d postgres redis"
    echo ""
fi

echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update backend/.env with your database and Redis configuration"
echo "2. Start the database services (Docker: 'docker-compose up -d postgres redis')"
echo "3. Run database migrations: 'npm run db:migrate'"
echo "4. Seed the database: 'npm run db:seed'"
echo "5. Start the development servers: 'npm run dev'"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   API Docs: http://localhost:5000/api-docs"
echo ""
echo "🔧 Useful commands:"
echo "   npm run dev           - Start both frontend and backend"
echo "   npm run dev:frontend  - Start only frontend"
echo "   npm run dev:backend   - Start only backend"
echo "   npm run db:studio     - Open Prisma Studio"
echo ""
echo "Happy coding! 🎉"