import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').transform(Number).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
