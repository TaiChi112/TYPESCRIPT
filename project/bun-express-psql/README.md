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
├── db/
│   └── migrations/       # Flyway database migration scripts
│       ├── V1__create_users_table.sql      # Users table migration
│       └── V2__create_products_table.sql   # Products table migration
├── docker-compose.yml    # Docker services configuration
├── Dockerfile           # Application container definition
├── .env.example         # Environment variables template
├── .dockerignore        # Docker build ignore patterns
├── .gitignore          # Git ignore patterns
├── tsconfig.json       # TypeScript configuration
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
- `bun run db:migrate` - Run database migrations manually
- `bun run db:seed` - Seed database with initial data
- `bun run db:status` - Check migration status

## 🐳 Docker Services

### PostgreSQL Database
- **Image:** `postgres:16-alpine`
- **Port:** `5432` (configurable via `POSTGRES_PORT`)
- **Data persistence:** Named volume `postgres_data`
- **Health checks:** Enabled with pg_isready

### Flyway Migration Service
- **Image:** `flyway/flyway:11-alpine`
- **Purpose:** Automated database schema migrations
- **Migration files:** Located in `db/migrations/`
- **Execution:** Runs automatically after PostgreSQL is healthy

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
- **Flyway migrations:** Automated schema management with versioned migrations
- Health checks for service dependencies
- Persistent data storage
- Development-friendly configuration

### Database Migrations
The database schema is managed through Flyway migrations:
- **V1__create_users_table.sql** - Users table with authentication fields
- **V2__create_products_table.sql** - Products table with e-commerce fields
- Migrations run automatically when containers start
- Versioned and repeatable migration support

### Migration Workflow
1. PostgreSQL container starts and becomes healthy
2. Flyway migration service runs all pending migrations
3. Backend application starts after successful migrations
4. Database is ready with the latest schema

## 🗄️ Database Migrations

### Creating New Migrations

1. **Create a new migration file:**
   ```bash
   # Follow Flyway naming convention: V<version>__<description>.sql
   touch db/migrations/V3__add_categories_table.sql
   ```

2. **Write your migration:**
   ```sql
   -- V3__add_categories_table.sql
   CREATE TABLE categories (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       description TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Add foreign key to products table
   ALTER TABLE products 
   ADD CONSTRAINT fk_products_category 
   FOREIGN KEY (category_id) REFERENCES categories(id);
   ```

3. **Restart services to apply migrations:**
   ```bash
   bun run docker:down
   bun run docker:up
   ```

### Migration Best Practices

- **Sequential versioning:** Use V1, V2, V3, etc.
- **Descriptive names:** Use clear, descriptive migration names
- **Rollback strategy:** Consider how to undo changes if needed
- **Test migrations:** Test on development data before production
- **Backup data:** Always backup before running migrations in production

## 🔍 Monitoring

- Service health checks
- Structured logging
- Container restart policies
- Watch mode for development changes

## 🚨 Important Notes

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Change default passwords** - Set strong passwords in production
3. **Secure your secrets** - Generate unique JWT secrets and API keys
4. **Review permissions** - Ensure proper file and directory permissions
5. **Migration safety** - Always backup data before running migrations in production
