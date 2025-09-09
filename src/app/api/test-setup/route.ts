import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Create test user
    const testEmail = `test-${Date.now()}@example.com`
    const testUsername = `testuser${Date.now()}`
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        username: testUsername,
        display_name: 'テストユーザー',
        bio: 'これはテスト用のアカウントです'
      })
      .select()
      .single()
    
    if (userError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create user',
        details: userError
      }, { status: 500 })
    }
    
    // Create test article
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .insert({
        title: 'Supabaseとの連携テスト',
        content: `# Supabaseとの連携テスト

このアプリケーションは正常にSupabaseと連携しています！

## 確認済み機能

- ✅ データベース接続
- ✅ テーブル作成
- ✅ データの読み書き

## 次のステップ

1. ユーザー登録機能のテスト
2. 記事投稿機能のテスト
3. リアルタイム機能のテスト

---

*この記事は自動生成されました*`,
        slug: `test-article-${Date.now()}`,
        emoji: '✅',
        user_id: userData.id,
        published: true,
        likes_count: 0,
        comments_count: 0
      })
      .select()
      .single()
    
    if (articleError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create article',
        details: articleError,
        user: userData
      }, { status: 500 })
    }
    
    // Create some topics
    const topics = [
      { name: 'supabase', display_name: 'Supabase', description: 'Supabaseに関する記事' },
      { name: 'nextjs', display_name: 'Next.js', description: 'Next.jsに関する記事' },
      { name: 'typescript', display_name: 'TypeScript', description: 'TypeScriptに関する記事' }
    ]
    
    for (const topic of topics) {
      try {
        await supabase
          .from('topics')
          .insert(topic)
          .select()
          .single()
      } catch (error) {
        // Ignore duplicates
        console.log(`Topic ${topic.name} already exists or failed:`, error)
      }
    }
    
    // Fetch all articles to verify
    const { data: allArticles, error: fetchError } = await supabase
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
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      created: {
        user: userData,
        article: articleData
      },
      all_articles: allArticles,
      total_articles: allArticles?.length || 0
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}