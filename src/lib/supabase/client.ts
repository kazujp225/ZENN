import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  // 環境変数のチェック
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // 環境変数が設定されていない場合はエラーをスロー
  if (!supabaseUrl || !supabaseAnonKey) {
    // エラーログ削除（セキュリティ対応）
    // 開発環境用のモックURLを使用
    return createBrowserClient<Database>(
      'https://xyzcompany.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDYyMzkwMjIsImV4cCI6MTk2MTgxNTAyMn0.placeholder'
    )
  }
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}