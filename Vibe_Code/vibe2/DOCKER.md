# Vibe Code Docker Setup

This project uses Docker and Docker Compose to manage the frontend, backend, and database services.

## Services

- **Database**: PostgreSQL 16 Alpine running on port 5432
- **Backend**: Bun-based TypeScript application running on port 3001
- **Frontend**: Next.js application running on port 3000

## Prerequisites

- Docker
- Docker Compose

## Setup

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your preferred values:**
   - Change the database password and credentials
   - Adjust other environment variables as needed

## Quick Start

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Start services in detached mode:**
   ```bash
   docker-compose up -d
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **View logs:**
   ```bash
   # All services
   docker-compose logs
   
   # Specific service
   docker-compose logs frontend
   docker-compose logs backend
   docker-compose logs database
   ```

5. **Rebuild a specific service:**
   ```bash
   docker-compose build frontend
   docker-compose build backend
   ```

## Accessing the Applications

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Database**: localhost:5432

## Health Checks

All services include health checks to ensure proper startup order:
- Database must be ready before backend starts
- Backend must be healthy before frontend starts

## Database

- **Data Persistence**: Database data is stored in a Docker volume
- **Initialization**: Place SQL scripts in `database/init/` directory
- **Backup**: Use `docker-compose exec database pg_dump -U vibeuser vibedb > backup.sql`

## Security Notes

- Change default passwords in `.env` file
- Never commit `.env` file to version control
- Use `.env.example` as a template for required environment variables

## Development

For development, you might want to use volume mounts to enable hot reloading. You can create a `docker-compose.dev.yml` file with volume mounts for live code changes.

## Docker Commands

- **Remove all containers and images:**
  ```bash
  docker-compose down --rmi all --volumes --remove-orphans
  ```

- **Execute commands in running containers:**
  ```bash
  docker-compose exec frontend sh
  docker-compose exec backend sh
  docker-compose exec database psql -U vibeuser -d vibedb
  ```

- **View service status:**
  ```bash
  docker-compose ps
  ```
