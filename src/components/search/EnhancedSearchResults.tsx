'use client'

import { memo, useMemo, useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { FixedSizeList as List } from 'react-window'
import clsx from 'clsx'
import { Badge } from '@/components/ui/Badge'
import type { SearchResult } from '@/hooks/useEnhancedSearch'

interface EnhancedSearchResultsProps {
  results: SearchResult[]
  totalCount: number
  isLoading: boolean
  viewMode: 'grid' | 'list' | 'compact'
  showAuthor?: boolean
  showTags?: boolean
  showMetrics?: boolean
  onResultClick?: (result: SearchResult) => void
  onTagClick?: (tag: string) => void
  onAuthorClick?: (author: string) => void
}

interface SearchResultItemProps {
  result: SearchResult
  viewMode: 'grid' | 'list' | 'compact'
  showAuthor: boolean
  showTags: boolean
  showMetrics: boolean
  onResultClick?: (result: SearchResult) => void
  onTagClick?: (tag: string) => void
  onAuthorClick?: (author: string) => void
}

// メモ化されたアイテムコンポーネント
const SearchResultItem = memo<SearchResultItemProps>(({
  result,
  viewMode,
  showAuthor,
  showTags,
  showMetrics,
  onResultClick,
  onTagClick,
  onAuthorClick
}) => {
  const handleClick = useCallback(() => {
    onResultClick?.(result)
  }, [onResultClick, result])

  const handleTagClick = useCallback((e: React.MouseEvent, tag: string) => {
    e.stopPropagation()
    onTagClick?.(tag)
  }, [onTagClick])

  const handleAuthorClick = useCallback((e: React.MouseEvent, author: string) => {
    e.stopPropagation()
    onAuthorClick?.(author)
  }, [onAuthorClick])

  const typeIcon = useMemo(() => {
    switch (result.type) {
      case 'article': return '📄'
      case 'book': return '📚'
      case 'scrap': return '📝'
      default: return '📄'
    }
  }, [result.type])

  const typeColor = useMemo(() => {
    switch (result.type) {
      case 'article': return 'bg-blue-100 text-blue-700'
      case 'book': return 'bg-green-100 text-green-700'
      case 'scrap': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }, [result.type])

  const formattedDate = useMemo(() => {
    return formatDistanceToNow(new Date(result.publishedAt), {
      addSuffix: true,
      locale: ja
    })
  }, [result.publishedAt])

  if (viewMode === 'compact') {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
      >
        {/* アイコンとタイプ */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className="text-lg">{result.emoji}</span>
          <Badge variant="secondary" size="small" className={typeColor}>
            {result.type}
          </Badge>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {result.title}
          </h3>
          {showAuthor && (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={(e) => handleAuthorClick(e, result.author.username)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <img
                  src={result.author.avatar}
                  alt={result.author.name}
                  className="w-4 h-4 rounded-full"
                />
                <span>{result.author.name}</span>
                {result.author.verified && (
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                )}
              </button>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">{formattedDate}</span>
            </div>
          )}
        </div>

        {/* メトリクス */}
        {showMetrics && (
          <div className="flex-shrink-0 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{result.likes}</span>
            </div>
            {result.views && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{result.views}</span>
              </div>
            )}
            {result.readingTime && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{result.readingTime}分</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all hover:shadow-sm"
      >
        {/* アイコン */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
            {result.emoji}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 leading-tight">
              {result.title}
            </h3>
            <Badge variant="secondary" size="small" className={typeColor}>
              {result.type}
            </Badge>
          </div>

          {result.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {result.excerpt}
            </p>
          )}

          {/* メタ情報 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showAuthor && (
                <button
                  onClick={(e) => handleAuthorClick(e, result.author.username)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <img
                    src={result.author.avatar}
                    alt={result.author.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{result.author.name}</span>
                  {result.author.verified && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                </button>
              )}

              <span className="text-sm text-gray-500">{formattedDate}</span>

              {result.isPremium && (
                <Badge variant="secondary" size="small" className="bg-yellow-100 text-yellow-700">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Premium
                </Badge>
              )}

              {result.hasImages && (
                <Badge variant="secondary" size="small">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4 16 4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  画像
                </Badge>
              )}

              {result.hasCodeBlocks && (
                <Badge variant="secondary" size="small">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  コード
                </Badge>
              )}
            </div>

            {showMetrics && (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{result.likes}</span>
                </div>

                {result.comments && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{result.comments}</span>
                  </div>
                )}

                {result.readingTime && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{result.readingTime}分</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* タグ */}
          {showTags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {result.tags.slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => handleTagClick(e, tag)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
              {result.tags.length > 5 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{result.tags.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all hover:shadow-md overflow-hidden"
    >
      {/* ヘッダー */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{result.emoji}</span>
            <Badge variant="secondary" size="small" className={typeColor}>
              {result.type}
            </Badge>
            {result.isPremium && (
              <Badge variant="secondary" size="small" className="bg-yellow-100 text-yellow-700">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </Badge>
            )}
          </div>

          {result.price && (
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">¥{result.price.toLocaleString()}</div>
            </div>
          )}
        </div>

        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
          {result.title}
        </h3>

        {result.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {result.excerpt}
          </p>
        )}

        {/* コンテンツ特性 */}
        <div className="flex items-center gap-2 mb-3">
          {result.hasImages && (
            <Badge variant="secondary" size="small">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4 16 4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              画像
            </Badge>
          )}

          {result.hasCodeBlocks && (
            <Badge variant="secondary" size="small">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              コード
            </Badge>
          )}

          {result.readingTime && (
            <Badge variant="secondary" size="small">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {result.readingTime}分
            </Badge>
          )}
        </div>

        {/* タグ */}
        {showTags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {result.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                onClick={(e) => handleTagClick(e, tag)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                {tag}
              </button>
            ))}
            {result.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{result.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {showAuthor && (
            <button
              onClick={(e) => handleAuthorClick(e, result.author.username)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <img
                src={result.author.avatar}
                alt={result.author.name}
                className="w-5 h-5 rounded-full"
              />
              <span className="truncate max-w-[100px]">{result.author.name}</span>
              {result.author.verified && (
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              )}
            </button>
          )}

          {showMetrics && (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{result.likes}</span>
              </div>

              {result.views && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{result.views}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{formattedDate}</span>
          
          {result.relevanceScore && result.relevanceScore > 0.8 && (
            <Badge variant="secondary" size="small" className="bg-orange-100 text-orange-700">
              高関連度
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
})

SearchResultItem.displayName = 'SearchResultItem'

// 仮想化されたリストコンポーネント（大量データ用）
interface VirtualizedResultsProps extends Omit<EnhancedSearchResultsProps, 'viewMode'> {
  height: number
  itemHeight: number
}

const VirtualizedResults = memo<VirtualizedResultsProps>(({
  results,
  height,
  itemHeight,
  ...props
}) => {
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <SearchResultItem
        result={results[index]}
        viewMode="compact"
        {...props}
      />
    </div>
  ), [results, props])

  return (
    <List
      height={height}
      itemCount={results.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  )
})

VirtualizedResults.displayName = 'VirtualizedResults'

// メインコンポーネント
export const EnhancedSearchResults = memo<EnhancedSearchResultsProps>(({
  results,
  totalCount,
  isLoading,
  viewMode,
  showAuthor = true,
  showTags = true,
  showMetrics = true,
  onResultClick,
  onTagClick,
  onAuthorClick
}) => {
  const [useVirtualization, setUseVirtualization] = useState(false)

  // 大量データの場合は仮想化を使用
  const shouldUseVirtualization = results.length > 100 && viewMode === 'compact'

  // ローディング状態
  if (isLoading && results.length === 0) {
    const skeletonCount = viewMode === 'grid' ? 6 : 5
    
    return (
      <div className={clsx(
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      )}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'bg-white rounded-lg animate-pulse',
              viewMode === 'grid' ? 'p-6' : 'p-4'
            )}
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  // 結果がない場合
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          結果が見つかりませんでした
        </h3>
        <p className="text-gray-600">
          検索条件を変更してお試しください
        </p>
      </div>
    )
  }

  // 仮想化を使用する場合
  if (shouldUseVirtualization || useVirtualization) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {totalCount.toLocaleString()}件中 {results.length.toLocaleString()}件を表示
          </p>
          <button
            onClick={() => setUseVirtualization(!useVirtualization)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {useVirtualization ? '通常表示' : '仮想化表示'}
          </button>
        </div>
        
        <VirtualizedResults
          results={results}
          totalCount={totalCount}
          isLoading={isLoading}
          height={600}
          itemHeight={80}
          showAuthor={showAuthor}
          showTags={showTags}
          showMetrics={showMetrics}
          onResultClick={onResultClick}
          onTagClick={onTagClick}
          onAuthorClick={onAuthorClick}
        />
      </div>
    )
  }

  // 通常表示
  return (
    <div>
      {totalCount > results.length && (
        <p className="text-sm text-gray-600 mb-4">
          {totalCount.toLocaleString()}件中 {results.length.toLocaleString()}件を表示
          {results.length > 100 && (
            <button
              onClick={() => setUseVirtualization(true)}
              className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
            >
              （仮想化表示に切り替え）
            </button>
          )}
        </p>
      )}
      
      <div className={clsx(
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : viewMode === 'list'
          ? 'space-y-4'
          : 'border border-gray-200 rounded-lg overflow-hidden'
      )}>
        {results.map((result, index) => (
          <SearchResultItem
            key={`${result.id}-${index}`}
            result={result}
            viewMode={viewMode}
            showAuthor={showAuthor}
            showTags={showTags}
            showMetrics={showMetrics}
            onResultClick={onResultClick}
            onTagClick={onTagClick}
            onAuthorClick={onAuthorClick}
          />
        ))}
      </div>
    </div>
  )
})

EnhancedSearchResults.displayName = 'EnhancedSearchResults'