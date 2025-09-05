'use client'

import { useState } from 'react'
import { BookCard } from '@/components/cards/BookCard'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import Link from 'next/link'
import '@/styles/pages/books.css'

// サンプルデータ
const getAllBooks = () => {
  return [
    {
      id: 'book1',
      title: 'ゼロから学ぶReact & Next.js',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'reactmaster',
        name: '田中太郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 2500 as number,
      originalPrice: 3000,
      likes: 89,
      publishedAt: '2025-01-10T10:00:00Z',
      description: 'React初心者からNext.jsマスターまで、段階的に学べる実践的な教科書',
      tags: ['React', 'Next.js', 'TypeScript'],
      totalPages: 484,
      chaptersCount: 10,
      readingTime: '約8時間',
      rating: 4.6,
      reviewsCount: 23
    },
    {
      id: 'book2',
      title: 'TypeScript実践ガイド',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'tsexpert',
        name: '佐藤花子',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 'free' as const,
      likes: 234,
      publishedAt: '2025-01-08T10:00:00Z',
      description: 'TypeScriptの基礎から高度な型プログラミングまで網羅',
      tags: ['TypeScript', 'JavaScript', 'プログラミング'],
      totalPages: 320,
      chaptersCount: 8,
      readingTime: '約5時間',
      rating: 4.8,
      reviewsCount: 45
    },
    {
      id: 'book3',
      title: 'Rustプログラミング入門',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'rustacean',
        name: '鈴木一郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 3200 as number,
      likes: 156,
      publishedAt: '2025-01-05T10:00:00Z',
      description: 'メモリ安全性を保証する次世代システムプログラミング言語',
      tags: ['Rust', 'システムプログラミング', 'パフォーマンス'],
      totalPages: 560,
      chaptersCount: 12,
      readingTime: '約10時間',
      rating: 4.7,
      reviewsCount: 18
    },
    {
      id: 'book4',
      title: 'エンジニアのためのマネジメント入門',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'techmanager',
        name: '山田次郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 'free' as const,
      likes: 412,
      publishedAt: '2025-01-03T10:00:00Z',
      description: 'テックリードからEMまで、エンジニアリングマネジメントの基礎',
      tags: ['マネジメント', 'キャリア', 'リーダーシップ'],
      totalPages: 280,
      chaptersCount: 7,
      readingTime: '約4時間',
      rating: 4.5,
      reviewsCount: 67
    },
    {
      id: 'book5',
      title: 'AWS実践アーキテクチャ設計',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'cloudarchitect',
        name: '高橋健太',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 3800 as number,
      originalPrice: 4500,
      likes: 198,
      publishedAt: '2024-12-28T10:00:00Z',
      description: 'スケーラブルで可用性の高いクラウドシステムの設計手法',
      tags: ['AWS', 'クラウド', 'アーキテクチャ'],
      totalPages: 420,
      chaptersCount: 9,
      readingTime: '約7時間',
      rating: 4.4,
      reviewsCount: 34
    },
    {
      id: 'book6',
      title: 'GraphQL実装パターン',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'graphqlexpert',
        name: '伊藤真理',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 2800 as number,
      likes: 145,
      publishedAt: '2024-12-20T10:00:00Z',
      description: 'REST APIからGraphQLへの移行とベストプラクティス',
      tags: ['GraphQL', 'API', 'Backend'],
      totalPages: 350,
      chaptersCount: 8,
      readingTime: '約6時間',
      rating: 4.3,
      reviewsCount: 21
    }
  ]
}

