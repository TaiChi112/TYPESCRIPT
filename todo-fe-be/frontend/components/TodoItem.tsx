'use client';

import React, { useState } from 'react';
import { Check, Clock, Edit3, Trash2, X, Save } from 'lucide-react';
import type { Todo, UpdateTodoRequest } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => Promise<void>;
  onUpdate: (id: string, data: UpdateTodoRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function TodoItem({ 
  todo, 
  onToggle, 
  onUpdate, 
  onDelete, 
  isLoading = false 
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    try {
      await onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating todo:', error);
      // Reset values on error
      setEditTitle(todo.title);
      setEditDescription(todo.description || '');
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white p-4 rounded-lg border ${todo.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'} transition-all duration-200`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Todo title..."
            disabled={isLoading}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            placeholder="Todo description..."
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={!editTitle.trim() || isLoading}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggle(todo.id)}
                  disabled={isLoading}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {todo.completed && <Check size={12} />}
                </button>
                
                <h3 className={`text-lg font-medium ${
                  todo.completed 
                    ? 'text-green-700 line-through' 
                    : 'text-gray-900'
                } truncate`}>
                  {todo.title}
                </h3>
              </div>
              
              {todo.description && (
                <p className={`mt-2 text-sm ${
                  todo.completed 
                    ? 'text-green-600' 
                    : 'text-gray-600'
                } break-words`}>
                  {todo.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  Created: {formatDate(todo.createdAt)}
                </div>
                {todo.updatedAt.getTime() !== todo.createdAt.getTime() && (
                  <div>
                    Updated: {formatDate(todo.updatedAt)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit todo"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete todo"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          {todo.completed && (
            <div className="mt-3 text-xs text-green-600 font-medium">
              ✅ Completed
            </div>
          )}
        </>
      )}
    </div>
  );
}