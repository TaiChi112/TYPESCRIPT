'use client';

import { useEffect, useState } from 'react';
import { getTodos, updateTodo, deleteTodo, getErrorMessage, isTodoServiceError } from '../services/todoService';

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      // Log additional error details for debugging
      if (isTodoServiceError(err)) {
        console.error('Todo Service Error:', {
          status: err.status,
          error: err.apiError.error,
          message: err.apiError.message
        });
      } else {
        console.error('Unexpected error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleToggle = async (todo: Todo) => {
    try {
      setActionLoading(todo.id);
      setError(null);
      await updateTodo(todo.id, { completed: !todo.completed });
      await fetchTodos(); // Refresh the list
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(`Failed to update todo: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }
    
    try {
      setActionLoading(id);
      setError(null);
      await deleteTodo(id);
      await fetchTodos(); // Refresh the list
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(`Failed to delete todo: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 flex justify-center">
        <div className="text-gray-500">Loading todos...</div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
          <button 
            onClick={fetchTodos}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}
      
      {todos.length === 0 && !error ? (
        <div className="text-center text-gray-500 py-8">
          No todos yet. Add one above to get started!
        </div>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
              <div className="flex-1">
                <span className={`${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'} font-medium`}>
                  {todo.title}
                </span>
                {todo.description && (
                  <div className={`text-sm mt-1 ${todo.completed ? 'text-gray-300' : 'text-gray-600'}`}>
                    {todo.description}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  Created: {new Date(todo.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  className={`px-3 py-1 rounded text-white text-sm font-medium transition-colors ${
                    todo.completed 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } ${actionLoading === todo.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleToggle(todo)}
                  disabled={actionLoading === todo.id}
                >
                  {actionLoading === todo.id ? '...' : (todo.completed ? 'Undo' : 'Complete')}
                </button>
                <button
                  className={`px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors ${
                    actionLoading === todo.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleDelete(todo.id)}
                  disabled={actionLoading === todo.id}
                >
                  {actionLoading === todo.id ? '...' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
    try {
      await deleteTodo(id);
      fetchTodos();
    } catch {
      setError('Failed to delete todo');
    }
  };

  return (
    <div className="mt-6">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
            <div>
              <span className={todo.completed ? 'line-through text-gray-400' : ''}>{todo.title}</span>
              {todo.description && <div className="text-sm text-gray-500">{todo.description}</div>}
            </div>
            <div className="flex gap-2">
              <button
                className={`px-2 py-1 rounded ${todo.completed ? 'bg-yellow-400' : 'bg-green-400'} text-white`}
                onClick={() => handleToggle(todo)}
              >
                {todo.completed ? 'Undo' : 'Complete'}
              </button>
              <button
                className="px-2 py-1 rounded bg-red-500 text-white"
                onClick={() => handleDelete(todo.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
