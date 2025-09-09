'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

export type SearchType = 'all' | 'articles' | 'books' | 'scraps'
export type SortBy = 'newest' | 'oldest' | 'popular' | 'relevant'
export type DateRange = 'all' | 'week' | 'month' | 'year'

export interface SearchFilters {
  type: SearchType
  sortBy: SortBy
  dateRange: DateRange
  tags: string[]
  authors: string[]
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
  }
  publishedAt: string
  likes: number
  tags: string[]
  excerpt?: string
  relevanceScore?: number
}

const DEFAULT_FILTERS: SearchFilters = {
  type: 'all',
  sortBy: 'relevant',
  dateRange: 'all',
  tags: [],
  authors: []
}

export function useSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // URLパラメータの同期
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (query) params.set('q', query)
    if (filters.type !== 'all') params.set('type', filters.type)
    if (filters.sortBy !== 'relevant') params.set('sort', filters.sortBy)
    if (filters.dateRange !== 'all') params.set('date', filters.dateRange)
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','))
    if (filters.authors.length > 0) params.set('authors', filters.authors.join(','))

    const newUrl = params.toString() ? `?${params.toString()}` : ''
    const currentUrl = window.location.search
    
    if (newUrl !== currentUrl) {
      router.replace(`/search${newUrl}`, { scroll: false })
    }
  }, [query, filters, router])

  // URLパラメータからフィルターを復元
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
    setFilters({
      type: (searchParams.get('type') as SearchType) || 'all',
      sortBy: (searchParams.get('sort') as SortBy) || 'relevant',
      dateRange: (searchParams.get('date') as DateRange) || 'all',
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
      authors: searchParams.get('authors')?.split(',').filter(Boolean) || []
    })
  }, [searchParams])

  // 検索実行
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim() && searchFilters.tags.length === 0 && searchFilters.authors.length === 0) {
      setResults([])
      setTotalCount(0)
      return
    }

    setIsLoading(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 500)) // シミュレーション

      // サンプル検索結果
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Next.js 14の新機能まとめ',
          type: 'article',
          emoji: '🚀',
          author: {
            username: 'developer1',
            name: '田中太郎',
            avatar: '/images/avatar-placeholder.svg'
          },
          publishedAt: '2025-01-15T10:00:00Z',
          likes: 234,
          tags: ['Next.js', 'React', 'TypeScript'],
          excerpt: 'Next.js 14がリリースされ、App Routerがさらに進化しました...',
          relevanceScore: 0.95
        },
        {
          id: '2',
          title: 'React Server Components完全理解',
          type: 'article',
          emoji: '⚛️',
          author: {
            username: 'developer2',
            name: '佐藤花子',
            avatar: '/images/avatar-placeholder.svg'
          },
          publishedAt: '2025-01-14T10:00:00Z',
          likes: 156,
          tags: ['React', 'Server Components'],
          excerpt: 'React Server Componentsの仕組みと実践的な使い方...',
          relevanceScore: 0.88
        },
        {
          id: '3',
          title: 'TypeScript完全入門',
          type: 'book',
          emoji: '📘',
          author: {
            username: 'developer3',
            name: '鈴木一郎',
            avatar: '/images/avatar-placeholder.svg'
          },
          publishedAt: '2025-01-13T10:00:00Z',
          likes: 189,
          tags: ['TypeScript', '入門'],
          excerpt: 'TypeScriptの基礎から応用まで網羅的に解説...',
          relevanceScore: 0.82
        }
      ]

      // フィルタリング
      let filteredResults = mockResults

      // タイプフィルター
      if (searchFilters.type !== 'all') {
        filteredResults = filteredResults.filter(result => {
          if (searchFilters.type === 'articles') return result.type === 'article'
          if (searchFilters.type === 'books') return result.type === 'book'
          if (searchFilters.type === 'scraps') return result.type === 'scrap'
          return true
        })
      }

      // タグフィルター
      if (searchFilters.tags.length > 0) {
        filteredResults = filteredResults.filter(result =>
          searchFilters.tags.some(tag => result.tags.includes(tag))
        )
      }

      // 作者フィルター
      if (searchFilters.authors.length > 0) {
        filteredResults = filteredResults.filter(result =>
          searchFilters.authors.includes(result.author.username)
        )
      }

      // 日付フィルター
      const now = new Date()
      if (searchFilters.dateRange !== 'all') {
        const cutoffDate = new Date()
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
        }
        filteredResults = filteredResults.filter(result =>
          new Date(result.publishedAt) >= cutoffDate
        )
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
        case 'popular':
          filteredResults.sort((a, b) => b.likes - a.likes)
          break
        case 'relevant':
          filteredResults.sort((a, b) => 
            (b.relevanceScore || 0) - (a.relevanceScore || 0)
          )
          break
      }

      setResults(filteredResults)
      setTotalCount(filteredResults.length)
    } catch (error) {
      console.error('検索エラー:', error)
      setResults([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 検索実行
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query, filters)
    }, query ? 300 : 0) // クエリがある場合はデバウンス

    return () => clearTimeout(debounceTimer)
  }, [query, filters, performSearch])

  // 検索候補の取得
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 200))

      const mockSuggestions = [
        'Next.js 14',
        'Next.js App Router',
        'React Server Components',
        'TypeScript',
        'Web開発',
        'フロントエンド'
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      )

      setSuggestions(mockSuggestions)
    } catch (error) {
      console.error('検索候補取得エラー:', error)
      setSuggestions([])
    }
  }, [])

  // フィルター更新
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // フィルターリセット
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  // タグ追加・削除
  const toggleTag = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }, [])

  // 作者追加・削除
  const toggleAuthor = useCallback((author: string) => {
    setFilters(prev => ({
      ...prev,
      authors: prev.authors.includes(author)
        ? prev.authors.filter(a => a !== author)
        : [...prev.authors, author]
    }))
  }, [])

  // 検索履歴（ローカルストレージ）
  const addToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
      const newHistory = [
        searchQuery,
        ...history.filter((h: string) => h !== searchQuery)
      ].slice(0, 10) // 最大10件
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    } catch (error) {
      console.error('検索履歴保存エラー:', error)
    }
  }, [])

  const getSearchHistory = useCallback((): string[] => {
    try {
      return JSON.parse(localStorage.getItem('searchHistory') || '[]')
    } catch (error) {
      console.error('検索履歴取得エラー:', error)
      return []
    }
  }, [])

  // アクティブなフィルター数
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.type !== 'all') count++
    if (filters.sortBy !== 'relevant') count++
    if (filters.dateRange !== 'all') count++
    if (filters.tags.length > 0) count++
    if (filters.authors.length > 0) count++
    return count
  }, [filters])

  return {
    query,
    setQuery,
    filters,
    updateFilters,
    resetFilters,
    toggleTag,
    toggleAuthor,
    results,
    totalCount,
    isLoading,
    suggestions,
    getSuggestions,
    addToHistory,
    getSearchHistory,
    activeFilterCount
  }
}