'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, RefreshCw } from 'lucide-react';
import { TodoAPI } from '@/lib/api';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/todo';
import AddTodoForm from '@/components/AddTodoForm';
import TodoItem from '@/components/TodoItem';
import TodoStats from '@/components/TodoStats';
import ErrorDisplay from '@/components/ErrorDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTodos = await TodoAPI.getAllTodos();
      setTodos(fetchedTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
      setError('Failed to load todos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (todoData: CreateTodoRequest) => {
    try {
      setActionLoading(true);
      const newTodo = await TodoAPI.createTodo(todoData);
      setTodos(prev => [newTodo, ...prev]);
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add todo. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      setActionLoading(true);
      const updatedTodo = await TodoAPI.toggleTodo(id);
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error('Error toggling todo:', error);
      setError('Failed to update todo. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTodo = async (id: string, data: UpdateTodoRequest) => {
    try {
      setActionLoading(true);
      const updatedTodo = await TodoAPI.updateTodo(id, data);
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setActionLoading(true);
      await TodoAPI.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'pending':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    pending: todos.filter(todo => !todo.completed).length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckSquare size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Todo List</h1>
          </div>
          <p className="text-gray-600">Manage your tasks efficiently with this simple todo application</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Todo Form */}
            <AddTodoForm onAdd={handleAddTodo} isLoading={actionLoading} />

            {/* Error Message */}
            <ErrorDisplay 
              error={error} 
              onRetry={loadTodos} 
              onDismiss={() => setError(null)} 
            />

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'completed'] as const).map(filterType => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filterType}
                  {filterType === 'all' && ` (${stats.total})`}
                  {filterType === 'pending' && ` (${stats.pending})`}
                  {filterType === 'completed' && ` (${stats.completed})`}
                </button>
              ))}
              
              <button
                onClick={loadTodos}
                disabled={loading}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Todos List */}
            {loading ? (
              <div className="py-12">
                <LoadingSpinner size="lg" text="Loading todos..." />
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No todos yet' : `No ${filter} todos`}
                </h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'Add your first todo to get started!'
                    : `You don't have any ${filter} todos.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTodos.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggleTodo}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                    isLoading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TodoStats {...stats} />
            
            {/* Quick Info */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Click the checkbox to mark todos as complete</li>
                <li>• Use the edit button to modify todo details</li>
                <li>• Filter todos by status for better organization</li>
                <li>• Delete todos you no longer need</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
