import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/safe-client'

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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('articles')
      .select(`
        *,
        author:users!user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      data,
      count,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
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
    const { title, content, slug, emoji, topics, published, type } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Generate slug if not provided
    let finalSlug = slug
    if (!finalSlug) {
      finalSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      
      // Make slug unique
      const timestamp = Date.now()
      finalSlug = `${finalSlug}-${timestamp}`
    }

    // Create article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        title,
        content,
        slug: finalSlug,
        emoji: emoji || '📝',
        type: type || 'tech',
        user_id: user.id,
        published: published || false,
        likes_count: 0,
        comments_count: 0
      })
      .select()
      .single()

    if (articleError) {
      console.error('Error creating article:', articleError)
      return NextResponse.json(
        { error: `Failed to create article: ${articleError.message}`, details: articleError },
        { status: 500 }
      )
    }

    // Add topics if provided
    if (topics && topics.length > 0 && article) {
      const topicRelations = topics.map((topicId: string) => ({
        article_id: article.id,
        topic_id: topicId
      }))

      const { error: topicsError } = await supabase
        .from('article_topics')
        .insert(topicRelations)

      if (topicsError) {
        console.error('Error adding topics:', topicsError)
      }
    }

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}