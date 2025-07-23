import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.timeout = 10000; // 10 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  error: string;
  message: string;
  status?: number;
}

// Custom error class for API errors
export class TodoServiceError extends Error {
  public status: number;
  public apiError: ApiError;

  constructor(status: number, apiError: ApiError) {
    super(apiError.message);
    this.status = status;
    this.apiError = apiError;
    this.name = 'TodoServiceError';
  }
}

// Helper function to handle axios errors
// Helper function to map status codes to ApiError
const mapStatusToApiError = (status: number): ApiError => {
  switch (status) {
    case 400:
      return { error: 'Bad Request', message: 'Invalid request data', status };
    case 401:
      return { error: 'Unauthorized', message: 'Authentication required', status };
    case 403:
      return { error: 'Forbidden', message: 'Access denied', status };
    case 404:
      return { error: 'Not Found', message: 'The requested resource was not found', status };
    case 409:
      return { error: 'Conflict', message: 'Resource conflict occurred', status };
    case 422:
      return { error: 'Validation Error', message: 'Invalid input data', status };
    case 429:
      return { error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.', status };
    case 500:
      return { error: 'Internal Server Error', message: 'An unexpected server error occurred', status };
    case 502:
      return { error: 'Bad Gateway', message: 'Server is temporarily unavailable', status };
    case 503:
      return { error: 'Service Unavailable', message: 'Service is temporarily unavailable', status };
    case 504:
      return { error: 'Gateway Timeout', message: 'Request timed out. Please try again.', status };
    default:
      return { error: 'Unknown Error', message: `An unexpected error occurred (${status})`, status };
  }
};

// Helper to extract ApiError from Axios response
const extractApiErrorFromResponse = (status: number, responseData: any): ApiError => {
  if (responseData?.error && responseData?.message) {
    return {
      error: responseData.error,
      message: responseData.message,
      status
    };
  }
  // Fallback for non-standard error responses
  return mapStatusToApiError(status);
};

const handleApiError = (error: any): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // Server responded with error status
      const status = axiosError.response.status;
      const responseData = axiosError.response.data as any;

      const apiError = extractApiErrorFromResponse(status, responseData);

      throw new TodoServiceError(status, apiError);
    }

    if (axiosError.request) {
      // Network error - no response received
      if (axiosError.code === 'ECONNABORTED') {
        throw new TodoServiceError(408, {
          error: 'Request Timeout',
          message: 'Request took too long to complete. Please check your connection and try again.',
          status: 408
        });
      }
      if (axiosError.code === 'ERR_NETWORK') {
        throw new TodoServiceError(0, {
          error: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          status: 0
        });
      }
      throw new TodoServiceError(0, {
        error: 'Connection Error',
        message: 'Unable to reach the server. Please try again later.',
        status: 0
      });
    }
  }

  // Unknown error
  throw new TodoServiceError(0, {
    error: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
    status: 0
  });
};

export async function getTodos(): Promise<Todo[]> {
  try {
    const res = await axios.get(`${API_URL}/todos`);
    
    // Validate response data structure
    if (!Array.isArray(res.data)) {
      throw new Error('Invalid response format: expected array of todos');
    }
    
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
  // This line is unreachable, but ensures a return for type safety
  return [];
}

export async function getTodo(id: number): Promise<Todo> {
  try {
    if (!id || id <= 0) {
      throw new TodoServiceError(400, {
        error: 'Invalid Input',
        message: 'Todo ID must be a positive number',
        status: 400
      });
    }
    
    const res = await axios.get(`${API_URL}/todos/${id}`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
  // This line is unreachable, but ensures a return for type safety
  return {} as Todo;
}

export async function createTodo(data: { title: string; description?: string }): Promise<Todo> {
  try {
    // Client-side validation
    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
      throw new TodoServiceError(400, {
        error: 'Validation Error',
        message: 'Title is required and must be a non-empty string',
        status: 400
      });
    }
    
    if (data.title.length > 255) {
      throw new TodoServiceError(400, {
        error: 'Validation Error',
        message: 'Title must be less than 255 characters',
        status: 400
      });
    }
    
    if (data.description && data.description.length > 1000) {
      throw new TodoServiceError(400, {
        error: 'Validation Error',
        message: 'Description must be less than 1000 characters',
        status: 400
      });
    }
    
    const payload = {
      title: data.title.trim(),
      description: data.description?.trim() ?? undefined
    };
    
    const res = await axios.post(`${API_URL}/todos`, payload);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
  // This line is unreachable, but ensures a return for type safety
  return {} as Todo;
}

export async function updateTodo(id: number, data: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Todo> {
  try {
    if (!id || id <= 0) {
      throw new TodoServiceError(400, {
        error: 'Invalid Input',
        message: 'Todo ID must be a positive number',
        status: 400
      });
    }
    
    // Client-side validation for update data
    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.trim() === '') {
        throw new TodoServiceError(400, {
          error: 'Validation Error',
          message: 'Title must be a non-empty string',
          status: 400
        });
      }
      if (data.title.length > 255) {
        throw new TodoServiceError(400, {
          error: 'Validation Error',
          message: 'Title must be less than 255 characters',
          status: 400
        });
      }
    }
    
    if (data.description !== undefined && data.description !== null && data.description.length > 1000) {
      throw new TodoServiceError(400, {
        error: 'Validation Error',
        message: 'Description must be less than 1000 characters',
        status: 400
      });
    }
    
    // Clean up the data before sending
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title.trim();
    if (data.description !== undefined) payload.description = data.description?.trim() || null;
    if (data.completed !== undefined) payload.completed = Boolean(data.completed);
    
    const res = await axios.put(`${API_URL}/todos/${id}`, payload);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
  // This line is unreachable, but ensures a return for type safety
  return {} as Todo;
}

export async function deleteTodo(id: number): Promise<void> {
  try {
    if (!id || id <= 0) {
      throw new TodoServiceError(400, {
        error: 'Invalid Input',
        message: 'Todo ID must be a positive number',
        status: 400
      });
    }
    
    await axios.delete(`${API_URL}/todos/${id}`);
  } catch (error) {
    handleApiError(error);
  }
}

// Utility function to check if error is a TodoServiceError
export const isTodoServiceError = (error: any): error is TodoServiceError => {
  return error instanceof TodoServiceError;
};

// Utility function to get user-friendly error message
export const getErrorMessage = (error: any): string => {
  if (isTodoServiceError(error)) {
    return error.apiError.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};
