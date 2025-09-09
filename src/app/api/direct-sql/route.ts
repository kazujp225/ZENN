import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()
    
    if (!sql) {
      return NextResponse.json(
        { error: 'SQL query is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    
    // 直接PostgreSQLクエリを実行
    const { data, error } = await supabase
      .from('_supabase_functions')
      .select('*')
      .limit(0) // ダミークエリでコネクションを取得
    
    // PostgRESTのSQL実行機能を使用
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
      },
      body: JSON.stringify({ query: sql })
    })
    
    if (!response.ok) {
      // 代替案：直接SQLを送信（危険だが開発環境用）
      console.log('Attempting direct table creation...')
      
      // likesテーブルの存在確認
      try {
        const { error: testError } = await supabase
          .from('likes')
          .select('id')
          .limit(1)
          
        if (!testError) {
          return NextResponse.json({ 
            success: true, 
            message: 'Likes table already exists and working'
          })
        }
      } catch (e) {
        console.log('Likes table does not exist, will create manually')
      }
      
      // 手動でSupabaseダッシュボード指示を返す
      return NextResponse.json({
        success: false,
        error: 'Direct SQL execution not available',
        instruction: 'Please execute the following SQL in your Supabase dashboard:',
        sql: `
-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('article', 'book', 'comment', 'scrap')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_id, target_type)
);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create RPC function
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
      })
    }
    
    const result = await response.json()
    
    return NextResponse.json({ 
      success: true, 
      message: 'SQL executed successfully',
      result
    })
    
  } catch (error) {
    console.error('Direct SQL error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to execute SQL',
      details: error 
    })
  }
}