'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーログ削除（セキュリティ対応）
    this.props.onError?.(error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              <svg 
                className="w-12 h-12 text-red-500 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            
            <h2 className="error-boundary__title">
              エラーが発生しました
            </h2>
            
            <p className="error-boundary__message">
              申し訳ございませんが、予期しないエラーが発生しました。
              ページを再読み込みしてお試しください。
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary className="error-boundary__details-summary">
                  技術的な詳細 (開発環境のみ)
                </summary>
                <pre className="error-boundary__error-text">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div className="error-boundary__actions">
              <button
                className="error-boundary__button error-boundary__button--primary"
                onClick={() => window.location.reload()}
                type="button"
              >
                ページを再読み込み
              </button>
              
              <button
                className="error-boundary__button error-boundary__button--secondary"
                onClick={() => window.history.back()}
                type="button"
              >
                前のページに戻る
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
import { useState, useEffect } from 'react'

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  const resetError = () => setError(null)
  
  return { setError, resetError }
}

// Specialized error boundaries for different contexts
export function ArticleErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="article-error" role="alert">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              記事の読み込みに失敗しました
            </h3>
            <p className="text-red-700 mb-4">
              記事コンテンツの表示中にエラーが発生しました。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        // Log to monitoring service
        // エラーログ削除（セキュリティ対応）
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function CommentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="comment-error" role="alert">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-yellow-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-yellow-800 text-sm">
              コメントの読み込みに失敗しました
            </p>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        // エラーログ削除（セキュリティ対応）
      }}
    >
      {children}
    </ErrorBoundary>
  )
}