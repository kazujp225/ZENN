'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { BookCard } from '@/components/cards/BookCard'
import { ScrapCard } from '@/components/cards/ScrapCard'
import { usersApi, articlesApi, booksApi, scrapsApi } from '@/lib/api'
import '@/styles/pages/profile.css'

export default function ProfilePageClient({ username }: { username: string }) {
  const [activeTab, setActiveTab] = useState('articles')
  const [isFollowing, setIsFollowing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState<any>({
    articles: [],
    books: [],
    scraps: [],
    liked: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [username])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const cleanUsername = username.replace('@', '')
      console.log('=== PROFILE PAGE DEBUG ===')
      console.log('1. URL username:', username)
      console.log('2. Clean username:', cleanUsername)
      
      // まずデータベース内の全ユーザーを確認
      try {
        const allUsersResponse = await fetch('/api/users')
        const allUsersData = await allUsersResponse.json()
        console.log('3. All users in database:', allUsersData.data?.map(u => ({ id: u.id, username: u.username })))
      } catch (e) {
        console.log('3. Failed to fetch all users:', e)
      }
      
      // ユーザー情報を取得
      console.log('4. Attempting to fetch user by username:', cleanUsername)
      const userResult = await usersApi.getUserByUsername(cleanUsername)
      console.log('5. getUserByUsername result:', userResult)
      
      if (!userResult.data) {
        console.log('6. User not found. Error:', userResult.error)
        console.log('7. Setting error state and returning')
        setError(`ユーザーが見つかりません: ${cleanUsername}`)
        setLoading(false)
        return
      }
      
      console.log('8. User found successfully:', userResult.data)

      const userData = userResult.data

      // ユーザーのコンテンツを取得
      const [articlesRes, booksRes, scrapsRes] = await Promise.all([
        articlesApi.getArticlesByUser(userData.id, 20, 0),
        booksApi.getBooksByUser(userData.id, 20, 0),
        scrapsApi.getScrapsByUser(userData.id, 20, 0)
      ])

      // ユーザー情報を整形
      const userInfo = {
        username: userData.username,
        name: userData.display_name || userData.username,
        avatar: userData.avatar_url || '/images/avatar-placeholder.svg',
        bio: userData.bio || '',
        location: '',  // Not in database
        company: '',   // Not in database
        position: '',  // Not in database
        website: userData.website_url || '',
        twitter: userData.twitter_username || '',
        github: userData.github_username || '',
        zenn: userData.username,
        followersCount: 0,  // Will need to query separately
        followingCount: 0,  // Will need to query separately
        articlesCount: Array.isArray(articlesRes?.data) ? articlesRes.data.length : 0,
        booksCount: Array.isArray(booksRes?.data) ? booksRes.data.length : 0,
        scrapsCount: Array.isArray(scrapsRes?.data) ? scrapsRes.data.length : 0,
        joinedAt: userData.created_at,
        isVerified: false,  // Not in database
        badges: [],
        skills: [],  // Not in database
        recentActivity: []
      }

      // コンテンツを整形
      const userContent = {
        articles: (Array.isArray(articlesRes?.data) ? articlesRes.data : []).map((article: any) => ({
          id: article.id,
          title: article.title,
          emoji: article.emoji || '📝',
          slug: article.slug,
          author: {
            username: userData.username,
            name: userData.display_name || userData.username,
            avatar: userData.avatar_url || '/images/avatar-placeholder.svg'
          },
          excerpt: article.content.substring(0, 150) + '...',
          publishedAt: article.published_at || article.created_at,
          readTime: `${Math.ceil(article.content.length / 500)}分`,
          likes: article.likes_count,
          comments: article.comments_count,
          type: article.type as 'tech' | 'idea',
          tags: article.topics || []
        })),
        books: (Array.isArray(booksRes?.data) ? booksRes.data : []).map((book: any) => ({
          id: book.id,
          title: book.title,
          slug: book.slug,
          coverImage: book.cover_image_url || '/images/placeholder.svg',
          author: {
            username: userData.username,
            name: userData.display_name || userData.username,
            avatar: userData.avatar_url || '/images/avatar-placeholder.svg'
          },
          price: book.price || 0,
          likes: book.likes_count,
          publishedAt: book.published_at || book.created_at,
          description: book.description || '',
          chapters: book.chapters_count || 0,
          pages: book.total_pages || 0
        })),
        scraps: (Array.isArray(scrapsRes?.data) ? scrapsRes.data : []).map((scrap: any) => ({
          id: scrap.id,
          title: scrap.title,
          author: {
            username: userData.username,
            name: userData.display_name || userData.username,
            avatar: userData.avatar_url || '/images/avatar-placeholder.svg'
          },
          publishedAt: scrap.created_at,
          updatedAt: scrap.updated_at,
          commentsCount: scrap.comments_count,
          isOpen: !scrap.closed,
          emoji: scrap.emoji || '💭',
          excerpt: (scrap.content || '').substring(0, 150) + '...'
        })),
        liked: [] // いいねした記事（後で実装）
      }

      setUser(userInfo)
      setContent(userContent)
    } catch (err: any) {
      console.error('ユーザーデータ取得エラー:', err)
      setError(err.message || 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="profile-page">
        <div className="container py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ユーザーが見つかりません</h1>
            <p className="text-gray-600">{error || '指定されたユーザーは存在しません。'}</p>
          </div>
        </div>
      </div>
    )
  }
  
  const tabs = [
    { id: 'articles', label: '記事', count: content.articles.length, icon: '📝' },
    { id: 'books', label: '本', count: content.books.length, icon: '📚' },
    { id: 'scraps', label: 'スクラップ', count: content.scraps.length, icon: '💭' },
    { id: 'liked', label: 'いいね', count: content.liked.length, icon: '❤️' }
  ]
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'article': return '📝'
      case 'book': return '📚'
      case 'scrap': return '💭'
      case 'like': return '❤️'
      default: return '📌'
    }
  }
  
  return (
    <div className="profile-page">
      <div className="container py-8">
        <div className="max-w-7xl mx-auto">
          {/* プロフィールヘッダー */}
          <div className="profile-header">
            {/* カバー画像 */}
            <div className="profile-header__cover"></div>
            
            <div className="profile-header__content">
              {/* アバター */}
              <div className="profile-header__avatar-wrapper">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="profile-header__avatar"
                />
              </div>
              
              {/* アクションボタン */}
              <div className="profile-header__actions">
                {isFollowing ? (
                  <button 
                    className="profile-header__button profile-header__button--following"
                    onClick={() => setIsFollowing(false)}
                  >
                    フォロー中
                  </button>
                ) : (
                  <button 
                    className="profile-header__button profile-header__button--follow"
                    onClick={() => setIsFollowing(true)}
                  >
                    フォロー
                  </button>
                )}
                <button className="profile-header__button profile-header__button--message">
                  メッセージ
                </button>
              </div>
              
              {/* プロフィール情報 */}
              <div className="profile-header__info">
                <h1 className="profile-header__name">
                  {user.name}
                  {user.isVerified && (
                    <span className="profile-header__verified">✓</span>
                  )}
                </h1>
                <p className="profile-header__username">@{user.username}</p>
                
                <p className="profile-header__bio">{user.bio}</p>
                
                {/* メタ情報 */}
                <div className="profile-header__meta">
                  {user.position && user.company && (
                    <span className="profile-header__meta-item">
                      <svg className="profile-header__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A8.997 8.997 0 0112 21a8.997 8.997 0 01-9-7.745V4h18v9.255z" />
                      </svg>
                      {user.position} at {user.company}
                    </span>
                  )}
                  {user.location && (
                    <span className="profile-header__meta-item">
                      <svg className="profile-header__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {user.location}
                    </span>
                  )}
                  {user.website && (
                    <a href={user.website} className="profile-header__meta-item" target="_blank" rel="noopener noreferrer">
                      <svg className="profile-header__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Website
                    </a>
                  )}
                  {user.github && (
                    <a href={`https://github.com/${user.github}`} className="profile-header__meta-item" target="_blank" rel="noopener noreferrer">
                      <svg className="profile-header__meta-icon" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                      {user.github}
                    </a>
                  )}
                  {user.twitter && (
                    <a href={`https://twitter.com/${user.twitter}`} className="profile-header__meta-item" target="_blank" rel="noopener noreferrer">
                      <svg className="profile-header__meta-icon" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      @{user.twitter}
                    </a>
                  )}
                </div>
                
                {/* 統計 */}
                <div className="profile-header__stats">
                  <div className="profile-header__stat">
                    <span className="profile-header__stat-value">{user.followersCount.toLocaleString()}</span>
                    <span className="profile-header__stat-label">フォロワー</span>
                  </div>
                  <div className="profile-header__stat">
                    <span className="profile-header__stat-value">{user.followingCount.toLocaleString()}</span>
                    <span className="profile-header__stat-label">フォロー中</span>
                  </div>
                  <div className="profile-header__stat">
                    <span className="profile-header__stat-value">{user.articlesCount}</span>
                    <span className="profile-header__stat-label">記事</span>
                  </div>
                  <div className="profile-header__stat">
                    <span className="profile-header__stat-value">{user.booksCount}</span>
                    <span className="profile-header__stat-label">本</span>
                  </div>
                  <div className="profile-header__stat">
                    <span className="profile-header__stat-value">{user.scrapsCount}</span>
                    <span className="profile-header__stat-label">スクラップ</span>
                  </div>
                </div>
                
                {/* バッジ */}
                {user.badges.length > 0 && (
                  <div className="profile-header__badges">
                    {user.badges.map((badge: any) => (
                      <div 
                        key={badge.id}
                        className="profile-badge"
                        title={badge.description}
                      >
                        <span className="profile-badge__icon">{badge.icon}</span>
                        <span>{badge.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* コンテンツタブ */}
          <div className="profile-tabs">
            <div className="profile-tabs__header">
              {tabs.map((tab: any) => (
                <button
                  key={tab.id}
                  className={`profile-tabs__tab ${activeTab === tab.id ? 'profile-tabs__tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className="profile-tabs__count">{tab.count}</span>
                </button>
              ))}
            </div>
            
            <div className="profile-tabs__content">
              {/* 記事タブ */}
              {activeTab === 'articles' && (
                <div className="profile-content-grid">
                  {content.articles.length > 0 ? (
                    content.articles.map((article: any) => (
                      <Link key={article.id} href={`/articles/${article.slug || article.id}`} className="profile-article">
                        <div className="profile-article__header">
                          <span className="profile-article__emoji">{article.emoji}</span>
                          <div className="profile-article__content">
                            <h3 className="profile-article__title">{article.title}</h3>
                            <p className="profile-article__excerpt">{article.excerpt}</p>
                            <div className="profile-article__meta">
                              <span className="profile-article__meta-item">
                                <time>{new Date(article.publishedAt).toLocaleDateString('ja-JP')}</time>
                              </span>
                              <span className="profile-article__meta-item">
                                <span>📖</span>
                                <span>{article.readTime}</span>
                              </span>
                              <span className="profile-article__meta-item">
                                <span>❤️</span>
                                <span>{article.likes}</span>
                              </span>
                              <span className="profile-article__meta-item">
                                <span>💬</span>
                                <span>{article.comments}</span>
                              </span>
                            </div>
                            <div className="profile-article__tags">
                              {article.tags.map((tag: any) => (
                                <span key={tag} className="profile-article__tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="profile-empty">
                      <div className="profile-empty__icon">📝</div>
                      <h3 className="profile-empty__title">まだ記事がありません</h3>
                      <p className="profile-empty__text">最初の記事が投稿されるのを待ちましょう</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* 本タブ */}
              {activeTab === 'books' && (
                <div className="profile-book-grid">
                  {content.books.length > 0 ? (
                    content.books.map((book: any) => (
                      <BookCard key={book.id} {...book} />
                    ))
                  ) : (
                    <div className="profile-empty">
                      <div className="profile-empty__icon">📚</div>
                      <h3 className="profile-empty__title">まだ本がありません</h3>
                      <p className="profile-empty__text">最初の本が公開されるのを待ちましょう</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* スクラップタブ */}
              {activeTab === 'scraps' && (
                <div className="profile-content-grid">
                  {content.scraps.length > 0 ? (
                    content.scraps.map((scrap: any) => (
                      <Link key={scrap.id} href={`/scraps/${scrap.id}`} className="profile-scrap">
                        <div className="profile-scrap__header">
                          <span className="profile-scrap__emoji">{scrap.emoji}</span>
                          <h3 className="profile-scrap__title">{scrap.title}</h3>
                          <span className={`profile-scrap__status ${!scrap.isOpen ? 'profile-scrap__status--closed' : ''}`}>
                            {scrap.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <p className="profile-scrap__content">{scrap.excerpt}</p>
                        <div className="profile-scrap__meta">
                          <span>{new Date(scrap.updatedAt).toLocaleDateString('ja-JP')} 更新</span>
                          <span>💬 {scrap.commentsCount} コメント</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="profile-empty">
                      <div className="profile-empty__icon">💭</div>
                      <h3 className="profile-empty__title">まだスクラップがありません</h3>
                      <p className="profile-empty__text">最初のスクラップが投稿されるのを待ちましょう</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* いいねタブ */}
              {activeTab === 'liked' && (
                <div className="profile-content-grid">
                  {content.liked.length > 0 ? (
                    content.liked.map((article: any) => (
                      <Link key={article.id} href={`/articles/${article.slug || article.id}`} className="profile-article">
                        <div className="profile-article__header">
                          <span className="profile-article__emoji">{article.emoji}</span>
                          <div className="profile-article__content">
                            <h3 className="profile-article__title">{article.title}</h3>
                            <div className="profile-article__meta">
                              <span className="profile-article__meta-item">
                                @{article.author.username}
                              </span>
                              <span className="profile-article__meta-item">
                                <time>{new Date(article.publishedAt).toLocaleDateString('ja-JP')}</time>
                              </span>
                              <span className="profile-article__meta-item">
                                <span>❤️</span>
                                <span>{article.likes}</span>
                              </span>
                            </div>
                            <div className="profile-article__tags">
                              {article.tags.map((tag: any) => (
                                <span key={tag} className="profile-article__tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="profile-empty">
                      <div className="profile-empty__icon">❤️</div>
                      <h3 className="profile-empty__title">まだいいねした記事がありません</h3>
                      <p className="profile-empty__text">気に入った記事にいいねしてみましょう</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 最近のアクティビティ */}
          <div className="profile-activity">
            <h2 className="profile-activity__title">
              <span>⚡</span>
              最近のアクティビティ
            </h2>
            <div className="profile-activity__list">
              {user.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="profile-activity__item">
                  <div className="profile-activity__icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="profile-activity__content">
                    <p className="profile-activity__text">
                      {activity.action} 「{activity.title}」
                    </p>
                    <time className="profile-activity__time">{activity.time}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}