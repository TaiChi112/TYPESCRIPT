import { Elysia } from 'elysia';
import { z, ZodError } from 'zod';
import { Env } from '@core/config';
import { AppError } from '@core/errors';
import { CreateProfileSchema } from '@core/schemas';
import { ProfileService } from '@domain/ProfileService';
import { StudentProfileFactory } from '@domain/ProfileFactory';
import { logger } from '@infra/Logger';
import { PrismaProfileRepository } from '@infra/PrismaProfileRepository';

const CreateStudentProfileRequestSchema = CreateProfileSchema.extend({
	role: z.literal('STUDENT'),
	faculty: z.string().min(1),
	studentId: z.string().min(1),
});

function createProfileService(): ProfileService {
	const profileRepository = new PrismaProfileRepository();
	return new ProfileService(new StudentProfileFactory(), profileRepository);
}

export function createProfileApiServer(profileService = createProfileService()): Elysia {
	return new Elysia()
                .onRequest(({ request }) => {
			logger.info({ method: request.method, url: request.url }, 'Incoming request');
		})
		.onError(({ error, set }) => {
			if (error instanceof ZodError) {
				set.status = 400;
				return {
					message: 'Validation Failed',
					errors: error.issues,
				};
			}

			if (error instanceof AppError) {
				set.status = error.statusCode;
				return {
					message: error.message,
				};
			}

			set.status = 500;
			return {
				message: 'Unexpected server error',
			};
		})
		.post(
			'/api/profiles',
			async ({ body, set }) => {
				const parsedBody = CreateStudentProfileRequestSchema.parse(body);

				const { faculty, studentId, ...profileDto } = parsedBody;
				const createdProfile = await profileService.registerStudent(profileDto, {
					faculty,
					studentId,
				});

				set.status = 201;
				return createdProfile;
			}
		)
		.get('/api/profiles/:id', async ({ params }) => profileService.getProfileById(params.id));
}

if (import.meta.main) {
	const app = createProfileApiServer();
	const port = Env.PORT;

	app.listen(port);
	logger.info({ port }, 'Profile API server is running');
}
