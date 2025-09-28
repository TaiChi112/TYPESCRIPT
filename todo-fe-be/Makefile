# Todo App Makefile
.PHONY: help setup start stop restart clean dev-backend dev-frontend db-studio logs test

# Default target
help:
	@echo "Todo List Application - Available Commands:"
	@echo ""
	@echo "🚀 Setup & Management:"
	@echo "  make setup      - Setup database and install dependencies"
	@echo "  make start      - Start all services (database, backend, frontend)"
	@echo "  make stop       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make clean      - Clean up containers and volumes"
	@echo ""
	@echo "💻 Development:"
	@echo "  make dev-backend   - Start backend in development mode"
	@echo "  make dev-frontend  - Start frontend in development mode"
	@echo "  make db-studio     - Open Prisma Studio"
	@echo ""
	@echo "🛢️ Database:"
	@echo "  make db-up         - Start database containers only"
	@echo "  make db-migrate    - Run database migrations"
	@echo "  make db-reset      - Reset database (⚠️ deletes all data)"
	@echo ""
	@echo "📊 Monitoring:"
	@echo "  make logs       - Show container logs"
	@echo "  make status     - Show service status"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test       - Test API endpoints"

# Setup everything
setup:
	@echo "🔧 Setting up Todo List Application..."
	@echo "📦 Installing backend dependencies..."
	cd backend && bun install
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "🐳 Starting database containers..."
	docker compose up -d postgres pgadmin
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	sleep 10
	@echo "🛢️ Setting up database..."
	cd backend && npx prisma generate && npx prisma db push
	@echo "✅ Setup completed successfully!"
	@echo ""
	@echo "🔗 Access URLs:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:3001"
	@echo "  pgAdmin:  http://localhost:5050 (admin@todoapp.com / admin123)"

# Start all services
start:
	@echo "🚀 Starting all services..."
	docker compose up -d
	@echo "⏳ Waiting for services to be ready..."
	sleep 5
	cd backend && bun index.ts &
	cd frontend && npm run dev &
	@echo "✅ All services started!"

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
	docker compose down
	@pkill -f "bun index.ts" || true
	@pkill -f "npm run dev" || true
	@echo "✅ All services stopped!"

# Restart all services
restart: stop start

# Clean up everything
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker compose down -v
	docker system prune -f
	@echo "✅ Cleanup completed!"

# Development - Backend only
dev-backend:
	@echo "🔧 Starting backend in development mode..."
	docker compose up -d postgres pgadmin
	sleep 5
	cd backend && bun --watch index.ts

# Development - Frontend only
dev-frontend:
	@echo "🔧 Starting frontend in development mode..."
	cd frontend && npm run dev

# Database only
db-up:
	@echo "🛢️ Starting database containers..."
	docker compose up -d postgres pgadmin

# Database migration
db-migrate:
	@echo "🛢️ Running database migrations..."
	cd backend && npx prisma generate && npx prisma db push

# Database reset
db-reset:
	@echo "⚠️ Resetting database (this will delete all data)..."
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	cd backend && npx prisma db push --force-reset

# Open Prisma Studio
db-studio:
	@echo "📊 Opening Prisma Studio..."
	cd backend && npx prisma studio

# Show logs
logs:
	@echo "📋 Showing container logs..."
	docker compose logs -f

# Show status
status:
	@echo "📊 Service Status:"
	@echo ""
	@echo "🐳 Docker Containers:"
	docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "🌐 Service Health:"
	@curl -s http://localhost:3001/ > /dev/null 2>&1 && echo "✅ Backend (3001): Running" || echo "❌ Backend (3001): Not responding"
	@curl -s http://localhost:3000/ > /dev/null 2>&1 && echo "✅ Frontend (3000): Running" || echo "❌ Frontend (3000): Not responding"
	@curl -s http://localhost:5050/ > /dev/null 2>&1 && echo "✅ pgAdmin (5050): Running" || echo "❌ pgAdmin (5050): Not responding"

# Test API endpoints
test:
	@echo "🧪 Testing API endpoints..."
	@echo ""
	@echo "📋 GET /api/todos:"
	@curl -s http://localhost:3001/api/todos | head -200
	@echo ""
	@echo ""
	@echo "➕ POST /api/todos (creating test todo):"
	@curl -s -X POST http://localhost:3001/api/todos \
		-H "Content-Type: application/json" \
		-d '{"title":"Test Todo from Makefile","description":"Testing API functionality"}'
	@echo ""
	@echo ""
	@echo "✅ API tests completed!"