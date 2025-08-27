@echo off
setlocal enabledelayedexpansion

:: Docker Build Optimization Script for Windows
:: This script provides optimized build commands for different environments

:: Colors for output (Windows compatible)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

:: Functions
:log_info
echo %GREEN%[INFO]%NC% %~1
exit /b

:log_warn
echo %YELLOW%[WARN]%NC% %~1
exit /b

:log_error
echo %RED%[ERROR]%NC% %~1
exit /b

:: Check if Docker is running
:check_docker
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call :log_error "Docker is not running. Please start Docker and try again."
    exit /b 1
)
exit /b

:: Clean up Docker resources
:cleanup
call :log_info "Cleaning up Docker resources..."
docker system prune -f
docker image prune -f
docker volume prune -f
exit /b

:: Build for development
:build_dev
call :log_info "Building for development..."
docker-compose -f docker-compose.yml build --no-cache
call :log_info "Development build completed!"
exit /b

:: Build for production
:build_prod
call :log_info "Building for production..."
docker-compose -f docker-compose.prod.yml build --no-cache --parallel
call :log_info "Production build completed!"
exit /b

:: Start development environment
:start_dev
call :log_info "Starting development environment..."
docker-compose -f docker-compose.yml up -d
call :log_info "Development environment started!"
call :log_info "Frontend: http://localhost:3000"
call :log_info "Backend: http://localhost:5000"
call :log_info "Database: localhost:5432"
exit /b

:: Start production environment
:start_prod
call :log_info "Starting production environment..."
if not exist ".env.production" (
    call :log_warn "Production environment file not found. Creating from template..."
    copy .env.production.template .env.production
    call :log_warn "Please edit .env.production with your production values!"
    exit /b 1
)
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
call :log_info "Production environment started!"
exit /b

:: Stop all services
:stop
call :log_info "Stopping all services..."
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.prod.yml down
call :log_info "All services stopped!"
exit /b

:: Show logs
:logs
if "%~2"=="" (
    docker-compose -f docker-compose.yml logs -f
) else (
    docker-compose -f docker-compose.yml logs -f %2
)
exit /b

:: Health check
:health
call :log_info "Checking service health..."
docker-compose -f docker-compose.yml ps
call :log_info "Service health check completed!"
exit /b

:: Main script
call :check_docker

if "%1"=="dev" (
    call :build_dev
) else if "%1"=="prod" (
    call :build_prod  
) else if "%1"=="start" (
    call :start_dev
) else if "%1"=="start-prod" (
    call :start_prod
) else if "%1"=="stop" (
    call :stop
) else if "%1"=="logs" (
    call :logs %1 %2
) else if "%1"=="health" (
    call :health
) else if "%1"=="cleanup" (
    call :cleanup
) else (
    echo Usage: %0 {dev^|prod^|start^|start-prod^|stop^|logs [service]^|health^|cleanup}
    echo.
    echo Commands:
    echo   dev        - Build for development
    echo   prod       - Build for production
    echo   start      - Start development environment
    echo   start-prod - Start production environment
    echo   stop       - Stop all services
    echo   logs       - Show logs ^(optionally for specific service^)
    echo   health     - Check service health
    echo   cleanup    - Clean up Docker resources
    exit /b 1
)
