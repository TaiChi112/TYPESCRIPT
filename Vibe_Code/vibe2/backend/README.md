# Vibe Backend API

A modern REST API built with Bun and TypeScript, featuring PostgreSQL database integration.

## Features

- ⚡ **Fast Runtime**: Built with Bun for high performance
- 🔒 **Type Safety**: Full TypeScript support
- 🗄️ **Database**: PostgreSQL with connection pooling
- 🏥 **Health Checks**: Built-in health monitoring
- 🌐 **CORS**: Cross-origin resource sharing enabled
- 🔄 **Graceful Shutdown**: Proper cleanup on process termination

## Installation

```bash
bun install
```

## Development

```bash
# Run in development mode (with watch)
bun run dev

# Run in production mode
bun run start

# Build for production
bun run build
```

## API Endpoints

### Health Check
- **GET** `/health` - Check API and database health status

### Users
- **GET** `/api/users` - Get all users
- **POST** `/api/users/create` - Create a new user

### Example Requests

#### Create User
```bash
curl -X POST http://localhost:3001/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "email": "john@example.com"}'
```

#### Get Users
```bash
curl http://localhost:3001/api/users
```

#### Health Check
```bash
curl http://localhost:3001/health
```

## Project Structure

```
src/
├── index.ts              # Main server file
├── database.ts           # Database configuration
├── types.ts              # TypeScript type definitions
└── services/
    └── userService.ts    # User-related business logic
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string

## Database Schema

The API expects a `users` table with the following structure:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Docker Support

The backend is containerized and works with the provided Docker Compose setup. Health checks ensure proper startup order with the database service.

## Error Handling

All endpoints include proper error handling with appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (health check failed)nstall dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.11. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
