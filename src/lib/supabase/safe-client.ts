import { createClient } from './client'

/**
 * Supabaseクライアントの安全なラッパー
 * 環境変数が設定されていない場合でもエラーを防ぐ
 */
export function getSafeSupabaseClient() {
  try {
    const client = createClient()
    return {
      client,
      isConfigured: true,
      error: null
    }
  } catch (error) {
    console.error('Supabase client initialization failed:', error)
    return {
      client: null,
      isConfigured: false,
      error: 'Supabase is not configured. Please set up environment variables.'
    }
  }
}

/**
 * Supabaseが設定されているかチェック
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/**
 * 環境変数の状態を取得
 */
export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[HIDDEN]' : null,
    isConfigured: isSupabaseConfigured()
  }
}