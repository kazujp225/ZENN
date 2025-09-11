import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/safe-client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      bookmarks: [],
      count: 0,
      message: 'Supabase is not configured.'
    })
  }
  
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const targetType = searchParams.get('target_type')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createAdminClient()
    
    let query = supabase
      .from('bookmarks')
      .select(`
        *,
        article:articles!target_id (
          id,
          title,
          emoji,
          slug,
          published_at,
          likes_count,
          user:users!user_id (
            id,
            username,
            display_name,
            avatar_url
          )
        ),
        book:books!target_id (
          id,
          title,
          emoji,
          slug,
          published_at,
          likes_count,
          user:users!user_id (
            id,
            username,
            display_name,
            avatar_url
          )
        ),
        scrap:scraps!target_id (
          id,
          title,
          emoji,
          created_at,
          likes_count,
          user:users!user_id (
            id,
            username,
            display_name,
            avatar_url
          )
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (targetType) {
      query = query.eq('target_type', targetType)
    }

    const { data, error, count } = await query

    if (error) {
      // エラーログ削除（セキュリティ対応）
      return NextResponse.json(
        { error: 'Failed to fetch bookmarks', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      bookmarks: data || [],
      count: count || 0
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured.' },
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
    const { target_id, target_type } = body

    if (!target_id || !target_type) {
      return NextResponse.json(
        { error: 'target_id and target_type are required' },
        { status: 400 }
      )
    }

    // 対象タイプの検証
    const validTypes = ['article', 'book', 'scrap']
    if (!validTypes.includes(target_type)) {
      return NextResponse.json(
        { error: 'Invalid target_type. Must be one of: article, book, scrap' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 既存のブックマークをチェック
    const { data: existingBookmark, error: checkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_id', target_id)
      .eq('target_type', target_type)
      .maybeSingle()

    if (checkError) {
      // エラーログ削除（セキュリティ対応）
      return NextResponse.json(
        { error: 'Failed to check existing bookmark' },
        { status: 500 }
      )
    }

    if (existingBookmark) {
      // 既にブックマークがある場合は削除（toggle機能）
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id)

      if (deleteError) {
        // エラーログ削除（セキュリティ対応）
        return NextResponse.json(
          { error: 'Failed to remove bookmark' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Bookmark removed',
        bookmarked: false
      })
    } else {
      // 新しいブックマークを追加
      const { data: bookmark, error: bookmarkError } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          target_id,
          target_type
        })
        .select()
        .single()

      if (bookmarkError) {
        // エラーログ削除（セキュリティ対応）
        return NextResponse.json(
          { error: 'Failed to create bookmark' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Bookmark created',
        bookmarked: true,
        data: bookmark
      })
    }
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured.' },
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

    const searchParams = request.nextUrl.searchParams
    const target_id = searchParams.get('target_id')
    const target_type = searchParams.get('target_type')

    if (!target_id || !target_type) {
      return NextResponse.json(
        { error: 'target_id and target_type are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('target_id', target_id)
      .eq('target_type', target_type)

    if (error) {
      // エラーログ削除（セキュリティ対応）
      return NextResponse.json(
        { error: 'Failed to delete bookmark' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Bookmark deleted',
      bookmarked: false
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}