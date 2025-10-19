# 04 - Architecture Overview

## System Architecture

### High-Level Components
```
┌─────────────────┐
│   Browser       │
│  (Next.js App)  │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Backend API    │
│  (Elysia.js)    │
└────────┬────────┘
         │ Prisma ORM
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Database)    │
└─────────────────┘

External (Test Mode):
┌─────────────────┐
│  Stripe/Omise   │
│    Sandbox      │
└─────────────────┘
```

---

## Frontend (Next.js)

### Technology Stack
- **Framework:** Next.js 14+ (App Router or Pages Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS or CSS Modules
- **State Management:** React Context or Zustand (simple)
- **HTTP Client:** fetch or axios

### Directory Structure (Proposed)
```
app/web/
├── src/
│   ├── app/              # Next.js pages (App Router)
│   │   ├── page.tsx      # Landing
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── auth/
│   │   └── admin/
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utilities, API client
│   ├── types/            # TypeScript types
│   └── styles/           # Global styles
├── public/               # Static assets
├── package.json
└── tsconfig.json
```

### Key Responsibilities
- Render UI pages and components
- Handle client-side routing
- Manage cart state (session/localStorage)
- Call backend API for data
- Integrate test payment SDK (Stripe/Omise)

---

## Backend (Elysia)

### Technology Stack
- **Framework:** Elysia.js (Bun runtime)
- **Language:** TypeScript
- **ORM:** Prisma
- **Authentication:** JWT or session-based (simple)
- **Validation:** Elysia built-in or Zod

### Directory Structure (Proposed)
```
app/api/
├── src/
│   ├── index.ts          # Main entry point
│   ├── routes/           # API route handlers
│   │   ├── products.ts
│   │   ├── auth.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   └── admin.ts
│   ├── services/         # Business logic
│   ├── middleware/       # Auth, CORS, logging
│   ├── types/            # TypeScript types
│   └── utils/            # Helpers
├── prisma/
│   ├── schema.prisma     # Data models
│   └── seed.ts           # Seed script
├── package.json
└── tsconfig.json
```

### Key Responsibilities
- RESTful API endpoints
- Database operations via Prisma
- User authentication and authorization
- Payment integration (test mode)
- Input validation and error handling

---

## Database (PostgreSQL)

### Access Pattern
- Backend connects via Prisma Client
- Connection pooling managed by Prisma
- Migrations managed via Prisma Migrate

### Deployment
- Docker container in Compose stack
- Persistent volume for data
- Initial seed on first run

---

## DevOps (Docker Compose on WSL)

### Services
```yaml
services:
  db:
    image: postgres:16-alpine
    volumes: ./data/postgres (Linux path)
    environment: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB

  api:
    build: ./app/api
    depends_on: db
    environment: DATABASE_URL, JWT_SECRET

  web:
    build: ./app/web
    ports: 3000:3000
    environment: NEXT_PUBLIC_API_URL
```

### Networking
- Internal Docker network for service communication
- Frontend exposed on port 3000
- Backend exposed on port 4000 (or internal only)

---

## Security Considerations (MVP)

- **Authentication:** JWT tokens stored in httpOnly cookies or localStorage
- **Authorization:** Middleware checks user role for admin routes
- **CORS:** Configured to allow frontend origin
- **Environment Secrets:** Stored in `.env` (not committed)
- **Payment:** Test mode only, no real card data stored
- **SQL Injection:** Prevented by Prisma parameterized queries
- **XSS:** React escapes output by default

---

## API Design (RESTful)

### Endpoints Outline

**Public:**
- `GET /products` - List products
- `GET /products/:id` - Product detail

**Authenticated:**
- `POST /auth/signup` - Register
- `POST /auth/signin` - Login
- `POST /auth/signout` - Logout
- `GET /cart` - Get cart (if DB-based)
- `POST /cart/items` - Add to cart
- `PUT /cart/items/:id` - Update quantity
- `DELETE /cart/items/:id` - Remove item
- `POST /orders` - Create order (checkout)
- `GET /orders/:id` - Get order details

**Admin:**
- `GET /admin/orders` - List all orders
- `PUT /admin/products/:id/stock` - Update stock

---

## Testing Strategy (Outline)

- **Unit Tests:** Services, utilities
- **Integration Tests:** API endpoints
- **E2E Tests:** Critical user flows (optional for MVP)
- **Manual Testing:** Payment sandbox flows

---

## Deployment Notes

See [07-deploy-notes.md](07-deploy-notes.md) for details.