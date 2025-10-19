# 06 - CI/CD Plan (Outline)

## Continuous Integration (CI)

### Goals
- Automated testing on every commit
- Lint and type-check code
- Build verification
- Prevent broken code from merging

---

## GitHub Actions Workflow Configuration

### Workflow File Location
- [.github/workflows/ci.yml](.github/workflows/ci.yml)

### Trigger Events
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

---

## CI Pipeline Stages

### Stage 1: Setup & Dependencies

**Jobs:**
- Checkout code
- Setup Node.js (v18 or v20)
- Setup Bun runtime (for backend)
- Cache dependencies
- Install backend dependencies
- Install frontend dependencies

**Success Criteria:**
- All dependencies installed without errors
- Lockfiles up to date

**Configuration Example:**
```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install Backend Dependencies
        working-directory: ./app/api
        run: npm ci
      - name: Install Frontend Dependencies
        working-directory: ./app/web
        run: npm ci
```

---

### Stage 2: Lint & Format Check

**Backend Linting:**
- Run ESLint on `app/api/src/**/*.ts`
- Check for linting errors and warnings
- Fail build on errors

**Frontend Linting:**
- Run ESLint on `app/web/src/**/*.{ts,tsx}`
- Check for linting errors and warnings
- Fail build on errors

**Format Check:**
- Run Prettier check on all TypeScript files
- Ensure code formatted consistently

**Configuration Example:**
```yaml
lint:
  runs-on: ubuntu-latest
  needs: setup
  steps:
    - name: Lint Backend
      working-directory: ./app/api
      run: npm run lint
    - name: Lint Frontend
      working-directory: ./app/web
      run: npm run lint
    - name: Check Formatting
      run: npx prettier --check "**/*.{ts,tsx,json,md}"
```

**Required Scripts in package.json:**
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\""
  }
}
```

---

### Stage 3: Type Checking

**Backend Type Check:**
- Run TypeScript compiler (`tsc --noEmit`)
- Verify all types are correct
- No implicit any or type errors

**Frontend Type Check:**
- Run TypeScript compiler for Next.js
- Check all component props and types

**Configuration Example:**
```yaml
typecheck:
  runs-on: ubuntu-latest
  needs: setup
  steps:
    - name: TypeCheck Backend
      working-directory: ./app/api
      run: npm run typecheck
    - name: TypeCheck Frontend
      working-directory: ./app/web
      run: npm run typecheck
```

**Required Scripts:**
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

---

### Stage 4: Database Schema Validation

**Prisma Schema Validation:**
- Validate Prisma schema syntax
- Check for model relationship errors
- Ensure generators configured correctly

**Configuration Example:**
```yaml
database:
  runs-on: ubuntu-latest
  needs: setup
  steps:
    - name: Validate Prisma Schema
      working-directory: ./app/api
      run: npx prisma validate
    - name: Check Migration Files
      working-directory: ./app/api
      run: npx prisma migrate diff --from-schema-datamodel ./prisma/schema.prisma --to-schema-datamodel ./prisma/schema.prisma --script
```

**Success Criteria:**
- Schema validation passes
- No untracked schema changes

---

### Stage 5: Build Verification

**Backend Build:**
- Compile TypeScript to JavaScript
- Verify no build errors
- Generate Prisma Client

**Frontend Build:**
- Run Next.js production build
- Verify no build errors
- Check for build warnings

**Configuration Example:**
```yaml
build:
  runs-on: ubuntu-latest
  needs: [lint, typecheck, database]
  steps:
    - name: Generate Prisma Client
      working-directory: ./app/api
      run: npx prisma generate
    
    - name: Build Backend
      working-directory: ./app/api
      run: npm run build
    
    - name: Build Frontend
      working-directory: ./app/web
      run: npm run build
      env:
        NEXT_PUBLIC_API_URL: http://localhost:4000
