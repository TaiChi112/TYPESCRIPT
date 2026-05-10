import { describe, expect, test } from 'bun:test';
import { NotFoundError } from '../../src/core/errors';
import type { CreateProfileDTO } from '../../src/core/types';
import { StudentProfileFactory } from '../../src/domain/ProfileFactory';
import { ProfileService } from '../../src/domain/ProfileService';
import { MockProfileRepository } from '../../src/infrastructure/MockProfileRepository';

describe('ProfileService', () => {
	test('registerStudent saves and returns the created student profile', async () => {
		const profileRepository = new MockProfileRepository();
		const profileService = new ProfileService(new StudentProfileFactory(), profileRepository);

		const dto: CreateProfileDTO = {
			name: 'Somchai Srisuk',
			email: 'somchai.test@example.com',
			role: 'STUDENT',
		};

		const createdProfile = await profileService.registerStudent(dto, {
			faculty: 'Engineering',
			studentId: 'STD-2026-001',
		});

		expect(createdProfile.name).toBe(dto.name);
		expect(createdProfile.email).toBe(dto.email);
		expect(createdProfile.role).toBe('STUDENT');
		expect(createdProfile.faculty).toBe('Engineering');
		expect(createdProfile.studentId).toBe('STD-2026-001');

		const storedProfile = await profileService.getProfileById(createdProfile.id);
		expect(storedProfile).toEqual(createdProfile);
	});

	test('getProfileById returns the saved profile', async () => {
		const profileRepository = new MockProfileRepository();
		const profileService = new ProfileService(new StudentProfileFactory(), profileRepository);

		const dto: CreateProfileDTO = {
			name: 'Nattapon Maneerat',
			email: 'nattapon.test@example.com',
			role: 'STUDENT',
		};

		const createdProfile = await profileService.registerStudent(dto, {
			faculty: 'Science',
			studentId: 'STD-2026-002',
		});

		const foundProfile = await profileService.getProfileById(createdProfile.id);
		expect(foundProfile).toEqual(createdProfile);
	});

	test('getProfileById throws NotFoundError when profile does not exist', async () => {
		const profileRepository = new MockProfileRepository();
		const profileService = new ProfileService(new StudentProfileFactory(), profileRepository);
		const missingProfilePromise = profileService.getProfileById('missing-id');

		await expect(missingProfilePromise).rejects.toBeInstanceOf(NotFoundError);
		await expect(missingProfilePromise).rejects.toHaveProperty(
			'message',
			'ไม่พบ Profile ID นี้',
		);
	});
});
