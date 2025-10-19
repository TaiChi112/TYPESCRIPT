# 05 - Test Plan (Outline)

## Testing Scope

### In Scope
- Core user flows (browse, cart, checkout)
- Authentication flows (signup, signin, signout)
- Admin operations (view orders, update stock)
- API endpoint functionality
- Database operations
- Test payment integration

### Out of Scope (MVP)
- Load testing
- Security penetration testing
- Cross-browser compatibility (target modern browsers only)
- Mobile responsiveness (basic only)
- Accessibility compliance (WCAG)

---

## Test Levels

### 1. Unit Tests

**Backend (Elysia):**
- Service layer functions
- Utility functions
- Data validation logic
- Authentication helpers

**Frontend (Next.js):**
- Component rendering (basic)
- Utility functions
- State management logic

**Tools:**
- Backend: Bun test or Vitest
- Frontend: Jest + React Testing Library

---

### 2. Integration Tests

**Backend API:**
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `GET /products` - Product listing
- `POST /cart/items` - Add to cart
- `POST /orders` - Create order
- `GET /admin/orders` - Admin order list
- `PUT /admin/products/:id/stock` - Update stock

**Database:**
- Prisma queries return expected data
- Relationships work correctly
- Transactions maintain data integrity

**Tools:**
- Supertest or similar for HTTP testing
- Test database instance

---

### 3. End-to-End Tests (Optional for MVP)

**Critical Flows:**
- Complete purchase flow (browse → cart → checkout → confirmation)
- User registration and login
- Admin stock update reflects on product page

**Tools:**
- Playwright or Cypress (if time allows)

---

## Test Cases (Functional)

### Authentication

**TC-AUTH-001: Successful Sign Up**
- **Given:** New user on signup page
- **When:** Valid email and password submitted
- **Then:** Account created, user signed in, redirected

**TC-AUTH-002: Sign Up with Existing Email**
- **Given:** Email already in database
- **When:** User tries to sign up
- **Then:** Error message displayed, no account created

**TC-AUTH-003: Successful Sign In**
- **Given:** Registered user on signin page
- **When:** Correct credentials submitted
- **Then:** User signed in, session created, redirected

**TC-AUTH-004: Sign In with Wrong Password**
- **Given:** Registered user
- **When:** Incorrect password submitted
- **Then:** Error message, not signed in

**TC-AUTH-005: Sign Out**
- **Given:** Signed-in user
- **When:** Sign-out clicked
- **Then:** Session cleared, redirected to home

---

### Product Browsing

**TC-PROD-001: View Product List**
- **Given:** User on products page
- **When:** Page loads
- **Then:** Products displayed with name, image, price

**TC-PROD-002: View Product Detail**
- **Given:** User on product list
- **When:** Product clicked
- **Then:** Detail page shows full description, stock status

**TC-PROD-003: Out-of-Stock Product**
- **Given:** Product with stock = 0
- **When:** Detail page viewed
- **Then:** "Out of Stock" message shown, no "Add to Cart" button

---

### Shopping Cart

**TC-CART-001: Add Product to Cart**
- **Given:** User viewing product detail
- **When:** "Add to Cart" clicked
- **Then:** Item appears in cart, quantity = 1

**TC-CART-002: Increase Quantity**
- **Given:** Item in cart
- **When:** Quantity increased
- **Then:** Cart updates, total price recalculated

**TC-CART-003: Remove from Cart**
- **Given:** Item in cart
- **When:** Remove button clicked
- **Then:** Item removed, cart updates

**TC-CART-004: Empty Cart Display**
- **Given:** No items in cart
- **When:** Cart page viewed
- **Then:** "Your cart is empty" message shown

---

### Checkout

**TC-CHECK-001: Guest Checkout Blocked**
- **Given:** Guest user (not signed in)
- **When:** Checkout attempted
- **Then:** Redirected to signin page

**TC-CHECK-002: Successful Test Payment**
- **Given:** Signed-in user with items in cart
- **When:** Valid test card details submitted
- **Then:** Order created, cart cleared, confirmation shown

**TC-CHECK-003: Failed Test Payment**
- **Given:** Signed-in user with items in cart
- **When:** Invalid/declined test card used
- **Then:** Error message shown, order not created, cart unchanged

**TC-CHECK-004: Stock Validation**
- **Given:** Product with limited stock
- **When:** Cart quantity exceeds stock
- **Then:** Checkout shows error, order not created

---

### Admin

**TC-ADMIN-001: View Orders (Admin Only)**
- **Given:** Admin user signed in
- **When:** Admin orders page accessed
- **Then:** All orders displayed with details

**TC-ADMIN-002: Update Stock**
- **Given:** Admin viewing product stock
- **When:** Stock quantity updated
- **Then:** Database updated, product page reflects change

