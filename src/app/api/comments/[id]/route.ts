import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/safe-client'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Please set up environment variables.' },
      { status: 503 }
    )
  }

  try {
    const { id } = await context.params
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
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

    // コメントの所有者確認
    const { data: existingComment, error: fetchError } = await supabase
      .from('article_comments')
      .select('author_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (existingComment.author_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to edit this comment' },
        { status: 403 }
      )
    }

    // コメントを更新
    const { data: updatedComment, error: updateError } = await supabase
      .from('article_comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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

    if (updateError) {
      console.error('Error updating comment:', updateError)
      return NextResponse.json(
        { error: 'Failed to update comment', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Comment updated successfully',
      data: updatedComment
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Please set up environment variables.' },
      { status: 503 }
    )
  }

  try {
    const { id } = await context.params
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // コメントの所有者確認
    const { data: existingComment, error: fetchError } = await supabase
      .from('article_comments')
      .select('author_id, article_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (existingComment.author_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this comment' },
        { status: 403 }
      )
    }

    // コメントを削除（子コメントも連鎖削除される前提）
    const { error: deleteError } = await supabase
      .from('article_comments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting comment:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete comment', details: deleteError.message },
        { status: 500 }
      )
    }

    // 記事のコメント数を更新
    const { error: updateError } = await supabase
      .from('articles')
      .update({ 
        comments_count: supabase.rpc('decrement', { 
          table: 'articles', 
          id: existingComment.article_id, 
          field: 'comments_count' 
        }) 
      })
      .eq('id', existingComment.article_id)

    if (updateError) {
      console.error('Error updating comment count:', updateError)
      // エラーでもコメント削除は成功しているので続行
    }

    return NextResponse.json({
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}