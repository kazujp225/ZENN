'use client'

import { ReactNode } from 'react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import clsx from 'clsx'

interface InfiniteScrollListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  onLoadMore: () => Promise<void>
  hasMore?: boolean
  loading?: boolean
  loadingComponent?: ReactNode
  emptyComponent?: ReactNode
  errorComponent?: ReactNode
  className?: string
  itemClassName?: string
  threshold?: number
  rootMargin?: string
}

export function InfiniteScrollList<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore = true,
  loading = false,
  loadingComponent,
  emptyComponent,
  errorComponent,
  className,
  itemClassName,
  threshold = 0.1,
  rootMargin = '100px'
}: InfiniteScrollListProps<T>) {
  const { isLoading, error, observerRef } = useInfiniteScroll({
    threshold,
    rootMargin,
    enabled: hasMore && !loading,
    onLoadMore
  })

  if (items.length === 0 && !loading && !isLoading) {
    return (
      <>
        {emptyComponent || (
          <div className="text-center py-12">
            <p className="text-gray-500">データがありません</p>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {items.map((item, index) => (
        <div key={index} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}

      {error && (
        errorComponent || (
          <div className="text-center py-8">
            <p className="text-red-600">読み込みエラーが発生しました</p>
            <button
              onClick={() => onLoadMore()}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              再試行
            </button>
          </div>
        )
      )}

      {(isLoading || loading) && (
        loadingComponent || (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )
      )}

      {hasMore && !loading && !isLoading && (
        <div ref={observerRef} className="h-1" />
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">すべて読み込みました</p>
        </div>
      )}
    </div>
  )
}

// グリッド表示用の無限スクロールコンポーネント
interface InfiniteScrollGridProps<T> extends Omit<InfiniteScrollListProps<T>, 'className' | 'itemClassName'> {
  columns?: number
  gap?: number
  className?: string
  gridClassName?: string
  itemClassName?: string
}

export function InfiniteScrollGrid<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore = true,
  loading = false,
  loadingComponent,
  emptyComponent,
  errorComponent,
  columns = 3,
  gap = 4,
  className,
  gridClassName,
  itemClassName,
  threshold = 0.1,
  rootMargin = '100px'
}: InfiniteScrollGridProps<T>) {
  const { isLoading, error, observerRef } = useInfiniteScroll({
    threshold,
    rootMargin,
    enabled: hasMore && !loading,
    onLoadMore
  })

  if (items.length === 0 && !loading && !isLoading) {
    return (
      <>
        {emptyComponent || (
          <div className="text-center py-12">
            <p className="text-gray-500">データがありません</p>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={className}>
      <div 
        className={clsx(
          'grid',
          `grid-cols-1 md:grid-cols-${Math.min(columns, 2)} lg:grid-cols-${columns}`,
          `gap-${gap}`,
          gridClassName
        )}
      >
        {items.map((item, index) => (
          <div key={index} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {error && (
        <div className="col-span-full">
          {errorComponent || (
            <div className="text-center py-8">
              <p className="text-red-600">読み込みエラーが発生しました</p>
              <button
                onClick={() => onLoadMore()}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                再試行
              </button>
            </div>
          )}
        </div>
      )}

      {(isLoading || loading) && (
        <div className="col-span-full">
          {loadingComponent || (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      )}

      {hasMore && !loading && !isLoading && (
        <div ref={observerRef} className="h-1 col-span-full" />
      )}

      {!hasMore && items.length > 0 && (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">すべて読み込みました</p>
        </div>
      )}
    </div>
  )
}