**TC-ADMIN-003: Non-Admin Access Denied**
- **Given:** Regular user
- **When:** Admin route accessed
- **Then:** Access denied (403 or redirect)

---

## Acceptance Test Scenarios (Detailed)

### Epic 1: Authentication Flows

#### Scenario 1.1: New User Registration - Happy Path

**TC-AUTH-101: Register with Valid Credentials**

```gherkin
Given I am a new user on the signup page at "/auth/signup"
And the email "newuser@test.com" does not exist in the database
When I enter "newuser@test.com" in the email field
And I enter "SecurePass123!" in the password field
And I enter "SecurePass123!" in the confirm password field
And I click the "Sign Up" button
Then I should see a loading indicator
And the API should receive a POST request to "/auth/signup"
And a new user should be created in the database with role "USER"
And the password should be hashed using bcrypt
And I should receive a JWT token in the response
And the token should be stored in localStorage (or httpOnly cookie)
And I should be redirected to the home page "/"
And I should see a welcome message "Welcome, newuser@test.com!"
And the navigation should show "Sign Out" button instead of "Sign In"
```

**Expected API Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "email": "newuser@test.com",
    "role": "USER"
  }
}
```

---

#### Scenario 1.2: Registration Validation Failures

**TC-AUTH-102: Register with Existing Email**

```gherkin
Given I am a new user on the signup page at "/auth/signup"
And the email "existing@test.com" already exists in the database
When I enter "existing@test.com" in the email field
And I enter "ValidPass123!" in the password field
And I enter "ValidPass123!" in the confirm password field
And I click the "Sign Up" button
Then the API should return a 409 Conflict status code
And I should see an error message "Email already registered"
And I should remain on the signup page
And no new user should be created in the database
And no JWT token should be issued
```

**TC-AUTH-103: Register with Weak Password**

```gherkin
Given I am a new user on the signup page at "/auth/signup"
When I enter "weakuser@test.com" in the email field
And I enter "123" in the password field
And I click the "Sign Up" button
Then I should see a validation error "Password must be at least 8 characters"
And the form should not be submitted
And no API request should be made
```

**TC-AUTH-104: Register with Password Mismatch**

```gherkin
Given I am a new user on the signup page at "/auth/signup"
When I enter "testuser@test.com" in the email field
And I enter "SecurePass123!" in the password field
And I enter "DifferentPass456!" in the confirm password field
And I click the "Sign Up" button
Then I should see a validation error "Passwords do not match"
And the form should not be submitted
And no API request should be made
```

**TC-AUTH-105: Register with Invalid Email Format**

```gherkin
Given I am a new user on the signup page at "/auth/signup"
When I enter "invalid-email" in the email field
And I enter "ValidPass123!" in the password field
And I click the "Sign Up" button
Then I should see a validation error "Invalid email format"
And the form should not be submitted
And no API request should be made
```

---

#### Scenario 1.3: User Sign In - Happy Path

**TC-AUTH-201: Sign In with Valid Credentials**

```gherkin
Given I am a registered user with email "user@test.com" and password "MyPass123!"
And I am on the signin page at "/auth/signin"
And I am not currently signed in
When I enter "user@test.com" in the email field
And I enter "MyPass123!" in the password field
And I click the "Sign In" button
Then the API should receive a POST request to "/auth/signin"
And the API should validate the password against the hashed password in the database
And I should receive a JWT token in the response
And the token should be stored in localStorage (or httpOnly cookie)
And I should be redirected to the previous page I was on (or home page if none)
And I should see my email "user@test.com" in the navigation bar
And the navigation should show "Sign Out" button
And I should have access to protected routes like "/checkout"
```

**Expected API Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "email": "user@test.com",
    "role": "USER"
  }
}
```

---

#### Scenario 1.4: Sign In Validation Failures

**TC-AUTH-202: Sign In with Incorrect Password**

```gherkin
Given I am a registered user with email "user@test.com"
And the correct password is "CorrectPass123!"
And I am on the signin page at "/auth/signin"
When I enter "user@test.com" in the email field
And I enter "WrongPassword456!" in the password field
And I click the "Sign In" button
Then the API should return a 401 Unauthorized status code
And I should see an error message "Invalid email or password"
And I should remain on the signin page
And no JWT token should be issued
And I should not be signed in
```

**TC-AUTH-203: Sign In with Non-Existent Email**

```gherkin
Given the email "nonexistent@test.com" does not exist in the database
And I am on the signin page at "/auth/signin"
When I enter "nonexistent@test.com" in the email field
And I enter "SomePassword123!" in the password field
And I click the "Sign In" button
Then the API should return a 401 Unauthorized status code
And I should see an error message "Invalid email or password"
And I should remain on the signin page
And no JWT token should be issued
```

**TC-AUTH-204: Sign In with Empty Fields**

