import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/safe-client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      drafts: [],
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
    const type = searchParams.get('type') || 'article'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createAdminClient()
    
    const { data, error, count } = await supabase
      .from('drafts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('type', type)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching drafts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch drafts', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      drafts: data || [],
      count: count || 0
    })
  } catch (error) {
    console.error('Error fetching drafts:', error)
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
    const { 
      title, 
      content, 
      emoji, 
      type = 'article',
      topics,
      metadata
    } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 下書きを作成
    const { data: draft, error: draftError } = await supabase
      .from('drafts')
      .insert({
        user_id: user.id,
        title,
        content,
        emoji: emoji || '📝',
        type,
        topics: topics || [],
        metadata: metadata || {},
        version: 1
      })
      .select()
      .single()

    if (draftError) {
      console.error('Error creating draft:', draftError)
      return NextResponse.json(
        { error: 'Failed to create draft' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Draft created successfully',
      draft
    })
  } catch (error) {
    console.error('Error creating draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}