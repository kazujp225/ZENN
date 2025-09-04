'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MarkdownContent } from '@/components/article/MarkdownContent'

interface Author {
  username: string
  name: string
  avatar: string
  bio?: string
  followersCount?: number
  isOwner?: boolean
}

interface Post {
  id: string
  author: Author
  content: string
  publishedAt: string
  updatedAt: string
  likes: number
  isLiked: boolean
}

interface ScrapLayoutProps {
  scrap: {
    id: string
    title: string
    emoji: string
    author: Author
    publishedAt: string
    updatedAt: string
    isOpen: boolean
    closedAt?: string
    likes: number
    topics: string[]
    posts: Post[]
  }
}

export function ScrapLayout({ scrap }: ScrapLayoutProps) {
  const [posts, setPosts] = useState(scrap.posts)
  const [newComment, setNewComment] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const [showReplyTo, setShowReplyTo] = useState<string | null>(null)

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ))
  }

  const handleReply = (username: string) => {
    setNewComment(`@${username} `)
    setShowReplyTo(username)
    // Focus on textarea
    setTimeout(() => {
      const textarea = document.getElementById('comment-textarea')
      if (textarea) {
        (textarea as HTMLTextAreaElement).focus()
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/scraps" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              スクラップ一覧
            </Link>
            <Badge variant={scrap.isOpen ? 'success' : 'default'}>
              {scrap.isOpen ? 'Open' : 'Closed'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* タイトルセクション */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <span className="text-5xl">{scrap.emoji}</span>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {scrap.title}
                </h1>
                
                {/* メタ情報 */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <time>{new Date(scrap.publishedAt).toLocaleDateString('ja-JP')}</time>
                  {scrap.updatedAt !== scrap.publishedAt && (
                    <>
                      <span>·</span>
                      <span>更新: {new Date(scrap.updatedAt).toLocaleDateString('ja-JP')}</span>
                    </>
                  )}
                  {scrap.closedAt && (
                    <>
                      <span>·</span>
                      <span className="text-red-600">
                        クローズ: {new Date(scrap.closedAt).toLocaleDateString('ja-JP')}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 著者情報 */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl mb-6">
              <Link href={`/${scrap.author.username}`}>
                <img 
                  src={scrap.author.avatar} 
                  alt={scrap.author.name}
                  className="w-14 h-14 rounded-full hover:ring-4 hover:ring-blue-200 transition-all"
                />
              </Link>
              <div className="flex-1">
                <Link 
                  href={`/${scrap.author.username}`}
                  className="text-lg font-semibold hover:text-blue-600 transition-colors"
                >
                  {scrap.author.name}
                </Link>
                {scrap.author.bio && (
                  <p className="text-sm text-gray-600">{scrap.author.bio}</p>
                )}
                {scrap.author.followersCount && (
                  <p className="text-sm text-gray-500 mt-1">
                    {scrap.author.followersCount.toLocaleString()} フォロワー
                  </p>
                )}
              </div>
              <Button 
                variant={isFollowing ? 'secondary' : 'primary'} 
                size="small"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? 'フォロー中' : 'フォロー'}
              </Button>
            </div>

            {/* トピックタグ */}
            <div className="flex flex-wrap gap-2">
              {scrap.topics.map(topic => (
                <Link 
                  key={topic}
                  href={`/topics/${topic}`}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>

          {/* タイムライン */}
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div key={post.id} className="relative">
                {/* タイムラインライン */}
                {index < posts.length - 1 && (
                  <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-gray-200" />
                )}
                
                <div className="flex gap-4">
                  {/* アバターとライン */}
                  <div className="relative flex-shrink-0">
                    <Link href={`/${post.author.username}`}>
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name}
                        className="w-14 h-14 rounded-full bg-white border-4 border-white shadow-md hover:shadow-lg transition-shadow relative z-10"
                      />
                    </Link>
                    {post.author.isOwner && (
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full z-20">
                        作成者
                      </div>
                    )}
                  </div>

                  {/* コンテンツ */}
                  <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
                    {/* ヘッダー */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Link 
                          href={`/${post.author.username}`}
                          className="font-semibold text-lg hover:text-blue-600 transition-colors"
                        >
                          {post.author.name}
                        </Link>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span>@{post.author.username}</span>
                          <span>·</span>
                          <time>{new Date(post.publishedAt).toLocaleString('ja-JP')}</time>
                          {post.updatedAt !== post.publishedAt && (
                            <>
                              <span>·</span>
                              <span>編集済み</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>

                    {/* 本文 */}
                    <div className="prose prose-gray max-w-none">
                      <MarkdownContent content={post.content} />
                    </div>

                    {/* アクション */}
                    <div className="flex items-center gap-6 mt-6 pt-4 border-t">
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                        }`}
                      >
                        <svg className="w-5 h-5" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-medium">{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => handleReply(post.author.username)}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        <span className="font-medium">返信</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9 9.032a8.003 8.003 0 01-7.357 3.308A8.003 8.003 0 013.67 19.01m8.684-15.342A8.003 8.003 0 0119.01 3.67m-9.032 16.016A3 3 0 0012 21a3 3 0 002.342-.684" />
                        </svg>
                        <span className="font-medium">共有</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* コメント投稿フォーム */}
          {scrap.isOpen && (
            <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">コメントを投稿</h3>
              {showReplyTo && (
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">返信先: @{showReplyTo}</span>
                  <button 
                    onClick={() => {
                      setShowReplyTo(null)
                      setNewComment('')
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <textarea
                id="comment-textarea"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={6}
                placeholder="Markdownで記述できます..."
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <Button variant="primary" size="small">
                  投稿する
                </Button>
              </div>
            </div>
          )}

          {/* クローズ時のメッセージ */}
          {!scrap.isOpen && (
            <div className="mt-8 bg-gray-100 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">このスクラップはクローズされています</h3>
              <p className="text-gray-600">新しいコメントを投稿することはできません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}