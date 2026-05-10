import { PrismaClient } from '../../generated/prisma';
import type { AlumniProfile, AnyProfile, StudentProfile } from '@core/types';
import type { ProfileRepository } from '@domain/ProfileRepository';

export class PrismaProfileRepository implements ProfileRepository {
	private readonly prisma = new PrismaClient();

	async save(profile: AnyProfile): Promise<void> {
		await this.prisma.profile.upsert({
			where: { id: profile.id },
			create: profile,
			update: profile,
		});
	}

	async findById(id: string): Promise<AnyProfile | null> {
		const record = await this.prisma.profile.findUnique({
			where: { id },
		});

		if (!record) {
			return null;
		}

		switch (record.role) {
			case 'STUDENT':
				return {
					id: record.id,
					name: record.name,
					email: record.email,
					role: record.role,
					studentId: record.studentId ?? '',
					faculty: record.faculty ?? '',
				} satisfies StudentProfile;
			case 'ALUMNI':
				return {
					id: record.id,
					name: record.name,
					email: record.email,
					role: record.role,
					graduationYear: record.graduationYear ?? 0,
					currentCompany: record.currentCompany ?? undefined,
				} satisfies AlumniProfile;
			default:
				// ป้องกันเคสที่ Database มี Role 'ADMIN' หรือค่าอื่นๆ 
				// ที่เรายังไม่ได้ทำ Domain Model รองรับ
				throw new Error(`Unsupported profile role: ${record.role}`);
		}
	}

	async disconnect(): Promise<void> {
		await this.prisma.$disconnect();
	}
}
