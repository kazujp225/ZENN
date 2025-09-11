'use client'

import { useState, useEffect } from 'react'
import { Bell, MessageCircle, Heart, UserPlus, AtSign, BookOpen, Check, X } from 'lucide-react'
import { realtimeService } from '@/lib/api/realtime'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Notification {
  id: string
  type: 'comment' | 'like' | 'follow' | 'mention' | 'article_published'
  title: string
  message: string
  entity_id?: string
  entity_type?: 'article' | 'book' | 'scrap' | 'comment'
  action_url?: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    name: string
    avatar?: string
  }
}

interface NotificationCenterProps {
  userId: string
  initialNotifications?: Notification[]
}

export function NotificationCenter({ userId, initialNotifications = [] }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    // Subscribe to realtime notifications
    const channel = realtimeService.subscribeToNotifications(userId, (notification) => {
      setNotifications(prev => [notification, ...prev])
      if (!notification.is_read) {
        setUnreadCount(prev => prev + 1)
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png',
            badge: '/badge.png'
          })
        }
      }
    })

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      realtimeService.unsubscribe(`notifications:${userId}`)
    }
  }, [userId])

  useEffect(() => {
    const count = notifications.filter(n => !n.is_read).length
    setUnreadCount(count)
  }, [notifications])

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    )
    
    // Update in database
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    )
    
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return <MessageCircle size={16} />
      case 'like':
        return <Heart size={16} />
      case 'follow':
        return <UserPlus size={16} />
      case 'mention':
        return <AtSign size={16} />
      case 'article_published':
        return <BookOpen size={16} />
      default:
        return <Bell size={16} />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return 'notification--comment'
      case 'like':
        return 'notification--like'
      case 'follow':
        return 'notification--follow'
      case 'mention':
        return 'notification--mention'
      case 'article_published':
        return 'notification--published'
      default:
        return ''
    }
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications

  return (
    <div className="notification-center">
      <button
        className="notification-center__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="通知"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-center__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="notification-center__overlay" 
            onClick={() => setIsOpen(false)}
          />
          <div className="notification-center__dropdown">
            <div className="notification-center__header">
              <h3>通知</h3>
              <div className="notification-center__actions">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="notification-center__mark-all"
                  >
                    <Check size={16} />
                    すべて既読
                  </button>
                )}
              </div>
            </div>

            <div className="notification-center__filters">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                すべて
              </button>
              <button
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                未読 ({unreadCount})
              </button>
            </div>

            <div className="notification-center__list">
              {filteredNotifications.length === 0 ? (
                <div className="notification-center__empty">
                  <Bell size={32} />
                  <p>通知はありません</p>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification ${getNotificationColor(notification.type)} ${!notification.is_read ? 'unread' : ''}`}
                  >
                    <div className="notification__icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification__content">
                      <a 
                        href={notification.action_url || '#'}
                        onClick={() => markAsRead(notification.id)}
                        className="notification__link"
                      >
                        <div className="notification__title">
                          {notification.title}
                        </div>
                        <div className="notification__message">
                          {notification.message}
                        </div>
                        <div className="notification__time">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ja
                          })}
                        </div>
                      </a>
                    </div>
                    <button
                      className="notification__delete"
                      onClick={() => deleteNotification(notification.id)}
                      aria-label="削除"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {filteredNotifications.length > 10 && (
              <div className="notification-center__footer">
                <a href="/notifications" className="view-all">
                  すべての通知を見る
                </a>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .notification-center {
          position: relative;
        }

        .notification-center__trigger {
          position: relative;
          padding: 8px;
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: color 0.2s;
        }

        .notification-center__trigger:hover {
          color: var(--color-text-primary);
        }

        .notification-center__badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background: var(--color-danger);
          color: white;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-center__overlay {
          position: fixed;
          inset: 0;
          z-index: 998;
        }

        .notification-center__dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 400px;
          max-height: 600px;
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          z-index: 999;
          display: flex;
          flex-direction: column;
        }

        .notification-center__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-border);
        }

        .notification-center__header h3 {
          font-size: 16px;
          font-weight: 700;
        }

        .notification-center__mark-all {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: none;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          color: var(--color-text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .notification-center__mark-all:hover {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }

        .notification-center__filters {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          border-bottom: 1px solid var(--color-border);
        }

        .filter-btn {
          padding: 6px 12px;
          background: none;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          color: var(--color-text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }

        .notification-center__list {
          flex: 1;
          overflow-y: auto;
        }

        .notification-center__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          color: var(--color-text-tertiary);
        }

        .notification-center__empty p {
          margin-top: 12px;
        }

        .notification {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-border);
          transition: background 0.2s;
        }

        .notification:hover {
          background: var(--color-bg-secondary);
        }

        .notification.unread {
          background: var(--color-primary-alpha);
        }

        .notification__icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--color-bg-secondary);
        }

        .notification--comment .notification__icon {
          background: #e3f2fd;
          color: #2196f3;
        }

        .notification--like .notification__icon {
          background: #ffebee;
          color: #f44336;
        }

        .notification--follow .notification__icon {
          background: #e8f5e9;
          color: #4caf50;
        }

        .notification--mention .notification__icon {
          background: #fff3e0;
          color: #ff9800;
        }

        .notification--published .notification__icon {
          background: #f3e5f5;
          color: #9c27b0;
        }

        .notification__content {
          flex: 1;
          min-width: 0;
        }

        .notification__link {
          display: block;
          text-decoration: none;
          color: inherit;
        }

        .notification__title {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .notification__message {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notification__time {
          font-size: 12px;
          color: var(--color-text-tertiary);
        }

        .notification__delete {
          flex-shrink: 0;
          padding: 4px;
          background: none;
          border: none;
          color: var(--color-text-tertiary);
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
        }

        .notification:hover .notification__delete {
          opacity: 1;
        }

        .notification__delete:hover {
          color: var(--color-danger);
        }

        .notification-center__footer {
          padding: 12px;
          border-top: 1px solid var(--color-border);
          text-align: center;
        }

        .view-all {
          color: var(--color-primary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .view-all:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}