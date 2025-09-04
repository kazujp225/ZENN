'use client'

import { useState } from 'react'
import { ConsultationCard } from '@/components/monetization/ConsultationCard'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Consultation } from '@/types/monetization'
import '@/styles/pages/consultations.css'

// 拡張されたサンプルデータ
const getConsultations = (): Consultation[] => {
  return [
    {
      id: '1',
      mentor: {
        username: 'senior_dev',
        name: '山田太郎',
        avatar: '/images/avatar-placeholder.svg',
        title: 'シニアフルスタックエンジニア',
        bio: '10年以上の開発経験。スタートアップから大企業まで幅広く支援。',
        rating: 4.9,
        totalSessions: 234,
        responseTime: '24時間以内',
        languages: ['日本語', 'English'],
        isAvailable: true
      },
      title: 'キャリア相談 - エンジニアとしての成長戦略',
      description: 'エンジニアとしてのキャリアパス、技術選定、転職戦略など、あなたの悩みに寄り添います。',
      category: 'career',
      price: 5000,
      duration: 60,
      currency: 'JPY',
      availableSlots: [
        { id: '1', date: '2025-01-20', startTime: '10:00', endTime: '11:00', isBooked: false },
        { id: '2', date: '2025-01-20', startTime: '14:00', endTime: '15:00', isBooked: false },
        { id: '3', date: '2025-01-21', startTime: '10:00', endTime: '11:00', isBooked: true }
      ],
      tags: ['キャリア', '転職', 'スキルアップ', 'フルスタック'],
      reviews: [
        {
          id: '1',
          reviewer: { username: 'user1', name: '佐藤花子', avatar: '/images/avatar-placeholder.svg' },
          rating: 5,
          comment: '的確なアドバイスで転職に成功しました！',
          createdAt: '2025-01-10T10:00:00Z',
          helpful: 12
        }
      ],
      policies: {
        cancellation: '24時間前まで無料キャンセル可能',
        refund: '満足いただけない場合は全額返金',
        rescheduling: '48時間前まで日程変更可能'
      }
    },
    {
      id: '2',
      mentor: {
        username: 'react_expert',
        name: '鈴木花子',
        avatar: '/images/avatar-placeholder.svg',
        title: 'React専門家',
        bio: 'React/Next.jsのエキスパート。大規模プロジェクトの設計経験豊富。',
        rating: 4.8,
        totalSessions: 189,
        responseTime: '12時間以内',
        languages: ['日本語'],
        isAvailable: true
      },
      title: 'Reactアーキテクチャ設計レビュー',
      description: 'Reactアプリの設計をレビューし、パフォーマンス改善やベストプラクティスを提案します。',
      category: 'architecture',
      price: 8000,
      duration: 90,
      currency: 'JPY',
      availableSlots: [
        { id: '4', date: '2025-01-22', startTime: '13:00', endTime: '14:30', isBooked: false },
        { id: '5', date: '2025-01-23', startTime: '15:00', endTime: '16:30', isBooked: false }
      ],
      tags: ['React', 'Next.js', 'アーキテクチャ', 'パフォーマンス'],
      reviews: [],
      policies: {
        cancellation: '48時間前まで無料キャンセル可能',
        refund: '初回相談のみ返金対応',
        rescheduling: '72時間前まで日程変更可能'
      }
    },
    {
      id: '3',
      mentor: {
        username: 'aws_architect',
        name: '高橋健太',
        avatar: '/images/avatar-placeholder.svg',
        title: 'AWSソリューションアーキテクト',
        bio: 'AWS認定プロフェッショナル。クラウド移行からコスト最適化まで。',
        rating: 4.7,
        totalSessions: 156,
        responseTime: '48時間以内',
        languages: ['日本語', 'English'],
        isAvailable: false
      },
      title: 'AWSインフラ設計・コスト最適化相談',
      description: 'AWSのインフラ設計、セキュリティ、コスト最適化について専門的なアドバイスを提供。',
      category: 'technical',
      price: 10000,
      duration: 120,
      currency: 'JPY',
      availableSlots: [],
      tags: ['AWS', 'クラウド', 'インフラ', 'コスト最適化'],
      reviews: [
        {
          id: '2',
          reviewer: { username: 'user2', name: '田中一郎', avatar: '/images/avatar-placeholder.svg' },
          rating: 5,
          comment: 'コストを40%削減できました！',
          createdAt: '2025-01-08T10:00:00Z',
          helpful: 23
        }
      ],
      policies: {
        cancellation: '72時間前まで無料キャンセル可能',
        refund: '満足保証あり',
        rescheduling: '1週間前まで日程変更可能'
      }
    },
    {
      id: '4',
      mentor: {
        username: 'mobile_dev',
        name: '伊藤美咲',
        avatar: '/images/avatar-placeholder.svg',
        title: 'モバイルアプリ開発スペシャリスト',
        bio: 'iOS/Android両プラットフォーム対応。React Native、Flutter経験豊富。',
        rating: 4.9,
        totalSessions: 298,
        responseTime: '12時間以内',
        languages: ['日本語', 'English'],
        isAvailable: true
      },
      title: 'クロスプラットフォームアプリ開発相談',
      description: 'React Native、Flutterでのアプリ開発、パフォーマンス最適化を支援します。',
      category: 'technical',
      price: 7500,
      duration: 60,
      currency: 'JPY',
      availableSlots: [
        { id: '6', date: '2025-01-20', startTime: '09:00', endTime: '10:00', isBooked: false },
        { id: '7', date: '2025-01-21', startTime: '14:00', endTime: '15:00', isBooked: false }
      ],
      tags: ['React Native', 'Flutter', 'iOS', 'Android', 'モバイル'],
      reviews: [
        {
          id: '3',
          reviewer: { username: 'user3', name: '山本涼子', avatar: '/images/avatar-placeholder.svg' },
          rating: 5,
          comment: '複雑なバグを一緒に解決してもらえました！',
          createdAt: '2025-01-15T10:00:00Z',
          helpful: 18
        }
      ],
      policies: {
        cancellation: '24時間前まで無料キャンセル可能',
        refund: '初回相談のみ返金対応',
        rescheduling: '48時間前まで日程変更可能'
      }
    },
    {
      id: '5',
      mentor: {
        username: 'ai_ml_expert',
        name: '中村大輔',
        avatar: '/images/avatar-placeholder.svg',
        title: 'AI/ML エンジニア',
        bio: '機械学習、深層学習、データサイエンスのエキスパート。PyTorch、TensorFlow精通。',
        rating: 4.8,
        totalSessions: 167,
        responseTime: '24時間以内',
        languages: ['日本語'],
        isAvailable: true
      },
      title: '機械学習プロジェクト設計・実装支援',
      description: 'MLパイプライン構築、モデル選定、ハイパーパラメータチューニングを支援。',
      category: 'technical',
      price: 12000,
      duration: 90,
      currency: 'JPY',
      availableSlots: [
        { id: '8', date: '2025-01-22', startTime: '16:00', endTime: '17:30', isBooked: false },
        { id: '9', date: '2025-01-24', startTime: '10:00', endTime: '11:30', isBooked: false }
      ],
      tags: ['機械学習', 'AI', 'Python', 'TensorFlow', 'PyTorch'],
      reviews: [],
      policies: {
        cancellation: '48時間前まで無料キャンセル可能',
        refund: '満足保証あり',
        rescheduling: '72時間前まで日程変更可能'
      }
    },
    {
      id: '6',
      mentor: {
        username: 'devops_ninja',
        name: '渡辺健',
        avatar: '/images/avatar-placeholder.svg',
        title: 'DevOpsエンジニア',
        bio: 'CI/CD、Kubernetes、Docker、インフラ自動化のプロフェッショナル。',
        rating: 4.6,
        totalSessions: 143,
        responseTime: '36時間以内',
        languages: ['日本語', 'English'],
        isAvailable: true
      },
      title: 'DevOps導入・自動化コンサルティング',
      description: 'CI/CDパイプライン構築、コンテナ化、インフラ自動化を包括的にサポート。',
      category: 'architecture',
      price: 9000,
      duration: 75,
      currency: 'JPY',
      availableSlots: [
        { id: '10', date: '2025-01-23', startTime: '13:00', endTime: '14:15', isBooked: false }
      ],
      tags: ['DevOps', 'CI/CD', 'Docker', 'Kubernetes', 'Jenkins'],
      reviews: [
        {
          id: '4',
          reviewer: { username: 'user4', name: '斎藤翔', avatar: '/images/avatar-placeholder.svg' },
          rating: 4,
          comment: 'デプロイ時間を80%短縮できました。',
          createdAt: '2025-01-12T10:00:00Z',
          helpful: 14
        }
      ],
      policies: {
        cancellation: '24時間前まで無料キャンセル可能',
        refund: '初回相談のみ返金対応',
        rescheduling: '48時間前まで日程変更可能'
      }
    }
  ]
}

