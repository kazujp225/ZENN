import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// ブラウザ用Supabaseクライアント (認証機能付き)
export function createAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables for authentication')
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}

// サーバー用Supabaseクライアント (認証機能付き)
export function createServerAuthClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// ミドルウェア用認証チェック
export function createMiddlewareAuthClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response }
}

// 認証が必要なページの保護
export async function requireAuth() {
  const supabase = createServerAuthClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

// プロフィール情報を取得
export async function getUserProfile(userId: string) {
  const supabase = createServerAuthClient()
  
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    throw error
  }
  
  return profile
}