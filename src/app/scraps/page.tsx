'use client'

import { useState, useEffect } from 'react'
import { ScrapCard } from '@/components/cards/ScrapCard'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import Link from 'next/link'
import { scrapsApi, topicsApi } from '@/lib/api'
import type { Scrap, Topic } from '@/lib/api'
import '@/styles/pages/scraps.css'

export default function ScrapsPage() {
  const [scraps, setScraps] = useState<Scrap[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [activeTab, setActiveTab] = useState('active')
  const [sortBy, setSortBy] = useState<'new' | 'active' | 'popular'>('active')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchScraps()
    fetchTopics()
  }, [statusFilter, searchQuery])

  const fetchScraps = async () => {
    try {
      setLoading(true)
      setError(null)

      let result
      
      if (searchQuery.trim()) {
        result = await scrapsApi.searchScraps(searchQuery, 20, 0)
      } else if (statusFilter === 'open') {
        result = await scrapsApi.getOpenScraps(20, 0)
      } else if (statusFilter === 'closed') {
        result = await scrapsApi.getClosedScraps(20, 0)
      } else {
        result = await scrapsApi.getScraps(20, 0)
      }

      setScraps(Array.isArray(result?.data) ? result.data : [])
    } catch (err: any) {
      console.error('スクラップ取得エラー:', err)
      setError(err.message || 'スクラップの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchTopics = async () => {
    try {
      const data = await topicsApi.getPopularTopics(10)
      setTopics(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('トピック取得エラー:', err)
    }
  }
  
  // フィルタリング
  let filteredScraps = scraps
  if (selectedTags.length > 0) {
    filteredScraps = filteredScraps.filter(s => 
      s.topics && selectedTags.some(tag => s.topics.includes(tag))
    )
  }
  
  // ソート
  const sortedScraps = [...filteredScraps].sort((a, b) => {
    switch (sortBy) {
      case 'new':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'active':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      case 'popular':
      default:
        return b.comments_count - a.comments_count
    }
  })
  
  // 全タグを取得
  const allTags = topics.map(t => t.display_name || t.name)
  
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
                    <span>参加者: {15 + index * 3}人</span>
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
                    {scraps.filter(s => !s.closed).length}
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
                    {scraps.filter(s => s.closed).length}
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
            
            {/* Search Bar */}
            <div className="scraps-search-bar mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="スクラップを検索..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-2">エラー</h3>
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={fetchScraps}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  再試行
                </button>
              </div>
            )}
            
            {/* Scraps List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">スクラップを読み込み中...</p>
              </div>
            ) : sortedScraps.length > 0 ? (
              <div className="scraps-list">
                {sortedScraps.map(scrap => (
                  <article key={scrap.id} className="scrap-card-enhanced">
                    <div className="scrap-card-enhanced__header">
                      <div className="scrap-card-enhanced__title-section">
                        <Link href={`/scraps/${scrap.slug || scrap.id}`} className="scrap-card-enhanced__title">
                          <span className="scrap-card-enhanced__emoji">{scrap.emoji || '💭'}</span>
                          <span>{scrap.title}</span>
                        </Link>
                      </div>
                      <span className={`scrap-card-enhanced__status ${
                        !scrap.closed ? 'scrap-card-enhanced__status--open' : 'scrap-card-enhanced__status--closed'
                      }`}>
                        {!scrap.closed ? 'OPEN' : 'CLOSED'}
                      </span>
                    </div>

                    <div className="scrap-card-enhanced__meta">
                      <div 
                        className="scrap-card-enhanced__author"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.location.href = `/${scrap.user?.username || 'unknown'}`
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <img 
                          src={scrap.user?.avatar_url || '/images/avatar-placeholder.svg'} 
                          alt={scrap.user?.display_name || scrap.user?.username || 'Unknown'} 
                          className="scrap-card-enhanced__author-avatar" 
                        />
                        <span>{scrap.user?.display_name || scrap.user?.username || 'Unknown'}</span>
                      </div>
                      <span className="scrap-card-enhanced__date">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="5.5" stroke="currentColor"/>
                          <path d="M7 3.5V7L9.5 8.5" stroke="currentColor" strokeLinecap="round"/>
                        </svg>
                        最終更新: {new Date(scrap.updated_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>

                    <p className="scrap-card-enhanced__excerpt">
                      {(scrap.content || '').substring(0, 150)}...
                    </p>

                    {scrap.topics && scrap.topics.length > 0 && (
                      <div className="scrap-card-enhanced__tags">
                        {scrap.topics.map(topic => (
                          <span key={topic} className="scrap-card-enhanced__tag">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="scrap-card-enhanced__footer">
                      <div className="scrap-card-enhanced__stats">
                        <span className="scrap-card-enhanced__stat">
                          <span className="scrap-card-enhanced__stat-icon">💬</span>
                          {scrap.comments_count} コメント
                        </span>
                        <span className="scrap-card-enhanced__stat">
                          <span className="scrap-card-enhanced__stat-icon">👥</span>
                          {Math.max(1, Math.floor(scrap.comments_count / 3))} 参加者
                        </span>
                      </div>
                      <div className="scrap-card-enhanced__participants">
                        <div className="scrap-card-enhanced__participants-avatars">
                          {[...Array(Math.min(Math.max(1, Math.floor(scrap.comments_count / 3)), 3))].map((_, i) => (
                            <div key={i} className="scrap-card-enhanced__participant-avatar">
                              {i + 1}
                            </div>
                          ))}
                          {Math.floor(scrap.comments_count / 3) > 3 && (
                            <div className="scrap-card-enhanced__participant-avatar">
                              +{Math.floor(scrap.comments_count / 3) - 3}
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