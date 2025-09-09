import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/safe-client'

export async function GET(request: NextRequest) {
  // Supabaseが設定されていない場合はモックデータを返す
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      data: null,
      message: 'Supabase is not configured. Please set up environment variables.'
    })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const username = searchParams.get('username')
    
    if (!user_id && !username) {
      return NextResponse.json(
        { error: 'user_id or username is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    
    let query = supabase
      .from('users')
      .select(`
        id,
        username,
        display_name,
        email,
        bio,
        avatar_url,
        website_url,
        twitter_username,
        github_username,
        created_at,
        updated_at
      `)
    
    if (user_id) {
      query = query.eq('id', user_id)
    } else {
      query = query.eq('username', username)
    }
    
    const { data: user, error } = await query.single()

    if (error) {
      console.error('Error fetching user profile:', error)
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    // 統計情報を取得（記事数、フォロワー数、フォロー数）
    const stats = await Promise.all([
      // 記事数
      supabase
        .from('articles')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('published', true),
      
      // フォロワー数
      supabase
        .from('follows')
        .select('follower_id', { count: 'exact' })
        .eq('following_id', user.id),
      
      // フォロー数  
      supabase
        .from('follows')
        .select('following_id', { count: 'exact' })
        .eq('follower_id', user.id)
    ])

    const [articlesResult, followersResult, followingResult] = stats

    const profile = {
      ...user,
      stats: {
        articles_count: articlesResult.count || 0,
        followers_count: followersResult.count || 0,
        following_count: followingResult.count || 0
      }
    }

    return NextResponse.json({
      data: profile
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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
    const { 
      display_name, 
      bio, 
      website_url, 
      twitter_username, 
      github_username,
      avatar_url 
    } = body

    // バリデーション
    const updates: any = {}
    
    if (display_name !== undefined) {
      if (typeof display_name !== 'string' || display_name.length > 50) {
        return NextResponse.json(
          { error: 'Display name must be a string with maximum 50 characters' },
          { status: 400 }
        )
      }
      updates.display_name = display_name.trim() || null
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 500) {
        return NextResponse.json(
          { error: 'Bio must be a string with maximum 500 characters' },
          { status: 400 }
        )
      }
      updates.bio = bio.trim() || null
    }

    if (website_url !== undefined) {
      if (website_url && (typeof website_url !== 'string' || website_url.length > 200)) {
        return NextResponse.json(
          { error: 'Website URL must be a string with maximum 200 characters' },
          { status: 400 }
        )
      }
      updates.website_url = website_url?.trim() || null
    }

    if (twitter_username !== undefined) {
      if (twitter_username && (typeof twitter_username !== 'string' || twitter_username.length > 50)) {
        return NextResponse.json(
          { error: 'Twitter username must be a string with maximum 50 characters' },
          { status: 400 }
        )
      }
      updates.twitter_username = twitter_username?.trim() || null
    }

    if (github_username !== undefined) {
      if (github_username && (typeof github_username !== 'string' || github_username.length > 50)) {
        return NextResponse.json(
          { error: 'GitHub username must be a string with maximum 50 characters' },
          { status: 400 }
        )
      }
      updates.github_username = github_username?.trim() || null
    }

    if (avatar_url !== undefined) {
      if (avatar_url && (typeof avatar_url !== 'string' || avatar_url.length > 500)) {
        return NextResponse.json(
          { error: 'Avatar URL must be a string with maximum 500 characters' },
          { status: 400 }
        )
      }
      updates.avatar_url = avatar_url?.trim() || null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    updates.updated_at = new Date().toISOString()

    const supabase = createAdminClient()

    // プロフィールを更新
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select(`
        id,
        username,
        display_name,
        email,
        bio,
        avatar_url,
        website_url,
        twitter_username,
        github_username,
        created_at,
        updated_at
      `)
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      data: updatedUser
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}