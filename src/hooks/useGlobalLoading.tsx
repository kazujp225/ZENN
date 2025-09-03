'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react'

export interface LoadingState {
  id: string
  message?: string
  progress?: number
  startTime: number
  timeout?: number
  cancellable?: boolean
  onCancel?: () => void
}

interface LoadingContextType {
  // State
  isLoading: boolean
  loadingStates: LoadingState[]
  currentLoadingMessage: string | null
  globalProgress: number
  
  // Actions
  startLoading: (options?: {
    id?: string
    message?: string
    timeout?: number
    cancellable?: boolean
    onCancel?: () => void
  }) => string
  
  updateLoading: (id: string, options: {
    message?: string
    progress?: number
  }) => void
  
  stopLoading: (id: string) => void
  
  stopAllLoading: () => void
  
  // Utilities
  withLoading: <T>(
    operation: () => Promise<T>,
    options?: {
      message?: string
      timeout?: number
      onError?: (error: Error) => void
    }
  ) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | null>(null)

// ローディング管理クラス
class LoadingManager {
  private states: Map<string, LoadingState> = new Map()
  private timeouts: Map<string, NodeJS.Timeout> = new Map()
  private onStateChange?: (states: LoadingState[]) => void

  setOnStateChange(callback: (states: LoadingState[]) => void) {
    this.onStateChange = callback
  }

