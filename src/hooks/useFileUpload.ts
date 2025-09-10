import { useState, useCallback, useEffect, useRef } from 'react'
import { storageApi } from '@/lib/api/storage'

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UploadResult {
  url: string
  path: string
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const uploadAvatar = useCallback(async (
    userId: string,
    file: File
  ): Promise<UploadResult | null> => {
    setIsUploading(true)
    setError(null)
    setProgress({ loaded: 0, total: file.size, percentage: 0 })

    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload an image.')
      }

      // Simulate progress (in production, use XMLHttpRequest for real progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (!prev) return null
          const newPercentage = Math.min(prev.percentage + 10, 90)
          return {
            ...prev,
            loaded: (file.size * newPercentage) / 100,
            percentage: newPercentage
          }
        })
      }, 100)

      const result = await storageApi.uploadAvatar(userId, file)

      clearInterval(progressInterval)
      setProgress({ loaded: file.size, total: file.size, percentage: 100 })

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      return null
    } finally {
      setIsUploading(false)
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // Reset progress after 1 second
      timeoutRef.current = setTimeout(() => setProgress(null), 1000)
    }
  }, [])

  const uploadArticleImage = useCallback(async (
    articleId: string,
    file: File
  ): Promise<UploadResult | null> => {
    setIsUploading(true)
    setError(null)
    setProgress({ loaded: 0, total: file.size, percentage: 0 })

    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload an image.')
      }

      const result = await storageApi.uploadArticleImage(articleId, file)

      setProgress({ loaded: file.size, total: file.size, percentage: 100 })

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      return null
    } finally {
      setIsUploading(false)
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // Reset progress after 1 second
      timeoutRef.current = setTimeout(() => setProgress(null), 1000)
    }
  }, [])

  const deleteFile = useCallback(async (
    filePath: string,
    type: 'avatar' | 'article'
  ): Promise<boolean> => {
    try {
      if (type === 'avatar') {
        // Extract userId from path
        const userId = filePath.split('/')[0]
        return await storageApi.deleteAvatar(userId, filePath)
      } else {
        return await storageApi.deleteArticleImage(filePath)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setIsUploading(false)
    setProgress(null)
    setError(null)
  }, [])

  return {
    uploadAvatar,
    uploadArticleImage,
    deleteFile,
    isUploading,
    progress,
    error,
    reset
  }
}