```gherkin
Given I am on the signin page at "/auth/signin"
When I leave the email field empty
And I leave the password field empty
And I click the "Sign In" button
Then I should see validation errors "Email is required" and "Password is required"
And the form should not be submitted
And no API request should be made
```

---

#### Scenario 1.5: Sign Out Flow

**TC-AUTH-301: Successful Sign Out**

```gherkin
Given I am signed in as "user@test.com"
And I have a valid JWT token stored
And I am on any page in the application
When I click the "Sign Out" button in the navigation
Then the JWT token should be removed from localStorage (or cookie cleared)
And I should be redirected to the home page "/"
And the navigation should show "Sign In" and "Sign Up" buttons
And I should no longer have access to protected routes
And attempting to access "/checkout" should redirect me to "/auth/signin"
```

**TC-AUTH-302: Sign Out from Multiple Tabs**

```gherkin
Given I am signed in as "user@test.com" in two browser tabs
When I click "Sign Out" in the first tab
Then I should be signed out in the first tab
And when I navigate or refresh the second tab
Then I should also be signed out in the second tab
And both tabs should redirect to the home page
```

---

#### Scenario 1.6: Protected Route Access

**TC-AUTH-401: Access Protected Route Without Authentication**

```gherkin
Given I am not signed in
And I have no JWT token stored
When I attempt to navigate to "/checkout"
Then I should be redirected to "/auth/signin"
And I should see a message "Please sign in to continue"
And the original URL "/checkout" should be stored as return URL
And after signing in successfully
Then I should be redirected back to "/checkout"
```

**TC-AUTH-402: Access Admin Route as Regular User**

```gherkin
Given I am signed in as "user@test.com" with role "USER"
And I have a valid JWT token
When I attempt to navigate to "/admin/orders"
Then the API should return a 403 Forbidden status code
And I should see an error message "Access denied. Admin privileges required."
And I should be redirected to the home page
```

**TC-AUTH-403: Access Admin Route as Admin User**

```gherkin
Given I am signed in as "admin@test.com" with role "ADMIN"
And I have a valid JWT token
When I navigate to "/admin/orders"
Then I should successfully access the admin orders page
And I should see all orders in the system
```

---

#### Scenario 1.7: Token Expiration Handling

**TC-AUTH-501: Expired Token Detected**

```gherkin
Given I was signed in with a JWT token that expires in 7 days
And 8 days have passed (simulate by manipulating token expiration)
And I have the expired token stored
When I navigate to any page in the application
Then the expired token should be detected by the API
And I should receive a 401 Unauthorized response
And the expired token should be removed from storage
And I should be redirected to "/auth/signin"
And I should see a message "Your session has expired. Please sign in again."
```

---

### Epic 2: Shopping Cart Flows

#### Scenario 2.1: Add Product to Cart - Happy Path

**TC-CART-101: Add Single Product from Product Detail Page**

```gherkin
Given I am on the product detail page for "Wireless Headphones" with product ID "prod-001"
And the product has 10 units in stock
And the product price is $99.99
And my cart is currently empty
When I click the "Add to Cart" button
Then the product should be added to my cart with quantity 1
And the cart icon badge should update to show "1"
And I should see a success notification "Added to cart"
And the cart state should be persisted in localStorage
And when I click the cart icon
Then I should see "Wireless Headphones" listed in the cart
And the quantity should show "1"
And the item subtotal should show "$99.99"
And the cart total should show "$99.99"
```

**Cart State After Action:**
```json
{
  "items": [
    {
      "productId": "prod-001",
      "name": "Wireless Headphones",
      "price": 99.99,
      "quantity": 1,
      "imageUrl": "/images/headphones.jpg",
      "stock": 10
    }
  ],
  "totalItems": 1,
  "totalPrice": 99.99
}
```

---

**TC-CART-102: Add Product with Custom Quantity**

```gherkin
Given I am on the product detail page for "USB Cable" with product ID "prod-002"
And the product has 50 units in stock
And the product price is $9.99
And my cart is currently empty
When I set the quantity selector to "3"
And I click the "Add to Cart" button
Then the product should be added to my cart with quantity 3
And the cart icon badge should update to show "3"
And the item subtotal should show "$29.97"
And the cart total should show "$29.97"
```

---

**TC-CART-103: Add Same Product Multiple Times (Quantity Increase)**

```gherkin
Given I am on the product detail page for "Phone Case" with product ID "prod-003"
And the product price is $19.99
And I already have 2 units of "Phone Case" in my cart
And the product has 20 units in stock
When I click the "Add to Cart" button
Then the existing cart item quantity should increase from 2 to 3
And the cart icon badge should update to show "3"
And the item subtotal should show "$59.97"
And I should see a notification "Quantity updated in cart"
And the cart should NOT contain duplicate entries for the same product
```

