# 🗺️ MVP Task Plan

## Overview
This document outlines all tasks for building the MVP E-Commerce application across three phases. Each task includes acceptance criteria and dependencies.

**Legend:**
- ✅ Complete
- 🚧 In Progress
- ⏳ Blocked/Waiting
- ❌ Not Started

---

## 📍 Phase 1: Scaffold & Documentation ✅

### Goal
Establish project structure, documentation, and development environment setup.

### Tasks

#### 1.1 Project Structure ✅
- [x] Create root directory structure
- [x] Set up `app/api/` and `app/web/` folders
- [x] Create `.github/` workflows and issue templates
- [x] Add `docs/` folder with markdown files

**Acceptance Criteria:**
- ✅ All folders exist per architecture design
- ✅ Placeholder files present (`.todo`, `.md`)
- ✅ Git repository initialized

---

#### 1.2 Documentation ✅
- [x] Write [01-scope.md](docs/01-scope.md)
- [x] Write [02-user-stories.md](docs/02-user-stories.md)
- [x] Write [03-data-model.md](docs/03-data-model.md)
- [x] Write [04-architecture.md](docs/04-architecture.md)
- [x] Write [05-test-plan.md](docs/05-test-plan.md)
- [x] Write [06-ci-cd.md](docs/06-ci-cd.md)
- [x] Write [07-deploy-notes.md](docs/07-deploy-notes.md)
- [x] Write [08-roadmap.md](docs/08-roadmap.md)

**Acceptance Criteria:**
- ✅ All 8 documentation files complete with outlines
- ✅ User stories follow Given/When/Then format
- ✅ Data model includes all entities and relationships
- ✅ Architecture diagram and tech stack documented

---

#### 1.3 Configuration Files ✅
- [x] Create [docker-compose.yml](docker-compose.yml) with db, api, web services
- [x] Create [.env.example](.env.example) template
- [x] Create [.github/workflows/ci.placeholder.yml](.github/workflows/ci.placeholder.yml)
- [x] Create [.github/ISSUE_TEMPLATE/BUG_REPORT.md](.github/ISSUE_TEMPLATE/BUG_REPORT.md)
- [x] Create [.github/ISSUE_TEMPLATE/FEATURE_REQUEST.md](.github/ISSUE_TEMPLATE/FEATURE_REQUEST.md)

**Acceptance Criteria:**
- ✅ Docker Compose defines all three services
- ✅ Environment variables templated in `.env.example`
- ✅ CI workflow includes lint, build, test stages
- ✅ Issue templates ready for use

---

#### 1.4 README and Context ✅
- [x] Write [README.md](README.md) with project overview
- [x] Document setup instructions for WSL
- [x] Add quick start guide

**Acceptance Criteria:**
- ✅ README explains what the project is
- ✅ Setup steps clear for WSL + Docker
- ✅ Links to documentation provided

---

**Phase 1 Status:** ✅ Complete

---

## 📍 Phase 2: Data Models & Authentication

### Goal
Implement database schema, Prisma ORM setup, and user authentication system.

**Estimated Duration:** 2-3 weeks

### Prerequisites
- Phase 1 complete
- Docker and Docker Compose installed in WSL
- Node.js/Bun runtime available

---

### 2.1 Backend Project Setup

#### 2.1.1 Initialize Backend ❌
- [ ] Initialize Node.js/Bun project in `app/api/`
- [ ] Install dependencies: Elysia, Prisma, JWT library, bcrypt
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Create `src/` directory structure
- [ ] Add start scripts to `package.json`

**Acceptance Criteria:**
- [ ] `package.json` with all dependencies listed
- [ ] TypeScript compiles without errors
- [ ] Dev server can start (even if no routes yet)

**Files to Create:**
- `app/api/package.json`
- `app/api/tsconfig.json`
- `app/api/src/index.ts`

---

#### 2.1.2 Setup Prisma ❌
- [ ] Initialize Prisma: `npx prisma init`
- [ ] Configure `DATABASE_URL` in `.env`
- [ ] Update `.gitignore` to exclude `.env`

