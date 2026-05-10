import { z } from 'zod';

export const CreateProfileSchema = z.object({
	name: z.string().min(2),
	email: z.string().email?(),
	role: z.enum(['STUDENT', 'ALUMNI', 'ADMIN']),
});