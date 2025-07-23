'use client';

import { useState } from 'react';
import { createTodo, getErrorMessage, isTodoServiceError } from '../services/todoService';

interface TodoFormProps {
  readonly onTodoAdded: () => void;
}

export default function TodoForm({ onTodoAdded }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Client-side validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (title.length > 255) {
      setError('Title must be less than 255 characters');
      return;
    }
    
    if (description && description.length > 1000) {
      setError('Description must be less than 1000 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createTodo({ 
        title: title.trim(), 
        description: description.trim() || undefined 
      });
      
      // Reset form on success
      setTitle('');
      setDescription('');
      setError(null);
      onTodoAdded(); // Callback to refresh the list
      
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
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2 bg-white p-4 rounded shadow">
      {error && <div className="text-red-500">{error}</div>}
      <input
        className="border rounded px-2 py-1"
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        className="border rounded px-2 py-1"
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">Add Todo</button>
    </form>
  );
}
