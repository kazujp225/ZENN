'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface Author {
  username: string
  name: string
  avatar: string
  bio: string
  followersCount: number
}

interface Chapter {
  id: string
  title: string
  free: boolean
  pages: number
}

interface Review {
  id: string
  user: {
    name: string
    avatar: string
  }
  rating: number
  comment: string
  date: string
}

interface BookLayoutProps {
  book: {
    id: string
    title: string
    coverImage: string
    author: Author
    price: number | 'free'
    originalPrice?: number
    likes: number
    publishedAt: string
    updatedAt: string
    description: string
    features: string[]
    chapters: Chapter[]
    totalPages: number
    format: string
    language: string
    isbn?: string
    tags: string[]
    reviews: Review[]
    reviewsCount: number
    averageRating: number
  }
}

export function BookLayout({ book }: BookLayoutProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(book.likes)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [showAllChapters, setShowAllChapters] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const discountPercentage = book.originalPrice && typeof book.price === 'number'
    ? Math.round((1 - book.price / book.originalPrice) * 100)
    : 0

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const displayedChapters = showAllChapters ? book.chapters : book.chapters.slice(0, 5)
  const displayedReviews = showAllReviews ? book.reviews : book.reviews.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* 左側 - カバー画像 */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="aspect-[3/4] w-80 bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform">
                    <img 
                      src={book.coverImage} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {discountPercentage > 0 && (
                    <div className="absolute -top-4 -right-4 bg-red-500 text-white text-lg font-bold rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                      {discountPercentage}%<br />OFF
                    </div>
                  )}
                </div>
              </div>

              {/* 右側 - 書籍情報 */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {book.title}
                  </h1>
                  
                  {/* 著者情報 */}
                  <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur rounded-xl mb-6">
                    <Link href={`/@${book.author.username}`}>
                      <img 
                        src={book.author.avatar} 
                        alt={book.author.name}
                        className="w-14 h-14 rounded-full hover:ring-4 hover:ring-blue-200 transition-all"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link 
                        href={`/@${book.author.username}`}
                        className="text-lg font-semibold hover:text-blue-600 transition-colors"
                      >
                        {book.author.name}
                      </Link>
                      <p className="text-sm text-gray-600">{book.author.bio}</p>
                    </div>
                    <Button variant="secondary" size="small">
                      フォロー
                    </Button>
                  </div>

                  {/* 評価 */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="flex text-2xl">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.round(book.averageRating) ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xl font-bold">{book.averageRating}</span>
                      <span className="text-gray-600">({book.reviewsCount}件のレビュー)</span>
                    </div>
                  </div>

                  {/* 価格と購入ボタン */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    {typeof book.price === 'number' ? (
                      <>
                        <div className="flex items-end gap-3 mb-6">
                          <span className="text-4xl font-bold text-gray-900">
                            ¥{book.price.toLocaleString()}
                          </span>
                          {book.originalPrice && (
                            <>
                              <span className="text-xl text-gray-400 line-through">
                                ¥{book.originalPrice.toLocaleString()}
                              </span>
                              <Badge variant="danger" className="ml-2">
                                {discountPercentage}% OFF
                              </Badge>
                            </>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="primary" size="large" className="font-bold">
                            今すぐ購入
                          </Button>
                          <Button variant="secondary" size="large">
                            試し読み
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-6">
                          <Badge variant="success" className="text-2xl py-3 px-6">
                            無料で読む
                          </Badge>
                        </div>
                        <Button variant="primary" size="large" className="w-full font-bold">
                          今すぐ読む
                        </Button>
                      </>
                    )}
                    
                    {/* アクションボタン */}
                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={handleLike}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                          isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
                        <span className="font-medium">{likesCount}</span>
                      </button>
                      <button 
                        onClick={() => setIsSaved(!isSaved)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                          isSaved ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-xl">{isSaved ? '🔖' : '📑'}</span>
                        <span className="font-medium">保存</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-all">
                        <span className="text-xl">📤</span>
                        <span className="font-medium">共有</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* メインエリア */}
            <div className="lg:col-span-2 space-y-12">
              {/* 内容紹介 */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-3xl">📖</span>
                  内容紹介
                </h2>
                <p className="text-lg leading-relaxed text-gray-700 mb-8">
                  {book.description}
                </p>
                
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  本書の特徴
                </h3>
                <ul className="space-y-3">
                  {book.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 目次 */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-3xl">📚</span>
                  目次
                </h2>
                <div className="space-y-2">
                  {displayedChapters.map((chapter, index) => (
                    <div 
                      key={chapter.id}
                      onClick={() => setSelectedChapter(chapter.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedChapter === chapter.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-400">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <h3 className="font-medium text-lg">{chapter.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              {chapter.free && (
                                <Badge variant="success">無料公開</Badge>
                              )}
                              <span className="text-sm text-gray-500">
                                {chapter.pages}ページ
                              </span>
                            </div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
                {book.chapters.length > 5 && (
                  <button 
                    onClick={() => setShowAllChapters(!showAllChapters)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAllChapters ? '一部を表示' : `すべての章を表示 (${book.chapters.length}章)`}
                  </button>
                )}
              </section>

              {/* レビュー */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span className="text-3xl">⭐</span>
                    レビュー ({book.reviewsCount})
                  </h2>
                  <Button variant="secondary" size="small">
                    レビューを書く
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {displayedReviews.map(review => (
                    <div key={review.id} className="p-5 bg-gray-50 rounded-xl">
                      <div className="flex items-start gap-4">
                        <img 
                          src={review.user.avatar} 
                          alt={review.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold">{review.user.name}</span>
                            <div className="flex text-lg">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <time className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString('ja-JP')}
                            </time>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {book.reviews.length > 3 && (
                  <button 
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="mt-6 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAllReviews ? 'レビューを折りたたむ' : 'すべてのレビューを表示'}
                  </button>
                )}
              </section>
            </div>

            {/* サイドバー */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* 書籍情報 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">書籍情報</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">総ページ数</dt>
                      <dd className="font-medium">{book.totalPages}ページ</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">フォーマット</dt>
                      <dd className="font-medium">電子書籍</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">言語</dt>
                      <dd className="font-medium">日本語</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">公開日</dt>
                      <dd className="font-medium">
                        {new Date(book.publishedAt).toLocaleDateString('ja-JP')}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">最終更新</dt>
                      <dd className="font-medium">
                        {new Date(book.updatedAt).toLocaleDateString('ja-JP')}
                      </dd>
                    </div>
                    {book.isbn && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">ISBN</dt>
                        <dd className="font-medium text-xs">{book.isbn}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* タグ */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">タグ</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map(tag => (
                      <Link 
                        key={tag}
                        href={`/topics/${tag}`}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 購入CTA (モバイル用) */}
                <div className="lg:hidden bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-2">今すぐ読もう！</h3>
                  <p className="text-sm mb-4 opacity-90">
                    知識を深める第一歩を踏み出そう
                  </p>
                  <Button variant="secondary" className="w-full">
                    購入する
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}