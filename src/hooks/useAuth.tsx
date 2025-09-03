'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  username: string
  name: string
  email: string
  avatar: string
  bio?: string
  followersCount: number
  followingCount: number
  articlesCount: number
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初期化時にローカルストレージからユーザー情報を復元
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('auth-user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('認証状態の復元に失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000)) // シミュレーション

      // 簡単なバリデーション（デモ用）
      if (email === 'test@example.com' && password === 'password123') {
        const mockUser: User = {
          id: '1',
          username: 'testuser',
          name: 'テストユーザー',
          email,
          avatar: '/images/avatar-placeholder.svg',
          bio: 'テスト用のユーザーです',
          followersCount: 100,
          followingCount: 50,
          articlesCount: 25,
          createdAt: new Date().toISOString()
        }
        
        setUser(mockUser)
        localStorage.setItem('auth-user', JSON.stringify(mockUser))
      } else {
        throw new Error('メールアドレスまたはパスワードが正しくありません')
      }
    } catch (error) {
      console.error('ログインエラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1500)) // シミュレーション

      const mockUser: User = {
        id: Date.now().toString(),
        username: email.split('@')[0] + Math.random().toString(36).substr(2, 4),
        name,
        email,
        avatar: '/images/avatar-placeholder.svg',
        bio: '',
        followersCount: 0,
        followingCount: 0,
        articlesCount: 0,
        createdAt: new Date().toISOString()
      }

      setUser(mockUser)
      localStorage.setItem('auth-user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('サインアップエラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 500))

      setUser(null)
      localStorage.removeItem('auth-user')
    } catch (error) {
      console.error('ログアウトエラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      // TODO: Google OAuth実装
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: 'google_' + Date.now(),
        username: 'googleuser' + Math.random().toString(36).substr(2, 4),
        name: 'Google ユーザー',
        email: 'google@example.com',
        avatar: '/images/avatar-placeholder.svg',
        bio: 'Googleでログインしたユーザーです',
        followersCount: 0,
        followingCount: 0,
        articlesCount: 0,
        createdAt: new Date().toISOString()
      }

      setUser(mockUser)
      localStorage.setItem('auth-user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('Google ログインエラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGithub = async () => {
    setIsLoading(true)
    try {
      // TODO: GitHub OAuth実装
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: 'github_' + Date.now(),
        username: 'githubuser' + Math.random().toString(36).substr(2, 4),
        name: 'GitHub ユーザー',
        email: 'github@example.com',
        avatar: '/images/avatar-placeholder.svg',
        bio: 'GitHubでログインしたユーザーです',
        followersCount: 0,
        followingCount: 0,
        articlesCount: 0,
        createdAt: new Date().toISOString()
      }

      setUser(mockUser)
      localStorage.setItem('auth-user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('GitHub ログインエラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return

    setIsLoading(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem('auth-user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loginWithGoogle,
    loginWithGithub,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}