```

**Required Scripts:**
```json
{
  "scripts": {
    "build": "tsc"
  }
}
```

**Success Criteria:**
- Both builds complete successfully
- No TypeScript errors
- Prisma Client generated

---

### Stage 6: Unit Tests

**Backend Unit Tests:**
- Test utility functions
- Test service layer logic
- Test authentication helpers

**Frontend Unit Tests (Optional for MVP):**
- Test utility functions
- Test React components (if time allows)

**Configuration Example:**
```yaml
test:
  runs-on: ubuntu-latest
  needs: build
  steps:
    - name: Run Backend Tests
      working-directory: ./app/api
      run: npm run test
      env:
        DATABASE_URL: postgresql://test:test@localhost:5432/test_db
```

**Required Scripts:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**Test Framework:**
- Backend: Vitest or Bun Test
- Frontend: Jest + React Testing Library (optional)

---

### Stage 7: Integration Tests

**Backend API Tests:**
- Test API endpoints with temporary database
- Use GitHub Actions PostgreSQL service
- Run integration test suite

**Configuration Example:**
```yaml
integration:
  runs-on: ubuntu-latest
  needs: test
  
  services:
    postgres:
      image: postgres:16-alpine
      env:
        POSTGRES_USER: test
        POSTGRES_PASSWORD: test
        POSTGRES_DB: test_db
      ports:
        - 5432:5432
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
  
  steps:
    - name: Run Migrations
      working-directory: ./app/api
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: postgresql://test:test@localhost:5432/test_db
    
    - name: Run Integration Tests
      working-directory: ./app/api
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://test:test@localhost:5432/test_db
        JWT_SECRET: test-secret-key-for-ci
```

**Required Scripts:**
```json
{
  "scripts": {
    "test:integration": "vitest run --config vitest.integration.config.ts"
  }
}
```

---

### Stage 8: Security Scanning (Optional)

**Dependency Audit:**
- Check for known vulnerabilities
- Fail on high/critical vulnerabilities

**Configuration Example:**
```yaml
security:
  runs-on: ubuntu-latest
  needs: setup
  steps:
    - name: Audit Backend Dependencies
      working-directory: ./app/api
      run: npm audit --audit-level=high
    
    - name: Audit Frontend Dependencies
      working-directory: ./app/web
      run: npm audit --audit-level=high
```

---

## Environment Variables for CI

### GitHub Secrets Configuration

**Navigate to:** Repository Settings → Secrets and variables → Actions

**Required Secrets (for future use):**
- `DATABASE_URL_TEST` - Test database connection string
- `JWT_SECRET_TEST` - Test JWT secret for integration tests
- `STRIPE_SECRET_KEY_TEST` - Stripe test mode secret key (if testing payment)

**Public Variables:**
- `NEXT_PUBLIC_API_URL` - Can be set in workflow directly

**Usage in Workflow:**
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
  JWT_SECRET: ${{ secrets.JWT_SECRET_TEST }}
```

---

## CI Status Badges

**Add to README.md:**
```markdown
[![CI](https://github.com/username/ecommerce-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/username/ecommerce-mvp/actions/workflows/ci.yml)
```

---

## Continuous Deployment (CD)

### MVP Deployment Strategy: Manual

**Why Manual for MVP:**
- Simpler to implement and debug
- Full control over deployment timing
- No CD infrastructure setup needed
- Suitable for development/testing phase

**Manual Deployment Steps:**
See [07-deploy-notes.md](07-deploy-notes.md) for full deployment guide.

---

### Future: Automated Deployment

**When to Implement:**
- After MVP validation
- When moving to production
- When team grows

**Potential Setup:**
1. **Staging Environment:**
   - Auto-deploy from `develop` branch
   - Triggered on merge to develop
   - Runs deployment script on staging server

2. **Production Environment:**
   - Manual approval workflow
   - Deploy from tagged releases (v1.0.0)
   - Run health checks post-deployment
   - Automatic rollback on failure

**Configuration Example (Future):**
```yaml
deploy-staging:
  runs-on: ubuntu-latest
  needs: [build, test, integration]
  if: github.ref == 'refs/heads/develop'
  steps:
    - name: Deploy to Staging
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USER }}
        key: ${{ secrets.STAGING_SSH_KEY }}
        script: |
          cd /var/www/ecommerce-mvp
          git pull origin develop
          docker compose build
          docker compose up -d
          docker compose exec api npx prisma migrate deploy
```

