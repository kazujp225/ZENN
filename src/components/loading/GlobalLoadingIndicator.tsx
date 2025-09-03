'use client'

import { useEffect, useState } from 'react'
import { useGlobalLoading } from '@/hooks/useGlobalLoading'
import clsx from 'clsx'

interface GlobalLoadingIndicatorProps {
  showProgressBar?: boolean
  showMessage?: boolean
  position?: 'top' | 'bottom' | 'center'
  theme?: 'light' | 'dark'
  minimumDisplayTime?: number
}

export function GlobalLoadingIndicator({
  showProgressBar = true,
  showMessage = true,
  position = 'top',
  theme = 'light',
  minimumDisplayTime = 500
}: GlobalLoadingIndicatorProps) {
  const {
    isLoading,
    loadingStates,
    currentLoadingMessage,
    globalProgress
  } = useGlobalLoading()

  const [shouldShow, setShouldShow] = useState(false)
  const [displayMessage, setDisplayMessage] = useState<string | null>(null)
  const [animationClass, setAnimationClass] = useState('')

  // ローディング表示の制御（最小表示時間を考慮）
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    if (isLoading) {
      setShouldShow(true)
      setAnimationClass('animate-fade-in')
    } else {
      setAnimationClass('animate-fade-out')
      
      timeoutId = setTimeout(() => {
        setShouldShow(false)
        setDisplayMessage(null)
      }, minimumDisplayTime)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isLoading, minimumDisplayTime])

  // メッセージの更新
  useEffect(() => {
    if (isLoading && currentLoadingMessage) {
      setDisplayMessage(currentLoadingMessage)
    }
  }, [isLoading, currentLoadingMessage])

  if (!shouldShow) return null

  // プログレスバーコンポーネント
  const ProgressBar = () => {
    const progress = globalProgress > 0 ? globalProgress : 0
    const hasProgress = loadingStates.some(state => state.progress !== undefined)

    if (!showProgressBar) return null

    return (
      <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
        <div
          className={clsx(
            'h-full transition-all duration-300 ease-out',
            theme === 'light' ? 'bg-blue-600' : 'bg-white'
          )}
          style={{
            width: hasProgress ? `${progress}%` : '100%',
            animation: hasProgress ? undefined : 'loading-pulse 2s ease-in-out infinite alternate'
          }}
        />
      </div>
    )
  }

  // スピナーコンポーネント
  const Spinner = ({ size = 'small' }: { size?: 'small' | 'medium' | 'large' }) => {
    const sizeClasses = {
      small: 'w-4 h-4',
      medium: 'w-6 h-6',
      large: 'w-8 h-8'
    }

    return (
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-transparent',
          sizeClasses[size],
          theme === 'light' 
            ? 'border-t-blue-600 border-r-blue-600' 
            : 'border-t-white border-r-white'
        )}
      />
    )
  }

  // キャンセルボタン
  const CancelButton = () => {
    const cancellableStates = loadingStates.filter(state => state.cancellable)
    
    if (cancellableStates.length === 0) return null

    return (
      <button
        onClick={() => {
          cancellableStates.forEach(state => {
            if (state.onCancel) {
              state.onCancel()
            }
          })
        }}
        className={clsx(
          'ml-3 px-2 py-1 text-xs rounded transition-colors',
          theme === 'light'
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        )}
      >
        キャンセル
      </button>
    )
  }

  // 位置別のスタイル
  const positionStyles = {
    top: 'fixed top-0 left-0 right-0 z-50',
    bottom: 'fixed bottom-0 left-0 right-0 z-50',
    center: 'fixed inset-0 z-50 flex items-center justify-center'
  }

  const contentStyles = {
    top: 'p-4',
    bottom: 'p-4',
    center: 'bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-xl shadow-lg max-w-sm mx-4'
  }

  if (position === 'center') {
    return (
      <div className={clsx(positionStyles[position], animationClass)}>
        <div
          className={clsx(
            contentStyles[position],
            'text-center',
            theme === 'dark' && 'bg-gray-800 bg-opacity-90 text-white'
          )}
        >
          <Spinner size="large" />
          
          {showMessage && displayMessage && (
            <p className="mt-4 text-gray-700 font-medium">
              {displayMessage}
            </p>
          )}

          {showProgressBar && globalProgress > 0 && (
            <div className="mt-4">
              <ProgressBar />
              <p className="text-sm text-gray-500 mt-2">
                {Math.round(globalProgress)}% 完了
              </p>
            </div>
          )}

          <CancelButton />
        </div>
      </div>
    )
  }

  return (
    <div className={clsx(positionStyles[position], animationClass)}>
      <div
        className={clsx(
          contentStyles[position],
          'backdrop-blur-sm',
          theme === 'light'
            ? 'bg-white bg-opacity-95 border-b border-gray-200'
            : 'bg-gray-800 bg-opacity-95 border-b border-gray-700 text-white'
        )}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Spinner size="medium" />
              
              {showMessage && displayMessage && (
                <span className={clsx(
                  'text-sm font-medium',
                  theme === 'light' ? 'text-gray-700' : 'text-gray-200'
                )}>
                  {displayMessage}
                </span>
              )}

              {/* 複数のローディング状態がある場合の表示 */}
              {loadingStates.length > 1 && (
                <span className={clsx(
                  'text-xs px-2 py-1 rounded-full',
                  theme === 'light'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-blue-900 text-blue-300'
                )}>
                  {loadingStates.length}個のタスク実行中
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {globalProgress > 0 && (
                <span className={clsx(
                  'text-xs font-mono',
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                )}>
                  {Math.round(globalProgress)}%
                </span>
              )}
              
              <CancelButton />
            </div>
          </div>

          {showProgressBar && (
            <div className="mt-2">
              <ProgressBar />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 個別のローディング状態を表示するコンポーネント
export function LoadingStateList() {
  const { loadingStates } = useGlobalLoading()

  if (loadingStates.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {loadingStates.map(state => (
        <LoadingStateItem key={state.id} state={state} />
      ))}
    </div>
  )
}

function LoadingStateItem({ state }: { state: any }) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - state.startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [state.startTime])

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    return `${seconds}s`
  }

  if (!isVisible) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            {state.message || 'Loading...'}
          </span>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          ✕
        </button>
      </div>

      {state.progress !== undefined && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{Math.round(state.progress)}%</span>
            <span>{formatTime(timeElapsed)}</span>
          </div>
        </div>
      )}

      {state.cancellable && state.onCancel && (
        <button
          onClick={state.onCancel}
          className="w-full text-xs text-red-600 hover:text-red-800 border border-red-200 rounded py-1 mt-2"
        >
          キャンセル
        </button>
      )}
    </div>
  )
}

// CSS アニメーション用のスタイル
const styles = `
  @keyframes loading-pulse {
    0% { opacity: 0.6; }
    100% { opacity: 1; }
  }

  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes fade-out {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }

  .animate-loading-pulse {
    animation: loading-pulse 2s ease-in-out infinite alternate;
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }

  .animate-fade-out {
    animation: fade-out 0.3s ease-out forwards;
  }
`

// スタイルを動的に追加
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = styles
  document.head.appendChild(styleElement)
}