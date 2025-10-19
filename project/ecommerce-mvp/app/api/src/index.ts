import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Mock data
const mockProducts = [
  { id: '1', name: 'Product 1', price: 100, stock: 10, description: 'Description 1', imageUrl: '' },
  { id: '2', name: 'Product 2', price: 200, stock: 5, description: 'Description 2', imageUrl: '' },
  { id: '3', name: 'Product 3', price: 300, stock: 0, description: 'Description 3', imageUrl: '' },
];

const app = new Elysia()
  .use(
    cors({
      origin: CORS_ORIGIN,
      credentials: true,
    })
  )
  .get('/', () => ({ message: 'E-Commerce API v1.0' }))
  .get('/health', () => ({
    ok: true,
    service: 'api',
    timestamp: new Date().toISOString(),
  }))
  .get('/products', () => ({
    ok: true,
    data: mockProducts,
  }))
  .get('/products/:id', ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id);
    if (!product) {
      return {
        ok: false,
        error: 'Product not found',
      };
    }
    return {
      ok: true,
      data: product,
    };
  })
  .post('/auth/sign-in', ({ body }) => ({
    ok: true,
    message: 'Sign in endpoint (placeholder)',
    body,
  }))
  .post('/auth/sign-up', ({ body }) => ({
    ok: true,
    message: 'Sign up endpoint (placeholder)',
    body,
  }))
  .post('/auth/sign-out', () => ({
    ok: true,
    message: 'Sign out endpoint (placeholder)',
  }))
  .post('/cart/checkout', ({ body }) => ({
    ok: true,
    orderId: 'test-123',
    message: 'Mock checkout successful',
    body,
  }))
  .listen({
    port: PORT,
    hostname: '0.0.0.0',
  });

console.log(`🚀 API server running on http://0.0.0.0:${PORT}`);
console.log(`📊 Health check: http://localhost:${PORT}/health`);

export type App = typeof app;
