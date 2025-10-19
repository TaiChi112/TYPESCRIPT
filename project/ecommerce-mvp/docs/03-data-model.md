# 03 - Data Model (Prisma Schema Outline)

## Overview
PostgreSQL database managed via Prisma ORM. Models designed for MVP simplicity.

## Core Entities

### User
- `id` - UUID, primary key
- `email` - String, unique, required
- `passwordHash` - String, required
- `role` - Enum: USER | ADMIN
- `createdAt` - DateTime
- `updatedAt` - DateTime

**Relationships:**
- One-to-Many: Orders

---

### Product
- `id` - UUID, primary key
- `name` - String, required
- `description` - String (text)
- `price` - Decimal, required
- `imageUrl` - String (nullable)
- `stock` - Integer, default 0
- `createdAt` - DateTime
- `updatedAt` - DateTime

**Relationships:**
- One-to-Many: OrderItems

---

### Order
- `id` - UUID, primary key
- `userId` - UUID, foreign key → User
- `status` - Enum: PENDING | COMPLETED | CANCELLED
- `totalAmount` - Decimal, required
- `paymentIntentId` - String (from Stripe/Omise, nullable)
- `createdAt` - DateTime
- `updatedAt` - DateTime

**Relationships:**
- Many-to-One: User
- One-to-Many: OrderItems

---

### OrderItem
- `id` - UUID, primary key
- `orderId` - UUID, foreign key → Order
- `productId` - UUID, foreign key → Product
- `quantity` - Integer, required
- `priceAtPurchase` - Decimal, required (snapshot)
- `createdAt` - DateTime

**Relationships:**
- Many-to-One: Order
- Many-to-One: Product

---

### Cart (Session-based alternative)
For MVP, cart can be:
- **Option A:** Stored in client session/localStorage (simpler)
- **Option B:** Database table with userId or sessionId

**If using database:**
- `id` - UUID, primary key
- `userId` - UUID, foreign key → User (nullable for guests)
- `sessionId` - String (for guest carts)
- `productId` - UUID, foreign key → Product
- `quantity` - Integer
- `createdAt` - DateTime
- `updatedAt` - DateTime

---

## Indexes (Performance)
- User: `email` (unique)
- Order: `userId`, `createdAt`
- OrderItem: `orderId`, `productId`
- Cart: `userId`, `sessionId`

---

## Seed Data Notes
- Initial products loaded from JSON file
- Default admin user created
- Test user accounts optional