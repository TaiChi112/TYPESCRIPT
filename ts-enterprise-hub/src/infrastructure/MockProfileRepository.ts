import type { AnyProfile } from '@core/types';
import type { ProfileRepository } from '@domain/ProfileRepository';

const MOCK_DATABASE_DELAY_MS = 500;

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export class MockProfileRepository implements ProfileRepository {
	private readonly profiles = new Map<string, AnyProfile>();

	async save(profile: AnyProfile): Promise<void> {
		await delay(MOCK_DATABASE_DELAY_MS);
		this.profiles.set(profile.id, profile);
	}

	async findById(id: string): Promise<AnyProfile | null> {
		await delay(MOCK_DATABASE_DELAY_MS);
		return this.profiles.get(id) ?? null;
	}

	async disconnect(): Promise<void> {
		return;
	}
}