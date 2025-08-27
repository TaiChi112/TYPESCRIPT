'use client';

import { useState } from 'react';
import TodoList from '../components/TodoList';
import TodoForm from '../components/TodoForm';
import './globals.css';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTodoAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center mb-6">Vibe Todo List</h1>
        <TodoForm onTodoAdded={handleTodoAdded} />
        <TodoList key={refreshKey} />
      </div>
    </main>
  );
}
