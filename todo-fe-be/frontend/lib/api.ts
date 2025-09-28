import axios from 'axios';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, ApiResponse } from '@/types/todo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class TodoAPI {
  // GET - Get all todos
  static async getAllTodos(): Promise<Todo[]> {
    try {
      const response = await api.get<ApiResponse<Todo[]>>('/api/todos');
      if (response.data.success && response.data.data) {
        return response.data.data.map(todo => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        }));
      }
      throw new Error(response.data.error || 'Failed to fetch todos');
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  // GET - Get todo by ID
  static async getTodoById(id: string): Promise<Todo> {
    try {
      const response = await api.get<ApiResponse<Todo>>(`/api/todos/${id}`);
      if (response.data.success && response.data.data) {
        const todo = response.data.data;
        return {
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        };
      }
      throw new Error(response.data.error || 'Failed to fetch todo');
    } catch (error) {
      console.error('Error fetching todo:', error);
      throw error;
    }
  }

  // POST - Create new todo
  static async createTodo(todoData: CreateTodoRequest): Promise<Todo> {
    try {
      const response = await api.post<ApiResponse<Todo>>('/api/todos', todoData);
      if (response.data.success && response.data.data) {
        const todo = response.data.data;
        return {
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        };
      }
      throw new Error(response.data.error || 'Failed to create todo');
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  // PUT - Update todo
  static async updateTodo(id: string, todoData: UpdateTodoRequest): Promise<Todo> {
    try {
      const response = await api.put<ApiResponse<Todo>>(`/api/todos/${id}`, todoData);
      if (response.data.success && response.data.data) {
        const todo = response.data.data;
        return {
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        };
      }
      throw new Error(response.data.error || 'Failed to update todo');
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  // DELETE - Delete todo
  static async deleteTodo(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/api/todos/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete todo');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  // PATCH - Toggle todo completion
  static async toggleTodo(id: string): Promise<Todo> {
    try {
      const response = await api.patch<ApiResponse<Todo>>(`/api/todos/${id}/toggle`);
      if (response.data.success && response.data.data) {
        const todo = response.data.data;
        return {
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        };
      }
      throw new Error(response.data.error || 'Failed to toggle todo');
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw error;
    }
  }
}