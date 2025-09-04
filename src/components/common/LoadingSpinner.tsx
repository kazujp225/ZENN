import React from 'react';
import '@/styles/components/loading.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color,
  fullScreen = false 
}) => {
  const spinner = (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="loading-spinner__ring" style={{ borderTopColor: color }}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-spinner__fullscreen">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const LoadingSkeleton: React.FC<{ type?: 'text' | 'card' | 'avatar' | 'article' }> = ({ 
  type = 'text' 
}) => {
  switch (type) {
    case 'article':
      return (
        <div className="skeleton-article">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
        </div>
      );
    case 'card':
      return (
        <div className="skeleton skeleton-card">
          <div className="skeleton-card__header">
            <div className="skeleton skeleton-avatar"></div>
            <div className="skeleton-card__meta">
              <div className="skeleton skeleton-text" style={{ width: '150px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '100px' }}></div>
            </div>
          </div>
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      );
    case 'avatar':
      return <div className="skeleton skeleton-avatar"></div>;
    default:
      return <div className="skeleton skeleton-text"></div>;
  }
};

export const LoadingGrid: React.FC<{ count?: number; type?: 'card' | 'article' }> = ({ 
  count = 6,
  type = 'card' 
}) => {
  return (
    <div className="loading-grid">
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton key={index} type={type} />
      ))}
    </div>
  );
};