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
      // エラーログ削除（セキュリティ対応）
      return NextResponse.json(
        { error: 'ユーザー検索に失敗しました' },
        { status: 500 }
      )
    }

    let user
    
    if (existingUsers && existingUsers.length > 0) {
      // 既存のユーザーが見つかった場合は更新
      user = existingUsers[0]
      // console.log削除（セキュリティ対応）
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
        // エラーログ削除（セキュリティ対応）
        return NextResponse.json(
          { error: 'ユーザー更新に失敗しました' },
          { status: 500 }
        )
      }
      
      user = updatedUser
    } else {
      // 新しいユーザーを作成
      const userId = crypto.randomUUID()
      // console.log削除（セキュリティ対応）
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
        // エラーログ削除（セキュリティ対応）
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
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}