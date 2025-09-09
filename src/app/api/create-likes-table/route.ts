import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = createAdminClient()
    
    // likesテーブルを作成
    const { error: createError } = await supabase.rpc('create_likes_table', {})

    if (createError) {
      console.error('Error creating likes table:', createError)
    }

    // 手動でSQL実行
    const sql = `
      CREATE TABLE IF NOT EXISTS likes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        target_id UUID NOT NULL,
        target_type TEXT NOT NULL CHECK (target_type IN ('article', 'book', 'comment', 'scrap')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, target_id, target_type)
      );
      
      -- RLS有効化
      ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
      
      -- RLSポリシー
      DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
      CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
      
      DROP POLICY IF EXISTS "Authenticated users can like" ON likes;
      CREATE POLICY "Authenticated users can like" ON likes FOR INSERT WITH CHECK (true);
      
      DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
      CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid()::text = user_id::text);
      
      -- RPC関数
      CREATE OR REPLACE FUNCTION increment_likes_count(table_name TEXT, row_id UUID, increment_by INTEGER)
      RETURNS void AS $$
      BEGIN
        CASE table_name
          WHEN 'articles' THEN
            UPDATE articles SET likes_count = likes_count + increment_by WHERE id = row_id;
          WHEN 'books' THEN
            UPDATE books SET likes_count = likes_count + increment_by WHERE id = row_id;
          WHEN 'scraps' THEN
            UPDATE scraps SET likes_count = likes_count + increment_by WHERE id = row_id;
          WHEN 'article_comments' THEN
            UPDATE article_comments SET likes_count = likes_count + increment_by WHERE id = row_id;
          ELSE
            RAISE EXCEPTION 'Invalid table name: %', table_name;
        END CASE;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // SQL実行（複数のステートメント）
    const statements = sql.split(';').filter(s => s.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' })
        if (error) {
          console.error('SQL Error:', error)
        }
      }
    }

    // テスト用：likesテーブルの構造を確認
    const { data: tableInfo, error: infoError } = await supabase
      .from('likes')
      .select('*')
      .limit(0)

    if (infoError) {
      console.error('Table info error:', infoError)
      return NextResponse.json({ 
        success: false, 
        error: 'Likes table may not exist',
        details: infoError 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Likes table setup complete'
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Setup failed',
      details: error 
    })
  }
}