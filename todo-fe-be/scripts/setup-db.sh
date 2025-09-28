#!/bin/bash

echo "🔧 Setting up Todo App Database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start database containers
echo "🐳 Starting PostgreSQL and pgAdmin containers..."
docker-compose up -d postgres pgadmin

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Generate Prisma client
echo "🔄 Generating Prisma client..."
cd backend
npx prisma generate

# Run database migrations
echo "🛢️ Running database migrations..."
npx prisma db push

# Seed initial data (this will be done by the app)
echo "🌱 Database is ready for seeding..."

echo "✅ Database setup completed!"
echo ""
echo "🔗 Access pgAdmin at: http://localhost:5050"
echo "   Email: admin@todoapp.com"
echo "   Password: admin123"
echo ""
echo "🛢️ PostgreSQL connection:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: todo_db"
echo "   Username: todo_user"
echo "   Password: todo_password"