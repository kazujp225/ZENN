import React from 'react';
import Link from 'next/link';
import '@/styles/components/card.css';

interface BaseCardProps {
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<BaseCardProps> = ({ 
  className = '', 
  onClick, 
  hoverable = true,
  children 
}) => {
  return (
    <div 
      className={`card ${hoverable ? 'card--hoverable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface ArticleCardProps {
  id: string;
  title: string;
  emoji: string;
  excerpt?: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  publishedAt: string;
  readTime?: string;
  likes: number;
  comments: number;
  tags?: string[];
  type?: 'tech' | 'idea';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  emoji,
  excerpt,
  author,
  publishedAt,
  readTime,
  likes,
  comments,
  tags = [],
  type = 'tech'
}) => {
  return (
    <Link href={`/articles/${id}`} className="article-card">
      <Card>
        <div className="article-card__header">
          <span className="article-card__emoji">{emoji}</span>
          {type === 'idea' && (
            <span className="article-card__type">アイデア</span>
          )}
        </div>
        
        <h3 className="article-card__title">{title}</h3>
        
        {excerpt && (
          <p className="article-card__excerpt">{excerpt}</p>
        )}
        
        {tags.length > 0 && (
          <div className="article-card__tags">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="article-card__tag">{tag}</span>
            ))}
          </div>
        )}
        
        <div className="article-card__footer">
          <div className="article-card__author">
            <img 
              src={author.avatar} 
              alt={author.name}
              className="article-card__avatar"
            />
            <div className="article-card__author-info">
              <span className="article-card__author-name">{author.name}</span>
              <span className="article-card__date">
                {publishedAt}
                {readTime && ` · ${readTime}`}
              </span>
            </div>
          </div>
          
          <div className="article-card__stats">
            <span className="article-card__stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {likes}
            </span>
            <span className="article-card__stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              {comments}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

interface BookCardProps {
  id: string;
  title: string;
  cover: string;
  author: {
    name: string;
    username: string;
  };
  price: number;
  chapters: number;
  likes: number;
  isPurchased?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  cover,
  author,
  price,
  chapters,
  likes,
  isPurchased = false
}) => {
  return (
    <Link href={`/books/${id}`} className="book-card">
      <Card>
        <div className="book-card__cover">
          {cover}
          {isPurchased && (
            <span className="book-card__purchased">購入済み</span>
          )}
        </div>
        
        <div className="book-card__content">
          <h3 className="book-card__title">{title}</h3>
          
          <div className="book-card__author">
            <span>by @{author.username}</span>
          </div>
          
          <div className="book-card__meta">
            <span className="book-card__price">
              {price === 0 ? '無料' : `¥${price.toLocaleString()}`}
            </span>
            <span className="book-card__chapters">{chapters}チャプター</span>
          </div>
          
          <div className="book-card__stats">
            <span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {likes}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

interface ScrapCardProps {
  id: string;
  title: string;
  emoji: string;
  content?: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  status: 'OPEN' | 'CLOSED';
  commentsCount: number;
  lastUpdated: string;
  participants?: string[];
}

export const ScrapCard: React.FC<ScrapCardProps> = ({
  id,
  title,
  emoji,
  content,
  author,
  status,
  commentsCount,
  lastUpdated,
  participants = []
}) => {
  return (
    <Link href={`/scraps/${id}`} className="scrap-card">
      <Card>
        <div className="scrap-card__header">
          <span className="scrap-card__emoji">{emoji}</span>
          <span className={`scrap-card__status scrap-card__status--${status.toLowerCase()}`}>
            {status}
          </span>
        </div>
        
        <h3 className="scrap-card__title">{title}</h3>
        
        {content && (
          <p className="scrap-card__content">{content}</p>
        )}
        
        <div className="scrap-card__footer">
          <div className="scrap-card__author">
            <img 
              src={author.avatar} 
              alt={author.name}
              className="scrap-card__avatar"
            />
            <span className="scrap-card__author-name">@{author.username}</span>
          </div>
          
          <div className="scrap-card__meta">
            <span className="scrap-card__comments">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              {commentsCount}
            </span>
            <span className="scrap-card__time">{lastUpdated}</span>
          </div>
          
          {participants.length > 0 && (
            <div className="scrap-card__participants">
              {participants.slice(0, 3).map((participant, index) => (
                <img 
                  key={index}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant}`}
                  alt={participant}
                  className="scrap-card__participant"
                  style={{ zIndex: participants.length - index }}
                />
              ))}
              {participants.length > 3 && (
                <span className="scrap-card__more">+{participants.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};