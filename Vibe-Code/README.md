# Proposal Software Directory

A comprehensive website for collecting and managing proposal software data. This project helps users discover, compare, and submit information about various proposal software solutions.

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Bun** - JavaScript runtime and package manager
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **Zod** - Schema validation

## 📦 Project Structure

```
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and API client
│   └── ...
├── backend/          # Express.js backend API
│   ├── src/         # Source code
│   ├── prisma/      # Database schema and migrations
│   └── ...
└── package.json     # Root package.json for workspace management
```

## 🛠️ Setup Instructions

### Prerequisites
- [Bun](https://bun.sh/) installed on your system
- PostgreSQL database running
- Node.js (for development tools)

### 1. Clone and Install Dependencies

```bash
# Install all dependencies
bun run install:all

# Or install individually
cd backend && bun install
cd ../frontend && bun install
```

### 2. Database Setup

1. Create a PostgreSQL database
2. Copy the backend `.env` file and update the DATABASE_URL:

```bash
cd backend
cp .env.example .env
# Edit .env with your database URL
```

3. Set up the database:

```bash
# Generate Prisma client and run migrations
bun run db:setup

# Seed the database with sample data
bun run db:seed
```

### 3. Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/proposal_software_db"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Run the Application

```bash
# Run both frontend and backend concurrently
bun run dev

# Or run individually
cd backend && bun dev    # Backend on http://localhost:3001
cd frontend && bun dev   # Frontend on http://localhost:3000
```

## 🎯 Features

### Core Features
- **Add Proposal Software** - Submit new software with detailed information
- **Browse & Search** - Search by name, description, or company
- **Filter by Category** - Filter software by categories
- **Detailed Information** - View comprehensive software details
- **Ratings & Reviews** - Display user ratings and review counts
- **Responsive Design** - Works on desktop and mobile devices

### Form Fields
- Software Name *
- Company Name *
- Category *
- Pricing Information *
- Description
- Website URL
- Key Features (multi-select)
- Rating (0-5 stars)
- Review Count

### API Endpoints

#### Proposal Software
- `GET /api/proposal-software` - List all software (with pagination, search, filters)
- `GET /api/proposal-software/:id` - Get single software
- `POST /api/proposal-software` - Create new software
- `PUT /api/proposal-software/:id` - Update software
- `DELETE /api/proposal-software/:id` - Delete software (soft delete)

#### Meta
- `GET /api/proposal-software/meta/categories` - Get all categories

## 🗃️ Database Schema

```sql
model ProposalSoftware {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String
  pricing     String
  features    String[]
  website     String?
  company     String
  rating      Float?
  reviewCount Int?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🔧 Development

### Database Management

```bash
# Generate Prisma client after schema changes
cd backend && bun run db:generate

# Create and apply migrations
cd backend && bun run db:migrate

# Open Prisma Studio (database GUI)
cd backend && bun run db:studio

# Reset database (development only)
cd backend && prisma migrate reset --force
```

### Adding New Features

1. Update the Prisma schema in `backend/prisma/schema.prisma`
2. Run migrations: `bun run db:migrate`
3. Update TypeScript types in `frontend/lib/types.ts`
4. Update API routes in `backend/src/routes/`
5. Update frontend components as needed

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Set environment variables
3. Run migrations: `bun run db:migrate`
4. Build and start: `bun run build && bun start`

### Frontend Deployment
1. Set environment variables
2. Build: `bun run build`
3. Deploy to Vercel, Netlify, or other hosting platform

## 📝 API Documentation

The API follows RESTful conventions and returns JSON responses. All endpoints support proper HTTP status codes and error handling.

### Error Responses
```json
{
  "error": "Error message",
  "details": [] // Validation errors if applicable
}
```

### Success Responses
```json
{
  "data": [], // Array of items or single item
  "pagination": { // For paginated endpoints
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
