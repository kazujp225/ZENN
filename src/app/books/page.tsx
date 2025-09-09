'use client'

import { useState, useEffect } from 'react'
import { BookCard } from '@/components/cards/BookCard'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import Link from 'next/link'
import { booksApi } from '@/lib/api'
import type { Book } from '@/lib/api'
import '@/styles/pages/books.css'

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBooks()
  }, [filter, sortBy, searchQuery])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      setError(null)

      let result

      if (searchQuery.trim()) {
        result = await booksApi.searchBooks(searchQuery, 20, 0)
      } else if (filter === 'free') {
        result = await booksApi.getFreeBooks(20, 0)
      } else if (filter === 'paid') {
        result = await booksApi.getPaidBooks(20, 0)
      } else {
        result = await booksApi.getPublishedBooks(20, 0)
      }

      let sortedBooks = result.data || []
      
      // Sort books
      if (sortBy === 'popular') {
        sortedBooks = sortedBooks.sort((a: any, b: any) => b.likes_count - a.likes_count)
      } else {
        sortedBooks = sortedBooks.sort((a: any, b: any) => 
          new Date(b.published_at || b.created_at).getTime() - 
          new Date(a.published_at || a.created_at).getTime()
        )
      }

      setBooks(sortedBooks)
    } catch (err: any) {
      console.error('書籍取得エラー:', err)
      setError(err.message || '書籍の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const tabItems = [
    { label: 'すべて', value: 'all' as const },
    { label: '無料', value: 'free' as const },
    { label: '有料', value: 'paid' as const }
  ]

  return (
    <PageProvider>
      <div className="books-page">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">本</h1>
              <p className="text-gray-600 mt-2">
                技術書やエンジニアリングの書籍を探そう
              </p>
            </div>
            <Link
              href="/new/book"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              本を出版する
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  検索
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="本を検索..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  価格
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'free' | 'paid')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">すべて</option>
                  <option value="free">無料</option>
                  <option value="paid">有料</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  並び順
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="recent">新着順</option>
                  <option value="popular">人気順</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">エラー</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchBooks}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                再試行
              </button>
            </div>
          )}

          {/* Books Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">本を読み込み中...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">本が見つかりません</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filter !== 'all' 
                  ? '検索条件を変更してみてください' 
                  : 'まだ本がありません。最初の本を出版してみましょう！'
                }
              </p>
              {!searchQuery && filter === 'all' && (
                <Link
                  href="/new/book"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  本を出版する
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <div key={book.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center relative">
                    {book.cover_image_url ? (
                      <img 
                        src={book.cover_image_url} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">📖</div>
                    )}
                    
                    {/* Price Badge */}
                    <div className="absolute top-2 right-2">
                      {book.is_free ? (
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          無料
                        </span>
                      ) : (
                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                          ¥{book.price}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <Link 
                      href={`/books/${book.slug}`}
                      className="font-bold text-gray-900 hover:text-blue-600 transition-colors block mb-2 line-clamp-2"
                      title={book.title}
                    >
                      {book.title}
                    </Link>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {book.description || '説明がありません'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <span>@{book.user?.username || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1 text-gray-500">
                          <span>❤️</span>
                          <span>{book.likes_count}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        {formatDate(book.published_at || book.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {books.length > 0 && books.length % 20 === 0 && (
            <div className="text-center mt-8">
              <button
                onClick={() => fetchBooks()}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                もっと読み込む
              </button>
            </div>
          )}
        </div>
      </div>
    </PageProvider>
  )
}