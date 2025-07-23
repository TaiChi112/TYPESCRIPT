import { z } from 'zod';

// User related types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
