export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          website_url: string | null
          twitter_username: string | null
          github_username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          twitter_username?: string | null
          github_username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          twitter_username?: string | null
          github_username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          user_id: string
          slug: string
          title: string
          content: string
          emoji: string | null
          type: 'tech' | 'idea'
          topics: string[] | null
          published: boolean
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          title: string
          content: string
          emoji?: string | null
          type?: 'tech' | 'idea'
          topics?: string[] | null
          published?: boolean
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          title?: string
          content?: string
          emoji?: string | null
          type?: 'tech' | 'idea'
          topics?: string[] | null
          published?: boolean
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      books: {
        Row: {
          id: string
          user_id: string
          slug: string
          title: string
          description: string | null
          cover_image_url: string | null
          price: number
          is_free: boolean
          published: boolean
          likes_count: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          title: string
          description?: string | null
          cover_image_url?: string | null
          price?: number
          is_free?: boolean
          published?: boolean
          likes_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          title?: string
          description?: string | null
          cover_image_url?: string | null
          price?: number
          is_free?: boolean
          published?: boolean
          likes_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      book_chapters: {
        Row: {
          id: string
          book_id: string
          slug: string
          title: string
          content: string
          position: number
          free: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book_id: string
          slug: string
          title: string
          content: string
          position: number
          free?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          slug?: string
          title?: string
          content?: string
          position?: number
          free?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      scraps: {
        Row: {
          id: string
          user_id: string
          slug: string
          title: string
          emoji: string | null
          closed: boolean
          closed_at: string | null
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          title: string
          emoji?: string | null
          closed?: boolean
          closed_at?: string | null
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          title?: string
          emoji?: string | null
          closed?: boolean
          closed_at?: string | null
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      scrap_comments: {
        Row: {
          id: string
          scrap_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scrap_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          scrap_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      article_comments: {
        Row: {
          id: string
          article_id: string
          user_id: string
          parent_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          parent_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          likeable_type: 'article' | 'book' | 'scrap' | 'comment'
          likeable_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          likeable_type: 'article' | 'book' | 'scrap' | 'comment'
          likeable_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          likeable_type?: 'article' | 'book' | 'scrap' | 'comment'
          likeable_id?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          name: string
          display_name: string | null
          description: string | null
          icon_url: string | null
          articles_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name?: string | null
          description?: string | null
          icon_url?: string | null
          articles_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string | null
          description?: string | null
          icon_url?: string | null
          articles_count?: number
          created_at?: string
        }
      }
      article_topics: {
        Row: {
          article_id: string
          topic_id: string
        }
        Insert: {
          article_id: string
          topic_id: string
        }
        Update: {
          article_id?: string
          topic_id?: string
        }
      }
    }
    Views: {
      trending_articles: {
        Row: {
          id: string
          user_id: string
          slug: string
          title: string
          content: string
          emoji: string | null
          type: 'tech' | 'idea'
          topics: string[] | null
          published: boolean
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
          published_at: string | null
          username: string
          display_name: string | null
          avatar_url: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}