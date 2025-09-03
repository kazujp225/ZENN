'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '@/styles/components/header.css'

export const Header = () => {
  // 認証状態をモック（一時的な対処）
  const isAuthenticated = false
  const user = null
  const router = useRouter()
  
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // ユーザーメニューとモバイルメニューの外部クリック処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  // ログアウト処理（モック）
  const handleLogout = async () => {
    try {
      // モック処理
      console.log('ログアウト')
      setShowUserMenu(false)
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  return (
    <>
      <header className="zenn-header">
        <div className="zenn-header__container">
          <div className="zenn-header__content">
            {/* ロゴとハンバーガーメニュー */}
            <div className="zenn-header__left">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="zenn-header__mobile-toggle"
                aria-label={showMobileMenu ? 'メニューを閉じる' : 'メニューを開く'}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showMobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <Link href="/" className="zenn-header__logo">
                <span className="zenn-header__logo-icon">📝</span>
                <span className="zenn-header__logo-text">Zenn</span>
              </Link>
            </div>

            {/* ナビゲーション */}
            <nav className="zenn-header__nav">
              <Link href="/paid-articles" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">💎</span>
                有料記事
              </Link>
              <Link href="/consultations" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">💬</span>
                相談
              </Link>
              <Link href="/jobs" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">💼</span>
                求人
              </Link>
              <div className="zenn-header__nav-separator" />
              <Link href="/" className="zenn-header__nav-link zenn-header__nav-link--active">
                <span className="zenn-header__nav-icon">🔥</span>
                Trending
              </Link>
              <Link href="/explore" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">🔍</span>
                Explore
              </Link>
              <Link href="/articles" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">📄</span>
                記事
              </Link>
              <Link href="/books" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">📚</span>
                本
              </Link>
              <Link href="/scraps" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">💭</span>
                スクラップ
              </Link>
            </nav>

            {/* 検索と認証 */}
            <div className="zenn-header__right">
              {/* 検索フォーム */}
              <form onSubmit={handleSearch} className="zenn-header__search">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="記事を検索..."
                  className="zenn-header__search-input"
                />
                <svg className="zenn-header__search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>

              {/* 検索ボタン（モバイル） */}
              <Link href="/search" className="zenn-header__search-mobile">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              <div className="zenn-header__auth">
                {isAuthenticated && user ? (
                  /* 認証済みユーザー */
                  <>
                    {/* 記事投稿ボタン */}
                    <Link href="/new/article" className="zenn-header__post-btn">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>投稿</span>
                    </Link>

                    {/* ユーザーメニュー */}
                    <div className="zenn-header__user-menu" ref={userMenuRef}>
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="zenn-header__user-trigger"
                        aria-expanded={showUserMenu}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="zenn-header__user-avatar"
                        />
                        <svg className="zenn-header__user-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* ユーザードロップダウンメニュー */}
                      {showUserMenu && (
                        <div className="zenn-header__user-dropdown">
                          {/* ユーザー情報 */}
                          <div className="zenn-header__user-info">
                            <div className="zenn-header__user-profile">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="zenn-header__user-profile-avatar"
                              />
                              <div className="zenn-header__user-profile-info">
                                <h4>{user.name}</h4>
                                <p>@{user.username}</p>
                              </div>
                            </div>
                          </div>

                          {/* メニュー項目 */}
                          <Link
                            href={`/${user.username}`}
                            className="zenn-header__user-menu-item"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            プロフィール
                          </Link>

                          <Link
                            href="/dashboard"
                            className="zenn-header__user-menu-item"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            ダッシュボード
                          </Link>
                          
                          <Link
                            href="/dashboard/earnings"
                            className="zenn-header__user-menu-item"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            収益ダッシュボード
                          </Link>

                          <Link
                            href="/settings"
                            className="zenn-header__user-menu-item"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            設定
                          </Link>

                          <div className="zenn-header__user-menu-separator" />

                          <button
                            onClick={handleLogout}
                            className="zenn-header__user-menu-item zenn-header__logout-btn"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            ログアウト
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* 未認証ユーザー */
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="zenn-header__login-btn"
                  >
                    ログイン
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* モバイルメニュー */}
        {showMobileMenu && (
          <div ref={mobileMenuRef} className="zenn-header__mobile-menu">
            <nav className="zenn-header__mobile-nav">
              {/* Main Content Links */}
              <Link 
                href="/" 
                className="zenn-header__mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                🔥 Trending
              </Link>
              <Link 
                href="/explore" 
                className="zenn-header__mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                🔍 Explore
              </Link>
              <Link 
                href="/articles" 
                className="zenn-header__mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                📄 記事
              </Link>
              <Link 
                href="/books" 
                className="zenn-header__mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                📚 本
              </Link>
              <Link 
                href="/scraps" 
                className="zenn-header__mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                💭 スクラップ
              </Link>
              
              <div className="zenn-header__mobile-separator" />
              
              {/* Monetization Links */}
              <Link 
                href="/paid-articles" 
                className="zenn-header__mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                💎 有料記事
              </Link>
              <Link 
                href="/consultations" 
                className="zenn-header__mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                💬 相談
              </Link>
              <Link 
                href="/jobs" 
                className="zenn-header__mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                💼 求人
              </Link>
              <Link 
                href="/dashboard/earnings" 
                className="zenn-header__mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                📊 収益ダッシュボード
              </Link>
              
              {!isAuthenticated && (
                <>
                  <div className="zenn-header__mobile-separator" />
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      setShowLoginModal(true)
                    }}
                    className="zenn-header__mobile-login"
                  >
                    ログイン
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ログインモーダル（一時的に無効化） */}
    </>
  )
}