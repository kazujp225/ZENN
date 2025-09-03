// 記事関連の型定義

export interface Author {
  username: string
  name: string
  avatar: string
  bio: string
  followersCount: number
  articles: AuthorArticle[]
}

export interface AuthorArticle {
  id: string
  title: string
  emoji: string
  likes: number
}

export interface TocItem {
  id: string
  title: string
  level: number
}

export interface RelatedArticle {
  id: string
  title: string
  emoji: string
  author: {
    name: string
    username: string
  }
  likes: number
  publishedAt: string
}

export interface Comment {
  id: string
  author: {
    username: string
    name: string
    avatar: string
  }
  content: string
  publishedAt: string
  likes: number
  isLiked?: boolean
  replies?: Reply[]
}

export interface Reply {
  id: string
  author: {
    username: string
    name: string
    avatar: string
  }
  content: string
  publishedAt: string
  likes: number
  isLiked?: boolean
}

export interface Article {
  id: string
  title: string
  emoji: string
  author: Author
  publishedAt: string
  updatedAt: string
  readingTime: string
  likes: number
  comments: Comment[]
  type: 'tech' | 'idea'
  tags: string[]
  content: string
  toc: TocItem[]
  relatedArticles: RelatedArticle[]
}

// スロット用の型定義
export interface ArticleSlots {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  rightSidebar?: React.ReactNode
  footer?: React.ReactNode
}