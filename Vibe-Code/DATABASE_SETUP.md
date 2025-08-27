# Environment Configuration Guide

## Database Setup Options

### Option 1: Using Docker (Recommended)
If using Docker, your DATABASE_URL should connect to localhost since Docker maps port 5432:

```env
DATABASE_URL="postgresql://taichi:taichi112@localhost:5432/proposal_software_db"
```

### Option 2: Using Docker Internal Network
If running the backend also in Docker, use the service name:

```env
DATABASE_URL="postgresql://taichi:taichi112@postgres:5432/proposal_software_db"
```

### Current Setup
- ✅ Docker Compose configured correctly
- ✅ PostgreSQL running in container
- ✅ User 'taichi' exists with correct permissions
- ❌ Connection issues due to environment setup

## Quick Fix
Run these commands to get everything working:

```bash
# 1. Ensure Docker is running
docker compose up -d postgres

# 2. Verify database connection
docker exec -it proposal-software-db psql -U taichi -d proposal_software_db -c "SELECT version();"

# 3. Run Prisma setup
bun run db:setup

# 4. Seed the database
bun run db:seed

# 5. Start the application
bun run dev
```
