'use client'

export type ArticleType = 'tech' | 'idea'

export interface Article {
  id: string
  slug: string
  title: string
  emoji: string
  type: ArticleType
  tags: string[]
  content: string
  published: boolean
  createdAt: string
  updatedAt: string
  views?: number
  likes?: number
}

const STORAGE_KEY = 'my-articles'

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

export function getAllArticles(): Article[] {
  if (typeof window === 'undefined') return []
  const data = safeParse<Article[]>(localStorage.getItem(STORAGE_KEY), [])
  return Array.isArray(data) ? data : []
}

export function getArticleById(id: string): Article | null {
  return getAllArticles().find(a => a.id === id) || null
}

export function saveArticle(article: Article): void {
  const all = getAllArticles()
  const idx = all.findIndex(a => a.id === article.id)
  const updated = idx >= 0 ? [...all.slice(0, idx), article, ...all.slice(idx + 1)] : [article, ...all]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function deleteArticle(id: string): void {
  const all = getAllArticles().filter(a => a.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function createArticleId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

