'use client'

import { ReactNode, Suspense } from 'react'
import { GlobalErrorBoundary, PageErrorBoundary } from '@/components/error/GlobalErrorBoundary'
import { GlobalLoadingProvider } from '@/hooks/useGlobalLoading'
import { GlobalLoadingIndicator } from '@/components/loading/GlobalLoadingIndicator'
import { EnhancedAuthProvider } from '@/hooks/useEnhancedAuth'

interface EnhancedAppProviderProps {
  children: ReactNode
}

// ページレベルのローディングフォールバック
function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">ページを読み込み中...</p>
      </div>
    </div>
  )
}

// コンポーネントレベルのローディングフォールバック
function ComponentLoadingFallback({ message = 'コンテンツを読み込み中...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  )
}

// エラー復旧とローディング状態管理を含むラッパー
function AppCore({ children }: { children: ReactNode }) {
  return (
    <GlobalErrorBoundary level="global">
      <GlobalLoadingProvider>
        <EnhancedAuthProvider>
          {/* グローバルローディングインジケーター */}
          <GlobalLoadingIndicator
            position="top"
            showProgressBar={true}
            showMessage={true}
            theme="light"
            minimumDisplayTime={300}
          />
          
          {/* メインコンテンツ */}
          <Suspense fallback={<PageLoadingFallback />}>
            <PageErrorBoundary>
              {children}
            </PageErrorBoundary>
          </Suspense>
        </EnhancedAuthProvider>
      </GlobalLoadingProvider>
    </GlobalErrorBoundary>
  )
}

export function EnhancedAppProvider({ children }: EnhancedAppProviderProps) {
  return (
    <AppCore>
      {children}
    </AppCore>
  )
}

// 個別用途のプロバイダー
export function ComponentProvider({ 
  children, 
  errorMessage = "このコンポーネントでエラーが発生しました",
  loadingMessage = "読み込み中...",
  name 
}: {
  children: ReactNode
  errorMessage?: string
  loadingMessage?: string
  name?: string
}) {
  return (
    <GlobalErrorBoundary 
      level="component"
      onError={(error, errorInfo) => {
        // エラーログ削除（セキュリティ対応）
      }}
      fallback={
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-2">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      }
    >
      <Suspense fallback={<ComponentLoadingFallback message={loadingMessage} />}>
        {children}
      </Suspense>
    </GlobalErrorBoundary>
  )
}

// ページ固有のプロバイダー
export function PageProvider({ 
  children,
  title,
  description 
}: {
  children: ReactNode
  title?: string
  description?: string
}) {
  return (
    <GlobalErrorBoundary 
      level="page"
      onError={(error, errorInfo) => {
        // エラーログ削除（セキュリティ対応）
        // ページエラーの分析レポート送信
        if (process.env.NODE_ENV === 'production') {
          // 実際のアプリではエラー報告サービスに送信
          console.log('Sending error report for page:', {
            page: title,
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString()
          })
        }
      }}
    >
      <Suspense 
        fallback={
          <PageLoadingFallback />
        }
      >
        {children}
      </Suspense>
    </GlobalErrorBoundary>
  )
}

// API呼び出し用のエラーハンドリングラッパー
export function ApiProvider({ 
  children,
  onError,
  retryCount = 1
}: {
  children: ReactNode
  onError?: (error: Error) => void
  retryCount?: number
}) {
  return (
    <GlobalErrorBoundary
      level="component"
      onError={(error, errorInfo) => {
        // エラーログ削除（セキュリティ対応）
        onError?.(error)
        
        // API エラーのログ送信
        if (process.env.NODE_ENV === 'production') {
          console.log('API Error Report:', {
            error: error.message,
            timestamp: new Date().toISOString(),
            retryCount
          })
        }
      }}
      fallback={
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-2">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-yellow-700 text-sm">
                データの取得でエラーが発生しました。しばらく待ってから再試行してください。
              </p>
            </div>
          </div>
        </div>
      }
    >
      <Suspense fallback={<ComponentLoadingFallback message="データを取得中..." />}>
        {children}
      </Suspense>
    </GlobalErrorBoundary>
  )
}

// フォーム用のエラーハンドリングプロバイダー
export function FormProvider({
  children,
  onError,
  onSubmit
}: {
  children: ReactNode
  onError?: (error: Error) => void
  onSubmit?: () => void
}) {
  return (
    <GlobalErrorBoundary
      level="component"
      onError={(error, errorInfo) => {
        // エラーログ削除（セキュリティ対応）
        onError?.(error)
      }}
      fallback={
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-2">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700 text-sm">
                フォームの処理でエラーが発生しました。入力内容を確認して再試行してください。
              </p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </GlobalErrorBoundary>
  )
}

// 高パフォーマンスコンテンツ用プロバイダー（仮想化など）
export function HighPerformanceProvider({
  children,
  enableVirtualization = false,
  chunkSize = 50
}: {
  children: ReactNode
  enableVirtualization?: boolean
  chunkSize?: number
}) {
  return (
    <GlobalErrorBoundary
      level="component"
      onError={(error, errorInfo) => {
        // エラーログ削除（セキュリティ対応）
        // パフォーマンス関連エラーの特別処理
        if (error.message.includes('Maximum update depth exceeded')) {
          // 警告ログ削除（セキュリティ対応）
        }
      }}
      fallback={
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 my-2">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-orange-700 text-sm">
                大量データの処理でエラーが発生しました。データを分割して表示します。
              </p>
            </div>
          </div>
        </div>
      }
    >
      <Suspense fallback={<ComponentLoadingFallback message="大量データを処理中..." />}>
        {children}
      </Suspense>
    </GlobalErrorBoundary>
  )
}

// デバッグ用の開発モード専用プロバイダー
export function DevModeProvider({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>
  }

  return (
    <GlobalErrorBoundary
      level="component"
      onError={(error, errorInfo) => {
        // 開発モードでの詳細エラーログ
        console.group('🐛 Development Error Details')
        // エラーログ削除（セキュリティ対応）
        // エラーログ削除（セキュリティ対応）
        // エラーログ削除（セキュリティ対応）
        console.error('Timestamp:', new Date().toISOString())
        console.groupEnd()

        // 開発者向けの詳細情報をローカルストレージに保存
        try {
          const errorLog = {
            id: Date.now(),
            error: {
              message: error.message,
              stack: error.stack,
            },
            errorInfo,
            timestamp: new Date().toISOString(),
            url: window.location.href
          }

          const existingLogs = JSON.parse(localStorage.getItem('dev-error-logs') || '[]')
          const newLogs = [...existingLogs, errorLog].slice(-10) // 最新10件のみ保持

          localStorage.setItem('dev-error-logs', JSON.stringify(newLogs))
        } catch (e) {
          // エラーログ削除（セキュリティ対応）
        }
      }}
      fallback={
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 my-2">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-purple-800 font-medium">開発モード：コンポーネントエラー</h3>
              <p className="text-purple-700 text-sm mt-1">
                開発者ツールのConsoleでエラーの詳細を確認してください。
                エラーログはLocalStorageの&apos;dev-error-logs&apos;キーに保存されています。
              </p>
              <button
                onClick={() => {
                  const logs = localStorage.getItem('dev-error-logs')
                  if (logs) {
                    console.table(JSON.parse(logs))
                  } else {
                    // console.log削除（セキュリティ対応）
                  }
                }}
                className="mt-2 text-purple-600 underline text-sm hover:text-purple-800"
              >
                エラーログを表示
              </button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </GlobalErrorBoundary>
  )
}

// 使用例とドキュメント
export const ProviderUsageExamples = {
  // ページ全体
  PageExample: () => (
    <PageProvider title="記事一覧" description="記事一覧ページ">
      <div>{/* ページコンテンツ */}</div>
    </PageProvider>
  ),

  // APIデータを扱うコンポーネント
  ApiComponentExample: () => (
    <ApiProvider 
      onError={(error) => {
        // カスタムエラーハンドリング
        // console.log削除（セキュリティ対応）
      }}
      retryCount={3}
    >
      <div>{/* APIを使用するコンポーネント */}</div>
    </ApiProvider>
  ),

  // フォームコンポーネント
  FormExample: () => (
    <FormProvider
      onError={(error) => {
        // フォームエラーの処理
      }}
      onSubmit={() => {
        // 送信成功時の処理
      }}
    >
      <div>{/* フォームコンポーネント */}</div>
    </FormProvider>
  ),

  // 高パフォーマンスが必要なコンポーネント
  HighPerformanceExample: () => (
    <HighPerformanceProvider 
      enableVirtualization={true}
      chunkSize={100}
    >
      <div>{/* 大量データを扱うコンポーネント */}</div>
    </HighPerformanceProvider>
  )
}