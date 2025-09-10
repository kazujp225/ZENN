import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/safe-client'

export const dynamic = 'force-dynamic'

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
    const { following_id, action } = body

    if (!following_id) {
      return NextResponse.json(
        { error: 'following_id is required' },
        { status: 400 }
      )
    }

    if (!action || !['follow', 'unfollow'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be either "follow" or "unfollow"' },
        { status: 400 }
      )
    }

    // 自分自身をフォローすることはできない
    if (user.id === following_id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // フォロー対象のユーザーが存在するかチェック
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', following_id)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (action === 'follow') {
      // フォローする
      const { data: existingFollow, error: checkError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', following_id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing follow:', checkError)
        return NextResponse.json(
          { error: 'Failed to check existing follow' },
          { status: 500 }
        )
      }

      if (existingFollow) {
        return NextResponse.json(
          { error: 'Already following this user' },
          { status: 400 }
        )
      }

      // 新しいフォロー関係を作成
      const { data: follow, error: followError } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: following_id
        })
        .select('*')
        .single()

      if (followError) {
        console.error('Error creating follow:', followError)
        return NextResponse.json(
          { error: 'Failed to follow user' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Successfully followed user',
        data: follow,
        following: true,
        target_user: targetUser
      })
    } else {
      // アンフォローする
      const { error: unfollowError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', following_id)

      if (unfollowError) {
        console.error('Error unfollowing user:', unfollowError)
        return NextResponse.json(
          { error: 'Failed to unfollow user' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Successfully unfollowed user',
        following: false,
        target_user: targetUser
      })
    }
  } catch (error) {
    console.error('Error processing follow action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Supabaseが設定されていない場合はエラーを返す
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      followers: [],
      following: [],
      message: 'Supabase is not configured.'
    })
  }
  
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')
    const type = searchParams.get('type') || 'both' // 'followers', 'following', 'both'
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const result: any = {}

    // フォロワー一覧を取得
    if (type === 'followers' || type === 'both') {
      const { data: followers, error: followersError } = await supabase
        .from('follows')
        .select('follower_id, created_at')
        .eq('following_id', user_id)
        .order('created_at', { ascending: false })

      if (followersError) {
        console.error('Error fetching followers:', followersError)
        result.followers_error = followersError.message
      } else {
        result.followers = followers || []
        result.followers_count = followers?.length || 0
      }
    }

    // フォロー中一覧を取得  
    if (type === 'following' || type === 'both') {
      const { data: following, error: followingError } = await supabase
        .from('follows')
        .select('following_id, created_at')
        .eq('follower_id', user_id)
        .order('created_at', { ascending: false })

      if (followingError) {
        console.error('Error fetching following:', followingError)
        result.following_error = followingError.message
      } else {
        result.following = following || []
        result.following_count = following?.length || 0
      }
    }

    // 現在ログイン中のユーザーが対象ユーザーをフォローしているかチェック
    const currentUser = await getCurrentUser(request)
    if (currentUser && currentUser.id !== user_id) {
      const { data: isFollowing, error: followingCheckError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUser.id)
        .eq('following_id', user_id)
        .maybeSingle()

      if (!followingCheckError) {
        result.is_following = !!isFollowing
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching follow data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch follow data' },
      { status: 500 }
    )
  }
}