---

#### Scenario 2.2: Add to Cart Validation

**TC-CART-104: Add Out-of-Stock Product**

```gherkin
Given I am on the product detail page for "Sold Out Item" with product ID "prod-004"
And the product has 0 units in stock
When the page loads
Then the "Add to Cart" button should be disabled
And I should see a message "Out of Stock"
And I should not be able to add this product to my cart
```

**TC-CART-105: Add Quantity Exceeding Available Stock**

```gherkin
Given I am on the product detail page for "Limited Item" with product ID "prod-005"
And the product has 3 units in stock
And the product price is $49.99
When I set the quantity selector to "5"
And I click the "Add to Cart" button
Then I should see a validation error "Only 3 units available in stock"
And the quantity should be automatically adjusted to "3"
Or the "Add to Cart" button should be disabled
And the cart should not be updated with the invalid quantity
```

**TC-CART-106: Add to Cart When Stock Becomes Zero During Session**

```gherkin
Given I am on the product detail page for "Popular Item" with product ID "prod-006"
And the product initially has 1 unit in stock
And another user purchases the last unit before I click "Add to Cart"
When I click the "Add to Cart" button
Then the API should validate current stock
And I should see an error message "This item is no longer available"
And the product detail page should update to show "Out of Stock"
And the "Add to Cart" button should be disabled
And the item should not be added to my cart
```

---

#### Scenario 2.3: Cart Management Operations

**TC-CART-201: View Cart Page**

```gherkin
Given I have 3 different products in my cart:
  | Product           | Price  | Quantity | Subtotal |
  | Wireless Mouse    | $29.99 | 2        | $59.98   |
  | Keyboard          | $79.99 | 1        | $79.99   |
  | Monitor Stand     | $39.99 | 1        | $39.99   |
When I navigate to "/cart"
Then I should see all 3 products listed
And each product should display its name, image, price, and quantity
And each product row should show the correct subtotal
And the cart total should show "$179.96"
And I should see a "Proceed to Checkout" button
And I should see quantity controls (+ and -) for each item
And I should see a "Remove" button for each item
```

---

**TC-CART-202: Increase Item Quantity in Cart**

```gherkin
Given I am on the cart page
And I have "Wireless Mouse" in my cart with quantity 2 and price $29.99
And the product has 10 units in stock
When I click the "+" button for "Wireless Mouse"
Then the quantity should increase to 3
And the item subtotal should update to "$89.97"
And the cart total should be recalculated and updated
And the cart state should be persisted in localStorage
And the API should NOT be called (for localStorage-based cart)
Or the API should receive PUT request to "/cart/items/:id" (for database-based cart)
```

---

**TC-CART-203: Decrease Item Quantity in Cart**

```gherkin
Given I am on the cart page
And I have "Keyboard" in my cart with quantity 3 and price $79.99
When I click the "-" button for "Keyboard"
Then the quantity should decrease to 2
And the item subtotal should update to "$159.98"
And the cart total should be recalculated and updated
And the cart state should be persisted
```

---

**TC-CART-204: Decrease Quantity to Zero (Auto Remove)**

```gherkin
Given I am on the cart page
And I have "USB Cable" in my cart with quantity 1
When I click the "-" button for "USB Cable"
Then the item should be removed from the cart entirely
And I should see a notification "Item removed from cart"
And the cart item count should decrease by 1
And the cart total should be recalculated
```

---

**TC-CART-205: Remove Item from Cart**

```gherkin
Given I am on the cart page
And I have 2 items in my cart with a total of $109.98
And one item is "Monitor Stand" priced at $39.99 with quantity 1
When I click the "Remove" button for "Monitor Stand"
Then a confirmation dialog should appear "Remove this item from cart?"
And when I confirm
Then "Monitor Stand" should be removed from the cart
And the cart should now show 1 item
And the cart total should update to "$69.99"
And I should see a notification "Item removed from cart"
And the cart state should be persisted
```

---

**TC-CART-206: View Empty Cart**

```gherkin
Given I have no items in my cart
When I navigate to "/cart"
Then I should see a message "Your cart is empty"
And I should see a "Continue Shopping" button
And I should NOT see a "Proceed to Checkout" button
And the cart icon badge should show "0" or be hidden
And when I click "Continue Shopping"
Then I should be redirected to the products page "/products"
```

---

#### Scenario 2.4: Cart Persistence

**TC-CART-301: Cart Persists Across Page Refreshes**

```gherkin
Given I am a guest user (not signed in)
And I have 2 items in my cart stored in localStorage
When I refresh the browser page
Then my cart should still contain the same 2 items
And the cart icon badge should show "2"
And the cart total should remain unchanged
```

**TC-CART-302: Cart Persists Across Browser Tabs**

