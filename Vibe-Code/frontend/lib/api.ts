import axios, { AxiosError } from 'axios';
import { CreateProposalSoftwareData, ProposalSoftware, ProposalSoftwareResponse } from './types';
import { env } from './env';

const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access');
    } else if (error.response && error.response.status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    } else if (error.code === 'ECONNREFUSED') {
      // Handle connection errors
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    
    // Throw a user-friendly error message
    const errorData = error.response?.data as any;
    const message = errorData?.error ?? error.message ?? 'An unexpected error occurred';
    throw new Error(message);
  }
);

export const proposalSoftwareApi = {
  // Get all proposal software with pagination and filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<ProposalSoftwareResponse> => {
    const response = await api.get('/proposal-software', { params });
    return response.data;
  },

  // Get single proposal software by ID
  getById: async (id: string): Promise<ProposalSoftware> => {
    const response = await api.get(`/proposal-software/${id}`);
    return response.data;
  },

  // Create new proposal software
  create: async (data: CreateProposalSoftwareData): Promise<ProposalSoftware> => {
    const response = await api.post('/proposal-software', data);
    return response.data;
  },

  // Update proposal software
  update: async (id: string, data: Partial<CreateProposalSoftwareData>): Promise<ProposalSoftware> => {
    const response = await api.put(`/proposal-software/${id}`, data);
    return response.data;
  },

  // Delete proposal software
  delete: async (id: string): Promise<void> => {
    await api.delete(`/proposal-software/${id}`);
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/proposal-software/meta/categories');
    return response.data;
  },
};

export default api;
