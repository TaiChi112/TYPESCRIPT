'use client'

import { useState, useCallback } from 'react'

interface UseLoadingReturn {
  loading: boolean
  setLoading: (loading: boolean) => void
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}

export function useLoading(initialState = false): UseLoadingReturn {
  const [loading, setLoading] = useState(initialState)

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true)
    try {
      const result = await fn()
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    setLoading,
    withLoading,
  }
}
