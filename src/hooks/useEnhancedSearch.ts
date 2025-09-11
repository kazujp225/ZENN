'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export type SearchType = 'all' | 'articles' | 'books' | 'scraps'
export type SortBy = 'newest' | 'oldest' | 'popular' | 'relevant' | 'updated'
export type DateRange = 'all' | 'week' | 'month' | 'year' | 'custom'

export interface SearchFilters {
  type: SearchType
  sortBy: SortBy
  dateRange: DateRange
  tags: string[]
  authors: string[]
  customDateFrom?: string
  customDateTo?: string
  minLikes?: number
  hasImages?: boolean
  hasCodeBlocks?: boolean
}

export interface SearchResult {
  id: string
  title: string
  type: 'article' | 'book' | 'scrap'
  emoji: string
  author: {
    username: string
    name: string
    avatar: string
    verified?: boolean
  }
  publishedAt: string
  updatedAt?: string
  likes: number
  views?: number
  comments?: number
  tags: string[]
  excerpt?: string
  relevanceScore?: number
  readingTime?: number
  hasImages?: boolean
  hasCodeBlocks?: boolean
  isPremium?: boolean
  price?: number
}

export interface SearchSuggestion {
  text: string
  type: 'query' | 'tag' | 'author'
  count?: number
}

export interface SearchState {
  query: string
  filters: SearchFilters
  results: SearchResult[]
  isLoading: boolean
  isLoadingMore: boolean
  totalCount: number
  hasMore: boolean
  page: number
  suggestions: SearchSuggestion[]
  recentSearches: string[]
  popularTags: string[]
  error: string | null
  searchId: string | null
  performanceMetrics: {
    searchTime: number
    resultCount: number
    cacheHit: boolean
  } | null
}

const DEFAULT_FILTERS: SearchFilters = {
  type: 'all',
  sortBy: 'relevant',
  dateRange: 'all',
  tags: [],
  authors: [],
  hasImages: undefined,
  hasCodeBlocks: undefined
}

interface CacheEntry {
  key: string
  data: SearchResult[]
  totalCount: number
  timestamp: number
  filters: SearchFilters
  query: string
}

class SearchCache {
  private cache = new Map<string, CacheEntry>()
  private readonly TTL = 5 * 60 * 1000 // 5分
  private readonly MAX_ENTRIES = 50

  private generateKey(query: string, filters: SearchFilters, page: number): string {
    return JSON.stringify({ query, filters, page })
  }

  get(query: string, filters: SearchFilters, page: number): CacheEntry | null {
    const key = this.generateKey(query, filters, page)
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return entry
  }

  set(query: string, filters: SearchFilters, page: number, data: SearchResult[], totalCount: number) {
    const key = this.generateKey(query, filters, page)
    
    if (this.cache.size >= this.MAX_ENTRIES) {
      const oldestKey = Array.from(this.cache.keys())[0]
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      key,
      data,
      totalCount,
      timestamp: Date.now(),
      filters: structuredClone(filters),
      query
    })
  }

  clear() {
    this.cache.clear()
  }

  invalidateRelated(query: string) {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.query.includes(query) || query.includes(entry.query)) {
        this.cache.delete(key)
      }
    }
  }
}

