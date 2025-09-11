import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

export type Chapter = Database['public']['Tables']['book_chapters']['Row']

export const chaptersApi = {
  /**
   * 書籍のチャプター一覧を取得
   */
  async getChaptersByBook(bookId: string, limit = 100, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('book_chapters')
      .select('*', { count: 'exact' })
      .eq('book_id', bookId)
      .order('order_index', { ascending: true })
      .range(offset, offset + limit - 1)
    
    if (error) {
      // エラーログ削除（セキュリティ対応）
      return { data: null, error: error.message, count: 0 }
    }
    
    return { data, error: null, count: count || 0 }
  },

  /**
   * チャプターの詳細を取得
   */
  async getChapterById(id: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('book_chapters')
      .select(`
        *,
        book:books(
          id,
          title,
          slug,
          user:users(
            id,
            username,
            display_name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      // エラーログ削除（セキュリティ対応）
      return { data: null, error: error.message }
    }
    
    return { data, error: null }
  },

  /**
   * チャプターを作成
   */
  async createChapter(chapter: {
    book_id: string
    title: string
    content: string
    order_index: number
    is_free?: boolean
  }) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('book_chapters')
      .insert(chapter)
      .select()
      .single()
    
    if (error) {
      // エラーログ削除（セキュリティ対応）
      return { data: null, error: error.message }
    }
    
    return { data, error: null }
  },

  /**
   * チャプターを更新
   */
  async updateChapter(id: string, updates: Partial<{
    title: string
    content: string
    order_index: number
    is_free: boolean
  }>) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('book_chapters')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      // エラーログ削除（セキュリティ対応）
      return { data: null, error: error.message }
    }
    
    return { data, error: null }
  },

  /**
   * チャプターを削除
   */
  async deleteChapter(id: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('book_chapters')
      .delete()
      .eq('id', id)
    
    if (error) {
      // エラーログ削除（セキュリティ対応）
      return { success: false, error: error.message }
    }
    
    return { success: true, error: null }
  }
}