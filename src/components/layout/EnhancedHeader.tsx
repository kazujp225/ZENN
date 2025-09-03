'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth'
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch'
import { EnhancedLoginModal } from '@/components/auth/EnhancedLoginModal'

interface HeaderProps {
  className?: string
}

export function EnhancedHeader({ className }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isLoading } = useEnhancedAuth()
  const { query, setQuery, suggestions, getSuggestions } = useEnhancedSearch()
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // メニューの外側クリック検知
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // キーボードショートカット
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setShowSearchSuggestions(false)
        setShowUserMenu(false)
        setShowMobileMenu(false)
        searchInputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [])

  // 検索処理
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value)
    if (value.trim()) {
      getSuggestions(value)
      setShowSearchSuggestions(true)
    } else {
      setShowSearchSuggestions(false)
    }
  }, [getSuggestions])

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setQuery(searchQuery)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearchSuggestions(false)
      searchInputRef.current?.blur()
    }
  }, [searchQuery, setQuery, router])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion)
    setQuery(suggestion)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
    setShowSearchSuggestions(false)
  }, [setQuery, router])

  // ログアウト処理
  const handleLogout = useCallback(async () => {
    try {
      await logout()
      setShowUserMenu(false)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [logout, router])

  // ナビゲーションアイテムの定義
  const navigationItems = [
    {
      href: '/trending',
      label: 'Trending',
      icon: '🔥',
      isActive: pathname === '/trending'
    },
    {
      href: '/explore',
      label: 'Explore', 
      icon: '🔍',
      isActive: pathname === '/explore'
    },
    {
      href: '/articles',
      label: '記事',
      icon: '📄',
      isActive: pathname.startsWith('/articles')
    },
    {
      href: '/books',
      label: '本',
      icon: '📚', 
      isActive: pathname.startsWith('/books')
    },
    {
      href: '/scraps',
      label: 'スクラップ',
      icon: '💭',
      isActive: pathname.startsWith('/scraps')
    }
  ]

  return (
    <>
      <header className={clsx(
        'sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm',
        className
      )}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* ロゴとメインナビゲーション */}
            <div className="flex items-center">
              {/* ロゴ */}
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors mr-8"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-md">
                  Z
                </div>
                <span className="hidden sm:block text-2xl">Zenn</span>
              </Link>

              {/* デスクトップナビゲーション */}
              <nav className="hidden md:flex items-center space-x-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      item.isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* 検索バー */}
            <div className="flex-1 max-w-xl hidden lg:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className={clsx(
                  'relative flex items-center rounded-full border transition-all duration-200',
                  isSearchFocused 
                    ? 'bg-white border-blue-500 ring-2 ring-blue-200 shadow-md' 
                    : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm'
                )}>
                  <div className="flex-shrink-0 pl-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => {
                      setIsSearchFocused(true)
                      if (searchQuery.trim()) {
                        setShowSearchSuggestions(true)
                      }
                    }}
                    onBlur={() => {
                      setIsSearchFocused(false)
                      // 少し遅延させて候補クリックを可能にする
                      setTimeout(() => setShowSearchSuggestions(false), 150)
                    }}
                    placeholder="記事、本、スクラップを検索..."
                    className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm placeholder-gray-500"
                  />
                  <div className="flex-shrink-0 pr-2">
                    <kbd className="hidden lg:inline-flex items-center px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                      {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
                    </kbd>
                  </div>
                </div>

                {/* 検索候補 */}
                {showSearchSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                    {suggestions.slice(0, 8).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-sm">{suggestion.text}</span>
                          {suggestion.type !== 'query' && (
                            <span className={clsx(
                              'px-1.5 py-0.5 text-xs rounded',
                              suggestion.type === 'tag' 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-green-100 text-green-600'
                            )}>
                              {suggestion.type === 'tag' ? 'タグ' : 'ユーザー'}
                            </span>
                          )}
                        </div>
                        {suggestion.count && (
                          <span className="text-xs text-gray-500">{suggestion.count}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* 右側のアクション */}
            <div className="flex items-center space-x-2">
              {/* モバイル検索ボタン */}
              <button
                onClick={() => router.push('/search')}
                className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* 投稿ボタン */}
              {user && (
                <Link
                  href="/new/article"
                  className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  投稿
                </Link>
              )}

              {/* ユーザーメニューまたはログインボタン */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-gray-200"
                    />
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                        {user.name}
                      </div>
                      {user.subscription && (
                        <div className={clsx(
                          'text-xs truncate max-w-32',
                          user.subscription.tier === 'pro' ? 'text-blue-600' :
                          user.subscription.tier === 'premium' ? 'text-purple-600' :
                          'text-gray-500'
                        )}>
                          {user.subscription.tier.toUpperCase()}
                          {user.emailVerified && ' ✓'}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* ユーザードロップダウンメニュー */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {/* ユーザー情報 */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              @{user.username}
                            </div>
                            {user.subscription && (
                              <div className={clsx(
                                'text-xs font-medium mt-1 px-2 py-1 rounded-full inline-block',
                                user.subscription.tier === 'pro' ? 'bg-blue-100 text-blue-700' :
                                user.subscription.tier === 'premium' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              )}>
                                {user.subscription.tier.toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* メニューアイテム */}
                      <div className="py-1">
                        <Link
                          href={`/@${user.username}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          プロフィール
                        </Link>
                        <Link
                          href="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          ダッシュボード
                        </Link>
                        <Link
                          href="/my/articles"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          記事管理
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          設定
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          disabled={isLoading}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {isLoading ? 'ログアウト中...' : 'ログアウト'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  ログイン
                </button>
              )}

              {/* モバイルメニューボタン */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {/* モバイルナビゲーション */}
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={clsx(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors',
                    item.isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* モバイル投稿ボタン */}
              {user && (
                <Link
                  href="/new/article"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors mt-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>記事を投稿</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ログインモーダル */}
      <EnhancedLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}