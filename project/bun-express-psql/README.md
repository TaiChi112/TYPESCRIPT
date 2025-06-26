# Bun Express PostgreSQL Project

A modern TypeScript application using Bun runtime, Express.js, and PostgreSQL with Docker Compose.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Bun runtime (for local development)

### Setup

1. **Clone and navigate to the project:**
   ```bash
   git clone <your-repo>
   cd bun-express-psql
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
3. **Edit `.env` file with your configuration:**
   - Set a strong `POSTGRES_PASSWORD`
   - Generate secure `JWT_SECRET` and `API_KEY`

4. **Start the application:**
   ```bash
   # Start all services
   bun run docker:up
   
   # Or using docker-compose directly
   docker-compose up -d
   ```

5. **View logs:**
   ```bash
   bun run docker:logs
   ```

## 📁 Project Structure

```
├── src/
│   └── index.ts          # Main application entry point
├── scripts/
│   └── init-db/          # Database initialization scripts
│       └── 01-init.sql   # Initial database schema
├── docker-compose.yml    # Docker services configuration
├── Dockerfile           # Application container definition
├── .env.example         # Environment variables template
├── .dockerignore        # Docker build ignore patterns
└── package.json         # Project dependencies and scripts
```

## 🛠️ Available Scripts

### Application Scripts
- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server
- `bun run build` - Build application

### Docker Scripts
- `bun run docker:up` - Start all Docker services
- `bun run docker:down` - Stop all Docker services
- `bun run docker:build` - Rebuild Docker images
- `bun run docker:logs` - View service logs

### Database Scripts
- `bun run db:migrate` - Run database migrations
- `bun run db:seed` - Seed database with initial data

## 🐳 Docker Services

### PostgreSQL Database
- **Image:** `postgres:16-alpine`
- **Port:** `5432` (configurable via `POSTGRES_PORT`)
- **Data persistence:** Named volume `postgres_data`
- **Health checks:** Enabled with pg_isready

### Backend Application
- **Runtime:** Bun
- **Port:** `3000` (configurable via `API_PORT`)
- **Hot reload:** Enabled in development mode
- **Log persistence:** Named volume `bunexpress_logs`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | `bunexpress` |
| `POSTGRES_PASSWORD` | Database password | **Required** |
| `POSTGRES_DB` | Database name | `bunexpress` |
| `POSTGRES_PORT` | Database port | `5432` |
| `NODE_ENV` | Application environment | `development` |
| `API_PORT` | Application port | `3000` |
| `JWT_SECRET` | JWT signing secret | **Required** |
| `API_KEY` | API authentication key | **Required** |

### Development vs Production

The Docker setup supports both development and production modes:

- **Development:** Hot reload enabled, source code mounted as volume
- **Production:** Optimized build, no source code mounting

## 🔒 Security Features

- Environment variables for sensitive data
- PostgreSQL with SCRAM-SHA-256 authentication
- Custom Docker network for service isolation
- No hardcoded secrets in Docker Compose
- Proper volume management for data persistence

## 📊 Database

The PostgreSQL service includes:
- Automatic initialization scripts
- Health checks for service dependencies
- Persistent data storage
- Development-friendly configuration

### Initial Schema
The database is automatically initialized with:
- Users table with proper indexing
- Sample data for development

## 🔍 Monitoring

- Service health checks
- Structured logging
- Container restart policies
- Watch mode for development changes

## 🚨 Important Notes

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Change default passwords** - Set strong passwords in production
3. **Secure your secrets** - Generate unique JWT secrets and API keys
4. **Review permissions** - Ensure proper file and directory permissionssql

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.11. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
