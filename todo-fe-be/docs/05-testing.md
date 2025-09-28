# Phase 5: Testing

## 📋 Overview
การทดสอบระบบ Todo List Application เพื่อให้มั่นใจว่าทุก component ทำงานได้ถูกต้องและมีคุณภาพตามที่กำหนด

---

## 🧪 Testing Strategy

### Testing Pyramid
```
        /\
       /  \
      / E2E \ ← Few (Integration & User flows)
     /______\
    /        \
   /   API    \ ← Some (API endpoints & business logic)  
  /____________\
 /              \
/   Unit Tests   \ ← Many (Individual functions & components)
\________________/
```

---

## 🔧 Unit Testing

### Backend Unit Tests

#### Service Layer Testing
```typescript
// tests/service.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { TodoService } from '../service';
import { prisma } from '../lib/prisma';

describe('TodoService', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.todo.deleteMany();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.todo.deleteMany();
  });

  describe('createTodo', () => {
    it('should create a new todo with valid data', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description'
      };

      const result = await TodoService.createTodo(todoData);

      expect(result).toMatchObject({
        title: 'Test Todo',
        description: 'Test Description',
        completed: false
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should create todo without description', async () => {
      const todoData = { title: 'Test Todo' };
      const result = await TodoService.createTodo(todoData);

      expect(result.description).toBeNull();
      expect(result.title).toBe('Test Todo');
    });
  });

  describe('getAllTodos', () => {
    it('should return empty array when no todos exist', async () => {
      const result = await TodoService.getAllTodos();
      expect(result).toEqual([]);
    });

    it('should return todos ordered by creation date (newest first)', async () => {
      await TodoService.createTodo({ title: 'First Todo' });
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await TodoService.createTodo({ title: 'Second Todo' });

      const result = await TodoService.getAllTodos();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Second Todo');
      expect(result[1].title).toBe('First Todo');
    });
  });

  describe('updateTodo', () => {
    it('should update existing todo', async () => {
      const created = await TodoService.createTodo({ title: 'Original Title' });
      
      const updated = await TodoService.updateTodo(created.id, {
        title: 'Updated Title',
        completed: true
      });

      expect(updated).toMatchObject({
        id: created.id,
        title: 'Updated Title',
        completed: true
      });
      expect(updated!.updatedAt.getTime()).toBeGreaterThan(created.createdAt.getTime());
    });

    it('should return null for non-existent todo', async () => {
      const result = await TodoService.updateTodo('non-existent-id', { title: 'New Title' });
      expect(result).toBeNull();
    });
  });
});
```

### Frontend Unit Tests

#### Component Testing
```typescript
// __tests__/components/TodoItem.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoItem from '@/components/TodoItem';
import type { Todo } from '@/types/todo';

const mockTodo: Todo = {
  id: '1',
  title: 'Test Todo',
  description: 'Test Description',
  completed: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01')
};

const mockHandlers = {
  onToggle: jest.fn(),
  onUpdate: jest.fn(),
  onDelete: jest.fn()
};

describe('TodoItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders todo information correctly', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('shows completed state correctly', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} {...mockHandlers} />);

    const checkbox = screen.getByRole('checkbox');
    const title = screen.getByText('Test Todo');

    expect(checkbox).toBeChecked();
    expect(title).toHaveClass('line-through');
  });

  it('calls onToggle when checkbox is clicked', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockHandlers.onToggle).toHaveBeenCalledWith('1');
  });

  it('enters edit mode when edit button is clicked', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    const editButton = screen.getByTitle('Edit todo');
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('calls onUpdate when save button is clicked', async () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    // Enter edit mode
    fireEvent.click(screen.getByTitle('Edit todo'));

    // Modify title
    const titleInput = screen.getByDisplayValue('Test Todo');
    fireEvent.change(titleInput, { target: { value: 'Updated Todo' } });

    // Save changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', {
        title: 'Updated Todo',
        description: 'Test Description'
      });
    });
  });
});
```

---

## 🌐 API Testing

### Manual API Testing
```bash
# Test API endpoints manually

# 1. Health check
curl http://localhost:3001/

# 2. Get all todos
curl http://localhost:3001/api/todos

# 3. Create new todo
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"API Test Todo","description":"Testing via curl"}'

# 4. Update todo (replace {id} with actual ID)
curl -X PUT http://localhost:3001/api/todos/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","completed":true}'

# 5. Toggle todo completion
curl -X PATCH http://localhost:3001/api/todos/{id}/toggle

# 6. Delete todo
curl -X DELETE http://localhost:3001/api/todos/{id}
```

