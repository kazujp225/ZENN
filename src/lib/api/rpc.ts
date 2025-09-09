import { createClient } from '@/lib/supabase/client'

export const rpcApi = {
  async incrementCounter(
    table: string,
    column: string,
    id: string,
    amount = 1
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('increment_counter', {
      table_name: table,
      column_name: column,
      row_id: id,
      increment_by: amount
    })

    if (error) throw error
    return data
  },

  async getTrendingContent(
    contentType: 'articles' | 'books' | 'scraps',
    timeRange: 'day' | 'week' | 'month' = 'week',
    limit = 10
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('get_trending_content', {
      content_type: contentType,
      time_range: timeRange,
      limit_count: limit
    })

    if (error) throw error
    return data
  },

  async getUserStats(userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('get_user_stats', {
      user_id: userId
    })

    if (error) throw error
    return data
  },

  async searchFullText(
    query: string,
    tables: string[],
    limit = 20
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('search_full_text', {
      search_query: query,
      search_tables: tables,
      result_limit: limit
    })

    if (error) throw error
    return data
  },

  async calculateReadingStats(articleId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('calculate_reading_stats', {
      article_id: articleId
    })

    if (error) throw error
    return data
  },

  async getRelatedContent(
    contentId: string,
    contentType: 'article' | 'book' | 'scrap',
    limit = 5
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('get_related_content', {
      content_id: contentId,
      content_type: contentType,
      limit_count: limit
    })

    if (error) throw error
    return data
  },

  async bulkUpdateViews(viewData: Array<{ id: string; type: string }>) {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('bulk_update_views', {
      view_data: viewData
    })

    if (error) throw error
    return data
  },

  async getUserActivityFeed(
    userId: string,
    limit = 20,
    offset = 0
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('get_user_activity_feed', {
      user_id: userId,
      limit_count: limit,
      offset_count: offset
    })

    if (error) throw error
    return data
  },

  async generateSlug(
    title: string,
    table: string
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('generate_unique_slug', {
      title_text: title,
      table_name: table
    })

    if (error) throw error
    return data
  },

  async getPopularTags(
    limit = 20,
    minUsage = 5
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('get_popular_tags', {
      limit_count: limit,
      min_usage_count: minUsage
    })

    if (error) throw error
    return data
  }
}