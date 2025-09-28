'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text, 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <RefreshCw 
        className={`animate-spin text-blue-600 ${sizeClasses[size]}`} 
      />
      {text && (
        <span className="text-gray-600 text-sm font-medium">{text}</span>
      )}
    </div>
  );
}