```gherkin
Given I am viewing the website in Tab A
And I add "Product X" to my cart in Tab A
When I open a new tab (Tab B) with the same website
Then Tab B should also show "Product X" in the cart
And the cart icon badge should show "1" in both tabs
And when I add "Product Y" in Tab B
Then Tab A should also update to show both products when refreshed or when storage event fires
```

**TC-CART-303: Cart Cleared After Sign Out**

```gherkin
Given I am signed in as "user@test.com"
And I have 3 items in my cart
When I sign out
Then [DECISION POINT: Implement one of the following]
Option A: The cart should be preserved and associated with my account
  And when I sign back in, my cart should be restored
Option B: The cart should be cleared
  And when I sign back in, I should start with an empty cart
```

---

### Epic 3: Checkout Flow (Test Payment Mode)

#### Scenario 3.1: Checkout Prerequisites

**TC-CHECK-101: Guest User Cannot Access Checkout**

```gherkin
Given I am not signed in (guest user)
And I have 2 items in my cart worth $149.98
When I navigate to the cart page
And I click the "Proceed to Checkout" button
Then I should be redirected to "/auth/signin"
And I should see a message "Please sign in to complete your purchase"
And the return URL "/checkout" should be stored
And after signing in successfully
Then I should be automatically redirected to "/checkout"
And my cart contents should be preserved
```

---

**TC-CHECK-102: Signed-In User Accesses Checkout**

```gherkin
Given I am signed in as "buyer@test.com"
And I have 2 items in my cart:
  | Product        | Price  | Quantity | Subtotal |
  | Laptop Stand   | $59.99 | 1        | $59.99   |
  | Mouse Pad      | $14.99 | 2        | $29.98   |
And the cart total is $89.97
When I navigate to the cart page
And I click the "Proceed to Checkout" button
Then I should be redirected to "/checkout"
And I should successfully load the checkout page
```

---

#### Scenario 3.2: Checkout Page Display

**TC-CHECK-201: View Checkout Page with Order Summary**

```gherkin
Given I am signed in as "buyer@test.com"
And I am on the checkout page "/checkout"
And my cart contains:
  | Product        | Price  | Quantity | Subtotal |
  | Laptop Stand   | $59.99 | 1        | $59.99   |
  | Mouse Pad      | $14.99 | 2        | $29.98   |
Then I should see an "Order Summary" section displaying:
  - Each product name, quantity, and price
  - Subtotal: $89.97
  - Shipping: $0.00 (or calculated shipping)
  - Tax: $0.00 (or calculated tax)
  - Total: $89.97
And I should see a "Payment Details" section with:
  - Card number input field
  - Expiry date input field
  - CVC input field
  - Cardholder name input field
And I should see a "Complete Purchase" button
And I should see a note "Test Mode: Use test card 4242 4242 4242 4242"
```

---

#### Scenario 3.3: Stock Validation Before Payment

**TC-CHECK-202: Checkout with Sufficient Stock**

```gherkin
Given I am signed in and on the checkout page
And my cart contains "Webcam" with quantity 2 priced at $79.99 each
And the product "Webcam" has 5 units in stock in the database
When I proceed to enter payment details
Then the stock should be sufficient
And I should be able to continue to payment
And no stock validation error should appear
```

---

**TC-CHECK-203: Checkout with Insufficient Stock**

```gherkin
Given I am signed in and on the checkout page
And my cart contains "Limited Item" with quantity 3 priced at $49.99 each
And the product "Limited Item" now has only 1 unit in stock in the database
  (stock decreased after I added to cart due to other purchases)
When the checkout page loads or when I click "Complete Purchase"
Then the API should validate current stock levels
And I should see an error message "Some items in your cart are no longer available in the requested quantity"
And I should see details: "Limited Item: Only 1 available (you have 3 in cart)"
And the "Complete Purchase" button should be disabled
And I should see options to:
  - Update cart quantity to available stock (1)
  - Remove the item from cart
  - Return to cart
And the order should NOT be created
And no payment should be processed
```

---

**TC-CHECK-204: Checkout with Out-of-Stock Item**

```gherkin
Given I am signed in and on the checkout page
And my cart contains "Popular Item" with quantity 2
And the product "Popular Item" now has 0 units in stock
When the checkout page loads or when I click "Complete Purchase"
Then I should see an error "Popular Item is out of stock and cannot be purchased"
And I should be prompted to remove the item from my cart
And the "Complete Purchase" button should be disabled
And I should have the option to return to cart to make changes
```

---

#### Scenario 3.4: Test Payment Integration - Success Flow

**TC-CHECK-301: Successful Payment with Stripe Test Card**

