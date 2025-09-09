'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { MarkdownContent } from '@/components/article/MarkdownContent'
import { Badge } from '@/components/ui/Badge'
import clsx from 'clsx'
import { createArticleId, slugify, saveArticle, type Article } from '@/utils/articleStore'

interface ArticleDraft {
  title: string
  emoji: string
  type: 'tech' | 'idea'
  tags: string[]
  content: string
  published: boolean
}

export default function NewArticlePage() {
  const router = useRouter()
  const [article, setArticle] = useState<ArticleDraft>({
    title: '',
    emoji: '📝',
    type: 'tech',
    tags: [],
    content: '',
    published: false
  })
  
  const [currentView, setCurrentView] = useState<'edit' | 'preview'>('edit')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)

  // 自動保存機能
  const saveAsDraft = useCallback(async () => {
    if (!article.title && !article.content) return
    
    setIsSaving(true)
    try {
      // ローカルストレージに保存
      localStorage.setItem('article-draft', JSON.stringify(article))
      
      // APIで下書き保存（必要に応じて）
      if (article.title.trim() || article.content.trim()) {
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: article.title.trim() || '無題の記事',
            content: article.content,
            emoji: article.emoji,
            slug: slugify(article.title || 'untitled'),
            topics: article.tags,
            is_published: false // 下書きとして保存
          }),
        })
        
        if (response.ok) {
          const { data } = await response.json()
          // 下書きIDを保存（後で更新用に使用）
          localStorage.setItem('article-draft-id', data.id)
        }
      }
      
      setLastSaved(new Date())
    } catch (error) {
      console.error('下書き保存に失敗しました:', error)
    } finally {
      setIsSaving(false)
    }
  }, [article])

  // 自動保存（5秒間隔）
  useEffect(() => {
    const timer = setInterval(() => {
      if (article.title || article.content) {
        saveAsDraft()
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [article.title, article.content, saveAsDraft])

  // 初回読み込み時に下書きを復元
  useEffect(() => {
    const savedDraft = localStorage.getItem('article-draft')
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        setArticle(draft)
        setLastSaved(new Date())
      } catch (error) {
        console.error('下書きの復元に失敗しました:', error)
      }
    }
  }, [])

  // 記事の更新
  const updateArticle = (updates: Partial<ArticleDraft>) => {
    setArticle(prev => ({ ...prev, ...updates }))
  }

  // タグの追加
  const addTag = () => {
    if (tagInput.trim() && !article.tags.includes(tagInput.trim()) && article.tags.length < 5) {
      updateArticle({ 
        tags: [...article.tags, tagInput.trim()] 
      })
      setTagInput('')
    }
  }

  // タグの削除
  const removeTag = (tagToRemove: string) => {
    updateArticle({
      tags: article.tags.filter(tag => tag !== tagToRemove)
    })
  }

  // 絵文字の変更
  const handleEmojiChange = (emoji: string) => {
    updateArticle({ emoji })
  }

  // 記事の公開
  const publishArticle = async () => {
    if (!article.title.trim() || !article.content.trim()) {
      alert('タイトルと本文を入力してください')
      return
    }

    setIsPublishing(true)
    try {
      // APIを呼び出して記事を作成
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: article.title.trim(),
          content: article.content,
          emoji: article.emoji,
          slug: slugify(article.title),
          topics: article.tags, // タグをトピックとして送信
          is_published: true
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create article')
      }

      const { data } = await response.json()

      // 下書きをクリア
      localStorage.removeItem('article-draft')
      
      // 記事ページへリダイレクト
      router.push(`/articles/${data.slug}`)
    } catch (error) {
      console.error('記事の公開に失敗しました:', error)
      alert('記事の公開に失敗しました: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsPublishing(false)
    }
  }

  // 下書き保存
  const saveDraft = async () => {
    await saveAsDraft()
    alert('下書きを保存しました')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                戻る
              </button>
              
              {/* 保存状態 */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full" />
                    保存中...
                  </span>
                ) : lastSaved ? (
                  <span>
                    {new Date(lastSaved).toLocaleTimeString()}に保存済み
                  </span>
                ) : (
                  <span>未保存</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* ビュー切り替え */}
              <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setCurrentView('edit')}
                  className={clsx(
                    'px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium',
                    currentView === 'edit'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    編集
                  </span>
                </button>
                <button
                  onClick={() => setCurrentView('preview')}
                  className={clsx(
                    'px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium',
                    currentView === 'preview'
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    プレビュー
                  </span>
                </button>
              </div>

              {/* アクション */}
              <button
                onClick={saveDraft}
                disabled={isSaving}
                className="px-5 py-2.5 text-sm text-gray-700 hover:text-gray-900 transition-all duration-200 disabled:opacity-50 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                  </svg>
                  下書き保存
                </span>
              </button>
              
              <button
                onClick={publishArticle}
                disabled={isPublishing || !article.title.trim() || !article.content.trim()}
                className={clsx(
                  'px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
                  'focus:outline-none focus:ring-4 focus:ring-blue-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700',
                  'shadow-lg hover:shadow-xl transform hover:scale-105'
                )}
              >
                {isPublishing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    公開中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    記事を公開
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {currentView === 'edit' ? (
              <div className="space-y-6">
                {/* 記事メタ情報 */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
                  {/* タイトル */}
                  <div className="flex items-start gap-4 mb-8">
                    <button
                      onClick={() => {
                        const emojis = ['📝', '💡', '🚀', '⚡', '🎯', '🔥', '✨', '📊', '🛠️', '🎨']
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
                        handleEmojiChange(randomEmoji)
                      }}
                      className="text-5xl hover:scale-110 transition-all duration-200 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg"
                      title="絵文字をランダム変更"
                    >
                      {article.emoji}
                    </button>
                    
                    <input
                      type="text"
                      placeholder="記事のタイトルを入力"
                      value={article.title}
                      onChange={(e) => updateArticle({ title: e.target.value })}
                      className="flex-1 text-3xl font-bold border-none outline-none placeholder-gray-400 bg-transparent"
                    />
                  </div>

                  {/* タイプ選択 */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      記事タイプ
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateArticle({ type: 'tech' })}
                        className={clsx(
                          'px-5 py-3 text-sm rounded-xl transition-all duration-200 font-medium',
                          article.type === 'tech'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">💻</span>
                          Tech
                        </span>
                      </button>
                      <button
                        onClick={() => updateArticle({ type: 'idea' })}
                        className={clsx(
                          'px-5 py-3 text-sm rounded-xl transition-all duration-200 font-medium',
                          article.type === 'idea'
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">💡</span>
                          Idea
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* タグ */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      タグ ({article.tags.length}/5)
                    </label>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-600 ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    
                    {article.tags.length < 5 && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="タグを入力してEnterキーで追加"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 bg-white"
                        />
                        <button
                          onClick={addTag}
                          disabled={!tagInput.trim()}
                          className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* エディタ */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden hover:border-blue-200 transition-all duration-200">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Markdownエディタ
                    </p>
                  </div>
                  <MarkdownEditor
                    value={article.content}
                    onChange={(content) => updateArticle({ content })}
                    minHeight="500px"
                  />
                </div>
              </div>
            ) : (
              /* プレビュー */
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{article.emoji}</span>
                    <div>
                      <h1 className="text-3xl font-bold">{article.title || 'タイトル未設定'}</h1>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={article.type === 'tech' ? 'default' : 'secondary'}>
                          {article.type === 'tech' ? '💻 Tech' : '💡 Idea'}
                        </Badge>
                        {article.tags.map(tag => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {article.content ? (
                  <MarkdownContent content={article.content} />
                ) : (
                  <div className="text-gray-500 text-center py-12">
                    記事の内容をプレビューします
                  </div>
                )}
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 執筆ガイド */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
                <span className="text-2xl">✍️</span>
                執筆ガイド
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>見出しで記事を構造化しましょう</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>コードブロックでサンプルを示す</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>画像で理解を深める</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>具体的な例を含める</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>まとめで要点を整理</span>
                </div>
              </div>
            </div>

            {/* ショートカット */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
                <span className="text-2xl">⌨️</span>
                ショートカット
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between items-center p-2 hover:bg-white/70 rounded-lg transition-all duration-200">
                  <span>太字</span>
                  <kbd className="bg-white px-3 py-1.5 rounded-lg text-xs font-mono shadow-sm border border-gray-200">⌘B</kbd>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white/70 rounded-lg transition-all duration-200">
                  <span>イタリック</span>
                  <kbd className="bg-white px-3 py-1.5 rounded-lg text-xs font-mono shadow-sm border border-gray-200">⌘I</kbd>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white/70 rounded-lg transition-all duration-200">
                  <span>リンク</span>
                  <kbd className="bg-white px-3 py-1.5 rounded-lg text-xs font-mono shadow-sm border border-gray-200">⌘K</kbd>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white/70 rounded-lg transition-all duration-200">
                  <span>インデント</span>
                  <kbd className="bg-white px-3 py-1.5 rounded-lg text-xs font-mono shadow-sm border border-gray-200">Tab</kbd>
                </div>
              </div>
            </div>

            {/* 統計 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">
                <span className="text-2xl">📊</span>
                統計
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                  <span className="text-gray-600">文字数</span>
                  <span className="font-semibold text-gray-900 text-base">{article.content.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                  <span className="text-gray-600">行数</span>
                  <span className="font-semibold text-gray-900 text-base">{article.content.split('\n').length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                  <span className="text-gray-600">推定読了時間</span>
                  <span className="font-semibold text-gray-900 text-base">
                    {Math.max(1, Math.ceil(article.content.length / 500))}分
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
