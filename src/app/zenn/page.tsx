import Link from 'next/link'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import { ScrapCard } from '@/components/cards/ScrapCard'

// サンプルデータ
const trendingArticles = [
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

const ideaArticles = [
  {
    id: '4',
    title: 'エンジニアのキャリア戦略 - 市場価値を高める5つの方法',
    emoji: '💡',
    author: {
      username: 'careercoach',
      name: '山田次郎',
      avatar: '/images/avatar-placeholder.svg'
    },
    publishedAt: '2025-01-12T14:00:00Z',
    likes: 312,
    comments: 24,
    type: 'idea' as const,
    tags: ['Career', 'Skills']
  },
  {
    id: '5',
    title: 'リモートワークで生産性を2倍にする環境構築',
    emoji: '🏠',
    author: {
      username: 'remoteworker',
      name: '高橋美咲',
      avatar: '/images/avatar-placeholder.svg'
    },
    publishedAt: '2025-01-11T11:00:00Z',
    likes: 278,
    comments: 19,
    type: 'idea' as const,
    tags: ['Remote', 'Productivity']
  }
]

const featuredBooks = [
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
  }
]

const recentScraps = [
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
  }
]

export default function ZennPage() {
  return (
    <main className="container py-8">
      {/* イベントバナー */}
      <section className="mb-8 p-6 bg-gray rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">🎉 Zennfes 2025 開催決定！</h2>
            <p className="text-muted">
              エンジニアのための技術カンファレンス。2025年3月15日オンライン開催
            </p>
          </div>
          <Link href="/events/zennfes2025" className="btn btn--primary">
            詳細を見る
          </Link>
        </div>
      </section>

      {/* Tech記事セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📘 Tech</h2>
          <Link href="/trending/tech" className="text-primary hover:underline">
            トレンドをもっと見る →
          </Link>
        </div>
        
        <div className="card-grid">
          {trendingArticles.map(article => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </section>

      {/* Ideas記事セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">💡 Ideas</h2>
          <Link href="/trending/ideas" className="text-primary hover:underline">
            トレンドをもっと見る →
          </Link>
        </div>
        
        <div className="card-grid">
          {ideaArticles.map(article => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </section>

      {/* 書籍セクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📚 Books</h2>
          <Link href="/books" className="text-primary hover:underline">
            すべての本を見る →
          </Link>
        </div>
        
        <div className="card-grid">
          {featuredBooks.map(book => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      </section>

      {/* スクラップセクション */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">💭 Scraps</h2>
          <Link href="/scraps" className="text-primary hover:underline">
            すべてのスクラップを見る →
          </Link>
        </div>
        
        <div className="card-grid">
          {recentScraps.map(scrap => (
            <ScrapCard key={scrap.id} {...scrap} />
          ))}
        </div>
      </section>

      {/* CTAセクション */}
      <section className="text-center py-12 border-t">
        <h2 className="text-3xl font-bold mb-4">
          知識を共有しよう
        </h2>
        <p className="text-lg text-muted mb-8">
          エンジニアのための知識共有プラットフォームで、あなたの経験を共有してみませんか？
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="btn btn--primary">
            無料で始める
          </Link>
          <Link href="/about" className="btn btn--secondary">
            詳しく見る
          </Link>
        </div>
      </section>
    </main>
  )
}