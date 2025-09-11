'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useBookmarks } from '@/contexts/BookmarkContext'
import '@/styles/pages/bookmarks.css'

interface BookmarkedItem {
  id: string
  target_id: string
  target_type: 'article' | 'book' | 'scrap'
  created_at: string
  article?: {
    id: string
    title: string
    emoji: string
    slug: string
    published_at: string
    likes_count: number
    user: {
      username: string
      display_name: string
      avatar_url: string
    }
  }
  book?: {
    id: string
    title: string
    emoji: string
    slug: string
    published_at: string
    likes_count: number
    user: {
      username: string
      display_name: string
      avatar_url: string
    }
  }
  scrap?: {
    id: string
    title: string
    emoji: string
    created_at: string
    likes_count: number
    user: {
      username: string
      display_name: string
      avatar_url: string
    }
  }
}

export default function BookmarksPage() {
  const { user } = useAuth()
  const { toggleBookmark } = useBookmarks()
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'article' | 'book' | 'scrap'>('all')

  useEffect(() => {
    fetchBookmarks()
  }, [user])

  const fetchBookmarks = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/bookmarks')
      if (response.ok) {
        const { bookmarks } = await response.json()
        setBookmarks(bookmarks)
      }
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBookmark = async (type: string, id: string) => {
    await toggleBookmark(type, id)
    // リストから削除
    setBookmarks(prev => prev.filter(b => 
      !(b.target_type === type && b.target_id === id)
    ))
  }

  const filteredBookmarks = filter === 'all' 
    ? bookmarks 
    : bookmarks.filter(b => b.target_type === filter)

  if (!user) {
    return (
      <div className="bookmarks-page">
        <div className="bookmarks-empty">
          <span className="bookmarks-empty__icon">🔖</span>
          <h2 className="bookmarks-empty__title">ログインが必要です</h2>
          <p className="bookmarks-empty__description">
            ブックマークを利用するにはログインしてください
          </p>
          <Link href="/login" className="bookmarks-empty__button">
            ログインする
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-header">
        <h1 className="bookmarks-header__title">
          <span className="bookmarks-header__icon">🔖</span>
          ブックマーク
        </h1>
        <p className="bookmarks-header__description">
          保存した記事、本、スクラップの一覧
        </p>
      </div>

      {/* フィルタータブ */}
      <div className="bookmarks-filters">
        <button
          onClick={() => setFilter('all')}
          className={`bookmarks-filter ${filter === 'all' ? 'bookmarks-filter--active' : ''}`}
        >
          すべて ({bookmarks.length})
        </button>
        <button
          onClick={() => setFilter('article')}
          className={`bookmarks-filter ${filter === 'article' ? 'bookmarks-filter--active' : ''}`}
        >
          記事 ({bookmarks.filter(b => b.target_type === 'article').length})
        </button>
        <button
          onClick={() => setFilter('book')}
          className={`bookmarks-filter ${filter === 'book' ? 'bookmarks-filter--active' : ''}`}
        >
          本 ({bookmarks.filter(b => b.target_type === 'book').length})
        </button>
        <button
          onClick={() => setFilter('scrap')}
          className={`bookmarks-filter ${filter === 'scrap' ? 'bookmarks-filter--active' : ''}`}
        >
          スクラップ ({bookmarks.filter(b => b.target_type === 'scrap').length})
        </button>
      </div>

      {/* ブックマーク一覧 */}
      {loading ? (
        <div className="bookmarks-loading">
          <div className="bookmarks-loading__spinner" />
          <span>読み込み中...</span>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="bookmarks-empty">
          <span className="bookmarks-empty__icon">📑</span>
          <h2 className="bookmarks-empty__title">
            {filter === 'all' ? 'ブックマークがありません' : `${filter === 'article' ? '記事' : filter === 'book' ? '本' : 'スクラップ'}のブックマークがありません`}
          </h2>
          <p className="bookmarks-empty__description">
            気になるコンテンツを保存して、あとで読み返しましょう
          </p>
        </div>
      ) : (
        <div className="bookmarks-list">
          {filteredBookmarks.map((bookmark) => {
            const item = bookmark.article || bookmark.book || bookmark.scrap
            if (!item) return null

            const isArticle = bookmark.target_type === 'article'
            const isBook = bookmark.target_type === 'book'
            const href = isArticle 
              ? `/articles/${bookmark.article?.slug || bookmark.target_id}`
              : isBook 
              ? `/books/${bookmark.book?.slug || bookmark.target_id}`
              : `/scraps/${bookmark.target_id}`

            return (
              <div key={bookmark.id} className="bookmark-item">
                <Link href={href} className="bookmark-item__content">
                  <div className="bookmark-item__emoji">
                    {item.emoji || '📝'}
                  </div>
                  <div className="bookmark-item__info">
                    <h3 className="bookmark-item__title">
                      {item.title}
                    </h3>
                    <div className="bookmark-item__meta">
                      <img
                        src={item.user.avatar_url || '/images/avatar-placeholder.svg'}
                        alt=""
                        className="bookmark-item__avatar"
                      />
                      <span className="bookmark-item__author">
                        {item.user.display_name || item.user.username}
                      </span>
                      <span className="bookmark-item__separator">·</span>
                      <span className="bookmark-item__date">
                        {new Date('published_at' in item ? item.published_at : item.created_at).toLocaleDateString('ja-JP')}
                      </span>
                      <span className="bookmark-item__separator">·</span>
                      <span className="bookmark-item__likes">
                        ❤️ {item.likes_count}
                      </span>
                    </div>
                    <div className="bookmark-item__type">
                      <span className={`bookmark-item__badge bookmark-item__badge--${bookmark.target_type}`}>
                        {bookmark.target_type === 'article' ? '記事' : bookmark.target_type === 'book' ? '本' : 'スクラップ'}
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.target_type, bookmark.target_id)}
                  className="bookmark-item__remove"
                  aria-label="ブックマークを解除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}