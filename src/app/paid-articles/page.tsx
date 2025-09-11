'use client'

import { useState, useEffect } from 'react'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import { articlesApi } from '@/lib/api'
import type { Article } from '@/lib/api'

export default function PaidArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'price'>('popular')

  useEffect(() => {
    fetchPaidArticles()
  }, [sortBy])

  const fetchPaidArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 有料記事の取得（現在は通常の記事を取得してフィルタリング）
      const { data } = await articlesApi.getPublishedArticles(20, 0)
      
      // 仮の有料記事フラグを追加（実際はAPIで判定）
      let paidArticles = (data || []).map((article, index) => ({
        ...article,
        price: index % 3 === 0 ? 500 : index % 3 === 1 ? 300 : 100
      }))
      
      // ソート
      if (sortBy === 'popular') {
        paidArticles = paidArticles.sort((a, b) => b.likes_count - a.likes_count)
      } else if (sortBy === 'recent') {
        paidArticles = paidArticles.sort((a, b) => 
          new Date(b.published_at || b.created_at).getTime() - 
          new Date(a.published_at || a.created_at).getTime()
        )
      } else if (sortBy === 'price') {
        paidArticles = paidArticles.sort((a, b) => (b.price || 0) - (a.price || 0))
      }
      
      setArticles(paidArticles)
    } catch (err: any) {
      // エラーログ削除（セキュリティ対応）
      setError(err.message || '記事の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageProvider title="有料記事" description="プレミアムコンテンツを見つけよう">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">💰 有料記事</h1>
            <p className="text-gray-600">専門的な知識や詳細な解説が含まれるプレミアムコンテンツ</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">並び順:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popular">人気順</option>
                  <option value="recent">新着順</option>
                  <option value="price">価格順</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {articles.length}件の有料記事
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">エラー</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchPaidArticles}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                再試行
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">記事を読み込み中...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">有料記事がありません</h3>
              <p className="text-gray-600">現在、有料記事は公開されていません。</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {articles.map((article: any) => (
                <div key={article.id} className="relative">
                  <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ¥{article.price}
                  </div>
                  <ArticleCard
                    article={{
                      id: article.id,
                      title: article.title,
                      emoji: article.emoji,
                      content: article.content,
                      author: {
                        id: article.user?.id || '',
                        name: article.user?.display_name || article.user?.username || 'Unknown',
                        username: article.user?.username || 'unknown',
                        avatar: article.user?.avatar_url || '/images/avatar-placeholder.svg'
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageProvider>
  )
}
