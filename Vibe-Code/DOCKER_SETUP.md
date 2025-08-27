# Docker Setup Guide

## Using PostgreSQL with Docker

This project includes a Docker Compose configuration for running PostgreSQL locally without installing it on your system.

### Prerequisites
- Docker Desktop installed and running
- WSL2 (if on Windows)

### Quick Start

1. **Start the PostgreSQL database:**
   ```bash
   bun run db:up
   # or
   docker-compose up -d postgres
   ```

2. **Verify the database is running:**
   ```bash
   bun run db:logs
   # or
   docker-compose logs postgres
   ```

3. **Set up the database schema:**
   ```bash
   bun run db:setup
   ```

4. **Seed with sample data:**
   ```bash
   bun run db:seed
   ```

5. **Start your application:**
   ```bash
   bun run dev
   ```

### Database Credentials

- **Host:** localhost
- **Port:** 5432
- **Database:** proposal_software_db
- **Username:** postgres
- **Password:** password123

### Optional: pgAdmin (Database Management UI)

Start pgAdmin for a web-based database management interface:

```bash
bun run pgadmin:up
```

Then visit: http://localhost:8080
- **Email:** admin@example.com
- **Password:** admin123

### Useful Docker Commands

```bash
# Start all services (PostgreSQL + pgAdmin)
bun run docker:up

# Stop all services
bun run docker:down

# View logs
bun run docker:logs

# Start only PostgreSQL
bun run db:up

# Stop only PostgreSQL
bun run db:down

# Connect to PostgreSQL directly
docker exec -it proposal-software-db psql -U postgres -d proposal_software_db
```

### Troubleshooting

**Port 5432 already in use:**
```bash
# Stop any existing PostgreSQL services
sudo service postgresql stop
# or change the port in docker-compose.yml
```

**Permission issues:**
```bash
# Make sure Docker has access to your project directory
# On Windows, ensure the drive is shared in Docker Desktop settings
```

**Connection refused:**
```bash
# Check if container is running
docker ps

# Check container logs
docker logs proposal-software-db
```

### Data Persistence

Your database data is persisted in Docker volumes, so it won't be lost when you stop/start containers. To completely reset:

```bash
docker-compose down -v  # This removes volumes too
```
