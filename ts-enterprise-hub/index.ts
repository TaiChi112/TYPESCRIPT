import type { CreateProfileDTO } from '@core/types';
import { ProfileService } from '@domain/ProfileService';
import { ProfileMcpAdapter } from '@integration/McpToolAdapter';
import { StudentProfileFactory } from '@domain/ProfileFactory';
import { PrismaProfileRepository } from '@infra/PrismaProfileRepository';
import { logger } from '@infra/Logger';

async function bootstrap(): Promise<void> {
	const profileRepository = new PrismaProfileRepository();
	const studentProfileFactory = new StudentProfileFactory();
	const profileService = new ProfileService(studentProfileFactory, profileRepository);
	const profileMcpAdapter = new ProfileMcpAdapter(profileService);

	const newStudent: CreateProfileDTO = {
		name: 'John Doe',
		email: `john.doe.${Date.now()}@example.com`,
		role: 'STUDENT',
	};

	const registeredStudent = await profileService.registerStudent(newStudent, {
		faculty: 'Engineering',
		studentId: 'STD-2026-001',
	});

	logger.info({ profileId: registeredStudent.id }, 'AI Success Case');
	logger.info(
		{ response: await profileMcpAdapter.executeGetProfileTool(registeredStudent.id) },
		'Profile retrieval response',
	);

	logger.info({ profileId: 'fake-id-999' }, 'AI Failure Case');
	logger.info(
		{ response: await profileMcpAdapter.executeGetProfileTool('fake-id-999') },
		'Profile retrieval response',
	);

	await profileRepository.disconnect();
}

await bootstrap();