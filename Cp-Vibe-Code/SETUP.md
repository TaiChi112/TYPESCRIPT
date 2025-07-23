# Installation & Setup Guide

This guide will help you set up and run the Cp-Vibe-Code full-stack application locally.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Bun** >= 1.0.0 ([Install Bun](https://bun.sh/docs/installation))
- **Node.js** >= 18.0.0 ([Install Node.js](https://nodejs.org/))
- **PostgreSQL** >= 14.0.0 ([Install PostgreSQL](https://www.postgresql.org/download/))
- **Git** ([Install Git](https://git-scm.com/downloads))

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Cp-Vibe-Code
```

### 2. Install Dependencies

Install dependencies for all projects:

```bash
# Install root dependencies
bun install

# Install backend dependencies
cd backend
bun install

# Install frontend dependencies
cd ../frontend
bun install

# Install shared dependencies
cd ../shared
bun install
```

### 3. Setup Environment Variables

#### Backend Environment (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/cpvibecode"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment (.env.local)
```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="Cp-Vibe-Code"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### 4. Setup Database

#### Option A: Using Docker (Recommended)

Start PostgreSQL using Docker Compose:
```bash
# From the root directory
docker-compose up -d postgres
```

This will start:
- PostgreSQL on port 5432
- Adminer (Database UI) on port 8080

#### Option B: Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create a database:
```sql
CREATE DATABASE cpvibecode;
```

2. Update the `DATABASE_URL` in `backend/.env` with your credentials.

### 5. Run Database Migrations

```bash
cd backend
bun run db:migrate
```

### 6. Seed the Database (Optional)

```bash
bun run db:seed
```

This creates test users:
- **Email:** admin@example.com, **Password:** password123
- **Email:** user@example.com, **Password:** password123

### 7. Build Shared Package

```bash
cd ../shared
bun run build
```

### 8. Start Development Servers

#### Option A: Start All Services (Recommended)

From the root directory:
```bash
bun run dev
```

This starts:
- Backend API server on http://localhost:3001
- Frontend Next.js app on http://localhost:3000

#### Option B: Start Services Individually

**Backend (Terminal 1):**
```bash
cd backend
bun run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
bun run dev
```

## Accessing the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/api/health
- **Database Admin (Adminer):** http://localhost:8080

## Available Scripts

### Root Directory
- `bun run dev` - Start all development servers
- `bun run build` - Build all projects
- `bun run lint` - Run linting for all projects
- `bun run type-check` - Run TypeScript checking for all projects

### Backend (`/backend`)
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run db:migrate` - Run database migrations
- `bun run db:seed` - Seed database with test data
- `bun run db:studio` - Open Prisma Studio

### Frontend (`/frontend`)
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

### Shared (`/shared`)
- `bun run build` - Build shared types and utilities
- `bun run dev` - Build in watch mode

## Testing the Application

1. **Backend API:** Visit http://localhost:3001/api/health
2. **Frontend:** Visit http://localhost:3000
3. **Authentication:** Use the demo credentials to login:
   - Email: `admin@example.com`
   - Password: `password123`

## Troubleshooting

### Common Issues

#### Database Connection Issues
- Ensure PostgreSQL is running
- Check the `DATABASE_URL` in `backend/.env`
- Verify database exists and credentials are correct

#### Port Already in Use
- Backend (3001): Change `PORT` in `backend/.env`
- Frontend (3000): Next.js will automatically try the next available port

#### Module Not Found Errors
- Ensure all dependencies are installed: `bun install`
- Build the shared package: `cd shared && bun run build`

#### TypeScript Errors
- Run type checking: `bun run type-check`
- Ensure all dependencies are installed
- Check import paths in `tsconfig.json`

### Reset Database

If you need to reset the database:
```bash
cd backend
bun run db:reset
bun run db:seed
```

### Clean Installation

To clean and reinstall everything:
```bash
# Remove all node_modules and build files
bun run clean

# Reinstall dependencies
bun install
cd backend && bun install
cd ../frontend && bun install
cd ../shared && bun install && bun run build
```

## Development Tips

1. **Hot Reload:** Both frontend and backend support hot reload during development
2. **Database Changes:** After modifying `schema.prisma`, run `bun run db:migrate`
3. **Shared Types:** After updating shared types, rebuild with `cd shared && bun run build`
4. **API Testing:** Use tools like Postman or Thunder Client to test API endpoints
5. **Database Management:** Use Prisma Studio (`bun run db:studio`) for database management

## Project Structure

```
├── backend/          # Bun + TypeScript API server
│   ├── src/         # Source code
│   ├── prisma/      # Database schema and migrations
│   └── package.json
├── frontend/         # Next.js 15 React application
│   ├── app/         # App Router pages and layouts
│   ├── components/  # Reusable React components
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utilities and configurations
│   └── package.json
├── shared/           # Shared types and utilities
│   ├── src/         # Shared TypeScript code
│   └── package.json
├── docker-compose.yml # Development services
└── package.json      # Root workspace configuration
```

## Next Steps

1. Explore the codebase and understand the architecture
2. Check out the API endpoints in `backend/src/routes/`
3. Customize the frontend components in `frontend/components/`
4. Add new features by extending the database schema
5. Deploy to your preferred hosting platform

## Support

If you encounter any issues:

1. Check this troubleshooting guide
2. Review the error messages carefully
3. Ensure all prerequisites are installed correctly
4. Verify environment variables are set properly

Happy coding! 🚀
