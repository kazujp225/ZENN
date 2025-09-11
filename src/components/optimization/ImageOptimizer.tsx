'use client'

import Image from 'next/image'
import { useState, useCallback } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleError = useCallback(() => {
    setError('画像の読み込みに失敗しました')
    setIsLoading(false)
  }, [])

  // 画像のフォールバック処理
  if (error) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">🖼️</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        priority={priority}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  )
}

// Avatar用の最適化された画像コンポーネント
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className = ''
}: {
  src: string
  alt: string
  size?: number
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      quality={60}
      sizes={`${size}px`}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Wq/8Aotdkbi6vYZZLG3WVP2HACFONoKqJmhWKCUXW/BQQe21AUC8FxDZ+T+frUwV9pGbSh3FVXWDE7aBqwLEgfnv16nFhGGWMGdFSR2aEO1bC1nSO1nUtJJgkW7sjsJWOGFGD33m4YnQqp8eDi3JgFo20nHqfkE3oLZ1a9k3LT7V6YpNEFOeBeDZhQi9Kw/8AcFQ="
    />
  )
}

// 記事カード用の最適化された画像
export function OptimizedCardImage({
  src,
  alt,
  className = ''
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={200}
      className={`object-cover ${className}`}
      quality={70}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAAF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Wq/8Aotdkbi6vYZZLG3WVP2HACFONoKqJmhWKCUXW/BQQe21AUC8FxDZ+T+frUwV9pGbSh3FVXWDE7aBqwLEgfnv16nFhGGWMGdFSR2aEO1bC1nSO1nUtJJgkW7sjsJWOGFGD33m4YnQqp8eDi3JgFo20nHqfkE3oLZ1a9k3LT7V6YpNEFOeBeDZhQi9Kw/8AcFQ="
    />
  )
}