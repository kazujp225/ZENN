'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useNotifications, getNotificationIcon } from '@/contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import clsx from 'clsx'
import '@/styles/components/notification-dropdown.css'

export function NotificationDropdown() {
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  } = useNotifications()
  
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ドロップダウンの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 通知をクリックしたときの処理
  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId)
    }
  }

  // リンクURLを生成
  const getNotificationLink = (notification: any) => {
    if (notification.targetType === 'article' && notification.targetId) {
      return `/articles/${notification.targetId}`
    }
    if (notification.targetType === 'comment' && notification.targetId) {
      return `/articles/${notification.targetId}#comments`
    }
    if (notification.targetType === 'book' && notification.targetId) {
      return `/books/${notification.targetId}`
    }
    if (notification.targetType === 'scrap' && notification.targetId) {
      return `/scraps/${notification.targetId}`
    }
    if (notification.relatedUserId) {
      return `/${notification.relatedUserId}`
    }
    return '#'
  }

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && !loading) {
            fetchNotifications()
          }
        }}
        className={clsx(
          'notification-dropdown__trigger',
          isOpen && 'notification-dropdown__trigger--active'
        )}
        aria-label="通知"
      >
        <svg className="notification-dropdown__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-dropdown__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown__menu">
          <div className="notification-dropdown__header">
            <h3 className="notification-dropdown__title">通知</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="notification-dropdown__mark-all"
              >
                すべて既読にする
              </button>
            )}
          </div>

          <div className="notification-dropdown__content">
            {loading ? (
              <div className="notification-dropdown__loading">
                <div className="notification-dropdown__spinner" />
                <span>読み込み中...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-dropdown__empty">
                <span className="notification-dropdown__empty-icon">🔔</span>
                <p className="notification-dropdown__empty-text">
                  通知はありません
                </p>
              </div>
            ) : (
              <div className="notification-dropdown__list">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={clsx(
                      'notification-dropdown__item',
                      !notification.isRead && 'notification-dropdown__item--unread'
                    )}
                  >
                    <Link
                      href={getNotificationLink(notification)}
                      onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                      className="notification-dropdown__item-link"
                    >
                      <div className="notification-dropdown__item-icon">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-dropdown__item-content">
                        <div className="notification-dropdown__item-header">
                          {notification.relatedUserAvatar && (
                            <img
                              src={notification.relatedUserAvatar}
                              alt=""
                              className="notification-dropdown__item-avatar"
                            />
                          )}
                          <span className="notification-dropdown__item-title">
                            {notification.title}
                          </span>
                        </div>
                        <p className="notification-dropdown__item-message">
                          {notification.message}
                        </p>
                        <time className="notification-dropdown__item-time">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ja
                          })}
                        </time>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        deleteNotification(notification.id)
                      }}
                      className="notification-dropdown__item-delete"
                      aria-label="削除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 10 && (
            <div className="notification-dropdown__footer">
              <Link
                href="/settings/notifications"
                className="notification-dropdown__view-all"
                onClick={() => setIsOpen(false)}
              >
                すべての通知を見る
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}