export default function BooksPage() {
  const [activeTab, setActiveTab] = useState('trending')
  const [sortBy, setSortBy] = useState<'new' | 'popular' | 'price-low' | 'price-high'>('popular')
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const books = getAllBooks()
  
  // フィルタリング
  let filteredBooks = books
  if (priceFilter === 'free') {
    filteredBooks = filteredBooks.filter(b => b.price === 'free')
  } else if (priceFilter === 'paid') {
    filteredBooks = filteredBooks.filter(b => typeof b.price === 'number')
  }
  
  if (selectedTags.length > 0) {
    filteredBooks = filteredBooks.filter(b => 
      selectedTags.some(tag => b.tags.includes(tag))
    )
  }
  
  // ソート
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'new':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      case 'price-low':
        const aPrice = a.price === 'free' ? 0 : a.price
        const bPrice = b.price === 'free' ? 0 : b.price
        return aPrice - bPrice
      case 'price-high':
        const aPriceH = a.price === 'free' ? 0 : a.price
        const bPriceH = b.price === 'free' ? 0 : b.price
        return bPriceH - aPriceH
      case 'popular':
      default:
        return b.likes - a.likes
    }
  })
  
  // 全タグを取得
  const allTags = Array.from(new Set(books.flatMap(b => b.tags)))
  
  return (
    <PageProvider title="本" description="エンジニアが執筆した技術書や実践ガイド">
      <div className="books-page">
        {/* Minimalist Hero Section */}
        <div className="books-hero books-hero--minimal">
          <div className="books-hero__inner">
            <div className="books-hero__main">
              <div className="books-hero__title-wrapper">
                <h1 className="books-hero__title">
                  <span className="books-hero__title-line">
                    <span className="books-hero__title-text">深い知識を、</span>
                  </span>
                  <span className="books-hero__title-line">
                    <span className="books-hero__title-accent">本</span>
                    <span className="books-hero__title-text">で学ぶ。</span>
                  </span>
                </h1>
                <div className="books-hero__title-decoration">
                  <svg width="60" height="4" viewBox="0 0 60 4" fill="none">
                    <rect x="0" y="0" width="20" height="4" rx="2" fill="#8B5CF6" opacity="0.6"/>
                    <rect x="24" y="0" width="12" height="4" rx="2" fill="#8B5CF6" opacity="0.4"/>
                    <rect x="40" y="0" width="20" height="4" rx="2" fill="#8B5CF6" opacity="0.2"/>
                  </svg>
                </div>
              </div>
              <p className="books-hero__description">
                エンジニアが執筆した技術書や実践ガイド。<br />
                体系的な学習で、確かなスキルを身につけましょう。
              </p>
              
              {/* Stats */}
              <div className="books-hero__stats">
                <div className="books-hero__stat">
                  <span className="books-hero__stat-number">486</span>
                  <span className="books-hero__stat-label">公開書籍</span>
                </div>
                <div className="books-hero__stat">
                  <span className="books-hero__stat-number">234</span>
                  <span className="books-hero__stat-label">無料公開</span>
                </div>
                <div className="books-hero__stat">
                  <span className="books-hero__stat-number">4.6</span>
                  <span className="books-hero__stat-label">平均評価</span>
                </div>
                <div className="books-hero__stat">
                  <span className="books-hero__stat-number">156</span>
                  <span className="books-hero__stat-label">執筆者</span>
                </div>
              </div>

              {/* Actions */}
              <div className="books-hero__actions">
                <Link href="/books/explore">
                  <Button variant="primary" className="books-hero__btn books-hero__btn--primary">
                    本を探す
                  </Button>
                </Link>
                <Link href="/new/book">
                  <Button variant="ghost" className="books-hero__btn books-hero__btn--ghost">
                    本を執筆
                  </Button>
                </Link>
              </div>

              {/* Featured Books */}
              <div className="books-hero__featured">
                <Link href="/books/react" className="books-hero__featured-book">
                  <div className="books-hero__featured-cover">⚛️</div>
                  <div className="books-hero__featured-title">React</div>
                </Link>
                <Link href="/books/typescript" className="books-hero__featured-book">
                  <div className="books-hero__featured-cover">🔷</div>
                  <div className="books-hero__featured-title">TypeScript</div>
                </Link>
                <Link href="/books/aws" className="books-hero__featured-book">
                  <div className="books-hero__featured-cover">☁️</div>
                  <div className="books-hero__featured-title">AWS</div>
                </Link>
                <Link href="/books/rust" className="books-hero__featured-book">
                  <div className="books-hero__featured-cover">🦀</div>
                  <div className="books-hero__featured-title">Rust</div>
                </Link>
                <Link href="/books/docker" className="books-hero__featured-book">
                  <div className="books-hero__featured-cover">🐳</div>
                  <div className="books-hero__featured-title">Docker</div>
                </Link>
                <Link href="/books/kubernetes" className="books-hero__featured-book">
                  <div className="books-hero__featured-cover">☸️</div>
                  <div className="books-hero__featured-title">K8s</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Books Section */}
        <div className="books-featured">
          <div className="books-featured__inner">
            <div className="books-featured__header">
              <h2 className="books-featured__title">🏆 今週の人気書籍</h2>
              <p className="books-featured__subtitle">最も読まれている技術書</p>
            </div>
            <div className="books-featured__grid">
              {books.slice(0, 5).map(book => (
                <article key={book.id} className="book-card-enhanced">
                  {book.originalPrice && (
                    <span className="book-card-enhanced__badge book-card-enhanced__badge--sale">
                      SALE
                    </span>
                  )}
                  {book.price === 'free' && (
                    <span className="book-card-enhanced__badge">
                      無料
                    </span>
                  )}
                  <div className="book-card-enhanced__cover">
                    <Link href={`/books/${book.id}`}>
                      📖
                    </Link>
                  </div>
                  <div className="book-card-enhanced__content">
                    <h3 className="book-card-enhanced__title">
                      <Link href={`/books/${book.id}`}>
                        {book.title}
                      </Link>
                    </h3>
                    <div 
                      className="book-card-enhanced__author"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.location.href = `/${book.author.username}`
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={book.author.avatar} alt={book.author.name} className="book-card-enhanced__author-avatar" />
                      <span>{book.author.name}</span>
                    </div>
                      <div className="book-card-enhanced__meta">
                        <span className="book-card-enhanced__pages">
                          📄 {book.totalPages}ページ
                        </span>
                        <span className="book-card-enhanced__rating">
                          <span className="book-card-enhanced__rating-star">⭐</span>
                          {book.rating}
                        </span>
                      </div>
                      <div className="book-card-enhanced__price">
                        {book.price === 'free' ? (
                          <span className="book-card-enhanced__price-current book-card-enhanced__price-current--free">
                            無料
                          </span>
                        ) : (
                          <>
                            <span className="book-card-enhanced__price-current">
                              ¥{book.price.toLocaleString()}
                            </span>
                            {book.originalPrice && (
                              <span className="book-card-enhanced__price-original">
                                ¥{book.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </>
                        )}
                        <span className="book-card-enhanced__likes">
                          ❤️ {book.likes}
                        </span>
                      </div>
                    </div>
                </article>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Layout */}
        <div className="books-layout">
          {/* Sidebar */}
          <aside className="books-sidebar">
            {/* Price Filter */}
            <div className="books-sidebar-section">
              <h3 className="books-sidebar-title">価格</h3>
              <div className="books-price-filters">
                <button 
                  className={`books-price-filter ${priceFilter === 'all' ? 'books-price-filter--active' : ''}`}
                  onClick={() => setPriceFilter('all')}
                >
                  <span className="books-price-filter__label">すべて</span>
                  <span className="books-price-filter__count">{books.length}</span>
                </button>
                <button 
                  className={`books-price-filter ${priceFilter === 'free' ? 'books-price-filter--active' : ''}`}
                  onClick={() => setPriceFilter('free')}
                >
                  <span className="books-price-filter__label">無料</span>
                  <span className="books-price-filter__count">
                    {books.filter(b => b.price === 'free').length}
                  </span>
                </button>
                <button 
                  className={`books-price-filter ${priceFilter === 'paid' ? 'books-price-filter--active' : ''}`}
                  onClick={() => setPriceFilter('paid')}
                >
                  <span className="books-price-filter__label">有料</span>
                  <span className="books-price-filter__count">
                    {books.filter(b => typeof b.price === 'number').length}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Categories */}
            <div className="books-sidebar-section">
              <h3 className="books-sidebar-title">カテゴリー</h3>
              <div className="books-categories">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`books-category-tag ${selectedTags.includes(tag) ? 'books-category-tag--active' : ''}`}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag))
                      } else {
                        setSelectedTags([...selectedTags, tag])
                      }
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Author CTA */}
            <div className="books-author-cta">
              <h3 className="books-author-cta__title">本を執筆しよう</h3>
              <p className="books-author-cta__text">
                あなたの知識を本にまとめて共有しませんか？
              </p>
              <Link href="/new/book">
                <button className="books-author-cta__button">
                  執筆を始める
                </button>
              </Link>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="books-main">
            {/* Filter Bar */}
            <div className="books-filter-bar">
              <div className="books-filter-tabs">
                <button 
                  className={`books-filter-tab ${activeTab === 'trending' ? 'books-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('trending')}
                >
                  トレンド
                </button>
                <button 
                  className={`books-filter-tab ${activeTab === 'new' ? 'books-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('new')}
                >
                  新着
                </button>
                <button 
                  className={`books-filter-tab ${activeTab === 'bestseller' ? 'books-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('bestseller')}
                >
                  ベストセラー
                </button>
              </div>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="books-filter-sort"
              >
                <option value="popular">人気順</option>
                <option value="new">新着順</option>
                <option value="price-low">価格が安い順</option>
                <option value="price-high">価格が高い順</option>
              </select>
            </div>
            
            {/* Results Header */}
            <div className="books-results-header">
              <p className="books-results-count">
                <strong>{sortedBooks.length}</strong> 件の本
                {selectedTags.length > 0 && (
                  <span>（{selectedTags.join(', ')}）</span>
                )}
              </p>
              {(selectedTags.length > 0 || priceFilter !== 'all') && (
                <button 
                  onClick={() => {
                    setSelectedTags([])
                    setPriceFilter('all')
                  }}
                  className="books-clear-filters"
                >
                  フィルターをクリア
                </button>
              )}
            </div>
            
            {/* Books Grid */}
            {sortedBooks.length > 0 ? (
              <div className="books-grid">
                {sortedBooks.map(book => (
                  <article key={book.id} className="book-card-enhanced">
                    {book.originalPrice && (
                      <span className="book-card-enhanced__badge book-card-enhanced__badge--sale">
                        SALE
                      </span>
                    )}
                    {book.price === 'free' && (
                      <span className="book-card-enhanced__badge">
                        無料
                      </span>
                    )}
                    <div className="book-card-enhanced__cover">
                      <Link href={`/books/${book.id}`}>
                        📖
                      </Link>
                    </div>
                    <div className="book-card-enhanced__content">
                      <h3 className="book-card-enhanced__title">
                        <Link href={`/books/${book.id}`}>
                          {book.title}
                        </Link>
                      </h3>
                      <Link href={`/${book.author.username}`} className="book-card-enhanced__author">
                        <img src={book.author.avatar} alt={book.author.name} className="book-card-enhanced__author-avatar" />
                        <span>{book.author.name}</span>
                      </Link>
                        <div className="book-card-enhanced__meta">
                          <span className="book-card-enhanced__pages">
                            📄 {book.totalPages}ページ
                          </span>
                          <span className="book-card-enhanced__rating">
                            <span className="book-card-enhanced__rating-star">⭐</span>
                            {book.rating}
                          </span>
                        </div>
                        <div className="book-card-enhanced__price">
                          {book.price === 'free' ? (
                            <span className="book-card-enhanced__price-current book-card-enhanced__price-current--free">
                              無料
                            </span>
                          ) : (
                            <>
                              <span className="book-card-enhanced__price-current">
                                ¥{book.price.toLocaleString()}
                              </span>
                              {book.originalPrice && (
                                <span className="book-card-enhanced__price-original">
                                  ¥{book.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </>
                          )}
                          <span className="book-card-enhanced__likes">
                            ❤️ {book.likes}
                          </span>
                        </div>
                      </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="books-empty">
                <div className="books-empty__icon">📚</div>
                <h3 className="books-empty__title">
                  本が見つかりませんでした
                </h3>
                <p className="books-empty__text">
                  条件を変更してお試しください
                </p>
                <Button variant="secondary" onClick={() => {
                  setPriceFilter('all')
                  setSelectedTags([])
                }}>
                  フィルターをリセット
                </Button>
              </div>
            )}
            
            {/* Load More */}
            {sortedBooks.length > 0 && (
              <div className="books-load-more">
                <button className="books-load-more__button">
                  もっと見る
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageProvider>
  )
}