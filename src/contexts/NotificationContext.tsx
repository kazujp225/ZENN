'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

export interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'article_published'
  title: string
  message: string
  relatedUserId?: string
  relatedUserName?: string
  relatedUserAvatar?: string
  targetType?: 'article' | 'comment' | 'book' | 'scrap'
  targetId?: string
  targetTitle?: string
  isRead: boolean
  createdAt: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  clearAll: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  // 通知を取得
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
        setLastFetch(new Date())
      }
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      toast.error('通知の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [user])

  // 通知を既読にする
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }, [])

  // すべての通知を既読にする
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        )
        setUnreadCount(0)
        toast.success('すべての通知を既読にしました')
      }
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      toast.error('既読処理に失敗しました')
    }
  }, [])

  // 通知を削除
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        toast.success('通知を削除しました')
      }
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      toast.error('削除に失敗しました')
    }
  }, [notifications])

  // すべての通知をクリア
  const clearAll = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/clear', {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications([])
        setUnreadCount(0)
        toast.success('すべての通知をクリアしました')
      }
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      toast.error('クリアに失敗しました')
    }
  }, [])

  // 初回読み込み
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user, fetchNotifications])

  // 定期的に通知をポーリング（5分ごと）
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 5 * 60 * 1000) // 5分

    return () => clearInterval(interval)
  }, [user, fetchNotifications])

  // WebSocketまたはServer-Sent Eventsでリアルタイム通知を受信（将来的な実装用）
  useEffect(() => {
    if (!user) return

    // WebSocket接続 - Supabase Realtimeを使用予定
    // Supabase Realtimeで通知の購読を実装予定
    // ws.onmessage = (event) => {
    //   const notification = JSON.parse(event.data)
    //   setNotifications(prev => [notification, ...prev])
    //   setUnreadCount(prev => prev + 1)
    //   
    //   // トースト通知を表示
    //   toast(notification.message, {
    //     icon: getNotificationIcon(notification.type),
    //   })
    // }
    // 
    // return () => ws.close()
  }, [user])

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// 通知タイプに応じたアイコンを返すヘルパー関数
export function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'like':
      return '❤️'
    case 'comment':
      return '💬'
    case 'follow':
      return '👤'
    case 'mention':
      return '@'
    case 'article_published':
      return '📝'
    default:
      return '🔔'
  }
}