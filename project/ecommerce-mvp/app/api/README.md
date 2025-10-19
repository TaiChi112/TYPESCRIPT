# E-Commerce MVP - Backend API

Elysia.js backend API with Bun runtime for the e-commerce MVP.

## Project Structure

```
src/
├── routes/              # API route handlers
│   ├── auth.ts         # Authentication endpoints
│   ├── products.ts     # Product endpoints
│   ├── orders.ts       # Order endpoints
│   └── admin.ts        # Admin endpoints
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared interfaces
└── index.ts            # Application entry point
```

## Getting Started

### Prerequisites

- Bun 1.0+
- PostgreSQL 14+

### Installation

```bash
bun install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
JWT_SECRET="your-secret-key-change-in-production"
STRIPE_SECRET_KEY="sk_test_..."
```

### Development

```bash
bun run dev
```

API will be available at [http://localhost:4000](http://localhost:4000)

### Type Check

```bash
bun run typecheck
```

## API Endpoints

### Health Check

- `GET /` - API info
- `GET /health` - Health check

### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Sign in user
- `GET /auth/me` - Get current user (requires auth)

### Products

- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID

### Orders

- `POST /orders/create-payment-intent` - Create payment intent (requires auth)
- `POST /orders/confirm` - Confirm order (requires auth)

### Admin

- `GET /admin/orders` - Get all orders (admin only)
- `PUT /admin/products/:id/stock` - Update product stock (admin only)

## Implementation Status

⚠️ **All endpoints are currently placeholders**

TODO:
- [ ] Implement Prisma database schema
- [ ] Implement JWT authentication middleware
- [ ] Implement password hashing with bcrypt
- [ ] Implement user registration and login
- [ ] Implement product CRUD operations
- [ ] Implement order creation and payment
- [ ] Implement Stripe integration
- [ ] Implement admin authorization
- [ ] Add input validation
- [ ] Add error handling
- [ ] Add request logging
- [ ] Add rate limiting
- [ ] Add unit tests

## Tech Stack

- **Elysia.js** - Fast web framework for Bun
- **Bun** - JavaScript runtime
- **TypeScript** - Type safety
- **Prisma** - Database ORM (to be implemented)
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Stripe** - Payment processing

## Next Steps

1. Set up Prisma schema
2. Run database migrations
3. Implement authentication logic
4. Implement product endpoints
5. Integrate Stripe payment
6. Add error handling and validation
7. Write unit tests
