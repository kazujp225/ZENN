import Link from 'next/link'
import Image from 'next/image'
import { Consultation } from '@/types/monetization'
import '@/styles/components/consultation-card.css'

interface ConsultationCardProps extends Consultation {}

export const ConsultationCard = ({
  id,
  mentor,
  title,
  description,
  category,
  price,
  duration,
  currency,
  availableSlots,
  tags,
  reviews
}: ConsultationCardProps) => {
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'JPY') {
      return `¥${price.toLocaleString()}`
    }
    return `$${price}`
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'career': 'キャリア相談',
      'technical': '技術相談',
      'code-review': 'コードレビュー',
      'architecture': 'アーキテクチャ設計',
      'debugging': 'デバッグ支援',
      'learning': '学習サポート',
      'interview-prep': '面接対策',
      'other': 'その他'
    }
    return labels[category] || category
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'career': '💼',
      'technical': '🔧',
      'code-review': '👀',
      'architecture': '🏗️',
      'debugging': '🐛',
      'learning': '📚',
      'interview-prep': '🎯',
      'other': '💬'
    }
    return icons[category] || '💬'
  }

  const availableSlotsCount = availableSlots.filter(slot => !slot.isBooked).length

  return (
    <article className="consultation-card">
      <div className="consultation-card__inner">
        {/* Status Badge */}
        <div className="consultation-card__status">
          {mentor.isAvailable ? (
            <span className="consultation-card__available">
              <span className="consultation-card__status-dot"></span>
              対応可能
            </span>
          ) : (
            <span className="consultation-card__busy">
              <span className="consultation-card__status-dot consultation-card__status-dot--busy"></span>
              対応不可
            </span>
          )}
        </div>

        {/* Header */}
        <div className="consultation-card__header">
          <div className="consultation-card__category">
            <span className="consultation-card__category-icon">{getCategoryIcon(category)}</span>
            <span className="consultation-card__category-label">{getCategoryLabel(category)}</span>
          </div>
          <div className="consultation-card__price">
            <span className="consultation-card__price-amount">{formatPrice(price, currency)}</span>
            <span className="consultation-card__price-duration">/ {duration}分</span>
          </div>
        </div>

        {/* Content */}
        <div className="consultation-card__content">
          <h3 className="consultation-card__title">
            <Link href={`/consultations/${id}`}>
              {title}
            </Link>
          </h3>
          
          <p className="consultation-card__description">
            {description}
          </p>

          {/* Mentor Info */}
          <div className="consultation-card__mentor">
            <Link href={`/@${mentor.username}`} className="consultation-card__mentor-link">
              <Image
                src={mentor.avatar}
                alt={mentor.name}
                width={48}
                height={48}
                className="consultation-card__mentor-avatar"
              />
              <div className="consultation-card__mentor-info">
                <div className="consultation-card__mentor-name">{mentor.name}</div>
                <div className="consultation-card__mentor-title">{mentor.title}</div>
              </div>
            </Link>
            {mentor.rating > 0 && (
              <div className="consultation-card__mentor-rating">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#FCD34D">
                  <path d="M8 1L9.5 5.5L14 6L11 9L11.5 13.5L8 11.5L4.5 13.5L5 9L2 6L6.5 5.5L8 1Z"/>
                </svg>
                <span>{mentor.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="consultation-card__stats">
            <div className="consultation-card__stat">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>応答: {mentor.responseTime}</span>
            </div>
            <div className="consultation-card__stat">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{mentor.totalSessions}回実施</span>
            </div>
            {availableSlotsCount > 0 && (
              <div className="consultation-card__stat consultation-card__stat--highlight">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 2V6M5 2V6M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>{availableSlotsCount}枠空き</span>
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="consultation-card__languages">
            {mentor.languages.map(lang => (
              <span key={lang} className="consultation-card__language">
                {lang}
              </span>
            ))}
          </div>

          {/* Tags */}
          <div className="consultation-card__tags">
            {tags.slice(0, 4).map(tag => (
              <span key={tag} className="consultation-card__tag">
                {tag}
              </span>
            ))}
          </div>

          {/* Reviews Summary */}
          {reviews.length > 0 && (
            <div className="consultation-card__reviews">
              <div className="consultation-card__review-snippet">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 9.5V9.5C5.5 9.5 4 8.5 4 7V3.5C4 2.5 4.5 2 5.5 2H8.5C9.5 2 10 2.5 10 3.5V7C10 8.5 8.5 9.5 7 9.5Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 9.5V11.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <p className="consultation-card__review-text">
                  &ldquo;{reviews[0].comment.substring(0, 50)}...&rdquo;
                </p>
              </div>
              <Link href={`/consultations/${id}#reviews`} className="consultation-card__reviews-link">
                {reviews.length}件のレビューを見る →
              </Link>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="consultation-card__footer">
          <Link href={`/consultations/${id}`} className="consultation-card__button consultation-card__button--detail">
            詳細を見る
          </Link>
          {mentor.isAvailable && availableSlotsCount > 0 && (
            <Link href={`/consultations/${id}/book`} className="consultation-card__button consultation-card__button--book">
              予約する
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}