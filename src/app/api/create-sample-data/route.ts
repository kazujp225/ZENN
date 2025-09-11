import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  // 🚨 SECURITY: This endpoint has been disabled for production security
  return NextResponse.json({
    error: 'Endpoint disabled for security reasons',
    message: 'Sample data creation endpoints are not available in production'
  }, { status: 403 })
  
  /*
  try {
    const supabase = createAdminClient()

    // Get a user ID to use as author
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 400 }
      )
    }

    const authorId = users[0].id

    // Create sample books
    const books = [
      {
        title: 'Next.js 14完全ガイド',
        description: 'Next.js 14の新機能からApp Routerまで、実践的な開発手法を詳しく解説します。',
        slug: `nextjs14-guide-${Date.now()}`,
        user_id: authorId,
        price: 1500,
        is_free: false,
        published: true,
        likes_count: 23
      },
      {
        title: 'TypeScriptで学ぶ設計パターン',
        description: 'デザインパターンをTypeScriptで実装しながら学ぶ実践的な書籍です。',
        slug: `typescript-patterns-${Date.now()}`,
        user_id: authorId,
        price: 0,
        is_free: true,
        published: true,
        likes_count: 45
      }
    ]

    const createdBooks = []
    for (const book of books) {
      const { data, error } = await supabase
        .from('books')
        .insert(book)
        .select()
        .single()

      if (error) {
        // エラーログ削除（セキュリティ対応）
      } else {
        createdBooks.push(data)
      }
    }

    // Scraps creation disabled - no mock data
    const createdScraps = []

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      created: {
        books: createdBooks.length,
        scraps: 0
      },
      data: {
        books: createdBooks,
        scraps: []
      }
    })

  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    )
  }
  */
}