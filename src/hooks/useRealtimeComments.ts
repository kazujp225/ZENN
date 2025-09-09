import { useEffect, useState, useCallback } from 'react'
import { realtimeService } from '@/lib/api/realtime'

interface Comment {
  id: string
  content: string
  author_id: string
  author_name: string
  author_avatar: string
  created_at: string
  updated_at?: string
  likes_count: number
  parent_id?: string
}

export function useRealtimeComments(articleId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!articleId) return

    const channel = realtimeService.subscribeToArticleComments(articleId, {
      onInsert: (newComment) => {
        setComments(prev => [...prev, newComment])
      },
      onUpdate: (updatedComment) => {
        setComments(prev => 
          prev.map(comment => 
            comment.id === updatedComment.id ? updatedComment : comment
          )
        )
      },
      onDelete: (deletedComment) => {
        setComments(prev => 
          prev.filter(comment => comment.id !== deletedComment.id)
        )
      }
    })

    setIsConnected(true)

    return () => {
      realtimeService.unsubscribe(`article-comments:${articleId}`)
      setIsConnected(false)
    }
  }, [articleId])

  const addOptimisticComment = useCallback((comment: Partial<Comment>) => {
    const optimisticComment = {
      ...comment,
      id: `optimistic-${Date.now()}`,
      created_at: new Date().toISOString(),
      likes_count: 0
    } as Comment

    setComments(prev => [...prev, optimisticComment])
    return optimisticComment.id
  }, [])

  const removeOptimisticComment = useCallback((optimisticId: string) => {
    setComments(prev => 
      prev.filter(comment => comment.id !== optimisticId)
    )
  }, [])

  return {
    comments,
    isConnected,
    addOptimisticComment,
    removeOptimisticComment
  }
}