export default function ConsultationsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<'all' | 'under-5000' | '5000-10000' | 'over-10000'>('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  
  const consultations = getConsultations()
  
  // フィルタリング
  let filteredConsultations = consultations
  
  if (selectedCategory !== 'all') {
    filteredConsultations = filteredConsultations.filter(c => c.category === selectedCategory)
  }
  
  if (onlyAvailable) {
    filteredConsultations = filteredConsultations.filter(c => c.mentor.isAvailable && c.availableSlots.length > 0)
  }
  
  if (priceRange !== 'all') {
    filteredConsultations = filteredConsultations.filter(c => {
      switch (priceRange) {
        case 'under-5000': return c.price < 5000
        case '5000-10000': return c.price >= 5000 && c.price <= 10000
        case 'over-10000': return c.price > 10000
        default: return true
      }
    })
  }
  
  const tabs = [
    { id: 'all', label: 'すべて' },
    { id: 'available', label: '予約可能' },
    { id: 'popular', label: '人気' },
    { id: 'new', label: '新着' }
  ]
  
  const categories = [
    { value: 'all', label: 'すべて', emoji: '🔍' },
    { value: 'career', label: 'キャリア相談', emoji: '💼' },
    { value: 'technical', label: '技術相談', emoji: '🔧' },
    { value: 'code-review', label: 'コードレビュー', emoji: '👀' },
    { value: 'architecture', label: 'アーキテクチャ設計', emoji: '🏗️' },
    { value: 'debugging', label: 'デバッグ支援', emoji: '🐛' },
    { value: 'learning', label: '学習サポート', emoji: '📚' },
    { value: 'interview-prep', label: '面接対策', emoji: '🎯' }
  ]
  
  return (
    <div className="consultations-page">
      {/* Minimalist Hero Section - Remove container wrapper for full width */}
      <div className="consultations-hero consultations-hero--minimal">
          <div className="consultations-hero__inner">
            <div className="consultations-hero__main">
              <div className="consultations-hero__title-wrapper">
                <h1 className="consultations-hero__title">
                  <span className="consultations-hero__title-line">
                    <span className="consultations-hero__title-text">技術的な課題を、</span>
                  </span>
                  <span className="consultations-hero__title-line">
                    <span className="consultations-hero__title-accent">専門家</span>
                    <span className="consultations-hero__title-text">と共に。</span>
                  </span>
                </h1>
                <div className="consultations-hero__title-decoration">
                  <svg width="60" height="4" viewBox="0 0 60 4" fill="none">
                    <rect x="0" y="0" width="20" height="4" rx="2" fill="#6366F1" opacity="0.6"/>
                    <rect x="24" y="0" width="12" height="4" rx="2" fill="#6366F1" opacity="0.4"/>
                    <rect x="40" y="0" width="20" height="4" rx="2" fill="#6366F1" opacity="0.2"/>
                  </svg>
                </div>
              </div>
              <p className="consultations-hero__description">
                500名を超える現役エンジニアが、あなたの技術相談に対応。<br />
                キャリア、開発、学習まで幅広くサポートします。
              </p>
              
              <div className="consultations-hero__stats">
                <div className="consultations-hero__stat">
                  <span className="consultations-hero__stat-number">10,000+</span>
                  <span className="consultations-hero__stat-label">相談実績</span>
                </div>
                <div className="consultations-hero__stat">
                  <span className="consultations-hero__stat-number">4.8</span>
                  <span className="consultations-hero__stat-label">満足度</span>
                </div>
                <div className="consultations-hero__stat">
                  <span className="consultations-hero__stat-number">24h</span>
                  <span className="consultations-hero__stat-label">平均返信</span>
                </div>
                <div className="consultations-hero__stat">
                  <span className="consultations-hero__stat-number">500+</span>
                  <span className="consultations-hero__stat-label">専門家</span>
                </div>
              </div>

              <div className="consultations-hero__actions">
                <Link href="/consultations/search">
                  <Button variant="primary" className="consultations-hero__btn consultations-hero__btn--primary">
                    相談を始める
                  </Button>
                </Link>
                <Link href="/consultations/how-it-works">
                  <Button variant="ghost" className="consultations-hero__btn consultations-hero__btn--ghost">
                    利用方法
                  </Button>
                </Link>
              </div>

              <div className="consultations-hero__features">
                <span className="consultations-hero__feature">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  満足保証
                </span>
                <span className="consultations-hero__feature">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  安全決済
                </span>
                <span className="consultations-hero__feature">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  24時間前取消可
                </span>
              </div>
            </div>
          </div>
      </div>

      {/* How It Works Section */}
      <div className="consultations-how-it-works">
          <h2 className="consultations-how-it-works__title">ご利用の流れ</h2>
          <div className="consultations-how-it-works__steps">
            <div className="consultations-how-it-works__step">
              <div className="consultations-how-it-works__step-number">1</div>
              <div className="consultations-how-it-works__step-icon">🔍</div>
              <h3>相談相手を探す</h3>
              <p>カテゴリや専門分野から最適なメンターを検索</p>
            </div>
            <div className="consultations-how-it-works__step">
              <div className="consultations-how-it-works__step-number">2</div>
              <div className="consultations-how-it-works__step-icon">📅</div>
              <h3>日程を予約</h3>
              <p>都合の良い日時を選んで相談を予約</p>
            </div>
            <div className="consultations-how-it-works__step">
              <div className="consultations-how-it-works__step-number">3</div>
              <div className="consultations-how-it-works__step-icon">💬</div>
              <h3>相談する</h3>
              <p>ビデオ通話で1対1の相談を実施</p>
            </div>
            <div className="consultations-how-it-works__step">
              <div className="consultations-how-it-works__step-number">4</div>
              <div className="consultations-how-it-works__step-icon">📝</div>
              <h3>フォローアップ</h3>
              <p>相談後も継続的なサポートを受けられます</p>
            </div>
          </div>
      </div>

      {/* Main content starts here with container */}
      <div className="container py-8">
        {/* Popular Topics */}
        <div className="consultations-popular-topics">
          <h2 className="consultations-popular-topics__title">人気の相談トピック</h2>
          <div className="consultations-popular-topics__grid">
            <div className="consultations-popular-topic">
              <div className="consultations-popular-topic__icon">💼</div>
              <div className="consultations-popular-topic__content">
                <h3>転職・キャリアアップ</h3>
                <p>スキルセット診断、面接対策、職務経歴書添削</p>
                <span className="consultations-popular-topic__count">1,234件の相談</span>
              </div>
            </div>
            <div className="consultations-popular-topic">
              <div className="consultations-popular-topic__icon">🚀</div>
              <div className="consultations-popular-topic__content">
                <h3>スタートアップ立ち上げ</h3>
                <p>技術選定、MVP開発、チーム構築のアドバイス</p>
                <span className="consultations-popular-topic__count">892件の相談</span>
              </div>
            </div>
            <div className="consultations-popular-topic">
              <div className="consultations-popular-topic__icon">🔄</div>
              <div className="consultations-popular-topic__content">
                <h3>コードレビュー・リファクタリング</h3>
                <p>設計改善、パフォーマンス最適化、ベストプラクティス</p>
                <span className="consultations-popular-topic__count">756件の相談</span>
              </div>
            </div>
            <div className="consultations-popular-topic">
              <div className="consultations-popular-topic__icon">🎓</div>
              <div className="consultations-popular-topic__content">
                <h3>プログラミング学習支援</h3>
                <p>学習ロードマップ、効率的な勉強法、実践課題</p>
                <span className="consultations-popular-topic__count">2,145件の相談</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="consultations-categories">
          {categories.map(category => (
            <button
              key={category.value}
              className={`consultations-category ${selectedCategory === category.value ? 'consultations-category--active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              <span className="consultations-category__emoji">{category.emoji}</span>
              <span className="consultations-category__label">{category.label}</span>
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

        <div className="consultations-layout">
          {/* Sidebar */}
          <aside className="consultations-sidebar">
            {/* Filters */}
            <div className="consultations-filter">
              <h3 className="consultations-filter__title">絞り込み</h3>
              
              {/* Price Range */}
              <div className="consultations-filter__section">
                <h4 className="consultations-filter__subtitle">価格帯</h4>
                <div className="consultations-filter__options">
                  <label className="consultations-filter__option">
                    <input 
                      type="radio" 
                      name="price" 
                      value="all"
                      checked={priceRange === 'all'}
                      onChange={(e) => setPriceRange(e.target.value as any)}
                    />
                    <span>すべて</span>
                  </label>
                  <label className="consultations-filter__option">
                    <input 
                      type="radio" 
                      name="price" 
                      value="under-5000"
                      checked={priceRange === 'under-5000'}
                      onChange={(e) => setPriceRange(e.target.value as any)}
                    />
                    <span>¥5,000未満</span>
                  </label>
                  <label className="consultations-filter__option">
                    <input 
                      type="radio" 
                      name="price" 
                      value="5000-10000"
                      checked={priceRange === '5000-10000'}
                      onChange={(e) => setPriceRange(e.target.value as any)}
                    />
                    <span>¥5,000 - ¥10,000</span>
                  </label>
                  <label className="consultations-filter__option">
                    <input 
                      type="radio" 
                      name="price" 
                      value="over-10000"
                      checked={priceRange === 'over-10000'}
                      onChange={(e) => setPriceRange(e.target.value as any)}
                    />
                    <span>¥10,000以上</span>
                  </label>
                </div>
              </div>

              {/* Availability */}
              <div className="consultations-filter__section">
                <label className="consultations-filter__checkbox">
                  <input 
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                  />
                  <span>予約可能なメンターのみ</span>
                </label>
              </div>
            </div>

            {/* Top Mentors */}
            <div className="consultations-top-mentors">
              <h3 className="consultations-top-mentors__title">⭐ トップメンター</h3>
              <div className="consultations-top-mentors__list">
                <Link href="/senior_dev" className="consultations-top-mentor">
                  <img src="/images/avatar-placeholder.svg" alt="" className="consultations-top-mentor__avatar" />
                  <div className="consultations-top-mentor__info">
                    <div className="consultations-top-mentor__name">山田太郎</div>
                    <div className="consultations-top-mentor__rating">⭐ 4.9 (234)</div>
                  </div>
                </Link>
                <Link href="/react_expert" className="consultations-top-mentor">
                  <img src="/images/avatar-placeholder.svg" alt="" className="consultations-top-mentor__avatar" />
                  <div className="consultations-top-mentor__info">
                    <div className="consultations-top-mentor__name">鈴木花子</div>
                    <div className="consultations-top-mentor__rating">⭐ 4.8 (189)</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Benefits */}
            <div className="consultations-benefits">
              <h3 className="consultations-benefits__title">🛡️ 安心保証</h3>
              <ul className="consultations-benefits__list">
                <li>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  満足保証制度
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  24時間前まで無料キャンセル
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  安全な決済システム
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  録画・メモ機能付き
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="consultations-main">
            {/* Results */}
            <div className="consultations-results">
              <span className="consultations-results__count">
                {filteredConsultations.length}件の相談
              </span>
              {(selectedCategory !== 'all' || priceRange !== 'all' || onlyAvailable) && (
                <button 
                  onClick={() => {
                    setSelectedCategory('all')
                    setPriceRange('all')
                    setOnlyAvailable(false)
                  }}
                  className="consultations-results__clear"
                >
                  フィルターをクリア
                </button>
              )}
            </div>

            {/* Consultations Grid */}
            <div className="consultations-grid">
              {filteredConsultations.map(consultation => (
                <ConsultationCard key={consultation.id} {...consultation} />
              ))}
            </div>

            {/* Load More */}
            {filteredConsultations.length > 0 && (
              <div className="consultations-load-more">
                <Button variant="secondary">
                  もっと見る
                </Button>
              </div>
            )}

            {/* Empty State */}
            {filteredConsultations.length === 0 && (
              <div className="consultations-empty">
                <div className="consultations-empty__icon">🔍</div>
                <h3 className="consultations-empty__title">該当する相談が見つかりませんでした</h3>
                <p className="consultations-empty__description">
                  フィルター条件を変更するか、別のカテゴリをお試しください
                </p>
                <Button 
                  variant="primary"
                  onClick={() => {
                    setSelectedCategory('all')
                    setPriceRange('all')
                    setOnlyAvailable(false)
                  }}
                >
                  フィルターをリセット
                </Button>
              </div>
            )}
          </main>
        </div>

        {/* Success Stories Section */}
        <div className="consultations-success-stories">
          <h2 className="consultations-success-stories__title">相談者の声</h2>
          <div className="consultations-success-stories__grid">
            <div className="consultations-success-story">
              <div className="consultations-success-story__header">
                <img src="/images/avatar-placeholder.svg" alt="" className="consultations-success-story__avatar" />
                <div>
                  <div className="consultations-success-story__name">田中太郎さん</div>
                  <div className="consultations-success-story__role">フロントエンドエンジニア</div>
                </div>
              </div>
              <div className="consultations-success-story__rating">
                {'⭐'.repeat(5)}
              </div>
              <p className="consultations-success-story__comment">
                「転職活動で悩んでいましたが、的確なアドバイスのおかげで理想の会社に入社できました。技術面接の対策も丁寧にサポートしていただき、本当に感謝しています。」
              </p>
              <div className="consultations-success-story__mentor">
                相談相手: @senior_dev
              </div>
            </div>
            <div className="consultations-success-story">
              <div className="consultations-success-story__header">
                <img src="/images/avatar-placeholder.svg" alt="" className="consultations-success-story__avatar" />
                <div>
                  <div className="consultations-success-story__name">佐藤美咲さん</div>
                  <div className="consultations-success-story__role">Webデザイナー → エンジニア</div>
                </div>
              </div>
              <div className="consultations-success-story__rating">
                {'⭐'.repeat(5)}
              </div>
              <p className="consultations-success-story__comment">
                「デザイナーからエンジニアへの転向を考えていて、学習方法から実践的な課題まで丁寧に教えていただきました。3ヶ月で転職に成功しました！」
              </p>
              <div className="consultations-success-story__mentor">
                相談相手: @react_expert
              </div>
            </div>
            <div className="consultations-success-story">
              <div className="consultations-success-story__header">
                <img src="/images/avatar-placeholder.svg" alt="" className="consultations-success-story__avatar" />
                <div>
                  <div className="consultations-success-story__name">山田健司さん</div>
                  <div className="consultations-success-story__role">スタートアップCTO</div>
                </div>
              </div>
              <div className="consultations-success-story__rating">
                {'⭐'.repeat(5)}
              </div>
              <p className="consultations-success-story__comment">
                「AWSのコストが月100万円を超えていましたが、アーキテクチャの見直しで40%削減できました。実践的なアドバイスで助かりました。」
              </p>
              <div className="consultations-success-story__mentor">
                相談相手: @aws_architect
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="consultations-faq">
          <h2 className="consultations-faq__title">よくある質問</h2>
          <div className="consultations-faq__grid">
            <details className="consultations-faq__item">
              <summary className="consultations-faq__question">
                <span>相談料金はいくらですか？</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="consultations-faq__answer">
                メンターや相談内容により異なりますが、30分3,000円〜120分20,000円程度が一般的です。各メンターのプロフィールページで詳細な料金をご確認いただけます。
              </div>
            </details>
            <details className="consultations-faq__item">
              <summary className="consultations-faq__question">
                <span>キャンセルはできますか？</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="consultations-faq__answer">
                相談の24時間前までは無料でキャンセル可能です。それ以降のキャンセルは料金の50%が発生します。メンターによってポリシーが異なる場合があります。
              </div>
            </details>
            <details className="consultations-faq__item">
              <summary className="consultations-faq__question">
                <span>どんな相談ができますか？</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="consultations-faq__answer">
                技術的な質問、キャリア相談、コードレビュー、アーキテクチャ設計、学習方法など、エンジニアリングに関わる幅広い相談が可能です。
              </div>
            </details>
            <details className="consultations-faq__item">
              <summary className="consultations-faq__question">
                <span>相談後のサポートはありますか？</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="consultations-faq__answer">
                相談後7日間はチャットでの質問が可能です。また、継続的なメンタリングプランも用意されています。詳細は各メンターのプロフィールをご確認ください。
              </div>
            </details>
            <details className="consultations-faq__item">
              <summary className="consultations-faq__question">
                <span>メンターになるには？</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="consultations-faq__answer">
                3年以上の実務経験があるエンジニアの方であれば申請可能です。審査後、メンターとして活動できます。詳細は「メンターになる」ページをご覧ください。
              </div>
            </details>
            <details className="consultations-faq__item">
              <summary className="consultations-faq__question">
                <span>支払い方法は？</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <div className="consultations-faq__answer">
                クレジットカード（Visa、Mastercard、AMEX、JCB）およびPayPalでのお支払いが可能です。企業向けには請求書払いにも対応しています。
              </div>
            </details>
          </div>
          <div className="consultations-faq__footer">
            <p>その他の質問は<Link href="/help" className="link">ヘルプセンター</Link>をご覧ください</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="consultations-cta">
          <div className="consultations-cta__content">
            <h2 className="consultations-cta__title">エキスパートとして活躍しませんか？</h2>
            <p className="consultations-cta__description">
              あなたの経験と知識を活かして、次世代のエンジニアを育成しましょう
            </p>
            <div className="consultations-cta__benefits">
              <div className="consultations-cta__benefit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8V16M8 12L16 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/>
                </svg>
                <span>月収30万円以上の実績多数</span>
              </div>
              <div className="consultations-cta__benefit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8V16M8 12L16 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/>
                </svg>
                <span>完全リモート・好きな時間に</span>
              </div>
              <div className="consultations-cta__benefit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8V16M8 12L16 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/>
                </svg>
                <span>手数料業界最安水準15%</span>
              </div>
            </div>
            <Link href="/consultations/become-mentor">
              <Button variant="primary" size="large">
                メンター登録する（無料）
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}