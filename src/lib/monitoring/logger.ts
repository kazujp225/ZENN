/**
 * プロダクション環境向け統合ログ監視システム
 * セキュリティ、パフォーマンス、エラーの包括的な監視
 */

import { createClient } from '@/lib/supabase/client'

export interface LogEntry {
  id?: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical'
  category: 'security' | 'performance' | 'user' | 'system' | 'api' | 'auth'
  message: string
  data?: Record<string, any>
  userId?: string
  userAgent?: string
  ip?: string
  path?: string
  method?: string
  duration?: number
  stack?: string
}

export interface SecurityEvent extends LogEntry {
  category: 'security'
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  eventType: 'login_attempt' | 'suspicious_activity' | 'rate_limit' | 'unauthorized_access' | 'data_breach'
  details: {
    action: string
    resource?: string
    reason?: string
    blocked: boolean
  }
}

export interface PerformanceMetric extends LogEntry {
  category: 'performance'
  metrics: {
    responseTime: number
    memoryUsage?: number
    dbQueryTime?: number
    cacheHit?: boolean
    bundleSize?: number
  }
}

class ProductionLogger {
  private isProduction: boolean
  private logLevel: string
  private supabase: any

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.logLevel = process.env.LOG_LEVEL || (this.isProduction ? 'warn' : 'debug')
    this.supabase = typeof window !== 'undefined' ? createClient() : null
  }

  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3, critical: 4 }
    return levels[level as keyof typeof levels] >= levels[this.logLevel as keyof typeof levels]
  }

  private async persistLog(entry: LogEntry): Promise<void> {
    if (!this.isProduction || !this.supabase) return

    try {
      // Supabaseにログを保存（本番環境のみ）
      await this.supabase.from('system_logs').insert({
        timestamp: entry.timestamp,
        level: entry.level,
        category: entry.category,
        message: entry.message,
        data: entry.data,
        user_id: entry.userId,
        user_agent: entry.userAgent,
        ip: entry.ip,
        path: entry.path,
        method: entry.method,
        duration: entry.duration,
        stack: entry.stack
      })
    } catch (error) {
      // ログ保存失敗は重要だが、アプリの動作を止めない
      if (typeof window !== 'undefined') {
        console.warn('Failed to persist log:', error)
      }
    }
  }

  private getRequestContext(): Partial<LogEntry> {
    if (typeof window === 'undefined') return {}

    return {
      userAgent: navigator.userAgent,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    }
  }

  async debug(message: string, data?: Record<string, any>, category: LogEntry['category'] = 'system'): Promise<void> {
    if (!this.shouldLog('debug')) return

    const entry: LogEntry = {
      ...this.getRequestContext(),
      level: 'debug',
      category,
      message,
      data
    }

    if (!this.isProduction) {
      console.debug(`[${category.toUpperCase()}] ${message}`, data)
    }

    await this.persistLog(entry)
  }

  async info(message: string, data?: Record<string, any>, category: LogEntry['category'] = 'system'): Promise<void> {
    if (!this.shouldLog('info')) return

    const entry: LogEntry = {
      ...this.getRequestContext(),
      level: 'info',
      category,
      message,
      data
    }

    if (!this.isProduction) {
      console.info(`[${category.toUpperCase()}] ${message}`, data)
    }

    await this.persistLog(entry)
  }

  async warn(message: string, data?: Record<string, any>, category: LogEntry['category'] = 'system'): Promise<void> {
    if (!this.shouldLog('warn')) return

    const entry: LogEntry = {
      ...this.getRequestContext(),
      level: 'warn',
      category,
      message,
      data
    }

    console.warn(`[${category.toUpperCase()}] ${message}`, data)
    await this.persistLog(entry)
  }

  async error(message: string, error?: Error, data?: Record<string, any>, category: LogEntry['category'] = 'system'): Promise<void> {
    if (!this.shouldLog('error')) return

    const entry: LogEntry = {
      ...this.getRequestContext(),
      level: 'error',
      category,
      message,
      data: {
        ...data,
        error: error ? {
          name: error.name,
          message: error.message,
          cause: error.cause
        } : undefined
      },
      stack: error?.stack
    }

    console.error(`[${category.toUpperCase()}] ${message}`, error, data)
    await this.persistLog(entry)

    // 重要なエラーは即座に通知（本番環境）
    if (this.isProduction && category === 'security') {
      await this.sendAlert(entry)
    }
  }

  async critical(message: string, error?: Error, data?: Record<string, any>, category: LogEntry['category'] = 'security'): Promise<void> {
    const entry: LogEntry = {
      ...this.getRequestContext(),
      level: 'critical',
      category,
      message,
      data: {
        ...data,
        error: error ? {
          name: error.name,
          message: error.message,
          cause: error.cause
        } : undefined
      },
      stack: error?.stack
    }

    console.error(`[CRITICAL ${category.toUpperCase()}] ${message}`, error, data)
    await this.persistLog(entry)
    await this.sendAlert(entry)
  }

  async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp' | 'level'>): Promise<void> {
    const entry: SecurityEvent = {
      ...this.getRequestContext(),
      level: event.threatLevel === 'critical' ? 'critical' : 'warn',
      ...event,
      timestamp: new Date().toISOString()
    }

    console.warn(`[SECURITY] ${event.eventType}: ${event.message}`, event.details)
    await this.persistLog(entry)

    if (event.threatLevel === 'high' || event.threatLevel === 'critical') {
      await this.sendAlert(entry)
    }
  }

  async logPerformance(metric: Omit<PerformanceMetric, 'timestamp' | 'level'>): Promise<void> {
    const entry: PerformanceMetric = {
      ...this.getRequestContext(),
      level: 'info',
      ...metric,
      timestamp: new Date().toISOString()
    }

    // パフォーマンス閾値チェック
    if (metric.metrics.responseTime > 2000) {
      entry.level = 'warn'
      console.warn(`[PERFORMANCE] Slow response: ${metric.metrics.responseTime}ms`, metric.metrics)
    }

    await this.persistLog(entry)
  }

  private async sendAlert(entry: LogEntry): Promise<void> {
    if (!this.isProduction) return

    try {
      // エラー報告サービス（Sentry等）への送信
      if (process.env.ERROR_REPORTING_DSN) {
        // Sentry.captureMessage(entry.message, entry.level as any)
      }

      // Webhook通知
      if (process.env.ALERT_WEBHOOK_URL) {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 ${entry.level.toUpperCase()}: ${entry.message}`,
            timestamp: entry.timestamp,
            category: entry.category,
            data: entry.data
          })
        })
      }
    } catch (error) {
      // アラート送信失敗は記録のみ
      console.error('Failed to send alert:', error)
    }
  }

  // ログ分析用のメトリクス取得
  async getSystemHealth(): Promise<{
    errorRate: number
    averageResponseTime: number
    securityIncidents: number
    criticalAlerts: number
  }> {
    if (!this.supabase) {
      return { errorRate: 0, averageResponseTime: 0, securityIncidents: 0, criticalAlerts: 0 }
    }

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    try {
      const [errors, performance, security, critical] = await Promise.all([
        this.supabase.from('system_logs').select('id').eq('level', 'error').gte('timestamp', last24Hours),
        this.supabase.from('system_logs').select('duration').eq('category', 'performance').gte('timestamp', last24Hours),
        this.supabase.from('system_logs').select('id').eq('category', 'security').gte('timestamp', last24Hours),
        this.supabase.from('system_logs').select('id').eq('level', 'critical').gte('timestamp', last24Hours)
      ])

      const totalRequests = performance.data?.length || 1
      const errorCount = errors.data?.length || 0
      const avgResponseTime = performance.data?.reduce((sum, log) => sum + (log.duration || 0), 0) / totalRequests

      return {
        errorRate: (errorCount / totalRequests) * 100,
        averageResponseTime: avgResponseTime,
        securityIncidents: security.data?.length || 0,
        criticalAlerts: critical.data?.length || 0
      }
    } catch (error) {
      console.error('Failed to get system health:', error)
      return { errorRate: 0, averageResponseTime: 0, securityIncidents: 0, criticalAlerts: 0 }
    }
  }
}

// シングルトンインスタンス
export const logger = new ProductionLogger()

// 便利なヘルパー関数
export const logUserAction = (action: string, userId: string, data?: Record<string, any>) => {
  logger.info(`User action: ${action}`, { userId, ...data }, 'user')
}

export const logAPICall = (method: string, path: string, duration: number, status: number, userId?: string) => {
  const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
  logger[level](`API ${method} ${path} - ${status}`, { method, path, duration, status, userId }, 'api')
}

export const logAuthEvent = (event: string, userId?: string, success: boolean = true, details?: Record<string, any>) => {
  const level = success ? 'info' : 'warn'
  logger[level](`Auth: ${event}`, { userId, success, ...details }, 'auth')
}

export default logger