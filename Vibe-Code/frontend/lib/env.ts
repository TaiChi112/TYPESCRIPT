import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001/api'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format())
  throw new Error('Invalid environment variables')
}

export const env = parsedEnv.data
export type Env = z.infer<typeof envSchema>