---

## Monitoring & Health Checks

### Backend Health Endpoint

**Implementation Required:**
```typescript
// app/api/src/routes/health.ts
app.get('/health', () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

app.get('/health/db', async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  } catch (error) {
    return { status: 'error', database: 'disconnected' };
  }
});
```

**CI Health Check:**
```yaml
- name: Health Check
  run: |
    sleep 5
    curl -f http://localhost:4000/health || exit 1
    curl -f http://localhost:4000/health/db || exit 1
```

---

## Logging Strategy

### CI Logs
- GitHub Actions automatically captures all output
- Failed jobs show logs inline
- Download logs for debugging

### Application Logs (Future)
- Structured JSON logging
- Log aggregation (CloudWatch, Datadog)
- Error tracking (Sentry, Rollbar)

**Backend Logging Setup (Future):**
```typescript
// app/api/src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});
```

---

## Rollback Strategy

### Git-Based Rollback

**For Code Issues:**
```bash
# Identify stable version
git log --oneline

# Revert to previous commit
git revert <commit-hash>
git push origin main

# Or reset to specific tag
git checkout v1.0.0
git push --force origin main  # Use with caution
```

### Database Rollback

**For Migration Issues:**
```bash
# Generate rollback migration
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource DATABASE_URL \
  --script > rollback.sql

# Review and apply manually
```

**Prisma Rollback (Limited):**
- Prisma doesn't support automatic rollbacks
- Keep database backups before major migrations
- Test migrations on staging first

---

## Branch Protection Rules

### Recommended Settings

**For `main` branch:**
- Require pull request reviews (1 approver minimum)
- Require status checks to pass before merging
  - `lint` check
  - `typecheck` check
  - `build` check
  - `test` check
- Require branches to be up to date before merging
- Do not allow force pushes
- Do not allow deletions

**Configuration Path:**
Repository Settings → Branches → Add branch protection rule

---

## CI Performance Optimization

### Caching Strategies

**Node Modules Cache:**
```yaml
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      app/api/node_modules
      app/web/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

**Prisma Cache:**
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.cache/prisma
    key: ${{ runner.os }}-prisma-${{ hashFiles('**/schema.prisma') }}
```

### Parallel Jobs
- Run lint, typecheck, and database validation in parallel
- Only run build after all checks pass
- Run tests in parallel when possible

---

## CI Troubleshooting

### Common Issues

**Issue: Dependencies fail to install**
- Solution: Clear cache, update lockfile
- Check: Node version mismatch

**Issue: Prisma Client not generated**
- Solution: Add `npx prisma generate` step before build
- Check: DATABASE_URL environment variable set

**Issue: Tests timeout**
- Solution: Increase timeout in test config
- Check: Database service health

**Issue: Build fails on CI but works locally**
- Solution: Check environment variables
- Check: Node version consistency

---

## Acceptance Criteria for MVP CI

### Phase 2 (Data & Auth):
- [x] CI workflow file created
- [ ] Lint stage passing
- [ ] Type check stage passing
- [ ] Build stage passing
- [ ] Unit tests implemented and passing
- [ ] Integration tests implemented and passing

### Phase 3 (Checkout & Admin):
- [ ] All CI stages green on main branch
- [ ] PR checks enforced
- [ ] Branch protection enabled
- [ ] CI badge in README

---

## Future Enhancements

### Advanced CI Features
- [ ] E2E tests with Playwright
- [ ] Visual regression testing
- [ ] Performance benchmarking
- [ ] Code coverage reporting
- [ ] Automated dependency updates (Dependabot)

### CD Features
- [ ] Staging environment deployment
- [ ] Blue-green deployment
- [ ] Canary releases
- [ ] Automated smoke tests post-deploy
- [ ] Rollback automation

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js CI/CD Guide](https://nextjs.org/docs/deployment)
- [Prisma CI/CD Best Practices](https://www.prisma.io/docs/guides/deployment/deploy-database-changes-with-prisma-migrate)

**Last Updated:** Phase 1 Complete