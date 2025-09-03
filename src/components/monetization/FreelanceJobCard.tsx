import Link from 'next/link'
import Image from 'next/image'
import { FreelanceJob } from '@/types/monetization'
import '@/styles/components/freelance-job-card.css'

interface FreelanceJobCardProps extends FreelanceJob {}

export const FreelanceJobCard = ({
  id,
  client,
  title,
  description,
  category,
  skills,
  budget,
  duration,
  workStyle,
  location,
  proposals,
  status,
  postedAt,
  deadline,
  requirements
}: FreelanceJobCardProps) => {
  const formatBudget = (budget: typeof FreelanceJobCard.prototype.budget) => {
    const currency = budget.currency === 'JPY' ? '¥' : '$'
    if (budget.type === 'negotiable') {
      return '要相談'
    }
    if (budget.type === 'hourly') {
      return `${currency}${budget.min.toLocaleString()} - ${currency}${budget.max.toLocaleString()}/時`
    }
    return `${currency}${budget.min.toLocaleString()} - ${currency}${budget.max.toLocaleString()}`
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'web-development': 'Web開発',
      'mobile-development': 'モバイル開発',
      'backend': 'バックエンド',
      'frontend': 'フロントエンド',
      'fullstack': 'フルスタック',
      'devops': 'DevOps',
      'data-science': 'データサイエンス',
      'machine-learning': '機械学習',
      'security': 'セキュリティ',
      'blockchain': 'ブロックチェーン',
      'game-development': 'ゲーム開発',
      'other': 'その他'
    }
    return labels[category] || category
  }

  const getWorkStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      'remote': 'リモート',
      'onsite': 'オンサイト',
      'hybrid': 'ハイブリッド'
    }
    return labels[style] || style
  }

  const getWorkStyleIcon = (style: string) => {
    const icons: Record<string, string> = {
      'remote': '🏠',
      'onsite': '🏢',
      'hybrid': '🔄'
    }
    return icons[style] || '📍'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'freelance-job-card__status--open'
      case 'in-progress': return 'freelance-job-card__status--progress'
      case 'closed': return 'freelance-job-card__status--closed'
      case 'completed': return 'freelance-job-card__status--completed'
      default: return ''
    }
  }

  const daysAgo = Math.floor((new Date().getTime() - new Date(postedAt).getTime()) / (1000 * 60 * 60 * 24))
  const isNew = daysAgo <= 3
  const isUrgent = deadline && new Date(deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000

  return (
    <article className="freelance-job-card">
      <div className="freelance-job-card__inner">
        {/* Badges */}
        <div className="freelance-job-card__badges">
          {isNew && (
            <span className="freelance-job-card__badge freelance-job-card__badge--new">
              NEW
            </span>
          )}
          {isUrgent && (
            <span className="freelance-job-card__badge freelance-job-card__badge--urgent">
              急募
            </span>
          )}
          {client.isVerified && (
            <span className="freelance-job-card__badge freelance-job-card__badge--verified">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 0L7 2L9.5 1.5L9 4L11 5.5L9 7L9.5 9.5L7 9L6 11L5 9L2.5 9.5L3 7L1 5.5L3 4L2.5 1.5L5 2L6 0Z" fill="currentColor"/>
                <path d="M4 5.5L5.5 7L8 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              認証済み
            </span>
          )}
          <span className={`freelance-job-card__status ${getStatusColor(status)}`}>
            {status === 'open' ? '募集中' : 
             status === 'in-progress' ? '進行中' :
             status === 'closed' ? '締切' : '完了'}
          </span>
        </div>

        {/* Header */}
        <div className="freelance-job-card__header">
          <div className="freelance-job-card__category">
            <span className="freelance-job-card__category-label">
              {getCategoryLabel(category)}
            </span>
          </div>
          <div className="freelance-job-card__budget">
            <span className="freelance-job-card__budget-label">予算</span>
            <span className="freelance-job-card__budget-amount">
              {formatBudget(budget)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="freelance-job-card__content">
          <h3 className="freelance-job-card__title">
            <Link href={`/jobs/${id}`}>
              {title}
            </Link>
          </h3>

          <p className="freelance-job-card__description">
            {description.substring(0, 150)}...
          </p>

          {/* Key Info */}
          <div className="freelance-job-card__info">
            <div className="freelance-job-card__info-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>期間: {duration}</span>
            </div>
            <div className="freelance-job-card__info-item">
              <span className="freelance-job-card__work-style-icon">
                {getWorkStyleIcon(workStyle)}
              </span>
              <span>{getWorkStyleLabel(workStyle)}</span>
              {location && workStyle !== 'remote' && (
                <span className="freelance-job-card__location">({location})</span>
              )}
            </div>
            {deadline && (
              <div className="freelance-job-card__info-item freelance-job-card__info-item--deadline">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 2V6M5 2V6M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>締切: {new Date(deadline).toLocaleDateString('ja-JP')}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="freelance-job-card__skills">
            <span className="freelance-job-card__skills-label">必要スキル:</span>
            <div className="freelance-job-card__skills-list">
              {skills.slice(0, 5).map(skill => (
                <span key={skill} className="freelance-job-card__skill">
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="freelance-job-card__skill freelance-job-card__skill--more">
                  +{skills.length - 5}
                </span>
              )}
            </div>
          </div>

          {/* Requirements Preview */}
          {requirements.length > 0 && (
            <div className="freelance-job-card__requirements">
              <span className="freelance-job-card__requirements-label">主な要件:</span>
              <ul className="freelance-job-card__requirements-list">
                {requirements.slice(0, 2).map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Client Info */}
          <div className="freelance-job-card__client">
            <Link href={`/@${client.username}`} className="freelance-job-card__client-link">
              <Image
                src={client.avatar}
                alt={client.name}
                width={32}
                height={32}
                className="freelance-job-card__client-avatar"
              />
              <div className="freelance-job-card__client-info">
                <div className="freelance-job-card__client-name">
                  {client.name}
                  {client.company && (
                    <span className="freelance-job-card__client-company"> - {client.company}</span>
                  )}
                </div>
                {client.rating && (
                  <div className="freelance-job-card__client-rating">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="#FCD34D">
                      <path d="M7 1L8.5 5L13 5.5L10 8.5L10.5 13L7 11L3.5 13L4 8.5L1 5.5L5.5 5L7 1Z"/>
                    </svg>
                    <span>{client.rating.toFixed(1)}</span>
                    {client.totalJobs && (
                      <span className="freelance-job-card__client-jobs">
                        ({client.totalJobs}件の実績)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Stats */}
          <div className="freelance-job-card__stats">
            <div className="freelance-job-card__stat">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 10C9.65685 10 11 8.65685 11 7C11 5.34315 9.65685 4 8 4C6.34315 4 5 5.34315 5 7C5 8.65685 6.34315 10 8 10Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 10.5C13 13 10.5 15 8 15C5.5 15 3 13 3 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{proposals}件の提案</span>
            </div>
            <div className="freelance-job-card__stat">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{daysAgo === 0 ? '今日' : `${daysAgo}日前`}に投稿</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="freelance-job-card__footer">
          <Link href={`/jobs/${id}`} className="freelance-job-card__button freelance-job-card__button--detail">
            詳細を見る
          </Link>
          {status === 'open' && (
            <Link href={`/jobs/${id}/apply`} className="freelance-job-card__button freelance-job-card__button--apply">
              提案する
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}