**Acceptance Criteria:**
- [ ] `prisma/` folder created
- [ ] `schema.prisma` file present
- [ ] Database connection string configured

**Files to Create:**
- `app/api/prisma/schema.prisma`
- `app/api/.env`

---

### 2.2 Database Schema Implementation

#### 2.2.1 Define Prisma Models ❌
- [ ] Implement `User` model per [03-data-model.md](docs/03-data-model.md)
- [ ] Implement `Product` model
- [ ] Implement `Order` model
- [ ] Implement `OrderItem` model
- [ ] Add indexes for performance
- [ ] Define enums (Role, OrderStatus)

**Acceptance Criteria:**
- [ ] All models match data model specification
- [ ] Relationships correctly defined
- [ ] Enums for role and status created
- [ ] `npx prisma validate` passes

**Files to Modify:**
- `app/api/prisma/schema.prisma`

**Reference:** [03-data-model.md](docs/03-data-model.md)

---

#### 2.2.2 Create Initial Migration ❌
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Verify migration files created
- [ ] Test migration on local database

**Acceptance Criteria:**
- [ ] Migration SQL files generated
- [ ] Database tables created successfully
- [ ] Prisma Client generated

**Dependencies:**
- Task 2.2.1 complete
- PostgreSQL container running

---

#### 2.2.3 Create Seed Script ❌
- [ ] Create `prisma/seed.ts`
- [ ] Seed 5-10 sample products
- [ ] Create default admin user (email: admin@test.com)
- [ ] Create 2 test regular users
- [ ] Add seed script to `package.json`

**Acceptance Criteria:**
- [ ] `npm run seed` populates database
- [ ] Products have varied stock levels (including 0)
- [ ] Admin user has `role = ADMIN`
- [ ] Passwords properly hashed

**Files to Create:**
- `app/api/prisma/seed.ts`

**Reference:** [03-data-model.md](docs/03-data-model.md)

---

### 2.3 Authentication Implementation

#### 2.3.1 Auth Utilities ❌
- [ ] Create password hashing utility (bcrypt)
- [ ] Create JWT token generation function
- [ ] Create JWT verification middleware
- [ ] Create password validation rules

**Acceptance Criteria:**
- [ ] Passwords hashed with bcrypt (salt rounds: 10)
- [ ] JWT tokens include userId and role
- [ ] Token expiration configured (e.g., 7 days)
- [ ] Middleware extracts and validates tokens

**Files to Create:**
- `app/api/src/utils/auth.ts`
- `app/api/src/middleware/auth.ts`

---

#### 2.3.2 Auth Routes ❌
- [ ] Implement `POST /auth/signup`
- [ ] Implement `POST /auth/signin`
- [ ] Implement `POST /auth/signout`
- [ ] Implement `GET /auth/me` (current user)
- [ ] Add input validation (email format, password strength)
- [ ] Add error handling (duplicate email, invalid credentials)

**Acceptance Criteria:**
- [ ] Signup creates user and returns JWT
- [ ] Signin validates credentials and returns JWT
- [ ] Duplicate email returns 409 Conflict
- [ ] Invalid credentials return 401 Unauthorized
- [ ] `/auth/me` returns user data for valid token

**Files to Create:**
- `app/api/src/routes/auth.ts`

**Test Cases:** TC-AUTH-001 through TC-AUTH-005 in [05-test-plan.md](docs/05-test-plan.md)

---

#### 2.3.3 Authorization Middleware ❌
- [ ] Create `requireAuth` middleware (any authenticated user)
- [ ] Create `requireAdmin` middleware (admin role only)
- [ ] Add middleware to route registration

**Acceptance Criteria:**
- [ ] Protected routes return 401 if no token
- [ ] Protected routes return 403 if not admin (for admin routes)
- [ ] Valid token allows access

**Files to Create:**
- `app/api/src/middleware/requireAuth.ts`
- `app/api/src/middleware/requireAdmin.ts`

---

### 2.4 Frontend Project Setup

#### 2.4.1 Initialize Frontend ❌
- [ ] Initialize Next.js project in `app/web/`
- [ ] Install dependencies: React, Tailwind CSS, axios/fetch
- [ ] Configure TypeScript
- [ ] Set up Tailwind CSS
- [ ] Create base layout component

