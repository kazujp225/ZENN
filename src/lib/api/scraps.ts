import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Scrap = Database['public']['Tables']['scraps']['Row']
type ScrapComment = Database['public']['Tables']['scrap_comments']['Row']
type ScrapInsert = Database['public']['Tables']['scraps']['Insert']
type ScrapUpdate = Database['public']['Tables']['scraps']['Update']

export const scrapsApi = {
  // Get all scraps
  async getScraps(limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('scraps')
      .select(`
        *,
        user:users(username, display_name, avatar_url),
        comments:scrap_comments(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Get open scraps
  async getOpenScraps(limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('scraps')
      .select(`
        *,
        user:users(username, display_name, avatar_url)
      `, { count: 'exact' })
      .eq('closed', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Get closed scraps
  async getClosedScraps(limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('scraps')
      .select(`
        *,
        user:users(username, display_name, avatar_url)
      `, { count: 'exact' })
      .eq('closed', true)
      .order('closed_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Get scrap by slug
  async getScrapBySlug(slug: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('scraps')
      .select(`
        *,
        user:users(*),
        comments:scrap_comments(
          *,
          user:users(username, display_name, avatar_url)
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) throw error
    
    // Sort comments by created_at
    if (data?.comments) {
      data.comments.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }
    
    return data
  },

  // Get scraps by user
  async getScrapsByUser(userId: string, limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('scraps')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Search scraps
  async searchScraps(query: string, limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('scraps')
      .select(`
        *,
        user:users(username, display_name, avatar_url)
      `, { count: 'exact' })
      .or(`title.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Create scrap
  async createScrap(scrap: ScrapInsert) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('scraps')
      .insert(scrap)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update scrap
  async updateScrap(id: string, updates: ScrapUpdate) {
    const supabase = createClient()
    
    // If closing the scrap, set closed_at
    if (updates.closed === true) {
      updates.closed_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('scraps')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete scrap
  async deleteScrap(id: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('scraps')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Add comment to scrap
  async addScrapComment(scrapId: string, userId: string, content: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('scrap_comments')
      .insert({
        scrap_id: scrapId,
        user_id: userId,
        content
      })
      .select(`
        *,
        user:users(username, display_name, avatar_url)
      `)
      .single()

    if (error) throw error
    
    // Update comments count
    await supabase.rpc('increment', { 
      table_name: 'scraps', 
      column_name: 'comments_count', 
      row_id: scrapId 
    })
    
    return data
  },

  // Delete scrap comment
  async deleteScrapComment(commentId: string, scrapId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('scrap_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
    
    // Update comments count
    await supabase.rpc('decrement', { 
      table_name: 'scraps', 
      column_name: 'comments_count', 
      row_id: scrapId 
    })
  }
}