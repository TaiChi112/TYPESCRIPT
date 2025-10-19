# E-Commerce MVP - Frontend

Next.js 14 TypeScript frontend application for the e-commerce MVP.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── auth/            # Authentication pages (signin, signup)
│   ├── products/        # Product pages (catalog, detail)
│   ├── cart/            # Shopping cart page
│   ├── checkout/        # Checkout page
│   ├── orders/          # Order confirmation
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Landing page
│   └── globals.css      # Global styles
├── components/          # Reusable React components
│   ├── Header.tsx       # Navigation header
│   ├── ProductCard.tsx  # Product display card
│   └── ProtectedRoute.tsx # Route guard for auth
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   └── CartContext.tsx  # Shopping cart state
├── lib/                 # Utility libraries
│   └── api.ts           # API client
└── types/               # TypeScript type definitions
    └── index.ts         # Shared interfaces
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Type Check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Features

- **App Router**: Next.js 14 App Router architecture
- **TypeScript**: Full type safety
- **Authentication**: JWT-based auth with React Context
- **Shopping Cart**: Persistent cart in localStorage
- **Checkout**: Mock payment integration (test mode)
- **Responsive Design**: Mobile-friendly layouts
- **Dark Theme**: Modern dark UI

## Pages

- `/` - Landing page with hero and features
- `/products` - Product catalog grid
- `/products/[id]` - Product detail with add-to-cart
- `/cart` - Shopping cart with quantity controls
- `/checkout` - Protected checkout with payment form
- `/orders/confirmation` - Order success page
- `/auth/signin` - Sign-in form
- `/auth/signup` - Sign-up form

## API Integration

The frontend connects to the backend API at `NEXT_PUBLIC_API_URL`. All API calls are handled by the `api` client in `src/lib/api.ts`.

### Authentication

- JWT token stored in localStorage
- Auto-injected in API requests via Authorization header
- Protected routes redirect to signin if not authenticated

### Cart Management

- Cart items stored in localStorage
- Persists across browser sessions
- Synced with backend on checkout

## Styling

- CSS-in-JS with inline styles
- Dark theme with custom color palette
- No UI framework dependencies (vanilla CSS)
- Responsive grid layouts

## Next Steps

1. Connect to backend API (currently pointing to localhost:4000)
2. Implement Stripe.js for real payment processing
3. Add product image uploads
4. Implement admin panel
5. Add order history page
6. Enhance error handling and loading states
