'use client'

import { useState } from 'react'
import type { Comment } from '@/types/article'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'
import '@/styles/components/comment-section.css'

interface CommentSectionProps {
  comments: Comment[]
  articleId: string
  currentUserId?: string
}

export function CommentSection({ 
  comments: initialComments, 
  articleId,
  currentUserId 
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [isLoading, setIsLoading] = useState(false)

  // コメント投稿
  const handleAddComment = async (content: string) => {
    setIsLoading(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000)) // シミュレーション
      
      const newComment: Comment = {
        id: Date.now().toString(),
        author: {
          username: currentUserId || 'anonymous',
          name: 'Anonymous User', // TODO: 実際のユーザー情報
          avatar: '/images/avatar-placeholder.svg'
        },
        content,
        publishedAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        replies: []
      }
      
      setComments(prev => [newComment, ...prev])
    } catch (error) {
      console.error('コメントの投稿に失敗しました:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // リプライ投稿
  const handleReply = async (commentId: string, content: string) => {
    setIsLoading(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000)) // シミュレーション
      
      const newReply = {
        id: Date.now().toString(),
        author: {
          username: currentUserId || 'anonymous',
          name: 'Anonymous User', // TODO: 実際のユーザー情報
          avatar: '/images/avatar-placeholder.svg'
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
    } catch (error) {
      console.error('リプライの投稿に失敗しました:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // コメント編集
  const handleEditComment = async (commentId: string, content: string) => {
    setIsLoading(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000)) // シミュレーション
      
      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? { ...comment, content }
          : {
              ...comment,
              replies: comment.replies?.map(reply =>
                reply.id === commentId
                  ? { ...reply, content }
                  : reply
              )
            }
      ))
    } catch (error) {
      console.error('コメントの編集に失敗しました:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // コメント削除
  const handleDeleteComment = async (commentId: string) => {
    setIsLoading(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000)) // シミュレーション
      
      setComments(prev => prev.filter(comment => {
        if (comment.id === commentId) {
          return false
        }
        // リプライからも削除
        comment.replies = comment.replies?.filter(reply => reply.id !== commentId)
        return true
      }))
    } catch (error) {
      console.error('コメントの削除に失敗しました:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // いいね機能
  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 300)) // シミュレーション
      
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
  }

  const totalReplies = comments.reduce((total, comment) => 
    total + (comment.replies?.length || 0), 0
  )

  return (
    <div className="comment-section">
      {/* ヘッダー */}
      <div className="comment-section__header">
        <h3 className="comment-section__title">
          <span aria-hidden="true">💬</span>
          コメント
        </h3>
        <div className="comment-section__count">
          <div className="comment-section__count-item">
            <span>{comments.length}</span>
            <span>件のコメント</span>
          </div>
          {totalReplies > 0 && (
            <div className="comment-section__count-item">
              <span>{totalReplies}</span>
              <span>件のリプライ</span>
            </div>
          )}
        </div>
      </div>

      <div className="comment-section__body">
        {/* コメント投稿フォーム */}
        {currentUserId ? (
          <div className="comment-form">
            <div className="comment-form__header">
              <img 
                src="/images/avatar-placeholder.svg" 
                alt="あなたのアバター"
                className="comment-form__avatar"
              />
              <span className="comment-form__user">
                コメントする
              </span>
            </div>
            <div className="comment-form__body">
              <CommentForm
                onSubmit={handleAddComment}
                placeholder="思ったことをコメントしてみましょう..."
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : (
          <div className="comment-login">
            <div className="comment-login__icon">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="comment-login__title">
              コメントを投稿してみませんか？
            </h4>
            <p className="comment-login__description">
              この記事についての感想や質問をコメントで共有しましょう。<br />
              ログインするとコメントの投稿ができます。
            </p>
            <button className="comment-login__button">
              ログインする
            </button>
          </div>
        )}

        {/* コメント一覧 */}
        <div className="comment-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onLike={handleLikeComment}
                currentUserId={currentUserId}
                isLoading={isLoading}
              />
            ))
          ) : (
            <div className="comment-empty">
              <div className="comment-empty__icon">
                <span aria-hidden="true">💬</span>
              </div>
              <h4 className="comment-empty__title">
                まだコメントがありません
              </h4>
              <p className="comment-empty__description">
                この記事に最初のコメントを投稿してみませんか？<br />
                あなたの感想や質問をお聞かせください。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}