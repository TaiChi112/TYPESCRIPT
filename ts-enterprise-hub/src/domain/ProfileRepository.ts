import type { AnyProfile } from '@core/types';

export interface ProfileRepository {
	save(profile: AnyProfile): Promise<void>;
	findById(id: string): Promise<AnyProfile | null>;
	disconnect(): Promise<void>;
}