import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface ErrorOptions {
  retry?: () => Promise<void>
  fallback?: () => void
  silent?: boolean
}

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleError = useCallback((error: unknown, options?: ErrorOptions) => {
    const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました'
    
    // エラーログ削除（セキュリティ対応）
    setError(error instanceof Error ? error : new Error(errorMessage))

    if (!options?.silent) {
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-right',
      })
    }

    if (options?.fallback) {
      options.fallback()
    }
  }, [])

  const retry = useCallback(async (retryFn?: () => Promise<void>) => {
    if (isRetrying) return

    setIsRetrying(true)
    setError(null)

    try {
      if (retryFn) {
        await retryFn()
      }
    } catch (err) {
      handleError(err)
    } finally {
      setIsRetrying(false)
    }
  }, [isRetrying, handleError])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    isRetrying,
    handleError,
    retry,
    clearError
  }
}

// APIエラーハンドリング用のユーティリティ
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'APIリクエストが失敗しました'
    let errorData = null

    try {
      errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // JSONパースエラーは無視
    }

    throw new ApiError(errorMessage, response.status, errorData)
  }

  try {
    return await response.json()
  } catch {
    // レスポンスが空の場合
    return {} as T
  }
}

// リトライ機能付きfetch
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3,
  retryDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      
      // 5xx系エラーの場合はリトライ
      if (response.status >= 500 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)))
        continue
      }
      
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error')
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)))
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}