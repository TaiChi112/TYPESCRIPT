'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-600">{message}</p>
    </div>
  )
}

interface ButtonLoadingProps {
  loading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function ButtonLoading({
  loading,
  children,
  loadingText,
  className = '',
  disabled,
  onClick,
  type = 'button',
}: ButtonLoadingProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      {loading && <LoadingSpinner size="sm" />}
      {loading && loadingText ? loadingText : children}
    </button>
  )
}
