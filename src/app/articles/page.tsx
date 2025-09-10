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
      const data = await topicsApi.getPopularTopics(10)
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
          {/* Modern Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 記事</h1>
                <p className="text-gray-600">技術記事とアイデアを探索しよう</p>
              </div>
              <Link
                href="/new/article"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                記事を書く
              </Link>
            </div>

            {/* Modern Filter Section */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search with Icon */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  検索
                </label>
                <div className="relative">
                  <svg 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="キーワードで検索..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Type Filter with Custom Dropdown Styling */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  記事タイプ
                </label>
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as 'all' | 'tech' | 'idea')}
                    className="w-full appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="all">🔍 すべてのタイプ</option>
                    <option value="tech">💻 Tech記事</option>
                    <option value="idea">💡 Ideaノート</option>
                  </select>
                  <svg 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Topic Filter with Custom Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  トピック
                </label>
                <div className="relative">
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="all">🏷️ すべてのトピック</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.name}>
                        {topic.display_name || topic.name}
                      </option>
                    ))}
                  </select>
                  <svg 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedType !== 'all' || selectedTopic !== 'all' || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">フィルター:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                    検索: {searchQuery}
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                    タイプ: {selectedType === 'tech' ? 'Tech' : 'Idea'}
                    <button 
                      onClick={() => setSelectedType('all')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedTopic !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                    トピック: {topics.find(t => t.name === selectedTopic)?.display_name || selectedTopic}
                    <button 
                      onClick={() => setSelectedTopic('all')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button 
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedType('all')
                    setSelectedTopic('all')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 ml-2"
                >
                  すべてクリア
                </button>
              </div>
            )}
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
                        {article.topics.slice(0, 3).map((topic: any) => (
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