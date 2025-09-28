import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { TodoService } from './service';
import type { CreateTodoRequest, UpdateTodoRequest } from './types';

const app = new Elysia()
  .use(cors())
  .get('/', () => ({ message: 'Todo API Server is running!' }))
  
  // GET /api/todos - Get all todos
  .get('/api/todos', async () => {
    try {
      const todos = await TodoService.getAllTodos();
      return { success: true, data: todos };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Failed to fetch todos' };
    }
  })
  
  // GET /api/todos/:id - Get todo by ID
  .get('/api/todos/:id', async ({ params: { id } }) => {
    try {
      const todo = await TodoService.getTodoById(id);
      if (!todo) {
        return { success: false, error: 'Todo not found' };
      }
      return { success: true, data: todo };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Failed to fetch todo' };
    }
  })
  
  // POST /api/todos - Create new todo
  .post('/api/todos', async ({ body }) => {
    try {
      const todoData = body as CreateTodoRequest;
      
      if (!todoData.title || todoData.title.trim() === '') {
        return { success: false, error: 'Title is required' };
      }
      
      const newTodo = await TodoService.createTodo({
        title: todoData.title.trim(),
        description: todoData.description?.trim()
      });
      
      return { success: true, data: newTodo };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Failed to create todo' };
    }
  })
  
  // PUT /api/todos/:id - Update todo
  .put('/api/todos/:id', async ({ params: { id }, body }) => {
    try {
      const updateData = body as UpdateTodoRequest;
      
      const updatedTodo = await TodoService.updateTodo(id, updateData);
      if (!updatedTodo) {
        return { success: false, error: 'Todo not found' };
      }
      
      return { success: true, data: updatedTodo };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Failed to update todo' };
    }
  })
  
  // DELETE /api/todos/:id - Delete todo
  .delete('/api/todos/:id', async ({ params: { id } }) => {
    try {
      const deleted = await TodoService.deleteTodo(id);
      if (!deleted) {
        return { success: false, error: 'Todo not found' };
      }
      
      return { success: true, message: 'Todo deleted successfully' };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Failed to delete todo' };
    }
  })
  
  // PATCH /api/todos/:id/toggle - Toggle todo completion
  .patch('/api/todos/:id/toggle', async ({ params: { id } }) => {
    try {
      const toggledTodo = await TodoService.toggleTodo(id);
      if (!toggledTodo) {
        return { success: false, error: 'Todo not found' };
      }
      
      return { success: true, data: toggledTodo };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Failed to toggle todo' };
    }
  })
  
  .listen(3001);

// Initialize database and seed data
async function initializeDatabase() {
  try {
    await TodoService.seedData();
    console.log('🚀 Server is running at http://localhost:3001');
    console.log('📊 Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

initializeDatabase();