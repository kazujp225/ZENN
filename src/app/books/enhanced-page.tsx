'use client'

import { useState, useEffect } from 'react'
import { BookCard } from '@/components/cards/BookCard'
import { Button } from '@/components/ui/Button'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import Link from 'next/link'
import '@/styles/pages/books.css'

// カテゴリデータ
const categories = [
  { id: 'web', name: 'Web開発', emoji: '🌐', color: '#3B82F6', count: 124 },
  { id: 'ai', name: 'AI/機械学習', emoji: '🤖', color: '#8B5CF6', count: 89 },
  { id: 'devops', name: 'DevOps', emoji: '⚙️', color: '#10B981', count: 56 },
  { id: 'mobile', name: 'モバイル', emoji: '📱', color: '#F59E0B', count: 43 },
  { id: 'security', name: 'セキュリティ', emoji: '🔒', color: '#EF4444', count: 31 },
  { id: 'database', name: 'データベース', emoji: '💾', color: '#6366F1', count: 67 },
  { id: 'architecture', name: 'アーキテクチャ', emoji: '🏗️', color: '#EC4899', count: 45 },
  { id: 'management', name: 'マネジメント', emoji: '👔', color: '#14B8A6', count: 28 }
]

// 拡張書籍データ
const getAllBooks = () => {
  return [
    {
      id: 'book1',
      title: 'ゼロから学ぶReact & Next.js 完全ガイド',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'reactmaster',
        name: '田中太郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 2500 as number,
      originalPrice: 3000,
      likes: 892,
      publishedAt: '2025-01-10T10:00:00Z',
      description: 'React初心者からNext.jsマスターまで、段階的に学べる実践的な教科書。最新のApp Routerにも対応。',
      tags: ['React', 'Next.js', 'TypeScript', 'Web開発'],
      totalPages: 484,
      chaptersCount: 12,
      readingTime: '約8時間',
      rating: 4.8,
      reviewsCount: 234,
      difficulty: 'intermediate',
      category: 'web',
      isBestseller: true,
      isNew: true
    },
    {
      id: 'book2',
      title: 'TypeScript実践ガイド - 型安全なコードを書く',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'tsexpert',
        name: '佐藤花子',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 'free' as const,
      likes: 2341,
      publishedAt: '2025-01-08T10:00:00Z',
      description: 'TypeScriptの基礎から高度な型プログラミングまで網羅。実務で使える実践的なテクニックを多数収録。',
      tags: ['TypeScript', 'JavaScript', 'プログラミング'],
      totalPages: 320,
      chaptersCount: 8,
      readingTime: '約5時間',
      rating: 4.9,
      reviewsCount: 456,
      difficulty: 'advanced',
      category: 'web',
      isBestseller: true
    },
    {
      id: 'book3',
      title: 'Rustプログラミング入門 2025年版',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'rustacean',
        name: '鈴木一郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 3200 as number,
      originalPrice: 3800,
      likes: 1567,
      publishedAt: '2025-01-05T10:00:00Z',
      description: 'メモリ安全性を保証する次世代システムプログラミング言語。WebAssemblyとの連携も詳しく解説。',
      tags: ['Rust', 'システムプログラミング', 'WebAssembly'],
      totalPages: 560,
      chaptersCount: 14,
      readingTime: '約10時間',
      rating: 4.7,
      reviewsCount: 189,
      difficulty: 'advanced',
      category: 'web',
      isNew: true
    },
    {
      id: 'book4',
      title: 'エンジニアのためのマネジメント実践術',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'techmanager',
        name: '山田次郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 'free' as const,
      likes: 4123,
      publishedAt: '2025-01-03T10:00:00Z',
      description: 'テックリードからEMまで、エンジニアリングマネジメントの基礎と実践。1on1の進め方も詳しく解説。',
      tags: ['マネジメント', 'キャリア', 'リーダーシップ'],
      totalPages: 280,
      chaptersCount: 9,
      readingTime: '約4時間',
      rating: 4.6,
      reviewsCount: 678,
      difficulty: 'beginner',
      category: 'management',
      isBestseller: true
    },
    {
      id: 'book5',
      title: 'AWS実践アーキテクチャ設計パターン',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'cloudarchitect',
        name: '高橋健太',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 3500 as number,
      likes: 2890,
      publishedAt: '2024-12-28T10:00:00Z',
      description: 'AWSを使った本格的なシステム設計。Well-Architected Frameworkに基づく設計原則を解説。',
      tags: ['AWS', 'クラウド', 'インフラ', 'DevOps'],
      totalPages: 420,
      chaptersCount: 11,
      readingTime: '約7時間',
      rating: 4.8,
      reviewsCount: 345,
      difficulty: 'intermediate',
      category: 'devops'
    },
    {
      id: 'book6',
      title: 'ChatGPT & GitHub Copilot 開発効率化ガイド',
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'aidev',
        name: '伊藤真理',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 'free' as const,
      likes: 5234,
      publishedAt: '2025-01-12T10:00:00Z',
      description: 'AIツールを活用した次世代の開発手法。プロンプトエンジニアリングの基礎から実践まで。',
      tags: ['AI', 'ChatGPT', 'GitHub Copilot', '生産性'],
      totalPages: 240,
      chaptersCount: 7,
      readingTime: '約4時間',
      rating: 4.9,
      reviewsCount: 789,
      difficulty: 'beginner',
      category: 'ai',
      isBestseller: true,
      isNew: true
    }
  ]
}

