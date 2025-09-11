'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'

export const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useSupabaseAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1>サインイン</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'サインイン中...' : 'サインイン'}
      </button>
    </form>
  )
}

export const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signUp } = useSupabaseAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await signUp(email, password, username, displayName || username)
      router.push('/auth/verify-email')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1>アカウント作成</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="username">ユーザー名</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          pattern="[a-z0-9_]+"
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="displayName">表示名（任意）</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          disabled={isLoading}
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'アカウント作成中...' : 'アカウント作成'}
      </button>
    </form>
  )
}