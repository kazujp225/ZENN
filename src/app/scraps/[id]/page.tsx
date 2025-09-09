import { ScrapLayout } from '@/components/scrap/ScrapLayout'
import { scrapsApi, commentsApi } from '@/lib/api'

async function getScrap(id: string) {
  try {
    const { data } = await scrapsApi.getScrapById(id)
    if (!data) return null
    
    const { data: comments } = await commentsApi.getCommentsByScrap(id, 50, 0)
    
    return {
      id: data.id,
      title: data.title,
      emoji: data.emoji || '💭',
      author: {
        username: data.user?.username || 'unknown',
        name: data.user?.display_name || data.user?.username || 'Unknown',
        avatar: data.user?.avatar_url || '/images/avatar-placeholder.svg',
        bio: data.user?.bio || ''
      },
      content: data.content,
      isOpen: !data.closed,
      publishedAt: data.created_at,
      updatedAt: data.updated_at,
      commentsCount: data.comments_count,
      tags: data.topics || [],
      participants: Math.max(1, Math.floor(data.comments_count / 3)),
      comments: comments?.map(c => ({
        id: c.id,
        author: {
          username: c.user?.username || 'unknown',
          name: c.user?.display_name || c.user?.username || 'Unknown',
          avatar: c.user?.avatar_url || '/images/avatar-placeholder.svg'
        },
        content: c.content,
        publishedAt: c.created_at,
        likes: Math.floor(Math.random() * 20),
        replies: []
      })) || []
    }
  } catch (error) {
    console.error('スクラップ取得エラー:', error)
    return null
  }
}

export default async function ScrapPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const scrap = await getScrap(id)
  
  if (!scrap) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">スクラップが見つかりません</h1>
            <p className="text-gray-600">指定されたスクラップは存在しないか、削除された可能性があります。</p>
          </div>
        </div>
      </div>
    )
  }
  
  return <ScrapLayout scrap={scrap} />
}
