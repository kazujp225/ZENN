'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import clsx from 'clsx'
import type { Comment, Reply } from '@/types/article'
import { CommentForm } from './CommentForm'
import { LikeButton } from './LikeButton'
import '@/styles/components/comment-item.css'

interface CommentItemProps {
  comment: Comment
  onReply: (commentId: string, content: string) => Promise<void>
  onEdit: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  onLike: (commentId: string, isLiked: boolean) => Promise<void>
  currentUserId?: string
  isLoading?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  depth?: number
}

export function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  currentUserId,
  isLoading = false,
  isCollapsed = false,
  onToggleCollapse,
  depth = 0
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwner = currentUserId === comment.author.username
  const hasReplies = comment.replies && comment.replies.length > 0

  const handleReply = async (content: string) => {
    await onReply(comment.id, content)
    setShowReplyForm(false)
  }

  const handleEdit = async (content: string) => {
    await onEdit(comment.id, content)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('コメントを削除してもよろしいですか？')) return
    
    setIsDeleting(true)
    try {
      await onDelete(comment.id)
    } catch (error) {
      console.error('削除に失敗しました:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLike = async () => {
    await onLike(comment.id, !comment.isLiked)
  }

  return (
    <div className="comment-item">
      <div className={clsx(
        'comment-item__card',
        isDeleting && 'comment-item__card--deleting'
      )}>
        {/* コメントヘッダー */}
        <div className="comment-item__header">
          <img
            src={comment.author.avatar}
            alt={comment.author.name}
            className="comment-item__avatar"
          />
          <div className="comment-item__author-info">
            <div className="comment-item__author-name">
              {comment.author.name}
              <span className="comment-item__author-username">@{comment.author.username}</span>
            </div>
            <time className="comment-item__timestamp">
              {formatDistanceToNow(new Date(comment.publishedAt), {
                addSuffix: true,
                locale: ja
              })}
            </time>
          </div>

          {/* コメントメニュー */}
          {isOwner && (
            <div className="comment-item__menu">
              <button
                onClick={() => setIsEditing(true)}
                className="comment-item__menu-button"
                disabled={isLoading || isDeleting}
              >
                編集
              </button>
              <button
                onClick={handleDelete}
                className="comment-item__menu-button comment-item__menu-button--delete"
                disabled={isLoading || isDeleting}
              >
                削除
              </button>
            </div>
          )}
        </div>

        {/* コメント本文 */}
        {isEditing ? (
          <CommentForm
            onSubmit={handleEdit}
            onCancel={() => setIsEditing(false)}
            initialValue={comment.content}
            placeholder="コメントを編集"
            isLoading={isLoading}
          />
        ) : (
          <div className="comment-item__content">
            <p>{comment.content}</p>
          </div>
        )}

        {/* コメントアクション */}
        {!isEditing && (
          <div className="comment-item__actions">
            <LikeButton
              likes={comment.likes}
              isLiked={comment.isLiked}
              onLike={handleLike}
              disabled={isLoading || isDeleting}
            />
            
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="comment-item__action-button"
              disabled={isLoading || isDeleting}
            >
              <span className="comment-item__action-icon">💬</span>
              リプライ
            </button>

            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="comment-item__action-button"
              >
                <span className="comment-item__action-icon">
                  {showReplies ? '🔼' : '🔽'}
                </span>
                {comment.replies!.length}件の返信
              </button>
            )}
          </div>
        )}
      </div>

      {/* リプライフォーム */}
      {showReplyForm && !isEditing && (
        <div className="comment-item__reply-form">
          <CommentForm
            onSubmit={handleReply}
            onCancel={() => setShowReplyForm(false)}
            placeholder="リプライを入力してください"
            isReply={true}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* リプライ一覧 */}
      {hasReplies && showReplies && (
        <div className="comment-item__replies">
          <div className="comment-item__replies-list">
            {comment.replies!.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                onEdit={onEdit}
                onDelete={onDelete}
                onLike={onLike}
                currentUserId={currentUserId}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ReplyItemProps {
  reply: Reply
  onEdit: (replyId: string, content: string) => Promise<void>
  onDelete: (replyId: string) => Promise<void>
  onLike: (replyId: string, isLiked: boolean) => Promise<void>
  currentUserId?: string
  isLoading?: boolean
}

function ReplyItem({
  reply,
  onEdit,
  onDelete,
  onLike,
  currentUserId,
  isLoading = false
}: ReplyItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwner = currentUserId === reply.author.username

  const handleEdit = async (content: string) => {
    await onEdit(reply.id, content)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('リプライを削除してもよろしいですか？')) return
    
    setIsDeleting(true)
    try {
      await onDelete(reply.id)
    } catch (error) {
      console.error('削除に失敗しました:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLike = async () => {
    await onLike(reply.id, !reply.isLiked)
  }

  return (
    <div className={clsx(
      'reply-item',
      isDeleting && 'reply-item--deleting'
    )}>
      {/* リプライヘッダー */}
      <div className="reply-item__header">
        <img
          src={reply.author.avatar}
          alt={reply.author.name}
          className="reply-item__avatar"
        />
        <div className="reply-item__author-info">
          <div className="reply-item__author-name">
            {reply.author.name}
            <span className="reply-item__author-username">@{reply.author.username}</span>
          </div>
          <time className="reply-item__timestamp">
            {formatDistanceToNow(new Date(reply.publishedAt), {
              addSuffix: true,
              locale: ja
            })}
          </time>
        </div>

        {isOwner && (
          <div className="reply-item__menu">
            <button
              onClick={() => setIsEditing(true)}
              className="reply-item__menu-button"
              disabled={isLoading || isDeleting}
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              className="reply-item__menu-button reply-item__menu-button--delete"
              disabled={isLoading || isDeleting}
            >
              削除
            </button>
          </div>
        )}
      </div>

      {/* リプライ本文 */}
      {isEditing ? (
        <CommentForm
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
          initialValue={reply.content}
          placeholder="リプライを編集"
          isReply={true}
          isLoading={isLoading}
        />
      ) : (
        <>
          <div className="reply-item__content">
            <p>{reply.content}</p>
          </div>
          
          <div className="reply-item__actions">
            <LikeButton
              likes={reply.likes}
              isLiked={reply.isLiked}
              onLike={handleLike}
              disabled={isLoading || isDeleting}
              size="small"
            />
          </div>
        </>
      )}
    </div>
  )
}