### Automated API Testing
```typescript
// tests/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

const API_BASE = 'http://localhost:3001';

describe('Todo API', () => {
  let createdTodoId: string;

  it('should return server status', async () => {
    const response = await fetch(`${API_BASE}/`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Todo API Server is running!');
  });

  it('should create a new todo', async () => {
    const todoData = {
      title: 'API Test Todo',
      description: 'Created via API test'
    };

    const response = await fetch(`${API_BASE}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todoData)
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('API Test Todo');

    createdTodoId = data.data.id;
  });

  it('should get all todos including the created one', async () => {
    const response = await fetch(`${API_BASE}/api/todos`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);

    const createdTodo = data.data.find((todo: any) => todo.id === createdTodoId);
    expect(createdTodo).toBeDefined();
  });

  it('should update the todo', async () => {
    const updateData = {
      title: 'Updated API Test Todo',
      completed: true
    };

    const response = await fetch(`${API_BASE}/api/todos/${createdTodoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('Updated API Test Todo');
    expect(data.data.completed).toBe(true);
  });

  it('should delete the todo', async () => {
    const response = await fetch(`${API_BASE}/api/todos/${createdTodoId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

---

## 🔄 Integration Testing

### Database Integration Tests
```typescript
// tests/database.integration.test.ts
import { describe, it, expect, beforeEach } from 'bun:test';
import { prisma } from '../lib/prisma';

describe('Database Integration', () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  it('should persist todo data correctly', async () => {
    // Create todo via Prisma
    const created = await prisma.todo.create({
      data: {
        title: 'Integration Test Todo',
        description: 'Testing database persistence'
      }
    });

    // Verify data was saved
    expect(created.id).toBeDefined();
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);

    // Retrieve and verify
    const retrieved = await prisma.todo.findUnique({
      where: { id: created.id }
    });

    expect(retrieved).toMatchObject({
      title: 'Integration Test Todo',
      description: 'Testing database persistence',
      completed: false
    });
  });

  it('should handle concurrent operations correctly', async () => {
    // Create multiple todos concurrently
    const promises = Array.from({ length: 5 }, (_, i) =>
      prisma.todo.create({
        data: { title: `Concurrent Todo ${i + 1}` }
      })
    );

    const results = await Promise.all(promises);

    expect(results).toHaveLength(5);
    results.forEach((todo, index) => {
      expect(todo.title).toBe(`Concurrent Todo ${index + 1}`);
    });

    // Verify all were saved
    const count = await prisma.todo.count();
    expect(count).toBe(5);
  });
});
```

---

## 🖥️ End-to-End Testing

### E2E Test Setup
```typescript
// e2e/todo.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Todo Application E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display todo list page', async ({ page }) => {
    await expect(page).toHaveTitle(/Todo List/);
    await expect(page.getByText('Todo List')).toBeVisible();
    await expect(page.getByText('Add New Todo')).toBeVisible();
  });

  test('should create a new todo', async ({ page }) => {
    // Click add todo button
    await page.getByText('Add New Todo').click();

    // Fill form
    await page.getByPlaceholder('Enter todo title...').fill('E2E Test Todo');
    await page.getByPlaceholder('Enter todo description...').fill('Created by E2E test');

    // Submit form
    await page.getByText('Add Todo').click();

    // Verify todo appears in list
    await expect(page.getByText('E2E Test Todo')).toBeVisible();
    await expect(page.getByText('Created by E2E test')).toBeVisible();
  });

  test('should mark todo as completed', async ({ page }) => {
    // Create a todo first
    await page.getByText('Add New Todo').click();
    await page.getByPlaceholder('Enter todo title...').fill('Todo to Complete');
    await page.getByText('Add Todo').click();

    // Find and click checkbox
    const todoItem = page.getByText('Todo to Complete').locator('..');
    const checkbox = todoItem.getByRole('checkbox');
    await checkbox.click();

    // Verify completed state
    await expect(checkbox).toBeChecked();
    await expect(page.getByText('✅ Completed')).toBeVisible();
  });

  test('should edit todo details', async ({ page }) => {
    // Create a todo first
    await page.getByText('Add New Todo').click();
    await page.getByPlaceholder('Enter todo title...').fill('Todo to Edit');
    await page.getByText('Add Todo').click();

    // Click edit button
    const todoItem = page.getByText('Todo to Edit').locator('..');
    await todoItem.getByTitle('Edit todo').click();

    // Edit title
    const titleInput = todoItem.getByDisplayValue('Todo to Edit');
    await titleInput.fill('Edited Todo Title');

    // Save changes
    await todoItem.getByText('Save').click();

    // Verify changes
    await expect(page.getByText('Edited Todo Title')).toBeVisible();
  });

  test('should delete todo', async ({ page }) => {
    // Create a todo first
    await page.getByText('Add New Todo').click();
    await page.getByPlaceholder('Enter todo title...').fill('Todo to Delete');
    await page.getByText('Add Todo').click();

    // Click delete button
    const todoItem = page.getByText('Todo to Delete').locator('..');
    await todoItem.getByTitle('Delete todo').click();

    // Verify todo is removed
    await expect(page.getByText('Todo to Delete')).not.toBeVisible();
  });

  test('should filter todos by status', async ({ page }) => {
    // Create completed and pending todos
    await page.getByText('Add New Todo').click();
    await page.getByPlaceholder('Enter todo title...').fill('Completed Task');
    await page.getByText('Add Todo').click();

    await page.getByText('Add New Todo').click();
    await page.getByPlaceholder('Enter todo title...').fill('Pending Task');
    await page.getByText('Add Todo').click();

    // Mark first as completed
    const completedTodo = page.getByText('Completed Task').locator('..');
    await completedTodo.getByRole('checkbox').click();

    // Test filters
    await page.getByText('Pending').click();
    await expect(page.getByText('Pending Task')).toBeVisible();
    await expect(page.getByText('Completed Task')).not.toBeVisible();

    await page.getByText('Completed').click();
    await expect(page.getByText('Completed Task')).toBeVisible();
    await expect(page.getByText('Pending Task')).not.toBeVisible();

    await page.getByText('All').click();
    await expect(page.getByText('Completed Task')).toBeVisible();
    await expect(page.getByText('Pending Task')).toBeVisible();
  });
});
```

---

## 🚀 Performance Testing

### Load Testing
```javascript
// performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
  },
};

const BASE_URL = 'http://localhost:3001';

export default function() {
  // Test GET /api/todos
  let response = http.get(`${BASE_URL}/api/todos`);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test POST /api/todos
  let todoData = {
    title: `Load Test Todo ${Math.random()}`,
    description: 'Created by load test'
  };

  response = http.post(`${BASE_URL}/api/todos`, JSON.stringify(todoData), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    'create todo status is 200': (r) => r.status === 200,
    'create todo response time < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
```

---

## 📊 Test Coverage

### Coverage Goals
```yaml
Unit Tests:
  Target Coverage: > 80%
  Critical Functions: > 90%
  
Integration Tests:
  API Endpoints: 100%
  Database Operations: 100%
  
E2E Tests:
  User Flows: 100%
  Critical Paths: 100%
```

### Running Coverage Reports
```bash
# Backend coverage
cd backend
bun test --coverage

# Frontend coverage  
cd frontend
npm test -- --coverage

# E2E test reports
npx playwright test --reporter=html
```

---

## ✅ Test Checklist

### Unit Testing
- [ ] Service layer methods tested
- [ ] React components tested
- [ ] Utility functions tested
- [ ] Edge cases covered
- [ ] Error scenarios tested

### Integration Testing
- [ ] API endpoints tested
- [ ] Database operations tested
- [ ] Frontend-backend integration tested
- [ ] CORS functionality tested

### E2E Testing
- [ ] Complete user workflows tested
- [ ] Cross-browser compatibility tested
- [ ] Responsive design tested
- [ ] Error handling tested

### Performance Testing
- [ ] Load testing completed
- [ ] Response time requirements met
- [ ] Resource usage monitored
- [ ] Bottlenecks identified

---

## 🔗 Related Documents
- [Previous Phase: Implementation](./04-implementation.md)
- [Next Phase: Deployment](./06-deployment.md)
- [Project Overview](./README.md)