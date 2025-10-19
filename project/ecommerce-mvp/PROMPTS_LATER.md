# Prompts for Future Code Generation (Run later — not now)

## 1) Scaffold Next.js 14 Frontend (app/web)
@workspace Generate a Next.js 14 TypeScript app in `app/web/` with pages: landing, catalog, product detail, cart, checkout, auth (sign-in/up/out). Use the App Router. Add minimal layout and routing (no UI framework yet).

## 2) Scaffold Elysia Backend (app/api)
@workspace Generate a TypeScript Elysia server in `app/api/` with routes for `GET /products`, `GET /products/:id`, `POST /cart/checkout (test-mode)`, and `POST /auth/*` (placeholders). Include a structure for controllers/services (empty).

## 3) Prisma + PostgreSQL
@workspace Create a Prisma schema for Product, User, Order, OrderItem (placeholders) and a seed script (mock data). Place files under `app/api/` and prepare `.env.example` variables. No secrets.

## 4) Connect Frontend ↔ Backend
@workspace In `app/web/`, create API client placeholders that call the backend endpoints (no implementation details yet). Add types shared via a `packages/types/` folder.

## 5) Test Mode Payment
@workspace Prepare a test-mode payment flow outline (Stripe or Omise sandbox) including webhook handling notes in docs and placeholder endpoints.

## 6) E2E Test Setup
@workspace Propose an e2e testing setup (e.g., Playwright) with scenarios: add-to-cart, checkout (test-mode), auth. Generate test files later upon confirmation.