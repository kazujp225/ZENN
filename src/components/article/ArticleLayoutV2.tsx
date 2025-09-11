'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MarkdownContent } from './MarkdownContent'
import { CommentSection } from '../comment/CommentSection'
import type { Article, ArticleSlots } from '@/types/article'
import '@/styles/pages/article-detail.css'
import '@/styles/components/article-layout.css'

interface ArticleLayoutProps {
  article: Article
  slots?: ArticleSlots
}

export function ArticleLayoutV2({ article, slots }: ArticleLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(article.likes)
  const [showMobileToc, setShowMobileToc] = useState(false)

  // 目次のアクティブ状態を管理
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { 
        rootMargin: '-20% 0px -70% 0px',
        threshold: [0, 0.5, 1]
      }
    )

    const headings = article.toc.map(item => document.getElementById(item.id)).filter(Boolean)
    headings.forEach(heading => heading && observer.observe(heading))

    return () => observer.disconnect()
  }, [article.toc])

  // スムーススクロール
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const y = element.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [])

  // いいね処理
  const handleLike = useCallback(() => {
    setIsLiked(prev => !prev)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }, [isLiked])

  // 保存処理
  const handleSave = useCallback(() => {
    setIsSaved(prev => !prev)
  }, [])

  // 共有処理
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: window.location.href
        })
      } catch (err) {
        // console.log削除（セキュリティ対応）
      }
    }
  }, [article.title])

  // TOCコンポーネント
  const TocContent = useMemo(() => (
    <nav className="space-y-1">
      {article.toc.map((item) => (
        <button
          key={item.id}
          onClick={() => scrollToSection(item.id)}
          className={`
            block w-full text-left px-3 py-2 rounded-lg text-sm transition-all
            ${activeSection === item.id 
              ? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-600' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
          style={{ paddingLeft: `${item.level * 12 + 12}px` }}
        >
          {item.title}
        </button>
      ))}
    </nav>
  ), [article.toc, activeSection, scrollToSection])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* カスタムヘッダー or デフォルトヘッダー */}
      {slots?.header || (
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="container">
            <div className="h-16 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <Link 
                  href="/articles" 
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  記事一覧
                </Link>
                <Badge variant={article.type === 'tech' ? 'primary' : 'secondary'}>
                  {article.type === 'tech' ? 'Tech' : 'Idea'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:block">{article.readingTime}</span>
                <Button variant="secondary" size="small" onClick={handleShare}>
                  共有
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* メインコンテンツエリア */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 左サイドバー - デスクトップのみ */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                {slots?.sidebar || (
                  <>
                    {/* 目次 */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <h3 className="font-bold text-gray-900 mb-4">目次</h3>
                      {TocContent}
                    </div>

                    {/* アクションボタン */}
                    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
                      <button 
                        onClick={handleLike}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                          isLiked 
                            ? 'bg-red-50 text-red-600 border-2 border-red-200' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
                        <span className="font-medium">{likesCount}</span>
                      </button>
                      <button 
                        onClick={handleSave}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                          isSaved 
                            ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-xl">{isSaved ? '🔖' : '📑'}</span>
                        <span className="font-medium">保存</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </aside>

            {/* メインコンテンツ */}
            <main className="lg:col-span-6">
              <article className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* 記事ヘッダー */}
                <div className="p-6 lg:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-5xl">{article.emoji}</span>
                    <div className="flex-1">
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                        {article.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <time>{new Date(article.publishedAt).toLocaleDateString('ja-JP')}</time>
                        {article.updatedAt !== article.publishedAt && (
                          <>
                            <span>·</span>
                            <span>更新: {new Date(article.updatedAt).toLocaleDateString('ja-JP')}</span>
                          </>
                        )}
                        <span className="lg:hidden">·</span>
                        <span className="lg:hidden">{article.readingTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* タグ */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {article.tags.map(tag => (
                      <Link
                        key={tag}
                        href={`/topics/${encodeURIComponent(tag)}`}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>

                  {/* 著者情報 */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Link href={`/${article.author.username}`}>
                      <img 
                        src={article.author.avatar} 
                        alt={article.author.name}
                        className="w-12 h-12 rounded-full hover:ring-2 hover:ring-blue-400 transition-all"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link 
                        href={`/${article.author.username}`}
                        className="font-semibold hover:text-blue-600 transition-colors"
                      >
                        {article.author.name}
                      </Link>
                      <p className="text-sm text-gray-600">{article.author.bio}</p>
                    </div>
                    <Button variant="primary" size="small">
                      フォロー
                    </Button>
                  </div>
                </div>

                {/* 記事本文 */}
                <div className="px-6 lg:px-8 pb-8">
                  <MarkdownContent content={article.content} />
                </div>

                {/* 記事フッター */}
                {slots?.footer || (
                  <div className="px-6 lg:px-8 py-6 bg-gray-50 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={handleLike}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            isLiked 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-white text-gray-700 hover:bg-gray-100 border'
                          }`}
                        >
                          <span>{isLiked ? '❤️' : '🤍'}</span>
                          <span>{likesCount}</span>
                        </button>
                        <span className="text-gray-500">がいいねしました</span>
                      </div>
                      <div className="hidden sm:flex gap-2">
                        <Button variant="secondary" size="small" onClick={handleSave}>
                          {isSaved ? '保存済み' : '保存'}
                        </Button>
                        <Button variant="secondary" size="small" onClick={handleShare}>
                          共有
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </article>

              {/* コメントセクション */}
              <section className="mt-8 bg-white rounded-xl shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold mb-6">
                  コメント ({article.comments.length})
                </h2>
                
                {/* コメント投稿フォーム */}
                <div className="mb-8">
                  <textarea 
                    className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="コメントを書く..."
                  />
                  <div className="flex justify-end mt-3">
                    <Button variant="primary">投稿</Button>
                  </div>
                </div>
                
                {/* コメント一覧 */}
                <div className="space-y-6">
                  {article.comments.map(comment => (
                    <div key={comment.id} className="flex gap-4">
                      <img 
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Link 
                              href={`/${comment.author.username}`}
                              className="font-semibold hover:text-blue-600"
                            >
                              {comment.author.name}
                            </Link>
                            <time className="text-sm text-gray-500">
                              {new Date(comment.publishedAt).toLocaleDateString('ja-JP')}
                            </time>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                        
                        {/* 返信 */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-8 mt-4 space-y-3">
                            {comment.replies.map(reply => (
                              <div key={reply.id} className="flex gap-3">
                                <img 
                                  src={reply.author.avatar}
                                  alt={reply.author.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1 bg-white border rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Link 
                                      href={`/${reply.author.username}`}
                                      className="font-medium text-sm hover:text-blue-600"
                                    >
                                      {reply.author.name}
                                    </Link>
                                    <time className="text-xs text-gray-500">
                                      {new Date(reply.publishedAt).toLocaleDateString('ja-JP')}
                                    </time>
                                  </div>
                                  <p className="text-sm text-gray-700">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            {/* 右サイドバー - デスクトップのみ */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                {slots?.rightSidebar || (
                  <>
                    {/* 著者の他の記事 */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <h3 className="font-bold mb-4">著者の他の記事</h3>
                      <div className="space-y-3">
                        {article.author.articles.slice(0, 3).map(item => (
                          <Link
                            key={item.id}
                            href={`/articles/${item.id}`}
                            className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{item.emoji}</span>
                              <div className="flex-1">
                                <div className="font-medium text-sm line-clamp-2">
                                  {item.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  ❤️ {item.likes}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* 追加コンテンツ用エリア */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <h3 className="font-bold mb-4">📊 記事統計</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>読了時間</span>
                          <span className="font-medium">{article.readingTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>公開日</span>
                          <span className="font-medium">
                            {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>タグ数</span>
                          <span className="font-medium">{article.tags.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* 関連記事 */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <h3 className="font-bold mb-4">関連記事</h3>
                      <div className="space-y-3">
                        {article.relatedArticles.map(item => (
                          <Link
                            key={item.id}
                            href={`/articles/${item.id}`}
                            className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{item.emoji}</span>
                              <div className="flex-1">
                                <div className="font-medium text-sm line-clamp-2">
                                  {item.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.author.name} · ❤️ {item.likes}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* モバイル用フローティングアクションバー */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex items-center justify-around py-2">
          <button 
            onClick={handleLike}
            className={`flex flex-col items-center gap-1 p-2 ${
              isLiked ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
            <span className="text-xs">{likesCount}</span>
          </button>
          <button 
            onClick={handleSave}
            className={`flex flex-col items-center gap-1 p-2 ${
              isSaved ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xl">{isSaved ? '🔖' : '📑'}</span>
            <span className="text-xs">保存</span>
          </button>
          <button 
            onClick={() => setShowMobileToc(!showMobileToc)}
            className="flex flex-col items-center gap-1 p-2 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs">目次</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex flex-col items-center gap-1 p-2 text-gray-600"
          >
            <span className="text-xl">📤</span>
            <span className="text-xs">共有</span>
          </button>
        </div>
      </div>

      {/* モバイル用目次モーダル */}
      {showMobileToc && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setShowMobileToc(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">目次</h3>
                <button 
                  onClick={() => setShowMobileToc(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {TocContent}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}