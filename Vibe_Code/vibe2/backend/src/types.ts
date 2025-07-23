// Type definitions for the API

export interface CreateUserRequest {
  username: string;
  email: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  database: "connected" | "disconnected";
}
