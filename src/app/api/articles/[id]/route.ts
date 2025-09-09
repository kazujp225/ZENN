import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/safe-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:users!user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error

    // Note: View count increment removed as it's not in the current schema

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Article not found' },
      { status: 404 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()
    
    // Check if user owns the article
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (!existingArticle || existingArticle.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, slug, emoji, published, topics } = body

    // Update article
    const { data, error } = await supabase
      .from('articles')
      .update({
        title,
        content,
        slug,
        emoji,
        published,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Update topics if provided
    if (topics !== undefined) {
      // Remove existing topics
      await supabase
        .from('article_topics')
        .delete()
        .eq('article_id', params.id)

      // Add new topics
      if (topics.length > 0) {
        const topicRelations = topics.map((topicId: string) => ({
          article_id: params.id,
          topic_id: topicId
        }))

        await supabase
          .from('article_topics')
          .insert(topicRelations)
      }
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()
    
    // Check if user owns the article
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (!existingArticle || existingArticle.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete article (cascade will handle related records)
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}