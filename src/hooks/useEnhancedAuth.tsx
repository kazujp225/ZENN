'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'

export interface User {
  id: string
  username: string
  name: string
  email: string
  avatar: string
  bio?: string
  website?: string
  location?: string
  followersCount: number
  followingCount: number
  articlesCount: number
  createdAt: string
  emailVerified: boolean
  twoFactorEnabled: boolean
  lastActiveAt: string
  provider?: 'email' | 'google' | 'github'
  permissions: string[]
  subscription?: {
    tier: 'free' | 'pro' | 'premium'
    expiresAt?: string
  }
}

export interface AuthSession {
  token: string
  refreshToken: string
  expiresAt: string
  device: string
  ipAddress: string
  createdAt: string
}

export interface LoginAttempt {
  email: string
  timestamp: string
  success: boolean
  ipAddress?: string
  userAgent?: string
}

interface AuthError {
  code: string
  message: string
  field?: string
}

interface AuthContextType {
  // State
  user: User | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  loginAttempts: LoginAttempt[]
  isRateLimited: boolean
  
  // Authentication methods
  login: (credentials: { email: string; password: string }, rememberMe?: boolean) => Promise<void>
  signup: (email: string, password: string, name: string, username?: string) => Promise<void>
  logout: (allDevices?: boolean) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  
  // Profile management
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
  
  // Two-factor authentication
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string }>
  verifyTwoFactor: (code: string) => Promise<void>
  disableTwoFactor: (password: string) => Promise<void>
  
  // Email verification
  sendVerificationEmail: () => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  
  // Password reset
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  
  // Session management
  refreshSession: () => Promise<void>
  getActiveSessions: () => Promise<AuthSession[]>
  revokeSession: (sessionId: string) => Promise<void>
  
  // Security
  clearLoginAttempts: () => void
  checkRateLimit: (email: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// セキュリティ設定
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15分
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24時間
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5分前にリフレッシュ
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_SPECIAL: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_UPPERCASE: true
}

// パスワード強度チェック
const validatePassword = (password: string): string[] => {
  const errors: string[] = []
  
  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`パスワードは${SECURITY_CONFIG.PASSWORD_MIN_LENGTH}文字以上である必要があります`)
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('パスワードには大文字が含まれている必要があります')
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push('パスワードには数字が含まれている必要があります')
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('パスワードには特殊文字が含まれている必要があります')
  }
  
  // 一般的な脆弱パスワードチェック
  const commonPasswords = ['password', '123456', 'password123', 'qwerty', 'abc123']
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('より安全なパスワードを使用してください')
  }
  
  return errors
}

// メールアドレス検証
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ユーザー名検証
const validateUsername = (username: string): string[] => {
  const errors: string[] = []
  
  if (username.length < 3) {
    errors.push('ユーザー名は3文字以上である必要があります')
  }
  
  if (username.length > 20) {
    errors.push('ユーザー名は20文字以内である必要があります')
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('ユーザー名は英数字とアンダースコアのみ使用できます')
  }
  
  // 予約語チェック
  const reservedWords = ['admin', 'api', 'www', 'mail', 'ftp', 'root', 'test']
  if (reservedWords.includes(username.toLowerCase())) {
    errors.push('このユーザー名は使用できません')
  }
  
  return errors
}

