# 02 - User Stories

## Epic: Browse & Purchase

### US-001: Browse Products
**As a** visitor  
**I want to** view a list of available products  
**So that** I can see what's available to purchase

**Acceptance Criteria:**
- Product catalog page displays product name, image, price
- Products load from database via API
- Basic pagination or "show all" for MVP

### US-002: View Product Details
**As a** visitor  
**I want to** click on a product to see details  
**So that** I can learn more before purchasing

**Acceptance Criteria:**
- Product detail page shows full description, price, stock status
- "Add to Cart" button visible when in stock
- Out-of-stock products show appropriate message

### US-003: Add to Cart
**As a** visitor  
**I want to** add products to my cart  
**So that** I can purchase multiple items together

**Acceptance Criteria:**
- Cart icon shows item count
- User can add same product multiple times (quantity increases)
- Cart persists during session

### US-004: View & Modify Cart
**As a** visitor  
**I want to** view my cart and adjust quantities  
**So that** I can review my order before checkout

**Acceptance Criteria:**
- Cart page shows all items with quantity controls
- User can remove items
- Total price updates automatically
- Empty cart shows appropriate message

## Epic: Authentication

### US-005: Sign Up
**As a** new user  
**I want to** create an account  
**So that** I can checkout and view my orders

**Acceptance Criteria:**
- Sign-up form accepts email and password
- Password meets minimum requirements
- Duplicate emails rejected
- User automatically signed in after registration

### US-006: Sign In
**As a** returning user  
**I want to** sign in to my account  
**So that** I can access checkout

**Acceptance Criteria:**
- Sign-in form accepts email and password
- Invalid credentials show error message
- Successful login redirects to previous page or home
- Session maintained across page refreshes

### US-007: Sign Out
**As a** signed-in user  
**I want to** sign out  
**So that** I can secure my account

**Acceptance Criteria:**
- Sign-out button clears session
- User redirected to home page
- Cart data handled appropriately

## Epic: Checkout

### US-008: Checkout (Test Mode)
**As a** signed-in user  
**I want to** complete checkout using test payment  
**So that** I can simulate placing an order

**Acceptance Criteria:**
- Checkout page shows order summary
- Test payment form integrated (Stripe/Omise sandbox)
- Test card numbers accepted
- Order created in database on success
- Cart cleared after successful order
- Confirmation message shown

## Epic: Admin-Lite

### US-009: View Orders
**As an** admin  
**I want to** view all orders  
**So that** I can track sales

**Acceptance Criteria:**
- Admin dashboard shows order list
- Each order displays: ID, date, customer, total, status
- Basic filtering by status (optional for MVP)

### US-010: Manage Stock
**As an** admin  
**I want to** update product stock levels  
**So that** inventory remains accurate

**Acceptance Criteria:**
- Admin can view current stock for each product
- Admin can update stock quantity
- Changes reflected immediately on product pages
- Out-of-stock products cannot be added to cart