import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/safe-client'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured.' },
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
    
    const { data: draft, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    // バージョン履歴を取得
    const { data: versions } = await supabase
      .from('draft_versions')
      .select('*')
      .eq('draft_id', id)
      .order('version', { ascending: false })
      .limit(10)

    return NextResponse.json({
      draft,
      versions: versions || []
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured.' },
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
    const { 
      title, 
      content, 
      emoji, 
      topics,
      metadata,
      auto_save = false
    } = body

    const supabase = createAdminClient()

    // 既存の下書きを確認
    const { data: existingDraft, error: fetchError } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingDraft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    // バージョン管理（自動保存でない場合）
    if (!auto_save) {
      await supabase
        .from('draft_versions')
        .insert({
          draft_id: id,
          version: existingDraft.version,
          title: existingDraft.title,
          content: existingDraft.content,
          emoji: existingDraft.emoji,
          topics: existingDraft.topics,
          metadata: existingDraft.metadata
        })
    }

    // 下書きを更新
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (emoji !== undefined) updateData.emoji = emoji
    if (topics !== undefined) updateData.topics = topics
    if (metadata !== undefined) updateData.metadata = metadata
    if (!auto_save) updateData.version = existingDraft.version + 1

    const { data: updatedDraft, error: updateError } = await supabase
      .from('drafts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      // エラーログ削除（セキュリティ対応）
      return NextResponse.json(
        { error: 'Failed to update draft' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: auto_save ? 'Draft auto-saved' : 'Draft updated successfully',
      draft: updatedDraft
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
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
      { error: 'Supabase is not configured.' },
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

    // 下書きの所有者確認
    const { data: draft, error: fetchError } = await supabase
      .from('drafts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !draft || draft.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Draft not found or unauthorized' },
        { status: 404 }
      )
    }

    // バージョン履歴も削除
    await supabase
      .from('draft_versions')
      .delete()
      .eq('draft_id', id)

    // 下書きを削除
    const { error: deleteError } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id)

    if (deleteError) {
      // エラーログ削除（セキュリティ対応）
      return NextResponse.json(
        { error: 'Failed to delete draft' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Draft deleted successfully'
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}