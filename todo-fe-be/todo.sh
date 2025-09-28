#!/bin/bash

# Todo App Management Script
# Usage: ./todo.sh [command]

case "$1" in
    "help"|"")
        echo "Todo List Application - Available Commands:"
        echo ""
        echo "🚀 Setup & Management:"
        echo "  ./todo.sh setup      - Setup database and install dependencies"
        echo "  ./todo.sh start      - Start all services (database, backend, frontend)"
        echo "  ./todo.sh stop       - Stop all services"
        echo "  ./todo.sh restart    - Restart all services"
        echo "  ./todo.sh clean      - Clean up containers and volumes"
        echo ""
        echo "💻 Development:"
        echo "  ./todo.sh dev-backend   - Start backend in development mode"
        echo "  ./todo.sh dev-frontend  - Start frontend in development mode"
        echo "  ./todo.sh db-studio     - Open Prisma Studio"
        echo ""
        echo "🛢️ Database:"
        echo "  ./todo.sh db-up         - Start database containers only"
        echo "  ./todo.sh db-migrate    - Run database migrations"
        echo "  ./todo.sh db-reset      - Reset database (⚠️ deletes all data)"
        echo ""
        echo "📊 Monitoring:"
        echo "  ./todo.sh logs       - Show container logs"
        echo "  ./todo.sh status     - Show service status"
        echo ""
        echo "🧪 Testing:"
        echo "  ./todo.sh test       - Test API endpoints"
        ;;
    
    "setup")
        echo "🔧 Setting up Todo List Application..."
        echo "📦 Installing backend dependencies..."
        cd backend && bun install
        echo "📦 Installing frontend dependencies..."
        cd ../frontend && npm install
        echo "🐳 Starting database containers..."
        cd .. && docker compose up -d postgres pgadmin
        echo "⏳ Waiting for PostgreSQL to be ready..."
        sleep 10
        echo "🛢️ Setting up database..."
        cd backend && npx prisma generate && npx prisma db push
        echo "✅ Setup completed successfully!"
        echo ""
        echo "🔗 Access URLs:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:3001"
        echo "  pgAdmin:  http://localhost:5050 (admin@todoapp.com / admin123)"
        ;;
        
    "start")
        echo "🚀 Starting all services..."
        docker compose up -d
        echo "⏳ Waiting for services to be ready..."
        sleep 5
        echo "✅ Database services started!"
        echo "📝 To start development servers:"
        echo "  Backend:  ./todo.sh dev-backend"
        echo "  Frontend: ./todo.sh dev-frontend"
        ;;
        
    "stop")
        echo "🛑 Stopping all services..."
        docker compose down
        pkill -f "bun.*index.ts" 2>/dev/null || true
        pkill -f "npm run dev" 2>/dev/null || true
        echo "✅ All services stopped!"
        ;;
        
    "restart")
        echo "🔄 Restarting all services..."
        $0 stop
        sleep 2
        $0 start
        ;;
        
    "clean")
        echo "🧹 Cleaning up containers and volumes..."
        docker compose down -v
        docker system prune -f
        echo "✅ Cleanup completed!"
        ;;
        
    "dev-backend")
        echo "🔧 Starting backend in development mode..."
        docker compose up -d postgres pgadmin
        sleep 5
        cd backend && bun --watch index.ts
        ;;
        
    "dev-frontend")
        echo "🔧 Starting frontend in development mode..."
        cd frontend && npm run dev
        ;;
        
    "db-up")
        echo "🛢️ Starting database containers..."
        docker compose up -d postgres pgadmin
        ;;
        
    "db-migrate")
        echo "🛢️ Running database migrations..."
        cd backend && npx prisma generate && npx prisma db push
        ;;
        
    "db-reset")
        echo "⚠️ Resetting database (this will delete all data)..."
        read -p "Are you sure? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            cd backend && npx prisma db push --force-reset
            echo "✅ Database reset completed!"
        else
            echo "❌ Database reset cancelled."
        fi
        ;;
        
    "db-studio")
        echo "📊 Opening Prisma Studio..."
        cd backend && npx prisma studio
        ;;
        
    "logs")
        echo "📋 Showing container logs..."
        docker compose logs -f
        ;;
        
    "status")
        echo "📊 Service Status:"
        echo ""
        echo "🐳 Docker Containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Docker not running or accessible"
        echo ""
        echo "🌐 Service Health:"
        
        # Test Backend
        if curl -s http://localhost:3001/ > /dev/null 2>&1; then
            echo "✅ Backend (3001): Running"
        else
            echo "❌ Backend (3001): Not responding"
        fi
        
        # Test Frontend
        if curl -s http://localhost:3000/ > /dev/null 2>&1; then
            echo "✅ Frontend (3000): Running"
        else
            echo "❌ Frontend (3000): Not responding"
        fi
        
        # Test pgAdmin
        if curl -s http://localhost:5050/ > /dev/null 2>&1; then
            echo "✅ pgAdmin (5050): Running"
        else
            echo "❌ pgAdmin (5050): Not responding"
        fi
        ;;
        
    "test")
        echo "🧪 Testing API endpoints..."
        echo ""
        echo "📋 GET /api/todos:"
        curl -s http://localhost:3001/api/todos 2>/dev/null | head -200
        echo ""
        echo ""
        echo "➕ POST /api/todos (creating test todo):"
        curl -s -X POST http://localhost:3001/api/todos \
            -H "Content-Type: application/json" \
            -d '{"title":"Test Todo from Script","description":"Testing API functionality"}' 2>/dev/null
        echo ""
        echo ""
        echo "✅ API tests completed!"
        ;;
        
    *)
        echo "❌ Unknown command: $1"
        echo "Run './todo.sh help' to see available commands."
        exit 1
        ;;
esac