import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  // 🚨 SECURITY: This endpoint has been disabled for production security
  return NextResponse.json({
    error: 'Endpoint disabled for security reasons',
    message: 'Database repair endpoints are not available in production'
  }, { status: 403 })
  
  /*
  try {
    const supabase = createAdminClient()
    
    // likesテーブルを削除して再作成
    const sql = `
      -- 既存のlikesテーブルを削除
      DROP TABLE IF EXISTS likes CASCADE;
      
      -- likesテーブルを正しく作成
      CREATE TABLE likes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        target_id UUID NOT NULL,
        target_type TEXT NOT NULL CHECK (target_type IN ('article', 'book', 'comment', 'scrap')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, target_id, target_type)
      );
      
      -- RLS有効化
      ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
    `
    
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql })
    if (sqlError) {
      console.error('SQL Error:', sqlError)
    }

    // RLSポリシーを作成
    const policies = [
      {
        name: "Likes are viewable by everyone",
        sql: "CREATE POLICY \"Likes are viewable by everyone\" ON likes FOR SELECT USING (true);"
      },
      {
        name: "Authenticated users can like",
        sql: "CREATE POLICY \"Authenticated users can like\" ON likes FOR INSERT WITH CHECK (true);"
      },
      {
        name: "Users can delete own likes",
        sql: "CREATE POLICY \"Users can delete own likes\" ON likes FOR DELETE USING (auth.uid()::text = user_id::text);"
      }
    ]

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql })
      if (error) {
        console.error(`Error creating policy ${policy.name}:`, error)
      }
    }

    // increment_likes_count関数を作成
    const rpcSql = `
      CREATE OR REPLACE FUNCTION increment_likes_count(table_name TEXT, row_id UUID, increment_by INTEGER)
      RETURNS void AS $$
      BEGIN
        CASE table_name
          WHEN 'articles' THEN
            UPDATE articles SET likes_count = COALESCE(likes_count, 0) + increment_by WHERE id = row_id;
          WHEN 'books' THEN
            UPDATE books SET likes_count = COALESCE(likes_count, 0) + increment_by WHERE id = row_id;
          WHEN 'scraps' THEN
            UPDATE scraps SET likes_count = COALESCE(likes_count, 0) + increment_by WHERE id = row_id;
          WHEN 'article_comments' THEN
            UPDATE article_comments SET likes_count = COALESCE(likes_count, 0) + increment_by WHERE id = row_id;
          ELSE
            RAISE EXCEPTION 'Invalid table name: %', table_name;
        END CASE;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: rpcSql })
    if (rpcError) {
      console.error('RPC Error:', rpcError)
    }

    // テスト用：likesテーブルの存在を確認
    const { data: tableTest, error: testError } = await supabase
      .from('likes')
      .select('*')
      .limit(0)

    if (testError) {
      console.error('Table test error:', testError)
      return NextResponse.json({ 
        success: false, 
        error: 'Likes table verification failed',
        details: testError 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Likes table fixed successfully'
    })
  } catch (error) {
    console.error('Fix error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Fix failed',
      details: error 
    })
  }
  */
}