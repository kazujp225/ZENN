'use client'

import { useState } from 'react'
import clsx from 'clsx'

interface LikeButtonProps {
  likes: number
  isLiked?: boolean
  onLike: () => Promise<void>
  disabled?: boolean
  size?: 'small' | 'medium'
}

export function LikeButton({
  likes,
  isLiked = false,
  onLike,
  disabled = false,
  size = 'medium'
}: LikeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [optimisticLikes, setOptimisticLikes] = useState(likes)
  const [optimisticIsLiked, setOptimisticIsLiked] = useState(isLiked)

  const handleClick = async () => {
    if (disabled || isLoading) return

    // 楽観的アップデート
    const newIsLiked = !optimisticIsLiked
    setOptimisticIsLiked(newIsLiked)
    setOptimisticLikes(prev => newIsLiked ? prev + 1 : prev - 1)
    
    setIsLoading(true)
    try {
      await onLike()
    } catch (error) {
      // エラー時はロールバック
      setOptimisticIsLiked(isLiked)
      setOptimisticLikes(likes)
      // エラーログ削除（セキュリティ対応）
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    small: 'text-xs gap-1 px-2 py-1',
    medium: 'text-sm gap-1 px-2 py-1'
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={clsx(
        'flex items-center rounded transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
        sizeClasses[size],
        optimisticIsLiked
          ? 'text-red-600 hover:text-red-700'
          : 'text-gray-500 hover:text-gray-700',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className={clsx(
        'transition-transform',
        optimisticIsLiked && 'scale-110'
      )}>
        {optimisticIsLiked ? '❤️' : '🤍'}
      </span>
      
      <span className="font-medium">
        {optimisticLikes}
      </span>
      
      {isLoading && (
        <svg 
          className="animate-spin h-3 w-3 ml-1" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
    </button>
  )
}