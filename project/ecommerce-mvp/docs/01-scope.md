# 01 - Project Scope

## Product Name
MVP E-commerce Web App

## Vision Statement
Buyer can browse, add-to-cart, and checkout in test mode with basic authentication; Admin-lite can view orders and manage stock.

## In Scope (MVP)
- Product listing and detail pages
- Shopping cart (add, update quantity, remove)
- Test-mode checkout (Stripe or Omise sandbox)
- Basic authentication (email + password)
- Admin-lite dashboard (view orders, manage stock)
- PostgreSQL database with Prisma ORM
- Separate Next.js frontend and Elysia backend
- Docker Compose setup for WSL

## Out of Scope (MVP)
- Real payment processing
- Advanced user profiles or wishlists
- Product reviews or ratings
- Email notifications
- Multi-currency or internationalization
- Advanced inventory management
- Product categories/filtering (basic only)
- Mobile native apps

## Success Criteria
- User can browse products and complete test checkout
- Admin can view orders and update stock levels
- All services run via Docker Compose on WSL
- Basic authentication protects checkout and admin routes
- Data persists in PostgreSQL