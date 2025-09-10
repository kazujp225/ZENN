import { ScrapLayout } from '@/components/scrap/ScrapLayout'
import { scrapsApi } from '@/lib/api'

async function getScrap(idOrSlug: string) {
  try {
    // Try to get by slug first, then by ID if it's a valid UUID
    let data
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    
    if (isUuid) {
      try {
        const result = await scrapsApi.getScrapById(idOrSlug)
        data = result?.data || result
      } catch (e) {
        console.error('Failed to get scrap by ID:', e)
        return null
      }
    } else {
      // Assume it's a slug
      try {
        data = await scrapsApi.getScrapBySlug(idOrSlug)
      } catch (e) {
        console.error('Failed to get scrap by slug:', e)
        return null
      }
    }
    
    if (!data) return null
    
    // Use comments from the scrap data itself
    const comments = data.comments || []
    
    // Map comments to posts format expected by ScrapLayout
    const posts = comments.map(c => ({
      id: c.id,
      author: {
        username: c.user?.username || 'unknown',
        name: c.user?.display_name || c.user?.username || 'Unknown',
        avatar: c.user?.avatar_url || '/images/avatar-placeholder.svg'
      },
      content: c.content,
      createdAt: c.created_at,
      likes: Math.floor(Math.random() * 20),
      isLiked: false,
      replies: []
    })) || []
    
    // Add initial post if there's content
    if (data.content) {
      posts.unshift({
        id: 'initial',
        author: {
          username: data.user?.username || 'unknown',
          name: data.user?.display_name || data.user?.username || 'Unknown',
          avatar: data.user?.avatar_url || '/images/avatar-placeholder.svg'
        },
        content: data.content,
        createdAt: data.created_at,
        likes: 0,
        isLiked: false,
        replies: []
      })
    }
    
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
      isOpen: !data.closed,
      publishedAt: data.created_at,
      updatedAt: data.updated_at,
      commentsCount: data.comments_count,
      tags: data.topics || [],
      participants: Math.max(1, Math.floor(data.comments_count / 3)),
      posts: posts
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
