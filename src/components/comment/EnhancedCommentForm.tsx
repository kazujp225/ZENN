'use client'

import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { CommentValidator } from './CommentValidator'
import type { CommentValidationError } from './CommentValidator'

interface EnhancedCommentFormProps {
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
  initialValue?: string
  placeholder?: string
  isReply?: boolean
  isLoading?: boolean
  maxLength?: number
  enablePreview?: boolean
  autoFocus?: boolean
  replyToUser?: string
}

export function EnhancedCommentForm({
  onSubmit,
  onCancel,
  initialValue = '',
  placeholder = 'コメントを入力してください',
  isReply = false,
  isLoading = false,
  maxLength = 1000,
  enablePreview = true,
  autoFocus = false,
  replyToUser
}: EnhancedCommentFormProps) {
  const [content, setContent] = useState(initialValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<CommentValidationError[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [charCount, setCharCount] = useState(initialValue.length)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // オートフォーカス
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // 文字数カウント更新
  useEffect(() => {
    setCharCount(content.length)
  }, [content])

  // テキストエリアの高さ自動調整
  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(Math.max(textarea.scrollHeight, 80), 300) + 'px'
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    setIsDirty(true)
    
    // リアルタイムバリデーション（エラーがある場合のみ）
    if (errors.length > 0) {
      const validation = CommentValidator.validateContent(newContent)
      setErrors(validation.errors)
    }

    adjustHeight()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting || isLoading) return

    // バリデーション
    const validation = CommentValidator.validateContent(content)
    setErrors(validation.errors)

    if (!validation.isValid || !validation.sanitizedContent) {
      // エラーがある場合、最初のエラーフィールドにフォーカス
      textareaRef.current?.focus()
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit(validation.sanitizedContent)
      
      // 成功時にフォームをリセット
      setContent('')
      setIsDirty(false)
      setErrors([])
      setShowPreview(false)
      
      // 送信完了の視覚的フィードバック
      showSuccessMessage()
      
    } catch (error) {
      console.error('コメントの投稿に失敗しました:', error)
      
      // エラーメッセージを表示
      setErrors([{
        field: 'submit',
        message: error instanceof Error ? error.message : 'コメントの投稿に失敗しました'
      }])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isDirty && !confirm('入力内容が失われますが、よろしいですか？')) {
      return
    }
    
    setContent(initialValue)
    setErrors([])
    setIsDirty(false)
    setShowPreview(false)
    onCancel?.()
  }

  const showSuccessMessage = () => {
    // 簡単な成功メッセージ表示
    const message = document.createElement('div')
    message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    message.textContent = isReply ? 'リプライを投稿しました' : 'コメントを投稿しました'
    document.body.appendChild(message)
    
    setTimeout(() => {
      document.body.removeChild(message)
    }, 3000)
  }

  // キーボードショートカット
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter または Cmd+Enter で送信
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isSubmitting) {
      e.preventDefault()
      handleSubmit(e as any)
    }
    
    // Escapeでキャンセル
    if (e.key === 'Escape' && onCancel) {
      e.preventDefault()
      handleCancel()
    }
  }

  const isDisabled = !content.trim() || isSubmitting || isLoading || errors.length > 0
  const isNearLimit = charCount > maxLength * 0.8
  const isOverLimit = charCount > maxLength

  return (
    <div className={clsx(
      'bg-white rounded-lg border border-gray-200',
      isReply && 'ml-6 border-l-2 border-l-blue-200'
    )}>
      {/* フォームヘッダー */}
      {(isReply && replyToUser) && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm">
          <span className="text-blue-700">
            @{replyToUser} への返信
          </span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="p-4">
        {/* プレビュー/エディタ切り替えタブ */}
        {enablePreview && content.trim() && (
          <div className="flex border-b border-gray-200 mb-3 -mx-4 px-4">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={clsx(
                'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                !showPreview 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={clsx(
                'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                showPreview 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              プレビュー
            </button>
          </div>
        )}

        {/* コンテンツエリア */}
        {showPreview ? (
          /* プレビュー表示 */
          <div className="min-h-[80px] p-3 bg-gray-50 rounded border">
            <div className="prose prose-sm max-w-none">
              {content.split('\n').map((line, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {line || <br />}
                </p>
              ))}
            </div>
          </div>
        ) : (
          /* エディタ */
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSubmitting || isLoading}
            rows={isReply ? 3 : 4}
            className={clsx(
              'w-full px-0 py-2 border-none outline-none resize-none',
              'placeholder-gray-500 transition-colors',
              'disabled:bg-gray-50 disabled:cursor-not-allowed',
              errors.some(e => e.field === 'content') && 'text-red-600'
            )}
            style={{ minHeight: '80px' }}
          />
        )}

        {/* エラー表示 */}
        {errors.length > 0 && (
          <div className="mt-2 space-y-1">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error.message}
              </p>
            ))}
          </div>
        )}

        {/* フッター */}
        <div className="flex items-center justify-between mt-4">
          {/* 文字数カウンタ */}
          <div className="flex items-center gap-4 text-sm">
            <span className={clsx(
              'transition-colors',
              isOverLimit ? 'text-red-600 font-medium' :
              isNearLimit ? 'text-orange-600' : 'text-gray-500'
            )}>
              {charCount.toLocaleString()}/{maxLength.toLocaleString()}文字
            </span>
            
            {!showPreview && (
              <span className="text-gray-400 text-xs">
                {isReply ? '返信' : 'コメント'}投稿: {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter
              </span>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isLoading}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
            )}
            
            <button
              type="submit"
              disabled={isDisabled}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'disabled:cursor-not-allowed',
                isDisabled
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
                isReply ? 'リプライ' : 'コメント投稿'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}