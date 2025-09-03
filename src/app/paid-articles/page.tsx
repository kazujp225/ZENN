'use client'

import { useState } from 'react'
import { PaidArticleCard } from '@/components/monetization/PaidArticleCard'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { PaidArticle } from '@/types/monetization'

// サンプルデータ
const getPaidArticles = (): PaidArticle[] => {
  return [
    {
      id: '1',
      title: 'Next.js 14 完全ガイド - SSR/SSG/ISRを極める',
      emoji: '🚀',
      author: {
        username: 'nextjs_master',
        name: '田中太郎',
        avatar: '/images/avatar-placeholder.svg',
        isVerified: true
      },
      price: 2980,
      currency: 'JPY',
      previewContent: 'Next.js 14の新機能を徹底解説。App RouterからServer Componentsまで、実践的なテクニックを網羅した完全ガイド...',
      publishedAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
      purchaseCount: 234,
      rating: 4.8,
      reviews: 45,
      tags: ['Next.js', 'React', 'TypeScript', 'Web開発'],
      estimatedReadTime: 45,
      isPurchased: false
    },
    {
      id: '2',
      title: 'プロが教えるTypeScript設計パターン',
      emoji: '📘',
      author: {
        username: 'ts_expert',
        name: '佐藤花子',
        avatar: '/images/avatar-placeholder.svg',
        isVerified: true
      },
      price: 3980,
      currency: 'JPY',
      previewContent: '大規模プロジェクトで実証済みのTypeScript設計パターンを解説。型安全性を保ちながら、保守性の高いコードを書く方法...',
      publishedAt: '2025-01-14T10:00:00Z',
      updatedAt: '2025-01-14T10:00:00Z',
      purchaseCount: 189,
      rating: 4.9,
      reviews: 67,
      tags: ['TypeScript', 'デザインパターン', 'アーキテクチャ'],
      estimatedReadTime: 60,
      isPurchased: true
    },
    {
      id: '3',
      title: 'AWS認定ソリューションアーキテクト合格への道',
      emoji: '☁️',
      author: {
        username: 'aws_pro',
        name: '鈴木一郎',
        avatar: '/images/avatar-placeholder.svg',
        isVerified: false
      },
      price: 4980,
      currency: 'JPY',
      previewContent: 'AWS認定ソリューションアーキテクト試験に一発合格するための完全ロードマップ。実際の試験問題を分析し...',
      publishedAt: '2025-01-13T10:00:00Z',
      updatedAt: '2025-01-13T10:00:00Z',
      purchaseCount: 567,
      rating: 4.7,
      reviews: 123,
      tags: ['AWS', '資格', 'クラウド', 'インフラ'],
      estimatedReadTime: 90,
      isPurchased: false
    },
    {
      id: '4',
      title: 'Rustで作る高性能Webアプリケーション',
      emoji: '🦀',
      author: {
        username: 'rust_lover',
        name: '高橋健太',
        avatar: '/images/avatar-placeholder.svg',
        isVerified: true
      },
      price: 3480,
      currency: 'JPY',
      previewContent: 'Rustの安全性と高速性を活かしたWebアプリケーション開発。ActixやRocketを使った実践的な開発手法...',
      publishedAt: '2025-01-12T10:00:00Z',
      updatedAt: '2025-01-12T10:00:00Z',
      purchaseCount: 145,
      rating: 4.6,
      reviews: 34,
      tags: ['Rust', 'Web開発', 'パフォーマンス'],
      estimatedReadTime: 75,
      isPurchased: false
    }
  ]
}

