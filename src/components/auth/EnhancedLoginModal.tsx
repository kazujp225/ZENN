'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth'
import clsx from 'clsx'

interface EnhancedLoginModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup' | 'reset'
}

type AuthMode = 'login' | 'signup' | 'reset' | 'verify-email' | 'two-factor'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  username: string
  rememberMe: boolean
  twoFactorCode: string
  resetToken: string
}

const initialFormData: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  username: '',
  rememberMe: false,
  twoFactorCode: '',
  resetToken: ''
}

export function EnhancedLoginModal({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}: EnhancedLoginModalProps) {
  const {
    login,
    signup,
    loginWithGoogle,
    loginWithGithub,
    requestPasswordReset,
    resetPassword,
    sendVerificationEmail,
    verifyEmail,
    verifyTwoFactor,
    isLoading,
    isRateLimited,
    loginAttempts,
    checkRateLimit,
    clearLoginAttempts
  } = useEnhancedAuth()

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [verificationEmailSent, setVerificationEmailSent] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  // パスワード強度計算
  const calculatePasswordStrength = useCallback((password: string): number => {
    let score = 0
    if (password.length >= 8) score += 1
    if (password.match(/[a-z]/)) score += 1
    if (password.match(/[A-Z]/)) score += 1
    if (password.match(/\d/)) score += 1
    if (password.match(/[^a-zA-Z\d]/)) score += 1
    return score
  }, [])

  // パスワード強度の更新
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password))
    } else {
      setPasswordStrength(0)
    }
  }, [formData.password, calculatePasswordStrength])

  // フォームリセット
  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
    setAgreedToTerms(false)
    setVerificationEmailSent(false)
    setResetEmailSent(false)
  }, [])

  // モーダルを閉じる
  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  // フォーム入力の処理
  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  // バリデーション
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (mode === 'login' || mode === 'signup' || mode === 'reset') {
      if (!formData.email.trim()) {
        newErrors.email = 'メールアドレスを入力してください'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = '有効なメールアドレスを入力してください'
      }
    }

    if (mode === 'login' || mode === 'signup') {
      if (!formData.password.trim()) {
        newErrors.password = 'パスワードを入力してください'
      } else if (mode === 'signup') {
        if (formData.password.length < 8) {
          newErrors.password = 'パスワードは8文字以上で入力してください'
        } else if (passwordStrength < 3) {
          newErrors.password = 'より強力なパスワードを設定してください'
        }
      }
    }

    if (mode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = '名前を入力してください'
      } else if (formData.name.length > 50) {
        newErrors.name = '名前は50文字以内で入力してください'
      }

      if (formData.username && formData.username.length > 0) {
        if (formData.username.length < 3) {
          newErrors.username = 'ユーザー名は3文字以上で入力してください'
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
          newErrors.username = '英数字とアンダースコアのみ使用できます'
        }
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'パスワードが一致しません'
      }

      if (!agreedToTerms) {
        newErrors.terms = '利用規約とプライバシーポリシーに同意してください'
      }
    }

    if (mode === 'two-factor') {
      if (!formData.twoFactorCode.trim()) {
        newErrors.twoFactorCode = '認証コードを入力してください'
      } else if (!/^\d{6}$/.test(formData.twoFactorCode)) {
        newErrors.twoFactorCode = '6桁の数字を入力してください'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [mode, formData, passwordStrength, agreedToTerms])

  // フォーム送信
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      switch (mode) {
        case 'login':
          if (checkRateLimit(formData.email)) {
            setErrors({ email: 'ログイン試行回数が上限に達しました。しばらくお待ちください' })
            return
          }
          await login({ email: formData.email, password: formData.password }, formData.rememberMe)
          handleClose()
          break

        case 'signup':
          await signup(
            formData.email, 
            formData.password, 
            formData.name, 
            formData.username || undefined
          )
          setMode('verify-email')
          break

        case 'reset':
          await requestPasswordReset(formData.email)
          setResetEmailSent(true)
          break

        case 'verify-email':
          await sendVerificationEmail()
          setVerificationEmailSent(true)
          break

        case 'two-factor':
          await verifyTwoFactor(formData.twoFactorCode)
          handleClose()
          break
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message })
      }
    }
  }, [
    validateForm, 
    mode, 
    formData, 
    login, 
    signup, 
    requestPasswordReset, 
    sendVerificationEmail, 
    verifyTwoFactor, 
    checkRateLimit,
    handleClose
  ])

  // ソーシャルログイン
  const handleSocialLogin = useCallback(async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') {
        await loginWithGoogle()
      } else {
        await loginWithGithub()
      }
      handleClose()
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message })
      }
    }
  }, [loginWithGoogle, loginWithGithub, handleClose])

  // パスワード強度表示
  const getPasswordStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0: case 1: return 'bg-red-500'
      case 2: return 'bg-orange-500'
      case 3: return 'bg-yellow-500'
      case 4: return 'bg-green-500'
      case 5: return 'bg-emerald-500'
      default: return 'bg-gray-300'
    }
  }

  const getPasswordStrengthText = (strength: number): string => {
    switch (strength) {
      case 0: return ''
      case 1: return '弱い'
      case 2: return 'やや弱い'
      case 3: return '普通'
      case 4: return '強い'
      case 5: return 'とても強い'
      default: return ''
    }
  }

  // レート制限情報の表示
  const getRateLimitInfo = (): string | null => {
    if (!isRateLimited) return null
    
    const recentAttempts = loginAttempts.filter(attempt => 
      attempt.email === formData.email && 
      Date.now() - new Date(attempt.timestamp).getTime() < 15 * 60 * 1000
    )
    
    const remainingTime = Math.ceil((15 * 60 * 1000 - (Date.now() - new Date(recentAttempts[0]?.timestamp || 0).getTime())) / 60000)
    return `あと${remainingTime}分後に再試行できます`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' && 'ログイン'}
              {mode === 'signup' && 'アカウント作成'}
              {mode === 'reset' && 'パスワードリセット'}
              {mode === 'verify-email' && 'メール確認'}
              {mode === 'two-factor' && '二要素認証'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {/* レート制限警告 */}
          {isRateLimited && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-700 font-medium">ログイン試行回数上限</p>
                  <p className="text-red-600 text-sm">{getRateLimitInfo()}</p>
                  <button
                    onClick={clearLoginAttempts}
                    className="text-red-600 text-sm underline mt-1"
                  >
                    リセット（管理者のみ）
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* エラー表示 */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* メール確認完了メッセージ */}
          {mode === 'verify-email' && verificationEmailSent && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-green-700 font-medium">確認メールを送信しました</p>
                  <p className="text-green-600 text-sm">
                    メールボックスを確認し、リンクをクリックしてください
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* パスワードリセットメール送信完了 */}
          {mode === 'reset' && resetEmailSent && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-green-700 font-medium">リセットメールを送信しました</p>
                  <p className="text-green-600 text-sm">
                    メールの指示に従ってパスワードをリセットしてください
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* メールアドレス */}
            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                    errors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  )}
                  placeholder="例: example@example.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            )}

            {/* 名前（サインアップ時のみ） */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                    errors.name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  )}
                  placeholder="例: 田中太郎"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* ユーザー名（サインアップ時のみ、オプション） */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ユーザー名（任意）
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                    errors.username
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  )}
                  placeholder="例: tanaka_taro"
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  未入力の場合は自動生成されます
                </p>
              </div>
            )}

            {/* パスワード */}
            {(mode === 'login' || mode === 'signup') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={clsx(
                      'w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2',
                      errors.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    )}
                    placeholder="パスワードを入力"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                
                {/* パスワード強度（サインアップ時のみ） */}
                {mode === 'signup' && formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div
                          className={clsx(
                            'h-1 rounded-full transition-all',
                            getPasswordStrengthColor(passwordStrength)
                          )}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className={clsx(
                        formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'
                      )}>
                        ✓ 8文字以上
                      </li>
                      <li className={clsx(
                        /[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                      )}>
                        ✓ 大文字を含む
                      </li>
                      <li className={clsx(
                        /\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                      )}>
                        ✓ 数字を含む
                      </li>
                      <li className={clsx(
                        /[^a-zA-Z\d]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                      )}>
                        ✓ 特殊文字を含む
                      </li>
                    </ul>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {/* パスワード確認（サインアップ時のみ） */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード確認
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={clsx(
                      'w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2',
                      errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    )}
                    placeholder="パスワードを再入力"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* 2FAコード */}
            {mode === 'two-factor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  認証コード
                </label>
                <input
                  type="text"
                  value={formData.twoFactorCode}
                  onChange={(e) => handleInputChange('twoFactorCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-center text-2xl tracking-widest',
                    errors.twoFactorCode
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  )}
                  placeholder="123456"
                  maxLength={6}
                  disabled={isLoading}
                />
                {errors.twoFactorCode && (
                  <p className="text-red-600 text-sm mt-1">{errors.twoFactorCode}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  認証アプリから6桁のコードを入力してください
                </p>
              </div>
            )}

            {/* ログイン時のオプション */}
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    className="mr-2 rounded"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-600">ログイン状態を保持</span>
                </label>
                
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  disabled={isLoading}
                >
                  パスワードを忘れた場合
                </button>
              </div>
            )}

            {/* 利用規約同意（サインアップ時のみ） */}
            {mode === 'signup' && (
              <div>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-600">
                    <a href="/terms" target="_blank" className="text-blue-600 hover:underline">利用規約</a>
                    および
                    <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">プライバシーポリシー</a>
                    に同意します
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-600 text-sm mt-1">{errors.terms}</p>
                )}
              </div>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isLoading || isRateLimited}
              className={clsx(
                'w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
                isLoading || isRateLimited
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  処理中...
                </span>
              ) : (
                <>
                  {mode === 'login' && 'ログイン'}
                  {mode === 'signup' && 'アカウント作成'}
                  {mode === 'reset' && 'リセットメール送信'}
                  {mode === 'verify-email' && '確認メール送信'}
                  {mode === 'two-factor' && '認証'}
                </>
              )}
            </button>
          </form>

          {/* ソーシャルログイン */}
          {(mode === 'login' || mode === 'signup') && !isLoading && (
            <>
              <div className="mt-6 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">または</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img src="/images/google-icon.svg" alt="Google" className="w-5 h-5" />
                  <span>Googleで{mode === 'login' ? 'ログイン' : 'アカウント作成'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img src="/images/github-icon.svg" alt="GitHub" className="w-5 h-5" />
                  <span>GitHubで{mode === 'login' ? 'ログイン' : 'アカウント作成'}</span>
                </button>
              </div>
            </>
          )}

          {/* モード切り替え */}
          {!isLoading && mode !== 'verify-email' && mode !== 'two-factor' && (
            <div className="mt-6 text-center">
              {mode === 'login' && (
                <p className="text-sm text-gray-600">
                  アカウントをお持ちでない方は
                  <button
                    onClick={() => setMode('signup')}
                    className="ml-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    新規登録
                  </button>
                </p>
              )}
              
              {mode === 'signup' && (
                <p className="text-sm text-gray-600">
                  既にアカウントをお持ちの方は
                  <button
                    onClick={() => setMode('login')}
                    className="ml-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    ログイン
                  </button>
                </p>
              )}
              
              {mode === 'reset' && (
                <p className="text-sm text-gray-600">
                  <button
                    onClick={() => setMode('login')}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    ログインに戻る
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}