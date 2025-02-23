// src/app/api/todos/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Todo } from '../../models/Todo';

// Mock data for demonstration purposes
let todos: Todo[] = [
  { id: 1, text: 'Learn TypeScript', completed: false },
  { id: 2, text: 'Learn Next.js', completed: false },
];

export async function GET(req: NextRequest) {
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const newTodo: Todo = {
    id: todos.length + 1,
    text,
    completed: false,
  };
  todos.push(newTodo);
  return NextResponse.json(newTodo, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, text, completed } = await req.json();
  const todoIndex = todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return NextResponse.json({ message: 'Todo not found' }, { status: 404 });
  }

  todos[todoIndex] = { id, text, completed };
  return NextResponse.json(todos[todoIndex]);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  todos = todos.filter((todo) => todo.id !== id);
  return NextResponse.json({ message: 'Todo deleted' }, { status: 204 });
}