  private generateId(): string {
    return `loading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private notifyChange() {
    this.onStateChange?.(Array.from(this.states.values()))
  }

  start(options: {
    id?: string
    message?: string
    timeout?: number
    cancellable?: boolean
    onCancel?: () => void
  } = {}): string {
    const id = options.id || this.generateId()
    
    const state: LoadingState = {
      id,
      message: options.message,
      progress: undefined,
      startTime: Date.now(),
      timeout: options.timeout,
      cancellable: options.cancellable,
      onCancel: options.onCancel
    }

    this.states.set(id, state)

    // タイムアウト設定
    if (options.timeout) {
      const timeoutId = setTimeout(() => {
        console.warn(`Loading timeout for ${id}`)
        this.stop(id)
      }, options.timeout)
      
      this.timeouts.set(id, timeoutId)
    }

    this.notifyChange()
    return id
  }

  update(id: string, options: {
    message?: string
    progress?: number
  }) {
    const state = this.states.get(id)
    if (!state) return

    if (options.message !== undefined) {
      state.message = options.message
    }
    
    if (options.progress !== undefined) {
      state.progress = Math.max(0, Math.min(100, options.progress))
    }

    this.states.set(id, state)
    this.notifyChange()
  }

  stop(id: string) {
    this.states.delete(id)
    
    const timeoutId = this.timeouts.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.timeouts.delete(id)
    }

    this.notifyChange()
  }

  stopAll() {
    this.states.clear()
    
    for (const timeoutId of this.timeouts.values()) {
      clearTimeout(timeoutId)
    }
    this.timeouts.clear()
    
    this.notifyChange()
  }

  getStates(): LoadingState[] {
    return Array.from(this.states.values())
  }

  isActive(): boolean {
    return this.states.size > 0
  }
}

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([])
  const managerRef = useRef<LoadingManager>(new LoadingManager())

  useEffect(() => {
    managerRef.current.setOnStateChange(setLoadingStates)
  }, [])

  // 計算されたプロパティ
  const isLoading = loadingStates.length > 0
  const currentLoadingMessage = loadingStates[0]?.message || null
  
  const globalProgress = loadingStates.length > 0 
    ? loadingStates.reduce((sum, state) => sum + (state.progress || 0), 0) / loadingStates.length
    : 0

  // アクション
  const startLoading = useCallback((options?: {
    id?: string
    message?: string
    timeout?: number
    cancellable?: boolean
    onCancel?: () => void
  }): string => {
    return managerRef.current.start(options || {})
  }, [])

  const updateLoading = useCallback((id: string, options: {
    message?: string
    progress?: number
  }) => {
    managerRef.current.update(id, options)
  }, [])

  const stopLoading = useCallback((id: string) => {
    managerRef.current.stop(id)
  }, [])

  const stopAllLoading = useCallback(() => {
    managerRef.current.stopAll()
  }, [])

  const withLoading = useCallback(async <T,>(
    operation: () => Promise<T>,
    options: {
      message?: string
      timeout?: number
      onError?: (error: Error) => void
    } = {}
  ): Promise<T> => {
    const id = startLoading({
      message: options.message || '処理中...',
      timeout: options.timeout || 30000, // デフォルト30秒
      cancellable: false
    })

    try {
      const result = await operation()
      stopLoading(id)
      return result
    } catch (error) {
      stopLoading(id)
      
      if (options.onError && error instanceof Error) {
        options.onError(error)
      }
      
      throw error
    }
  }, [startLoading, stopLoading])

  const value: LoadingContextType = {
    // State
    isLoading,
    loadingStates,
    currentLoadingMessage,
    globalProgress,
    
    // Actions
    startLoading,
    updateLoading,
    stopLoading,
    stopAllLoading,
    
    // Utilities
    withLoading
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useGlobalLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider')
  }
  return context
}

// カスタムフック: ローカルローディング状態
export function useLocalLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | undefined>(undefined)
  const loadingIdRef = useRef<string | null>(null)
  
  const { startLoading, updateLoading, stopLoading } = useGlobalLoading()

  const start = useCallback((options?: {
    message?: string
    timeout?: number
  }) => {
    if (loadingIdRef.current) {
      stopLoading(loadingIdRef.current)
    }
    
    loadingIdRef.current = startLoading({
      message: options?.message,
      timeout: options?.timeout
    })
    
    setIsLoading(true)
    setMessage(options?.message || null)
    setProgress(undefined)
  }, [startLoading, stopLoading])

  const update = useCallback((options: {
    message?: string
    progress?: number
  }) => {
    if (!loadingIdRef.current) return
    
    updateLoading(loadingIdRef.current, options)
    
    if (options.message !== undefined) {
      setMessage(options.message)
    }
    
    if (options.progress !== undefined) {
      setProgress(options.progress)
    }
  }, [updateLoading])

  const stop = useCallback(() => {
    if (loadingIdRef.current) {
      stopLoading(loadingIdRef.current)
      loadingIdRef.current = null
    }
    
    setIsLoading(false)
    setMessage(null)
    setProgress(undefined)
  }, [stopLoading])

  const withLoading = useCallback(async <T,>(
    operation: () => Promise<T>,
    options?: {
      message?: string
      timeout?: number
    }
  ): Promise<T> => {
    start(options)
    
    try {
      const result = await operation()
      stop()
      return result
    } catch (error) {
      stop()
      throw error
    }
  }, [start, stop])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (loadingIdRef.current) {
        stopLoading(loadingIdRef.current)
      }
    }
  }, [stopLoading])

  return {
    isLoading,
    message,
    progress,
    start,
    update,
    stop,
    withLoading
  }
}

// カスタムフック: ページレベルローディング
export function usePageLoading(initialMessage?: string) {
  const { startLoading, stopLoading, updateLoading } = useGlobalLoading()
  const loadingIdRef = useRef<string | null>(null)

  const startPageLoading = useCallback((message?: string) => {
    if (loadingIdRef.current) {
      stopLoading(loadingIdRef.current)
    }
    
    loadingIdRef.current = startLoading({
      message: message || initialMessage || 'ページを読み込み中...',
      timeout: 15000 // ページローディングは15秒でタイムアウト
    })
  }, [startLoading, stopLoading, initialMessage])

  const updatePageLoading = useCallback((options: {
    message?: string
    progress?: number
  }) => {
    if (loadingIdRef.current) {
      updateLoading(loadingIdRef.current, options)
    }
  }, [updateLoading])

  const stopPageLoading = useCallback(() => {
    if (loadingIdRef.current) {
      stopLoading(loadingIdRef.current)
      loadingIdRef.current = null
    }
  }, [stopLoading])

  useEffect(() => {
    return () => {
      if (loadingIdRef.current) {
        stopLoading(loadingIdRef.current)
      }
    }
  }, [stopLoading])

  return {
    startPageLoading,
    updatePageLoading,
    stopPageLoading
  }
}