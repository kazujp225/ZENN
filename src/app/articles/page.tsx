'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import { articlesApi, topicsApi } from '@/lib/api'
import type { Article, Topic } from '@/lib/api'
import '@/styles/pages/articles.css'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedType, setSelectedType] = useState<'all' | 'tech' | 'idea'>('all')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopics()
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [selectedType, selectedTopic, searchQuery])

  const fetchTopics = async () => {
    try {
      const { data } = await topicsApi.getPopularTopics(10)
      setTopics(data || [])
    } catch (err: any) {
      console.error('トピック取得エラー:', err)
    }
  }

  const fetchArticles = async () => {
    try {
      setLoading(true)
      setError(null)

      let result
      
      if (searchQuery.trim()) {
        result = await articlesApi.searchArticles(searchQuery, 20, 0)
      } else if (selectedTopic !== 'all') {
        result = await articlesApi.getArticlesByTopic(selectedTopic, 20, 0)
      } else {
        result = await articlesApi.getPublishedArticles(20, 0)
      }

      let filteredArticles = result.data || []
      
      // Filter by type if specified
      if (selectedType !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.type === selectedType)
      }

      setArticles(filteredArticles)
    } catch (err: any) {
      console.error('記事取得エラー:', err)
      setError(err.message || '記事の取得に失敗しました')
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

  return (
    <PageProvider>
      <div className="articles-page">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">記事</h1>
            <Link
              href="/new/article"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              記事を書く
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
                  placeholder="記事を検索..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  記事タイプ
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'all' | 'tech' | 'idea')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">すべて</option>
                  <option value="tech">Tech</option>
                  <option value="idea">Idea</option>
                </select>
              </div>

              {/* Topic Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  トピック
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">すべて</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.name}>
                      {topic.display_name || topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">エラー</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchArticles}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                再試行
              </button>
            </div>
          )}

          {/* Articles List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">記事を読み込み中...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">記事が見つかりません</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedTopic !== 'all' || selectedType !== 'all' 
                  ? '検索条件を変更してみてください' 
                  : 'まだ記事がありません。最初の記事を書いてみましょう！'
                }
              </p>
              {!searchQuery && selectedTopic === 'all' && selectedType === 'all' && (
                <Link
                  href="/new/article"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  記事を書く
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => (
                <article key={article.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{article.emoji || '📝'}</div>
                      <div>
                        <Link 
                          href={`/articles/${article.slug}`}
                          className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {article.title}
                        </Link>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <span>@{article.user?.username || 'Unknown'}</span>
                          <span>•</span>
                          <span>{formatDate(article.published_at || article.created_at)}</span>
                          {article.type && (
                            <>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                article.type === 'tech' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {article.type === 'tech' ? 'Tech' : 'Idea'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.content.replace(/^#\s+/, '').replace(/[#*`]/g, '').substring(0, 200)}...
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span>❤️</span>
                        <span>{article.likes_count}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>💬</span>
                        <span>{article.comments_count}</span>
                      </span>
                    </div>
                    
                    {article.topics && (
                      <div className="flex flex-wrap gap-1">
                        {article.topics.slice(0, 3).map((topic) => (
                          <button
                            key={topic}
                            onClick={() => setSelectedTopic(topic)}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageProvider>
  )
}