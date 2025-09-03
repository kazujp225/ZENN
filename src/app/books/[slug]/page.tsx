import { BookLayout } from '@/components/book/BookLayout'

// サンプルデータ（実際はAPIから取得）
const getBook = (slug: string) => {
  return {
    id: slug,
    title: 'ゼロから学ぶReact & Next.js - モダンフロントエンド開発の実践ガイド',
    coverImage: '/images/placeholder.svg',
    author: {
      username: 'reactmaster',
      name: '田中太郎',
      avatar: '/images/avatar-placeholder.svg',
      bio: 'フロントエンドエンジニア。React/Next.jsを中心にWeb開発をしています。著書多数。',
      followersCount: 2456
    },
    price: 2500 as number,
    originalPrice: 3000,
    likes: 456,
    publishedAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    description: 'React初心者からNext.jsマスターまで、段階的に学べる実践的な教科書。実際のプロダクト開発で使える知識とテクニックを豊富なサンプルコードと共に解説します。',
    features: [
      'React 18の最新機能を網羅',
      'Next.js 14 App Routerの完全解説',
      'TypeScriptによる型安全な開発',
      '実践的なプロジェクト構築',
      'テスト駆動開発の実践'
    ],
    chapters: [
      { id: '1', title: '第1章 React入門', free: true, pages: 32 },
      { id: '2', title: '第2章 コンポーネント設計', free: true, pages: 48 },
      { id: '3', title: '第3章 状態管理', free: false, pages: 56 },
      { id: '4', title: '第4章 Next.js基礎', free: false, pages: 64 },
      { id: '5', title: '第5章 App Router詳解', free: false, pages: 72 },
      { id: '6', title: '第6章 データフェッチング', free: false, pages: 52 },
      { id: '7', title: '第7章 認証とセキュリティ', free: false, pages: 44 },
      { id: '8', title: '第8章 パフォーマンス最適化', free: false, pages: 38 },
      { id: '9', title: '第9章 テスト戦略', free: false, pages: 42 },
      { id: '10', title: '第10章 本番デプロイ', free: false, pages: 36 }
    ],
    totalPages: 484,
    format: 'digital',
    language: 'ja',
    isbn: '978-4-123456-78-9',
    tags: ['React', 'Next.js', 'TypeScript', 'Web開発', 'フロントエンド'],
    reviews: [
      {
        id: '1',
        user: {
          name: '佐藤花子',
          avatar: '/images/avatar-placeholder.svg'
        },
        rating: 5,
        comment: '初心者にもわかりやすく、実践的な内容でとても良かったです。特にApp Routerの解説が詳しくて、実際のプロジェクトですぐに活用できました。',
        date: '2025-01-12T10:00:00Z'
      },
      {
        id: '2',
        user: {
          name: '鈴木一郎',
          avatar: '/images/avatar-placeholder.svg'
        },
        rating: 4,
        comment: 'Next.jsの部分が特に詳しくて参考になりました。TypeScriptとの組み合わせ方も丁寧に解説されていて良かったです。',
        date: '2025-01-13T10:00:00Z'
      },
      {
        id: '3',
        user: {
          name: '山田太郎',
          avatar: '/images/avatar-placeholder.svg'
        },
        rating: 5,
        comment: '実践的なサンプルコードが豊富で、実際の開発に即座に応用できる内容でした。',
        date: '2025-01-14T10:00:00Z'
      },
      {
        id: '4',
        user: {
          name: '高橋花子',
          avatar: '/images/avatar-placeholder.svg'
        },
        rating: 4,
        comment: 'テスト戦略の章が特に参考になりました。実務で使えるテクニックが満載です。',
        date: '2025-01-15T10:00:00Z'
      },
      {
        id: '5',
        user: {
          name: '田中次郎',
          avatar: '/images/avatar-placeholder.svg'
        },
        rating: 5,
        comment: '著者の経験に基づいた実践的なアドバイスが随所にあり、非常に勉強になりました。',
        date: '2025-01-16T10:00:00Z'
      }
    ],
    reviewsCount: 23,
    averageRating: 4.6
  }
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const book = getBook(slug)
  
  return <BookLayout book={book} />
}