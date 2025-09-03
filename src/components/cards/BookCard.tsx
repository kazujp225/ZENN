import Link from 'next/link'
import Image from 'next/image'

interface BookCardProps {
  id: string
  title: string
  coverImage?: string
  author: {
    username: string
    name: string
    avatar: string
  }
  price: number | 'free'
  likes: number
  publishedAt: string
  description?: string
}

export const BookCard = ({
  id,
  title,
  coverImage,
  author,
  price,
  likes,
  publishedAt,
  description
}: BookCardProps) => {
  // author のバリデーション
  if (!author || !author.username) {
    console.warn('BookCard: Invalid author data', { id, title, author })
    return null
  }
  const formatPrice = (price: number | 'free') => {
    if (price === 'free') return '無料'
    return `¥${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <article className="card">
      <Link href={`/books/${id}`}>
        <div className="card__cover relative">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-light">
              <span className="text-6xl">📚</span>
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            <span className={`badge ${price === 'free' ? 'badge--open' : 'badge--closed'}`}>
              {formatPrice(price)}
            </span>
          </div>
        </div>
      </Link>
      
      <div className="card__body">
        <h3 className="card__title">
          <Link href={`/books/${id}`}>
            {title}
          </Link>
        </h3>
        
        {description && (
          <p className="text-sm text-muted mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="card__meta">
          <Link href={`/@${author.username}`} className="flex items-center gap-2">
            <Image
              src={author.avatar}
              alt={author.name}
              width={24}
              height={24}
              className="avatar avatar--small"
            />
            <span className="text-sm">{author.name}</span>
          </Link>
          
          {likes > 0 && (
            <span className="flex items-center gap-1 text-xs">
              ❤️ {likes}
            </span>
          )}
          
          <time dateTime={publishedAt} className="text-xs">
            {formatDate(publishedAt)}
          </time>
        </div>
      </div>
    </article>
  )
}