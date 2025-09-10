import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, username } = await request.json()
    
    if (!email || !username) {
      return NextResponse.json(
        { error: 'メールアドレスとユーザー名が必要です' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // 既存のユーザーを検索（メールアドレスまたはusernameで）
    const { data: existingUsers, error: searchError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email},username.eq.${username}`)
    
    if (searchError) {
      console.error('User search error:', searchError)
      return NextResponse.json(
        { error: 'ユーザー検索に失敗しました' },
        { status: 500 }
      )
    }

    let user
    
    if (existingUsers && existingUsers.length > 0) {
      // 既存のユーザーが見つかった場合は更新
      user = existingUsers[0]
      console.log('Found existing user:', user.id, user.username)
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          email: email,
          username: username,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('User update error:', updateError)
        return NextResponse.json(
          { error: 'ユーザー更新に失敗しました' },
          { status: 500 }
        )
      }
      
      user = updatedUser
    } else {
      // 新しいユーザーを作成
      const userId = crypto.randomUUID()
      console.log('Creating new user with ID:', userId)
      
      const userPayload = {
        id: userId,
        email: email,
        username: username,
        display_name: username.charAt(0).toUpperCase() + username.slice(1),
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        bio: '',
        website_url: '',
        twitter_username: '',
        github_username: '',
        location: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(userPayload)
        .select()
        .single()

      if (createError) {
        console.error('User creation error:', createError)
        return NextResponse.json(
          { error: 'ユーザー作成に失敗しました' },
          { status: 500 }
        )
      }
      
      user = newUser
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        avatar: user.avatar_url
      }
    })

  } catch (error) {
    console.error('Sync user error:', error)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}