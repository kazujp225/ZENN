'use client'

import { useEffect, useState } from 'react'
import { logger } from '@/lib/monitoring/logger'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  connectionType: string
  viewportSize: string
}

export default function PerformanceMonitor({ pageName }: { pageName: string }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    const measurePerformance = () => {
      // Web Vitals測定
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const memory = (performance as any).memory

        const performanceMetrics: PerformanceMetrics = {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          memoryUsage: memory ? memory.usedJSHeapSize / (1024 * 1024) : 0, // MB
          connectionType: (navigator as any).connection?.effectiveType || 'unknown',
          viewportSize: `${window.innerWidth}x${window.innerHeight}`
        }

        setMetrics(performanceMetrics)

        // パフォーマンスメトリクスをログに記録
        logger.logPerformance({
          message: `Page performance: ${pageName}`,
          category: 'performance',
          data: {
            page: pageName,
            viewport: performanceMetrics.viewportSize,
            connection: performanceMetrics.connectionType
          },
          metrics: {
            responseTime: performanceMetrics.loadTime,
            memoryUsage: performanceMetrics.memoryUsage,
            dbQueryTime: 0, // APIから取得する場合
            cacheHit: false, // キャッシュステータス
          }
        })

        // Core Web Vitals測定
        if ('PerformanceObserver' in window) {
          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            
            logger.logPerformance({
              message: `LCP: ${lastEntry.startTime}ms`,
              category: 'performance',
              data: { page: pageName, metric: 'LCP' },
              metrics: { responseTime: lastEntry.startTime }
            })
          })
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry) => {
              logger.logPerformance({
                message: `FID: ${entry.processingStart - entry.startTime}ms`,
                category: 'performance', 
                data: { page: pageName, metric: 'FID' },
                metrics: { responseTime: entry.processingStart - entry.startTime }
              })
            })
          })
          fidObserver.observe({ type: 'first-input', buffered: true })

          // Cumulative Layout Shift
          let clsScore = 0
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries() as PerformanceEventTiming[]
            entries.forEach((entry) => {
              if (!(entry as any).hadRecentInput) {
                clsScore += (entry as any).value
              }
            })
            
            logger.logPerformance({
              message: `CLS: ${clsScore}`,
              category: 'performance',
              data: { page: pageName, metric: 'CLS' },
              metrics: { responseTime: clsScore }
            })
          })
          clsObserver.observe({ type: 'layout-shift', buffered: true })
        }
      }
    }

    // ページ読み込み完了後に測定
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
      return () => window.removeEventListener('load', measurePerformance)
    }
  }, [pageName])

  // エラーバウンダリー
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logger.error('JavaScript Error', new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        page: pageName
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled Promise Rejection', 
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)), 
        { page: pageName }
      )
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [pageName])

  // リソース読み込み監視
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const resource = entry as PerformanceResourceTiming
          
          // 遅いリソースをログ記録
          if (resource.duration > 1000) {
            logger.warn('Slow resource loading', {
              name: resource.name,
              duration: resource.duration,
              size: resource.transferSize,
              page: pageName
            }, 'performance')
          }
        })
      })
      resourceObserver.observe({ type: 'resource', buffered: true })

      return () => resourceObserver.disconnect()
    }
  }, [pageName])

  // 開発環境でのみパフォーマンス情報を表示
  if (process.env.NODE_ENV === 'development' && metrics) {
    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50">
        <div>Page: {pageName}</div>
        <div>Load: {metrics.loadTime.toFixed(1)}ms</div>
        <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
        <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
        <div>Connection: {metrics.connectionType}</div>
        <div>Viewport: {metrics.viewportSize}</div>
      </div>
    )
  }

  return null
}