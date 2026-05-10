import { DatabaseError, NotFoundError } from '@core/errors';
import type { AnyProfile } from '@core/types';
import type { ProfileService } from '@domain/ProfileService';

export interface McpToolDefinition {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
}

export class ProfileMcpAdapter {
	private readonly profileService: ProfileService;

	constructor(profileService: ProfileService) {
		this.profileService = profileService;
	}

	getProfileToolDefinition(): McpToolDefinition {
		return {
			name: 'get_student_profile',
			description: 'Use this tool to retrieve a profile by ID. The caller must provide the profile id as input.',
			inputSchema: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						description: 'Profile ID used to look up the requested profile.',
					},
				},
				required: ['id'],
				additionalProperties: false,
			},
		};
	}

	async executeGetProfileTool(id: string): Promise<string> {
		try {
			const profile: AnyProfile = await this.profileService.getProfileById(id);
			return JSON.stringify(profile);
		} catch (error: unknown) {
			if (error instanceof NotFoundError || error instanceof DatabaseError) {
				return `Failed to retrieve profile: ${error.message}`;
			}

			if (error instanceof Error) {
				return `Failed to retrieve profile: ${error.message}`;
			}

			return 'Failed to retrieve profile: An unexpected error occurred.';
		}
	}
}