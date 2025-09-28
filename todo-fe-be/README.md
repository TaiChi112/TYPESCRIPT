# Todo List Application

A full-stack Todo List application built with TypeScript, featuring PostgreSQL database, Bun backend, and Next.js frontend.

## 📚 Complete Documentation

> **เรียนรู้การพัฒนา Full-Stack Application ด้วย SDLC**
> 
> ดูเอกสารครบถ้วนที่อธิบาย Software Development Life Cycle (SDLC) สำหรับ project นี้ได้ที่:
> 
> **👉 [📖 Complete SDLC Documentation](./docs/README.md)**
>
> เอกสารนี้จะพาคุณเข้าใจทุก phase ของการพัฒนา software ตั้งแต่ planning, analysis, design, implementation, testing, deployment และ maintenance พร้อมตัวอย่างจริงจาก Todo List project นี้

## Project Structure

```
todo-fe-be/
├── backend/           # Bun + Elysia API server
│   ├── index.ts      # Main server file
│   ├── service.ts    # Todo business logic with Prisma
│   ├── types.ts      # TypeScript interfaces
│   ├── lib/          # Database connection
│   ├── prisma/       # Database schema and migrations
│   └── package.json
├── frontend/         # Next.js React application
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   ├── lib/          # API client
│   ├── types/        # TypeScript interfaces
│   └── package.json
├── scripts/          # Database setup scripts
├── docker-compose.yml # Database containers
└── README.md
```

## Features

- ✅ **PostgreSQL Database** with Prisma ORM
- ✅ **Create** new todos with title and description
- ✅ **Read** and display all todos with filtering
- ✅ **Update** todo details (title, description, completion status)
- ✅ **Delete** todos
- ✅ **Toggle** completion status
- ✅ **Filter** todos by status (All, Pending, Completed)
- ✅ **Statistics** dashboard with completion rates
- ✅ **Responsive design** with Tailwind CSS
- ✅ **Real-time updates** between frontend and backend
- ✅ **Database administration** with pgAdmin
- ✅ **Docker containers** for database services

## Tech Stack

### Database
- **PostgreSQL 15** - Robust relational database
- **Prisma** - Type-safe database ORM
- **pgAdmin** - Database administration tool
- **Docker** - Containerized database services

### Backend
- **Bun** - Fast JavaScript runtime and package manager
- **Elysia** - Fast web framework for Bun
- **TypeScript** - Type-safe JavaScript
- **CORS** - Cross-origin resource sharing

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons

## Quick Start

### Prerequisites
- **Docker & Docker Compose** - For database services
- **Node.js 18+** and npm
- **Bun** (install from https://bun.sh/)

### 1. Database Setup
```bash
# Start PostgreSQL and pgAdmin containers
docker compose up -d

# Setup database schema
cd backend
npm install -g prisma  # if not already installed
npx prisma generate
npx prisma db push
```

### 2. Backend Setup
```bash
cd backend
bun install
bun --watch index.ts
```
Backend will start at `http://localhost:3001`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will start at `http://localhost:3000`

### 4. Open Application
Visit `http://localhost:3000` in your browser

## Database Access

### pgAdmin Web Interface
- **URL**: http://localhost:5050
- **Email**: admin@todoapp.com
- **Password**: admin123

### PostgreSQL Direct Connection
- **Host**: localhost
- **Port**: 5432
- **Database**: todo_db
- **Username**: todo_user
- **Password**: todo_password

## API Endpoints

### GET /api/todos
Get all todos
```json
{
  "success": true,
  "data": [
    {
      "id": "cmg3x32500000wnd6u7at0vib",
      "title": "Learn TypeScript",
      "description": "Study TypeScript fundamentals",
      "completed": false,
      "createdAt": "2025-09-28T16:31:36.084Z",
      "updatedAt": "2025-09-28T16:31:36.084Z"
    }
  ]
}
```

### GET /api/todos/:id
Get specific todo by ID

### POST /api/todos
Create new todo
```json
{
  "title": "New Todo",
  "description": "Optional description"
}
```

### PUT /api/todos/:id
Update todo
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

### DELETE /api/todos/:id
Delete todo

### PATCH /api/todos/:id/toggle
Toggle todo completion status

## Development Commands

### Database
```bash
docker compose up -d        # Start database services
docker compose down         # Stop database services
npx prisma generate         # Generate Prisma client
npx prisma db push          # Push schema to database
npx prisma studio           # Open Prisma Studio
```

### Backend
```bash
bun --watch index.ts        # Development with auto-reload
bun index.ts               # Production start
bun run db:setup           # Setup database (requires Docker)
bun run db:migrate         # Run database migrations
bun run db:studio          # Open Prisma Studio
```

### Frontend
```bash
npm run dev                # Development server
npm run build              # Production build
npm run start              # Production server
npm run lint               # ESLint check
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://todo_user:todo_password@localhost:5432/todo_db"
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Usage Guide

1. **Adding Todos**: Click "Add New Todo" button and fill in the form
2. **Completing Todos**: Click the checkbox next to any todo
3. **Editing Todos**: Click the edit icon to modify title/description
4. **Deleting Todos**: Click the trash icon to delete
5. **Filtering**: Use filter buttons to show All, Pending, or Completed todos
6. **Statistics**: View completion progress in the sidebar
7. **Database Admin**: Access pgAdmin at http://localhost:5050 for database management

## Database Schema

```sql
CREATE TABLE todos (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  completed   BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

## Production Deployment

For production deployment, consider:
- Using managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Setting up proper environment variables
- Implementing database connection pooling
- Adding database backups and monitoring
- Using Docker containers for consistent deployments

## Troubleshooting

### Database Connection Issues
```bash
# Check if containers are running
docker ps

# View database logs
docker logs todo_postgres

# Restart database services
docker compose down && docker compose up -d
```

### Prisma Issues
```bash
# Reset database (⚠️ This will delete all data!)
npx prisma db push --force-reset

# Regenerate client
npx prisma generate
```

## Future Enhancements

- [x] ✅ Database integration with PostgreSQL
- [x] ✅ Database administration with pgAdmin
- [x] ✅ Docker containerization
- [ ] User authentication and authorization
- [ ] Todo categories/tags and priority levels
- [ ] Due dates and reminders
- [ ] Search and advanced filtering
- [ ] Drag-and-drop reordering
- [ ] Export/import functionality
- [ ] Dark mode theme
- [ ] Real-time collaboration
- [ ] Mobile app with React Native

## License

MIT License - feel free to use this project for learning and development!