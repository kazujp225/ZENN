'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface Bookmark {
  id: string
  targetId: string
  targetType: 'article' | 'book' | 'scrap'
  createdAt: string
}

interface BookmarkContextType {
  bookmarks: Map<string, boolean> // key: `${targetType}-${targetId}`
  isBookmarked: (targetType: string, targetId: string) => boolean
  toggleBookmark: (targetType: string, targetId: string) => Promise<boolean>
  fetchBookmarks: () => Promise<void>
  loading: boolean
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState<Map<string, boolean>>(new Map())
  const [loading, setLoading] = useState(false)

  // ブックマーク一覧を取得
  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks(new Map())
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bookmarks')
      if (response.ok) {
        const { bookmarks: data } = await response.json()
        const bookmarkMap = new Map<string, boolean>()
        
        data.forEach((bookmark: any) => {
          const key = `${bookmark.target_type}-${bookmark.target_id}`
          bookmarkMap.set(key, true)
        })
        
        setBookmarks(bookmarkMap)
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // ブックマーク状態をチェック
  const isBookmarked = useCallback((targetType: string, targetId: string) => {
    const key = `${targetType}-${targetId}`
    return bookmarks.has(key)
  }, [bookmarks])

  // ブックマークをトグル
  const toggleBookmark = useCallback(async (targetType: string, targetId: string): Promise<boolean> => {
    if (!user) {
      toast.error('ログインが必要です')
      return false
    }

    const key = `${targetType}-${targetId}`
    const currentState = bookmarks.has(key)
    const newState = !currentState

    // 楽観的アップデート
    setBookmarks(prev => {
      const newMap = new Map(prev)
      if (newState) {
        newMap.set(key, true)
      } else {
        newMap.delete(key)
      }
      return newMap
    })

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle bookmark')
      }

      const { bookmarked } = await response.json()
      
      if (bookmarked) {
        toast.success('保存しました')
      } else {
        toast.success('保存を解除しました')
      }
      
      return bookmarked
    } catch (error) {
      // エラー時はロールバック
      setBookmarks(prev => {
        const newMap = new Map(prev)
        if (currentState) {
          newMap.set(key, true)
        } else {
          newMap.delete(key)
        }
        return newMap
      })
      
      console.error('Failed to toggle bookmark:', error)
      toast.error('操作に失敗しました')
      return currentState
    }
  }, [user, bookmarks])

  // 初回読み込み
  useEffect(() => {
    if (user) {
      fetchBookmarks()
    }
  }, [user, fetchBookmarks])

  const value = {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    fetchBookmarks,
    loading,
  }

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  )
}

export function useBookmarks() {
  const context = useContext(BookmarkContext)
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider')
  }
  return context
}