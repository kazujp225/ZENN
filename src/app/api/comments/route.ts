import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/safe-client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Supabaseが設定されていない場合はモックデータを返す
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      data: [],
      count: 0,
      message: 'Supabase is not configured. Please set up environment variables.'
    })
  }
  
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
    
    const { data, error, count } = await supabase
      .from('article_comments')
      .select(`
        *,
        author:users!author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('article_id', article_id)
      .is('parent_id', null) // 親コメントのみ取得
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
      count: count || 0
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Supabaseが設定されていない場合はエラーを返す
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Please set up environment variables.' },
      { status: 503 }
    )
  }
  
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { article_id, content, parent_id } = body

    if (!article_id || !content) {
      return NextResponse.json(
        { error: 'article_id and content are required' },
        { status: 400 }
      )
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content cannot be empty' },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Content is too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 記事の存在確認
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id')
      .eq('id', article_id)
      .single()

    if (articleError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // 親コメントの存在確認（指定されている場合）
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('article_comments')
        .select('id')
        .eq('id', parent_id)
        .eq('article_id', article_id)
        .single()

      if (parentError || !parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
    }

    // コメントを作成
    const { data: comment, error: commentError } = await supabase
      .from('article_comments')
      .insert({
        article_id,
        author_id: user.id,
        content: content.trim(),
        parent_id: parent_id || null
      })
      .select(`
        *,
        author:users!author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (commentError) {
      // エラーログ削除（セキュリティ対応）
      return NextResponse.json(
        { error: 'Failed to create comment', details: commentError.message },
        { status: 500 }
      )
    }

    // 記事のコメント数を更新
    const { error: updateError } = await supabase
      .from('articles')
      .update({ 
        comments_count: supabase.rpc('increment', { 
          table: 'articles', 
          id: article_id, 
          field: 'comments_count' 
        }) 
      })
      .eq('id', article_id)

    if (updateError) {
      // エラーログ削除（セキュリティ対応）
      // エラーでもコメント作成は成功しているので続行
    }

    return NextResponse.json({
      message: 'Comment created successfully',
      data: comment
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}