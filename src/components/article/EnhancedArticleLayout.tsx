'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { OptimizedMarkdownContent } from './OptimizedMarkdownContent'
import { CommentSection } from '../comment/CommentSection'
import { ArticleErrorBoundary, CommentErrorBoundary } from '../common/ErrorBoundary'
import { useAuth } from '@/contexts/AuthContext'
import { useBookmarks } from '@/contexts/BookmarkContext'
import type { Article, ArticleSlots } from '@/types/article'
import '@/styles/pages/article-detail.css'
import '@/styles/components/article-layout.css'
import '@/styles/components/error-boundary.css'

interface EnhancedArticleLayoutProps {
  article: Article
  slots?: ArticleSlots
}

// メモ化されたTOCコンポーネント
const TableOfContents = memo(({ 
  toc, 
  activeSection, 
  onSectionClick 
}: {
  toc: Article['toc']
  activeSection: string
  onSectionClick: (id: string) => void
}) => (
  <nav role="navigation" aria-label="目次" className="article-layout__toc-nav">
    {toc.map((item) => (
      <button
        key={item.id}
        onClick={() => onSectionClick(item.id)}
        className={`article-layout__toc-item ${
          activeSection === item.id ? 'article-layout__toc-item--active' : ''
        }`}
        style={{ paddingLeft: `${item.level * 12 + 12}px` }}
        aria-current={activeSection === item.id ? 'location' : undefined}
      >
        {item.title}
      </button>
    ))}
  </nav>
))

TableOfContents.displayName = 'TableOfContents'

// メモ化されたアクションボタンコンポーネント
const ActionButtons = memo(({
  isLiked,
  isSaved,
  likesCount,
  onLike,
  onSave
}: {
  isLiked: boolean
  isSaved: boolean
  likesCount: number
  onLike: () => void
  onSave: () => void
}) => (
  <div className="article-layout__action-buttons">
    <button 
      onClick={onLike}
      className={`article-layout__action-button article-layout__action-button--like ${
        isLiked ? 'liked' : ''
      }`}
      aria-label={isLiked ? 'いいねを取り消し' : 'いいねする'}
      aria-pressed={isLiked}
    >
      <span className="text-xl" aria-hidden="true">
        {isLiked ? '❤️' : '🤍'}
      </span>
      <span>{likesCount}</span>
    </button>
    
    <button 
      onClick={onSave}
      className={`article-layout__action-button article-layout__action-button--save ${
        isSaved ? 'saved' : ''
      }`}
      aria-label={isSaved ? '保存済み' : '保存する'}
      aria-pressed={isSaved}
    >
      <span className="text-xl" aria-hidden="true">
        {isSaved ? '🔖' : '📑'}
      </span>
      <span>保存</span>
    </button>
  </div>
))

ActionButtons.displayName = 'ActionButtons'

