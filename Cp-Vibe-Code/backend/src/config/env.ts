import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  PORT: z.string().transform(Number).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnv(): Environment {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
}

export const env = validateEnv();
