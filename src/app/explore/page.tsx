'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tabs } from '@/components/ui/Tabs'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import { ScrapCard } from '@/components/cards/ScrapCard'
import { Chip } from '@/components/ui/Chip'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import { Button } from '@/components/ui/Button'
import { articlesApi, booksApi, scrapsApi, topicsApi } from '@/lib/api'
import type { Article, Book, Scrap, Topic } from '@/lib/api'

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'articles' | 'books' | 'scraps'>('articles')
  const [articles, setArticles] = useState<Article[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [scraps, setScraps] = useState<Scrap[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllData()
    fetchTopics()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [articlesRes, booksRes, scrapsRes] = await Promise.all([
        articlesApi.getPublishedArticles(20, 0),
        booksApi.getPublishedBooks(20, 0),
        scrapsApi.getScraps(20, 0)
      ])

      setArticles(Array.isArray(articlesRes?.data) ? articlesRes.data : [])
      setBooks(Array.isArray(booksRes?.data) ? booksRes.data : [])
      setScraps(Array.isArray(scrapsRes?.data) ? scrapsRes.data : [])
    } catch (err: any) {
      console.error('データ取得エラー:', err)
      setError(err.message || 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchTopics = async () => {
    try {
      const response = await topicsApi.getPopularTopics(20)
      if (response && response.data) {
        setTopics(response.data)
      } else {
        setTopics([])
      }
    } catch (err: any) {
      console.error('トピック取得エラー:', err)
      setTopics([])
    }
  }

  const handleTopicFilter = async (topic: string) => {
    setSelectedTopic(topic === selectedTopic ? null : topic)
    setLoading(true)
    
    try {
      if (topic === selectedTopic) {
        // トピックフィルタを解除
        await fetchAllData()
      } else {
        // トピックでフィルタ
        const filteredArticles = await articlesApi.getArticlesByTopic(topic, 20, 0)
        setArticles(Array.isArray(filteredArticles?.data) ? filteredArticles.data : [])
      }
    } catch (err: any) {
      console.error('フィルタエラー:', err)
    } finally {
      setLoading(false)
    }
  }

  const tabItems = [
    { label: '記事', value: 'articles' as const, count: articles.length },
    { label: '本', value: 'books' as const, count: books.length },
    { label: 'スクラップ', value: 'scraps' as const, count: scraps.length }
  ]

  if (error && !loading) {
    return (
      <PageProvider>
        <div className="explore-page">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchAllData}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      </PageProvider>
    )
  }

  return (
    <PageProvider>
      <div className="explore-page">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">エクスプローラ</h1>
            <p className="text-gray-600">
              記事、本、スクラップから興味のあるコンテンツを探そう
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* トピックフィルタ */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">人気のトピック</h3>
            <div className="flex flex-wrap gap-2">
              {topics && topics.length > 0 ? (
                topics.slice(0, 10).map((topic) => (
                  <Chip
                    key={topic.id}
                    label={topic.display_name || topic.name}
                    selected={selectedTopic === topic.name}
                    onClick={() => handleTopicFilter(topic.name)}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-sm">トピックを読み込み中...</p>
              )}
            </div>
          </div>

          {/* タブ */}
          <Tabs tabs={tabItems.map(item => ({ 
            id: item.value, 
            label: `${item.label} (${item.count})` 
          }))} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* コンテンツ */}
          <div className="mt-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">コンテンツを読み込み中...</p>
              </div>
            ) : (
              <>
                {/* 記事 */}
                {activeTab === 'articles' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {articles.length === 0 ? (
                      <div className="col-span-2 text-center py-12">
                        <p className="text-gray-600">記事が見つかりません</p>
                      </div>
                    ) : (
                      articles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={{
                            id: article.id,
                            title: article.title,
                            emoji: article.emoji,
                            author: {
                              username: article.user?.username || 'Unknown',
                              name: article.user?.display_name || article.user?.username || 'Unknown',
                              avatar: article.user?.avatar_url || '/images/avatar-placeholder.svg'
                            },
                            publishedAt: article.published_at || article.created_at,
                            likes: article.likes_count,
                            comments: article.comments_count,
                            type: article.type as 'tech' | 'idea',
                            tags: article.topics || []
                          }}
                        />
                      ))
                    )}
                  </div>
                )}

                {/* 本 */}
                {activeTab === 'books' && (
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {books.length === 0 ? (
                      <div className="col-span-4 text-center py-12">
                        <p className="text-gray-600">本が見つかりません</p>
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

                {/* スクラップ */}
                {activeTab === 'scraps' && (
                  <div className="space-y-4">
                    {scraps.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600">スクラップが見つかりません</p>
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
                            tags: []
                          }}
                        />
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* もっと見る */}
          {!loading && (
            <div className="mt-12 text-center">
              <Button variant="secondary" size="lg">
                もっと見る
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageProvider>
  )
}