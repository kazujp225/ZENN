'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface ScrapCardProps {
  id: string
  title: string
  author: {
    username: string
    name: string
    avatar: string
  }
  publishedAt: string
  updatedAt: string
  commentsCount: number
  isOpen: boolean
  emoji?: string
  excerpt?: string
}

export const ScrapCard = ({
  id,
  title,
  author,
  publishedAt,
  updatedAt,
  commentsCount,
  isOpen,
  emoji,
  excerpt
}: ScrapCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  // author のバリデーション
  if (!author || !author.username) {
    console.warn('ScrapCard: Invalid author data', { id, title, author })
    return null
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return '今日'
    if (diffInDays === 1) return '昨日'
    if (diffInDays < 7) return `${diffInDays}日前`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}週間前`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}ヶ月前`
    return `${Math.floor(diffInDays / 365)}年前`
  }

  return (
    <article 
      className="scrap-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="scrap-card__inner">
        {/* Status Bar */}
        <div className="scrap-card__status-bar">
          <div className="flex items-center gap-3">
            {emoji && (
              <span className="scrap-card__emoji">
                {emoji}
              </span>
            )}
            <span className={`scrap-card__badge ${isOpen ? 'scrap-card__badge--open' : 'scrap-card__badge--closed'}`}>
              <span className="scrap-card__badge-dot"></span>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          {commentsCount > 0 && (
            <div className="scrap-card__comments">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="scrap-card__comments-icon">
                <path d="M14 10.5V3C14 2.44772 13.5523 2 13 2H3C2.44772 2 2 2.44772 2 3V10.5C2 11.0523 2.44772 11.5 3 11.5H8.5L11.5 14V11.5H13C13.5523 11.5 14 11.0523 14 10.5Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{commentsCount}</span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="scrap-card__content">
          <h3 className="scrap-card__title">
            <Link href={`/scraps/${id}`}>
              {title}
            </Link>
          </h3>
          
          {excerpt && (
            <p className="scrap-card__excerpt">
              {excerpt}
            </p>
          )}
        </div>
        
        {/* Footer */}
        <div className="scrap-card__footer">
          <Link href={`/${author.username}`} className="scrap-card__author">
            <div className="scrap-card__author-avatar">
              <Image
                src={author.avatar}
                alt={author.name}
                width={32}
                height={32}
                className="scrap-card__author-avatar-img"
              />
            </div>
            <div className="scrap-card__author-info">
              <span className="scrap-card__author-name">{author.name}</span>
              <div className="scrap-card__meta">
                <time dateTime={updatedAt || publishedAt}>
                  {formatDate(updatedAt || publishedAt)}
                </time>
                {updatedAt && updatedAt !== publishedAt && (
                  <span className="scrap-card__updated">更新</span>
                )}
              </div>
            </div>
          </Link>
        </div>
        
        {/* Hover Effect Line */}
        <div className={`scrap-card__hover-line ${isHovered ? 'scrap-card__hover-line--active' : ''}`}></div>
      </div>
    </article>
  )
}