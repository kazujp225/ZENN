'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import '@/styles/pages/auth.css'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // URLからトークンを確認
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // パスワードリセットトークンが有効
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      // エラーログ削除（セキュリティ対応）
      setError(err.message || 'パスワードの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <Link href="/" className="auth-logo">Z</Link>
            <h1 className="auth-title">パスワードを更新しました</h1>
          </div>

          <div className="auth-card">
            <div className="auth-success">
              <svg className="auth-success__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="auth-success__title">更新完了</h2>
              <p className="auth-success__message">
                パスワードが正常に更新されました。
                ログインページにリダイレクトします...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link href="/" className="auth-logo">Z</Link>
          <h1 className="auth-title">新しいパスワードを設定</h1>
          <p className="auth-subtitle">
            8文字以上のパスワードを入力してください
          </p>
        </div>

        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                新しいパスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="8文字以上"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword" className="auth-label">
                パスワード（確認）
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
                placeholder="パスワードを再入力"
              />
            </div>

            {error && (
              <div className="auth-error">
                <svg className="auth-error__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="auth-error__message">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit"
            >
              {isLoading ? '更新中...' : 'パスワードを更新'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}