'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { SearchInput } from '@/components/search/SearchInput'
import { SearchFilters } from '@/components/search/SearchFilters'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import { ScrapCard } from '@/components/cards/ScrapCard'
import '@/styles/pages/search.css'

function SearchPageContent() {
  const {
    query,
    setQuery,
    filters,
    updateFilters,
    resetFilters,
    results,
    totalCount,
    isLoading,
    suggestions,
    getSuggestions,
    addToHistory,
    getSearchHistory,
    activeFilterCount
  } = useSearch()

  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'popular'>('relevance')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSearch = () => {
    if (query.trim()) {
      addToHistory(query.trim())
      setShowSuggestions(false)
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion)
    addToHistory(suggestion)
    setShowSuggestions(false)
  }

  const searchHistory = getSearchHistory()

  const trendingSearches = [
    { rank: 1, term: 'Next.js 14 App Router', count: 2341 },
    { rank: 2, term: 'React Server Components', count: 1892 },
    { rank: 3, term: 'TypeScript 5.0', count: 1567 },
    { rank: 4, term: 'Tailwind CSS', count: 1234 },
    { rank: 5, term: 'Rust WebAssembly', count: 987 }
  ]

  const popularTags = [
    'Next.js', 'React', 'TypeScript', 'JavaScript', 'Python', 'Go', 
    'Rust', 'Docker', 'Kubernetes', 'AWS', 'GraphQL', 'Vue.js'
  ]

  return (
    <div className="search-page">
      {/* 検索ヒーローセクション */}
      <div className="search-hero">
        <div className="search-hero__container">
          <h1 className="search-hero__title">🔍 知識を探索しよう</h1>
          <p className="search-hero__description">
            記事、本、スクラップから必要な情報を見つけましょう
          </p>
          
          {/* 検索ボックス */}
          <div className="search-box">
            <svg className="search-box__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="search-box__input"
              placeholder="キーワードを入力..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowSuggestions(true)
                getSuggestions(e.target.value)
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-box__button" onClick={handleSearch}>
              検索
            </button>
            
            {/* サジェスト */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="search-suggestion"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <svg className="search-suggestion__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="search-suggestion__text">{suggestion}</span>
                    <span className="search-suggestion__type">検索</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* クイックタグ */}
          <div className="search-quick-tags">
            {popularTags.slice(0, 6).map(tag => (
              <button
                key={tag}
                className="search-quick-tag"
                onClick={() => {
                  updateFilters({ tags: [...filters.tags, tag].slice(0, 5) })
                  setShowSuggestions(false)
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="search-layout">
        {/* サイドバー */}
        <aside className="search-sidebar">
          {/* フィルター */}
          <div className="search-filter">
            <div className="search-filter__header">
              <h3 className="search-filter__title">🎯 フィルター</h3>
              {activeFilterCount > 0 && (
                <button className="search-filter__reset" onClick={resetFilters}>
                  リセット
                </button>
              )}
            </div>
            
            <div className="search-filter__group">
              <label className="search-filter__label">コンテンツタイプ</label>
              <div className="search-filter__options">
                {[
                  { value: 'all', label: 'すべて', count: totalCount },
                  { value: 'articles', label: '記事', count: Math.floor(totalCount * 0.6) },
                  { value: 'books', label: '本', count: Math.floor(totalCount * 0.2) },
                  { value: 'scraps', label: 'スクラップ', count: Math.floor(totalCount * 0.2) }
                ].map(option => (
                  <div
                    key={option.value}
                    className="search-filter__option"
                    onClick={() => updateFilters({ type: option.value as any })}
                  >
                    <div className={`search-filter__checkbox ${filters.type === option.value ? 'search-filter__checkbox--checked' : ''}`}></div>
                    <span className="search-filter__option-label">{option.label}</span>
                    <span className="search-filter__option-count">{option.count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="search-filter__group">
              <label className="search-filter__label">期間</label>
              <div className="search-filter__options">
                {[
                  { value: 'all', label: 'すべての期間' },
                  { value: 'week', label: '1週間以内' },
                  { value: 'month', label: '1ヶ月以内' },
                  { value: 'year', label: '1年以内' }
                ].map(option => (
                  <div
                    key={option.value}
                    className="search-filter__option"
                    onClick={() => updateFilters({ dateRange: option.value as any })}
                  >
                    <div className={`search-filter__checkbox ${filters.dateRange === option.value ? 'search-filter__checkbox--checked' : ''}`}></div>
                    <span className="search-filter__option-label">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* トレンド検索 */}
          <div className="search-trending">
            <h3 className="search-trending__title">
              <span>🔥</span>
              トレンド検索
            </h3>
            <div className="search-trending__list">
              {trendingSearches.map(item => (
                <div
                  key={item.rank}
                  className="search-trending__item"
                  onClick={() => handleSuggestionSelect(item.term)}
                >
                  <div className={`search-trending__rank search-trending__rank--${item.rank}`}>
                    {item.rank}
                  </div>
                  <span className="search-trending__text">{item.term}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 人気タグ */}
          <div className="search-filter">
            <h3 className="search-filter__title">🏷️ 人気のタグ</h3>
            <div className="search-quick-tags" style={{ marginTop: '1rem' }}>
              {popularTags.map(tag => (
                <button
                  key={tag}
                  className="search-quick-tag"
                  style={{ 
                    background: '#f1f5f9', 
                    color: '#475569',
                    border: '1px solid #e5e7eb'
                  }}
                  onClick={() => updateFilters({ tags: [...filters.tags, tag].slice(0, 5) })}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="search-main">
          {/* 検索結果ヘッダー */}
          {(query || activeFilterCount > 0) && (
            <div className="search-results-header">
              <div className="search-results-header__row">
                <div className="search-results-header__info">
                  {query && (
                    <h2 className="search-results-header__query">「{query}」</h2>
                  )}
                  <span className="search-results-header__count">
                    {totalCount.toLocaleString()}件の結果
                  </span>
                </div>
                
                <div className="search-results-header__sort">
                  <button
                    className={`search-sort-button ${sortBy === 'relevance' ? 'search-sort-button--active' : ''}`}
                    onClick={() => setSortBy('relevance')}
                  >
                    関連度順
                  </button>
                  <button
                    className={`search-sort-button ${sortBy === 'newest' ? 'search-sort-button--active' : ''}`}
                    onClick={() => setSortBy('newest')}
                  >
                    新着順
                  </button>
                  <button
                    className={`search-sort-button ${sortBy === 'popular' ? 'search-sort-button--active' : ''}`}
                    onClick={() => setSortBy('popular')}
                  >
                    人気順
                  </button>
                </div>
              </div>
              
              {/* アクティブフィルター */}
              {activeFilterCount > 0 && (
                <div className="search-active-filters">
                  {filters.type !== 'all' && (
                    <div className="search-active-filter">
                      {filters.type === 'articles' ? '記事' : 
                       filters.type === 'books' ? '本' : 'スクラップ'}
                      <span 
                        className="search-active-filter__remove"
                        onClick={() => updateFilters({ type: 'all' })}
                      >
                        ×
                      </span>
                    </div>
                  )}
                  {filters.tags.map(tag => (
                    <div key={tag} className="search-active-filter">
                      {tag}
                      <span 
                        className="search-active-filter__remove"
                        onClick={() => updateFilters({ 
                          tags: filters.tags.filter(t => t !== tag)
                        })}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                  {filters.dateRange !== 'all' && (
                    <div className="search-active-filter">
                      {
                       filters.dateRange === 'week' ? '1週間以内' :
                       filters.dateRange === 'month' ? '1ヶ月以内' : '1年以内'}
                      <span 
                        className="search-active-filter__remove"
                        onClick={() => updateFilters({ dateRange: 'all' })}
                      >
                        ×
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 検索結果 */}
          {(query || activeFilterCount > 0) ? (
            <div className="search-results">
              {isLoading ? (
                // ローディング
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="search-result-card" style={{ opacity: 0.5 }}>
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : results.length > 0 ? (
                // 検索結果
                results.map((result) => (
                  <div key={result.id} className="search-result-card">
                    {result.type === 'article' ? (
                      <ArticleCard
                        id={result.id}
                        title={result.title}
                        emoji={result.emoji}
                        author={result.author}
                        publishedAt={result.publishedAt}
                        likes={result.likes}
                        comments={0}
                        tags={result.tags}
                        type="tech"
                      />
                    ) : result.type === 'book' ? (
                      <BookCard
                        id={result.id}
                        title={result.title}
                        coverImage="/images/placeholder.svg"
                        author={result.author}
                        publishedAt={result.publishedAt}
                        likes={result.likes}
                        price={0}
                        description=""
                      />
                    ) : (
                      <ScrapCard
                        id={result.id}
                        title={result.title}
                        emoji={result.emoji || '💭'}
                        author={result.author}
                        publishedAt={result.publishedAt}
                        updatedAt={result.publishedAt}
                        commentsCount={0}
                        isOpen={true}
                        excerpt={result.excerpt || ''}
                      />
                    )}
                  </div>
                ))
              ) : (
                // 結果なし
                <div className="search-empty">
                  <svg className="search-empty__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h6m-6-4h6m2 5a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="search-empty__title">検索結果が見つかりませんでした</h3>
                  <p className="search-empty__description">
                    別のキーワードで検索するか、フィルターを調整してみてください
                  </p>
                  <div className="search-empty__suggestions">
                    {['React Hooks', 'Next.js SSG', 'TypeScript Tips'].map(term => (
                      <button
                        key={term}
                        className="search-empty__suggestion"
                        onClick={() => handleSuggestionSelect(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 初期状態
            <div className="search-empty">
              <svg className="search-empty__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="search-empty__title">キーワードを入力して検索</h3>
              <p className="search-empty__description">
                記事、本、スクラップから必要な情報を探しましょう
              </p>
              <div className="search-empty__suggestions">
                {searchHistory.slice(0, 5).map(term => (
                  <button
                    key={term}
                    className="search-empty__suggestion"
                    onClick={() => handleSuggestionSelect(term)}
                  >
                    🕐 {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="search-page">
        <div className="search-hero">
          <div className="search-hero__container">
            <h1 className="search-hero__title">🔍 知識を探索しよう</h1>
            <p className="search-hero__description">
              読み込み中...
            </p>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}