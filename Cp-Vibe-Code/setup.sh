#!/bin/bash

# Cp-Vibe-Code Quick Setup Script
echo "🚀 Setting up Cp-Vibe-Code project..."

# Check if required tools are installed
echo "📋 Checking prerequisites..."

if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first: https://bun.sh/"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to setup PostgreSQL manually."
    SKIP_DOCKER=true
fi

echo "✅ Prerequisites check completed"

# Install dependencies
echo "📦 Installing dependencies..."
bun run install:all

# Build shared package
echo "🔨 Building shared package..."
cd shared && bun run build && cd ..

# Setup environment files
echo "⚙️  Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - Please update with your settings"
else
    echo "ℹ️  backend/.env already exists"
fi

if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo "✅ Created frontend/.env.local"
else
    echo "ℹ️  frontend/.env.local already exists"
fi

# Start Docker services if available
if [ "$SKIP_DOCKER" != true ]; then
    echo "🐳 Starting Docker services..."
    docker-compose up -d postgres
    
    # Wait for PostgreSQL to be ready
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Run migrations
    echo "🗄️  Running database migrations..."
    cd backend && bun run db:migrate
    
    # Seed database
    echo "🌱 Seeding database..."
    bun run db:seed
    cd ..
    
    echo "✅ Database setup completed"
else
    echo "⚠️  Skipping Docker setup. Please setup PostgreSQL manually and run:"
    echo "   cd backend && bun run db:migrate && bun run db:seed"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your database credentials (if needed)"
echo "2. Start development servers: bun run dev"
echo "3. Frontend: http://localhost:3000"
echo "4. Backend: http://localhost:3001"
echo "5. Database Admin: http://localhost:8080"
echo ""
echo "👤 Demo credentials:"
echo "   Email: admin@example.com"
echo "   Password: password123"
echo ""
echo "🚀 Happy coding!"
