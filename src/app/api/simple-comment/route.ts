import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { article_id, content } = body

    if (!article_id || !content) {
      return NextResponse.json(
        { error: 'article_id and content are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // シンプルなコメント作成（JOINなし）
    const { data: comment, error: commentError } = await supabase
      .from('article_comments')
      .insert({
        article_id,
        author_id: user.id,
        content: content.trim()
      })
      .select('*')
      .single()

    if (commentError) {
      // エラーログ削除（セキュリティ対応）
      return NextResponse.json(
        { error: 'Failed to create comment', details: commentError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Comment created successfully',
      data: comment,
      user_info: {
        id: user.id,
        username: user.username,
        display_name: user.display_name
      }
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const article_id = searchParams.get('article_id')
    
    if (!article_id) {
      return NextResponse.json(
        { error: 'article_id is required' },
        { status: 400 }
      )
    }
    
    const supabase = createAdminClient()
    
    // シンプルなコメント取得（JOINなし）
    const { data, error } = await supabase
      .from('article_comments')
      .select('*')
      .eq('article_id', article_id)
      .order('created_at', { ascending: true })

    if (error) {
      // エラーログ削除（セキュリティ対応）
      return NextResponse.json(
        { error: 'Failed to fetch comments', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}