export function EnhancedAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([])
  const [isRateLimited, setIsRateLimited] = useState(false)
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // セキュリティ強化：デバイス情報の取得
  const getDeviceInfo = useCallback(() => {
    const userAgent = navigator.userAgent
    const platform = navigator.platform
    const language = navigator.language
    
    return {
      userAgent,
      device: `${platform} - ${userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}`,
      language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`
    }
  }, [])

  // セッション自動更新の設定
  const scheduleTokenRefresh = useCallback((expiresAt: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    
    const expiryTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()
    const refreshTime = expiryTime - SECURITY_CONFIG.REFRESH_THRESHOLD
    
    if (refreshTime > currentTime) {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshSession()
      }, refreshTime - currentTime)
    }
  }, [])

  // ハートビート機能（セッション維持）
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }
    
    heartbeatIntervalRef.current = setInterval(async () => {
      if (user && session) {
        try {
          // APIにハートビートを送信
          // await api.post('/auth/heartbeat')
          
          // ユーザーの最終アクティブ時間を更新
          setUser(prev => prev ? {
            ...prev,
            lastActiveAt: new Date().toISOString()
          } : null)
        } catch (error) {
          console.error('ハートビート失敗:', error)
        }
      }
    }, 5 * 60 * 1000) // 5分間隔
  }, [user, session])

  // 初期化
  useEffect(() => {
    const initAuth = async () => {
      try {
        // セキュア storage からのデータ復元
        const savedUser = localStorage.getItem('auth-user')
        const savedSession = localStorage.getItem('auth-session')
        const savedAttempts = localStorage.getItem('login-attempts')
        
        if (savedUser && savedSession) {
          const user = JSON.parse(savedUser)
          const session = JSON.parse(savedSession)
          
          // セッションの有効性確認
          if (new Date(session.expiresAt) > new Date()) {
            setUser(user)
            setSession(session)
            scheduleTokenRefresh(session.expiresAt)
            startHeartbeat()
            
            // セッション検証API呼び出し（実環境では必須）
            // await validateSession(session.token)
          } else {
            // 期限切れセッションのクリーンアップ
            localStorage.removeItem('auth-user')
            localStorage.removeItem('auth-session')
          }
        }
        
        if (savedAttempts) {
          const attempts = JSON.parse(savedAttempts)
          // 古いログイン試行記録をクリーンアップ
          const validAttempts = attempts.filter((attempt: LoginAttempt) => 
            Date.now() - new Date(attempt.timestamp).getTime() < SECURITY_CONFIG.RATE_LIMIT_WINDOW
          )
          setLoginAttempts(validAttempts)
        }
        
      } catch (error) {
        console.error('認証状態の復元に失敗:', error)
        // セキュリティのため、エラー時はクリーンアップ
        localStorage.removeItem('auth-user')
        localStorage.removeItem('auth-session')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // クリーンアップ
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [scheduleTokenRefresh, startHeartbeat])

  // レート制限チェック
  const checkRateLimit = useCallback((email: string): boolean => {
    const now = Date.now()
    const recentAttempts = loginAttempts.filter(attempt => 
      attempt.email === email && 
      now - new Date(attempt.timestamp).getTime() < SECURITY_CONFIG.RATE_LIMIT_WINDOW
    )
    
    const isLimited = recentAttempts.length >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS
    setIsRateLimited(isLimited)
    return isLimited
  }, [loginAttempts])

  // ログイン試行記録
  const recordLoginAttempt = useCallback((email: string, success: boolean) => {
    const attempt: LoginAttempt = {
      email,
      timestamp: new Date().toISOString(),
      success,
      ipAddress: 'unknown', // 実環境では実際のIPアドレス
      userAgent: navigator.userAgent
    }
    
    const newAttempts = [...loginAttempts, attempt]
      .filter(a => Date.now() - new Date(a.timestamp).getTime() < SECURITY_CONFIG.RATE_LIMIT_WINDOW)
      .slice(-20) // 最大20件保持
    
    setLoginAttempts(newAttempts)
    localStorage.setItem('login-attempts', JSON.stringify(newAttempts))
  }, [loginAttempts])

  // 安全なデータ保存
  const saveAuthData = useCallback((user: User, session: AuthSession) => {
    try {
      localStorage.setItem('auth-user', JSON.stringify(user))
      localStorage.setItem('auth-session', JSON.stringify(session))
    } catch (error) {
      console.error('認証データの保存に失敗:', error)
      throw new Error('セッションの保存に失敗しました')
    }
  }, [])

  // ログイン
  const login = useCallback(async (credentials: { email: string; password: string }, rememberMe: boolean = false) => {
    const { email, password } = credentials
    
    // バリデーション
    if (!validateEmail(email)) {
      throw new Error('有効なメールアドレスを入力してください')
    }
    
    if (!password || !password.trim()) {
      throw new Error('パスワードを入力してください')
    }

    // レート制限チェック
    if (checkRateLimit(email)) {
      throw new Error(`ログイン試行回数が上限に達しました。${SECURITY_CONFIG.RATE_LIMIT_WINDOW / 1000 / 60}分後に再試行してください`)
    }

    setIsLoading(true)
    try {
      const deviceInfo = getDeviceInfo()
      
      // API呼び出しシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

      // デモ用認証
      const demoCredentials = [
        { email: 'user@example.com', password: 'password', role: 'user' },
        { email: 'pro@example.com', password: 'password', role: 'pro' },
        { email: 'admin@example.com', password: 'password', role: 'admin' }
      ]
      
      const matchedUser = demoCredentials.find(cred => cred.email === email && cred.password === password)
      
      if (matchedUser || (email === 'test@example.com' && password === 'Password123!')) {
        const role = matchedUser?.role || 'user'
        
        const userProfiles = {
          user: {
            id: '1',
            username: 'user_sample',
            name: '一般ユーザー',
            bio: 'Zennで技術記事を読んで学習しています',
            followersCount: 50,
            followingCount: 120,
            articlesCount: 3,
            subscription: { tier: 'free' as const }
          },
          pro: {
            id: '2',
            username: 'pro_developer',
            name: 'プロ開発者',
            bio: '現役エンジニア。React/TypeScript/Node.jsの記事を投稿しています',
            followersCount: 500,
            followingCount: 200,
            articlesCount: 45,
            subscription: {
              tier: 'pro' as const,
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            }
          },
          admin: {
            id: '3',
            username: 'admin_master',
            name: '管理者',
            bio: 'Zennプラットフォームの管理者です',
            followersCount: 5000,
            followingCount: 100,
            articlesCount: 200,
            subscription: {
              tier: 'premium' as const,
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            }
          }
        }
        
        const userProfile = userProfiles[role as keyof typeof userProfiles] || userProfiles.user
        
        const mockUser: User = {
          ...userProfile,
          email,
          avatar: '/images/avatar-placeholder.svg',
          website: 'https://example.com',
          location: '東京, Japan',
          createdAt: '2023-01-01T00:00:00Z',
          emailVerified: true,
          twoFactorEnabled: false,
          lastActiveAt: new Date().toISOString(),
          provider: 'email',
          permissions: role === 'admin' ? ['read', 'write', 'comment', 'moderate', 'admin'] : ['read', 'write', 'comment']
        }
        
        const mockSession: AuthSession = {
          token: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString(),
          device: deviceInfo.device,
          ipAddress: '192.168.1.1',
          createdAt: new Date().toISOString()
        }
        
        setUser(mockUser)
        setSession(mockSession)
        saveAuthData(mockUser, mockSession)
        scheduleTokenRefresh(mockSession.expiresAt)
        startHeartbeat()
        recordLoginAttempt(email, true)
        
        // 成功時の追加セキュリティ処理
        console.log('ログイン成功:', {
          userId: mockUser.id,
          device: deviceInfo.device,
          timestamp: new Date().toISOString()
        })
      } else {
        recordLoginAttempt(email, false)
        throw new Error('メールアドレスまたはパスワードが正しくありません')
      }
    } catch (error) {
      recordLoginAttempt(email, false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [checkRateLimit, getDeviceInfo, recordLoginAttempt, saveAuthData, scheduleTokenRefresh, startHeartbeat])

  // 新規登録
  const signup = useCallback(async (email: string, password: string, name: string, username?: string) => {
    // バリデーション
    if (!validateEmail(email)) {
      throw new Error('有効なメールアドレスを入力してください')
    }
    
    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      throw new Error(passwordErrors[0])
    }
    
    if (!name.trim()) {
      throw new Error('名前を入力してください')
    }
    
    if (name.length > 50) {
      throw new Error('名前は50文字以内で入力してください')
    }
    
    let finalUsername = username || email.split('@')[0]
    const usernameErrors = validateUsername(finalUsername)
    if (usernameErrors.length > 0) {
      throw new Error(usernameErrors[0])
    }

    setIsLoading(true)
    try {
      const deviceInfo = getDeviceInfo()
      
      // API呼び出しシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

      // ユーザー名の重複チェック（実環境では必須）
      finalUsername = finalUsername + Math.random().toString(36).substr(2, 4)

      const mockUser: User = {
        id: Date.now().toString(),
        username: finalUsername,
        name: name.trim(),
        email,
        avatar: '/images/avatar-placeholder.svg',
        bio: '',
        website: '',
        location: '',
        followersCount: 0,
        followingCount: 0,
        articlesCount: 0,
        createdAt: new Date().toISOString(),
        emailVerified: false,
        twoFactorEnabled: false,
        lastActiveAt: new Date().toISOString(),
        provider: 'email',
        permissions: ['read', 'write', 'comment'],
        subscription: {
          tier: 'free'
        }
      }

      const mockSession: AuthSession = {
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        device: deviceInfo.device,
        ipAddress: '192.168.1.1',
        createdAt: new Date().toISOString()
      }

      setUser(mockUser)
      setSession(mockSession)
      saveAuthData(mockUser, mockSession)
      scheduleTokenRefresh(mockSession.expiresAt)
      startHeartbeat()

      console.log('アカウント作成成功:', {
        userId: mockUser.id,
        username: mockUser.username,
        device: deviceInfo.device,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('サインアップエラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [getDeviceInfo, saveAuthData, scheduleTokenRefresh, startHeartbeat])

  // ログアウト
  const logout = useCallback(async (allDevices: boolean = false) => {
    setIsLoading(true)
    try {
      if (session) {
        // API呼び出しでセッションを無効化
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('ログアウト:', {
          userId: user?.id,
          allDevices,
          timestamp: new Date().toISOString()
        })
      }

      setUser(null)
      setSession(null)
      localStorage.removeItem('auth-user')
      localStorage.removeItem('auth-session')

      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }

    } catch (error) {
      console.error('ログアウトエラー:', error)
      // エラーでもローカルデータはクリア
      setUser(null)
      setSession(null)
      localStorage.removeItem('auth-user')
      localStorage.removeItem('auth-session')
    } finally {
      setIsLoading(false)
    }
  }, [session, user?.id])

  // Google OAuth
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    try {
      const deviceInfo = getDeviceInfo()
      
      // OAuth実装をシミュレーション
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockUser: User = {
        id: 'google_' + Date.now(),
        username: 'googleuser' + Math.random().toString(36).substr(2, 4),
        name: 'Google ユーザー',
        email: 'google.user@gmail.com',
        avatar: 'https://lh3.googleusercontent.com/a/default-user',
        bio: 'Googleでログインしました',
        followersCount: 0,
        followingCount: 0,
        articlesCount: 0,
        createdAt: new Date().toISOString(),
        emailVerified: true, // Googleアカウントは既に検証済み
        twoFactorEnabled: false,
        lastActiveAt: new Date().toISOString(),
        provider: 'google',
        permissions: ['read', 'write', 'comment'],
        subscription: {
          tier: 'free'
        }
      }

      const mockSession: AuthSession = {
        token: 'mock-google-jwt-' + Date.now(),
        refreshToken: 'mock-google-refresh-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        device: deviceInfo.device,
        ipAddress: '192.168.1.1',
        createdAt: new Date().toISOString()
      }

      setUser(mockUser)
      setSession(mockSession)
      saveAuthData(mockUser, mockSession)
      scheduleTokenRefresh(mockSession.expiresAt)
      startHeartbeat()

    } catch (error) {
      console.error('Google ログインエラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [getDeviceInfo, saveAuthData, scheduleTokenRefresh, startHeartbeat])

  // GitHub OAuth
  const loginWithGithub = useCallback(async () => {
    setIsLoading(true)
    try {
      const deviceInfo = getDeviceInfo()
      
      // OAuth実装をシミュレーション
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockUser: User = {
        id: 'github_' + Date.now(),
        username: 'githubuser' + Math.random().toString(36).substr(2, 4),
        name: 'GitHub Developer',
        email: 'developer@github.com',
        avatar: 'https://avatars.githubusercontent.com/u/0?v=4',
        bio: 'GitHubからログインした開発者です',
        website: 'https://github.com',
        followersCount: 0,
        followingCount: 0,
        articlesCount: 0,
        createdAt: new Date().toISOString(),
        emailVerified: true,
        twoFactorEnabled: false,
        lastActiveAt: new Date().toISOString(),
        provider: 'github',
        permissions: ['read', 'write', 'comment'],
        subscription: {
          tier: 'free'
        }
      }

      const mockSession: AuthSession = {
        token: 'mock-github-jwt-' + Date.now(),
        refreshToken: 'mock-github-refresh-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        device: deviceInfo.device,
        ipAddress: '192.168.1.1',
        createdAt: new Date().toISOString()
      }

      setUser(mockUser)
      setSession(mockSession)
      saveAuthData(mockUser, mockSession)
      scheduleTokenRefresh(mockSession.expiresAt)
      startHeartbeat()

    } catch (error) {
      console.error('GitHub ログインエラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [getDeviceInfo, saveAuthData, scheduleTokenRefresh, startHeartbeat])

  // プロフィール更新
  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) throw new Error('ログインしていません')

    // バリデーション
    if (data.name && data.name.length > 50) {
      throw new Error('名前は50文字以内で入力してください')
    }
    
    if (data.bio && data.bio.length > 500) {
      throw new Error('自己紹介は500文字以内で入力してください')
    }
    
    if (data.username) {
      const usernameErrors = validateUsername(data.username)
      if (usernameErrors.length > 0) {
        throw new Error(usernameErrors[0])
      }
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedUser = { 
        ...user, 
        ...data,
        lastActiveAt: new Date().toISOString()
      }
      
      setUser(updatedUser)
      
      if (session) {
        saveAuthData(updatedUser, session)
      }

      console.log('プロフィール更新:', {
        userId: user.id,
        changes: Object.keys(data),
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, session, saveAuthData])

  // パスワード変更
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('ログインしていません')
    
    if (user.provider !== 'email') {
      throw new Error('ソーシャルログインユーザーはパスワードを変更できません')
    }
    
    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      throw new Error(passwordErrors[0])
    }
    
    if (currentPassword === newPassword) {
      throw new Error('新しいパスワードは現在のパスワードと異なるものを設定してください')
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 実環境では現在のパスワード検証が必要
      console.log('パスワード変更成功:', {
        userId: user.id,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('パスワード変更エラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // アカウント削除
  const deleteAccount = useCallback(async (password: string) => {
    if (!user) throw new Error('ログインしていません')
    
    if (user.provider === 'email' && !password.trim()) {
      throw new Error('パスワードを入力してください')
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('アカウント削除:', {
        userId: user.id,
        timestamp: new Date().toISOString()
      })
      
      // ログアウト処理
      await logout(true)

    } catch (error) {
      console.error('アカウント削除エラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, logout])

  // セッション更新
  const refreshSession = useCallback(async () => {
    if (!session) return
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newSession: AuthSession = {
        ...session,
        token: 'refreshed-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
      
      setSession(newSession)
      
      if (user) {
        saveAuthData(user, newSession)
      }
      
      scheduleTokenRefresh(newSession.expiresAt)
      
    } catch (error) {
      console.error('セッション更新エラー:', error)
      // 更新失敗時はログアウト
      await logout()
    }
  }, [session, user, saveAuthData, scheduleTokenRefresh, logout])

  // 二要素認証の有効化
  const enableTwoFactor = useCallback(async () => {
    if (!user) throw new Error('ログインしていません')
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // モック2FA設定
      const mockSecret = 'JBSWY3DPEHPK3PXP'
      const mockQrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
      
      return { secret: mockSecret, qrCode: mockQrCode }
      
    } catch (error) {
      console.error('2FA有効化エラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 2FAコード確認
  const verifyTwoFactor = useCallback(async (code: string) => {
    if (!user) throw new Error('ログインしていません')
    
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('6桁の数字を入力してください')
    }
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // モックコード検証（実環境では実際の検証が必要）
      const updatedUser = { ...user, twoFactorEnabled: true }
      setUser(updatedUser)
      
      if (session) {
        saveAuthData(updatedUser, session)
      }
      
    } catch (error) {
      console.error('2FA確認エラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, session, saveAuthData])

  // 2FAの無効化
  const disableTwoFactor = useCallback(async (password: string) => {
    if (!user) throw new Error('ログインしていません')
    if (!password.trim()) throw new Error('パスワードを入力してください')
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedUser = { ...user, twoFactorEnabled: false }
      setUser(updatedUser)
      
      if (session) {
        saveAuthData(updatedUser, session)
      }
      
    } catch (error) {
      console.error('2FA無効化エラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, session, saveAuthData])

  // メール確認送信
  const sendVerificationEmail = useCallback(async () => {
    if (!user) throw new Error('ログインしていません')
    if (user.emailVerified) throw new Error('メールアドレスは既に確認済みです')
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('確認メール送信:', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('確認メール送信エラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // メールアドレス確認
  const verifyEmail = useCallback(async (token: string) => {
    if (!user) throw new Error('ログインしていません')
    if (!token.trim()) throw new Error('確認トークンが無効です')
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedUser = { ...user, emailVerified: true }
      setUser(updatedUser)
      
      if (session) {
        saveAuthData(updatedUser, session)
      }
      
    } catch (error) {
      console.error('メール確認エラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, session, saveAuthData])

  // パスワードリセット要求
  const requestPasswordReset = useCallback(async (email: string) => {
    if (!validateEmail(email)) {
      throw new Error('有効なメールアドレスを入力してください')
    }
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('パスワードリセット要求:', {
        email,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('パスワードリセット要求エラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // パスワードリセット実行
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    if (!token.trim()) throw new Error('リセットトークンが無効です')
    
    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      throw new Error(passwordErrors[0])
    }
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('パスワードリセット完了:', {
        token: token.substring(0, 10) + '...',
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('パスワードリセットエラー:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // アクティブセッション取得
  const getActiveSessions = useCallback(async (): Promise<AuthSession[]> => {
    if (!user) throw new Error('ログインしていません')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // モックセッション一覧
      const mockSessions: AuthSession[] = [
        session!,
        {
          token: 'mock-session-2',
          refreshToken: 'mock-refresh-2',
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          device: 'iPhone - Mobile',
          ipAddress: '192.168.1.2',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ].filter(Boolean)
      
      return mockSessions
      
    } catch (error) {
      console.error('セッション取得エラー:', error)
      throw error
    }
  }, [user, session])

  // セッション無効化
  const revokeSession = useCallback(async (sessionId: string) => {
    if (!user) throw new Error('ログインしていません')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('セッション無効化:', {
        userId: user.id,
        sessionId,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('セッション無効化エラー:', error)
      throw error
    }
  }, [user])

  // ログイン試行クリア
  const clearLoginAttempts = useCallback(() => {
    setLoginAttempts([])
    setIsRateLimited(false)
    localStorage.removeItem('login-attempts')
  }, [])

  const value: AuthContextType = {
    // State
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    loginAttempts,
    isRateLimited,
    
    // Authentication methods
    login,
    signup,
    logout,
    loginWithGoogle,
    loginWithGithub,
    
    // Profile management
    updateProfile,
    changePassword,
    deleteAccount,
    
    // Two-factor authentication
    enableTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    
    // Email verification
    sendVerificationEmail,
    verifyEmail,
    
    // Password reset
    requestPasswordReset,
    resetPassword,
    
    // Session management
    refreshSession,
    getActiveSessions,
    revokeSession,
    
    // Security
    clearLoginAttempts,
    checkRateLimit
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useEnhancedAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider')
  }
  return context
}