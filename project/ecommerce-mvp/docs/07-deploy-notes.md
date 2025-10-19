# 07 - Deployment Notes

## Target Environment

### Platform
- **OS:** WSL 2 (Windows Subsystem for Linux) - Ubuntu 22.04 LTS preferred
- **Container Runtime:** Docker 24+ (native Linux, not Docker Desktop)
- **Orchestration:** Docker Compose v2
- **Shell:** Bash (default in WSL)

### System Requirements

**Minimum:**
- WSL 2 installed and configured
- 4 GB RAM available
- 10 GB free disk space
- Docker and Docker Compose installed in WSL

**Recommended:**
- 8 GB RAM available
- 20 GB free disk space
- SSD for better I/O performance

### Port Requirements

**Required Ports (must be free):**
- `3000` - Frontend (Next.js)
- `4000` - Backend API (Elysia)
- `5432` - PostgreSQL (internal only, not exposed to host)

**Check Port Availability:**
```bash
# Check if port is in use
sudo lsof -i :3000
sudo lsof -i :4000
sudo netstat -tuln | grep -E '3000|4000'
```

---

## Pre-Deployment Checklist

### WSL Setup

- [ ] WSL 2 installed on Windows
- [ ] Ubuntu 22.04 LTS installed in WSL
- [ ] WSL updated to latest version

**Verify WSL:**
```bash
wsl --version
wsl -l -v  # Should show "Running" and version 2
```

### Docker Setup

- [ ] Docker installed in WSL (not Docker Desktop)
- [ ] Docker service running
- [ ] Docker Compose plugin installed
- [ ] User added to docker group

**Install Docker in WSL:**
```bash
# Update package list
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group (logout/login required)
sudo usermod -aG docker $USER

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
docker compose version
```

### Environment Configuration

- [ ] `.env` files created from templates
- [ ] Database credentials set (strong passwords)
- [ ] JWT secret generated (32+ characters, random)
- [ ] Payment gateway test keys configured
- [ ] All secrets different from examples

**Generate Strong Secrets:**
```bash
# Generate random JWT secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### File System Setup

- [ ] Project cloned to WSL filesystem (not `/mnt/c/`)
- [ ] Volume directories created
- [ ] Permissions set correctly

**Recommended Location:**
```bash
# Clone to WSL home directory, not Windows mount
cd ~
git clone <repository-url> ecommerce-mvp
cd ecommerce-mvp

# Create volume directories
mkdir -p data/postgres
chmod -R 755 data
```

**Why WSL filesystem?**
- Much faster file I/O
- Better Docker performance
- Avoids Windows/Linux permission issues

---

## Environment Files Setup

### Backend Environment (.env)

**Location:** `app/api/.env`

**Create from template:**
```bash
cp .env.example app/api/.env
```

**Required Variables:**
```bash
# Database
DATABASE_URL="postgresql://ecommerce_user:CHANGE_THIS_PASSWORD@db:5432/ecommerce_db"

# Authentication
JWT_SECRET="CHANGE_THIS_TO_RANDOM_32CHAR_STRING"
JWT_EXPIRES_IN="7d"

# Payment Gateway (Test Mode)
STRIPE_SECRET_KEY="sk_test_YOUR_STRIPE_SECRET_KEY"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_STRIPE_PUBLISHABLE_KEY"
# Or for Omise:
# OMISE_SECRET_KEY="skey_test_YOUR_OMISE_SECRET_KEY"
# OMISE_PUBLIC_KEY="pkey_test_YOUR_OMISE_PUBLIC_KEY"

# Server
PORT=4000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

**Security Notes:**
- Replace ALL placeholder values
- Use different passwords for each environment
- Never commit this file to Git (already in `.gitignore`)

---

### Frontend Environment (.env.local)

**Location:** `app/web/.env.local`

**Create from template:**
```bash
cp .env.example app/web/.env.local
```

**Required Variables:**
```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Payment Gateway Public Key (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_STRIPE_PUBLISHABLE_KEY"
# Or for Omise:
# NEXT_PUBLIC_OMISE_PUBLIC_KEY="pkey_test_YOUR_OMISE_PUBLIC_KEY"
```

