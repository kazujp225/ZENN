import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type ArticleComment = Database['public']['Tables']['article_comments']['Row']
type ArticleCommentInsert = Database['public']['Tables']['article_comments']['Insert']

export const commentsApi = {
  // Get article comments
  async getArticleComments(articleId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('article_comments')
      .select(`
        *,
        user:users(username, display_name, avatar_url),
        replies:article_comments!parent_id(
          *,
          user:users(username, display_name, avatar_url)
        )
      `)
      .eq('article_id', articleId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  // Add comment to article
  async addArticleComment(comment: ArticleCommentInsert) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('article_comments')
      .insert(comment)
      .select(`
        *,
        user:users(username, display_name, avatar_url)
      `)
      .single()

    if (error) throw error
    
    // Update comments count
    await supabase.rpc('increment', { 
      table_name: 'articles', 
      column_name: 'comments_count', 
      row_id: comment.article_id 
    })
    
    return data
  },

  // Update comment
  async updateArticleComment(id: string, content: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('article_comments')
      .update({ content })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete comment
  async deleteArticleComment(id: string, articleId: string) {
    const supabase = createClient()
    
    // First delete all replies
    await supabase
      .from('article_comments')
      .delete()
      .eq('parent_id', id)
    
    // Then delete the comment itself
    const { error } = await supabase
      .from('article_comments')
      .delete()
      .eq('id', id)

    if (error) throw error
    
    // Update comments count
    await supabase.rpc('decrement', { 
      table_name: 'articles', 
      column_name: 'comments_count', 
      row_id: articleId 
    })
  },

  // Like comment
  async likeComment(commentId: string, userId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        likeable_type: 'comment',
        likeable_id: commentId
      })

    if (error && error.code !== '23505') throw error // Ignore duplicate key error
  },

  // Unlike comment
  async unlikeComment(commentId: string, userId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('likeable_type', 'comment')
      .eq('likeable_id', commentId)

    if (error) throw error
  },

  // Check if user liked comment
  async hasUserLikedComment(commentId: string, userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('likeable_type', 'comment')
      .eq('likeable_id', commentId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore not found error
    return !!data
  }
}