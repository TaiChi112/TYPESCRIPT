# Phase 6: Deployment

## 📋 Overview
การนำ Todo List Application ไปใช้งานจริง (Production) พร้อมการกำหนดค่า infrastructure, monitoring และ security

---

## 🏗️ Deployment Architecture

### Production Architecture
```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Nginx/CloudFlare]
    end
    
    subgraph "Application Layer"
        FE[Frontend - Vercel/Netlify]
        BE[Backend - Railway/Render]
    end
    
    subgraph "Database Layer"
        DB[PostgreSQL - Supabase/Railway]
        BACKUP[Database Backups]
    end
    
    subgraph "Monitoring"
        LOG[Logging - Winston]
        METRICS[Metrics - Prometheus]
        ALERTS[Alerts - Email/Slack]
    end
    
    LB --> FE
    LB --> BE
    BE --> DB
    DB --> BACKUP
    
    BE --> LOG
    BE --> METRICS
    METRICS --> ALERTS
```

---

## 🚀 Frontend Deployment

### 1. Vercel Deployment (Recommended)

#### Preparation
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

#### Environment Variables
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

#### Vercel Configuration
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  },
  "regions": ["sin1"],
  "functions": {
    "app/page.tsx": {
      "maxDuration": 10
    }
  }
}
```

#### Deployment Commands
```bash
cd frontend

# First deployment
vercel --prod

# Subsequent deployments
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
```

### 2. Alternative: Netlify Deployment

#### Build Configuration
```toml
# netlify.toml
[build]
  base = "frontend/"
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_PUBLIC_API_URL = "https://your-api-domain.com"

[[redirects]]
  from = "/api/*"
  to = "https://your-api-domain.com/api/:splat"
  status = 200
```

### 3. Docker Deployment

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

---

## 🔧 Backend Deployment

### 1. Railway Deployment (Recommended)

#### Railway Configuration
```toml
# railway.toml
[build]
cmd = "bun install"

[deploy]
cmd = "bun start"

[env]
DATABASE_URL = "${{RAILWAY_POSTGRESQL_URL}}"
PORT = "${{PORT}}"
```

#### Environment Variables Setup
```bash
# Set via Railway CLI or Dashboard
railway variables set DATABASE_URL="postgresql://..."
railway variables set PORT="3001"
```

#### Deployment Process
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 2. Alternative: Render Deployment

#### Render Configuration
```yaml
# render.yaml
services:
  - type: web
    name: todo-api
    env: node
    region: singapore
    buildCommand: bun install
    startCommand: bun start
    healthCheckPath: /
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: todo-db
          property: connectionString
      - key: PORT
        value: 3001
    
databases:
  - name: todo-db
    databaseName: todo_db
    user: todo_user
    region: singapore
```

### 3. Docker Deployment

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/ || exit 1

# Start application
CMD ["bun", "start"]
```

---

## 🗄️ Database Deployment

### 1. Supabase (Recommended for PostgreSQL)

#### Setup Process
```bash
# 1. Create Supabase project at https://supabase.com
# 2. Get connection string from project settings
# 3. Update environment variables

# Connection string format:
postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

#### Migration to Production
```bash
# Update .env with production database URL
DATABASE_URL="postgresql://postgres:password@project.supabase.co:5432/postgres"

# Run migrations
npx prisma db push
```

### 2. Alternative: Railway PostgreSQL

#### Setup
```bash
# Add PostgreSQL to Railway project
railway add postgresql

# Get connection string
railway variables

# Use in application
DATABASE_URL="${{RAILWAY_POSTGRESQL_URL}}"
```

### 3. Database Backup Strategy

#### Automated Backups
```bash
#!/bin/bash
# backup.sh

# Environment variables
DB_URL="your_production_database_url"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump "$DB_URL" > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
# aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" s3://your-backup-bucket/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

---

## 📊 Monitoring & Logging

### 1. Application Monitoring

#### Winston Logger Setup
```typescript
// backend/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'todo-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

#### Integration with API
```typescript
// backend/index.ts (updated)
import logger from './lib/logger';

