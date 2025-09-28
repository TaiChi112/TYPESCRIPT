'use client';

import React from 'react';
import { CheckCircle, Circle, List } from 'lucide-react';

interface TodoStatsProps {
  total: number;
  completed: number;
  pending: number;
}

export default function TodoStats({ total, completed, pending }: TodoStatsProps) {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <List size={20} />
        Todo Statistics
      </h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{total}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <List size={14} />
            Total
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completed}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <CheckCircle size={14} />
            Completed
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{pending}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <Circle size={14} />
            Pending
          </div>
        </div>
      </div>
      
      {total > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Completion Rate</span>
            <span>{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}