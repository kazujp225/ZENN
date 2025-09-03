'use client'

import { useState } from 'react'
import { FreelanceJobCard } from '@/components/monetization/FreelanceJobCard'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { FreelanceJob } from '@/types/monetization'
import '@/styles/pages/jobs.css'

// 拡張されたサンプルデータ
const getJobs = (): FreelanceJob[] => {
  return [
    {
      id: '1',
      client: {
        username: 'techstartup',
        name: 'テックスタートアップ株式会社',
        avatar: '/images/avatar-placeholder.svg',
        company: 'TechStartup Inc.',
        isVerified: true,
        rating: 4.8,
        totalJobs: 23
      },
      title: 'ECサイトのフルスタック開発（Next.js + Node.js）',
      description: 'BtoCのECサイトを新規開発します。フロントエンドはNext.js、バックエンドはNode.js/Express、DBはPostgreSQLを使用。決済システムの実装経験がある方を優遇します。',
      category: 'fullstack',
      skills: ['Next.js', 'Node.js', 'PostgreSQL', 'TypeScript', 'Stripe API'],
      budget: {
        min: 800000,
        max: 1200000,
        currency: 'JPY',
        type: 'fixed'
      },
      duration: '2-3ヶ月',
      workStyle: 'remote',
      proposals: 12,
      status: 'open',
      postedAt: '2025-01-15T10:00:00Z',
      deadline: '2025-01-25T23:59:59Z',
      requirements: [
        '3年以上のWeb開発経験',
        'Next.jsを使用した実務経験',
        '決済システムの実装経験',
        'レスポンシブデザインの実装スキル'
      ],
      preferredQualifications: [
        'ECサイトの開発経験',
        'AWSでのデプロイ経験',
        'アジャイル開発の経験'
      ]
    },
    {
      id: '2',
      client: {
        username: 'fintech_company',
        name: 'フィンテック企業',
        avatar: '/images/avatar-placeholder.svg',
        company: 'FinTech Solutions',
        isVerified: true,
        rating: 4.9,
        totalJobs: 45
      },
      title: 'ブロックチェーン決済システムのバックエンド開発',
      description: '暗号資産を使った決済システムのバックエンド開発。Ethereum、Solidityの経験必須。セキュリティに詳しい方歓迎。',
      category: 'blockchain',
      skills: ['Solidity', 'Ethereum', 'Node.js', 'Web3.js', 'Security'],
      budget: {
        min: 10000,
        max: 15000,
        currency: 'JPY',
        type: 'hourly'
      },
      duration: '継続案件（6ヶ月〜）',
      workStyle: 'hybrid',
      location: '東京',
      proposals: 8,
      status: 'open',
      postedAt: '2025-01-14T10:00:00Z',
      requirements: [
        'ブロックチェーン開発経験2年以上',
        'Solidityでのスマートコントラクト開発経験',
        'セキュリティ監査の知識'
      ]
    },
    {
      id: '3',
      client: {
        username: 'ai_startup',
        name: 'AI開発企業',
        avatar: '/images/avatar-placeholder.svg',
        company: 'AI Innovations',
        isVerified: false,
        rating: 4.5,
        totalJobs: 12
      },
      title: '機械学習モデルのAPI化とデプロイ',
      description: '既存の機械学習モデルをAPI化し、本番環境にデプロイ。FastAPI、Docker、Kubernetesの使用経験必須。',
      category: 'machine-learning',
      skills: ['Python', 'FastAPI', 'Docker', 'Kubernetes', 'TensorFlow'],
      budget: {
        min: 500000,
        max: 700000,
        currency: 'JPY',
        type: 'fixed'
      },
      duration: '1-2ヶ月',
      workStyle: 'remote',
      proposals: 15,
      status: 'open',
      postedAt: '2025-01-13T10:00:00Z',
      deadline: '2025-01-20T23:59:59Z',
      requirements: [
        'Python開発経験3年以上',
        '機械学習モデルのデプロイ経験',
        'Docker/Kubernetesの実務経験'
      ]
    },
    {
      id: '4',
      client: {
        username: 'game_studio',
        name: 'ゲーム開発スタジオ',
        avatar: '/images/avatar-placeholder.svg',
        company: 'Game Studio X',
        isVerified: true,
        rating: 4.7,
        totalJobs: 34
      },
      title: 'Unity開発エンジニア募集（モバイルゲーム）',
      description: '新作モバイルゲームの開発メンバーを募集。Unity、C#での開発経験必須。ネットワーク対戦機能の実装経験がある方優遇。',
      category: 'game-development',
      skills: ['Unity', 'C#', 'Mobile Development', 'Multiplayer', 'Firebase'],
      budget: {
        min: 0,
        max: 0,
        currency: 'JPY',
        type: 'negotiable'
      },
      duration: '3-6ヶ月',
      workStyle: 'onsite',
      location: '大阪',
      proposals: 20,
      status: 'open',
      postedAt: '2025-01-12T10:00:00Z',
      requirements: [
        'Unity開発経験2年以上',
        'モバイルゲーム開発経験',
        'チーム開発の経験'
      ]
    },
    {
      id: '5',
      client: {
        username: 'media_company',
        name: 'メディア運営会社',
        avatar: '/images/avatar-placeholder.svg',
        company: 'Digital Media Corp',
        isVerified: true,
        rating: 4.6,
        totalJobs: 18
      },
      title: 'WordPress高速化・SEO最適化エンジニア',
      description: '大規模メディアサイトのパフォーマンス改善。Core Web Vitals対策、CDN設定、キャッシュ最適化など。',
      category: 'web-development',
      skills: ['WordPress', 'PHP', 'MySQL', 'CDN', 'SEO'],
      budget: {
        min: 400000,
        max: 600000,
        currency: 'JPY',
        type: 'fixed'
      },
      duration: '1ヶ月',
      workStyle: 'remote',
      proposals: 25,
      status: 'open',
      postedAt: '2025-01-16T10:00:00Z',
      requirements: [
        'WordPress開発経験3年以上',
        '大規模サイトの運用経験',
        'パフォーマンス最適化の実績'
      ]
    },
    {
      id: '6',
      client: {
        username: 'saas_company',
        name: 'SaaS企業',
        avatar: '/images/avatar-placeholder.svg',
        company: 'CloudTools Inc.',
        isVerified: true,
        rating: 4.8,
        totalJobs: 67
      },
      title: 'React Native開発者（BtoB管理アプリ）',
      description: 'クラウドサービスの管理用モバイルアプリ開発。React Native、TypeScriptでの実装。プッシュ通知、オフライン対応必須。',
      category: 'mobile-development',
      skills: ['React Native', 'TypeScript', 'Redux', 'GraphQL', 'Firebase'],
      budget: {
        min: 8000,
        max: 12000,
        currency: 'JPY',
        type: 'hourly'
      },
      duration: '継続案件（3ヶ月〜）',
      workStyle: 'remote',
      proposals: 18,
      status: 'open',
      postedAt: '2025-01-17T10:00:00Z',
      requirements: [
        'React Native開発経験2年以上',
        'TypeScriptでの開発経験',
        'BtoBアプリの開発経験優遇'
      ]
    }
  ]
}

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [workStyle, setWorkStyle] = useState<'all' | 'remote' | 'onsite' | 'hybrid'>('all')
  const [budgetType, setBudgetType] = useState<'all' | 'fixed' | 'hourly' | 'negotiable'>('all')
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)
  
  const jobs = getJobs()
  
  // フィルタリング
  let filteredJobs = jobs
  
  if (selectedCategory !== 'all') {
    filteredJobs = filteredJobs.filter(j => j.category === selectedCategory)
  }
  
  if (workStyle !== 'all') {
    filteredJobs = filteredJobs.filter(j => j.workStyle === workStyle)
  }
  
  if (budgetType !== 'all') {
    filteredJobs = filteredJobs.filter(j => j.budget.type === budgetType)
  }
  
  if (showUrgentOnly) {
    filteredJobs = filteredJobs.filter(j => 
      j.deadline && new Date(j.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
    )
  }
  
  const tabs = [
    { id: 'all', label: 'すべて' },
    { id: 'new', label: '新着' },
    { id: 'urgent', label: '急募' },
    { id: 'high-budget', label: '高単価' }
  ]
  
  const categories = [
    { value: 'all', label: 'すべて', emoji: '🔍' },
    { value: 'web-development', label: 'Web開発', emoji: '🌐' },
    { value: 'mobile-development', label: 'モバイル開発', emoji: '📱' },
    { value: 'backend', label: 'バックエンド', emoji: '⚙️' },
    { value: 'frontend', label: 'フロントエンド', emoji: '🎨' },
    { value: 'fullstack', label: 'フルスタック', emoji: '🔄' },
    { value: 'devops', label: 'DevOps', emoji: '🔧' },
    { value: 'data-science', label: 'データサイエンス', emoji: '📊' },
    { value: 'machine-learning', label: '機械学習', emoji: '🤖' },
    { value: 'blockchain', label: 'ブロックチェーン', emoji: '🔗' },
    { value: 'game-development', label: 'ゲーム開発', emoji: '🎮' }
  ]
  
  return (
    <div className="jobs-page">
      {/* Minimalist Hero Section - Full Width */}
      <div className="jobs-hero jobs-hero--minimal">
        <div className="jobs-hero__inner">
          <div className="jobs-hero__main">
            <div className="jobs-hero__title-wrapper">
              <h1 className="jobs-hero__title">
                <span className="jobs-hero__title-line">
                  <span className="jobs-hero__title-text">あなたのスキルを、</span>
                </span>
                <span className="jobs-hero__title-line">
                  <span className="jobs-hero__title-accent">価値</span>
                  <span className="jobs-hero__title-text">に変える。</span>
                </span>
              </h1>
              <div className="jobs-hero__title-decoration">
                <svg width="60" height="4" viewBox="0 0 60 4" fill="none">
                  <rect x="0" y="0" width="20" height="4" rx="2" fill="#10B981" opacity="0.6"/>
                  <rect x="24" y="0" width="12" height="4" rx="2" fill="#10B981" opacity="0.4"/>
                  <rect x="40" y="0" width="20" height="4" rx="2" fill="#10B981" opacity="0.2"/>
                </svg>
              </div>
            </div>
            <p className="jobs-hero__description">
              フリーランス・副業向けの厳選された開発案件。<br />
              リモート案件多数、柔軟な働き方を実現します。
            </p>
            
            <div className="jobs-hero__stats">
              <div className="jobs-hero__stat">
                <span className="jobs-hero__stat-number">1,200+</span>
                <span className="jobs-hero__stat-label">掲載案件</span>
              </div>
              <div className="jobs-hero__stat">
                <span className="jobs-hero__stat-number">¥850K</span>
                <span className="jobs-hero__stat-label">平均月収</span>
              </div>
              <div className="jobs-hero__stat">
                <span className="jobs-hero__stat-number">89%</span>
                <span className="jobs-hero__stat-label">リモート可</span>
              </div>
              <div className="jobs-hero__stat">
                <span className="jobs-hero__stat-number">4.8</span>
                <span className="jobs-hero__stat-label">満足度</span>
              </div>
            </div>

            <div className="jobs-hero__actions">
              <Link href="/jobs/search">
                <Button variant="primary" className="jobs-hero__btn jobs-hero__btn--primary">
                  案件を探す
                </Button>
              </Link>
              <Link href="/jobs/post">
                <Button variant="ghost" className="jobs-hero__btn jobs-hero__btn--ghost">
                  案件を掲載
                </Button>
              </Link>
            </div>

            <div className="jobs-hero__features">
              <span className="jobs-hero__feature">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                審査済み案件
              </span>
              <span className="jobs-hero__feature">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                エスクロー決済
              </span>
              <span className="jobs-hero__feature">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                24時間サポート
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Section - Full Width */}
      <div className="jobs-companies">
        <h2 className="jobs-companies__title">掲載企業</h2>
        <div className="jobs-companies__grid">
          <div className="jobs-company-card">
            <div className="jobs-company-card__logo">🚀</div>
            <div className="jobs-company-card__name">TechStartup Inc.</div>
            <div className="jobs-company-card__count">23件の案件</div>
            <div className="jobs-company-card__tags">
              <span className="jobs-company-card__tag">Web開発</span>
              <span className="jobs-company-card__tag">React</span>
              <span className="jobs-company-card__tag">Node.js</span>
            </div>
          </div>
          <div className="jobs-company-card">
            <div className="jobs-company-card__logo">💰</div>
            <div className="jobs-company-card__name">FinTech Solutions</div>
            <div className="jobs-company-card__count">45件の案件</div>
            <div className="jobs-company-card__tags">
              <span className="jobs-company-card__tag">ブロックチェーン</span>
              <span className="jobs-company-card__tag">セキュリティ</span>
            </div>
          </div>
          <div className="jobs-company-card">
            <div className="jobs-company-card__logo">🤖</div>
            <div className="jobs-company-card__name">AI Innovations</div>
            <div className="jobs-company-card__count">12件の案件</div>
            <div className="jobs-company-card__tags">
              <span className="jobs-company-card__tag">機械学習</span>
              <span className="jobs-company-card__tag">Python</span>
            </div>
          </div>
          <div className="jobs-company-card">
            <div className="jobs-company-card__logo">🎮</div>
            <div className="jobs-company-card__name">Game Studio X</div>
            <div className="jobs-company-card__count">34件の案件</div>
            <div className="jobs-company-card__tags">
              <span className="jobs-company-card__tag">Unity</span>
              <span className="jobs-company-card__tag">C#</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - Full Width */}
      <div className="jobs-how-it-works">
        <h2 className="jobs-how-it-works__title">ご利用の流れ</h2>
        <div className="jobs-how-it-works__steps">
          <div className="jobs-how-it-works__step">
            <div className="jobs-how-it-works__step-number">1</div>
            <div className="jobs-how-it-works__step-icon">🔍</div>
            <h3>案件を探す</h3>
            <p>スキルや希望条件に合った案件を検索</p>
          </div>
          <div className="jobs-how-it-works__step">
            <div className="jobs-how-it-works__step-number">2</div>
            <div className="jobs-how-it-works__step-icon">📝</div>
            <h3>提案する</h3>
            <p>興味のある案件に提案を送信</p>
          </div>
          <div className="jobs-how-it-works__step">
            <div className="jobs-how-it-works__step-number">3</div>
            <div className="jobs-how-it-works__step-icon">🤝</div>
            <h3>契約する</h3>
            <p>条件に合意して契約を締結</p>
          </div>
          <div className="jobs-how-it-works__step">
            <div className="jobs-how-it-works__step-number">4</div>
            <div className="jobs-how-it-works__step-icon">💰</div>
            <h3>報酬を得る</h3>
            <p>作業完了後、報酬を受け取る</p>
          </div>
        </div>
      </div>

      {/* Main Content with Container */}
      <div className="container py-8">
        {/* Quick Filters */}
        <div className="jobs-quick-filters">
          <button className="jobs-quick-filter jobs-quick-filter--active">
            <span className="jobs-quick-filter__icon">🏠</span>
            <span className="jobs-quick-filter__label">フルリモート</span>
            <span className="jobs-quick-filter__count">156</span>
          </button>
          <button className="jobs-quick-filter">
            <span className="jobs-quick-filter__icon">💰</span>
            <span className="jobs-quick-filter__label">月80万円〜</span>
            <span className="jobs-quick-filter__count">89</span>
          </button>
          <button className="jobs-quick-filter">
            <span className="jobs-quick-filter__icon">⚡</span>
            <span className="jobs-quick-filter__label">即日開始</span>
            <span className="jobs-quick-filter__count">34</span>
          </button>
          <button className="jobs-quick-filter">
            <span className="jobs-quick-filter__icon">🔄</span>
            <span className="jobs-quick-filter__label">継続案件</span>
            <span className="jobs-quick-filter__count">67</span>
          </button>
        </div>

        {/* Categories */}
        <div className="jobs-categories">
          {categories.map(category => (
            <button
              key={category.value}
              className={`jobs-category ${selectedCategory === category.value ? 'jobs-category--active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              <span className="jobs-category__emoji">{category.emoji}</span>
              <span className="jobs-category__label">{category.label}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>

        <div className="jobs-layout">
          {/* Sidebar */}
          <aside className="jobs-sidebar">
            {/* Filters */}
            <div className="jobs-filter">
              <h3 className="jobs-filter__title">絞り込み</h3>
              
              {/* Work Style */}
              <div className="jobs-filter__section">
                <h4 className="jobs-filter__subtitle">勤務形態</h4>
                <div className="jobs-filter__options">
                  <label className="jobs-filter__option">
                    <input 
                      type="radio" 
                      name="workStyle" 
                      value="all"
                      checked={workStyle === 'all'}
                      onChange={(e) => setWorkStyle(e.target.value as any)}
                    />
                    <span>すべて</span>
                  </label>
                  <label className="jobs-filter__option">
                    <input 
                      type="radio" 
                      name="workStyle" 
                      value="remote"
                      checked={workStyle === 'remote'}
                      onChange={(e) => setWorkStyle(e.target.value as any)}
                    />
                    <span>リモート</span>
                  </label>
                  <label className="jobs-filter__option">
                    <input 
                      type="radio" 
                      name="workStyle" 
                      value="onsite"
                      checked={workStyle === 'onsite'}
                      onChange={(e) => setWorkStyle(e.target.value as any)}
                    />
                    <span>オンサイト</span>
                  </label>
                  <label className="jobs-filter__option">
                    <input 
                      type="radio" 
                      name="workStyle" 
                      value="hybrid"
                      checked={workStyle === 'hybrid'}
                      onChange={(e) => setWorkStyle(e.target.value as any)}
                    />
                    <span>ハイブリッド</span>
                  </label>
                </div>
              </div>

              {/* Budget Type */}
              <div className="jobs-filter__section">
                <h4 className="jobs-filter__subtitle">契約形態</h4>
                <div className="jobs-filter__options">
                  <label className="jobs-filter__option">
                    <input 
                      type="radio" 
                      name="budgetType" 
                      value="all"
                      checked={budgetType === 'all'}
                      onChange={(e) => setBudgetType(e.target.value as any)}
                    />
                    <span>すべて</span>
                  </label>
                  <label className="jobs-filter__option">
                    <input 
                      type="radio" 
                      name="budgetType" 
                      value="fixed"
                      checked={budgetType === 'fixed'}
                      onChange={(e) => setBudgetType(e.target.value as any)}
                    />
                    <span>固定報酬</span>
                  </label>
                  <label className="jobs-filter__option">
                    <input 
                      type="radio" 
                      name="budgetType" 
                      value="hourly"
                      checked={budgetType === 'hourly'}
                      onChange={(e) => setBudgetType(e.target.value as any)}
                    />
                    <span>時給制</span>
                  </label>
                  <label className="jobs-filter__option">
                    <input 
                      type="radio" 
                      name="budgetType" 
                      value="negotiable"
                      checked={budgetType === 'negotiable'}
                      onChange={(e) => setBudgetType(e.target.value as any)}
                    />
                    <span>要相談</span>
                  </label>
                </div>
              </div>

              {/* Urgent Only */}
              <div className="jobs-filter__section">
                <label className="jobs-filter__checkbox">
                  <input 
                    type="checkbox"
                    checked={showUrgentOnly}
                    onChange={(e) => setShowUrgentOnly(e.target.checked)}
                  />
                  <span>急募案件のみ</span>
                </label>
              </div>
            </div>

            {/* Tips */}
            <div className="jobs-tips">
              <h3 className="jobs-tips__title">💡 応募のコツ</h3>
              <ul className="jobs-tips__list">
                <li>プロフィールを充実させる</li>
                <li>ポートフォリオを整備する</li>
                <li>提案文をカスタマイズする</li>
                <li>実績を具体的に記載する</li>
                <li>返信は24時間以内に</li>
              </ul>
            </div>

            {/* Safety */}
            <div className="jobs-safety">
              <h3 className="jobs-safety__title">🛡️ 安心・安全</h3>
              <p className="jobs-safety__text">
                すべての案件は事前審査済み。報酬の支払いはエスクロー決済で保証されます。
              </p>
              <Link href="/jobs/safety" className="jobs-safety__link">
                詳しく見る →
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="jobs-main">
            {/* Results */}
            <div className="jobs-results">
              <span className="jobs-results__count">
                {filteredJobs.length}件の案件
              </span>
              {(selectedCategory !== 'all' || workStyle !== 'all' || budgetType !== 'all' || showUrgentOnly) && (
                <button 
                  onClick={() => {
                    setSelectedCategory('all')
                    setWorkStyle('all')
                    setBudgetType('all')
                    setShowUrgentOnly(false)
                  }}
                  className="jobs-results__clear"
                >
                  フィルターをクリア
                </button>
              )}
            </div>

            {/* Jobs List */}
            <div className="jobs-list">
              {filteredJobs.map(job => (
                <FreelanceJobCard key={job.id} {...job} />
              ))}
            </div>

            {/* Load More */}
            {filteredJobs.length > 0 && (
              <div className="jobs-load-more">
                <Button variant="secondary">
                  もっと見る
                </Button>
              </div>
            )}

            {/* Empty State */}
            {filteredJobs.length === 0 && (
              <div className="jobs-empty">
                <div className="jobs-empty__icon">🔍</div>
                <h3 className="jobs-empty__title">案件が見つかりませんでした</h3>
                <p className="jobs-empty__text">
                  フィルター条件を変更してお試しください
                </p>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setSelectedCategory('all')
                    setWorkStyle('all')
                    setBudgetType('all')
                    setShowUrgentOnly(false)
                  }}
                >
                  フィルターをリセット
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Benefits Section - Full Width */}
      <div className="jobs-benefits">
        <h2 className="jobs-benefits__title">選ばれる理由</h2>
        <div className="jobs-benefits__grid">
          <div className="jobs-benefit">
            <div className="jobs-benefit__icon">💰</div>
            <div className="jobs-benefit__title">高単価案件多数</div>
            <div className="jobs-benefit__description">
              月単価80万円以上の案件が全体の60%以上。スキルに見合った報酬を実現。
            </div>
          </div>
          <div className="jobs-benefit">
            <div className="jobs-benefit__icon">🏠</div>
            <div className="jobs-benefit__title">リモート案件充実</div>
            <div className="jobs-benefit__description">
              89%がリモート対応。場所に縛られない自由な働き方をサポート。
            </div>
          </div>
          <div className="jobs-benefit">
            <div className="jobs-benefit__icon">🛡️</div>
            <div className="jobs-benefit__title">安心の決済保証</div>
            <div className="jobs-benefit__description">
              エスクロー決済で報酬を保証。トラブル時も24時間体制でサポート。
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Full Width */}
      <div className="jobs-cta">
        <div className="jobs-cta__content">
          <h2 className="jobs-cta__title">案件をお探しの企業様へ</h2>
          <p className="jobs-cta__description">
            優秀なエンジニアが多数在籍。最短1日でマッチング可能です。
          </p>
          <Link href="/jobs/post">
            <Button variant="primary" size="large">
              案件を掲載する（無料）
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}