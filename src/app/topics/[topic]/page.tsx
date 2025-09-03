'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import { ScrapCard } from '@/components/cards/ScrapCard'
import '@/styles/pages/topics.css'

// トピックアイコンマッピング
const getTopicIcon = (topic: string) => {
  const icons: Record<string, string> = {
    'Next.js': '⚡',
    'React': '⚛️',
    'TypeScript': '🔷',
    'JavaScript': '💛',
    'Rust': '🦀',
    'Go': '🐹',
    'Python': '🐍',
    'AWS': '☁️',
    'Docker': '🐳',
    'Kubernetes': '☸️',
    'GraphQL': '🔄',
    'Node.js': '💚',
    'Vue.js': '💚',
    'Angular': '🔺',
    'Git': '🔀'
  }
  return icons[topic] || '📚'
}

// サンプルデータ
const getTopicData = (topic: string) => {
  const decodedTopic = decodeURIComponent(topic)
  
  return {
    name: decodedTopic,
    icon: getTopicIcon(decodedTopic),
    description: getTopicDescription(decodedTopic),
    followersCount: Math.floor(Math.random() * 50000) + 10000,
    articlesCount: Math.floor(Math.random() * 5000) + 1000,
    booksCount: Math.floor(Math.random() * 100) + 20,
    scrapsCount: Math.floor(Math.random() * 1000) + 200,
    weeklyGrowth: Math.floor(Math.random() * 20) + 5,
    monthlyViews: Math.floor(Math.random() * 100000) + 50000,
    activeAuthors: Math.floor(Math.random() * 500) + 100,
    avgEngagement: (Math.random() * 5 + 3).toFixed(1),
    isFollowing: false,
    relatedTopics: getRelatedTopics(decodedTopic),
    trendingAuthors: getTrendingAuthors(decodedTopic)
  }
}

const getTopicDescription = (topic: string) => {
  const descriptions: Record<string, string> = {
    'Next.js': 'Vercelが開発するReactベースのフルスタックフレームワーク。SSR、SSG、ISRなど多様なレンダリング手法をサポートし、最新のWeb開発のベストプラクティスを実現。',
    'React': 'Meta（旧Facebook）が開発したUIライブラリ。コンポーネントベースの開発により、再利用可能で保守性の高いユーザーインターフェースを構築。',
    'TypeScript': 'Microsoftが開発したJavaScriptのスーパーセット。静的型付けにより大規模アプリケーションの開発効率と保守性を大幅に向上。',
    'Rust': 'メモリ安全性と高速性を両立するシステムプログラミング言語。所有権システムにより、ガベージコレクタなしで安全性を保証。',
    'Go': 'Googleが開発したシンプルで高速なプログラミング言語。並行処理が得意で、マイクロサービス開発に最適。',
    'AWS': 'Amazon Web Services - 世界最大のクラウドプラットフォーム。200以上のサービスで、あらゆるビジネスニーズに対応。',
    'GraphQL': 'Facebookが開発したAPI用クエリ言語。必要なデータだけを効率的に取得し、オーバーフェッチング問題を解決。',
    'Docker': 'コンテナ型仮想化技術のデファクトスタンダード。開発環境の統一とアプリケーションの可搬性を実現。'
  }
  return descriptions[topic] || `${topic}は、モダンな開発において重要な技術です。多くの開発者が日々新しい知識を共有しています。`
}

const getRelatedTopics = (topic: string) => {
  const related: Record<string, string[]> = {
    'Next.js': ['React', 'TypeScript', 'Vercel', 'SSR', 'JavaScript', 'Tailwind CSS'],
    'React': ['Next.js', 'TypeScript', 'Redux', 'JavaScript', 'React Native', 'Vite'],
    'TypeScript': ['JavaScript', 'React', 'Node.js', 'Angular', 'Vue.js', 'Deno'],
    'Rust': ['WebAssembly', 'Systems Programming', 'Tokio', 'Actix', 'Memory Safety'],
    'Go': ['Docker', 'Kubernetes', 'Microservices', 'gRPC', 'Cloud Native', 'Gin']
  }
  return related[topic] || ['JavaScript', 'プログラミング', 'Web開発', 'Backend', 'Frontend', 'DevOps']
}

