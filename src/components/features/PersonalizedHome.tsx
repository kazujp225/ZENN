'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import '@/styles/components/personalized-home.css'

// 個人化されたコンテンツのダミーデータ
const getPersonalizedContent = (username: string) => {
  return {
    forYou: [
      {
        id: 'fy1',
        title: 'あなたにおすすめ: React 19の新機能を先取り',
        emoji: '⚛️',
        author: {
          username: 'react_team',
          name: 'React Team',
          avatar: '/images/avatar-placeholder.svg'
        },
        excerpt: 'React 19で導入される新機能を詳しく解説。Server ComponentsやSuspenseの改善点など。',
        publishedAt: '2025-01-16T08:00:00Z',
        readTime: '7分',
        likes: 456,
        comments: 23,
        type: 'tech' as const,
        tags: ['React', 'JavaScript', 'Web']
      },
      {
        id: 'fy2',
        title: 'TypeScript 5.5の新機能で開発効率UP',
        emoji: '📘',
        author: {
          username: 'ts_guru',
          name: 'TypeScript愛好家',
          avatar: '/images/avatar-placeholder.svg'
        },
        excerpt: 'TypeScript 5.5で追加された新しい型機能を活用して、より安全で効率的なコード開発を実現。',
        publishedAt: '2025-01-15T14:00:00Z',
        readTime: '5分',
        likes: 234,
        comments: 12,
        type: 'tech' as const,
        tags: ['TypeScript', 'Development']
      }
    ],
    followingUpdates: [
      {
        id: 'fu1',
        type: 'article',
        action: '新しい記事を投稿しました',
        title: 'Viteの設定を最適化する10のテクニック',
        author: {
          username: 'frontend_master',
          name: 'フロントエンドマスター',
          avatar: '/images/avatar-placeholder.svg'
        },
        time: '2時間前'
      },
      {
        id: 'fu2',
        type: 'book',
        action: '新しい本を公開しました',
        title: 'プロダクション Ready な Next.js アプリケーション',
        author: {
          username: 'nextjs_expert',
          name: 'Next.js エキスパート',
          avatar: '/images/avatar-placeholder.svg'
        },
        time: '5時間前'
      },
      {
        id: 'fu3',
        type: 'scrap',
        action: 'スクラップを更新しました',
        title: 'AI開発の最新トレンドについて議論',
        author: {
          username: 'ai_researcher',
          name: 'AI研究者',
          avatar: '/images/avatar-placeholder.svg'
        },
        time: '1日前'
      }
    ],
    continueReading: [
      {
        id: 'cr1',
        title: 'Docker入門 - コンテナ技術の基礎',
        emoji: '🐳',
        progress: 65,
        lastRead: '昨日',
        estimatedTime: '残り5分'
      },
      {
        id: 'cr2',
        title: 'AWS Lambda実践ガイド',
        emoji: '☁️',
        progress: 30,
        lastRead: '3日前',
        estimatedTime: '残り12分'
      }
    ],
    recommendedAuthors: [
      {
        username: 'cloud_architect',
        name: 'クラウドアーキテクト',
        avatar: '/images/avatar-placeholder.svg',
        bio: 'AWS認定ソリューションアーキテクト。クラウドネイティブな設計について発信',
        followers: 5432,
        articles: 89
      },
      {
        username: 'rust_evangelist',
        name: 'Rustエバンジェリスト',
        avatar: '/images/avatar-placeholder.svg',
        bio: 'Rustで高性能システムを構築。メモリ安全性とパフォーマンスの両立を追求',
        followers: 3210,
        articles: 67
      }
    ]
  }
}

