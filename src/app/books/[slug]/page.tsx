import { BookLayout } from '@/components/book/BookLayout'
import { booksApi, chaptersApi } from '@/lib/api'

async function getBook(slug: string) {
  try {
    const bookResult: any = await booksApi.getBookBySlug(slug)
    if (!bookResult || !bookResult.data) return null
    
    const data = bookResult.data
    const { data: chapters } = await chaptersApi.getChaptersByBook(data.id, 100, 0)
    
    return {
      id: data.id,
      title: data.title,
      coverImage: data.cover_image_url || '/images/placeholder.svg',
      author: {
        username: data.user?.username || 'unknown',
        name: data.user?.display_name || data.user?.username || 'Unknown',
        avatar: data.user?.avatar_url || '/images/avatar-placeholder.svg',
        bio: data.user?.bio || '',
        followersCount: Math.floor(Math.random() * 3000)
      },
      price: data.price || 0,
      originalPrice: data.price ? data.price + 500 : 0,
      likes: data.likes_count,
      publishedAt: data.published_at || data.created_at,
      updatedAt: data.updated_at,
      description: data.description || '',
      features: [
        'React 18の最新機能を網羅',
        'Next.js 14 App Routerの完全解説',
        'TypeScriptによる型安全な開発',
        '実践的なプロジェクト構築',
        'テスト駆動開発の実践'
      ],
      chapters: chapters?.map((ch: any, idx: number) => ({
        id: ch.id,
        title: ch.title,
        free: idx < 2,
        pages: Math.floor(Math.random() * 50) + 20
      })) || [],
      totalPages: 484,
      format: 'digital',
      language: 'ja',
      isbn: '978-4-123456-78-9',
      tags: data.topics || [],
      reviews: [],
      reviewsCount: 0,
      averageRating: 0,
      relatedBooks: []
    }
  } catch (error) {
    console.error('書籍取得エラー:', error)
    return null
  }
}

export default async function BookPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const book = await getBook(slug)
  
  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">書籍が見つかりません</h1>
            <p className="text-gray-600">指定された書籍は存在しないか、削除された可能性があります。</p>
          </div>
        </div>
      </div>
    )
  }
  
  return <BookLayout book={book} />
}