**Acceptance Criteria:**
- [ ] Next.js dev server starts successfully
- [ ] Tailwind CSS classes working
- [ ] TypeScript configured for Next.js

**Files to Create:**
- `app/web/package.json`
- `app/web/tsconfig.json`
- `app/web/tailwind.config.js`
- `app/web/src/app/layout.tsx`

---

#### 2.4.2 API Client Setup ❌
- [ ] Create API client utility (axios or fetch wrapper)
- [ ] Configure base URL from environment variable
- [ ] Add request interceptor for JWT token
- [ ] Add response interceptor for error handling

**Acceptance Criteria:**
- [ ] API calls include `Authorization: Bearer <token>`
- [ ] Base URL configurable via `NEXT_PUBLIC_API_URL`
- [ ] 401 responses trigger logout

**Files to Create:**
- `app/web/src/lib/api.ts`

---

#### 2.4.3 Auth Context ❌
- [ ] Create React Context for auth state
- [ ] Implement `useAuth` hook
- [ ] Store JWT in localStorage or httpOnly cookie
- [ ] Persist auth state across page reloads
- [ ] Add signup, signin, signout functions

**Acceptance Criteria:**
- [ ] Auth state accessible via `useAuth()` hook
- [ ] Token persists after page refresh
- [ ] Signout clears token and auth state

**Files to Create:**
- `app/web/src/contexts/AuthContext.tsx`
- `app/web/src/hooks/useAuth.ts`

---

### 2.5 Auth Pages (Frontend)

#### 2.5.1 Sign Up Page ❌
- [ ] Create `/auth/signup` page
- [ ] Form with email and password fields
- [ ] Client-side validation
- [ ] Call `POST /auth/signup` API
- [ ] Redirect to home on success
- [ ] Display error messages

**Acceptance Criteria:**
- [ ] Valid submission creates account and signs in
- [ ] Duplicate email shows error message
- [ ] Weak password shows validation error
- [ ] User redirected after successful signup

**Files to Create:**
- `app/web/src/app/auth/signup/page.tsx`

**Test Cases:** TC-AUTH-001, TC-AUTH-002 in [05-test-plan.md](docs/05-test-plan.md)

---

#### 2.5.2 Sign In Page ❌
- [ ] Create `/auth/signin` page
- [ ] Form with email and password fields
- [ ] Call `POST /auth/signin` API
- [ ] Store JWT token
- [ ] Redirect to previous page or home
- [ ] Display error for invalid credentials

**Acceptance Criteria:**
- [ ] Valid credentials sign in user
- [ ] Invalid credentials show error
- [ ] User redirected after successful signin
- [ ] Token stored in localStorage/cookie

**Files to Create:**
- `app/web/src/app/auth/signin/page.tsx`

**Test Cases:** TC-AUTH-003, TC-AUTH-004 in [05-test-plan.md](docs/05-test-plan.md)

---

#### 2.5.3 Protected Route Component ❌
- [ ] Create `ProtectedRoute` wrapper component
- [ ] Check auth state
- [ ] Redirect to signin if not authenticated
- [ ] Show loading state while checking auth

**Acceptance Criteria:**
- [ ] Unauthenticated users redirected to `/auth/signin`
- [ ] Authenticated users see protected content
- [ ] Return URL preserved for post-login redirect

**Files to Create:**
- `app/web/src/components/ProtectedRoute.tsx`

---

### 2.6 Docker Integration

#### 2.6.1 Backend Dockerfile ❌
- [ ] Create `Dockerfile` in `app/api/`
- [ ] Use Node/Bun base image
- [ ] Copy dependencies and source
- [ ] Run Prisma generate
- [ ] Expose port 4000
- [ ] Set start command

**Acceptance Criteria:**
- [ ] Image builds successfully
- [ ] Container runs API server
- [ ] Prisma Client available in container

**Files to Create:**
- `app/api/Dockerfile`

---

