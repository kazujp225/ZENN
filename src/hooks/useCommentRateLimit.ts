'use client'

import { useState, useEffect, useCallback } from 'react'

interface RateLimitConfig {
  maxComments: number
  windowMinutes: number
  maxLength: number
  cooldownMinutes?: number
}

interface RateLimitState {
  canComment: boolean
  remainingComments: number
  nextResetTime?: Date
  isInCooldown: boolean
  cooldownEndTime?: Date
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxComments: 10, // 10分間に10コメント
  windowMinutes: 10,
  maxLength: 1000,
  cooldownMinutes: 5 // スパム検出時は5分のクールダウン
}

export function useCommentRateLimit(userId?: string, config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    canComment: true,
    remainingComments: finalConfig.maxComments,
    isInCooldown: false
  })

  const storageKey = `comment_rate_limit_${userId || 'anonymous'}`
  const cooldownKey = `comment_cooldown_${userId || 'anonymous'}`

  // レート制限状態の更新
  const updateRateLimit = useCallback(() => {
    if (!userId) {
      // ログインしていない場合はより厳しい制限
      setRateLimitState({
        canComment: false,
        remainingComments: 0,
        isInCooldown: false
      })
      return
    }

    const now = new Date()
    const windowStart = new Date(now.getTime() - finalConfig.windowMinutes * 60 * 1000)

    try {
      // 過去のコメント記録を取得
      const storedData = localStorage.getItem(storageKey)
      const commentTimes: number[] = storedData ? JSON.parse(storedData) : []

      // ウィンドウ外の古い記録を削除
      const recentComments = commentTimes.filter(time => time > windowStart.getTime())

      // クールダウン状態をチェック
      const cooldownData = localStorage.getItem(cooldownKey)
      const cooldownEnd = cooldownData ? new Date(cooldownData) : null
      const isInCooldown = cooldownEnd && cooldownEnd > now

      const remainingComments = Math.max(0, finalConfig.maxComments - recentComments.length)
      const canComment = !isInCooldown && remainingComments > 0

      setRateLimitState({
        canComment,
        remainingComments,
        nextResetTime: recentComments.length > 0 
          ? new Date(Math.min(...recentComments) + finalConfig.windowMinutes * 60 * 1000)
          : undefined,
        isInCooldown: Boolean(isInCooldown),
        cooldownEndTime: cooldownEnd || undefined
      })

      // クリーンアップされたデータを保存
      localStorage.setItem(storageKey, JSON.stringify(recentComments))

    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }, [userId, finalConfig, storageKey, cooldownKey])

  // 初期化とタイマー設定
  useEffect(() => {
    updateRateLimit()

    // 定期的に状態を更新
    const interval = setInterval(updateRateLimit, 30 * 1000) // 30秒ごと
    return () => clearInterval(interval)
  }, [updateRateLimit])

  // コメント記録
  const recordComment = useCallback((content: string) => {
    if (!userId) return false

    try {
      const now = new Date()
      const storedData = localStorage.getItem(storageKey)
      const commentTimes: number[] = storedData ? JSON.parse(storedData) : []

      commentTimes.push(now.getTime())

      // スパム検出（簡易版）
      if (isSpamLikeBehavior(content, commentTimes)) {
        // クールダウンを設定
        const cooldownEnd = new Date(now.getTime() + (finalConfig.cooldownMinutes || 5) * 60 * 1000)
        localStorage.setItem(cooldownKey, cooldownEnd.toISOString())
        
        updateRateLimit()
        return false
      }

      localStorage.setItem(storageKey, JSON.stringify(commentTimes))
      updateRateLimit()
      return true

    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      return false
    }
  }, [userId, storageKey, cooldownKey, finalConfig.cooldownMinutes, updateRateLimit])

  // スパム検出ロジック
  const isSpamLikeBehavior = (content: string, commentTimes: number[]): boolean => {
    const now = Date.now()
    const recentComments = commentTimes.filter(time => now - time < 60 * 1000) // 1分以内

    // 1分以内に5回以上投稿
    if (recentComments.length >= 5) {
      return true
    }

    // 非常に短い間隔での連続投稿
    if (commentTimes.length >= 2) {
      const lastTwo = commentTimes.slice(-2)
      if (lastTwo[1] - lastTwo[0] < 5000) { // 5秒以内
        return true
      }
    }

    // 同じ内容の連続投稿（簡易チェック）
    const recentContent = localStorage.getItem(`recent_comment_content_${userId}`)
    if (recentContent && recentContent === content) {
      return true
    }

    // 最新のコンテンツを保存
    localStorage.setItem(`recent_comment_content_${userId}`, content)

    return false
  }

  // 残り時間の計算
  const getTimeUntilReset = useCallback((): number => {
    if (!rateLimitState.nextResetTime) return 0
    return Math.max(0, rateLimitState.nextResetTime.getTime() - Date.now())
  }, [rateLimitState.nextResetTime])

  const getTimeUntilCooldownEnd = useCallback((): number => {
    if (!rateLimitState.cooldownEndTime) return 0
    return Math.max(0, rateLimitState.cooldownEndTime.getTime() - Date.now())
  }, [rateLimitState.cooldownEndTime])

  // フォーマットされた残り時間
  const getFormattedTimeUntilReset = useCallback((): string => {
    const ms = getTimeUntilReset()
    const minutes = Math.ceil(ms / (60 * 1000))
    return minutes > 0 ? `${minutes}分` : '間もなく'
  }, [getTimeUntilReset])

  const getFormattedCooldownTime = useCallback((): string => {
    const ms = getTimeUntilCooldownEnd()
    const minutes = Math.ceil(ms / (60 * 1000))
    return minutes > 0 ? `${minutes}分` : '間もなく'
  }, [getTimeUntilCooldownEnd])

  return {
    ...rateLimitState,
    recordComment,
    getTimeUntilReset,
    getTimeUntilCooldownEnd,
    getFormattedTimeUntilReset,
    getFormattedCooldownTime,
    config: finalConfig
  }
}