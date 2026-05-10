import { z } from 'zod';

const EnvSchema = z.object({
	DATABASE_URL: z.string().min(1),
	PORT: z.coerce.number().int().positive(),
});

export const Env = EnvSchema.parse(process.env);

export type Env = z.infer<typeof EnvSchema>;