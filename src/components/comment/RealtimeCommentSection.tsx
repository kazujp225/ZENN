'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Edit2, Trash2, Heart, MoreVertical } from 'lucide-react'
import { useRealtimeComments } from '@/hooks/useRealtimeComments'
import { commentsApi } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface RealtimeCommentSectionProps {
  articleId: string
  currentUserId?: string
  currentUserName?: string
  currentUserAvatar?: string
}

interface Comment {
  id: string
  content: string
  author_id: string
  author_name: string
  author_avatar?: string
  created_at: string
  updated_at?: string
  likes_count: number
  parent_id?: string
  isLiked?: boolean
}

export function RealtimeCommentSection({
  articleId,
  currentUserId,
  currentUserName,
  currentUserAvatar
}: RealtimeCommentSectionProps) {
  const { comments, isConnected, addOptimisticComment, removeOptimisticComment } = useRealtimeComments(articleId)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Load initial comments
    loadComments()
  }, [articleId])

  const loadComments = async () => {
    try {
      const data = await commentsApi.getArticleComments(articleId)
      // Comments will be synced via realtime subscription
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }

  const handleSubmit = async () => {
    if (!newComment.trim() || !currentUserId) return

    setIsSubmitting(true)
    const optimisticId = addOptimisticComment({
      content: newComment,
      author_id: currentUserId,
      author_name: currentUserName || 'Anonymous',
      author_avatar: currentUserAvatar,
      parent_id: replyTo || undefined
    })

    try {
      await commentsApi.addArticleComment({
        article_id: articleId,
        author_id: currentUserId,
        content: newComment,
        parent_id: replyTo
      })
      setNewComment('')
      setReplyTo(null)
    } catch (error) {
      removeOptimisticComment(optimisticId)
      // エラーログ削除（セキュリティ対応）
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      await commentsApi.updateArticleComment(commentId, editContent)
      setEditingId(null)
      setEditContent('')
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('このコメントを削除しますか？')) return

    try {
      await commentsApi.deleteArticleComment(commentId, articleId)
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }

  const handleLike = async (commentId: string, isLiked: boolean) => {
    if (!currentUserId) return

    try {
      if (isLiked) {
        await commentsApi.unlikeComment(commentId, currentUserId)
      } else {
        await commentsApi.likeComment(commentId, currentUserId)
      }
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }

  const renderComment = (comment: Comment, depth = 0) => {
    const isAuthor = comment.author_id === currentUserId
    const isEditing = editingId === comment.id
    const replies = comments.filter(c => c.parent_id === comment.id)

    return (
      <div key={comment.id} className={`comment ${depth > 0 ? 'comment--reply' : ''}`}>
        <div className="comment__header">
          <img 
            src={comment.author_avatar || '/default-avatar.png'} 
            alt={comment.author_name}
            className="comment__avatar"
          />
          <div className="comment__meta">
            <span className="comment__author">{comment.author_name}</span>
            <span className="comment__time">
              {formatDistanceToNow(new Date(comment.created_at), { 
                addSuffix: true, 
                locale: ja 
              })}
            </span>
            {comment.updated_at && (
              <span className="comment__edited">（編集済み）</span>
            )}
          </div>
          {isAuthor && (
            <div className="comment__actions">
              <button onClick={() => {
                setEditingId(comment.id)
                setEditContent(comment.content)
              }}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(comment.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="comment__edit">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="comment__edit-input"
              rows={3}
            />
            <div className="comment__edit-actions">
              <button 
                onClick={() => handleEdit(comment.id)}
                className="btn btn--primary btn--sm"
              >
                保存
              </button>
              <button 
                onClick={() => {
                  setEditingId(null)
                  setEditContent('')
                }}
                className="btn btn--ghost btn--sm"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div className="comment__content">
            {comment.content}
          </div>
        )}

        <div className="comment__footer">
          <button 
            className={`comment__like ${comment.isLiked ? 'liked' : ''}`}
            onClick={() => handleLike(comment.id, comment.isLiked || false)}
          >
            <Heart size={14} />
            <span>{comment.likes_count}</span>
          </button>
          {currentUserId && depth < 2 && (
            <button 
              className="comment__reply"
              onClick={() => setReplyTo(comment.id)}
            >
              返信
            </button>
          )}
        </div>

        {replyTo === comment.id && (
          <div className="comment__reply-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`${comment.author_name}に返信...`}
              className="comment__input"
              rows={2}
            />
            <div className="comment__reply-actions">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn--primary btn--sm"
              >
                返信
              </button>
              <button 
                onClick={() => {
                  setReplyTo(null)
                  setNewComment('')
                }}
                className="btn btn--ghost btn--sm"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {replies.length > 0 && (
          <div className="comment__replies">
            {replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="realtime-comments">
      <div className="realtime-comments__header">
        <h3 className="realtime-comments__title">
          <MessageCircle size={20} />
          コメント ({comments.length})
        </h3>
        {isConnected && (
          <span className="realtime-comments__status">
            <span className="realtime-comments__status-dot" />
            リアルタイム接続中
          </span>
        )}
      </div>

      {currentUserId && !replyTo && (
        <div className="realtime-comments__form">
          <img 
            src={currentUserAvatar || '/default-avatar.png'} 
            alt={currentUserName}
            className="realtime-comments__form-avatar"
          />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="realtime-comments__input"
            rows={3}
          />
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !newComment.trim()}
            className="realtime-comments__submit"
          >
            <Send size={18} />
          </button>
        </div>
      )}

      <div className="realtime-comments__list">
        {comments
          .filter(c => !c.parent_id)
          .map(comment => renderComment(comment))}
      </div>

      {!currentUserId && (
        <div className="realtime-comments__login-prompt">
          <p>コメントするにはログインが必要です</p>
          <button className="btn btn--primary">ログイン</button>
        </div>
      )}

      <style jsx>{`
        .realtime-comments {
          margin-top: 48px;
          padding-top: 48px;
          border-top: 1px solid var(--color-border);
        }

        .realtime-comments__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .realtime-comments__title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 700;
        }

        .realtime-comments__status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-text-tertiary);
        }

        .realtime-comments__status-dot {
          width: 8px;
          height: 8px;
          background: var(--color-success);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .realtime-comments__form {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
        }

        .realtime-comments__form-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .realtime-comments__input {
          flex: 1;
          padding: 12px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          resize: vertical;
          font-family: inherit;
        }

        .realtime-comments__submit {
          padding: 12px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .realtime-comments__submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .comment {
          margin-bottom: 24px;
        }

        .comment--reply {
          margin-left: 48px;
          margin-top: 16px;
        }

        .comment__header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .comment__avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .comment__meta {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .comment__author {
          font-weight: 600;
        }

        .comment__time,
        .comment__edited {
          font-size: 12px;
          color: var(--color-text-tertiary);
        }

        .comment__actions {
          display: flex;
          gap: 8px;
        }

        .comment__actions button {
          padding: 4px;
          background: none;
          border: none;
          color: var(--color-text-tertiary);
          cursor: pointer;
          transition: color 0.2s;
        }

        .comment__actions button:hover {
          color: var(--color-text-primary);
        }

        .comment__content {
          margin-left: 48px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .comment__footer {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 12px;
          margin-left: 48px;
        }

        .comment__like,
        .comment__reply {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: none;
          border: none;
          color: var(--color-text-tertiary);
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .comment__like:hover,
        .comment__reply:hover {
          color: var(--color-primary);
        }

        .comment__like.liked {
          color: var(--color-danger);
        }

        .comment__reply-form,
        .comment__edit {
          margin-left: 48px;
          margin-top: 12px;
        }

        .comment__edit-input,
        .comment__input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          resize: vertical;
          font-family: inherit;
        }

        .comment__edit-actions,
        .comment__reply-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .comment__replies {
          margin-top: 16px;
        }

        .realtime-comments__login-prompt {
          text-align: center;
          padding: 32px;
          background: var(--color-bg-secondary);
          border-radius: 8px;
        }

        .realtime-comments__login-prompt p {
          margin-bottom: 16px;
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  )
}