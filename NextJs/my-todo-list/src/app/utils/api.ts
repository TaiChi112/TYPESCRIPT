// src/app/utils/api.ts

export async function fetchTodos() {
  const res = await fetch('/api/todos', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

export async function createTodo(todo: { text: string; completed: boolean }) {
  const res = await fetch('/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todo),
  });
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

export async function updateTodo(todo: { id: number; text: string; completed: boolean }) {
  const res = await fetch('/api/todos', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todo),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function deleteTodo(id: number) {
  const res = await fetch('/api/todos', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to delete todo');
}
