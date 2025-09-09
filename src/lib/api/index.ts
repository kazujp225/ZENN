// API exports - centralized API access point
export { articlesApi } from './articles'
export { booksApi } from './books'
export { chaptersApi } from './chapters'
export { scrapsApi } from './scraps'
export { usersApi } from './users'
export { topicsApi } from './topics'
export { commentsApi } from './comments'
export { authApi } from './auth'

// Re-export types
export type { Database } from '@/lib/supabase/database.types'

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// Common types
export type User = Tables<'users'>
export type Article = Tables<'articles'>
export type Book = Tables<'books'>
export type BookChapter = Tables<'book_chapters'>
export type Scrap = Tables<'scraps'>
export type ScrapComment = Tables<'scrap_comments'>
export type ArticleComment = Tables<'article_comments'>
export type Topic = Tables<'topics'>
export type Like = Tables<'likes'>
export type Follow = Tables<'follows'>

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  count?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API utilities
export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error
  }
  
  if (error?.message) {
    return new ApiError(
      error.message,
      error.code,
      error.status
    )
  }
  
  return new ApiError('An unexpected error occurred')
}