import { EnhancedArticleLayout } from '@/components/article/EnhancedArticleLayout'
import type { Article } from '@/types/article'

// サンプルデータ（実際はAPIから取得）
const getArticle = (slug: string): Article => {
  return {
    id: slug,
    title: 'Next.js 14の新機能まとめ - App Routerの進化と最新のベストプラクティス',
    emoji: '🚀',
    author: {
      username: 'developer1',
      name: '田中太郎',
      avatar: '/images/avatar-placeholder.svg',
      bio: 'フロントエンドエンジニア。React/Next.jsを中心にWeb開発をしています。',
      followersCount: 1234,
      articles: [
        { id: '2', title: 'React Server Components完全理解', emoji: '⚛️', likes: 145 },
        { id: '3', title: 'TypeScript 5.0の新機能', emoji: '📘', likes: 234 }
      ]
    },
    publishedAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-16T14:30:00Z',
    readingTime: '8分',
    likes: 234,
    type: 'tech',
    tags: ['Next.js', 'React', 'TypeScript', 'Web開発'],
    content: `# はじめに

Next.js 14がリリースされ、App Routerがさらに進化しました。本記事では、Next.js 14の新機能と、実際のプロジェクトで使えるベストプラクティスについて解説します。

## Partial Prerendering (PPR)

Partial Prerenderingは、静的レンダリングと動的レンダリングを組み合わせた新しいレンダリング手法です。

\`\`\`tsx
// app/page.tsx
export const experimental_ppr = true

export default async function Page() {
  // 静的にレンダリングされる部分
  const staticContent = <StaticComponent />
  
  // 動的にレンダリングされる部分
  const dynamicContent = <Suspense fallback={<Loading />}>
    <DynamicComponent />
  </Suspense>
  
  return (
    <div>
      {staticContent}
      {dynamicContent}
    </div>
  )
}
\`\`\`

### PPRのメリット

- **初期表示の高速化**: 静的部分が即座に表示される
- **SEOの改善**: 静的コンテンツが事前レンダリングされる
- **動的データの鮮度**: 動的部分は常に最新のデータを表示

## Server Actions の安定化

Server Actionsが安定版となり、フォーム処理がさらに簡単になりました。

\`\`\`tsx
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  const content = formData.get('content')
  
  await db.post.create({
    data: { title, content }
  })
  
  revalidatePath('/posts')
  redirect('/posts')
}
\`\`\`

## Turbopack の改善

開発サーバーの起動速度が大幅に改善されました。

| ビルドツール | 起動時間 | HMR速度 |
|------------|---------|---------|
| Webpack    | 3.2s    | 340ms   |
| Turbopack  | 1.1s    | 120ms   |

## メタデータAPIの強化

動的なメタデータ生成がより柔軟になりました。

\`\`\`tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.id)
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.ogImage],
    },
  }
}
\`\`\`

## パフォーマンス最適化のベストプラクティス

### 画像最適化

Next.jsのImageコンポーネントを使用することで、自動的に画像が最適化されます。

\`\`\`tsx
import Image from 'next/image'

export default function Gallery() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  )
}
\`\`\`

### コード分割

動的インポートを使用して、必要な時だけコンポーネントを読み込むことができます。

\`\`\`tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
})
\`\`\`

## まとめ

Next.js 14は、開発体験とパフォーマンスの両面で大幅な改善をもたらしました。特にPPRとServer Actionsの組み合わせにより、より高速でインタラクティブなWebアプリケーションの構築が可能になりました。

これらの新機能を活用することで、ユーザー体験の向上と開発効率の改善を同時に実現できます。`,
    toc: [
      { id: 'はじめに', title: 'はじめに', level: 1 },
      { id: 'partial-prerendering-ppr', title: 'Partial Prerendering (PPR)', level: 2 },
      { id: 'pprのメリット', title: 'PPRのメリット', level: 3 },
      { id: 'server-actions-の安定化', title: 'Server Actions の安定化', level: 2 },
      { id: 'turbopack-の改善', title: 'Turbopack の改善', level: 2 },
      { id: 'メタデータapiの強化', title: 'メタデータAPIの強化', level: 2 },
      { id: 'パフォーマンス最適化のベストプラクティス', title: 'パフォーマンス最適化のベストプラクティス', level: 2 },
      { id: '画像最適化', title: '画像最適化', level: 3 },
      { id: 'コード分割', title: 'コード分割', level: 3 },
      { id: 'まとめ', title: 'まとめ', level: 2 }
    ],
    relatedArticles: [
      {
        id: '2',
        title: 'React 19の新機能と変更点まとめ',
        emoji: '⚛️',
        author: { name: '佐藤花子', username: 'sato' },
        likes: 156,
        publishedAt: '2025-01-14T10:00:00Z'
      },
      {
        id: '3',
        title: 'TypeScript 5.0完全ガイド',
        emoji: '📘',
        author: { name: '鈴木一郎', username: 'suzuki' },
        likes: 189,
        publishedAt: '2025-01-13T10:00:00Z'
      },
      {
        id: '4',
        title: 'Tailwind CSS v4の新機能',
        emoji: '🎨',
        author: { name: '山田花子', username: 'yamada' },
        likes: 98,
        publishedAt: '2025-01-12T10:00:00Z'
      }
    ],
    comments: [
      {
        id: '1',
        author: {
          username: 'user1',
          name: 'ユーザー1',
          avatar: '/images/avatar-placeholder.svg'
        },
        content: 'とても参考になりました！PPRの実装例が具体的でわかりやすかったです。',
        publishedAt: '2025-01-16T10:00:00Z',
        likes: 12,
        isLiked: false,
        replies: [
          {
            id: '2',
            author: {
              username: 'developer1',
              name: '田中太郎',
              avatar: '/images/avatar-placeholder.svg'
            },
            content: 'ありがとうございます！PPRは実際のプロジェクトでも効果的ですよ。',
            publishedAt: '2025-01-16T11:00:00Z',
            likes: 3,
            isLiked: true
          }
        ]
      },
      {
        id: '3',
        author: {
          username: 'user2',
          name: 'ユーザー2',
          avatar: '/images/avatar-placeholder.svg'
        },
        content: 'Server Actionsの使い方がやっと理解できました。実装してみます！',
        publishedAt: '2025-01-16T12:00:00Z',
        likes: 8,
        isLiked: false,
        replies: []
      }
    ]
  }
}

export default async function ArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const article = getArticle(slug)
  
  return <EnhancedArticleLayout article={article} />
}