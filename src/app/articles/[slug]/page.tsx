import { EnhancedArticleLayout } from '@/components/article/EnhancedArticleLayout'
import { articlesApi, commentsApi } from '@/lib/api'
import type { Article } from '@/types/article'

async function getArticle(slug: string): Promise<Article | null> {
  try {
    console.log('getArticle: Fetching article with slug:', slug)
    const articleResponse: any = await articlesApi.getArticleBySlug(slug)
    console.log('getArticle: Response:', articleResponse)
    
    if (!articleResponse || !articleResponse.data) {
      console.log('getArticle: No article data found')
      return null
    }
    
    const data = articleResponse.data

    // Get comments for the article
    let comments: any[] = []
    try {
      comments = await commentsApi.getArticleComments(data.id) || []
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    }
    
    // Get related articles
    const { data: relatedArticles } = await articlesApi.getPublishedArticles(3, 0)
    
    // Transform to Article type for the component
    const article: Article = {
      id: data.id,
      title: data.title,
      emoji: data.emoji || '📝',
      author: {
        username: data.user?.username || 'unknown',
        name: data.user?.display_name || data.user?.username || 'Unknown',
        avatar: data.user?.avatar_url || '/images/avatar-placeholder.svg',
        bio: data.user?.bio || '',
        followersCount: Math.floor(Math.random() * 1000),
        articles: []
      },
      publishedAt: data.published_at || data.created_at,
      updatedAt: data.updated_at,
      readingTime: `${Math.ceil(data.content.length / 500)}分`,
      likes: data.likes_count,
      type: data.type as 'tech' | 'idea',
      tags: data.topics || [],
      content: data.content,
      toc: extractTOC(data.content),
      relatedArticles: relatedArticles?.filter((a: any) => a.id !== data.id).slice(0, 3).map((a: any) => ({
        id: a.id,
        title: a.title,
        emoji: a.emoji || '📝',
        author: { 
          name: a.user?.display_name || a.user?.username || 'Unknown', 
          username: a.user?.username || 'unknown' 
        },
        likes: a.likes_count,
        publishedAt: a.published_at || a.created_at
      })) || [],
      comments: comments?.map((c: any) => ({
        id: c.id,
        author: {
          username: c.user?.username || 'unknown',
          name: c.user?.display_name || c.user?.username || 'Unknown',
          avatar: c.user?.avatar_url || '/images/avatar-placeholder.svg'
        },
        content: c.content,
        publishedAt: c.created_at,
        likes: Math.floor(Math.random() * 20),
        isLiked: false,
        replies: []
      })) || []
    }
    
    return article
  } catch (error) {
    console.error('記事取得エラー:', error)
    return null
  }
}

function extractTOC(content: string) {
  const headings: { id: string; title: string; level: number }[] = []
  const lines = content.split('\n')
  
  lines.forEach(line => {
    const match = line.match(/^(#{1,3})\s+(.+)/)
    if (match) {
      const level = match[1].length
      const title = match[2]
      const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      headings.push({ id, title, level })
    }
  })
  
  return headings
}

export default async function ArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  console.log('ArticlePage: Loading article with slug:', slug)
  
  const article = await getArticle(slug)
  console.log('ArticlePage: Article data:', article ? 'Found' : 'Not found')
  
  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">記事が見つかりません</h1>
            <p className="text-gray-600">指定された記事は存在しないか、削除された可能性があります。</p>
          </div>
        </div>
      </div>
    )
  }
  
  // デバッグ用：シンプルな表示に変更
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <p className="text-gray-600 mb-8">著者: {article.author.name}</p>
        <div className="prose prose-lg max-w-none">
          <pre className="whitespace-pre-wrap">{article.content}</pre>
        </div>
      </div>
    </div>
  )
  // return <EnhancedArticleLayout article={article} />
}