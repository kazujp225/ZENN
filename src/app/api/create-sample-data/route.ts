import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
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
        console.error('Error creating book:', error)
      } else {
        createdBooks.push(data)
      }
    }

    // Create sample scraps
    const scraps = [
      {
        title: 'React Hooks使用時のパフォーマンス最適化について',
        emoji: '⚡',
        slug: `react-hooks-performance-${Date.now()}`,
        user_id: authorId,
        closed: false,
        comments_count: 12
      },
      {
        title: 'PostgreSQLのクエリ最適化テクニック',
        emoji: '🐘',
        slug: `postgresql-optimization-${Date.now()}`,
        user_id: authorId,
        closed: false,
        comments_count: 8
      },
      {
        title: 'Docker Composeでの開発環境構築',
        emoji: '🐳',
        slug: `docker-compose-dev-${Date.now()}`,
        user_id: authorId,
        closed: true,
        comments_count: 15
      }
    ]

    const createdScraps = []
    for (const scrap of scraps) {
      const { data, error } = await supabase
        .from('scraps')
        .insert(scrap)
        .select()
        .single()

      if (error) {
        console.error('Error creating scrap:', error)
      } else {
        createdScraps.push(data)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      created: {
        books: createdBooks.length,
        scraps: createdScraps.length
      },
      data: {
        books: createdBooks,
        scraps: createdScraps
      }
    })

  } catch (error) {
    console.error('Error creating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    )
  }
}