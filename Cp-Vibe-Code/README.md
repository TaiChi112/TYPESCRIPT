# Cp-Vibe-Code

A full-stack web application built with modern technologies.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Bun** - Fast JavaScript runtime and package manager

### Backend
- **Bun** - Runtime for the API server
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database

## Project Structure

```
├── frontend/          # Next.js 15 frontend application
├── backend/           # Bun TypeScript API server
├── shared/            # Shared types and utilities
└── docker-compose.yml # Development environment setup
```

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) >= 1.0.0
- [Node.js](https://nodejs.org/) >= 18.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 14.0.0

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cp-Vibe-Code
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   bun install
   
   # Install backend dependencies
   cd ../backend
   bun install
   ```

3. **Setup environment variables**
   ```bash
   # Copy environment files
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   ```

4. **Start PostgreSQL**
   ```bash
   # Using Docker Compose
   docker-compose up -d postgres
   
   # Or start your local PostgreSQL instance
   ```

5. **Setup database**
   ```bash
   cd backend
   bun run db:migrate
   bun run db:seed
   ```

6. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   bun run dev
   
   # Terminal 2 - Frontend
   cd frontend
   bun run dev
   ```

## Available Scripts

### Frontend (Next.js)
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run type-check` - Run TypeScript compiler

### Backend (API Server)
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run db:migrate` - Run database migrations
- `bun run db:seed` - Seed database with initial data
- `bun run db:studio` - Open Prisma Studio

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
```
DATABASE_URL="postgresql://username:password@localhost:5432/cpvibecode"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
```

## API Documentation

The API server runs on `http://localhost:3001` and provides the following endpoints:

- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/users` - Get users (protected)

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push to main

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
