'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import '@/styles/pages/auth.css'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) throw error

      setIsSuccess(true)
    } catch (err: any) {
      // エラーログ削除（セキュリティ対応）
      setError(err.message || 'パスワードリセットメールの送信に失敗しました')
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
            <h1 className="auth-title">メールを確認してください</h1>
            <p className="auth-subtitle">
              パスワードリセット用のリンクを送信しました
            </p>
          </div>

          <div className="auth-card">
            <div className="auth-success">
              <svg className="auth-success__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="auth-success__title">メールを送信しました</h2>
              <p className="auth-success__message">
                {email} 宛にパスワードリセット用のリンクを送信しました。
                メールをご確認ください。
              </p>
              <div className="auth-success__actions">
                <Link href="/login" className="auth-button auth-button--primary">
                  ログインページに戻る
                </Link>
              </div>
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
          <h1 className="auth-title">パスワードリセット</h1>
          <p className="auth-subtitle">
            登録時のメールアドレスを入力してください
          </p>
        </div>

        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="you@example.com"
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
              {isLoading ? '送信中...' : 'リセットメールを送信'}
            </button>

            <div className="auth-links">
              <Link href="/login" className="auth-link">
                ログインに戻る
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}