const app = new Elysia()
  .use(cors())
  .onRequest(({ request }) => {
    logger.info(`${request.method} ${request.url}`);
  })
  .onError(({ error, code }) => {
    logger.error(`Error ${code}: ${error.message}`, { stack: error.stack });
  })
  // ... rest of your routes
```

### 2. Health Checks

#### Backend Health Check
```typescript
// Add to backend/index.ts
.get('/health', async () => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      }
    };
  } catch (error) {
    logger.error('Health check failed:', error);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
})
```

### 3. Performance Monitoring

#### Frontend Performance
```typescript
// frontend/lib/analytics.ts
export function trackPageLoad(pageName: string) {
  if (typeof window !== 'undefined') {
    const loadTime = performance.now();
    
    // Send to analytics service
    console.log(`Page ${pageName} loaded in ${loadTime}ms`);
    
    // Optional: Send to Google Analytics, Mixpanel, etc.
  }
}

export function trackAPICall(endpoint: string, duration: number, success: boolean) {
  console.log(`API ${endpoint}: ${duration}ms, Success: ${success}`);
}
```

---

## 🔒 Security Configuration

### 1. Environment Security

#### Production Environment Variables
```bash
# Never commit these to version control!

# Backend (.env.production)
DATABASE_URL=postgresql://secure_connection_string
JWT_SECRET=your_very_long_random_secret_key
API_RATE_LIMIT=100
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://your-secure-api-domain.com
NEXT_PUBLIC_ENV=production
```

### 2. CORS Configuration (Production)
```typescript
// backend/index.ts (updated for production)
.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

### 3. Rate Limiting
```typescript
// backend/lib/rate-limit.ts
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({ tokensPerInterval: 100, interval: 'hour' });

export async function rateLimitMiddleware(request: Request) {
  const remainingTokens = await limiter.removeTokens(1);
  
  if (remainingTokens < 0) {
    throw new Error('Rate limit exceeded');
  }
  
  return remainingTokens;
}
```

---

## 🔄 CI/CD Pipeline

### 1. GitHub Actions

#### Frontend CI/CD
```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [main]
    paths: ['frontend/**']
  pull_request:
    branches: [main]
    paths: ['frontend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run tests
        run: cd frontend && npm test
      
      - name: Build application
        run: cd frontend && npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

#### Backend CI/CD
```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main]
    paths: ['backend/**']
  pull_request:
    branches: [main]
    paths: ['backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: cd backend && bun install
      
      - name: Run tests
        run: cd backend && bun test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up --service backend
        working-directory: ./backend
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code review completed
- [ ] Security audit performed
- [ ] Performance benchmarks met
- [ ] Database migrations tested

### Infrastructure Setup
- [ ] Production database configured
- [ ] Environment variables set securely
- [ ] Domain and SSL certificates configured
- [ ] CDN configured (if applicable)
- [ ] Backup strategy implemented

### Application Deployment
- [ ] Frontend deployed and accessible
- [ ] Backend API deployed and responding
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] Monitoring and logging active

### Post-Deployment
- [ ] Smoke tests completed
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] Team notified of deployment
- [ ] Documentation updated

---

## 🚨 Rollback Plan

### Automated Rollback
```bash
# Vercel rollback
vercel --prod --force

# Railway rollback
railway rollback

# Database rollback (if needed)
npx prisma db push --force-reset
npx prisma db push
```

### Manual Rollback Steps
1. **Identify Issues**: Monitor logs and metrics
2. **Stop Traffic**: Use load balancer to redirect
3. **Rollback Application**: Deploy previous version
4. **Rollback Database**: Apply reverse migrations if needed
5. **Verify System**: Run health checks and tests
6. **Communicate**: Notify team and stakeholders

---

## 🔗 Related Documents
- [Previous Phase: Testing](./05-testing.md)
- [Next Phase: Maintenance](./07-maintenance.md)
- [Project Overview](./README.md)