export function useEnhancedSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [state, setState] = useState<SearchState>({
    query: searchParams.get('q') || '',
    filters: DEFAULT_FILTERS,
    results: [],
    isLoading: false,
    isLoadingMore: false,
    totalCount: 0,
    hasMore: false,
    page: 1,
    suggestions: [],
    recentSearches: [],
    popularTags: [],
    error: null,
    searchId: null,
    performanceMetrics: null
  })

  const cacheRef = useRef(new SearchCache())
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // URLパラメータの同期
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (state.query) params.set('q', state.query)
    if (state.filters.type !== 'all') params.set('type', state.filters.type)
    if (state.filters.sortBy !== 'relevant') params.set('sort', state.filters.sortBy)
    if (state.filters.dateRange !== 'all') params.set('date', state.filters.dateRange)
    if (state.filters.tags.length > 0) params.set('tags', state.filters.tags.join(','))
    if (state.filters.authors.length > 0) params.set('authors', state.filters.authors.join(','))
    if (state.filters.minLikes) params.set('minLikes', state.filters.minLikes.toString())
    if (state.filters.hasImages !== undefined) params.set('hasImages', state.filters.hasImages.toString())
    if (state.filters.hasCodeBlocks !== undefined) params.set('hasCodeBlocks', state.filters.hasCodeBlocks.toString())
    if (state.filters.customDateFrom) params.set('dateFrom', state.filters.customDateFrom)
    if (state.filters.customDateTo) params.set('dateTo', state.filters.customDateTo)

    const newUrl = params.toString() ? `?${params.toString()}` : ''
    const currentUrl = window.location.search
    
    if (newUrl !== currentUrl) {
      router.replace(`/search${newUrl}`, { scroll: false })
    }
  }, [state.query, state.filters, router])

  // URLパラメータからの復元
  useEffect(() => {
    setState(prev => ({
      ...prev,
      query: searchParams.get('q') || '',
      filters: {
        type: (searchParams.get('type') as SearchType) || 'all',
        sortBy: (searchParams.get('sort') as SortBy) || 'relevant',
        dateRange: (searchParams.get('date') as DateRange) || 'all',
        tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
        authors: searchParams.get('authors')?.split(',').filter(Boolean) || [],
        minLikes: searchParams.get('minLikes') ? parseInt(searchParams.get('minLikes')!) : undefined,
        hasImages: searchParams.get('hasImages') === 'true' ? true : searchParams.get('hasImages') === 'false' ? false : undefined,
        hasCodeBlocks: searchParams.get('hasCodeBlocks') === 'true' ? true : searchParams.get('hasCodeBlocks') === 'false' ? false : undefined,
        customDateFrom: searchParams.get('dateFrom') || undefined,
        customDateTo: searchParams.get('dateTo') || undefined
      }
    }))
  }, [searchParams])

  // 検索実行関数（高度な機能付き）
  const performSearch = useCallback(async (
    searchQuery: string, 
    searchFilters: SearchFilters, 
    page: number = 1,
    append: boolean = false
  ): Promise<void> => {
    // 空の検索クエリとフィルターの場合
    if (!searchQuery.trim() && 
        searchFilters.tags.length === 0 && 
        searchFilters.authors.length === 0 &&
        !searchFilters.minLikes &&
        searchFilters.hasImages === undefined &&
        searchFilters.hasCodeBlocks === undefined) {
      setState(prev => ({
        ...prev,
        results: [],
        totalCount: 0,
        hasMore: false,
        error: null,
        performanceMetrics: null
      }))
      return
    }

    // キャッシュチェック
    const cachedResult = cacheRef.current.get(searchQuery, searchFilters, page)
    if (cachedResult && !append) {
      setState(prev => ({
        ...prev,
        results: cachedResult.data,
        totalCount: cachedResult.totalCount,
        hasMore: cachedResult.data.length < cachedResult.totalCount,
        isLoading: false,
        error: null,
        performanceMetrics: {
          searchTime: 0,
          resultCount: cachedResult.data.length,
          cacheHit: true
        }
      }))
      return
    }

    // 進行中のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const searchId = Date.now().toString()
    const startTime = performance.now()

    setState(prev => ({
      ...prev,
      isLoading: !append,
      isLoadingMore: append,
      error: null,
      searchId
    }))

    try {
      // API呼び出しシミュレーション
      await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200))
      
      // レスポンスが古い場合はスキップ
      if (searchId !== state.searchId && !append) return

      // より豊富なサンプルデータ
      const mockResults: SearchResult[] = Array.from({ length: 20 }, (_, i) => {
        const types: Array<'article' | 'book' | 'scrap'> = ['article', 'book', 'scrap']
        const authors = [
          { username: 'dev_taro', name: '田中太郎', verified: true },
          { username: 'coder_hanako', name: '佐藤花子', verified: false },
          { username: 'engineer_jiro', name: '鈴木次郎', verified: true },
          { username: 'web_shiori', name: '高橋栞', verified: false }
        ]
        const tagPools = [
          ['React', 'TypeScript', 'Next.js'],
          ['Vue.js', 'Nuxt.js', 'JavaScript'],
          ['Python', 'Django', 'Flask'],
          ['Go', 'Docker', 'Kubernetes'],
          ['AWS', 'クラウド', 'インフラ']
        ]

        const randomType = types[i % types.length]
        const randomAuthor = authors[i % authors.length]
        const randomTags = tagPools[i % tagPools.length]
        
        return {
          id: `${page}-${i}`,
          title: `${searchQuery || 'サンプル'}記事 #${page * 20 + i + 1}`,
          type: randomType,
          emoji: ['📝', '💡', '🚀', '⚡', '🎯'][i % 5],
          author: {
            ...randomAuthor,
            avatar: `/images/avatar-${i % 4}.svg`
          },
          publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 500),
          views: Math.floor(Math.random() * 2000),
          comments: Math.floor(Math.random() * 50),
          tags: randomTags,
          excerpt: `${searchQuery || 'サンプル'}に関する詳細な解説記事です。実装方法から運用のポイントまで幅広くカバーしています...`,
          relevanceScore: Math.random(),
          readingTime: Math.ceil(Math.random() * 15) + 3,
          hasImages: Math.random() > 0.3,
          hasCodeBlocks: Math.random() > 0.4,
          isPremium: Math.random() > 0.8,
          price: Math.random() > 0.8 ? Math.floor(Math.random() * 2000) + 500 : undefined
        }
      })

      // 高度なフィルタリング
      let filteredResults = mockResults

      // テキスト検索（タイトル、本文、タグでの検索）
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filteredResults = filteredResults.filter(result => {
          const titleMatch = result.title.toLowerCase().includes(query)
          const excerptMatch = result.excerpt?.toLowerCase().includes(query) || false
          const tagMatch = result.tags.some(tag => tag.toLowerCase().includes(query))
          const authorMatch = result.author.name.toLowerCase().includes(query) ||
                             result.author.username.toLowerCase().includes(query)
          
          const score = (titleMatch ? 1 : 0) + 
                       (excerptMatch ? 0.5 : 0) + 
                       (tagMatch ? 0.8 : 0) + 
                       (authorMatch ? 0.6 : 0)
          
          if (score > 0) {
            result.relevanceScore = score + (result.relevanceScore || 0)
            return true
          }
          return false
        })
      }

      // タイプフィルター
      if (searchFilters.type !== 'all') {
        filteredResults = filteredResults.filter(result => {
          if (searchFilters.type === 'articles') return result.type === 'article'
          if (searchFilters.type === 'books') return result.type === 'book'
          if (searchFilters.type === 'scraps') return result.type === 'scrap'
          return true
        })
      }

      // タグフィルター（AND条件）
      if (searchFilters.tags.length > 0) {
        filteredResults = filteredResults.filter(result =>
          searchFilters.tags.every(tag => 
            result.tags.some(resultTag => 
              resultTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        )
      }

      // 作者フィルター
      if (searchFilters.authors.length > 0) {
        filteredResults = filteredResults.filter(result =>
          searchFilters.authors.some(author => 
            result.author.username.toLowerCase().includes(author.toLowerCase()) ||
            result.author.name.toLowerCase().includes(author.toLowerCase())
          )
        )
      }

      // いいね数フィルター
      if (searchFilters.minLikes) {
        filteredResults = filteredResults.filter(result => result.likes >= searchFilters.minLikes!)
      }

      // コンテンツ特性フィルター
      if (searchFilters.hasImages !== undefined) {
        filteredResults = filteredResults.filter(result => result.hasImages === searchFilters.hasImages)
      }
      
      if (searchFilters.hasCodeBlocks !== undefined) {
        filteredResults = filteredResults.filter(result => result.hasCodeBlocks === searchFilters.hasCodeBlocks)
      }

      // 日付フィルター
      const now = new Date()
      if (searchFilters.dateRange !== 'all') {
        let cutoffDate = new Date()
        
        switch (searchFilters.dateRange) {
          case 'week':
            cutoffDate.setDate(now.getDate() - 7)
            break
          case 'month':
            cutoffDate.setMonth(now.getMonth() - 1)
            break
          case 'year':
            cutoffDate.setFullYear(now.getFullYear() - 1)
            break
          case 'custom':
            if (searchFilters.customDateFrom) {
              cutoffDate = new Date(searchFilters.customDateFrom)
            }
            break
        }
        
        filteredResults = filteredResults.filter(result => {
          const publishDate = new Date(result.publishedAt)
          if (searchFilters.dateRange === 'custom') {
            const fromDate = searchFilters.customDateFrom ? new Date(searchFilters.customDateFrom) : new Date(0)
            const toDate = searchFilters.customDateTo ? new Date(searchFilters.customDateTo) : now
            return publishDate >= fromDate && publishDate <= toDate
          }
          return publishDate >= cutoffDate
        })
      }

      // ソート
      switch (searchFilters.sortBy) {
        case 'newest':
          filteredResults.sort((a, b) => 
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          )
          break
        case 'oldest':
          filteredResults.sort((a, b) => 
            new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
          )
          break
        case 'updated':
          filteredResults.sort((a, b) => 
            new Date(b.updatedAt || b.publishedAt).getTime() - new Date(a.updatedAt || a.publishedAt).getTime()
          )
          break
        case 'popular':
          filteredResults.sort((a, b) => (b.likes + (b.views || 0) * 0.1) - (a.likes + (a.views || 0) * 0.1))
          break
        case 'relevant':
        default:
          filteredResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
          break
      }

      const totalCount = filteredResults.length
      const pageSize = 20
      const paginatedResults = filteredResults.slice((page - 1) * pageSize, page * pageSize)
      const hasMore = page * pageSize < totalCount

      // キャッシュに保存
      cacheRef.current.set(searchQuery, searchFilters, page, paginatedResults, totalCount)

      const endTime = performance.now()
      const searchTime = endTime - startTime

      setState(prev => ({
        ...prev,
        results: append ? [...prev.results, ...paginatedResults] : paginatedResults,
        totalCount,
        hasMore,
        page: append ? page : 1,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        performanceMetrics: {
          searchTime,
          resultCount: paginatedResults.length,
          cacheHit: false
        }
      }))

    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      
      // エラーログ削除（セキュリティ対応）
      setState(prev => ({
        ...prev,
        results: append ? prev.results : [],
        totalCount: 0,
        hasMore: false,
        isLoading: false,
        isLoadingMore: false,
        error: error instanceof Error ? error.message : '検索に失敗しました'
      }))
    }
  }, [state.searchId])

  // デバウンス付き検索実行
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(state.query, state.filters, 1, false)
    }, state.query ? 500 : 0)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [state.query, state.filters, performSearch])

  // 検索候補の取得（改良版）
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setState(prev => ({ ...prev, suggestions: [] }))
      return
    }

    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current)
    }

    suggestionTimeoutRef.current = setTimeout(async () => {
      try {
        // API呼び出しシミュレーション
        await new Promise(resolve => setTimeout(resolve, 150))

        const mockSuggestions: SearchSuggestion[] = [
          { text: 'Next.js 14', type: 'query' as const, count: 120 },
          { text: 'Next.js App Router', type: 'query' as const, count: 89 },
          { text: 'React Server Components', type: 'query' as const, count: 67 },
          { text: 'TypeScript', type: 'tag' as const, count: 234 },
          { text: 'Web開発', type: 'tag' as const, count: 156 },
          { text: 'dev_taro', type: 'author' as const, count: 45 },
          { text: 'フロントエンド', type: 'query' as const, count: 203 }
        ].filter(suggestion => 
          suggestion.text.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8)

        setState(prev => ({ ...prev, suggestions: mockSuggestions }))
      } catch (error) {
        // エラーログ削除（セキュリティ対応）
        setState(prev => ({ ...prev, suggestions: [] }))
      }
    }, 200)
  }, [])

  // 人気タグの取得
  const loadPopularTags = useCallback(async () => {
    try {
      // API呼び出しシミュレーション
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const tags = [
        'React', 'TypeScript', 'Next.js', 'Vue.js', 'Angular',
        'JavaScript', 'Python', 'Go', 'Rust', 'Docker',
        'AWS', 'Firebase', 'GraphQL', 'MongoDB', 'PostgreSQL'
      ]

      setState(prev => ({ ...prev, popularTags: tags }))
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }, [])

  // 初期化
  useEffect(() => {
    loadPopularTags()
    
    // 検索履歴の読み込み
    try {
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]')
      setState(prev => ({ ...prev, recentSearches }))
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }, [loadPopularTags])

  // 検索履歴の管理
  const addToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    setState(prev => {
      const newHistory = [
        searchQuery,
        ...prev.recentSearches.filter(h => h !== searchQuery)
      ].slice(0, 10)

      try {
        localStorage.setItem('recentSearches', JSON.stringify(newHistory))
      } catch (error) {
        // エラーログ削除（セキュリティ対応）
      }

      return { ...prev, recentSearches: newHistory }
    })
  }, [])

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, recentSearches: [] }))
    try {
      localStorage.removeItem('recentSearches')
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }, [])

  // その他のアクション
  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query, page: 1 }))
  }, [])

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      page: 1
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setState(prev => ({ ...prev, filters: DEFAULT_FILTERS, page: 1 }))
  }, [])

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoadingMore) {
      const nextPage = state.page + 1
      setState(prev => ({ ...prev, page: nextPage }))
      performSearch(state.query, state.filters, nextPage, true)
    }
  }, [state.hasMore, state.isLoadingMore, state.page, state.query, state.filters, performSearch])

  const toggleTag = useCallback((tag: string) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        tags: prev.filters.tags.includes(tag)
          ? prev.filters.tags.filter(t => t !== tag)
          : [...prev.filters.tags, tag]
      },
      page: 1
    }))
  }, [])

  const toggleAuthor = useCallback((author: string) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        authors: prev.filters.authors.includes(author)
          ? prev.filters.authors.filter(a => a !== author)
          : [...prev.filters.authors, author]
      },
      page: 1
    }))
  }, [])

  // アクティブフィルター数
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (state.filters.type !== 'all') count++
    if (state.filters.sortBy !== 'relevant') count++
    if (state.filters.dateRange !== 'all') count++
    if (state.filters.tags.length > 0) count++
    if (state.filters.authors.length > 0) count++
    if (state.filters.minLikes) count++
    if (state.filters.hasImages !== undefined) count++
    if (state.filters.hasCodeBlocks !== undefined) count++
    return count
  }, [state.filters])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    // State
    query: state.query,
    filters: state.filters,
    results: state.results,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    totalCount: state.totalCount,
    hasMore: state.hasMore,
    page: state.page,
    suggestions: state.suggestions,
    recentSearches: state.recentSearches,
    popularTags: state.popularTags,
    error: state.error,
    performanceMetrics: state.performanceMetrics,

    // Actions
    setQuery,
    updateFilters,
    resetFilters,
    toggleTag,
    toggleAuthor,
    getSuggestions,
    addToHistory,
    clearHistory,
    loadMore,

    // Computed
    activeFilterCount,

    // Cache management
    clearCache: () => cacheRef.current.clear(),
    invalidateCache: (query: string) => cacheRef.current.invalidateRelated(query)
  }
}