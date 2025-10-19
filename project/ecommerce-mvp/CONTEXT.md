# Project Context: MVP E-Commerce Website (Frontend: Next.js; Backend: Elysia/TypeScript; DB: PostgreSQL via Prisma)

## 🧭 Goal
Build an MVP-level e-commerce website where users can browse products, add them to a cart, and checkout using a **test payment gateway**. Admin-lite can view orders and update stock. **No real payments** yet.

## 📦 Core Pages
- Landing Page
- Product Catalog
- Product Detail
- Cart
- Checkout (test-mode only)
- Auth (Sign up / Sign in / Sign out)
- Admin-lite Dashboard (View orders & manage stock)

## 🧱 Core Features
- Basic product listing and detail pages
- Cart system with quantity update and removal
- Test-mode checkout (Stripe or Omise sandbox)
- Simple authentication (email + password)
- Admin-lite backend to view orders and adjust stock

## ⚙️ Constraints
- MVP only: keep all features minimal and simple
- **Separate frontend (Next.js) + backend (Elysia)**
- **Database: PostgreSQL (Prisma ORM)** — seed via JSON later
- **Docker / Docker Compose**, target **WSL** (no Docker Desktop): ensure volumes & network use Linux paths
- No real payment processing (test mode only)
- Placeholder data allowed (seed or mock JSON)

## 🚀 Project Vision
- Phase 1: Structure & Docs
- Phase 2: Data Models & Auth (placeholders)
- Phase 3: Checkout (Test Mode) & Admin-lite