**Important:**
- Only `NEXT_PUBLIC_*` variables are exposed to browser
- Never put secrets without `NEXT_PUBLIC_` prefix in frontend

---

### Docker Compose Environment

**Location:** `.env` (project root, for docker-compose.yml)

```bash
# PostgreSQL Configuration
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
POSTGRES_DB=ecommerce_db

# Note: These must match DATABASE_URL in app/api/.env
```

---

## Docker Compose Configuration

### File Structure

**Location:** `docker-compose.yml` (project root)

### Service Definitions

#### 1. Database Service (db)

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: ecommerce-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    networks:
      - ecommerce-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**Features:**
- Alpine Linux (smaller image)
- Auto-restart on failure
- Persistent volume for data
- Health check for dependent services

---

#### 2. Backend API Service (api)

```yaml
  api:
    build:
      context: ./app/api
      dockerfile: Dockerfile
    container_name: ecommerce-api
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      NODE_ENV: production
    ports:
      - "4000:4000"
    networks:
      - ecommerce-network
    volumes:
      - ./app/api:/app
      - /app/node_modules
    command: npm run start:prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Features:**
- Builds from local Dockerfile
- Waits for database health check
- Exposes port 4000 to host
- Volume mount for development (can remove for production)
- Health check endpoint

**For Development (hot reload):**
```yaml
    command: npm run dev
    volumes:
      - ./app/api:/app
      - /app/node_modules
```

---

#### 3. Frontend Web Service (web)

```yaml
  web:
    build:
      context: ./app/web
      dockerfile: Dockerfile
    container_name: ecommerce-web
    restart: unless-stopped
    depends_on:
      - api
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
    ports:
      - "3000:3000"
    networks:
      - ecommerce-network
    volumes:
      - ./app/web:/app
      - /app/node_modules
      - /app/.next
```

**Features:**
- Builds Next.js application
- Exposes port 3000 to host
- Volume mount for development
- Excludes node_modules and .next from mount

---

### Networks Configuration

```yaml
networks:
  ecommerce-network:
    driver: bridge
```

**Why custom network?**
- Services can communicate by service name
- Isolated from other Docker networks
- Better security

---

### Volumes Configuration

```yaml
volumes:
  postgres-data:
    driver: local
```

**Optional:** Use named volume instead of bind mount for production

---

## Initial Deployment

### Step 1: Clone Repository

```bash
# Clone to WSL filesystem (important!)
cd ~
git clone https://github.com/username/ecommerce-mvp.git
cd ecommerce-mvp
```

---

### Step 2: Configure Environment

```bash
# Create backend .env
cp .env.example app/api/.env
nano app/api/.env  # Edit with your values

# Create frontend .env.local
cp .env.example app/web/.env.local
nano app/web/.env.local  # Edit with your values

# Create docker-compose .env
nano .env  # Add PostgreSQL credentials
```

**Verify no secrets in Git:**
```bash
git status  # .env files should NOT appear
```

---

### Step 3: Create Volume Directories

```bash
mkdir -p data/postgres
chmod -R 755 data

# Verify ownership
ls -la data/
```

---

### Step 4: Build Docker Images

```bash
# Build all services
docker compose build

# Or build specific service
docker compose build api
docker compose build web
```

**Expected Output:**
- No build errors
- Images created successfully
- Prisma Client generated (for api)

**Troubleshooting Build Issues:**
```bash
# Clear build cache if issues
docker compose build --no-cache

# Check Dockerfile syntax
docker compose config
```

---

### Step 5: Start Services

```bash
# Start all services in detached mode
docker compose up -d

# Or start with logs visible
docker compose up
```

**Verify Services Running:**
```bash
docker compose ps

# Expected output:
# NAME              STATUS              PORTS
# ecommerce-db      Up (healthy)       
# ecommerce-api     Up                  0.0.0.0:4000->4000/tcp
# ecommerce-web     Up                  0.0.0.0:3000->3000/tcp
```

---

### Step 6: Run Database Migrations

```bash
# Apply Prisma migrations
docker compose exec api npx prisma migrate deploy

# Verify migration
docker compose exec api npx prisma migrate status
```

**Expected Output:**
- All migrations applied
- Database schema created
- No pending migrations

**If Migration Fails:**
```bash
# Check database connection
docker compose exec api npx prisma db execute --stdin <<< "SELECT 1"

