'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function TestLoginPage() {
  const router = useRouter()
  const { user, login, logout, isLoading } = useAuth()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password')

  const handleLogin = async () => {
    try {
      await login(email, password)
      alert('ログイン成功！')
      router.push('/settings/profile')
    } catch (error) {
      alert('ログインエラー: ' + error)
    }
  }

  const handleLogout = () => {
    logout()
    alert('ログアウトしました')
  }

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>認証テストページ</h1>
      
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>現在の状態:</h2>
        <p>ログイン状態: <strong>{user ? 'ログイン済み' : '未ログイン'}</strong></p>
        {user && (
          <>
            <p>ユーザー名: {user.username}</p>
            <p>メール: {user.email}</p>
            <p>ID: {user.id}</p>
          </>
        )}
      </div>

      {!user ? (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>ログイン</h2>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>メール:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>パスワード:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <button
            onClick={handleLogin}
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ログイン (AuthContext)
          </button>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            ※ 任意のメールアドレスとパスワードでログインできます
          </p>
        </div>
      ) : (
        <div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            ログアウト
          </button>
          <button
            onClick={() => router.push('/settings/profile')}
            style={{
              padding: '10px 20px',
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            設定ページへ
          </button>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#fff3cd', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>LocalStorage 情報:</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {typeof window !== 'undefined' && (
            <>
              user: {localStorage.getItem('user') ? 'あり' : 'なし'}
              {'\n'}
              auth-user: {localStorage.getItem('auth-user') ? 'あり' : 'なし'}
              {'\n'}
              auth-session: {localStorage.getItem('auth-session') ? 'あり' : 'なし'}
            </>
          )}
        </pre>
      </div>
    </div>
  )
}