'use client'

import { useState, useMemo, useCallback } from 'react'
import type { Comment } from '@/types/article'
import { EnhancedCommentForm } from './EnhancedCommentForm'
import { CommentItem } from './CommentItem'
import { CommentErrorBoundary } from './CommentErrorBoundary'
import { useCommentRateLimit } from '@/hooks/useCommentRateLimit'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

interface EnhancedCommentSectionProps {
  comments: Comment[]
  articleId: string
  isLoading?: boolean
}

type SortOption = 'newest' | 'oldest' | 'popular'

export function EnhancedCommentSection({ 
  comments: initialComments, 
  articleId,
  isLoading: initialLoading = false
}: EnhancedCommentSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const [comments, setComments] = useState(initialComments)
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set())

  // レート制限の管理
  const rateLimitState = useCommentRateLimit(user?.id)

  // ソート済みコメント
  const sortedComments = useMemo(() => {
    const sorted = [...comments]
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        )
      case 'popular':
        return sorted.sort((a, b) => b.likes - a.likes)
      default:
        return sorted
    }
  }, [comments, sortBy])

  // 統計情報
  const commentStats = useMemo(() => {
    const totalComments = comments.length
    const totalReplies = comments.reduce((sum, comment) => 
      sum + (comment.replies?.length || 0), 0
    )
    const totalLikes = comments.reduce((sum, comment) => 
      sum + comment.likes + (comment.replies?.reduce((replySum, reply) => 
        replySum + reply.likes, 0
      ) || 0), 0
    )

    return { totalComments, totalReplies, totalLikes }
  }, [comments])

  // コメント投稿
  const handleAddComment = useCallback(async (content: string) => {
    if (!user) throw new Error('ログインが必要です')
    
    // レート制限チェック
    if (!rateLimitState.canComment) {
      if (rateLimitState.isInCooldown) {
        throw new Error(`クールダウン中です。${rateLimitState.getFormattedCooldownTime()}後に再度お試しください`)
      } else {
        throw new Error(`コメント制限に達しました。${rateLimitState.getFormattedTimeUntilReset()}後に再度お試しください`)
      }
    }

    setIsLoading(true)
    try {
      // レート制限を記録
      if (!rateLimitState.recordComment(content)) {
        throw new Error('スパムの可能性があるため、投稿が制限されています')
      }

      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newComment: Comment = {
        id: Date.now().toString(),
        author: {
          username: user.username,
          name: user.name,
          avatar: user.avatar
        },
        content,
        publishedAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        replies: []
      }
      
      setComments(prev => [newComment, ...prev])
      setShowCommentForm(false)
      
      // 成功メッセージ
      showNotification('コメントを投稿しました', 'success')
      
    } catch (error) {
      console.error('コメントの投稿に失敗しました:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, rateLimitState])

  // リプライ投稿
  const handleReply = useCallback(async (commentId: string, content: string) => {
    if (!user) throw new Error('ログインが必要です')
    
    // レート制限チェック
    if (!rateLimitState.canComment) {
      if (rateLimitState.isInCooldown) {
        throw new Error(`クールダウン中です。${rateLimitState.getFormattedCooldownTime()}後に再度お試しください`)
      } else {
        throw new Error(`コメント制限に達しました。${rateLimitState.getFormattedTimeUntilReset()}後に再度お試しください`)
      }
    }

    setIsLoading(true)
    try {
      // レート制限を記録
      if (!rateLimitState.recordComment(content)) {
        throw new Error('スパムの可能性があるため、投稿が制限されています')
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newReply = {
        id: Date.now().toString(),
        author: {
          username: user.username,
          name: user.name,
          avatar: user.avatar
        },
        content,
        publishedAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      }
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId
          ? {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            }
          : comment
      ))

      showNotification('リプライを投稿しました', 'success')
      
    } catch (error) {
      console.error('リプライの投稿に失敗しました:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, rateLimitState])

  // コメント編集
  const handleEditComment = useCallback(async (commentId: string, content: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content, updatedAt: new Date().toISOString() }
        }
        
        // リプライも確認
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply =>
            reply.id === commentId
              ? { ...reply, content, updatedAt: new Date().toISOString() }
              : reply
          )
          return { ...comment, replies: updatedReplies }
        }
        
        return comment
      }))

      showNotification('コメントを更新しました', 'success')
      
    } catch (error) {
      console.error('コメントの編集に失敗しました:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // コメント削除
  const handleDeleteComment = useCallback(async (commentId: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setComments(prev => prev.filter(comment => {
        if (comment.id === commentId) {
          return false
        }
        // リプライからも削除
        comment.replies = comment.replies?.filter(reply => reply.id !== commentId)
        return true
      }))

      showNotification('コメントを削除しました', 'info')
      
    } catch (error) {
      console.error('コメントの削除に失敗しました:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // いいね機能
  const handleLikeComment = useCallback(async (commentId: string, isLiked: boolean) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: isLiked ? comment.likes + 1 : comment.likes - 1,
            isLiked
          }
        }
        
        // リプライのいいねも処理
        if (comment.replies) {
          comment.replies = comment.replies.map(reply =>
            reply.id === commentId
              ? {
                  ...reply,
                  likes: isLiked ? reply.likes + 1 : reply.likes - 1,
                  isLiked
                }
              : reply
          )
        }
        
        return comment
      }))
    } catch (error) {
      console.error('いいねに失敗しました:', error)
      throw error
    }
  }, [])

  // コメントの折りたたみ切り替え
  const toggleCommentCollapse = useCallback((commentId: string) => {
    setCollapsedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }, [])

  // 通知表示
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div')
    notification.className = clsx(
      'fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 text-white',
      {
        'bg-green-500': type === 'success',
        'bg-red-500': type === 'error',
        'bg-blue-500': type === 'info'
      }
    )
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
  }

  return (
    <CommentErrorBoundary>
      <div className="space-y-6">
        {/* コメント統計とソート */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">コメント</h3>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>{commentStats.totalComments}件のコメント</span>
                  <span>{commentStats.totalReplies}件の返信</span>
                  <span>{commentStats.totalLikes}個のいいね</span>
                </div>
              </div>

              {/* ソートオプション */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">並び順:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">新しい順</option>
                  <option value="oldest">古い順</option>
                  <option value="popular">人気順</option>
                </select>
              </div>
            </div>
          </div>

          {/* コメント投稿フォーム */}
          <div className="p-6">
            {isAuthenticated ? (
              <div>
                {/* レート制限情報 */}
                {!rateLimitState.canComment && (
                  <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">
                        {rateLimitState.isInCooldown 
                          ? `クールダウン中 - ${rateLimitState.getFormattedCooldownTime()}後に投稿可能`
                          : `コメント制限 - ${rateLimitState.getFormattedTimeUntilReset()}後にリセット`
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* 残り投稿回数表示 */}
                {rateLimitState.canComment && (
                  <div className="mb-2 text-sm text-gray-600">
                    残り{rateLimitState.remainingComments}回投稿可能
                    {rateLimitState.nextResetTime && (
                      <span> ({rateLimitState.getFormattedTimeUntilReset()}後にリセット)</span>
                    )}
                  </div>
                )}

                {showCommentForm ? (
                  <EnhancedCommentForm
                    onSubmit={handleAddComment}
                    onCancel={() => setShowCommentForm(false)}
                    placeholder="コメントを入力してください"
                    isLoading={isLoading}
                    autoFocus
                    enablePreview
                  />
                ) : (
                  <button
                    onClick={() => setShowCommentForm(true)}
                    disabled={!rateLimitState.canComment}
                    className={clsx(
                      'w-full p-4 text-left rounded-lg border-2 border-dashed transition-colors',
                      rateLimitState.canComment
                        ? 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-600'
                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    コメントを追加...
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  コメントを投稿するにはログインが必要です
                </p>
                <button 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {/* TODO: ログインモーダルを開く */}}
                >
                  ログイン
                </button>
              </div>
            )}
          </div>
        </div>

        {/* コメント一覧 */}
        <div className="space-y-4">
          {isLoading && sortedComments.length === 0 ? (
            /* ローディング状態 */
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedComments.length > 0 ? (
            sortedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onLike={handleLikeComment}
                currentUserId={user?.username}
                isLoading={isLoading}
                isCollapsed={collapsedComments.has(comment.id)}
                onToggleCollapse={() => toggleCommentCollapse(comment.id)}
              />
            ))
          ) : (
            /* コメントなし */
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <div className="mb-4">
                <svg className="mx-auto w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                まだコメントがありません
              </h3>
              <p className="text-gray-600 mb-4">
                最初のコメントを投稿してみましょう
              </p>
              {isAuthenticated && (
                <button
                  onClick={() => setShowCommentForm(true)}
                  disabled={!rateLimitState.canComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  コメントを投稿
                </button>
              )}
            </div>
          )}
        </div>

        {/* ローディングオーバーレイ */}
        {isLoading && sortedComments.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span className="text-gray-700">処理中...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </CommentErrorBoundary>
  )
}