export const EnhancedArticleLayout = memo(({ article, slots }: EnhancedArticleLayoutProps) => {
  const { user } = useAuth()
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const [activeSection, setActiveSection] = useState<string>('')
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(article.likes)
  const [showMobileToc, setShowMobileToc] = useState(false)

  // ブックマーク状態の初期化
  useEffect(() => {
    setIsSaved(isBookmarked('article', article.id))
  }, [isBookmarked, article.id])

  // いいね状態の初期化
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) return
      
      try {
        const response = await fetch(`/api/likes?target_type=article&target_id=${article.id}`)
        if (response.ok) {
          const data = await response.json()
          setIsLiked(data.liked)
          setLikesCount(data.count)
        }
      } catch (error) {
        console.error('Failed to check like status:', error)
      }
    }
    
    checkLikeStatus()
  }, [user, article.id])

  // IntersectionObserverの最適化
  useEffect(() => {
    if (!article.toc.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        // 最も見える部分の大きい要素を取得
        let maxRatio = 0
        let activeId = ''
        
        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio
            activeId = entry.target.id
          }
        })
        
        if (activeId && maxRatio > 0.1) {
          setActiveSection(activeId)
        }
      },
      { 
        rootMargin: '-20% 0px -70% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    )

    // 非同期でDOM要素を取得してObserverに登録
    const registerObserver = () => {
      const headings = article.toc
        .map(item => document.getElementById(item.id))
        .filter(Boolean)
      
      headings.forEach(heading => heading && observer.observe(heading))
    }

    // DOM準備後に実行
    const timer = setTimeout(registerObserver, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [article.toc])

  // スムーススクロール（最適化済み）
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (!element) return

    const offset = 80
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset
    
    window.scrollTo({ 
      top: y, 
      behavior: 'smooth' 
    })
    
    // アクセシビリティのためのフォーカス設定
    element.focus({ preventScroll: true })
    setShowMobileToc(false)
  }, [])

  // いいね処理（楽観的アップデート）
  const handleLike = useCallback(async () => {
    const newIsLiked = !isLiked
    const previousLikesCount = likesCount
    
    // 楽観的アップデート
    setIsLiked(newIsLiked)
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1)
    
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_type: 'article',
          target_id: article.id,
        }),
      })

      if (!response.ok) {
        // エラー時はロールバック
        setIsLiked(!newIsLiked)
        setLikesCount(previousLikesCount)
        const error = await response.json()
        console.error('Failed to like article:', error)
      }
    } catch (error) {
      // エラー時はロールバック
      setIsLiked(!newIsLiked)
      setLikesCount(previousLikesCount)
      console.error('Failed to like article:', error)
    }
  }, [isLiked, likesCount, article.id])

  // 保存処理
  const handleSave = useCallback(async () => {
    const newState = await toggleBookmark('article', article.id)
    setIsSaved(newState)
  }, [toggleBookmark, article.id])

  // 共有処理（エラーハンドリング付き）
  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          url: window.location.href
        })
      } else {
        // フォールバック: URLをクリップボードにコピー
        await navigator.clipboard.writeText(window.location.href)
        // TODO: トースト通知を表示
      }
    } catch (err) {
      console.log('Share failed:', err)
      // TODO: エラー通知を表示
    }
  }, [article.title])

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+K または Cmd+K で目次を開く
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowMobileToc(true)
      }
      
      // Escape で目次を閉じる
      if (e.key === 'Escape' && showMobileToc) {
        setShowMobileToc(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showMobileToc])

  // TOCコンテンツのメモ化
  const tocContent = useMemo(() => (
    <TableOfContents 
      toc={article.toc}
      activeSection={activeSection}
      onSectionClick={scrollToSection}
    />
  ), [article.toc, activeSection, scrollToSection])

  return (
    <div className="article-layout">
      {/* ヘッダー */}
      {slots?.header || (
        <header className="article-layout__header">
          <div className="article-layout__header-container">
            <div className="article-layout__header-content">
              <div className="article-layout__header-left">
                <Link 
                  href="/articles" 
                  className="article-layout__breadcrumb"
                  aria-label="記事一覧に戻る"
                >
                  <svg className="article-layout__breadcrumb-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="article-layout__breadcrumb-text">記事一覧</span>
                </Link>
                <div className="article-layout__breadcrumb-separator" aria-hidden="true">/</div>
                <Badge variant={article.type === 'tech' ? 'primary' : 'secondary'}>
                  {article.type === 'tech' ? 'Tech' : 'Idea'}
                </Badge>
              </div>
              <div className="article-layout__header-right">
                <div className="article-layout__reading-time">
                  <svg className="article-layout__reading-time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="article-layout__reading-time-text">{article.readingTime}</span>
                </div>
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={handleShare}
                  className="article-layout__share-button"
                >
                  <svg className="article-layout__share-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>共有</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* メインコンテンツ */}
      <div className="article-layout__container">
        <div className="article-layout__grid">
          
          {/* 左サイドバー */}
          <aside className="article-layout__sidebar-left" aria-label="ナビゲーション">
            <div className="article-layout__sidebar-card">
              <h3 className="article-layout__sidebar-title">
                <span aria-hidden="true">📋</span>
                目次
              </h3>
              {tocContent}
            </div>

            <div className="article-layout__sidebar-card">
              <ActionButtons
                isLiked={isLiked}
                isSaved={isSaved}
                likesCount={likesCount}
                onLike={handleLike}
                onSave={handleSave}
              />
            </div>
          </aside>

          {/* メインコンテンツ */}
          <main className="article-layout__main">
            <ArticleErrorBoundary>
              <article className="article-layout__article">
                {/* 記事ヘッダー */}
                <header className="article-layout__article-header">
                  <div className="article-layout__title-section">
                    <div className="article-layout__emoji" role="img" aria-label="記事の絵文字">
                      {article.emoji}
                    </div>
                    <div className="article-layout__title-content">
                      <h1 className="article-layout__title">
                        {article.title}
                      </h1>
                      <div className="article-layout__meta">
                        <div className="article-layout__meta-item">
                          <time dateTime={article.publishedAt}>
                            {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                          </time>
                        </div>
                        {article.updatedAt !== article.publishedAt && (
                          <>
                            <span className="article-layout__meta-separator" aria-hidden="true">·</span>
                            <div className="article-layout__meta-item">
                              更新: 
                              <time dateTime={article.updatedAt}>
                                {new Date(article.updatedAt).toLocaleDateString('ja-JP')}
                              </time>
                            </div>
                          </>
                        )}
                        <span className="article-layout__meta-separator lg:hidden" aria-hidden="true">·</span>
                        <span className="lg:hidden">{article.readingTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* タグ */}
                  <div className="article-layout__tags">
                    {article.tags.map(tag => (
                      <Link
                        key={tag}
                        href={`/topics/${encodeURIComponent(tag)}`}
                        className="article-layout__tag"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>

                  {/* 著者情報 */}
                  <div className="article-layout__author-info">
                    <Link href={`/${article.author.username}`} className="article-layout__author-link">
                      <img 
                        src={article.author.avatar} 
                        alt=""
                        className="article-layout__author-avatar"
                      />
                      <div className="article-layout__author-details">
                        <div className="article-layout__author-name">
                          {article.author.name}
                        </div>
                        <div className="article-layout__author-bio">
                          {article.author.bio}
                        </div>
                      </div>
                    </Link>
                    <Button 
                      variant="primary" 
                      size="small"
                      className="article-layout__follow-button"
                    >
                      フォロー
                    </Button>
                  </div>
                </header>

                {/* 記事本文 */}
                <div className="article-layout__content">
                  <OptimizedMarkdownContent 
                    content={article.content} 
                    lazy={article.content.length > 15000}
                  />
                </div>

                {/* 記事フッター */}
                <footer className="article-layout__footer">
                  <div className="article-layout__actions">
                    <div className="article-layout__like-section">
                      <button 
                        onClick={handleLike}
                        className={`article-layout__like-button ${
                          isLiked ? 'article-layout__like-button--liked' : 'article-layout__like-button--not-liked'
                        }`}
                        aria-label={isLiked ? 'いいねを取り消し' : 'いいねする'}
                      >
                        <span aria-hidden="true">{isLiked ? '❤️' : '🤍'}</span>
                        <span>{likesCount}</span>
                      </button>
                      <span className="text-gray-500">がいいねしました</span>
                    </div>
                    
                    <div className="article-layout__share-actions hidden sm:flex">
                      <Button variant="secondary" size="small" onClick={handleSave}>
                        {isSaved ? '保存済み' : '保存'}
                      </Button>
                      <Button variant="secondary" size="small" onClick={handleShare}>
                        共有
                      </Button>
                    </div>
                  </div>
                </footer>
              </article>

              {/* コメントセクション */}
              <section className="article-layout__comments">
                <CommentErrorBoundary>
                  <CommentSection
                    comments={article.comments}
                    articleId={article.id}
                    currentUserId={user?.id}
                  />
                </CommentErrorBoundary>
              </section>
            </ArticleErrorBoundary>
          </main>

          {/* 右サイドバー */}
          <aside className="article-layout__sidebar-right" aria-label="関連情報">
            {/* 記事統計 */}
            <div className="article-layout__sidebar-card">
              <h3 className="article-layout__sidebar-title">
                <span aria-hidden="true">📊</span>
                記事統計
              </h3>
              <div className="article-layout__stats">
                <div className="article-layout__stat-item">
                  <span className="article-layout__stat-label">読了時間</span>
                  <span className="article-layout__stat-value">{article.readingTime}</span>
                </div>
                <div className="article-layout__stat-item">
                  <span className="article-layout__stat-label">公開日</span>
                  <span className="article-layout__stat-value">
                    {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div className="article-layout__stat-item">
                  <span className="article-layout__stat-label">タグ数</span>
                  <span className="article-layout__stat-value">{article.tags.length}</span>
                </div>
              </div>
            </div>

            {/* 著者の他の記事 */}
            <div className="article-layout__sidebar-card">
              <h3 className="article-layout__sidebar-title">
                <span aria-hidden="true">📝</span>
                著者の他の記事
              </h3>
              <div className="article-layout__related-list">
                {article.author.articles.slice(0, 3).map(item => (
                  <Link
                    key={item.id}
                    href={`/articles/${item.id}`}
                    className="article-layout__related-item"
                  >
                    <div className="article-layout__related-content">
                      <span className="article-layout__related-emoji" aria-hidden="true">{item.emoji}</span>
                      <div className="article-layout__related-info">
                        <div className="article-layout__related-title">
                          {item.title}
                        </div>
                        <div className="article-layout__related-meta">
                          <span aria-hidden="true">❤️</span> {item.likes}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 関連記事 */}
            <div className="article-layout__sidebar-card">
              <h3 className="article-layout__sidebar-title">
                <span aria-hidden="true">🔗</span>
                関連記事
              </h3>
              <div className="space-y-3">
                {article.relatedArticles.map(item => (
                  <Link
                    key={item.id}
                    href={`/articles/${item.id}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl" aria-hidden="true">{item.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm line-clamp-2">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.author.name} · <span aria-hidden="true">❤️</span> {item.likes}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>


      {/* モバイル用目次モーダル */}
      {showMobileToc && (
        <div 
          className="article-layout__mobile-toc-overlay lg:hidden"
          onClick={() => setShowMobileToc(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-toc-title"
        >
          <div 
            className="article-layout__mobile-toc-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="article-layout__mobile-toc-header">
              <h3 id="mobile-toc-title" className="article-layout__mobile-toc-title">
                目次
              </h3>
              <button 
                onClick={() => setShowMobileToc(false)}
                className="article-layout__mobile-toc-close"
                aria-label="目次を閉じる"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {tocContent}
          </div>
        </div>
      )}
    </div>
  )
})

EnhancedArticleLayout.displayName = 'EnhancedArticleLayout'