export default function EnhancedBooksPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest')
  const [showOnlyBestsellers, setShowOnlyBestsellers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const books = getAllBooks()
  
  // フィルタリング
  let filteredBooks = books
  
  // 価格フィルター
  if (priceFilter === 'free') {
    filteredBooks = filteredBooks.filter(b => b.price === 'free')
  } else if (priceFilter === 'paid') {
    filteredBooks = filteredBooks.filter(b => b.price !== 'free')
  }
  
  // カテゴリフィルター
  if (selectedCategories.length > 0) {
    filteredBooks = filteredBooks.filter(b => 
      selectedCategories.includes(b.category)
    )
  }
  
  // ベストセラーフィルター
  if (showOnlyBestsellers) {
    filteredBooks = filteredBooks.filter(b => b.isBestseller)
  }
  
  // 検索フィルター
  if (searchQuery) {
    filteredBooks = filteredBooks.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }
  
  // ソート
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      case 'popular':
        return b.likes - a.likes
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })
  
  // 統計データ
  const stats = {
    totalBooks: books.length,
    freeBooks: books.filter(b => b.price === 'free').length,
    avgRating: (books.reduce((acc, b) => acc + b.rating, 0) / books.length).toFixed(1),
    totalReviews: books.reduce((acc, b) => acc + b.reviewsCount, 0)
  }
  
  return (
    <PageProvider title="本" description="エンジニアが執筆した技術書">
      <div className="books-page">
        {/* Enhanced Hero Section */}
        <div className="books-hero books-hero--minimal">
          <div className="books-hero__inner">
            <div className="books-hero__main">
              <div className="books-hero__title-wrapper">
                <h1 className="books-hero__title">
                  <span className="books-hero__title-line">
                    <span className="books-hero__title-text">エンジニアの</span>
                    <span className="books-hero__title-accent">知識</span>
                    <span className="books-hero__title-text">を</span>
                  </span>
                  <span className="books-hero__title-line">
                    <span className="books-hero__title-text">体系的に深める</span>
                    <span className="books-hero__title-accent">📚</span>
                  </span>
                </h1>
                <div className="books-hero__title-decoration">
                  <svg width="80" height="4" viewBox="0 0 80 4" fill="none">
                    <rect x="0" y="0" width="30" height="4" rx="2" fill="#8B5CF6" opacity="0.8"/>
                    <rect x="34" y="0" width="16" height="4" rx="2" fill="#8B5CF6" opacity="0.5"/>
                    <rect x="54" y="0" width="26" height="4" rx="2" fill="#8B5CF6" opacity="0.3"/>
                  </svg>
                </div>
              </div>
              
              <p className="books-hero__description">
                現役エンジニアが執筆した実践的な技術書で<br />
                最新のテクノロジーを効率的に学習しましょう
              </p>
              
              {/* Enhanced Stats */}
              <div className="books-hero__stats">
                <div className="books-hero__stat">
                  <span className="books-hero__stat-number">{stats.totalBooks.toLocaleString()}</span>
                  <span className="books-hero__stat-label">技術書</span>
                </div>
                <div className="books-hero__stat">
                  <span className="books-hero__stat-number">{stats.freeBooks}</span>
                  <span className="books-hero__stat-label">無料公開</span>
                </div>
                <div className="books-hero__stat">
                  <span className="books-hero__stat-number">⭐{stats.avgRating}</span>
                  <span className="books-hero__stat-label">平均評価</span>
                </div>
                <div className="books-hero__stat">
                  <span className="books-hero__stat-number">{(stats.totalReviews / 1000).toFixed(1)}K</span>
                  <span className="books-hero__stat-label">レビュー</span>
                </div>
              </div>
              
              {/* Quick Search */}
              <div style={{
                marginBottom: '2rem',
                maxWidth: '500px',
                margin: '0 auto 2rem'
              }}>
                <div style={{
                  position: 'relative',
                  animation: 'fadeInUp 0.6s ease 0.5s both'
                }}>
                  <input
                    type="text"
                    placeholder="タイトル、著者、タグで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 48px 12px 20px',
                      fontSize: '0.95rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '30px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8B5CF6'
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    style={{
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '8px',
                      background: '#8B5CF6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    🔍
                  </button>
                </div>
              </div>
              
              {/* Category Pills */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center',
                marginBottom: '2rem',
                animation: 'fadeInUp 0.6s ease 0.6s both'
              }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategories(
                        selectedCategories.includes(cat.id)
                          ? selectedCategories.filter(c => c !== cat.id)
                          : [...selectedCategories, cat.id]
                      )
                    }}
                    style={{
                      padding: '10px 20px',
                      background: selectedCategories.includes(cat.id) ? cat.color : 'white',
                      color: selectedCategories.includes(cat.id) ? 'white' : '#4B5563',
                      border: `2px solid ${selectedCategories.includes(cat.id) ? cat.color : '#E5E7EB'}`,
                      borderRadius: '25px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transform: selectedCategories.includes(cat.id) ? 'scale(1.05)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedCategories.includes(cat.id)) {
                        e.currentTarget.style.borderColor = cat.color
                        e.currentTarget.style.background = `${cat.color}10`
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedCategories.includes(cat.id)) {
                        e.currentTarget.style.borderColor = '#E5E7EB'
                        e.currentTarget.style.background = 'white'
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{cat.emoji}</span>
                    <span>{cat.name}</span>
                    <span style={{
                      background: selectedCategories.includes(cat.id) ? 'rgba(255,255,255,0.3)' : '#F3F4F6',
                      padding: '2px 6px',
                      borderRadius: '12px',
                      fontSize: '0.75rem'
                    }}>{cat.count}</span>
                  </button>
                ))}
              </div>
              
              {/* CTAs */}
              <div className="books-hero__actions">
                <Link href="/books/trending">
                  <Button variant="primary" className="books-hero__btn books-hero__btn--primary">
                    <span>🔥</span>
                    トレンドを見る
                  </Button>
                </Link>
                <Link href="/new/book">
                  <Button variant="ghost" className="books-hero__btn books-hero__btn--ghost">
                    <span>✍️</span>
                    本を執筆する
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Layout */}
        <div className="books-layout">
          {/* Enhanced Sidebar */}
          <aside className="books-sidebar">
            {/* Price Filter */}
            <div className="books-sidebar-section">
              <h3 className="books-sidebar-title">💰 価格</h3>
              <div className="books-price-filters">
                {[
                  { value: 'all', label: 'すべて', icon: '📚', count: books.length },
                  { value: 'free', label: '無料', icon: '🎁', count: stats.freeBooks },
                  { value: 'paid', label: '有料', icon: '💳', count: books.length - stats.freeBooks }
                ].map(option => (
                  <button
                    key={option.value}
                    className={`books-price-filter ${priceFilter === option.value ? 'books-price-filter--active' : ''}`}
                    onClick={() => setPriceFilter(option.value as any)}
                  >
                    <span className="books-price-filter__label">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </span>
                    <span className="books-price-filter__count">{option.count}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Difficulty Filter */}
            <div className="books-sidebar-section">
              <h3 className="books-sidebar-title">📊 難易度</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { level: 'beginner', label: '初級', color: '#10B981', emoji: '🌱' },
                  { level: 'intermediate', label: '中級', color: '#F59E0B', emoji: '🌿' },
                  { level: 'advanced', label: '上級', color: '#EF4444', emoji: '🌳' }
                ].map(level => (
                  <label key={level.level} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'background 0.2s'
                  }}>
                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                    <span>{level.emoji}</span>
                    <span style={{ flex: 1, fontSize: '0.875rem', color: '#4B5563' }}>{level.label}</span>
                    <div style={{
                      width: '40px',
                      height: '4px',
                      background: level.color,
                      borderRadius: '2px',
                      opacity: 0.5
                    }} />
                  </label>
                ))}
              </div>
            </div>
            
            {/* Special Filters */}
            <div className="books-sidebar-section">
              <h3 className="books-sidebar-title">✨ 特集</h3>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '10px',
                background: showOnlyBestsellers ? '#FEF3C7' : '#FAFBFC',
                borderRadius: '8px',
                border: showOnlyBestsellers ? '2px solid #FCD34D' : '2px solid transparent',
                transition: 'all 0.2s'
              }}>
                <input
                  type="checkbox"
                  checked={showOnlyBestsellers}
                  onChange={(e) => setShowOnlyBestsellers(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>🏆</span>
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: '500' }}>
                  ベストセラーのみ
                </span>
              </label>
            </div>
            
            {/* Author CTA */}
            <div className="books-author-cta">
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✍️</div>
              <h3 className="books-author-cta__title">本を書いてみませんか？</h3>
              <p className="books-author-cta__text">
                あなたの知識を共有して、エンジニアコミュニティに貢献しましょう
              </p>
              <Link href="/new/book">
                <button className="books-author-cta__button">執筆を始める</button>
              </Link>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="books-main">
            {/* Enhanced Filter Bar */}
            <div className="books-filter-bar">
              <div className="books-filter-tabs">
                <button
                  className={`books-filter-tab ${sortBy === 'newest' ? 'books-filter-tab--active' : ''}`}
                  onClick={() => setSortBy('newest')}
                >
                  🆕 新着順
                </button>
                <button
                  className={`books-filter-tab ${sortBy === 'popular' ? 'books-filter-tab--active' : ''}`}
                  onClick={() => setSortBy('popular')}
                >
                  🔥 人気順
                </button>
                <button
                  className={`books-filter-tab ${sortBy === 'rating' ? 'books-filter-tab--active' : ''}`}
                  onClick={() => setSortBy('rating')}
                >
                  ⭐ 評価順
                </button>
              </div>
              
              {(selectedCategories.length > 0 || priceFilter !== 'all' || showOnlyBestsellers) && (
                <button
                  onClick={() => {
                    setSelectedCategories([])
                    setPriceFilter('all')
                    setShowOnlyBestsellers(false)
                  }}
                  className="books-clear-filters"
                >
                  フィルターをクリア
                </button>
              )}
            </div>
            
            {/* Results Header */}
            <div className="books-results-header">
              <p className="books-results-count">
                <strong>{sortedBooks.length}</strong> 件の書籍
                {searchQuery && <span>（「{searchQuery}」の検索結果）</span>}
              </p>
            </div>
            
            {/* Enhanced Book Grid */}
            {sortedBooks.length > 0 ? (
              <div className="books-grid">
                {sortedBooks.map(book => (
                  <article key={book.id} className="book-card-enhanced">
                    {/* Badges */}
                    {book.isBestseller && (
                      <span className="book-card-enhanced__badge" style={{ background: '#FCD34D', color: '#92400E' }}>
                        🏆 ベストセラー
                      </span>
                    )}
                    {book.isNew && (
                      <span className="book-card-enhanced__badge" style={{ background: '#34D399', right: 'auto', left: '12px' }}>
                        NEW
                      </span>
                    )}
                    {book.originalPrice && (
                      <span className="book-card-enhanced__badge book-card-enhanced__badge--sale">
                        SALE
                      </span>
                    )}
                    {book.price === 'free' && !book.isBestseller && (
                      <span className="book-card-enhanced__badge">
                        無料
                      </span>
                    )}
                    
                    <div className="book-card-enhanced__cover">
                      <Link href={`/books/${book.id}`}>
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '4rem',
                          background: `linear-gradient(135deg, ${categories.find(c => c.id === book.category)?.color}20, ${categories.find(c => c.id === book.category)?.color}40)`
                        }}>
                          {categories.find(c => c.id === book.category)?.emoji || '📚'}
                        </div>
                      </Link>
                    </div>
                    
                    <div className="book-card-enhanced__content">
                      <h3 className="book-card-enhanced__title">
                        <Link href={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>({book.reviewsCount})</span>
                        </span>
                      </div>
                      
                      {/* Tags */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        marginBottom: '12px'
                      }}>
                        {book.tags.slice(0, 2).map(tag => (
                          <span key={tag} style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            background: '#F3F4F6',
                            color: '#6B7280',
                            borderRadius: '4px'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="book-card-enhanced__price">
                        {book.price === 'free' ? (
                          <span className="book-card-enhanced__price-current book-card-enhanced__price-current--free">
                            無料で読む
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
                          ❤️ {book.likes.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="books-empty">
                <div className="books-empty__icon">📚</div>
                <h3 className="books-empty__title">該当する書籍が見つかりませんでした</h3>
                <p className="books-empty__text">
                  検索条件を変更してお試しください
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategories([])
                    setPriceFilter('all')
                    setShowOnlyBestsellers(false)
                  }}
                >
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