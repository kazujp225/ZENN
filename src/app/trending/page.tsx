'use client'

import { useState, useEffect } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import { ScrapCard } from '@/components/cards/ScrapCard'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import { articlesApi, booksApi, scrapsApi } from '@/lib/api'
import type { Article, Book, Scrap } from '@/lib/api'

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState<'articles' | 'books' | 'scraps'>('articles')
  const [articles, setArticles] = useState<Article[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [scraps, setScraps] = useState<Scrap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrendingContent()
  }, [])

  const fetchTrendingContent = async () => {
    try {
      setLoading(true)
      setError(null)

      const [articlesRes, booksRes, scrapsRes] = await Promise.all([
        articlesApi.getPublishedArticles(20, 0),
        booksApi.getPublishedBooks(20, 0),
        scrapsApi.getOpenScraps(20, 0)
      ])

      console.log('Trending API responses:', {
        articles: articlesRes,
        books: booksRes,
        scraps: scrapsRes
      })

      // Sort by likes count to get trending items
      const trendingArticles = (Array.isArray(articlesRes?.data) ? articlesRes.data : []).sort((a, b) => b.likes_count - a.likes_count)
      const trendingBooks = (Array.isArray(booksRes?.data) ? booksRes.data : []).sort((a, b) => b.likes_count - a.likes_count)
      const trendingScraps = (Array.isArray(scrapsRes?.data) ? scrapsRes.data : []).sort((a, b) => b.comments_count - a.comments_count)

      setArticles(trendingArticles)
      setBooks(trendingBooks)
      setScraps(trendingScraps)
    } catch (err: any) {
      console.error('トレンドデータ取得エラー:', err)
      setError(err.message || 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const tabItems = [
    { label: '記事', value: 'articles' as const, count: articles.length },
    { label: '本', value: 'books' as const, count: books.length },
    { label: 'スクラップ', value: 'scraps' as const, count: scraps.length }
  ]

  return (
    <PageProvider
      title="トレンド"
      description="今話題の記事・本・スクラップを見つけよう"
    >
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🔥 トレンド</h1>
            <p className="text-gray-600">今話題のコンテンツをチェック</p>
          </div>

          <Tabs items={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 mt-6">
              <h3 className="font-semibold text-red-800 mb-2">エラー</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchTrendingContent}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                再試行
              </button>
            </div>
          )}

          <div className="mt-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">トレンドを読み込み中...</p>
              </div>
            ) : (
              <>
                {activeTab === 'articles' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {articles.length === 0 ? (
                      <div className="col-span-2 text-center py-12">
                        <p className="text-gray-600">記事がありません</p>
                      </div>
                    ) : (
                      articles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={{
                            id: article.id,
                            title: article.title,
                            emoji: article.emoji,
                            content: article.content,
                            author: {
                              id: article.user?.id || '',
                              name: article.user?.display_name || article.user?.username || 'Unknown',
                              username: article.user?.username || 'unknown',
                              avatar: article.user?.avatar_url || '/images/avatar-placeholder.svg',
                              githubUsername: article.user?.github_username
                            },
                            publishedAt: article.published_at || article.created_at,
                            likes: article.likes_count,
                            comments: article.comments_count,
                            tags: article.topics || [],
                            type: article.type as 'tech' | 'idea',
                            slug: article.slug,
                            isLiked: false
                          }}
                        />
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'books' && (
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {books.length === 0 ? (
                      <div className="col-span-4 text-center py-12">
                        <p className="text-gray-600">本がありません</p>
                      </div>
                    ) : (
                      books.map((book) => (
                        <BookCard
                          key={book.id}
                          book={{
                            id: book.id,
                            title: book.title,
                            author: {
                              username: book.user?.username || 'Unknown',
                              name: book.user?.display_name || book.user?.username || 'Unknown',
                              avatar: book.user?.avatar_url || '/images/avatar-placeholder.svg'
                            },
                            coverImage: book.cover_image_url || '/images/book-placeholder.svg',
                            price: book.price || 0,
                            isFree: book.is_free,
                            rating: 4.5,
                            reviews: book.likes_count,
                            publishedAt: book.published_at || book.created_at
                          }}
                        />
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'scraps' && (
                  <div className="space-y-4">
                    {scraps.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600">スクラップがありません</p>
                      </div>
                    ) : (
                      scraps.map((scrap) => (
                        <ScrapCard
                          key={scrap.id}
                          scrap={{
                            id: scrap.id,
                            title: scrap.title,
                            emoji: scrap.emoji,
                            author: {
                              username: scrap.user?.username || 'Unknown',
                              name: scrap.user?.display_name || scrap.user?.username || 'Unknown',
                              avatar: scrap.user?.avatar_url || '/images/avatar-placeholder.svg'
                            },
                            publishedAt: scrap.created_at,
                            comments: scrap.comments_count,
                            isOpen: !scrap.closed,
                            tags: scrap.topics || []
                          }}
                        />
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageProvider>
  )
}