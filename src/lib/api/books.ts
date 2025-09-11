import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Book = Database['public']['Tables']['books']['Row']
type BookChapter = Database['public']['Tables']['book_chapters']['Row']
type BookInsert = Database['public']['Tables']['books']['Insert']
type BookUpdate = Database['public']['Tables']['books']['Update']

export const booksApi = {
  // Get all published books
  async getPublishedBooks(limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('books')
      .select(`
        *,
        user:users(username, display_name, avatar_url),
        chapters:book_chapters(id, title, slug, position, free)
      `, { count: 'exact' })
      .eq('published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Get book by slug
  async getBookBySlug(slug: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        user:users(*),
        chapters:book_chapters(*)
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      // エラーログ削除（セキュリティ対応）
      return { data: null, error: error.message }
    }
    
    // Sort chapters by position
    if (data?.chapters) {
      data.chapters.sort((a: any, b: any) => a.position - b.position)
    }
    
    return { data, error: null }
  },

  // Get books by user
  async getBooksByUser(userId: string, limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('books')
      .select(`
        *,
        chapters:book_chapters(id, title, slug, position, free)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .eq('published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Get free books
  async getFreeBooks(limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('books')
      .select(`
        *,
        user:users(username, display_name, avatar_url)
      `, { count: 'exact' })
      .eq('published', true)
      .eq('is_free', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Get paid books
  async getPaidBooks(limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('books')
      .select(`
        *,
        user:users(username, display_name, avatar_url)
      `, { count: 'exact' })
      .eq('published', true)
      .eq('is_free', false)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Get book chapter
  async getBookChapter(bookSlug: string, chapterSlug: string) {
    const supabase = createClient()
    
    // First get the book
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, title, user_id')
      .eq('slug', bookSlug)
      .single()

    if (bookError) throw bookError

    // Then get the chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('book_chapters')
      .select('*')
      .eq('book_id', book.id)
      .eq('slug', chapterSlug)
      .single()

    if (chapterError) throw chapterError

    return {
      ...chapter,
      book: book
    }
  },

  // Search books
  async searchBooks(query: string, limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('books')
      .select(`
        *,
        user:users(username, display_name, avatar_url)
      `, { count: 'exact' })
      .eq('published', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Create book
  async createBook(book: BookInsert) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('books')
      .insert(book)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update book
  async updateBook(id: string, updates: BookUpdate) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete book
  async deleteBook(id: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Like book
  async likeBook(bookId: string, userId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        likeable_type: 'book',
        likeable_id: bookId
      })

    if (error && error.code !== '23505') throw error

    // Update likes count
    await supabase.rpc('increment', { 
      table_name: 'books', 
      column_name: 'likes_count', 
      row_id: bookId 
    })
  },

  // Unlike book
  async unlikeBook(bookId: string, userId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('likeable_type', 'book')
      .eq('likeable_id', bookId)

    if (error) throw error

    // Update likes count
    await supabase.rpc('decrement', { 
      table_name: 'books', 
      column_name: 'likes_count', 
      row_id: bookId 
    })
  }
}