import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Topic = Database['public']['Tables']['topics']['Row']
type TopicInsert = Database['public']['Tables']['topics']['Insert']
type TopicUpdate = Database['public']['Tables']['topics']['Update']

export const topicsApi = {
  // Get all topics
  async getTopics(limit = 50, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('topics')
      .select('*', { count: 'exact' })
      .order('articles_count', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Get popular topics
  async getPopularTopics(limit = 10) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('articles_count', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Get topic by name
  async getTopicByName(name: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('name', name)
      .single()

    if (error) throw error
    return data
  },

  // Search topics
  async searchTopics(query: string, limit = 20) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .or(`name.ilike.%${query}%,display_name.ilike.%${query}%`)
      .order('articles_count', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Create topic
  async createTopic(topic: TopicInsert) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('topics')
      .insert(topic)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update topic
  async updateTopic(id: string, updates: TopicUpdate) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('topics')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Add topic to article
  async addTopicToArticle(articleId: string, topicId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('article_topics')
      .insert({
        article_id: articleId,
        topic_id: topicId
      })

    if (error && error.code !== '23505') throw error // Ignore duplicate key error
    
    // Update articles count
    await supabase.rpc('increment', { 
      table_name: 'topics', 
      column_name: 'articles_count', 
      row_id: topicId 
    })
  },

  // Remove topic from article
  async removeTopicFromArticle(articleId: string, topicId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('article_topics')
      .delete()
      .eq('article_id', articleId)
      .eq('topic_id', topicId)

    if (error) throw error
    
    // Update articles count
    await supabase.rpc('decrement', { 
      table_name: 'topics', 
      column_name: 'articles_count', 
      row_id: topicId 
    })
  }
}