```gherkin
Given I am signed in as "buyer@test.com"
And I am on the checkout page with valid cart contents
And the cart total is $89.97
And all items have sufficient stock
When I enter the following test payment details:
  - Card number: "4242 4242 4242 4242"
  - Expiry: "12/25"
  - CVC: "123"
  - Name: "Test Buyer"
And I click the "Complete Purchase" button
Then the frontend should create a payment intent via API POST "/orders/create-payment-intent"
And the API should:
  - Validate cart contents
  - Validate stock availability
  - Calculate total amount
  - Create a Stripe payment intent with amount $89.97
  - Return client secret to frontend
And the frontend should use Stripe.js to confirm the payment
And Stripe should return a successful payment confirmation (in test mode)
And the frontend should call API POST "/orders/confirm" with payment intent ID
And the API should:
  - Create an Order record in the database with status "COMPLETED"
  - Create OrderItem records for each cart item
  - Decrement product stock quantities
  - Store payment intent ID in the order
And I should be redirected to "/orders/[orderId]/confirmation"
And I should see a success message "Order placed successfully!"
And I should see my order details:
  - Order ID
  - Order date
  - Items purchased
  - Total amount paid: $89.97
  - Order status: "Completed"
And my cart should be cleared (empty)
And the cart icon badge should show "0"
```

**Expected Database State After Successful Order:**

**Order Table:**
```json
{
  "id": "order-001",
  "userId": "user-buyer-id",
  "status": "COMPLETED",
  "totalAmount": 89.97,
  "paymentIntentId": "pi_test_1234567890",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**OrderItems Table:**
```json
[
  {
    "id": "orderitem-001",
    "orderId": "order-001",
    "productId": "prod-laptop-stand",
    "quantity": 1,
    "priceAtPurchase": 59.99
  },
  {
    "id": "orderitem-002",
    "orderId": "order-001",
    "productId": "prod-mouse-pad",
    "quantity": 2,
    "priceAtPurchase": 14.99
  }
]
```

**Product Table (Stock Updated):**
```json
[
  {
    "id": "prod-laptop-stand",
    "name": "Laptop Stand",
    "stock": 4  // decreased from 5
  },
  {
    "id": "prod-mouse-pad",
    "name": "Mouse Pad",
    "stock": 18  // decreased from 20
  }
]
```

---

#### Scenario 3.5: Test Payment Integration - Failure Flows

**TC-CHECK-401: Declined Payment Card**

```gherkin
Given I am signed in and on the checkout page
And my cart total is $89.97
When I enter the following test payment details:
  - Card number: "4000 0000 0000 0002" (Stripe test card for decline)
  - Expiry: "12/25"
  - CVC: "123"
  - Name: "Test Buyer"
And I click the "Complete Purchase" button
Then the payment intent should be created
And Stripe should return a declined payment response
And I should see an error message "Your card was declined. Please try another payment method."
And I should remain on the checkout page
And the "Complete Purchase" button should be re-enabled
And I should be able to retry with different card details
And NO order should be created in the database
And product stock should NOT be decremented
And my cart should remain unchanged
```

---

**TC-CHECK-402: Insufficient Funds Error**

```gherkin
Given I am signed in and on the checkout page
And my cart total is $89.97
When I enter test card number "4000 0000 0000 9995" (insufficient funds)
And I enter valid expiry and CVC
And I click the "Complete Purchase" button
Then Stripe should return an "insufficient funds" error
And I should see an error message "Insufficient funds. Please use a different card."
And NO order should be created
And my cart should remain unchanged
```

---

**TC-CHECK-403: Invalid Card Number**

```gherkin
Given I am signed in and on the checkout page
When I enter an invalid card number "1234 5678 9012 3456"
And I try to proceed
Then I should see a client-side validation error "Invalid card number"
And the payment should NOT be submitted to Stripe
And the "Complete Purchase" button should be disabled
```

---

**TC-CHECK-404: Expired Card**

```gherkin
Given I am signed in and on the checkout page
When I enter test card number "4000 0000 0000 0069" (expired card)
And I enter valid expiry and CVC
And I click the "Complete Purchase" button
Then Stripe should return an "expired card" error
And I should see an error message "Your card has expired. Please use a different card."
And NO order should be created
```

---

**TC-CHECK-405: Network Error During Payment**

```gherkin
Given I am signed in and on the checkout page
And I have valid card details entered
When I click "Complete Purchase"
And a network error occurs (simulate by disconnecting internet or API failure)
Then I should see an error message "Network error. Please check your connection and try again."
And the payment should NOT be processed
And the order should NOT be created
And I should remain on the checkout page with the option to retry
And my cart should remain unchanged
```

---

#### Scenario 3.6: Race Conditions and Edge Cases

**TC-CHECK-501: Stock Depleted Between Checkout Load and Payment**

```gherkin
Given I am signed in and on the checkout page
And my cart contains "Hot Item" with quantity 2
And "Hot Item" has 2 units in stock when I load the checkout page
And another user purchases the last 2 units of "Hot Item" before I submit payment
When I enter valid payment details and click "Complete Purchase"
Then the API should re-validate stock before processing payment
And I should see an error "Hot Item is no longer available in the requested quantity"
And the payment should NOT be processed
And NO order should be created
And I should be prompted to update my cart
```

---

**TC-CHECK-502: Concurrent Orders for Same Limited Stock**

```gherkin
Given two users (User A and User B) are on the checkout page simultaneously
And both have "Limited Item" with quantity 1 in their carts
And "Limited Item" has only 1 unit in stock
When User A submits payment first and the order is being processed
And User B submits payment 1 second later
Then User A's order should be created successfully
And "Limited Item" stock should be decremented to 0
And User B's payment should fail with stock validation error
And User B should see "Limited Item is no longer available"
And only one order should be created
```

---

**TC-CHECK-503: Empty Cart at Checkout**

```gherkin
Given I am signed in
And I somehow navigate to "/checkout" with an empty cart
  (by manually typing URL or cart cleared in another tab)
