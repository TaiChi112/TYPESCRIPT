import { z } from 'zod';
import { CreateProfileSchema } from './schemas';

export type UserRole = 'STUDENT' | 'ALUMNI' | 'ADMIN';

export interface BaseProfile {
	id: string;
	name: string;
	email: string;
	role: UserRole;
}

export type CreateProfileDTO = z.infer<typeof CreateProfileSchema>;

export type UpdateProfileDTO = Partial<Omit<BaseProfile, 'id'>>;

export interface StudentProfile extends BaseProfile {
	role: 'STUDENT';
	studentId: string;
	faculty: string;
}

export interface AlumniProfile extends BaseProfile {
	role: 'ALUMNI';
	graduationYear: number;
	currentCompany?: string;
}

export type AnyProfile = StudentProfile | AlumniProfile;

export function getProfileSummary(profile: AnyProfile): string {
	switch (profile.role) {
		case 'STUDENT':
			return `${profile.name} - ${profile.faculty}`;
		case 'ALUMNI':
			return `${profile.name} - ${profile.graduationYear}`;
		default: {
			// หากมีการเพิ่ม Role ใหม่แต่ลืมมาอัปเดต Switch case นี้ 
			// TypeScript จะแจ้ง Error ตรงบรรทัดนี้ทันที!
			const _exhaustiveCheck: never = profile;
			return _exhaustiveCheck;
		}
	}
}

export type ApiResponse<T> = {
	status: number;
	message: string;
	data: T;
};
