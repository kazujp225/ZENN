'use client'

import { useState } from 'react'
import { ScrapCard } from '@/components/cards/ScrapCard'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import Link from 'next/link'
import '@/styles/pages/scraps.css'

// サンプルデータ
const getAllScraps = () => {
  return [
    {
      id: 'scrap1',
      title: 'Next.js 14でのSSGとISRの使い分けについて',
      author: {
        username: 'developer1',
        name: '田中太郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T15:30:00Z',
      commentsCount: 8,
      isOpen: false,
      emoji: '💭',
      excerpt: 'Next.js 14でSSGとISRをどう使い分けるか、実際のプロジェクトでの経験をもとに考察してみました...',
      tags: ['Next.js', 'SSG', 'ISR'],
      participantsCount: 5
    },
    {
      id: 'scrap2',
      title: 'Rust vs Go - バックエンド開発での選択基準',
      author: {
        username: 'backenddev',
        name: '高橋健太',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-14T09:00:00Z',
      updatedAt: '2025-01-16T09:00:00Z',
      commentsCount: 15,
      isOpen: true,
      emoji: '🤔',
      excerpt: 'RustとGoのどちらを選ぶべきか。パフォーマンス、開発効率、エコシステムの観点から比較...',
      tags: ['Rust', 'Go', 'Backend'],
      participantsCount: 8
    },
    {
      id: 'scrap3',
      title: 'フロントエンドのテスト戦略について語り合う',
      author: {
        username: 'testmaster',
        name: '山田次郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-13T14:00:00Z',
      updatedAt: '2025-01-15T11:00:00Z',
      commentsCount: 12,
      isOpen: true,
      emoji: '🧪',
      excerpt: 'Jest、Testing Library、Playwrightなど、どのツールをどう組み合わせるか...',
      tags: ['Testing', 'Frontend', 'Jest'],
      participantsCount: 6
    },
    {
      id: 'scrap4',
      title: 'TypeScriptの strictモードは本当に必要か？',
      author: {
        username: 'tsexpert',
        name: '佐藤花子',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-12T10:00:00Z',
      updatedAt: '2025-01-12T18:00:00Z',
      commentsCount: 24,
      isOpen: false,
      emoji: '📘',
      excerpt: 'strictモードのメリット・デメリットと、プロジェクトでの導入タイミングについて議論...',
      tags: ['TypeScript', 'JavaScript'],
      participantsCount: 10
    },
    {
      id: 'scrap5',
      title: 'AIツールをコーディングにどう活用している？',
      author: {
        username: 'aidev',
        name: '伊藤真理',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-11T15:00:00Z',
      updatedAt: '2025-01-14T20:00:00Z',
      commentsCount: 32,
      isOpen: true,
      emoji: '🤖',
      excerpt: 'GitHub Copilot、ChatGPT、Cursor...みんなはどのAIツールを使ってる？',
      tags: ['AI', 'DX', 'Productivity'],
      participantsCount: 15
    },
    {
      id: 'scrap6',
      title: 'マイクロサービス vs モノリス - 2025年の選択',
      author: {
        username: 'architect',
        name: '中村優',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-10T11:00:00Z',
      updatedAt: '2025-01-10T11:00:00Z',
      commentsCount: 18,
      isOpen: true,
      emoji: '🏗️',
      excerpt: 'スタートアップや中規模プロジェクトでのアーキテクチャ選択について...',
      tags: ['Architecture', 'Microservices', 'Backend'],
      participantsCount: 9
    }
  ]
}

export default function ScrapsPage() {
  const [activeTab, setActiveTab] = useState('active')
  const [sortBy, setSortBy] = useState<'new' | 'active' | 'popular'>('active')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const scraps = getAllScraps()
  
  // フィルタリング
  let filteredScraps = scraps
  if (statusFilter === 'open') {
    filteredScraps = filteredScraps.filter(s => s.isOpen)
  } else if (statusFilter === 'closed') {
    filteredScraps = filteredScraps.filter(s => !s.isOpen)
  }
  
  if (selectedTags.length > 0) {
    filteredScraps = filteredScraps.filter(s => 
      selectedTags.some(tag => s.tags.includes(tag))
    )
  }
  
  // ソート
  const sortedScraps = [...filteredScraps].sort((a, b) => {
    switch (sortBy) {
      case 'new':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      case 'active':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'popular':
      default:
        return b.commentsCount - a.commentsCount
    }
  })
  
  // 全タグを取得
  const allTags = Array.from(new Set(scraps.flatMap(s => s.tags)))
  
  // トレンディングトピックス
  const trendingTopics = [
    { emoji: '🤖', title: 'AI開発ツール', count: 24, tags: ['AI', 'ChatGPT', 'Copilot'] },
    { emoji: '🦀', title: 'Rust入門', count: 18, tags: ['Rust', 'Systems', 'Performance'] },
    { emoji: '⚛️', title: 'React最新情報', count: 32, tags: ['React', 'Frontend', 'Next.js'] },
    { emoji: '🧪', title: 'テスト自動化', count: 15, tags: ['Testing', 'CI/CD', 'Quality'] }
  ]
  
  return (
    <PageProvider title="スクラップ" description="気軽な情報共有とディスカッション">
      <div className="scraps-page">
        {/* Minimalist Hero Section */}
        <div className="scraps-hero scraps-hero--minimal">
          <div className="scraps-hero__inner">
            <div className="scraps-hero__main">
              <div className="scraps-hero__title-wrapper">
                <h1 className="scraps-hero__title">
                  <span className="scraps-hero__title-line">
                    <span className="scraps-hero__title-text">アイデアを</span>
                    <span className="scraps-hero__title-accent">気軽に</span>
                    <span className="scraps-hero__title-text">共有。</span>
                  </span>
                  <span className="scraps-hero__title-line">
                    <span className="scraps-hero__title-text">議論で深める知識。</span>
                  </span>
                </h1>
                <div className="scraps-hero__title-decoration">
                  <svg width="60" height="4" viewBox="0 0 60 4" fill="none">
                    <rect x="0" y="0" width="20" height="4" rx="2" fill="#06B6D4" opacity="0.6"/>
                    <rect x="24" y="0" width="12" height="4" rx="2" fill="#06B6D4" opacity="0.4"/>
                    <rect x="40" y="0" width="20" height="4" rx="2" fill="#06B6D4" opacity="0.2"/>
                  </svg>
                </div>
              </div>
              <p className="scraps-hero__description">
                思いついたアイデアや疑問を気軽に投稿。<br />
                コミュニティとの対話で、新たな発見を。
              </p>
              
              {/* Stats */}
              <div className="scraps-hero__stats">
                <div className="scraps-hero__stat">
                  <span className="scraps-hero__stat-number">2,340</span>
                  <span className="scraps-hero__stat-label">アクティブ</span>
                </div>
                <div className="scraps-hero__stat">
                  <span className="scraps-hero__stat-number">156</span>
                  <span className="scraps-hero__stat-label">今週の新規</span>
                </div>
                <div className="scraps-hero__stat">
                  <span className="scraps-hero__stat-number">8.2k</span>
                  <span className="scraps-hero__stat-label">総コメント</span>
                </div>
                <div className="scraps-hero__stat">
                  <span className="scraps-hero__stat-number">423</span>
                  <span className="scraps-hero__stat-label">参加者</span>
                </div>
              </div>

              {/* Actions */}
              <div className="scraps-hero__actions">
                <Link href="/new/scrap">
                  <Button variant="primary" className="scraps-hero__btn scraps-hero__btn--primary">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    スクラップを作成
                  </Button>
                </Link>
                <Link href="/scraps/guide">
                  <Button variant="ghost" className="scraps-hero__btn scraps-hero__btn--ghost">
                    使い方ガイド
                  </Button>
                </Link>
              </div>

              {/* Features */}
              <div className="scraps-hero__features">
                <div className="scraps-hero__feature">
                  <div className="scraps-hero__feature-icon">💭</div>
                  <div className="scraps-hero__feature-title">気軽に投稿</div>
                  <div className="scraps-hero__feature-text">アイデアをすぐシェア</div>
                </div>
                <div className="scraps-hero__feature">
                  <div className="scraps-hero__feature-icon">💬</div>
                  <div className="scraps-hero__feature-title">活発な議論</div>
                  <div className="scraps-hero__feature-text">コメントで深掘り</div>
                </div>
                <div className="scraps-hero__feature">
                  <div className="scraps-hero__feature-icon">🔍</div>
                  <div className="scraps-hero__feature-title">知識の発見</div>
                  <div className="scraps-hero__feature-text">新たな学びを獲得</div>
                </div>
                <div className="scraps-hero__feature">
                  <div className="scraps-hero__feature-icon">🤝</div>
                  <div className="scraps-hero__feature-title">つながる</div>
                  <div className="scraps-hero__feature-text">同じ興味を持つ仲間</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Topics Section */}
        <div className="scraps-trending">
          <div className="scraps-trending__inner">
            <div className="scraps-trending__header">
              <h2 className="scraps-trending__title">🔥 トレンディングトピック</h2>
              <p className="scraps-trending__subtitle">今話題のディスカッション</p>
            </div>
            <div className="scraps-trending__grid">
              {trendingTopics.map((topic, index) => (
                <div key={index} className="scraps-trending__topic">
                  <div className="scraps-trending__topic-header">
                    <div className="scraps-trending__topic-title">
                      <span className="scraps-trending__topic-emoji">{topic.emoji}</span>
                      <span>{topic.title}</span>
                    </div>
                    <span className="scraps-trending__topic-count">{topic.count}件</span>
                  </div>
                  <div className="scraps-trending__topic-tags">
                    {topic.tags.map(tag => (
                      <span key={tag} className="scraps-trending__topic-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="scraps-trending__topic-activity">
                    <span>最新: 2時間前</span>
                    <span>参加者: {Math.floor(Math.random() * 20) + 5}人</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Layout */}
        <div className="scraps-layout">
          {/* Sidebar */}
          <aside className="scraps-sidebar">
            {/* Status Filter */}
            <div className="scraps-sidebar-section">
              <h3 className="scraps-sidebar-title">ステータス</h3>
              <div className="scraps-status-filters">
                <button 
                  className={`scraps-status-filter ${statusFilter === 'all' ? 'scraps-status-filter--active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  <span className="scraps-status-filter__label">すべて</span>
                  <span className="scraps-status-filter__count">{scraps.length}</span>
                </button>
                <button 
                  className={`scraps-status-filter ${statusFilter === 'open' ? 'scraps-status-filter--active' : ''}`}
                  onClick={() => setStatusFilter('open')}
                >
                  <span className="scraps-status-filter__label">
                    <span className="scraps-status-badge scraps-status-badge--open">OPEN</span>
                  </span>
                  <span className="scraps-status-filter__count">
                    {scraps.filter(s => s.isOpen).length}
                  </span>
                </button>
                <button 
                  className={`scraps-status-filter ${statusFilter === 'closed' ? 'scraps-status-filter--active' : ''}`}
                  onClick={() => setStatusFilter('closed')}
                >
                  <span className="scraps-status-filter__label">
                    <span className="scraps-status-badge scraps-status-badge--closed">CLOSED</span>
                  </span>
                  <span className="scraps-status-filter__count">
                    {scraps.filter(s => !s.isOpen).length}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Topics */}
            <div className="scraps-sidebar-section">
              <h3 className="scraps-sidebar-title">トピック</h3>
              <div className="scraps-topics">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`scraps-topic-tag ${selectedTags.includes(tag) ? 'scraps-topic-tag--active' : ''}`}
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
            
            {/* Create CTA */}
            <div className="scraps-create-cta">
              <div className="scraps-create-cta__icon">💡</div>
              <h3 className="scraps-create-cta__title">アイデアをシェア</h3>
              <p className="scraps-create-cta__text">
                思いついたことを気軽に投稿してみませんか？
              </p>
              <Link href="/new/scrap">
                <button className="scraps-create-cta__button">
                  スクラップを作成
                </button>
              </Link>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="scraps-main">
            {/* Filter Bar */}
            <div className="scraps-filter-bar">
              <div className="scraps-filter-tabs">
                <button 
                  className={`scraps-filter-tab ${activeTab === 'active' ? 'scraps-filter-tab--active' : ''}`}
                  onClick={() => {
                    setActiveTab('active')
                    setSortBy('active')
                  }}
                >
                  アクティブ
                </button>
                <button 
                  className={`scraps-filter-tab ${activeTab === 'new' ? 'scraps-filter-tab--active' : ''}`}
                  onClick={() => {
                    setActiveTab('new')
                    setSortBy('new')
                  }}
                >
                  新着
                </button>
                <button 
                  className={`scraps-filter-tab ${activeTab === 'popular' ? 'scraps-filter-tab--active' : ''}`}
                  onClick={() => {
                    setActiveTab('popular')
                    setSortBy('popular')
                  }}
                >
                  人気
                </button>
              </div>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="scraps-filter-sort"
              >
                <option value="active">最近更新された順</option>
                <option value="new">新着順</option>
                <option value="popular">コメントが多い順</option>
              </select>
            </div>
            
            {/* Results Header */}
            <div className="scraps-results-header">
              <p className="scraps-results-count">
                <strong>{sortedScraps.length}</strong> 件のスクラップ
                {selectedTags.length > 0 && (
                  <span>（{selectedTags.join(', ')}）</span>
                )}
              </p>
              {(selectedTags.length > 0 || statusFilter !== 'all') && (
                <button 
                  onClick={() => {
                    setSelectedTags([])
                    setStatusFilter('all')
                  }}
                  className="scraps-clear-filters"
                >
                  フィルターをクリア
                </button>
              )}
            </div>
            
            {/* Scraps List */}
            {sortedScraps.length > 0 ? (
              <div className="scraps-list">
                {sortedScraps.map(scrap => (
                  <article key={scrap.id} className="scrap-card-enhanced">
                    <div className="scrap-card-enhanced__header">
                      <div className="scrap-card-enhanced__title-section">
                        <Link href={`/scraps/${scrap.id}`} className="scrap-card-enhanced__title">
                          <span className="scrap-card-enhanced__emoji">{scrap.emoji}</span>
                          <span>{scrap.title}</span>
                        </Link>
                      </div>
                      <span className={`scrap-card-enhanced__status ${
                        scrap.isOpen ? 'scrap-card-enhanced__status--open' : 'scrap-card-enhanced__status--closed'
                      }`}>
                        {scrap.isOpen ? 'OPEN' : 'CLOSED'}
                      </span>
                    </div>

                    <div className="scrap-card-enhanced__meta">
                      <div 
                        className="scrap-card-enhanced__author"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.location.href = `/${scrap.author.username}`
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <img src={scrap.author.avatar} alt={scrap.author.name} className="scrap-card-enhanced__author-avatar" />
                        <span>{scrap.author.name}</span>
                      </div>
                      <span className="scrap-card-enhanced__date">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="5.5" stroke="currentColor"/>
                          <path d="M7 3.5V7L9.5 8.5" stroke="currentColor" strokeLinecap="round"/>
                        </svg>
                        最終更新: {new Date(scrap.updatedAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>

                    <p className="scrap-card-enhanced__excerpt">{scrap.excerpt}</p>

                    <div className="scrap-card-enhanced__tags">
                      {scrap.tags.map(tag => (
                        <span key={tag} className="scrap-card-enhanced__tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="scrap-card-enhanced__footer">
                      <div className="scrap-card-enhanced__stats">
                        <span className="scrap-card-enhanced__stat">
                          <span className="scrap-card-enhanced__stat-icon">💬</span>
                          {scrap.commentsCount} コメント
                        </span>
                        <span className="scrap-card-enhanced__stat">
                          <span className="scrap-card-enhanced__stat-icon">👥</span>
                          {scrap.participantsCount} 参加者
                        </span>
                      </div>
                      <div className="scrap-card-enhanced__participants">
                        <div className="scrap-card-enhanced__participants-avatars">
                          {[...Array(Math.min(scrap.participantsCount, 3))].map((_, i) => (
                            <div key={i} className="scrap-card-enhanced__participant-avatar">
                              {i + 1}
                            </div>
                          ))}
                          {scrap.participantsCount > 3 && (
                            <div className="scrap-card-enhanced__participant-avatar">
                              +{scrap.participantsCount - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="scraps-empty">
                <div className="scraps-empty__icon">💭</div>
                <h3 className="scraps-empty__title">
                  スクラップが見つかりませんでした
                </h3>
                <p className="scraps-empty__text">
                  条件を変更してお試しください
                </p>
                <Button variant="secondary" onClick={() => {
                  setStatusFilter('all')
                  setSelectedTags([])
                }}>
                  フィルターをリセット
                </Button>
              </div>
            )}
            
            {/* Load More */}
            {sortedScraps.length > 0 && (
              <div className="scraps-load-more">
                <button className="scraps-load-more__button">
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