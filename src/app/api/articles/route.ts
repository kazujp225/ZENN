import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { createServerAuthClient } from '@/lib/supabase/auth'
import { isSupabaseConfigured } from '@/lib/supabase/safe-client'

// ヘルパー関数：現在のユーザーを取得
async function getCurrentUser(request: NextRequest) {
  try {
    const supabase = createServerAuthClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Auth error:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// ヘルパー関数：管理者クライアントを作成
function createAdminClient() {
  return createClient()
}

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

    const supabase = createClient()

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

export async function PUT(request: NextRequest) {
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
    const { id, title, content, slug, emoji, topics, published, type } = body

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: 'ID, title and content are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 記事の存在確認と所有者チェック
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('id, user_id, slug')
      .eq('id', id)
      .single()

    if (fetchError || !existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // 所有者チェック
    if (existingArticle.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own articles' },
        { status: 403 }
      )
    }

    // スラグの処理
    let finalSlug = slug
    if (!finalSlug || finalSlug !== existingArticle.slug) {
      finalSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      
      // スラグの重複チェック
      const timestamp = Date.now()
      finalSlug = `${finalSlug}-${timestamp}`
    }

    // 記事を更新
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update({
        title,
        content,
        slug: finalSlug,
        emoji: emoji || '📝',
        type: type || 'tech',
        published: published || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // 二重チェック
      .select()
      .single()

    if (updateError) {
      console.error('Error updating article:', updateError)
      return NextResponse.json(
        { error: `Failed to update article: ${updateError.message}` },
        { status: 500 }
      )
    }

    // トピックの更新（既存のトピック関連を削除して再追加）
    if (topics && Array.isArray(topics)) {
      // 既存のトピック関連を削除
      await supabase
        .from('article_topics')
        .delete()
        .eq('article_id', id)

      // 新しいトピック関連を追加
      if (topics.length > 0) {
        const topicRelations = topics.map((topicId: string) => ({
          article_id: id,
          topic_id: topicId
        }))

        const { error: topicsError } = await supabase
          .from('article_topics')
          .insert(topicRelations)

        if (topicsError) {
          console.error('Error updating topics:', topicsError)
        }
      }
    }

    return NextResponse.json({ 
      message: 'Article updated successfully',
      data: updatedArticle 
    })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 記事の存在確認と所有者チェック
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, user_id, title')
      .eq('id', id)
      .single()

    if (fetchError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // 所有者チェック
    if (article.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own articles' },
        { status: 403 }
      )
    }

    // 記事を削除（関連データは ON DELETE CASCADE で自動削除）
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // 二重チェック

    if (deleteError) {
      console.error('Error deleting article:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete article: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Article deleted successfully',
      deleted_article: {
        id: article.id,
        title: article.title
      }
    })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}