When the checkout page loads
Then I should see a message "Your cart is empty"
And I should NOT see payment form
And I should see a "Go to Products" button
And when I click it, I should be redirected to "/products"
```

---

**TC-CHECK-504: Price Change Between Add-to-Cart and Checkout**

```gherkin
Given I added "Dynamic Pricing Item" to my cart at price $99.99
And I am on the checkout page
And the admin has updated "Dynamic Pricing Item" price to $119.99 in the database
When I proceed to payment
Then [DECISION POINT: Choose behavior]
Option A: The order should use the price stored in the cart at add time ($99.99)
Option B: The order should detect the price change and show a warning
  "Price has changed: Dynamic Pricing Item is now $119.99. Please review your cart."
  And require me to acknowledge before proceeding
```

---

#### Scenario 3.7: Order Confirmation and Post-Checkout

**TC-CHECK-601: View Order Confirmation Page**

```gherkin
Given I successfully completed an order with ID "order-12345"
And I am redirected to "/orders/order-12345/confirmation"
Then I should see:
  - "Order Confirmed!" heading
  - Order ID: "order-12345"
  - Order date and time
  - List of items purchased with quantities and prices
  - Total amount paid
  - Estimated delivery date (optional for MVP)
  - A "Continue Shopping" button
  - A "View Order History" button (future feature)
And when I click "Continue Shopping"
Then I should be redirected to "/products"
```

---

**TC-CHECK-602: Cannot Re-Confirm Same Order**

```gherkin
Given I successfully placed order "order-12345"
And I am on the confirmation page "/orders/order-12345/confirmation"
When I copy the URL and try to access it again later
Then I should still see the order confirmation details
But I should NOT be able to "re-submit" or "re-confirm" the order
And the order should remain in "COMPLETED" status with only one entry in the database
```

---

**TC-CHECK-603: Cart Cleared After Successful Order**

```gherkin
Given I had 3 items in my cart before checkout
And I successfully completed my order
When I navigate to "/cart"
Then my cart should be empty
And I should see "Your cart is empty"
And the cart icon badge should show "0"
And localStorage cart data should be cleared
```

---

### Epic 4: End-to-End User Journeys

#### Scenario 4.1: Complete Purchase Journey (Happy Path)

**TC-E2E-001: Guest to Checkout Complete Flow**

```gherkin
Scenario: New user browses, registers, and completes purchase

Given I am a new user visiting the website for the first time
And I am not signed in

# Browse Products
When I navigate to the home page "/"
And I click "Shop Now" or navigate to "/products"
Then I should see a list of available products

# View Product Detail
When I click on "Wireless Keyboard" product
Then I should be on "/products/prod-keyboard"
And I should see full product details, price $79.99, and stock availability

# Add to Cart
When I click "Add to Cart"
Then I should see a success notification
And the cart icon should show badge "1"

# Add Another Product
When I navigate back to "/products"
And I click on "Gaming Mouse" product
And I set quantity to "2"
And I click "Add to Cart"
Then the cart badge should show "3" (1 keyboard + 2 mice)

# View Cart
When I click the cart icon
Then I should be on "/cart"
And I should see:
  - Wireless Keyboard × 1 = $79.99
  - Gaming Mouse × 2 = $119.98
  - Total: $199.97

# Attempt Checkout (Guest)
When I click "Proceed to Checkout"
Then I should be redirected to "/auth/signin"
And I should see "Please sign in to complete your purchase"

# Register Account
When I click "Don't have an account? Sign up"
Then I should be on "/auth/signup"
When I enter:
  - Email: "newbuyer@test.com"
  - Password: "SecurePass123!"
  - Confirm Password: "SecurePass123!"