#### 2.6.2 Frontend Dockerfile ❌
- [ ] Create `Dockerfile` in `app/web/`
- [ ] Use Node base image
- [ ] Multi-stage build (build + runtime)
- [ ] Copy built files
- [ ] Expose port 3000
- [ ] Set start command

**Acceptance Criteria:**
- [ ] Image builds successfully
- [ ] Container runs Next.js app
- [ ] Build optimized for production

**Files to Create:**
- `app/web/Dockerfile`

---

#### 2.6.3 Update Docker Compose ❌
- [ ] Add build contexts for api and web services
- [ ] Configure environment variables
- [ ] Set up volume for database persistence
- [ ] Configure service dependencies
- [ ] Add health checks

**Acceptance Criteria:**
- [ ] `docker compose up` starts all services
- [ ] Database data persists after restart
- [ ] API accessible from web container
- [ ] Frontend accessible on host port 3000

**Files to Modify:**
- `docker-compose.yml`

**Reference:** [07-deploy-notes.md](docs/07-deploy-notes.md)

---

### 2.7 Testing & Validation

#### 2.7.1 Manual Testing ❌
- [ ] Test signup flow end-to-end
- [ ] Test signin flow end-to-end
- [ ] Test signout functionality
- [ ] Verify token persistence
- [ ] Test protected routes

**Acceptance Criteria:**
- [ ] All auth flows work as expected
- [ ] Error messages display correctly
- [ ] Token stored and retrieved properly

**Test Cases:** All TC-AUTH-* from [05-test-plan.md](docs/05-test-plan.md)

---

#### 2.7.2 API Integration Tests ❌
- [ ] Write test for `POST /auth/signup`
- [ ] Write test for `POST /auth/signin`
- [ ] Write test for protected route access
- [ ] Write test for admin route access

**Acceptance Criteria:**
- [ ] All API tests pass
- [ ] Tests can run in CI environment

**Files to Create:**
- `app/api/src/__tests__/auth.test.ts`

---

**Phase 2 Completion Criteria:**
- [ ] All Phase 2 tasks complete
- [ ] Database schema deployed and seeded
- [ ] User can sign up, sign in, sign out
- [ ] Protected routes working
- [ ] All services running in Docker Compose
- [ ] Manual testing complete

---

## 📍 Phase 3: Checkout & Admin-Lite

### Goal
Implement product browsing, shopping cart, test-mode checkout, and admin dashboard.

**Estimated Duration:** 3-4 weeks

**Prerequisites:**
- Phase 2 complete
- Payment gateway test account created (Stripe or Omise)

---

### 3.1 Product Catalog (Backend)

#### 3.1.1 Product Routes ❌
- [ ] Implement `GET /products` (list all products)
- [ ] Implement `GET /products/:id` (product detail)
- [ ] Add pagination to product list (optional for MVP)
- [ ] Filter out products with stock = 0 (optional)

**Acceptance Criteria:**
- [ ] Product list returns all products with basic info
- [ ] Product detail returns full information
- [ ] Responses include stock levels
- [ ] Invalid product ID returns 404

**Files to Create:**
- `app/api/src/routes/products.ts`

**Test Cases:** TC-PROD-001, TC-PROD-002, TC-PROD-003 in [05-test-plan.md](docs/05-test-plan.md)

---

### 3.2 Product Catalog (Frontend)

#### 3.2.1 Product List Page ❌
- [ ] Create `/products` page
- [ ] Fetch products from API
- [ ] Display product grid/list
- [ ] Show product name, image, price, stock status
- [ ] Link to product detail page
- [ ] Handle loading and error states

**Acceptance Criteria:**
- [ ] Products display in grid layout
- [ ] Out-of-stock products clearly marked
- [ ] Clicking product navigates to detail page
- [ ] Responsive design (mobile-friendly)

**Files to Create:**
- `app/web/src/app/products/page.tsx`
- `app/web/src/components/ProductCard.tsx`

---

#### 3.2.2 Product Detail Page ❌
- [ ] Create `/products/[id]` page
- [ ] Fetch product by ID from API
- [ ] Display full product information
- [ ] Show "Add to Cart" button (if in stock)
- [ ] Show "Out of Stock" message (if stock = 0)
- [ ] Quantity selector
- [ ] Handle 404 for invalid product ID

