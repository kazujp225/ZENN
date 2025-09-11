import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/middleware/auth'

export async function middleware(request: NextRequest) {
  // 認証ミドルウェアを適用
  const authResponse = await authMiddleware(request)
  
  // 他のミドルウェア処理があればここに追加
  
  return authResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}