const getTrendingAuthors = (topic: string) => {
  return [
    { username: 'expert1', name: '田中太郎', avatar: '/images/avatar-placeholder.svg', articlesCount: 45, followers: 2341, rank: 1 },
    { username: 'expert2', name: '佐藤花子', avatar: '/images/avatar-placeholder.svg', articlesCount: 38, followers: 1892, rank: 2 },
    { username: 'expert3', name: '鈴木一郎', avatar: '/images/avatar-placeholder.svg', articlesCount: 32, followers: 1567, rank: 3 },
    { username: 'expert4', name: '高橋美咲', avatar: '/images/avatar-placeholder.svg', articlesCount: 28, followers: 1234, rank: 4 },
    { username: 'expert5', name: '山田次郎', avatar: '/images/avatar-placeholder.svg', articlesCount: 24, followers: 987, rank: 5 }
  ]
}

const getTopicContent = (topic: string) => {
  const articles = [
    {
      id: '1',
      title: `${topic} 2025年最新アップデート完全ガイド`,
      emoji: '🚀',
      author: {
        username: 'developer1',
        name: '田中太郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-15T10:00:00Z',
      readTime: '8分',
      likes: 456,
      comments: 23,
      type: 'tech' as const,
      tags: [topic, 'アップデート', '2025']
    },
    {
      id: '2',
      title: `実践${topic} - 大規模プロダクションでの運用事例`,
      emoji: '💡',
      author: {
        username: 'developer2',
        name: '佐藤花子',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-14T10:00:00Z',
      readTime: '12分',
      likes: 342,
      comments: 18,
      type: 'tech' as const,
      tags: [topic, '実践', 'プロダクション']
    },
    {
      id: '3',
      title: `${topic}パフォーマンス最適化テクニック10選`,
      emoji: '⚡',
      author: {
        username: 'developer3',
        name: '鈴木一郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-13T10:00:00Z',
      readTime: '15分',
      likes: 289,
      comments: 15,
      type: 'tech' as const,
      tags: [topic, 'パフォーマンス', '最適化']
    }
  ]
  
  const books = [
    {
      id: 'book1',
      title: `${topic}完全マスターガイド 2025年版`,
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'author1',
        name: '山田次郎',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 3500 as number,
      likes: 189,
      publishedAt: '2025-01-10T10:00:00Z',
      description: `${topic}を基礎から応用まで体系的に学習できる決定版`,
      chapters: 20,
      pages: 450
    },
    {
      id: 'book2',
      title: `実践${topic}アーキテクチャ設計`,
      coverImage: '/images/placeholder.svg',
      author: {
        username: 'author2',
        name: '高橋健太',
        avatar: '/images/avatar-placeholder.svg'
      },
      price: 'free' as const,
      likes: 234,
      publishedAt: '2024-12-15T10:00:00Z',
      description: '現場で使える設計パターンとベストプラクティス',
      chapters: 15,
      pages: 320
    }
  ]
  
  const scraps = [
    {
      id: 'scrap1',
      title: `${topic}のベストプラクティスについて議論しましょう`,
      author: {
        username: 'developer4',
        name: '高橋美咲',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T18:30:00Z',
      commentsCount: 24,
      isOpen: true,
      emoji: '💭',
      excerpt: `${topic}を使用する際のベストプラクティスについて、皆さんの意見を聞かせてください。特にプロダクション環境での...`
    },
    {
      id: 'scrap2',
      title: `${topic} vs 他の技術スタック - 適材適所の選び方`,
      author: {
        username: 'developer5',
        name: '渡辺太一',
        avatar: '/images/avatar-placeholder.svg'
      },
      publishedAt: '2025-01-14T09:00:00Z',
      updatedAt: '2025-01-15T12:00:00Z',
      commentsCount: 31,
      isOpen: false,
      emoji: '🤔',
      excerpt: 'プロジェクトの要件に応じて適切な技術スタックを選ぶことが重要です。それぞれの長所短所を比較して...'
    }
  ]
  
  return { articles, books, scraps }
}

export default function TopicPage({ params }: { params: { topic: string } }) {
  const [activeTab, setActiveTab] = useState('all')
  const [isFollowing, setIsFollowing] = useState(false)
  
  const topic = getTopicData(params.topic)
  const content = getTopicContent(params.topic)
  
  const tabs = [
    { id: 'all', label: 'すべて', icon: '📋' },
    { id: 'articles', label: '記事', count: topic.articlesCount, icon: '📝' },
    { id: 'books', label: '本', count: topic.booksCount, icon: '📚' },
    { id: 'scraps', label: 'スクラップ', count: topic.scrapsCount, icon: '💭' }
  ]
  
  return (
    <div className="topics-page">
      <div className="container py-8">
        <div className="max-w-7xl mx-auto">
          {/* トピックヒーローセクション */}
          <div className="topic-hero">
            <div className="topic-hero__content">
              <div className="topic-hero__header">
                <div>
                  <div className="topic-hero__title">
                    <div className="topic-hero__icon">{topic.icon}</div>
                    {topic.name}
                  </div>
                  <p className="topic-hero__description">{topic.description}</p>
                </div>
                <button 
                  className={`topic-hero__follow-btn ${isFollowing ? 'topic-hero__follow-btn--following' : ''}`}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? '✓ フォロー中' : '+ フォロー'}
                </button>
              </div>
              
              <div className="topic-hero__stats">
                <div className="topic-hero__stat">
                  <div className="topic-hero__stat-value">{topic.followersCount.toLocaleString()}</div>
                  <div className="topic-hero__stat-label">フォロワー</div>
                </div>
                <div className="topic-hero__stat">
                  <div className="topic-hero__stat-value">{topic.articlesCount.toLocaleString()}</div>
                  <div className="topic-hero__stat-label">記事</div>
                </div>
                <div className="topic-hero__stat">
                  <div className="topic-hero__stat-value">{topic.monthlyViews.toLocaleString()}</div>
                  <div className="topic-hero__stat-label">月間ビュー</div>
                </div>
                <div className="topic-hero__stat">
                  <div className="topic-hero__stat-value">{topic.activeAuthors}</div>
                  <div className="topic-hero__stat-label">アクティブ著者</div>
                </div>
              </div>
              
              <div className="topic-hero__tags">
                {topic.relatedTopics.map(related => (
                  <Link
                    key={related}
                    href={`/topics/${encodeURIComponent(related)}`}
                    className="topic-hero__tag"
                  >
                    {getTopicIcon(related)} {related}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* ナビゲーションタブ */}
          <div className="topic-nav">
            <div className="topic-nav__tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`topic-nav__tab ${activeTab === tab.id ? 'topic-nav__tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="topic-nav__tab-icon">{tab.icon}</span>
                  {tab.label}
                  {tab.count && (
                    <span className="topic-nav__tab-count">{tab.count.toLocaleString()}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="topic-layout">
            {/* メインコンテンツ */}
            <main className="topic-main">
              {(activeTab === 'all' || activeTab === 'articles') && (
                <section className="topic-section">
                  <div className="topic-section__header">
                    <h2 className="topic-section__title">
                      <span className="topic-section__title-icon">📝</span>
                      最新の記事
                    </h2>
                    <Link href={`/articles?tag=${encodeURIComponent(topic.name)}`} className="topic-section__more">
                      もっと見る →
                    </Link>
                  </div>
                  <div className="topic-content-grid">
                    {content.articles.length > 0 ? (
                      content.articles.map(article => (
                        <div key={article.id} className="topic-article-card">
                          <ArticleCard {...article} />
                        </div>
                      ))
                    ) : (
                      <div className="topic-empty">
                        <div className="topic-empty__icon">📝</div>
                        <h3 className="topic-empty__title">まだ記事がありません</h3>
                        <p className="topic-empty__text">最初の記事を投稿してみませんか？</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
              
              {(activeTab === 'all' || activeTab === 'books') && (
                <section className="topic-section">
                  <div className="topic-section__header">
                    <h2 className="topic-section__title">
                      <span className="topic-section__title-icon">📚</span>
                      おすすめの本
                    </h2>
                    <Link href={`/books?tag=${encodeURIComponent(topic.name)}`} className="topic-section__more">
                      もっと見る →
                    </Link>
                  </div>
                  <div className="topic-book-grid">
                    {content.books.length > 0 ? (
                      content.books.map(book => (
                        <BookCard key={book.id} {...book} />
                      ))
                    ) : (
                      <div className="topic-empty">
                        <div className="topic-empty__icon">📚</div>
                        <h3 className="topic-empty__title">まだ本がありません</h3>
                        <p className="topic-empty__text">知識を体系的にまとめた本を公開してみませんか？</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
              
              {(activeTab === 'all' || activeTab === 'scraps') && (
                <section className="topic-section">
                  <div className="topic-section__header">
                    <h2 className="topic-section__title">
                      <span className="topic-section__title-icon">💭</span>
                      アクティブなスクラップ
                    </h2>
                    <Link href={`/scraps?tag=${encodeURIComponent(topic.name)}`} className="topic-section__more">
                      もっと見る →
                    </Link>
                  </div>
                  <div className="topic-content-grid">
                    {content.scraps.length > 0 ? (
                      content.scraps.map(scrap => (
                        <div key={scrap.id} className="topic-scrap-card">
                          <ScrapCard {...scrap} />
                        </div>
                      ))
                    ) : (
                      <div className="topic-empty">
                        <div className="topic-empty__icon">💭</div>
                        <h3 className="topic-empty__title">まだスクラップがありません</h3>
                        <p className="topic-empty__text">気軽に質問や議論を始めてみましょう</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </main>
            
            {/* サイドバー */}
            <aside className="topic-sidebar">
              {/* トレンド著者 */}
              <div className="topic-widget">
                <h3 className="topic-widget__title">
                  <span className="topic-widget__title-icon">🏆</span>
                  トップコントリビューター
                </h3>
                <div className="topic-authors">
                  {topic.trendingAuthors.map(author => (
                    <Link
                      key={author.username}
                      href={`/@${author.username}`}
                      className="topic-author"
                    >
                      <div className={`topic-author__rank topic-author__rank--${
                        author.rank === 1 ? 'gold' : author.rank === 2 ? 'silver' : 'bronze'
                      }`}>
                        {author.rank}
                      </div>
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="topic-author__avatar"
                      />
                      <div className="topic-author__info">
                        <div className="topic-author__name">{author.name}</div>
                        <div className="topic-author__stats">
                          <span className="topic-author__count">{author.articlesCount}</span> 記事 · {author.followers.toLocaleString()} フォロワー
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* インサイト */}
              <div className="topic-widget topic-insights">
                <h3 className="topic-widget__title">
                  <span className="topic-widget__title-icon">📊</span>
                  トピックインサイト
                </h3>
                <div className="topic-insights__grid">
                  <div className="topic-insight">
                    <div className="topic-insight__label">週間成長率</div>
                    <div className="topic-insight__value">
                      +{topic.weeklyGrowth}%
                      <span className="topic-insight__trend">↑</span>
                    </div>
                  </div>
                  <div className="topic-insight">
                    <div className="topic-insight__label">平均エンゲージメント</div>
                    <div className="topic-insight__value">
                      {topic.avgEngagement}
                      <span className="topic-insight__trend">↑</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="topic-cta">
                <div className="topic-cta__icon">✍️</div>
                <h3 className="topic-cta__title">{topic.name}について書こう</h3>
                <p className="topic-cta__text">
                  あなたの知識や経験を共有して、コミュニティに貢献しませんか？
                </p>
                <Link href={`/new/article?topic=${encodeURIComponent(topic.name)}`}>
                  <button className="topic-cta__button">
                    記事を投稿する
                  </button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}