export const PersonalizedHome = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou')
  
  if (!user) return null
  
  const content = getPersonalizedContent(user.username)
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'article': return '📝'
      case 'book': return '📚'
      case 'scrap': return '💭'
      default: return '📌'
    }
  }
  
  return (
    <div className="personalized-home">
      {/* ウェルカムバナー */}
      <div className="personalized-home__banner">
        <div className="personalized-home__banner-content">
          <h2 className="personalized-home__banner-title">
            おかえりなさい、{user.displayName}さん！
          </h2>
          <p className="personalized-home__banner-subtitle">
            今日も素晴らしい学びの一日にしましょう ✨
          </p>
        </div>
        <div className="personalized-home__banner-stats">
          <div className="personalized-home__stat">
            <span className="personalized-home__stat-value">7</span>
            <span className="personalized-home__stat-label">連続ログイン日数</span>
          </div>
          <div className="personalized-home__stat">
            <span className="personalized-home__stat-value">23</span>
            <span className="personalized-home__stat-label">今週の閲覧記事</span>
          </div>
        </div>
      </div>
      
      {/* 継続して読む */}
      {content.continueReading.length > 0 && (
        <div className="personalized-home__continue">
          <h3 className="personalized-home__section-title">
            <span className="personalized-home__section-icon">📖</span>
            読みかけの記事
          </h3>
          <div className="personalized-home__continue-list">
            {content.continueReading.map(article => (
              <Link 
                key={article.id} 
                href={`/articles/${article.id}`}
                className="personalized-home__continue-item"
              >
                <div className="personalized-home__continue-content">
                  <span className="personalized-home__continue-emoji">{article.emoji}</span>
                  <div className="personalized-home__continue-info">
                    <h4 className="personalized-home__continue-title">{article.title}</h4>
                    <div className="personalized-home__continue-meta">
                      <span>{article.lastRead}に読んだ</span>
                      <span>•</span>
                      <span>{article.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                <div className="personalized-home__continue-progress">
                  <div className="personalized-home__progress-bar">
                    <div 
                      className="personalized-home__progress-fill"
                      style={{ width: `${article.progress}%` }}
                    />
                  </div>
                  <span className="personalized-home__progress-text">{article.progress}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* メインコンテンツ */}
      <div className="personalized-home__main">
        {/* タブナビゲーション */}
        <div className="personalized-home__tabs">
          <button
            className={`personalized-home__tab ${activeTab === 'forYou' ? 'personalized-home__tab--active' : ''}`}
            onClick={() => setActiveTab('forYou')}
          >
            <span className="personalized-home__tab-icon">✨</span>
            For You
          </button>
          <button
            className={`personalized-home__tab ${activeTab === 'following' ? 'personalized-home__tab--active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            <span className="personalized-home__tab-icon">👥</span>
            フォロー中
          </button>
        </div>
        
        {/* タブコンテンツ */}
        <div className="personalized-home__tab-content">
          {activeTab === 'forYou' ? (
            <div className="personalized-home__articles">
              {content.forYou.map(article => (
                <ArticleCard key={article.id} {...article} />
              ))}
            </div>
          ) : (
            <div className="personalized-home__updates">
              {content.followingUpdates.map(update => (
                <div key={update.id} className="personalized-home__update">
                  <img 
                    src={update.author.avatar} 
                    alt={update.author.name}
                    className="personalized-home__update-avatar"
                  />
                  <div className="personalized-home__update-content">
                    <p className="personalized-home__update-text">
                      <strong>{update.author.name}</strong>さんが
                      <span className="personalized-home__update-action">{update.action}</span>
                    </p>
                    <h4 className="personalized-home__update-title">
                      <span className="personalized-home__update-icon">
                        {getActivityIcon(update.type)}
                      </span>
                      {update.title}
                    </h4>
                    <time className="personalized-home__update-time">{update.time}</time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* おすすめの著者 */}
      <div className="personalized-home__authors">
        <h3 className="personalized-home__section-title">
          <span className="personalized-home__section-icon">🌟</span>
          おすすめの著者
        </h3>
        <div className="personalized-home__authors-list">
          {content.recommendedAuthors.map(author => (
            <div key={author.username} className="personalized-home__author">
              <Link href={`/${author.username}`} className="personalized-home__author-header">
                <img 
                  src={author.avatar} 
                  alt={author.name}
                  className="personalized-home__author-avatar"
                />
                <div className="personalized-home__author-info">
                  <h4 className="personalized-home__author-name">{author.name}</h4>
                  <p className="personalized-home__author-username">@{author.username}</p>
                </div>
              </Link>
              <p className="personalized-home__author-bio">{author.bio}</p>
              <div className="personalized-home__author-stats">
                <span>👥 {author.followers.toLocaleString()} フォロワー</span>
                <span>📝 {author.articles} 記事</span>
              </div>
              <button className="personalized-home__author-follow">
                フォロー
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}