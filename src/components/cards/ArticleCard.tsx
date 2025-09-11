import Link from 'next/link'
import Image from 'next/image'

interface ArticleCardProps {
  id: string
  title: string
  emoji?: string
  author: {
    username: string
    name: string
    avatar: string
  }
  publishedAt: string
  likes: number
  comments: number
  type?: 'tech' | 'idea'
  tags?: string[]
}

export const ArticleCard = ({
  id,
  title,
  emoji,
  author,
  publishedAt,
  likes,
  comments,
  type = 'tech',
  tags = []
}: ArticleCardProps) => {
  // author のバリデーション
  if (!author || !author.username) {
    // 警告ログ削除（セキュリティ対応）
    return null
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return '今日'
    if (diffInDays === 1) return '昨日'
    if (diffInDays < 7) return `${diffInDays}日前`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}週間前`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}ヶ月前`
    return `${Math.floor(diffInDays / 365)}年前`
  }

  return (
    <article className="card">
      <Link href={`/articles/${id}`}>
        <div className="card__cover flex items-center justify-center text-6xl">
          {emoji || '📝'}
        </div>
      </Link>
      
      <div className="card__body">
        <h3 className="card__title">
          <Link href={`/articles/${id}`}>
            {title}
          </Link>
        </h3>
        
        {tags.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {tags.slice(0, 3).map(tag => (
              <Link key={tag} href={`/topics/${tag}`} className="chip">
                {tag}
              </Link>
            ))}
          </div>
        )}
        
        <div className="card__meta">
          <Link href={`/${author.username}`} className="flex items-center gap-2">
            <Image
              src={author.avatar}
              alt={author.name}
              width={24}
              height={24}
              className="avatar avatar--small"
            />
            <span className="text-sm">{author.name}</span>
          </Link>
          
          <time dateTime={publishedAt} className="text-xs">
            {formatDate(publishedAt)}
          </time>
          
          {likes > 0 && (
            <span className="flex items-center gap-1 text-xs">
              ❤️ {likes}
            </span>
          )}
          
          {comments > 0 && (
            <span className="flex items-center gap-1 text-xs">
              💬 {comments}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}