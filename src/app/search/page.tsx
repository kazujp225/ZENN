'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs } from '@/components/ui/Tabs'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import { ScrapCard } from '@/components/cards/ScrapCard'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import { articlesApi, booksApi, scrapsApi } from '@/lib/api'
import type { Article, Book, Scrap } from '@/lib/api'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  
  const [activeTab, setActiveTab] = useState<'articles' | 'books' | 'scraps'>('articles')
  const [articles, setArticles] = useState<Article[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [scraps, setScraps] = useState<Scrap[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(query)

  useEffect(() => {
    setSearchInput(query)
    if (query) {
      searchContent(query)
    }
  }, [query])

  const searchContent = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      setError(null)

      const [articlesRes, booksRes, scrapsRes] = await Promise.all([
        articlesApi.searchArticles(searchQuery, 20, 0),
        booksApi.searchBooks(searchQuery, 20, 0),
        scrapsApi.searchScraps(searchQuery, 20, 0)
      ])

      setArticles(Array.isArray(articlesRes?.data) ? articlesRes.data : [])
      setBooks(Array.isArray(booksRes?.data) ? booksRes.data : [])
      setScraps(Array.isArray(scrapsRes?.data) ? scrapsRes.data : [])
    } catch (err: any) {
      console.error('検索エラー:', err)
      setError(err.message || '検索に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim() && searchInput !== query) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  const tabItems = [
    { label: '記事', value: 'articles' as const, count: articles.length },
    { label: '本', value: 'books' as const, count: books.length },
    { label: 'スクラップ', value: 'scraps' as const, count: scraps.length }
  ]

  const totalResults = articles.length + books.length + scraps.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索バー */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="記事・本・スクラップを検索..."
              className="w-full px-6 py-4 pr-12 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none shadow-md"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* 検索結果 */}
        {query && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              「{query}」の検索結果
            </h1>
            {!loading && (
              <p className="text-gray-600 mt-2">
                {totalResults > 0 
                  ? `${totalResults}件の結果が見つかりました`
                  : '結果が見つかりませんでした'}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">検索中...</p>
          </div>
        ) : query && totalResults > 0 ? (
          <>
            <Tabs items={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-8">
              {activeTab === 'articles' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {articles.length === 0 ? (
                    <div className="col-span-2 text-center py-12">
                      <p className="text-gray-600">記事が見つかりませんでした</p>
                    </div>
                  ) : (
                    articles.map((article) => {
                      const author = article.author || article.user
                      return (
                        <ArticleCard
                          key={article.id}
                          id={article.id}
                          title={article.title}
                          emoji={article.emoji || '📝'}
                          author={{
                            name: author?.display_name || author?.username || 'Unknown',
                            username: author?.username || 'unknown',
                            avatar: author?.avatar_url || '/images/avatar-placeholder.svg'
                          }}
                          publishedAt={article.published_at || article.created_at}
                          likes={article.likes_count || 0}
                          comments={article.comments_count || 0}
                          tags={article.topics || []}
                          type={(article.type as 'tech' | 'idea') || 'tech'}
                        />
                      )
                    })
                  )}
                </div>
              )}

              {activeTab === 'books' && (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {books.length === 0 ? (
                    <div className="col-span-4 text-center py-12">
                      <p className="text-gray-600">本が見つかりませんでした</p>
                    </div>
                  ) : (
                    books.map((book) => {
                      const author = book.author || book.user
                      return (
                        <BookCard
                          key={book.id}
                          id={book.id}
                          title={book.title}
                          author={{
                            username: author?.username || 'Unknown',
                            name: author?.display_name || author?.username || 'Unknown',
                            avatar: author?.avatar_url || '/images/avatar-placeholder.svg'
                          }}
                          coverImage={book.cover_image_url || '/images/book-placeholder.svg'}
                          price={book.is_free ? 'free' : (book.price || 0)}
                          likes={book.likes_count || 0}
                          publishedAt={book.published_at || book.created_at}
                          description={book.description}
                        />
                      )
                    })
                  )}
                </div>
              )}

              {activeTab === 'scraps' && (
                <div className="space-y-4">
                  {scraps.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600">スクラップが見つかりませんでした</p>
                    </div>
                  ) : (
                    scraps.map((scrap) => {
                      const author = scrap.author || scrap.user
                      return (
                        <ScrapCard
                          key={scrap.id}
                          id={scrap.id}
                          title={scrap.title}
                          emoji={scrap.emoji}
                          author={{
                            username: author?.username || 'Unknown',
                            name: author?.display_name || author?.username || 'Unknown',
                            avatar: author?.avatar_url || '/images/avatar-placeholder.svg'
                          }}
                          publishedAt={scrap.created_at}
                          updatedAt={scrap.updated_at || scrap.created_at}
                          commentsCount={scrap.comments_count || 0}
                          isOpen={!scrap.closed}
                        />
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </>
        ) : !query ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">検索してみましょう</h2>
            <p className="text-gray-600">記事、本、スクラップを検索できます</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <PageProvider
      title="検索"
      description="記事・本・スクラップを検索"
    >
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-2xl mb-8"></div>
              <div className="h-8 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </PageProvider>
  )
}