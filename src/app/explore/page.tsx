'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs } from '@/components/ui/Tabs'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import { ScrapCard } from '@/components/cards/ScrapCard'
import { Chip } from '@/components/ui/Chip'
import { PageProvider } from '@/providers/EnhancedAppProvider'
import { Button } from '@/components/ui/Button'

// サンプルデータ
const allArticles = [
  {
    id: '1',
    title: 'Next.js 14の新機能まとめ - App Routerの進化',
    emoji: '🚀',
    author: {
      username: 'developer1',
      name: '田中太郎',
      avatar: '/images/avatar-placeholder.svg'
    },
    publishedAt: '2025-01-15T10:00:00Z',
    likes: 234,
    comments: 12,
    type: 'tech' as const,
    tags: ['Next.js', 'React', 'TypeScript']
  },
  {
    id: '2',
    title: 'TypeScriptの型パズルを解く - 高度な型プログラミング入門',
    emoji: '🧩',
    author: {
      username: 'tsexpert',
      name: '佐藤花子',
      avatar: '/images/avatar-placeholder.svg'
    },
    publishedAt: '2025-01-14T15:30:00Z',
    likes: 189,
    comments: 8,
    type: 'tech' as const,
    tags: ['TypeScript', 'JavaScript']
  },
  {
    id: '3',
    title: 'Rustで作る高速Webサーバー - パフォーマンス最適化のコツ',
    emoji: '🦀',
    author: {
      username: 'rustacean',
      name: '鈴木一郎',
      avatar: '/images/avatar-placeholder.svg'
    },
    publishedAt: '2025-01-13T09:00:00Z',
    likes: 156,
    comments: 5,
    type: 'tech' as const,
    tags: ['Rust', 'Backend', 'Performance']
  }
]

const allBooks = [
  {
    id: 'book1',
    title: 'ゼロから学ぶReact & Next.js',
    coverImage: '/images/placeholder.svg',
    author: {
      username: 'reactmaster',
      name: '田中太郎',
      avatar: '/images/avatar-placeholder.svg'
    },
    price: 2500 as number,
    likes: 89,
    publishedAt: '2025-01-10T10:00:00Z',
    description: 'React初心者からNext.jsマスターまで、段階的に学べる実践的な教科書'
  },
  {
    id: 'book2',
    title: 'TypeScript実践ガイド',
    coverImage: '/images/placeholder.svg',
    author: {
      username: 'tsexpert',
      name: '佐藤花子',
      avatar: '/images/avatar-placeholder.svg'
    },
    price: 'free' as const,
    likes: 234,
    publishedAt: '2025-01-08T10:00:00Z',
    description: 'TypeScriptの基礎から高度な型プログラミングまで網羅'
  },
  {
    id: 'book3',
    title: 'クリーンアーキテクチャ実践入門',
    coverImage: '/images/placeholder.svg',
    author: {
      username: 'architect',
      name: '山田次郎',
      avatar: '/images/avatar-placeholder.svg'
    },
    price: 3000 as number,
    likes: 67,
    publishedAt: '2025-01-05T10:00:00Z',
    description: 'ソフトウェア設計の原則を実践的に学ぶ'
  }
]

const allScraps = [
  {
    id: 'scrap1',
    title: 'Next.js 14でのSSGとISRの使い分けについて',
    author: {
      username: 'developer1',
      name: '田中太郎',
      avatar: '/images/avatar-placeholder.svg'
    },
    publishedAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T15:30:00Z',
    commentsCount: 8,
    isOpen: true,
    emoji: '💭',
    excerpt: 'Next.js 14でSSGとISRをどう使い分けるか、実際のプロジェクトでの経験をもとに考察してみました...'
  },
  {
    id: 'scrap2',
    title: 'Rust vs Go - バックエンド開発での選択基準',
    author: {
      username: 'backenddev',
      name: '高橋健太',
      avatar: '/images/avatar-placeholder.svg'
    },
    publishedAt: '2025-01-14T09:00:00Z',
    updatedAt: '2025-01-14T09:00:00Z',
    commentsCount: 15,
    isOpen: false,
    emoji: '🤔',
    excerpt: 'RustとGoのどちらを選ぶべきか。パフォーマンス、開発効率、エコシステムの観点から比較...'
  },
  {
    id: 'scrap3',
    title: 'Dockerコンテナのベストプラクティス',
    author: {
      username: 'devops',
      name: '伊藤美咲',
      avatar: '/images/avatar-placeholder.svg'
    },
    publishedAt: '2025-01-12T14:00:00Z',
    updatedAt: '2025-01-13T10:00:00Z',
    commentsCount: 23,
    isOpen: true,
    emoji: '🐳',
    excerpt: '本番環境でDockerを運用して学んだベストプラクティスをまとめました...'
  }
]

