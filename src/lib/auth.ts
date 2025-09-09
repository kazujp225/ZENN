import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 現在のユーザーを取得するヘルパー関数
export async function getCurrentUser(request?: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component
            }
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return null
    }

    // ユーザー情報を取得
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error || !userData) {
      return null
    }

    return {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      display_name: userData.display_name,
      avatar_url: userData.avatar_url
    }
    
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// 認証が必要なAPIエンドポイント用のミドルウェア
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return {
      authenticated: false,
      response: new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
  
  return {
    authenticated: true,
    user
  }
}