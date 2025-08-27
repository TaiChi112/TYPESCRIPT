# Polyrepo Example - Full Stack Application

This is an example of a **Polyrepo** (Multiple Repositories) architecture where different parts of the application are maintained in separate repositories.

## Architecture Overview

```
Polyrepo Structure:
├── frontend-repo/          (Next.js 15 + TypeScript + Bun)
├── backend-repo/           (Express + TypeScript + Prisma + PostgreSQL + Bun)
├── shared-types/           (Shared TypeScript interfaces/types)
└── docs/                   (Documentation and deployment configs)
```

## Repositories

### 1. Frontend Repository (`frontend-repo/`)
- **Framework**: Next.js 15
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Features**: 
  - Server-side rendering
  - API routes integration
  - Modern React patterns

### 2. Backend Repository (`backend-repo/`)
- **Framework**: Express.js
- **Runtime**: Bun
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Features**:
  - RESTful API
  - Database migrations
  - Authentication middleware
  - CORS configuration

### 3. Shared Types Repository (`shared-types/`)
- **Purpose**: Common TypeScript interfaces and types
- **Usage**: Consumed by both frontend and backend
- **Distribution**: Published as npm package or git submodule

## Polyrepo vs Monorepo

### Polyrepo Advantages:
- ✅ **Independent deployments** - Each service can be deployed separately
- ✅ **Team autonomy** - Different teams can work on different repos
- ✅ **Technology diversity** - Each repo can use different tech stacks
- ✅ **Smaller codebases** - Easier to understand and maintain
- ✅ **Independent versioning** - Each service has its own release cycle

### Polyrepo Challenges:
- ❌ **Cross-repo changes** - Coordinating changes across repositories
- ❌ **Dependency management** - Managing shared dependencies
- ❌ **Testing complexity** - Integration testing across services
- ❌ **Code sharing** - Need strategies for shared code/types

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed
- [PostgreSQL](https://www.postgresql.org/) database
- [Git](https://git-scm.com/) for version control

### Setup Instructions

1. **Clone all repositories** (in real polyrepo, these would be separate Git repos):
   ```bash
   git clone <frontend-repo-url>
   git clone <backend-repo-url>
   git clone <shared-types-repo-url>
   ```

2. **Setup Backend**:
   ```bash
   cd backend-repo
   bun install
   cp .env.example .env
   # Configure your database URL in .env
   bunx prisma migrate dev
   bun run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd frontend-repo
   bun install
   cp .env.local.example .env.local
   # Configure API URL in .env.local
   bun run dev
   ```

4. **Setup Shared Types** (if using as package):
   ```bash
   cd shared-types
   bun install
   bun run build
   ```

## Development Workflow

### 1. Making Cross-Repository Changes
```bash
# 1. Update shared types
cd shared-types
# Make changes to types
bun run build
git commit -m "feat: add new user type"
git tag v1.2.0
git push origin v1.2.0

# 2. Update backend to use new types
cd ../backend-repo
bun update @company/shared-types
# Implement backend changes
git commit -m "feat: support new user type"

# 3. Update frontend to use new types
cd ../frontend-repo
bun update @company/shared-types
# Implement frontend changes
git commit -m "feat: add user profile UI"
```

### 2. Local Development
- Use docker-compose for local environment setup
- Each repository can have its own development workflow
- Use API documentation (OpenAPI/Swagger) for contract testing

## Deployment

Each repository can be deployed independently:

- **Frontend**: Vercel, Netlify, or static hosting
- **Backend**: Railway, Heroku, AWS, or containerized deployment
- **Database**: Managed PostgreSQL (AWS RDS, Railway, etc.)

## File Structure

This example contains:
- Complete project setups for each repository
- Configuration files for development and production
- Docker configurations for containerization
- CI/CD pipeline examples
- Documentation and best practices

## Best Practices for Polyrepo

1. **Versioning Strategy**: Use semantic versioning for all repositories
2. **Documentation**: Maintain up-to-date API documentation
3. **Testing**: Implement contract testing between services
4. **Monitoring**: Set up observability across all services
5. **Security**: Implement consistent security practices
6. **Communication**: Use clear commit messages and PR descriptions