export default function PaidArticlesPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-low' | 'price-high' | 'rating'>('popular')
  const [priceRange, setPriceRange] = useState<'all' | 'under-1000' | '1000-3000' | '3000-5000' | 'over-5000'>('all')
  const [showPurchasedOnly, setShowPurchasedOnly] = useState(false)
  
  const articles = getPaidArticles()
  
  // フィルタリング
  let filteredArticles = articles
  
  if (showPurchasedOnly) {
    filteredArticles = filteredArticles.filter(a => a.isPurchased)
  }
  
  if (priceRange !== 'all') {
    filteredArticles = filteredArticles.filter(a => {
      switch (priceRange) {
        case 'under-1000': return a.price < 1000
        case '1000-3000': return a.price >= 1000 && a.price < 3000
        case '3000-5000': return a.price >= 3000 && a.price < 5000
        case 'over-5000': return a.price >= 5000
        default: return true
      }
    })
  }
  
  // ソート
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      case 'popular':
      default:
        return b.purchaseCount - a.purchaseCount
    }
  })
  
  const tabs = [
    { id: 'all', label: 'すべて' },
    { id: 'trending', label: 'トレンド' },
    { id: 'new', label: '新着' },
    { id: 'purchased', label: '購入済み' }
  ]
  
  return (
    <div className="paid-articles-page">
      <div className="container py-8">
        {/* Header */}
        <div className="paid-articles-header">
          <div className="paid-articles-header__content">
            <h1 className="paid-articles-header__title">
              <span className="paid-articles-header__icon">💎</span>
              有料記事
            </h1>
            <p className="paid-articles-header__description">
              プロフェッショナルが執筆した高品質な技術記事を購入できます
            </p>
          </div>
          <div className="paid-articles-header__actions">
            <Link href="/articles/new?paid=true">
              <Button variant="primary" className="paid-articles-header__button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                有料記事を書く
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="paid-articles-stats">
          <div className="paid-articles-stat">
            <div className="paid-articles-stat__value">1,234</div>
            <div className="paid-articles-stat__label">記事数</div>
          </div>
          <div className="paid-articles-stat">
            <div className="paid-articles-stat__value">456</div>
            <div className="paid-articles-stat__label">執筆者</div>
          </div>
          <div className="paid-articles-stat">
            <div className="paid-articles-stat__value">¥2,980</div>
            <div className="paid-articles-stat__label">平均価格</div>
          </div>
          <div className="paid-articles-stat">
            <div className="paid-articles-stat__value">4.7</div>
            <div className="paid-articles-stat__label">平均評価</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>

        <div className="paid-articles-layout">
          {/* Sidebar */}
          <aside className="paid-articles-sidebar">
            {/* Sort */}
            <div className="paid-articles-filter">
              <h3 className="paid-articles-filter__title">並び順</h3>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="paid-articles-filter__select"
              >
                <option value="popular">人気順</option>
                <option value="newest">新着順</option>
                <option value="rating">評価順</option>
                <option value="price-low">価格が安い順</option>
                <option value="price-high">価格が高い順</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="paid-articles-filter">
              <h3 className="paid-articles-filter__title">価格帯</h3>
              <div className="paid-articles-filter__options">
                <label className="paid-articles-filter__option">
                  <input 
                    type="radio" 
                    name="price" 
                    value="all"
                    checked={priceRange === 'all'}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                  />
                  <span>すべて</span>
                </label>
                <label className="paid-articles-filter__option">
                  <input 
                    type="radio" 
                    name="price" 
                    value="under-1000"
                    checked={priceRange === 'under-1000'}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                  />
                  <span>¥1,000未満</span>
                </label>
                <label className="paid-articles-filter__option">
                  <input 
                    type="radio" 
                    name="price" 
                    value="1000-3000"
                    checked={priceRange === '1000-3000'}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                  />
                  <span>¥1,000 - ¥3,000</span>
                </label>
                <label className="paid-articles-filter__option">
                  <input 
                    type="radio" 
                    name="price" 
                    value="3000-5000"
                    checked={priceRange === '3000-5000'}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                  />
                  <span>¥3,000 - ¥5,000</span>
                </label>
                <label className="paid-articles-filter__option">
                  <input 
                    type="radio" 
                    name="price" 
                    value="over-5000"
                    checked={priceRange === 'over-5000'}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                  />
                  <span>¥5,000以上</span>
                </label>
              </div>
            </div>

            {/* Purchased Only */}
            <div className="paid-articles-filter">
              <label className="paid-articles-filter__checkbox">
                <input 
                  type="checkbox"
                  checked={showPurchasedOnly}
                  onChange={(e) => setShowPurchasedOnly(e.target.checked)}
                />
                <span>購入済みのみ表示</span>
              </label>
            </div>

            {/* Popular Categories */}
            <div className="paid-articles-categories">
              <h3 className="paid-articles-categories__title">人気カテゴリー</h3>
              <div className="paid-articles-categories__list">
                <Link href="/paid-articles?category=nextjs" className="paid-articles-category">
                  <span className="paid-articles-category__emoji">⚡</span>
                  <span className="paid-articles-category__name">Next.js</span>
                  <span className="paid-articles-category__count">123</span>
                </Link>
                <Link href="/paid-articles?category=typescript" className="paid-articles-category">
                  <span className="paid-articles-category__emoji">📘</span>
                  <span className="paid-articles-category__name">TypeScript</span>
                  <span className="paid-articles-category__count">89</span>
                </Link>
                <Link href="/paid-articles?category=aws" className="paid-articles-category">
                  <span className="paid-articles-category__emoji">☁️</span>
                  <span className="paid-articles-category__name">AWS</span>
                  <span className="paid-articles-category__count">67</span>
                </Link>
                <Link href="/paid-articles?category=rust" className="paid-articles-category">
                  <span className="paid-articles-category__emoji">🦀</span>
                  <span className="paid-articles-category__name">Rust</span>
                  <span className="paid-articles-category__count">45</span>
                </Link>
              </div>
            </div>

            {/* Info Box */}
            <div className="paid-articles-info">
              <h3 className="paid-articles-info__title">💡 購入者保護</h3>
              <ul className="paid-articles-info__list">
                <li>購入後7日間の返金保証</li>
                <li>永続的なアクセス権</li>
                <li>アップデート通知</li>
                <li>質問サポート付き</li>
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="paid-articles-main">
            {/* Results Count */}
            <div className="paid-articles-results">
              <span className="paid-articles-results__count">
                {sortedArticles.length}件の記事
              </span>
              {(priceRange !== 'all' || showPurchasedOnly) && (
                <button 
                  onClick={() => {
                    setPriceRange('all')
                    setShowPurchasedOnly(false)
                  }}
                  className="paid-articles-results__clear"
                >
                  フィルターをクリア
                </button>
              )}
            </div>

            {/* Articles Grid */}
            <div className="paid-articles-grid">
              {sortedArticles.map(article => (
                <PaidArticleCard key={article.id} {...article} />
              ))}
            </div>

            {/* Load More */}
            {sortedArticles.length > 0 && (
              <div className="paid-articles-load-more">
                <Button variant="secondary">
                  もっと見る
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}