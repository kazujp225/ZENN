'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import '@/styles/pages/settings.css'

const settingsSections = [
  {
    id: 'profile',
    path: '/settings/profile',
    label: 'プロフィール',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    description: '基本情報の編集'
  },
  {
    id: 'account',
    path: '/settings/account',
    label: 'アカウント',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z"/>
      </svg>
    ),
    description: 'ログイン・セキュリティ設定'
  },
  {
    id: 'notifications',
    path: '/settings/notifications',
    label: '通知',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"/>
        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"/>
      </svg>
    ),
    description: '通知設定の管理'
  },
  {
    id: 'appearance',
    path: '/settings/appearance',
    label: '表示設定',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"/>
      </svg>
    ),
    description: 'テーマ・表示のカスタマイズ'
  },
  {
    id: 'privacy',
    path: '/settings/privacy',
    label: 'プライバシー',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"/>
        <path d="M9 12L11 14L15 10"/>
      </svg>
    ),
    description: 'プライバシー設定の管理'
  },
  {
    id: 'integrations',
    path: '/settings/integrations',
    label: '連携',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27V6.27C19.6963 6.09464 19.352 6.00183 19.0013 6.00006C18.6507 5.99829 18.3056 6.08765 18 6.26V6.26L12 10L6 6.26C5.69445 6.08765 5.34935 5.99829 4.99868 6.00006C4.64801 6.00183 4.30374 6.09464 4 6.27V6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00044 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73C4.30374 17.9054 4.64801 17.9982 4.99868 17.9999C5.34935 18.0017 5.69445 17.9124 6 17.74L12 14L18 17.74C18.3056 17.9124 18.6507 18.0017 19.0013 17.9999C19.352 17.9982 19.6963 17.9054 20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z"/>
      </svg>
    ),
    description: '外部サービス連携'
  },
  {
    id: 'revenue',
    path: '/settings/revenue',
    label: '収益',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    description: '収益化と支払い設定'
  }
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  // ローディング中は表示しない
  if (isLoading) {
    return (
      <div className="settings-auth-required">
        <div className="settings-auth-required__content">
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" />
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="settings-auth-required">
        <div className="settings-auth-required__content">
          <h1>ログインが必要です</h1>
          <p>設定ページを表示するにはログインしてください。</p>
          <Link href="/login" className="settings-auth-required__button">
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-layout">
      <div className="settings-layout__container">
        {/* サイドバー */}
        <aside className="settings-sidebar">
          <div className="settings-sidebar__header">
            <h2 className="settings-sidebar__title">設定</h2>
            <p className="settings-sidebar__subtitle">アカウントと環境設定</p>
          </div>
          
          <nav className="settings-sidebar__nav">
            {settingsSections.map(section => {
              const isActive = pathname === section.path
              return (
                <Link
                  key={section.id}
                  href={section.path}
                  className={`settings-sidebar__item ${isActive ? 'settings-sidebar__item--active' : ''}`}
                >
                  <div className="settings-sidebar__item-icon">
                    {section.icon}
                  </div>
                  <div className="settings-sidebar__item-content">
                    <div className="settings-sidebar__item-label">
                      {section.label}
                    </div>
                    <div className="settings-sidebar__item-description">
                      {section.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="settings-sidebar__item-indicator" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="settings-sidebar__footer">
            <Link href={`/${user?.username || 'profile'}`} className="settings-sidebar__profile-link">
              <img 
                src={user?.avatar || '/images/avatar-placeholder.svg'} 
                alt={user?.displayName || user?.username || 'User'}
                className="settings-sidebar__avatar"
              />
              <div>
                <div className="settings-sidebar__username">{user?.displayName || user?.username || 'ユーザー'}</div>
                <div className="settings-sidebar__view-profile">プロフィールを表示</div>
              </div>
            </Link>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="settings-main">
          {children}
        </main>
      </div>
    </div>
  )
}