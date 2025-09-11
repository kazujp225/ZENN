import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareAuthClient } from '@/lib/supabase/auth'

export async function authMiddleware(request: NextRequest) {
  try {
    const { supabase, response } = createMiddlewareAuthClient(request)

    // セッションを更新
    const { data: { user } } = await supabase.auth.getUser()

    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
    const isProtectedPage = [
      '/dashboard',
      '/settings',
      '/new',
      '/edit'
    ].some(path => request.nextUrl.pathname.startsWith(path))

    // 認証が必要なページで未ログインの場合
    if (isProtectedPage && !user) {
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 認証ページでログイン済みの場合
    if (isAuthPage && user) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    return response
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.next()
  }
}

// API認証ミドルウェア
export async function requireAPIAuth(request: NextRequest) {
  try {
    const { supabase } = createMiddlewareAuthClient(request)
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return { user, supabase }
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}