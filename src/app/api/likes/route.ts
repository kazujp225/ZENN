import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/safe-client'

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
    const { target_id, target_type } = body

    if (!target_id || !target_type) {
      return NextResponse.json(
        { error: 'target_id and target_type are required' },
        { status: 400 }
      )
    }

    // 対象タイプの検証
    const validTypes = ['article', 'book', 'comment', 'scrap']
    if (!validTypes.includes(target_type)) {
      return NextResponse.json(
        { error: 'Invalid target_type. Must be one of: article, book, comment, scrap' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 既存のいいねをチェック
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_id', target_id)
      .eq('target_type', target_type)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing like:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing like' },
        { status: 500 }
      )
    }

    if (existingLike) {
      // 既にいいねがある場合は削除（toggle機能）
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id)

      if (deleteError) {
        console.error('Error removing like:', deleteError)
        return NextResponse.json(
          { error: 'Failed to remove like' },
          { status: 500 }
        )
      }

      // いいね数を減らす
      await updateLikeCount(supabase, target_type, target_id, -1)

      return NextResponse.json({
        message: 'Like removed',
        liked: false
      })
    } else {
      // 新しいいいねを追加
      const { data: like, error: likeError } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          target_id,
          target_type
        })
        .select()
        .single()

      if (likeError) {
        console.error('Error creating like:', likeError)
        return NextResponse.json(
          { error: 'Failed to create like' },
          { status: 500 }
        )
      }

      // いいね数を増やす
      await updateLikeCount(supabase, target_type, target_id, 1)

      return NextResponse.json({
        message: 'Like created',
        liked: true,
        data: like
      })
    }
  } catch (error) {
    console.error('Error processing like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// いいね数を更新する関数
async function updateLikeCount(supabase: any, targetType: string, targetId: string, increment: number) {
  const tableName = targetType === 'article' ? 'articles' : 
                   targetType === 'book' ? 'books' :
                   targetType === 'scrap' ? 'scraps' :
                   'article_comments' // comment の場合

  try {
    const { error } = await supabase.rpc('increment_likes_count', {
      table_name: tableName,
      row_id: targetId,
      increment_by: increment
    })

    if (error) {
      console.error(`Error updating ${targetType} likes count:`, error)
    }
  } catch (error) {
    console.error(`Error calling increment function for ${targetType}:`, error)
  }
}

export async function GET(request: NextRequest) {
  // Supabaseが設定されていない場合はエラーを返す
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Please set up environment variables.' },
      { status: 503 }
    )
  }
  
  try {
    const user = await getCurrentUser(request)
    const { searchParams } = new URL(request.url)
    const target_id = searchParams.get('target_id')
    const target_type = searchParams.get('target_type')

    if (!target_id || !target_type) {
      return NextResponse.json(
        { error: 'target_id and target_type are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // いいねを取得
    const { data: likes, error } = await supabase
      .from('likes')
      .select('*')
      .eq('target_id', target_id)
      .eq('target_type', target_type)

    if (error) {
      console.error('Error fetching likes:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch likes', 
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      )
    }

    // ユーザーがログインしている場合、そのユーザーがいいねしているかチェック
    let isLikedByUser = false
    if (user) {
      isLikedByUser = likes.some(like => like.user_id === user.id)
    }

    return NextResponse.json({
      count: likes.length,
      liked: isLikedByUser,
      likes: likes
    })
  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}