const popularTags = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js',
  'Python', 'Go', 'Rust', 'Docker', 'AWS', 'Git', 'Linux'
]

export default function ExplorePage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const ArticlesContent = (
    <>
      {/* フィルタとソート */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">タグで絞り込み</h3>
          <select 
            className="px-4 py-2 border rounded-lg"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular')}
          >
            <option value="latest">最新順</option>
            <option value="popular">人気順</option>
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          {popularTags.map(tag => (
            <Chip
              key={tag}
              selected={selectedTag === tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </div>
      
      {/* 記事一覧 */}
      <div className="card-grid">
        {allArticles.map(article => (
          <ArticleCard key={article.id} {...article} />
        ))}
      </div>
    </>
  )

  const BooksContent = (
    <>
      {/* フィルタ */}
      <div className="mb-6">
        <div className="flex gap-4">
          <button className="btn btn--secondary">すべて</button>
          <button className="btn btn--ghost">無料のみ</button>
          <button className="btn btn--ghost">有料のみ</button>
        </div>
      </div>
      
      {/* 書籍一覧 */}
      <div className="card-grid">
        {allBooks.map(book => (
          <BookCard key={book.id} {...book} />
        ))}
      </div>
    </>
  )

  const ScrapsContent = (
    <>
      {/* フィルタ */}
      <div className="mb-6">
        <div className="flex gap-4">
          <button className="btn btn--secondary">すべて</button>
          <button className="btn btn--ghost">Open</button>
          <button className="btn btn--ghost">Closed</button>
        </div>
      </div>
      
      {/* スクラップ一覧 */}
      <div className="card-grid">
        {allScraps.map(scrap => (
          <ScrapCard key={scrap.id} {...scrap} />
        ))}
      </div>
    </>
  )

  const tabs = [
    { key: 'articles', label: '記事', content: ArticlesContent },
    { key: 'books', label: '本', content: BooksContent },
    { key: 'scraps', label: 'スクラップ', content: ScrapsContent },
  ]

  return (
    <PageProvider title="Explore" description="すべてのコンテンツを探索">
      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🔍 Explore</h1>
            <p className="text-gray-600">
              記事、本、スクラップから興味深いコンテンツを発見しよう
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 lg:hidden"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              フィルター
            </Button>
            
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-2 rounded ${
                  viewMode === 'compact' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* サブナビゲーション */}
        <div className="flex gap-6 mb-8 border-b">
          <Link href="/explore/articles" className="pb-3 font-medium text-primary border-b-2 border-primary">
            For you
          </Link>
          <Link href="/explore/tech" className="pb-3 font-medium text-muted hover:text-fg">
            Tech
          </Link>
          <Link href="/explore/ideas" className="pb-3 font-medium text-muted hover:text-fg">
            Ideas
          </Link>
          <Link href="/explore/books" className="pb-3 font-medium text-muted hover:text-fg">
            Books
          </Link>
          <Link href="/explore/scraps" className="pb-3 font-medium text-muted hover:text-fg">
            Scraps
          </Link>
        </div>
        
        {/* メインコンテンツ */}
        <Tabs tabs={tabs} defaultTab="articles" />
      </main>
    </PageProvider>
  )
}