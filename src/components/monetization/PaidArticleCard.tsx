import Link from 'next/link'
import Image from 'next/image'
import { PaidArticle } from '@/types/monetization'

interface PaidArticleCardProps extends PaidArticle {}

export const PaidArticleCard = ({
  id,
  title,
  emoji,
  author,
  price,
  currency,
  previewContent,
  publishedAt,
  purchaseCount,
  rating,
  reviews,
  tags,
  estimatedReadTime,
  isPurchased
}: PaidArticleCardProps) => {
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'JPY') {
      return `¥${price.toLocaleString()}`
    }
    return `$${price}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return '今日'
    if (diffInDays === 1) return '昨日'
    if (diffInDays < 7) return `${diffInDays}日前`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}週間前`
    return date.toLocaleDateString('ja-JP')
  }

  return (
    <article className="paid-article-card">
      <div className="paid-article-card__inner">
        {/* Price Badge */}
        <div className="paid-article-card__price-badge">
          {isPurchased ? (
            <span className="paid-article-card__purchased">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              購入済み
            </span>
          ) : (
            <span className="paid-article-card__price">
              {formatPrice(price, currency)}
            </span>
          )}
        </div>

        {/* Header */}
        <div className="paid-article-card__header">
          <span className="paid-article-card__emoji">{emoji}</span>
          <div className="paid-article-card__meta">
            <span className="paid-article-card__read-time">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {estimatedReadTime}分
            </span>
            {author.isVerified && (
              <span className="paid-article-card__verified" title="認証済み作者">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 0L8.5 2.5L11.5 2L11 5L13.5 6.5L11 8L11.5 11L8.5 10.5L7 13L5.5 10.5L2.5 11L3 8L0.5 6.5L3 5L2.5 2L5.5 2.5L7 0Z" fill="#3B82F6"/>
                  <path d="M4.5 6.5L6 8L9.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="paid-article-card__content">
          <h3 className="paid-article-card__title">
            <Link href={`/articles/${id}`}>
              {title}
            </Link>
          </h3>
          
          <p className="paid-article-card__preview">
            {previewContent}
          </p>

          {/* Stats */}
          <div className="paid-article-card__stats">
            <div className="paid-article-card__stat">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 10C9.65685 10 11 8.65685 11 7C11 5.34315 9.65685 4 8 4C6.34315 4 5 5.34315 5 7C5 8.65685 6.34315 10 8 10Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 10.5C13 13 10.5 15 8 15C5.5 15 3 13 3 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M5 1V3M11 1V3M8 1V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{purchaseCount}人が購入</span>
            </div>
            {reviews > 0 && (
              <div className="paid-article-card__stat">
                <div className="paid-article-card__rating">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill={i < Math.floor(rating) ? "#FCD34D" : "none"}>
                      <path d="M7 1L8.5 5L13 5.5L10 8.5L10.5 13L7 11L3.5 13L4 8.5L1 5.5L5.5 5L7 1Z" stroke={i < Math.floor(rating) ? "#FCD34D" : "#D1D5DB"} strokeWidth="1"/>
                    </svg>
                  ))}
                  <span>{rating.toFixed(1)}</span>
                </div>
                <span>({reviews})</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="paid-article-card__tags">
            {tags.slice(0, 3).map(tag => (
              <Link key={tag} href={`/tags/${tag}`} className="paid-article-card__tag">
                {tag}
              </Link>
            ))}
            {tags.length > 3 && (
              <span className="paid-article-card__tag paid-article-card__tag--more">
                +{tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="paid-article-card__footer">
          <Link href={`/@${author.username}`} className="paid-article-card__author">
            <Image
              src={author.avatar}
              alt={author.name}
              width={24}
              height={24}
              className="paid-article-card__author-avatar"
            />
            <span className="paid-article-card__author-name">{author.name}</span>
          </Link>
          <time className="paid-article-card__date" dateTime={publishedAt}>
            {formatDate(publishedAt)}
          </time>
        </div>

        {/* Hover Overlay */}
        <div className="paid-article-card__overlay">
          <Link href={`/articles/${id}`} className="paid-article-card__overlay-button">
            {isPurchased ? '記事を読む' : '詳細を見る'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}