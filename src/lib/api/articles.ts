import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Article = Database['public']['Tables']['articles']['Row']
type ArticleInsert = Database['public']['Tables']['articles']['Insert']
type ArticleUpdate = Database['public']['Tables']['articles']['Update']

export const articlesApi = {
  // Get all published articles
  async getPublishedArticles(limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('articles')
      .select(`
        *,
        user:users(username, display_name, avatar_url)
      `, { count: 'exact' })
      .eq('published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Get trending articles
  async getTrendingArticles() {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('trending_articles')
      .select('*')

    if (error) throw error
    return data
  },

  // Get article by slug
  async getArticleBySlug(slug: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        user:users(*),
        comments:article_comments(
          *,
          user:users(username, display_name, avatar_url)
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  },

  // Get articles by user
  async getArticlesByUser(userId: string, limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Get articles by topic
  async getArticlesByTopic(topicName: string, limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('id')
      .eq('name', topicName)
      .single()

    if (topicError) throw topicError

    const { data, error, count } = await supabase
      .from('article_topics')
      .select(`
        article:articles(
          *,
          user:users(username, display_name, avatar_url)
        )
      `, { count: 'exact' })
      .eq('topic_id', topic.id)
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { 
      data: data?.map(item => item.article).filter(Boolean), 
      count 
    }
  },

  // Search articles
  async searchArticles(query: string, limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('articles')
      .select(`
        *,
        user:users(username, display_name, avatar_url)
      `, { count: 'exact' })
      .eq('published', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Create article
  async createArticle(article: ArticleInsert) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('articles')
      .insert(article)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update article
  async updateArticle(id: string, updates: ArticleUpdate) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete article
  async deleteArticle(id: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Like article
  async likeArticle(articleId: string, userId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        likeable_type: 'article',
        likeable_id: articleId
      })

    if (error && error.code !== '23505') throw error // Ignore duplicate key error

    // Update likes count
    await supabase.rpc('increment', { 
      table_name: 'articles', 
      column_name: 'likes_count', 
      row_id: articleId 
    })
  },

  // Unlike article
  async unlikeArticle(articleId: string, userId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('likeable_type', 'article')
      .eq('likeable_id', articleId)

    if (error) throw error

    // Update likes count
    await supabase.rpc('decrement', { 
      table_name: 'articles', 
      column_name: 'likes_count', 
      row_id: articleId 
    })
  }
}