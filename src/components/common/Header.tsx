'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserDropdown } from '@/components/auth/UserDropdown'
import '@/styles/components/header.css'

export const Header = () => {
  const { user, isLoading } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()
  
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
                <span className="zenn-header__nav-text">有料記事</span>
              </Link>
              <Link href="/consultations" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">💬</span>
                <span className="zenn-header__nav-text">相談</span>
              </Link>
              <Link href="/jobs" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">💼</span>
                <span className="zenn-header__nav-text">求人</span>
              </Link>
              <div className="zenn-header__nav-separator" />
              <Link href="/" className="zenn-header__nav-link zenn-header__nav-link--active">
                <span className="zenn-header__nav-icon">🔥</span>
                <span className="zenn-header__nav-text">Trending</span>
              </Link>
              <Link href="/explore" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">🔍</span>
                <span className="zenn-header__nav-text">Explore</span>
              </Link>
              <Link href="/articles" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">📄</span>
                <span className="zenn-header__nav-text">記事</span>
              </Link>
              <Link href="/books" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">📚</span>
                <span className="zenn-header__nav-text">本</span>
              </Link>
              <Link href="/scraps" className="zenn-header__nav-link">
                <span className="zenn-header__nav-icon">💭</span>
                <span className="zenn-header__nav-text">スクラップ</span>
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
                {!isLoading && (
                  isAuthenticated && user ? (
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
                      <UserDropdown />
                    </>
                  ) : (
                    /* 未認証ユーザー */
                    <>
                      <Link
                        href="/login"
                        className="zenn-header__login-btn"
                      >
                        ログイン
                      </Link>
                    </>
                  )
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
                  <Link
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="zenn-header__mobile-login"
                  >
                    ログイン
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

    </>
  )
}