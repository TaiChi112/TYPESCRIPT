#!/bin/bash

# Docker Build Optimization Script
# This script provides optimized build commands for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Clean up Docker resources
cleanup() {
    log_info "Cleaning up Docker resources..."
    docker system prune -f
    docker image prune -f
    docker volume prune -f
}

# Build for development
build_dev() {
    log_info "Building for development..."
    docker-compose -f docker-compose.yml build --no-cache
    log_info "Development build completed!"
}

# Build for production
build_prod() {
    log_info "Building for production..."
    docker-compose -f docker-compose.prod.yml build --no-cache --parallel
    log_info "Production build completed!"
}

# Start development environment
start_dev() {
    log_info "Starting development environment..."
    docker-compose -f docker-compose.yml up -d
    log_info "Development environment started!"
    log_info "Frontend: http://localhost:3000"
    log_info "Backend: http://localhost:5000"
    log_info "Database: localhost:5432"
}

# Start production environment
start_prod() {
    log_info "Starting production environment..."
    if [ ! -f ".env.production" ]; then
        log_warn "Production environment file not found. Creating from template..."
        cp .env.production.template .env.production
        log_warn "Please edit .env.production with your production values!"
        exit 1
    fi
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
    log_info "Production environment started!"
}

# Stop all services
stop() {
    log_info "Stopping all services..."
    docker-compose -f docker-compose.yml down
    docker-compose -f docker-compose.prod.yml down
    log_info "All services stopped!"
}

# Show logs
logs() {
    local service=$1
    if [ -z "$service" ]; then
        docker-compose -f docker-compose.yml logs -f
    else
        docker-compose -f docker-compose.yml logs -f "$service"
    fi
}

# Health check
health() {
    log_info "Checking service health..."
    docker-compose -f docker-compose.yml ps
    log_info "Service health check completed!"
}

# Security scan
security_scan() {
    log_info "Running security scan..."
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
        -v "$(pwd)":/app \
        securecodewarrior/docker-security-scanning:latest
}

# Main script
main() {
    check_docker
    
    case "$1" in
        "dev")
            build_dev
            ;;
        "prod")
            build_prod
            ;;
        "start")
            start_dev
            ;;
        "start-prod")
            start_prod
            ;;
        "stop")
            stop
            ;;
        "logs")
            logs "$2"
            ;;
        "health")
            health
            ;;
        "cleanup")
            cleanup
            ;;
        "security")
            security_scan
            ;;
        *)
            echo "Usage: $0 {dev|prod|start|start-prod|stop|logs [service]|health|cleanup|security}"
            echo ""
            echo "Commands:"
            echo "  dev        - Build for development"
            echo "  prod       - Build for production"
            echo "  start      - Start development environment"
            echo "  start-prod - Start production environment"
            echo "  stop       - Stop all services"
            echo "  logs       - Show logs (optionally for specific service)"
            echo "  health     - Check service health"
            echo "  cleanup    - Clean up Docker resources"
            echo "  security   - Run security scan"
            exit 1
            ;;
    esac
}

main "$@"
