import { DatabaseError, NotFoundError } from '@core/errors';
import { CreateProfileSchema } from '@core/schemas';
import type { AnyProfile, CreateProfileDTO, StudentProfile } from '@core/types';
import type { ProfileFactory, StudentExtraParams } from './ProfileFactory';
import type { ProfileRepository } from './ProfileRepository';

export class ProfileService {
	private readonly studentFactory: ProfileFactory<StudentProfile, StudentExtraParams>;
	private readonly profileRepository: ProfileRepository;

	constructor(
		studentFactory: ProfileFactory<StudentProfile, StudentExtraParams>,
		profileRepository: ProfileRepository,
	) {
		this.studentFactory = studentFactory;
		this.profileRepository = profileRepository;
	}

	async registerStudent(dto: CreateProfileDTO, params: StudentExtraParams): Promise<StudentProfile> {
		const validatedDto = CreateProfileSchema.parse(dto);
		const studentProfile = this.studentFactory.createProfile(validatedDto, params);
		try {
			await this.profileRepository.save(studentProfile);
		} catch (error: unknown) {
			if (error instanceof Error) {
				throw new DatabaseError(error.message);
			}

			throw new DatabaseError('เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล Profile');
		}
		return studentProfile;
	}

	async getProfileById(id: string): Promise<AnyProfile> {
		try {
			const profile = await this.profileRepository.findById(id);

			if (profile === null) {
				throw new NotFoundError('ไม่พบ Profile ID นี้');
			}

			return profile;
		} catch (error: unknown) {
			if (error instanceof NotFoundError) {
				throw error;
			}

			if (error instanceof Error) {
				throw new DatabaseError(error.message);
			}

			throw new DatabaseError('เกิดข้อผิดพลาดระหว่างดึงข้อมูล Profile');
		}
	}
}
