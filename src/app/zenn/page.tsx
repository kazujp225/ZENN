'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import { ScrapCard } from '@/components/cards/ScrapCard'
import { articlesApi, booksApi, scrapsApi } from '@/lib/api'

export default function ZennPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trendingArticles, setTrendingArticles] = useState<any[]>([])
  const [ideaArticles, setIdeaArticles] = useState<any[]>([])
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([])
  const [recentScraps, setRecentScraps] = useState<any[]>([])

  useEffect(() => {
    fetchAllContent()
  }, [])

  const fetchAllContent = async () => {
    try {
      setLoading(true)
      setError(null)

      // 並列でデータを取得
      const [articlesRes, booksRes, scrapsRes] = await Promise.all([
        articlesApi.getPublishedArticles(10, 0),
        booksApi.getPublishedBooks(4, 0),
        scrapsApi.getOpenScraps(4, 0)
      ])

      // Tech記事とIdea記事を分離
      const techArticles = (articlesRes.data || [])
        .filter((a: any) => a.type === 'tech')
        .sort((a: any, b: any) => b.likes_count - a.likes_count)
        .slice(0, 3)
        .map((article: any) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          emoji: article.emoji || '📝',
          author: {
            id: article.user?.id || '',
            username: article.user?.username || 'unknown',
            name: article.user?.display_name || article.user?.username || 'Unknown',
            avatar: article.user?.avatar_url || '/images/avatar-placeholder.svg'
          },
          publishedAt: article.published_at || article.created_at,
          readTime: `${Math.ceil(article.content.length / 500)}分`,
          likes: article.likes_count,
          comments: article.comments_count,
          type: 'tech' as const,
          tags: article.topics || []
        }))

      const ideaArticlesData = (articlesRes.data || [])
        .filter((a: any) => a.type === 'idea')
        .sort((a: any, b: any) => b.likes_count - a.likes_count)
        .slice(0, 2)
        .map((article: any) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          emoji: article.emoji || '💡',
          author: {
            id: article.user?.id || '',
            username: article.user?.username || 'unknown',
            name: article.user?.display_name || article.user?.username || 'Unknown',
            avatar: article.user?.avatar_url || '/images/avatar-placeholder.svg'
          },
          publishedAt: article.published_at || article.created_at,
          readTime: `${Math.ceil(article.content.length / 500)}分`,
          likes: article.likes_count,
          comments: article.comments_count,
          type: 'idea' as const,
          tags: article.topics || []
        }))

      // 書籍データを整形
      const books = (booksRes.data || []).slice(0, 2).map((book: any) => ({
        id: book.id,
        title: book.title,
        slug: book.slug,
        coverImage: book.cover_image_url || '/images/placeholder.svg',
        author: {
          username: book.user?.username || 'unknown',
          name: book.user?.display_name || book.user?.username || 'Unknown',
          avatar: book.user?.avatar_url || '/images/avatar-placeholder.svg'
        },
        price: book.price || 0,
        likes: book.likes_count,
        publishedAt: book.published_at || book.created_at,
        description: book.description || ''
      }))

      // スクラップデータを整形
      const scraps = (scrapsRes.data || []).slice(0, 2).map((scrap: any) => ({
        id: scrap.id,
        title: scrap.title,
        author: {
          username: scrap.user?.username || 'unknown',
          name: scrap.user?.display_name || scrap.user?.username || 'Unknown',
          avatar: scrap.user?.avatar_url || '/images/avatar-placeholder.svg'
        },
        publishedAt: scrap.created_at,
        updatedAt: scrap.updated_at,
        commentsCount: scrap.comments_count,
        isOpen: !scrap.closed,
        emoji: scrap.emoji || '💭',
        excerpt: scrap.content.substring(0, 150) + '...'
      }))

      setTrendingArticles(techArticles)
      setIdeaArticles(ideaArticlesData)
      setFeaturedBooks(books)
      setRecentScraps(scraps)

    } catch (err: any) {
      console.error('コンテンツ取得エラー:', err)
      setError(err.message || 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="container py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-8">
      {/* イベントバナー */}
      <section className="mb-8 p-6 bg-gray rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">🎉 Zennfes 2025 開催決定！</h2>
            <p className="text-muted">
              エンジニアのための技術カンファレンス。2025年3月15日オンライン開催
            </p>
          </div>
          <Link href="/events/zennfes2025" className="btn btn--primary">
            詳細を見る
          </Link>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-red-800 mb-2">エラー</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tech記事セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📘 Tech</h2>
          <Link href="/trending/tech" className="text-primary hover:underline">
            トレンドをもっと見る →
          </Link>
        </div>
        
        <div className="card-grid">
          {trendingArticles.length > 0 ? (
            trendingArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <div className="text-center col-span-full py-8 text-gray-500">
              Tech記事がありません
            </div>
          )}
        </div>
      </section>

      {/* Ideas記事セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">💡 Ideas</h2>
          <Link href="/trending/ideas" className="text-primary hover:underline">
            トレンドをもっと見る →
          </Link>
        </div>
        
        <div className="card-grid">
          {ideaArticles.length > 0 ? (
            ideaArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <div className="text-center col-span-full py-8 text-gray-500">
              Ideas記事がありません
            </div>
          )}
        </div>
      </section>

      {/* 書籍セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📚 Books</h2>
          <Link href="/books" className="text-primary hover:underline">
            すべての本を見る →
          </Link>
        </div>
        
        <div className="card-grid">
          {featuredBooks.length > 0 ? (
            featuredBooks.map(book => (
              <BookCard key={book.id} {...book} />
            ))
          ) : (
            <div className="text-center col-span-full py-8 text-gray-500">
              書籍がありません
            </div>
          )}
        </div>
      </section>

      {/* スクラップセクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">💭 Scraps</h2>
          <Link href="/scraps" className="text-primary hover:underline">
            すべてのスクラップを見る →
          </Link>
        </div>
        
        <div className="card-grid">
          {recentScraps.length > 0 ? (
            recentScraps.map(scrap => (
              <ScrapCard key={scrap.id} {...scrap} />
            ))
          ) : (
            <div className="text-center col-span-full py-8 text-gray-500">
              スクラップがありません
            </div>
          )}
        </div>
      </section>

      {/* CTAセクション */}
      <section className="text-center py-12 border-t">
        <h2 className="text-3xl font-bold mb-4">
          知識を共有しよう
        </h2>
        <p className="text-lg text-muted mb-8">
          エンジニアのための知識共有プラットフォームで、あなたの経験を共有してみませんか？
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="btn btn--primary">
            無料で始める
          </Link>
          <Link href="/about" className="btn btn--secondary">
            詳しく見る
          </Link>
        </div>
      </section>
    </main>
  )
}