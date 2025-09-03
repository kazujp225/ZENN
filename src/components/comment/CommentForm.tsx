'use client'

import { useState } from 'react'
import clsx from 'clsx'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
  initialValue?: string
  placeholder?: string
  isReply?: boolean
  isLoading?: boolean
}

export function CommentForm({
  onSubmit,
  onCancel,
  initialValue = '',
  placeholder = 'コメントを入力してください',
  isReply = false,
  isLoading = false
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting || isLoading) return

    setIsSubmitting(true)
    try {
      await onSubmit(content.trim())
      setContent('')
    } catch (error) {
      console.error('コメントの投稿に失敗しました:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setContent(initialValue)
    onCancel?.()
  }

  const isDisabled = !content.trim() || isSubmitting || isLoading

  return (
    <form onSubmit={handleSubmit} className={clsx(
      'space-y-3',
      isReply && 'ml-6 border-l-2 border-gray-200 pl-4'
    )}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={isReply ? 3 : 4}
        className={clsx(
          'w-full px-3 py-2 border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'resize-none transition-colors',
          'placeholder-gray-500'
        )}
        disabled={isSubmitting || isLoading}
      />
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {content.length}/1000文字
        </p>
        
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isSubmitting || isLoading}
            >
              キャンセル
            </button>
          )}
          
          <button
            type="submit"
            disabled={isDisabled}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-blue-600'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                投稿中...
              </span>
            ) : (
              isReply ? 'リプライ' : 'コメント'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}