**Acceptance Criteria:**
- [ ] Full product details displayed
- [ ] Add to Cart button functional
- [ ] Out-of-stock products cannot be added to cart
- [ ] 404 page shown for invalid ID

**Files to Create:**
- `app/web/src/app/products/[id]/page.tsx`

**Test Cases:** TC-PROD-002, TC-PROD-003 in [05-test-plan.md](docs/05-test-plan.md)

---

### 3.3 Shopping Cart

#### 3.3.1 Cart State Management ❌
- [ ] Create cart context or store (React Context/Zustand)
- [ ] Implement addToCart function
- [ ] Implement updateQuantity function
- [ ] Implement removeFromCart function
- [ ] Implement clearCart function
- [ ] Persist cart in localStorage
- [ ] Calculate total price

**Acceptance Criteria:**
- [ ] Cart state accessible across pages
- [ ] Cart persists after page reload
- [ ] Quantity limits enforced (max = product stock)
- [ ] Total price accurate

**Files to Create:**
- `app/web/src/contexts/CartContext.tsx`
- `app/web/src/hooks/useCart.ts`

---

#### 3.3.2 Cart UI Component ❌
- [ ] Create cart icon with item count badge
- [ ] Add to header/navigation
- [ ] Show cart preview on hover/click (optional)
- [ ] Link to cart page

**Acceptance Criteria:**
- [ ] Cart icon shows current item count
- [ ] Badge updates when items added/removed
- [ ] Clicking icon navigates to cart page

**Files to Create:**
- `app/web/src/components/CartIcon.tsx`

---

#### 3.3.3 Cart Page ❌
- [ ] Create `/cart` page
- [ ] Display all cart items
- [ ] Show product name, image, price, quantity
- [ ] Quantity controls (increment/decrement)
- [ ] Remove item button
- [ ] Display subtotal per item
- [ ] Display total price
- [ ] "Proceed to Checkout" button
- [ ] Handle empty cart state

**Acceptance Criteria:**
- [ ] All cart items displayed correctly
- [ ] Quantity changes update totals
- [ ] Remove button works
- [ ] Empty cart shows appropriate message
- [ ] Checkout button navigates to checkout page

**Files to Create:**
- `app/web/src/app/cart/page.tsx`
- `app/web/src/components/CartItem.tsx`

**Test Cases:** TC-CART-001 through TC-CART-004 in [05-test-plan.md](docs/05-test-plan.md)

---

### 3.4 Checkout Implementation

#### 3.4.1 Payment Gateway Setup ❌
- [ ] Create Stripe/Omise test account
- [ ] Install payment SDK
- [ ] Configure test API keys in `.env`
- [ ] Add public key to frontend env

**Acceptance Criteria:**
- [ ] Test API keys configured
- [ ] SDK installed and importable
- [ ] Keys not committed to repository

**Files to Modify:**
- `app/api/.env`
- `app/web/.env.local`

**Reference:** [07-deploy-notes.md](docs/07-deploy-notes.md)

---

#### 3.4.2 Payment Backend Routes ❌
- [ ] Implement `POST /orders/create-payment-intent`
- [ ] Validate cart items and stock availability
- [ ] Create payment intent with total amount
- [ ] Return client secret to frontend
- [ ] Implement `POST /orders/confirm` (after payment success)
- [ ] Create Order and OrderItems in database
- [ ] Reduce product stock
- [ ] Handle payment failures

**Acceptance Criteria:**
- [ ] Payment intent created successfully
- [ ] Stock validated before order creation
- [ ] Order saved to database with correct data
- [ ] Stock decremented after successful order
- [ ] Out-of-stock items prevent order creation

**Files to Create:**
- `app/api/src/routes/orders.ts`
- `app/api/src/services/orderService.ts`

---

#### 3.4.3 Checkout Page (Frontend) ❌
- [ ] Create `/checkout` page (protected route)
- [ ] Display order summary (items, quantities, prices)
- [ ] Integrate payment SDK (Stripe Elements or Omise form)
- [ ] Handle payment submission
- [ ] Show loading state during payment
- [ ] Redirect to confirmation on success
- [ ] Show error message on failure
- [ ] Clear cart after successful order

