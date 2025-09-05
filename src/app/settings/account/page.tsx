'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import '@/styles/pages/settings.css'

export default function AccountSettingsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '新しいパスワードが一致しません' })
      return
    }

    setIsLoading(true)
    try {
      // パスワード変更API呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: 'パスワードを変更しました' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({ type: 'error', text: 'パスワードの変更に失敗しました' })
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    try {
      // アカウント削除API呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000))
      // ログアウトして削除完了ページへリダイレクト
    } catch (error) {
      setMessage({ type: 'error', text: 'アカウントの削除に失敗しました' })
    } finally {
      setIsLoading(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="settings-content">
      <div className="settings-content__header">
        <h1 className="settings-content__title">アカウント設定</h1>
        <p className="settings-content__description">
          ログインとセキュリティの設定を管理します
        </p>
      </div>

      {message.text && (
        <div className={`settings-message settings-message--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* メールアドレス */}
      <div className="settings-section">
        <h2 className="settings-section__title">メールアドレス</h2>
        <div className="settings-field">
          <div className="settings-field__readonly">
            <div className="settings-field__readonly-label">現在のメールアドレス</div>
            <div className="settings-field__readonly-value">
              {user?.email}
              <span className="settings-badge settings-badge--success">確認済み</span>
            </div>
          </div>
          <button className="settings-button settings-button--secondary">
            メールアドレスを変更
          </button>
        </div>
      </div>

      {/* パスワード変更 */}
      <div className="settings-section">
        <h2 className="settings-section__title">パスワード</h2>
        <form onSubmit={handlePasswordChange}>
          <div className="settings-field">
            <label htmlFor="currentPassword" className="settings-field__label">
              現在のパスワード
            </label>
            <input
              type="password"
              id="currentPassword"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="settings-field__input"
              required
            />
          </div>

          <div className="settings-field">
            <label htmlFor="newPassword" className="settings-field__label">
              新しいパスワード
            </label>
            <input
              type="password"
              id="newPassword"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="settings-field__input"
              minLength={8}
              required
            />
            <p className="settings-field__help">
              8文字以上で、大文字・小文字・数字を含めてください
            </p>
          </div>

          <div className="settings-field">
            <label htmlFor="confirmPassword" className="settings-field__label">
              新しいパスワード（確認）
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="settings-field__input"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="settings-button settings-button--primary"
          >
            パスワードを変更
          </button>
        </form>
      </div>

      {/* 2要素認証 */}
      <div className="settings-section">
        <h2 className="settings-section__title">2要素認証</h2>
        <div className="settings-2fa">
          <div className="settings-2fa__content">
            <div className="settings-2fa__status">
              {twoFactorEnabled ? (
                <>
                  <span className="settings-badge settings-badge--success">有効</span>
                  <p>2要素認証が有効になっています。ログイン時に追加の確認が必要です。</p>
                </>
              ) : (
                <>
                  <span className="settings-badge settings-badge--warning">無効</span>
                  <p>2要素認証を有効にすると、アカウントのセキュリティが向上します。</p>
                </>
              )}
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`settings-button ${twoFactorEnabled ? 'settings-button--danger' : 'settings-button--primary'}`}
            >
              {twoFactorEnabled ? '2要素認証を無効にする' : '2要素認証を有効にする'}
            </button>
          </div>
        </div>
      </div>

      {/* ログインセッション */}
      <div className="settings-section">
        <h2 className="settings-section__title">ログインセッション</h2>
        <div className="settings-sessions">
          <div className="settings-session">
            <div className="settings-session__device">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8"/>
                <path d="M12 17v4"/>
              </svg>
              <div>
                <div className="settings-session__name">Chrome on macOS</div>
                <div className="settings-session__info">
                  東京, 日本 • 現在のセッション
                </div>
              </div>
            </div>
            <span className="settings-badge settings-badge--success">アクティブ</span>
          </div>

          <div className="settings-session">
            <div className="settings-session__device">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <path d="M12 18h.01"/>
              </svg>
              <div>
                <div className="settings-session__name">Safari on iPhone</div>
                <div className="settings-session__info">
                  大阪, 日本 • 2日前
                </div>
              </div>
            </div>
            <button className="settings-button settings-button--ghost">
              ログアウト
            </button>
          </div>
        </div>

        <button className="settings-button settings-button--secondary">
          すべてのデバイスからログアウト
        </button>
      </div>

      {/* 連携アカウント */}
      <div className="settings-section">
        <h2 className="settings-section__title">連携アカウント</h2>
        <div className="settings-connections">
          <div className="settings-connection">
            <div className="settings-connection__provider">
              <div className="settings-connection__icon settings-connection__icon--github">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
                </svg>
              </div>
              <div>
                <div className="settings-connection__name">GitHub</div>
                <div className="settings-connection__status">接続済み: @username</div>
              </div>
            </div>
            <button className="settings-button settings-button--ghost">
              連携を解除
            </button>
          </div>

          <div className="settings-connection">
            <div className="settings-connection__provider">
              <div className="settings-connection__icon settings-connection__icon--google">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <div className="settings-connection__name">Google</div>
                <div className="settings-connection__status">未接続</div>
              </div>
            </div>
            <button className="settings-button settings-button--primary">
              連携する
            </button>
          </div>
        </div>
      </div>

      {/* アカウント削除 */}
      <div className="settings-section settings-section--danger">
        <h2 className="settings-section__title">危険な操作</h2>
        <div className="settings-danger">
          <div>
            <h3>アカウントを削除</h3>
            <p className="settings-danger__text">
              アカウントを削除すると、すべてのデータが完全に削除され、復元することはできません。
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="settings-button settings-button--danger"
          >
            アカウントを削除
          </button>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <div className="settings-modal">
          <div className="settings-modal__backdrop" onClick={() => setShowDeleteModal(false)} />
          <div className="settings-modal__content">
            <h2 className="settings-modal__title">本当にアカウントを削除しますか？</h2>
            <p className="settings-modal__text">
              この操作は取り消すことができません。すべての記事、本、スクラップ、および関連データが完全に削除されます。
            </p>
            <div className="settings-modal__actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="settings-button settings-button--secondary"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteAccount}
                className="settings-button settings-button--danger"
                disabled={isLoading}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}