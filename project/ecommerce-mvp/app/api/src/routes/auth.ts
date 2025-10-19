import { Elysia, t } from 'elysia';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post(
    '/signup',
    async ({ body }) => {
      // TODO: Implement user registration
      // - Hash password with bcrypt
      // - Create user in database
      // - Generate JWT token
      return {
        message: 'Signup endpoint - Not implemented',
        body,
      };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
      }),
    }
  )
  .post(
    '/signin',
    async ({ body }) => {
      // TODO: Implement user authentication
      // - Find user by email
      // - Verify password with bcrypt
      // - Generate JWT token
      return {
        message: 'Signin endpoint - Not implemented',
        body,
      };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
    }
  )
  .get('/me', async ({ headers }) => {
    // TODO: Implement get current user
    // - Verify JWT token from Authorization header
    // - Get user from database
    // - Return user data
    return {
      message: 'Get current user endpoint - Not implemented',
      headers: headers.authorization,
    };
  });
