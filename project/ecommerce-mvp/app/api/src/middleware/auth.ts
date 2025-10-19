import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

// TODO: Implement JWT authentication middleware
export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-secret-key',
    })
  )
  .derive(async ({ headers, jwt }) => {
    // TODO: Extract and verify JWT token
    // - Get token from Authorization header
    // - Verify token signature
    // - Decode user data from token
    // - Attach user to context
    const token = headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return { user: null };
    }

    // TODO: Verify token and get user
    return { user: null };
  });

// TODO: Implement admin authorization middleware
export const adminOnly = new Elysia()
  .use(authMiddleware)
  .onBeforeHandle((ctx) => {
    // TODO: Check if user is admin
    // - Verify user exists
    // - Check user role is ADMIN
    // - Return 403 if not authorized
    const user = (ctx as any).user;
    const set = ctx.set;

    if (!user) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    if (user.role !== 'ADMIN') {
      set.status = 403;
      return { error: 'Forbidden' };
    }

    return;
  });
