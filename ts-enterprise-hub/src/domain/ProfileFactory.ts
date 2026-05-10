import { randomUUID } from 'node:crypto';
import type { AlumniProfile, AnyProfile, CreateProfileDTO, StudentProfile } from '@core/types';

// 1. ใช้ Generics เพื่อให้ Interface ยืดหยุ่นและ Type-Safe 100%
export interface ProfileFactory<TProfile extends AnyProfile, TExtraParams> {
	createProfile(profile: CreateProfileDTO, extra: TExtraParams): TProfile;
}

// 2. ห่อ Parameter เป็น Object เพื่อให้ขยายได้ในอนาคต (Extensibility)
export type StudentExtraParams = { faculty: string; studentId: string };

export class StudentProfileFactory implements ProfileFactory<StudentProfile, StudentExtraParams> {
	createProfile(profile: CreateProfileDTO, extra: StudentExtraParams): StudentProfile {
		return {
			id: randomUUID(),
			...profile,
			role: 'STUDENT',
			faculty: extra.faculty,
			studentId: extra.studentId, // เพิ่มฟิลด์ที่ขาดไป
		};
	}
}

export type AlumniExtraParams = { graduationYear: number; currentCompany?: string };

export class AlumniProfileFactory implements ProfileFactory<AlumniProfile, AlumniExtraParams> {
	createProfile(profile: CreateProfileDTO, extra: AlumniExtraParams): AlumniProfile {
		return {
			id: randomUUID(),
			...profile,
			role: 'ALUMNI',
			graduationYear: extra.graduationYear,
			currentCompany: extra.currentCompany,
		};
	}
}