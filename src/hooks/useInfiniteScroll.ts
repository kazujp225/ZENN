import { useState, useEffect, useCallback, useRef } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
  enabled?: boolean
  onLoadMore?: () => Promise<void> | void
}

interface UseInfiniteScrollReturn {
  isLoading: boolean
  hasMore: boolean
  error: Error | null
  setHasMore: (hasMore: boolean) => void
  reset: () => void
  observerRef: (node: HTMLElement | null) => void
}

export function useInfiniteScroll({
  threshold = 0.1,
  rootMargin = '100px',
  enabled = true,
  onLoadMore
}: UseInfiniteScrollOptions = {}): UseInfiniteScrollReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const observer = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef(false)

  const handleObserver = useCallback(async (entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    
    if (target.isIntersecting && hasMore && !loadingRef.current && enabled) {
      loadingRef.current = true
      setIsLoading(true)
      setError(null)
      
      try {
        if (onLoadMore) {
          await onLoadMore()
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load more'))
        // エラーログ削除（セキュリティ対応）
      } finally {
        setIsLoading(false)
        loadingRef.current = false
      }
    }
  }, [hasMore, enabled, onLoadMore])

  const observerRef = useCallback((node: HTMLElement | null) => {
    if (observer.current) {
      observer.current.disconnect()
    }
    
    if (node && enabled && hasMore) {
      observer.current = new IntersectionObserver(handleObserver, {
        threshold,
        rootMargin
      })
      observer.current.observe(node)
    }
  }, [enabled, hasMore, handleObserver, threshold, rootMargin])

  const reset = useCallback(() => {
    setHasMore(true)
    setError(null)
    setIsLoading(false)
    loadingRef.current = false
  }, [])

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  return {
    isLoading,
    hasMore,
    error,
    setHasMore,
    reset,
    observerRef
  }
}

// ページネーション付き無限スクロール用フック
interface UsePaginatedInfiniteScrollOptions<T> extends UseInfiniteScrollOptions {
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean }>
  limit?: number
  initialPage?: number
}

export function usePaginatedInfiniteScroll<T>({
  fetchFn,
  limit = 20,
  initialPage = 1,
  ...scrollOptions
}: UsePaginatedInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(initialPage)
  
  const loadMore = useCallback(async () => {
    const { data, hasMore } = await fetchFn(page, limit)
    
    setItems(prev => [...prev, ...data])
    setPage(prev => prev + 1)
    
    return hasMore
  }, [page, limit, fetchFn])

  const { isLoading, hasMore, error, setHasMore, reset: resetScroll, observerRef } = useInfiniteScroll({
    ...scrollOptions,
    onLoadMore: async () => {
      const hasMoreData = await loadMore()
      setHasMore(hasMoreData)
    }
  })

  const reset = useCallback(() => {
    setItems([])
    setPage(initialPage)
    resetScroll()
  }, [initialPage, resetScroll])

  return {
    items,
    isLoading,
    hasMore,
    error,
    reset,
    observerRef
  }
}