# View logs
docker compose logs db
docker compose logs api
```

---

### Step 7: Seed Database

```bash
# Run seed script
docker compose exec api npx prisma db seed

# Or manually run seed
docker compose exec api npm run seed
```

**Verify Seed Data:**
```bash
# Access database
docker compose exec db psql -U ecommerce_user -d ecommerce_db

# In psql:
\dt  # List tables
SELECT * FROM "User";
SELECT * FROM "Product";
\q   # Quit
```

---

### Step 8: Verify Deployment

```bash
# Check all services healthy
docker compose ps

# Test backend health
curl http://localhost:4000/health
# Expected: {"status":"ok","timestamp":"..."}

curl http://localhost:4000/health/db
# Expected: {"status":"ok","database":"connected"}

# Test frontend (in browser or curl)
curl -I http://localhost:3000
# Expected: HTTP/1.1 200 OK
```

**Manual Browser Test:**
1. Open `http://localhost:3000` - Should see landing page
2. Navigate to `/products` - Should see product list
3. Check `/auth/signin` - Should see signin form
4. Backend API: `http://localhost:4000/products` - Should return JSON

---

## Post-Deployment Verification

### Functional Checks

- [ ] Frontend loads without errors
- [ ] API responds to requests
- [ ] Database connection working
- [ ] Products display correctly
- [ ] Authentication pages accessible
- [ ] No console errors in browser
- [ ] Docker logs show no critical errors

### Performance Checks

```bash
# Check container resource usage
docker stats

# Check disk usage
docker system df
du -sh data/postgres
```

---

## Common Deployment Operations

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web
docker compose logs -f db

# Last 100 lines
docker compose logs --tail=100 api

# Since specific time
docker compose logs --since 1h api
```

---

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart api

# Stop and start (full restart)
docker compose down
docker compose up -d
```

---

### Update Code (Git Pull)

```bash
# Pull latest changes
git pull origin main

# Rebuild changed services
docker compose build

# Restart services
docker compose up -d

# Run new migrations if any
docker compose exec api npx prisma migrate deploy
```

---

### Database Operations

**Backup Database:**
```bash
# Dump database to SQL file
docker compose exec -T db pg_dump -U ecommerce_user ecommerce_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file created
ls -lh backup_*.sql
```

**Restore Database:**
```bash
# Stop API to prevent connections
docker compose stop api

# Restore from backup
docker compose exec -T db psql -U ecommerce_user ecommerce_db < backup_20240101_120000.sql

# Restart API
docker compose start api
```

**Reset Database (WARNING: Deletes all data!):**
```bash
# Stop services
docker compose down

# Remove volume
sudo rm -rf data/postgres/*

# Start services
docker compose up -d

# Re-run migrations and seed
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

---

### Update Dependencies

```bash
# Update backend dependencies
cd app/api
npm update
npm audit fix

# Update frontend dependencies
cd ../web
npm update
npm audit fix

# Rebuild containers
cd ../..
docker compose build
docker compose up -d
```

---

### Scale Services (Future)

```bash
# Run multiple instances of a service
docker compose up -d --scale web=3

# Requires load balancer (Nginx/Traefik)
```

---

## Monitoring & Health

### Resource Monitoring

```bash
# Real-time container stats
docker stats

# Disk usage
docker system df

# Volume size
du -sh data/postgres

# Check container logs size
docker compose logs api 2>&1 | wc -l
```

---

### Health Checks

**Backend Health Endpoints:**
- `GET /health` - Basic health check
- `GET /health/db` - Database connectivity

**Automated Health Monitoring (Future):**
```bash
# Cron job to check health
*/5 * * * * curl -f http://localhost:4000/health || echo "API Down" | mail -s "Alert" admin@example.com
```

---

## Troubleshooting

### Service Won't Start

**Check logs:**
```bash
docker compose logs <service-name>
docker compose ps -a  # Show stopped containers
```

**Common Causes:**
- Port already in use
- Incorrect environment variables
- Missing dependencies
- Volume permission issues

**Solutions:**
```bash
# Port conflict
sudo lsof -i :3000
# Kill process or change port in docker-compose.yml

