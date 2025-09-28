import type { Todo, CreateTodoRequest, UpdateTodoRequest } from './types';
import { prisma } from './lib/prisma';

export class TodoService {
  // GET - Get all todos
  static async getAllTodos(): Promise<Todo[]> {
    try {
      const todos = await prisma.todo.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      return todos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw new Error('Failed to fetch todos');
    }
  }

  // GET - Get todo by ID
  static async getTodoById(id: string): Promise<Todo | null> {
    try {
      const todo = await prisma.todo.findUnique({
        where: { id }
      });
      return todo;
    } catch (error) {
      console.error('Error fetching todo:', error);
      throw new Error('Failed to fetch todo');
    }
  }

  // POST - Create new todo
  static async createTodo(data: CreateTodoRequest): Promise<Todo> {
    try {
      const newTodo = await prisma.todo.create({
        data: {
          title: data.title,
          description: data.description,
        }
      });
      return newTodo;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw new Error('Failed to create todo');
    }
  }

  // PUT - Update todo
  static async updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo | null> {
    try {
      const existingTodo = await prisma.todo.findUnique({
        where: { id }
      });

      if (!existingTodo) {
        return null;
      }

      const updatedTodo = await prisma.todo.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          completed: data.completed,
        }
      });

      return updatedTodo;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw new Error('Failed to update todo');
    }
  }

  // DELETE - Delete todo
  static async deleteTodo(id: string): Promise<boolean> {
    try {
      const existingTodo = await prisma.todo.findUnique({
        where: { id }
      });

      if (!existingTodo) {
        return false;
      }

      await prisma.todo.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw new Error('Failed to delete todo');
    }
  }

  // PATCH - Toggle todo completion
  static async toggleTodo(id: string): Promise<Todo | null> {
    try {
      const existingTodo = await prisma.todo.findUnique({
        where: { id }
      });

      if (!existingTodo) {
        return null;
      }

      const updatedTodo = await prisma.todo.update({
        where: { id },
        data: {
          completed: !existingTodo.completed
        }
      });

      return updatedTodo;
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw new Error('Failed to toggle todo');
    }
  }

  // Utility - Seed initial data
  static async seedData(): Promise<void> {
    try {
      const count = await prisma.todo.count();
      
      if (count === 0) {
        await prisma.todo.createMany({
          data: [
            {
              title: 'Learn TypeScript',
              description: 'Study TypeScript fundamentals and advanced concepts',
              completed: false,
            },
            {
              title: 'Build Todo App',
              description: 'Create a full-stack todo application with CRUD operations',
              completed: false,
            },
            {
              title: 'Setup PostgreSQL',
              description: 'Configure PostgreSQL database with Prisma ORM',
              completed: true,
            }
          ]
        });
        console.log('✅ Initial data seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }
}