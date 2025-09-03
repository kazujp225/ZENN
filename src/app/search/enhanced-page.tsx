'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useEnhancedSearch, type SearchSuggestion, type SearchResult } from '@/hooks/useEnhancedSearch'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import { Badge } from '@/components/ui/Badge'
import clsx from 'clsx'

function SearchPageContent() {
  const {
    query,
    filters,
    results,
    isLoading,
    isLoadingMore,
    totalCount,
    hasMore,
    suggestions,
    recentSearches,
    popularTags,
    error,
    performanceMetrics,
    setQuery,
    updateFilters,
    resetFilters,
    toggleTag,
    toggleAuthor,
    getSuggestions,
    addToHistory,
    clearHistory,
    loadMore,
    activeFilterCount
  } = useEnhancedSearch()

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // 無限スクロール
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, loadMore])

  // 検索候補の表示制御
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // キーボードショートカット
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false)
        searchInputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [])

  // 検索実行
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.trim()) {
      addToHistory(searchQuery)
    }
    setShowSuggestions(false)
  }, [setQuery, addToHistory])

  // 検索入力の処理
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.trim()) {
      getSuggestions(value)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [setQuery, getSuggestions])

  // 候補選択
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === 'tag') {
      toggleTag(suggestion.text)
    } else if (suggestion.type === 'author') {
      toggleAuthor(suggestion.text)
    } else {
      handleSearch(suggestion.text)
    }
  }, [toggleTag, toggleAuthor, handleSearch])

  // 結果をレンダリング
  const renderResult = useCallback((result: SearchResult, index: number) => {
    const key = `${result.id}-${index}`
    
    if (result.type === 'book') {
      return (
        <BookCard
          key={key}
          book={result}
          showAuthor={true}
          showTags={true}
        />
      )
    } else {
      return (
        <ArticleCard
          key={key}
          article={result}
          showAuthor={true}
          showTags={true}
          variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
        />
      )
    }
  }, [viewMode])

  // パフォーマンス指標の表示
  const renderPerformanceMetrics = () => {
    if (!performanceMetrics || !query) return null

    return (
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span>
          約 {totalCount.toLocaleString()} 件の結果
        </span>
        <span>
          ({performanceMetrics.searchTime.toFixed(0)}ms)
        </span>
        {performanceMetrics.cacheHit && (
          <span className="bg-green-100 text-green-600 px-2 py-1 rounded">
            キャッシュヒット
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 検索ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* メイン検索バー */}
          <div className="relative mb-4">
            <div className={clsx(
              'flex items-center bg-white border rounded-lg transition-all',
              searchFocused ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
            )}>
              <div className="flex-shrink-0 p-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => {
                  setSearchFocused(true)
                  if (query.trim() || recentSearches.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(query)
                  }
                }}
                placeholder="記事、本、スクラップを検索... (Ctrl+K)"
                className="flex-1 px-0 py-3 border-none outline-none text-lg placeholder-gray-400"
              />
              
              {query && (
                <button
                  onClick={() => {
                    setQuery('')
                    setShowSuggestions(false)
                  }}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <div className="flex-shrink-0 p-2">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-600">
                  {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
                </kbd>
              </div>
            </div>

            {/* 検索候補 */}
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-20"
              >
                {/* 最近の検索 */}
                {!query && recentSearches.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">最近の検索</h3>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        クリア
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center gap-2"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 検索候補 */}
                {suggestions.length > 0 && (
                  <div className="p-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">検索候補</h3>
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span>{suggestion.text}</span>
                            {suggestion.type !== 'query' && (
                              <Badge variant="secondary" size="small">
                                {suggestion.type === 'tag' ? 'タグ' : 'ユーザー'}
                              </Badge>
                            )}
                          </div>
                          {suggestion.count && (
                            <span className="text-xs text-gray-500">
                              {suggestion.count.toLocaleString()}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 人気タグ */}
                {!query && popularTags.length > 0 && (
                  <div className="p-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">人気のタグ</h3>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.slice(0, 10).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={clsx(
                            'px-2 py-1 text-xs rounded transition-colors',
                            filters.tags.includes(tag)
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* フィルター行 */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* タイプフィルター */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'all' as const, label: 'すべて' },
                  { key: 'articles' as const, label: '記事' },
                  { key: 'books' as const, label: '本' },
                  { key: 'scraps' as const, label: 'スクラップ' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => updateFilters({ type: key })}
                    className={clsx(
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      filters.type === key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 並び替え */}
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevant">関連度順</option>
                <option value="newest">新しい順</option>
                <option value="oldest">古い順</option>
                <option value="updated">更新順</option>
                <option value="popular">人気順</option>
              </select>

              {/* 詳細フィルター */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={clsx(
                  'flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors',
                  showAdvancedFilters || activeFilterCount > 0
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                詳細フィルター
                {activeFilterCount > 0 && (
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* フィルターリセット */}
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  リセット
                </button>
              )}
            </div>

            {/* 表示切り替え */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">表示:</span>
              <div className="flex bg-gray-100 rounded p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={clsx(
                    'p-1 rounded transition-colors',
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  )}
                  title="グリッド表示"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={clsx(
                    'p-1 rounded transition-colors',
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  )}
                  title="リスト表示"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 詳細フィルター */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 日付範囲 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公開日
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => updateFilters({ dateRange: e.target.value as any })}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">すべて</option>
                    <option value="week">1週間以内</option>
                    <option value="month">1ヶ月以内</option>
                    <option value="year">1年以内</option>
                    <option value="custom">カスタム</option>
                  </select>
                </div>

                {/* カスタム日付範囲 */}
                {filters.dateRange === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        開始日
                      </label>
                      <input
                        type="date"
                        value={filters.customDateFrom || ''}
                        onChange={(e) => updateFilters({ customDateFrom: e.target.value })}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        終了日
                      </label>
                      <input
                        type="date"
                        value={filters.customDateTo || ''}
                        onChange={(e) => updateFilters({ customDateTo: e.target.value })}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* いいね数 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最小いいね数
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.minLikes || ''}
                    onChange={(e) => updateFilters({ minLikes: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                {/* コンテンツタイプ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    コンテンツタイプ
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.hasImages === true}
                        onChange={(e) => updateFilters({ 
                          hasImages: e.target.checked ? true : undefined 
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">画像あり</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.hasCodeBlocks === true}
                        onChange={(e) => updateFilters({ 
                          hasCodeBlocks: e.target.checked ? true : undefined 
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">コードブロックあり</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* アクティブなタグフィルター */}
              {filters.tags.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選択中のタグ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {filters.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                      >
                        {tag}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* アクティブな作者フィルター */}
              {filters.authors.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選択中の作者
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {filters.authors.map((author) => (
                      <button
                        key={author}
                        onClick={() => toggleAuthor(author)}
                        className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                      >
                        @{author}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">検索エラー</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* 検索結果ヘッダー */}
        {(query || activeFilterCount > 0) && (
          <div className="mb-6">
            {renderPerformanceMetrics()}
            
            {query && (
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                「{query}」の検索結果
              </h1>
            )}

            {totalCount === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-medium text-gray-900 mb-2">
                  検索結果が見つかりませんでした
                </h2>
                <p className="text-gray-600 mb-4">
                  検索条件を変更してお試しください
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• キーワードのスペルを確認してください</p>
                  <p>• より一般的なキーワードで検索してみてください</p>
                  <p>• フィルターを減らしてみてください</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 初期状態 */}
        {!query && activeFilterCount === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              検索してください
            </h2>
            <p className="text-gray-600 mb-6">
              記事、本、スクラップから気になる情報を見つけましょう
            </p>
            
            {/* 人気タグ */}
            {popularTags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">人気のタグ</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularTags.slice(0, 15).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 検索結果 */}
        {results.length > 0 && (
          <div className={clsx(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          )}>
            {results.map(renderResult)}
          </div>
        )}

        {/* ローディング */}
        {isLoading && results.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* 無限スクロール用の要素 */}
        {hasMore && (
          <div
            ref={loadMoreRef}
            className="flex items-center justify-center py-8"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-gray-600">読み込み中...</span>
              </div>
            ) : (
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                もっと見る
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// エラー境界付きでエクスポート
export default function EnhancedSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}