# Environment variable issues
docker compose config  # Validates syntax and shows final config

# Permission issues
sudo chown -R $USER:$USER data/
chmod -R 755 data/
```

---

### Database Connection Errors

**Symptoms:**
- API logs show "ECONNREFUSED"
- Prisma can't connect
- Health check fails

**Debug Steps:**
```bash
# Check database service health
docker compose ps db
# Should show "Up (healthy)"

# Check database logs
docker compose logs db

# Verify DATABASE_URL format
docker compose exec api printenv DATABASE_URL
# Should be: postgresql://user:pass@db:5432/dbname

# Test connection from API container
docker compose exec api npx prisma db execute --stdin <<< "SELECT 1"
```

**Common Causes:**
- Database not fully started (wait for health check)
- Wrong credentials in DATABASE_URL
- Service name mismatch (should be `db` not `localhost`)

---

### Migration Errors

**Issue: Migration fails to apply**

```bash
# Check migration status
docker compose exec api npx prisma migrate status

# View migration SQL
cat app/api/prisma/migrations/*/migration.sql

# Force reset (development only!)
docker compose exec api npx prisma migrate reset
```

**Issue: "Migration already applied"**

```bash
# Mark migration as applied without running
docker compose exec api npx prisma migrate resolve --applied <migration-name>
```

---

### Container Crashes Immediately

```bash
# View exit logs
docker compose logs --tail=50 <service-name>

# Check container exit code
docker compose ps -a

# Common issues:
# - Missing CMD in Dockerfile
# - Build errors not visible in build output
# - Incorrect entrypoint
```

---

### Performance Issues

**Slow Builds:**
```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker compose build

# Clear build cache
docker builder prune
```

**Slow Volume I/O:**
- Ensure project is in WSL filesystem (not `/mnt/c/`)
- Use named volumes instead of bind mounts for production

**High Memory Usage:**
```bash
# Check memory limits
docker stats

# Set memory limits in docker-compose.yml
services:
  api:
    mem_limit: 512m
    mem_reservation: 256m
```

---

### WSL-Specific Issues

**Docker daemon not running:**
```bash
sudo systemctl status docker
sudo systemctl start docker

# Enable auto-start
sudo systemctl enable docker
```

**Permission denied on /var/run/docker.sock:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
exit  # Exit WSL
wsl  # Re-enter WSL
```

**Windows firewall blocking ports:**
- Add inbound rules for ports 3000, 4000 in Windows Firewall
- Or temporarily disable firewall for testing

---

## Security Considerations

### Environment Security

- [ ] All `.env` files in `.gitignore`
- [ ] No secrets in `docker-compose.yml` (use env files)
- [ ] Strong, unique passwords for each environment
- [ ] JWT secret minimum 32 characters
- [ ] Payment gateway keys are test mode only

---

### Network Security

**Production Recommendations:**
- [ ] Don't expose database port to host (current: correct)
- [ ] Use reverse proxy (Nginx/Caddy) for SSL/TLS
- [ ] Set up firewall rules in WSL

**Basic Firewall (UFW):**
```bash
sudo apt-get install ufw
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 4000/tcp  # API
sudo ufw deny 5432/tcp   # Database
sudo ufw enable
```

---

### Container Security

```bash
# Scan images for vulnerabilities
docker scout quickview

# Update base images regularly
docker compose pull
docker compose build --pull
```

---

### Access Control

**Recommendations:**
- Admin routes protected by middleware
- JWT tokens in httpOnly cookies (not localStorage)
- CORS properly configured
- Rate limiting implemented (future)

---

## Backup Strategy

### Automated Backups (Recommended)

**Backup Script:**
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="$HOME/backups/ecommerce"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
docker compose exec -T db pg_dump -U ecommerce_user ecommerce_db | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
```

**Schedule with Cron:**
```bash
chmod +x backup.sh

# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/user/ecommerce-mvp/backup.sh >> /home/user/backups/backup.log 2>&1
```

---

## Rollback Procedure

### Code Rollback

```bash
# Stop services
docker compose down

# Checkout previous version
git log --oneline  # Find stable commit
git checkout <commit-hash>

# Rebuild
docker compose build
docker compose up -d
```

---

### Database Rollback

**If schema changed, restore from backup:**
```bash
docker compose stop api

# Restore backup
gunzip < $BACKUP_DIR/db_20240101_020000.sql.gz | docker compose exec -T db psql -U ecommerce_user ecommerce_db

docker compose start api
```

---

## Production Readiness Checklist

### Before Production Deployment:

- [ ] All environment variables set to production values
- [ ] Strong, unique passwords generated
- [ ] JWT secret is production secret (not test)
- [ ] Payment gateway switched to live keys
- [ ] HTTPS/SSL configured (reverse proxy)
- [ ] Database backups automated
- [ ] Monitoring and alerting set up
- [ ] Firewall rules configured
- [ ] Rate limiting implemented
- [ ] Error tracking service integrated (Sentry)
- [ ] Log aggregation configured
- [ ] Health check monitoring
- [ ] Disaster recovery plan documented

---

## Useful Commands Reference

```bash
# Docker Compose Commands
docker compose up -d                    # Start services
docker compose down                     # Stop services
docker compose down -v                  # Stop and remove volumes
docker compose restart                  # Restart services
docker compose ps                       # List services
docker compose logs -f <service>        # Follow logs
docker compose exec <service> bash      # Access container shell
docker compose build --no-cache         # Rebuild from scratch

# Database Commands
docker compose exec db psql -U user -d db    # Access PostgreSQL
docker compose exec api npx prisma studio    # Prisma Studio (GUI)
docker compose exec api npx prisma migrate dev  # Dev migration

# Docker Cleanup
docker system prune -a                  # Remove unused images
docker volume prune                     # Remove unused volumes
docker compose down --rmi all           # Remove all images
```

---

## Support & Documentation

### Internal Documentation
- [Architecture Overview](04-architecture.md)
- [Data Model](03-data-model.md)
- [CI/CD Process](06-ci-cd.md)
- [Task List](../TASKS.md)

### External Resources
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [WSL 2 Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Last Updated:** Phase 1 Complete  
**Next Review:** After Phase 2 implementation
# Edit .env files
docker compose down
docker compose up -d
```

---

## Troubleshooting

### Service Won't Start
```bash
docker compose logs <service-name>
docker compose ps -a
```

### Database Connection Errors
- Check `DATABASE_URL` format: `postgresql://user:password@db:5432/dbname`
- Verify database service is running: `docker compose ps db`
- Check logs: `docker compose logs db`

### Port Already in Use
```bash
sudo lsof -i :3000  # Find process using port
# Change port in docker-compose.yml or kill conflicting process
```

### Volume Permission Issues
```bash
sudo chown -R $USER:$USER data/
chmod -R 755 data/
```

### WSL-Specific Issues
- Ensure Docker is running: `sudo systemctl status docker`
- Check WSL version: `wsl --version` (WSL 2 preferred)
- Verify Linux paths in `docker-compose.yml` (no Windows paths)

---

## Security Notes (Production Future)

- [ ] Use strong, unique passwords for database
- [ ] Rotate JWT secrets regularly
- [ ] Restrict database port (not exposed to host)
- [ ] Enable HTTPS (reverse proxy with Nginx/Caddy)
- [ ] Use Docker secrets instead of .env files
- [ ] Implement rate limiting
- [ ] Set up firewall rules (UFW)

---

## Monitoring & Logs

### View Logs
```bash
docker compose logs -f          # All services
docker compose logs -f api      # Backend only
docker compose logs -f db       # Database only
```

### Disk Usage
```bash
docker system df
docker volume ls
du -sh data/postgres
```

### Container Stats
```bash
docker stats
```

---

## Scaling Notes (Future)

For MVP, single instance is sufficient. Future considerations:
- Load balancer (Nginx) for multiple web instances
- Database read replicas
- Redis for session storage
- Kubernetes migration for cloud deployment

---

## Rollback Procedure

1. Stop services: `docker compose down`
2. Checkout previous stable tag: `git checkout v1.0.0`
3. Rebuild: `docker compose build`
4. Restore database backup if schema changed
5. Start services: `docker compose up -d`
6. Verify: `curl http://localhost:4000/health`