**Acceptance Criteria:**
- [ ] Unauthenticated users redirected to signin
- [ ] Order summary accurate
- [ ] Test card numbers accepted
- [ ] Success redirects to confirmation page
- [ ] Failure shows error without creating order
- [ ] Cart cleared only on success

**Files to Create:**
- `app/web/src/app/checkout/page.tsx`
- `app/web/src/components/PaymentForm.tsx`

**Test Cases:** TC-CHECK-001 through TC-CHECK-004 in [05-test-plan.md](docs/05-test-plan.md)

---

#### 3.4.4 Order Confirmation Page ❌
- [ ] Create `/orders/[id]/confirmation` page
- [ ] Display order details (ID, items, total)
- [ ] Show success message
- [ ] Link back to products or home

**Acceptance Criteria:**
- [ ] Order details displayed correctly
- [ ] User can navigate away after viewing

**Files to Create:**
- `app/web/src/app/orders/[id]/confirmation/page.tsx`

---

### 3.5 Admin Dashboard

#### 3.5.1 Admin Backend Routes ❌
- [ ] Implement `GET /admin/orders` (list all orders)
- [ ] Add query filters (status, date range - optional)
- [ ] Implement `GET /admin/products` (all products)
- [ ] Implement `PUT /admin/products/:id/stock` (update stock)
- [ ] Protect routes with `requireAdmin` middleware

**Acceptance Criteria:**
- [ ] Only admin users can access routes
- [ ] Orders list includes all order data
- [ ] Stock update validates input (non-negative integer)
- [ ] Non-admin users get 403 Forbidden

**Files to Create:**
- `app/api/src/routes/admin.ts`

**Test Cases:** TC-ADMIN-001, TC-ADMIN-002, TC-ADMIN-003 in [05-test-plan.md](docs/05-test-plan.md)

---

#### 3.5.2 Admin Layout & Navigation ❌
- [ ] Create admin layout component
- [ ] Admin navigation menu (orders, products)
- [ ] Restrict access to admin role only
- [ ] Redirect non-admin users

**Acceptance Criteria:**
- [ ] Admin pages have consistent layout
- [ ] Navigation between admin pages works
- [ ] Non-admin users cannot access

**Files to Create:**
- `app/web/src/app/admin/layout.tsx`

---

#### 3.5.3 Admin Orders Page ❌
- [ ] Create `/admin/orders` page
- [ ] Fetch all orders from API
- [ ] Display orders in table/list
- [ ] Show order ID, date, customer email, total, status
- [ ] Add basic filtering/sorting (optional for MVP)
- [ ] Link to order detail (optional)

**Acceptance Criteria:**
- [ ] All orders displayed
- [ ] Data accurate and formatted
- [ ] Table responsive

**Files to Create:**
- `app/web/src/app/admin/orders/page.tsx`

**Test Cases:** TC-ADMIN-001 in [05-test-plan.md](docs/05-test-plan.md)

---

#### 3.5.4 Admin Products/Stock Page ❌
- [ ] Create `/admin/products` page
- [ ] Fetch all products from API
- [ ] Display products in table
- [ ] Show product name, current stock, price
- [ ] Add inline stock editor or edit modal
- [ ] Update stock via API on save
- [ ] Show success/error feedback

**Acceptance Criteria:**
- [ ] All products listed
- [ ] Stock can be updated
- [ ] Changes reflected immediately
- [ ] Validation prevents negative stock

**Files to Create:**
- `app/web/src/app/admin/products/page.tsx`
- `app/web/src/components/admin/StockEditor.tsx`

**Test Cases:** TC-ADMIN-002 in [05-test-plan.md](docs/05-test-plan.md)

---

### 3.6 Testing & Polish

#### 3.6.1 Integration Testing ❌
- [ ] Test complete purchase flow (browse → cart → checkout → confirm)
- [ ] Test stock validation during checkout
- [ ] Test admin order viewing
- [ ] Test admin stock updates
- [ ] Test concurrent order scenarios (optional)

