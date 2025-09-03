'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import '@/styles/pages/articles.css'

// サンプルデータ（実際はAPIから取得）
const getAllArticles = () => {
  return [
    {
      id: '1',
      title: 'Next.js 14の新機能まとめ - App Routerの進化',
      emoji: '🚀',
      author: {
        username: 'developer1',
        name: '田中太郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-15T10:00:00Z',
      likes: 234,
      comments: 12,
      type: 'tech' as const,
      tags: ['Next.js', 'React', 'TypeScript']
    },
    {
      id: '2',
      title: 'TypeScriptの型パズルを解く - 高度な型プログラミング入門',
      emoji: '🧩',
      author: {
        username: 'tsexpert',
        name: '佐藤花子',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-14T15:30:00Z',
      likes: 189,
      comments: 8,
      type: 'tech' as const,
      tags: ['TypeScript', 'JavaScript']
    },
    {
      id: '3',
      title: 'Rustで作る高速Webサーバー - パフォーマンス最適化のコツ',
      emoji: '🦀',
      author: {
        username: 'rustacean',
        name: '鈴木一郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-13T09:00:00Z',
      likes: 156,
      comments: 5,
      type: 'tech' as const,
      tags: ['Rust', 'Backend', 'Performance']
    },
    {
      id: '4',
      title: 'エンジニアのキャリア戦略 - 市場価値を高める5つの方法',
      emoji: '💡',
      author: {
        username: 'careercoach',
        name: '山田次郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-12T14:00:00Z',
      likes: 312,
      comments: 24,
      type: 'idea' as const,
      tags: ['Career', 'Skills']
    },
    {
      id: '5',
      title: 'リモートワークで生産性を2倍にする環境構築',
      emoji: '🏠',
      author: {
        username: 'remoteworker',
        name: '高橋美咲',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-11T11:00:00Z',
      likes: 278,
      comments: 19,
      type: 'idea' as const,
      tags: ['Remote', 'Productivity']
    },
    {
      id: '6',
      title: 'React Server Components完全理解',
      emoji: '⚛️',
      author: {
        username: 'reactdev',
        name: '伊藤健太',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-10T08:00:00Z',
      likes: 198,
      comments: 15,
      type: 'tech' as const,
      tags: ['React', 'RSC', 'Next.js']
    },
    {
      id: '7',
      title: 'GitHub Actions実践ガイド - CI/CD自動化のベストプラクティス',
      emoji: '🤖',
      author: {
        username: 'devops_engineer',
        name: '渡辺真理',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-09T13:00:00Z',
      likes: 167,
      comments: 9,
      type: 'tech' as const,
      tags: ['GitHub', 'CI/CD', 'DevOps']
    },
    {
      id: '8',
      title: 'エンジニアの時間管理術 - タイムボクシングで効率化',
      emoji: '⏰',
      author: {
        username: 'productivity_hacker',
        name: '中村優',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-08T10:00:00Z',
      likes: 245,
      comments: 18,
      type: 'idea' as const,
      tags: ['Productivity', 'TimeManagement']
    }
  ]
}

export default function ArticlesPage() {
  const [activeTab, setActiveTab] = useState('trending')
  const [sortBy, setSortBy] = useState<'new' | 'trending' | 'popular'>('trending')
  const [filterType, setFilterType] = useState<'all' | 'tech' | 'idea'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const articles = getAllArticles()
  
  // フィルタリング
  let filteredArticles = articles
  if (filterType !== 'all') {
    filteredArticles = filteredArticles.filter(a => a.type === filterType)
  }
  if (selectedTags.length > 0) {
    filteredArticles = filteredArticles.filter(a => 
      selectedTags.some(tag => a.tags.includes(tag))
    )
  }
  
  // ソート
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'new':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      case 'popular':
        return b.likes - a.likes
      case 'trending':
      default:
        // トレンドは likes * 時間による重み付け
        const aScore = a.likes / (Date.now() - new Date(a.publishedAt).getTime())
        const bScore = b.likes / (Date.now() - new Date(b.publishedAt).getTime())
        return bScore - aScore
    }
  })
  
  // 全タグを取得
  const allTags = Array.from(new Set(articles.flatMap(a => a.tags)))
  
  const tabs = [
    { id: 'trending', label: 'トレンド' },
    { id: 'new', label: '新着' },
    { id: 'following', label: 'フォロー中' }
  ]
  
  return (
    <PageProvider title="記事" description="エンジニアによる技術記事とアイデア">
      <div className="articles-page">
        {/* Minimalist Hero Section */}
        <div className="articles-hero articles-hero--minimal">
          <div className="articles-hero__inner">
            <div className="articles-hero__main">
              <div className="articles-hero__title-wrapper">
                <h1 className="articles-hero__title">
                  <span className="articles-hero__title-line">
                    <span className="articles-hero__title-text">知識を共有し、</span>
                  </span>
                  <span className="articles-hero__title-line">
                    <span className="articles-hero__title-accent">成長</span>
                    <span className="articles-hero__title-text">を加速する。</span>
                  </span>
                </h1>
                <div className="articles-hero__title-decoration">
                  <svg width="60" height="4" viewBox="0 0 60 4" fill="none">
                    <rect x="0" y="0" width="20" height="4" rx="2" fill="#3B82F6" opacity="0.6"/>
                    <rect x="24" y="0" width="12" height="4" rx="2" fill="#3B82F6" opacity="0.4"/>
                    <rect x="40" y="0" width="20" height="4" rx="2" fill="#3B82F6" opacity="0.2"/>
                  </svg>
                </div>
              </div>
              <p className="articles-hero__description">
                エンジニアが投稿した技術記事やアイデアを探索。<br />
                最新のトレンドから実践的なノウハウまで。
              </p>
              
              {/* Search Bar */}
              <div className="articles-hero__search">
                <div className="articles-hero__search-wrapper">
                  <svg className="articles-hero__search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="記事を検索..."
                    className="articles-hero__search-input"
                  />
                  <button className="articles-hero__search-button">
                    検索
                  </button>
                </div>
              </div>
              
              {/* Stats */}
              <div className="articles-hero__stats">
                <div className="articles-hero__stat">
                  <span className="articles-hero__stat-number">12,450</span>
                  <span className="articles-hero__stat-label">記事</span>
                </div>
                <div className="articles-hero__stat">
                  <span className="articles-hero__stat-number">3,280</span>
                  <span className="articles-hero__stat-label">著者</span>
                </div>
                <div className="articles-hero__stat">
                  <span className="articles-hero__stat-number">156</span>
                  <span className="articles-hero__stat-label">今日の投稿</span>
                </div>
              </div>

              {/* Popular Tags */}
              <div className="articles-hero__tags">
                <Link href="/articles?tag=react" className="articles-hero__tag">
                  <span className="articles-hero__tag-icon">⚛️</span>
                  React
                </Link>
                <Link href="/articles?tag=typescript" className="articles-hero__tag">
                  <span className="articles-hero__tag-icon">🔷</span>
                  TypeScript
                </Link>
                <Link href="/articles?tag=nextjs" className="articles-hero__tag">
                  <span className="articles-hero__tag-icon">▲</span>
                  Next.js
                </Link>
                <Link href="/articles?tag=rust" className="articles-hero__tag">
                  <span className="articles-hero__tag-icon">🦀</span>
                  Rust
                </Link>
                <Link href="/articles?tag=aws" className="articles-hero__tag">
                  <span className="articles-hero__tag-icon">☁️</span>
                  AWS
                </Link>
                <Link href="/articles?tag=docker" className="articles-hero__tag">
                  <span className="articles-hero__tag-icon">🐳</span>
                  Docker
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="articles-filter-bar">
          <div className="articles-filter-bar__inner">
            <div className="articles-filter-bar__content">
              <div className="articles-filter-tabs">
                <button 
                  className={`articles-filter-tab ${activeTab === 'trending' ? 'articles-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('trending')}
                >
                  🔥 トレンド
                </button>
                <button 
                  className={`articles-filter-tab ${activeTab === 'new' ? 'articles-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('new')}
                >
                  🆕 新着
                </button>
                <button 
                  className={`articles-filter-tab ${activeTab === 'following' ? 'articles-filter-tab--active' : ''}`}
                  onClick={() => setActiveTab('following')}
                >
                  👥 フォロー中
                </button>
              </div>
              
              <div className="articles-filter-options">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="articles-filter-select"
                >
                  <option value="trending">トレンド順</option>
                  <option value="new">新着順</option>
                  <option value="popular">人気順</option>
                </select>
                
                <div className="articles-filter-view">
                  <button className="articles-filter-view-btn articles-filter-view-btn--active">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </button>
                  <button className="articles-filter-view-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor"/>
                      <rect x="2" y="7" width="12" height="2" rx="1" fill="currentColor"/>
                      <rect x="2" y="11" width="12" height="2" rx="1" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Layout */}
        <div className="articles-layout">
          {/* Sidebar */}
          <aside className="articles-sidebar">
            {/* Categories */}
            <div className="articles-sidebar-section">
              <h3 className="articles-sidebar-title">カテゴリー</h3>
              <div className="articles-categories">
                <button 
                  className={`articles-category ${filterType === 'all' ? 'articles-category--active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  <span className="articles-category__label">
                    <span className="articles-category__icon">📦</span>
                    すべて
                  </span>
                  <span className="articles-category__count">12.4k</span>
                </button>
                <button 
                  className={`articles-category ${filterType === 'tech' ? 'articles-category--active' : ''}`}
                  onClick={() => setFilterType('tech')}
                >
                  <span className="articles-category__label">
                    <span className="articles-category__icon">📘</span>
                    Tech
                  </span>
                  <span className="articles-category__count">8.2k</span>
                </button>
                <button 
                  className={`articles-category ${filterType === 'idea' ? 'articles-category--active' : ''}`}
                  onClick={() => setFilterType('idea')}
                >
                  <span className="articles-category__label">
                    <span className="articles-category__icon">💡</span>
                    Idea
                  </span>
                  <span className="articles-category__count">4.2k</span>
                </button>
              </div>
            </div>
            
            {/* Popular Tags */}
            <div className="articles-sidebar-section">
              <h3 className="articles-sidebar-title">人気タグ</h3>
              <div className="articles-popular-tags">
                {allTags.slice(0, 12).map(tag => (
                  <button
                    key={tag}
                    className="articles-popular-tag"
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag))
                      } else {
                        setSelectedTags([...selectedTags, tag])
                      }
                    }}
                    style={{
                      background: selectedTags.includes(tag) ? '#3B82F6' : '',
                      color: selectedTags.includes(tag) ? 'white' : ''
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Newsletter CTA */}
            <div className="articles-newsletter">
              <h3 className="articles-newsletter__title">記事を書こう</h3>
              <p className="articles-newsletter__text">
                あなたの知識を共有してみませんか？
              </p>
              <Link href="/new/article">
                <button className="articles-newsletter__button">
                  記事を投稿
                </button>
              </Link>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="articles-main">
            {/* Results Header */}
            <div className="articles-results-header">
              <p className="articles-results-count">
                <strong>{sortedArticles.length}</strong> 件の記事
                {selectedTags.length > 0 && (
                  <span>
                    （{selectedTags.join(', ')}）
                  </span>
                )}
              </p>
              {(selectedTags.length > 0 || filterType !== 'all') && (
                <button 
                  onClick={() => {
                    setSelectedTags([])
                    setFilterType('all')
                  }}
                  className="articles-clear-filters"
                >
                  フィルターをクリア
                </button>
              )}
            </div>
            
            {/* Article Grid */}
            {sortedArticles.length > 0 ? (
              <div className="articles-grid">
                {sortedArticles.map(article => (
                  <article key={article.id} className="article-card-enhanced">
                    <Link href={`/articles/${article.id}`} className="block">
                      <div className="article-card-enhanced__header">
                        <div className="article-card-enhanced__emoji">{article.emoji}</div>
                        <h2 className="article-card-enhanced__title">
                          {article.title}
                        </h2>
                      </div>
                      
                      <div className="article-card-enhanced__meta">
                        <Link 
                          href={`/@${article.author.username}`}
                          className="article-card-enhanced__author"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img 
                            src={article.author.avatar} 
                            alt={article.author.name}
                            className="article-card-enhanced__author-avatar"
                          />
                          <span>{article.author.name}</span>
                        </Link>
                        <span className="article-card-enhanced__date">
                          {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      
                      <div className="article-card-enhanced__tags">
                        {article.tags.map(tag => (
                          <span 
                            key={tag}
                            className="article-card-enhanced__tag"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="article-card-enhanced__footer">
                        <div className="article-card-enhanced__stats">
                          <span className="article-card-enhanced__stat">
                            <span className="article-card-enhanced__stat-icon">❤️</span>
                            {article.likes}
                          </span>
                          <span className="article-card-enhanced__stat">
                            <span className="article-card-enhanced__stat-icon">💬</span>
                            {article.comments}
                          </span>
                        </div>
                        <span className="article-card-enhanced__read-time">
                          5 min read
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="articles-empty">
                <div className="articles-empty__icon">🔍</div>
                <h3 className="articles-empty__title">
                  記事が見つかりませんでした
                </h3>
                <p className="articles-empty__text">
                  条件を変更してお試しください
                </p>
                <Button variant="secondary" onClick={() => {
                  setFilterType('all')
                  setSelectedTags([])
                }}>
                  フィルターをリセット
                </Button>
              </div>
            )}
            
            {/* Load More */}
            {sortedArticles.length > 0 && (
              <div className="articles-load-more">
                <button className="articles-load-more__button">
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