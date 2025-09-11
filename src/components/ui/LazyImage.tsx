'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import clsx from 'clsx'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  priority?: boolean
  quality?: number
  onLoad?: () => void
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y0ZjRmNSIvPjwvc3ZnPg==',
  priority = false,
  quality = 75,
  onLoad,
  objectFit = 'cover'
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!imgRef.current || priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observer.observe(imgRef.current)

    return () => {
      observer.disconnect()
    }
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
  }

  if (error) {
    return (
      <div 
        className={clsx(
          'flex items-center justify-center bg-gray-100',
          className
        )}
        style={{ width, height }}
      >
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div 
      ref={imgRef}
      className={clsx('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* プレースホルダー */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse">
          {placeholder && (
            <Image
              src={placeholder}
              alt=""
              fill
              className="object-cover blur-sm"
              priority
            />
          )}
        </div>
      )}

      {/* 実際の画像 */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          fill={!width || !height}
          width={width}
          height={height}
          quality={quality}
          priority={priority}
          className={clsx(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}

// 画像のプリロード用ユーティリティ
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// 複数画像の一括プリロード
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(src => preloadImage(src)))
}