**Acceptance Criteria:**
- [ ] All critical flows work end-to-end
- [ ] Stock correctly decremented
- [ ] Admin sees updated data

**Test Cases:** All test cases from [05-test-plan.md](docs/05-test-plan.md)

---

#### 3.6.2 Manual Testing Checklist ❌
- [ ] Complete all test cases in [05-test-plan.md](docs/05-test-plan.md)
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design on mobile
- [ ] Test error scenarios (network failures, invalid inputs)
- [ ] Document any bugs found

**Acceptance Criteria:**
- [ ] All test cases pass or documented as known issues
- [ ] Critical bugs fixed
- [ ] Minor bugs triaged for future

---

#### 3.6.3 UI/UX Polish ❌
- [ ] Add loading spinners/skeletons
- [ ] Improve error messages (user-friendly)
- [ ] Add success notifications (toasts)
- [ ] Ensure consistent styling
- [ ] Add basic accessibility (alt texts, labels)
- [ ] Optimize images (if using real images)

**Acceptance Criteria:**
- [ ] Loading states clear to user
- [ ] Errors actionable and understandable
- [ ] UI consistent across pages

---

#### 3.6.4 Documentation Updates ❌
- [ ] Update [README.md](README.md) with final setup instructions
- [ ] Document test payment credentials
- [ ] Update [07-deploy-notes.md](docs/07-deploy-notes.md) with deployment steps
- [ ] Add screenshots to docs (optional)
- [ ] Record demo video (optional)

**Acceptance Criteria:**
- [ ] README accurate for current state
- [ ] New developers can follow docs to run project
- [ ] Test credentials documented

---

**Phase 3 Completion Criteria:**
- [ ] All Phase 3 tasks complete
- [ ] User can complete full purchase flow
- [ ] Admin can view orders and manage stock
- [ ] All critical test cases pass
- [ ] Documentation updated
- [ ] MVP ready for review/demo

---

## 🎯 MVP Acceptance Checklist

### Functional Requirements
- [ ] User can browse product catalog
- [ ] User can view product details
- [ ] User can add products to cart
- [ ] User can modify cart (update quantity, remove items)
- [ ] User can sign up for account
- [ ] User can sign in to account
- [ ] User can complete checkout with test payment
- [ ] Order created in database after successful payment
- [ ] Cart cleared after order completion
- [ ] Admin can view all orders
- [ ] Admin can update product stock levels
- [ ] Stock levels reflect on product pages

### Technical Requirements
- [ ] All services run via Docker Compose on WSL
- [ ] Database data persists across restarts
- [ ] Frontend and backend communicate correctly
- [ ] Environment variables properly configured
- [ ] No secrets committed to repository
- [ ] Payment gateway in test mode only
- [ ] Basic error handling implemented
- [ ] Loading states implemented

### Documentation Requirements
- [ ] All docs in `docs/` folder complete
- [ ] README with setup instructions
- [ ] Test plan with all test cases
- [ ] Deployment notes accurate
- [ ] Known issues documented

### Quality Requirements
- [ ] No critical bugs
- [ ] Core functionality tested manually
- [ ] Code follows project structure
- [ ] TypeScript types used throughout
- [ ] Basic responsive design implemented

---

## 📊 Progress Tracking

**Phase 1:** ✅ Complete (8/8 tasks)  
**Phase 2:** ❌ Not Started (0/24 tasks)  
**Phase 3:** ❌ Not Started (0/29 tasks)

**Overall:** 8/61 tasks complete (13%)

---

## 🚀 Next Steps

1. **Immediate:** Begin Phase 2.1 - Backend project setup
2. **This Week:** Complete database schema and migrations
3. **This Month:** Complete Phase 2 (Data & Auth)
4. **Next Month:** Begin Phase 3 (Checkout & Admin)

---

## 📝 Notes

- Update this file as tasks are completed
- Mark tasks as ✅, 🚧, ⏳, or ❌
- Add actual dates when tasks completed
- Document blockers or issues in separate issue tracker
- Review and adjust estimates as needed

**Last Updated:** [Current Date]