'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorDisplay({ error, onRetry, onDismiss }: ErrorBoundaryProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-red-800 font-medium mb-1">Error</h4>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
      <div className="flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
            title="Retry"
          >
            <RefreshCw size={16} />
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
            title="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}