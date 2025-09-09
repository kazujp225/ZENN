import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// 現在のユーザーを取得するヘルパー関数
export async function getCurrentUser(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return null
    }
    
    // セッションを取得
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isActive: true
          }
        }
      }
    })
    
    // セッションが存在しない、または期限切れ
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        // 期限切れセッションを削除
        await prisma.session.delete({
          where: { id: session.id }
        })
      }
      return null
    }
    
    // アカウントが無効
    if (!session.user.isActive) {
      return null
    }
    
    // 最終アクセス時刻を更新
    await prisma.session.update({
      where: { id: session.id },
      data: { lastAccessedAt: new Date() }
    })
    
    return session.user
    
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