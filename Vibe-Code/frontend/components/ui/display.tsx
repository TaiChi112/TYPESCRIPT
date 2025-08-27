'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-3 rounded-md text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface LoadingSkeletonProps {
  count?: number
  className?: string
}

export function LoadingSkeleton({ count = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={`skeleton-${i + 1}`} className="card p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

interface EmptyStateProps {
  message: string
  className?: string
}

export function EmptyState({ message, className = '' }: EmptyStateProps) {
  return (
    <div className={`card p-6 text-center ${className}`}>
      <p className="text-gray-600">{message}</p>
    </div>
  )
}
