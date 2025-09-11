'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient()
        
        // URLからセッション情報を取得
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          // 認証エラー
          router.push('/login?error=oauth_error')
          return
        }

        if (data.session) {
          // 認証成功 - ユーザー情報をSupabaseと同期
          const { user } = data.session
          
          // ユーザー情報をローカルデータベースに保存/更新
          const response = await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              username: user.user_metadata?.preferred_username || 
                       user.user_metadata?.user_name || 
                       user.email?.split('@')[0],
              display_name: user.user_metadata?.full_name || 
                           user.user_metadata?.name || 
                           user.email?.split('@')[0],
              avatar_url: user.user_metadata?.avatar_url || 
                         user.user_metadata?.picture,
              provider: user.app_metadata?.provider,
            }),
          })

          if (response.ok) {
            // リダイレクト先を取得（デフォルトはダッシュボード）
            const searchParams = new URLSearchParams(window.location.search)
            const redirectTo = searchParams.get('redirectTo') || '/dashboard'
            router.push(redirectTo)
          } else {
            // 同期失敗
            router.push('/login?error=sync_error')
          }
        } else {
          // セッションなし
          router.push('/login?error=no_session')
        }
      } catch (error) {
        // 予期しないエラー
        router.push('/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">認証処理中...</p>
      </div>
    </div>
  )
}