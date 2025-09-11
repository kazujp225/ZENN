import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  // 🚨 SECURITY: This endpoint has been disabled for production security
  return NextResponse.json({
    error: 'Endpoint disabled for security reasons',
    message: 'Database structure inspection endpoints are not available in production'
  }, { status: 403 })
  
  /*
  try {
    const supabase = createAdminClient()
    
    // システムテーブルから likes テーブルの構造を確認
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'likes')
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (columnsError) {
      // エラーログ削除（セキュリティ対応）
    }

    // テーブル一覧を確認
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%like%')
      
    if (tablesError) {
      // エラーログ削除（セキュリティ対応）
    }

    // likesテーブルに直接アクセスを試行
    let directAccess = null
    let directError = null
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .limit(1)
      directAccess = { success: !error, data, error }
      directError = error
    } catch (e) {
      directError = e
    }

    return NextResponse.json({
      columns: columns || [],
      tables: tables || [],
      directAccess,
      directError,
      columnsError,
      tablesError
    })
    
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json({ 
      error: 'Check failed',
      details: error 
    })
  }
  */
}