And I click "Sign Up"
Then I should be registered and signed in
And I should be redirected to "/checkout"

# Complete Checkout
When I enter test payment details:
  - Card: "4242 4242 4242 4242"
  - Expiry: "12/25"
  - CVC: "123"
  - Name: "New Buyer"
And I click "Complete Purchase"
Then I should see a loading indicator
And after processing, I should be redirected to "/orders/[orderId]/confirmation"
And I should see "Order Confirmed!"
And I should see my order details with total $199.97

# Verify Post-Order State
When I click the cart icon
Then my cart should be empty
And the badge should show "0"

When I navigate to "/products/prod-keyboard"
Then the stock should be decreased by 1
And when I navigate to "/products/prod-mouse"
Then the stock should be decreased by 2
```

---

## Test Data

### Seed Data Requirements
- **Products:** At least 5 products with varying stock levels
  - Product 1: High stock (50+ units)
  - Product 2: Medium stock (10-20 units)
  - Product 3: Low stock (1-3 units)
  - Product 4: Out of stock (0 units)
  - Product 5: Normal stock (5-10 units)
- **Users:** 
  - 1 admin user: `admin@test.com` / `AdminPass123!`
  - 2 regular test users: `user1@test.com` and `user2@test.com`
- **Orders:** Sample orders for admin view testing

### Test Payment Credentials

**Stripe Test Cards:**
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Insufficient Funds:** `4000 0000 0000 9995`
- **Expired Card:** `4000 0000 0000 0069`
- **Processing Error:** `4000 0000 0000 0119`

**Omise Test Cards:** (if using Omise)
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`

**Test Card Details:**
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- Name: Any name

---

## Test Environment

### Setup
- Docker Compose stack running on WSL
- Test database with seed data
- Environment variables configured for test mode
- Stripe/Omise test API keys configured

### Reset Strategy
- Database wiped and reseeded between test suites
- Test users recreated
- Cart state cleared from localStorage

### Test Data Isolation
- Each test should start with known database state
- Use transactions or database rollback for integration tests
- Clear localStorage/sessionStorage before each frontend test

---

## Acceptance Criteria

### MVP Ready When:
- [ ] All critical flows tested manually
- [ ] All authentication test cases pass (TC-AUTH-*)
- [ ] All cart management test cases pass (TC-CART-*)
- [ ] All checkout test cases pass (TC-CHECK-*)
- [ ] API integration tests pass
- [ ] Test payment flow completes successfully
- [ ] Admin can view orders and update stock
- [ ] No critical bugs in core functionality
- [ ] Documentation updated with test results
- [ ] At least 1 complete E2E journey verified (TC-E2E-001)

---

## Bug Tracking

**Severity Levels:**
- **Critical:** Blocks core functionality (must fix before MVP)
  - Examples: Cannot complete checkout, authentication broken, data loss
- **High:** Major feature broken (fix if time allows)
  - Examples: Cart not persisting, stock not updating, error messages missing
- **Medium:** Minor issue (document for Phase 2)
  - Examples: UI glitches, validation message unclear
- **Low:** Cosmetic or edge case (backlog)
  - Examples: Button alignment, color inconsistency

**Template:** Use [.github/ISSUE_TEMPLATE/BUG_REPORT.md](.github/ISSUE_TEMPLATE/BUG_REPORT.md)

---

## Test Execution Tracking

### Test Run Template

```markdown
**Test Run ID:** TR-001
**Date:** 2024-01-15
**Tester:** [Name]
**Environment:** Local WSL Docker
**Test Suite:** Authentication Flows

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TC-AUTH-101 | Register Valid | ✅ Pass | |
| TC-AUTH-102 | Register Duplicate | ✅ Pass | |
| TC-AUTH-201 | Sign In Valid | ❌ Fail | Token not stored |
| TC-AUTH-301 | Sign Out | ⏭️ Blocked | Depends on TC-AUTH-201 |

**Bugs Found:**
- BUG-001: JWT token not saved to localStorage after signin
  - Severity: Critical
  - Steps to Reproduce: [...]
```

---

## Manual Testing Checklist

### Pre-Test Setup
- [ ] Docker Compose services running
- [ ] Database seeded with test data
- [ ] Test payment keys configured
- [ ] Browser localStorage cleared
- [ ] Browser cache cleared

### Test Execution
- [ ] Run all authentication scenarios
- [ ] Run all cart management scenarios
- [ ] Run all checkout scenarios
- [ ] Run at least one complete E2E journey
- [ ] Test error handling and edge cases
- [ ] Verify database state after critical operations

### Post-Test
- [ ] Document all bugs found
- [ ] Update test cases if needed
- [ ] Record test execution results
- [ ] Share findings with team

---

**Last Updated:** Phase 1 Complete  
**Next Update:** After Phase 2 implementation (Auth & Data Models)