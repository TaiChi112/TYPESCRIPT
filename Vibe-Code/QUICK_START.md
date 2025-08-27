# 🚀 Quick Start Guide

## Prerequisites
- [Bun](https://bun.sh/) installed
- [Docker](https://www.docker.com/) installed and running
- Git (for version control)

## 1. Initial Setup (One-time only)

```bash
# Clone and navigate to project (if not already done)
git clone <your-repo>
cd Vibe-Code

# Install all dependencies
bun run install:all

# Start database
bun run db:up

# Wait for database to be ready (about 10 seconds), then setup schema
bun run db:setup

# Seed with sample data
bun run db:seed
```

## 2. Daily Development

```bash
# Start everything (database + backend + frontend)
bun run docker:up && bun run dev

# Or start components separately:
bun run db:up      # Start database only
bun run dev        # Start backend + frontend
```

## 3. Useful Commands

### Database Management
```bash
bun run db:studio     # Open Prisma Studio (database GUI)
bun run db:logs       # View database logs
bun run db:fresh      # Reset and reseed database
bun run pgadmin:up    # Start pgAdmin (web database manager)
```

### Development
```bash
bun run type-check    # Check TypeScript in both projects
bun run lint          # Lint frontend code
bun run format        # Format all code
```

### Cleanup
```bash
bun run docker:down   # Stop all containers
bun run docker:clean  # Stop containers and clean volumes
bun run clean         # Remove all build files and node_modules
```

## 4. Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555
- **pgAdmin**: http://localhost:8080 (admin@example.com / admin123)

## 5. Project Structure

```
├── frontend/          # Next.js app
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utilities, API client, types
├── backend/          # Express.js API
│   ├── src/          # Source code
│   ├── prisma/       # Database schema
│   └── dist/         # Built output
└── docker-compose.yml # Database containers
```

## 6. Troubleshooting

### Database Connection Issues
```bash
# Check if containers are running
docker ps

# Check database logs
bun run db:logs

# Reset database connection
bun run db:down && bun run db:up
```

### Frontend/Backend Issues
```bash
# Check for TypeScript errors
bun run type-check

# Restart development servers
# Stop with Ctrl+C, then:
bun run dev
```

### Complete Reset
```bash
# Nuclear option - reset everything
bun run clean
bun run docker:clean
bun run install:all
bun run db:up
bun run db:setup
bun run db:seed
bun run dev
```

## 7. Adding New Features

1. **Database changes**: Edit `backend/prisma/schema.prisma`, then run `bun run db:setup`
2. **API changes**: Edit files in `backend/src/routes/`
3. **Frontend changes**: Edit files in `frontend/app/` or `frontend/components/`
4. **Types**: Update `frontend/lib/types.ts` when adding new data structures

Happy coding! 🎉
