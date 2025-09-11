import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    
    if (!file || !userId) {
      return NextResponse.json(
        { error: 'ファイルまたはユーザーIDが指定されていません' },
        { status: 400 }
      )
    }

    // ファイルサイズチェック（5MB）
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'ファイルサイズが5MBを超えています' },
        { status: 400 }
      )
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'サポートされていないファイル形式です。JPEG、PNG、GIF、WebPのみ対応しています。' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // ファイル名を生成（ユーザーIDとタイムスタンプを使用）
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`
    
    // Supabase Storageにアップロード
    const { data, error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      // エラーログ削除（セキュリティ対応）
      return NextResponse.json(
        { error: 'ファイルのアップロードに失敗しました' },
        { status: 500 }
      )
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('user-assets')
      .getPublicUrl(filePath)

    // ユーザーのavatar_urlを更新
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      // エラーログ削除（セキュリティ対応）
      // アップロードされた画像を削除
      await supabase.storage
        .from('user-assets')
        .remove([filePath])
      
      return NextResponse.json(
        { error: 'プロフィールの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: publicUrl,
      message: 'アバター画像が正常にアップロードされました'
    })

  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const filePath = searchParams.get('filePath')
    
    if (!userId || !filePath) {
      return NextResponse.json(
        { error: 'ユーザーIDまたはファイルパスが指定されていません' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Storageから画像を削除
    const { error: deleteError } = await supabase.storage
      .from('user-assets')
      .remove([filePath])
    
    if (deleteError) {
      // エラーログ削除（セキュリティ対応）
    }

    // ユーザーのavatar_urlをデフォルトに戻す
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        avatar_url: defaultAvatar,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      // エラーログ削除（セキュリティ対応）
      return NextResponse.json(
        { error: 'プロフィールの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'アバター画像が削除されました',
      defaultAvatar
    })

  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}