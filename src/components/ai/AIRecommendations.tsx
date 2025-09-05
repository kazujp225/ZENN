'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import '@/styles/components/ai-recommendations.css'

interface Recommendation {
  id: string
  title: string
  type: 'article' | 'book' | 'scrap'
  author: {
    name: string
    avatar: string
  }
  tags: string[]
  score: number
  reason: string
  emoji: string
  link: string
}

interface AIRecommendationsProps {
  userId?: string
  currentContent?: {
    type: string
    tags: string[]
    title?: string
  }
  maxItems?: number
}

export const AIRecommendations = ({ 
  userId, 
  currentContent,
  maxItems = 5 
}: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [userId, currentContent])

  const fetchRecommendations = async () => {
    setIsLoading(true)
    
    // AIによるレコメンデーションのシミュレーション
    setTimeout(() => {
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          title: 'Next.js 14 App RouterでのSSR最適化テクニック',
          type: 'article',
          author: {
            name: '田中太郎',
            avatar: '/images/avatar-placeholder.svg'
          },
          tags: ['Next.js', 'React', 'Performance'],
          score: 0.95,
          reason: '現在読んでいる記事と関連する最新技術',
          emoji: '🚀',
          link: '/articles/nextjs-ssr-optimization'
        },
        {
          id: '2',
          title: 'TypeScript 5.0の新機能完全ガイド',
          type: 'book',
          author: {
            name: '佐藤花子',
            avatar: '/images/avatar-placeholder.svg'
          },
          tags: ['TypeScript', 'JavaScript'],
          score: 0.92,
          reason: 'あなたの学習履歴に基づく推薦',
          emoji: '📘',
          link: '/books/typescript-5-guide'
        },
        {
          id: '3',
          title: 'Rust vs Go - パフォーマンス比較',
          type: 'scrap',
          author: {
            name: '鈴木一郎',
            avatar: '/images/avatar-placeholder.svg'
          },
          tags: ['Rust', 'Go', 'Performance'],
          score: 0.88,
          reason: 'トレンドに基づく提案',
          emoji: '🔥',
          link: '/scraps/rust-vs-go'
        },
        {
          id: '4',
          title: 'AWS Lambda関数の最適化手法',
          type: 'article',
          author: {
            name: '山田次郎',
            avatar: '/images/avatar-placeholder.svg'
          },
          tags: ['AWS', 'Serverless', 'Performance'],
          score: 0.85,
          reason: '似た興味を持つユーザーが読んでいます',
          emoji: '☁️',
          link: '/articles/aws-lambda-optimization'
        },
        {
          id: '5',
          title: 'React Server Componentsの実装パターン',
          type: 'article',
          author: {
            name: '伊藤真理',
            avatar: '/images/avatar-placeholder.svg'
          },
          tags: ['React', 'RSC', 'Next.js'],
          score: 0.82,
          reason: '関連トピックの深掘り',
          emoji: '⚛️',
          link: '/articles/react-server-components'
        }
      ]
      
      setRecommendations(mockRecommendations.slice(0, maxItems))
      setIsLoading(false)
    }, 1500)
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'article': return '#3B82F6'
      case 'book': return '#8B5CF6'
      case 'scrap': return '#10B981'
      default: return '#6B7280'
    }
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return '超おすすめ'
    if (score >= 0.8) return 'おすすめ'
    if (score >= 0.7) return '関連'
    return '参考'
  }

  return (
    <div className="ai-recommendations">
      <div className="ai-recommendations__header">
        <div className="ai-recommendations__title">
          <span className="ai-recommendations__icon">🤖</span>
          <h3>AI がおすすめするコンテンツ</h3>
        </div>
        <button 
          className="ai-recommendations__refresh"
          onClick={fetchRecommendations}
          disabled={isLoading}
        >
          🔄 更新
        </button>
      </div>

      {isLoading ? (
        <div className="ai-recommendations__loading">
          <div className="ai-recommendations__loading-icon">🤖</div>
          <p>AIが最適なコンテンツを分析中...</p>
          <div className="ai-recommendations__loading-bar">
            <div className="ai-recommendations__loading-progress"></div>
          </div>
        </div>
      ) : (
        <div className="ai-recommendations__list">
          {recommendations.map((rec, index) => (
            <Link 
              key={rec.id}
              href={rec.link}
              className="ai-recommendation-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="ai-recommendation-card__score">
                <div 
                  className="ai-recommendation-card__score-circle"
                  style={{
                    background: `conic-gradient(${getTypeColor(rec.type)} ${rec.score * 360}deg, #E5E7EB ${rec.score * 360}deg)`
                  }}
                >
                  <div className="ai-recommendation-card__score-inner">
                    <span className="ai-recommendation-card__score-value">
                      {Math.round(rec.score * 100)}
                    </span>
                    <span className="ai-recommendation-card__score-label">%</span>
                  </div>
                </div>
                <span className="ai-recommendation-card__score-text">
                  {getScoreLabel(rec.score)}
                </span>
              </div>

              <div className="ai-recommendation-card__content">
                <div className="ai-recommendation-card__header">
                  <span className="ai-recommendation-card__emoji">{rec.emoji}</span>
                  <span 
                    className="ai-recommendation-card__type"
                    style={{ background: `${getTypeColor(rec.type)}20`, color: getTypeColor(rec.type) }}
                  >
                    {rec.type === 'article' ? '記事' : rec.type === 'book' ? '本' : 'スクラップ'}
                  </span>
                </div>

                <h4 className="ai-recommendation-card__title">{rec.title}</h4>

                <div className="ai-recommendation-card__meta">
                  <img 
                    src={rec.author.avatar} 
                    alt={rec.author.name}
                    className="ai-recommendation-card__avatar"
                  />
                  <span className="ai-recommendation-card__author">{rec.author.name}</span>
                </div>

                <div className="ai-recommendation-card__tags">
                  {rec.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="ai-recommendation-card__tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div 
                  className="ai-recommendation-card__reason"
                  onMouseEnter={() => setSelectedReason(rec.id)}
                  onMouseLeave={() => setSelectedReason(null)}
                >
                  <span className="ai-recommendation-card__reason-icon">💡</span>
                  <span className="ai-recommendation-card__reason-text">
                    {rec.reason}
                  </span>
                  {selectedReason === rec.id && (
                    <div className="ai-recommendation-card__reason-tooltip">
                      AIがこのコンテンツを推薦する理由：
                      <br />• 読書履歴の分析
                      <br />• タグの関連性
                      <br />• トレンド分析
                      <br />• ユーザー行動パターン
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="ai-recommendations__footer">
        <p className="ai-recommendations__footer-text">
          🔍 AIは常に学習を続けています
        </p>
        <Link href="/settings/ai-preferences" className="ai-recommendations__footer-link">
          推薦設定をカスタマイズ →
        </Link>
      </div>
    </div>
  )
}