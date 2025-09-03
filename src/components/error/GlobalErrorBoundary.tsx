'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'global'
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string | null
}

// エラー情報をサーバーに送信（実装例）
const reportError = async (error: Error, errorInfo: ErrorInfo, errorId: string, level: string) => {
  try {
    // 本番環境では実際のエラー報告サービスを使用
    console.error('Error reported:', {
      errorId,
      level,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })

    // 例: Sentry、Bugsnag、または独自のエラー報告API
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     errorId,
    //     level,
    //     message: error.message,
    //     stack: error.stack,
    //     componentStack: errorInfo.componentStack,
    //     timestamp: new Date().toISOString(),
    //     userAgent: navigator.userAgent,
    //     url: window.location.href
    //   })
    // })
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError)
  }
}

// エラーIDの生成
const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private readonly maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: generateErrorId()
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props
    const errorId = this.state.errorId || generateErrorId()

    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // カスタムエラーハンドラーを呼び出し
    onError?.(error, errorInfo)

    // エラー報告
    reportError(error, errorInfo, errorId, level)

    this.setState({
      error,
      errorInfo,
      errorId
    })
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: null
      })
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const { fallback, level = 'component' } = this.props
      const { error, errorId } = this.state

      // カスタムフォールバックが提供されている場合
      if (fallback) {
        return fallback
      }

      // レベルに応じた異なるエラーUI
      if (level === 'global') {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                予期しないエラーが発生しました
              </h1>
              
              <p className="text-gray-600 mb-6">
                申し訳ございませんが、システムエラーが発生しました。
                問題は既に報告されており、修正に取り組んでいます。
              </p>

              {errorId && (
                <div className="bg-gray-100 rounded-lg p-3 mb-6">
                  <p className="text-sm text-gray-600">
                    エラーID: <code className="font-mono text-xs">{errorId}</code>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    お問い合わせの際はこのIDをお知らせください
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {this.retryCount < this.maxRetries && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    再試行 ({this.maxRetries - this.retryCount}回まで)
                  </button>
                )}
                
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ページを再読み込み
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ホームに戻る
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-gray-600 cursor-pointer mb-2">
                    エラー詳細（開発者向け）
                  </summary>
                  <pre className="text-xs text-red-600 bg-red-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      }

      if (level === 'page') {
        return (
          <div className="min-h-96 flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                ページの読み込みに失敗しました
              </h2>
              
              <p className="text-gray-600 mb-4">
                一時的な問題により、このページを表示できません。
              </p>

              <div className="space-y-2">
                {this.retryCount < this.maxRetries && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    再試行
                  </button>
                )}
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ホームに戻る
                </button>
              </div>
            </div>
          </div>
        )
      }

      // コンポーネントレベルのエラー
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                コンポーネントエラー
              </h3>
              <p className="text-sm text-red-700 mt-1">
                このコンポーネントの表示中にエラーが発生しました。
              </p>
              
              {this.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  再試行
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 特定用途のエラー境界コンポーネント
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <GlobalErrorBoundary level="page">
    {children}
  </GlobalErrorBoundary>
)

export const ComponentErrorBoundary: React.FC<{ children: ReactNode; name?: string }> = ({ 
  children, 
  name 
}) => (
  <GlobalErrorBoundary 
    level="component"
    onError={(error, errorInfo) => {
      console.error(`Error in component ${name}:`, error, errorInfo)
    }}
  >
    {children}
  </GlobalErrorBoundary>
)

// 非同期コンポーネント用のエラー境界
export const AsyncErrorBoundary: React.FC<{
  children: ReactNode
  fallback?: ReactNode
}> = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    // Promise の unhandled rejection をキャッチ
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setHasError(true)
      setError(new Error(event.reason))
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (hasError) {
    return fallback || (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              非同期処理でエラーが発生しました。ページを再読み込みしてください。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}