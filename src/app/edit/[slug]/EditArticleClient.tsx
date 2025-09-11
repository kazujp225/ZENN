'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { MarkdownContent } from '@/components/article/MarkdownContent'
import { Badge } from '@/components/ui/Badge'
import clsx from 'clsx'

interface ArticleDraft {
  id: string
  title: string
  emoji: string
  type: 'tech' | 'idea'
  tags: string[]
  content: string
  published: boolean
  publishedAt?: string
  updatedAt?: string
}

// APIから記事データを取得
const getArticleForEdit = async (slug: string): Promise<ArticleDraft | null> => {
  try {
    const { articlesApi } = await import('@/lib/api')
    const { data } = await articlesApi.getArticleBySlug(slug)
    
    if (!data) return null
    
    return {
      id: data.id,
      title: data.title,
      emoji: data.emoji || '📝',
      type: data.type as 'tech' | 'idea',
      tags: data.topics || [],
      content: data.content,
      published: data.published,
      publishedAt: data.published_at,
      updatedAt: data.updated_at
    }
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return null
  }
}

export default function EditArticleClient({ slug }: { slug: string }) {
  const router = useRouter()
  
  const [article, setArticle] = useState<ArticleDraft | null>(null)
  const [originalArticle, setOriginalArticle] = useState<ArticleDraft | null>(null)
  const [currentView, setCurrentView] = useState<'edit' | 'preview'>('edit')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // 記事データの読み込み
  useEffect(() => {
    const loadArticle = async () => {
      try {
        const articleData = await getArticleForEdit(slug)
        if (!articleData) {
          router.push('/404')
          return
        }
        setArticle(articleData)
        setOriginalArticle(articleData)
        if (articleData.updatedAt) {
          setLastSaved(new Date(articleData.updatedAt))
        }
      } catch (error) {
        // エラーログ削除（セキュリティ対応）
        router.push('/404')
      }
    }

    loadArticle()
  }, [slug, router])

  // 変更検知
  useEffect(() => {
    if (article && originalArticle) {
      const changed = JSON.stringify(article) !== JSON.stringify(originalArticle)
      setHasChanges(changed)
    }
  }, [article, originalArticle])

  // 自動保存機能
  const saveChanges = useCallback(async () => {
    if (!article || !hasChanges) return

    setIsSaving(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOriginalArticle({ ...article })
      setLastSaved(new Date())
      setHasChanges(false)
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    } finally {
      setIsSaving(false)
    }
  }, [article, hasChanges])

  // 自動保存（5秒間隔）
  useEffect(() => {
    if (!hasChanges) return

    const timer = setTimeout(() => {
      saveChanges()
    }, 5000)

    return () => clearTimeout(timer)
  }, [hasChanges, saveChanges])

  // 記事の更新
  const updateArticle = (updates: Partial<ArticleDraft>) => {
    if (!article) return
    setArticle(prev => ({ ...prev!, ...updates }))
  }

  // タグの追加
  const addTag = () => {
    if (!article) return
    if (tagInput.trim() && !article.tags.includes(tagInput.trim()) && article.tags.length < 5) {
      updateArticle({ 
        tags: [...article.tags, tagInput.trim()] 
      })
      setTagInput('')
    }
  }

  // タグの削除
  const removeTag = (tagToRemove: string) => {
    if (!article) return
    updateArticle({
      tags: article.tags.filter(tag => tag !== tagToRemove)
    })
  }

  // 絵文字の変更
  const handleEmojiChange = (emoji: string) => {
    updateArticle({ emoji })
  }

  // 変更の公開
  const publishChanges = async () => {
    if (!article || !hasChanges) return

    setIsPublishing(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      updateArticle({ 
        updatedAt: new Date().toISOString()
      })
      
      setOriginalArticle({ ...article })
      setHasChanges(false)
      
      alert('記事を更新しました')
      router.push(`/articles/${slug}`)
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      alert('記事の更新に失敗しました')
    } finally {
      setIsPublishing(false)
    }
  }

  // 手動保存
  const manualSave = async () => {
    await saveChanges()
    if (!hasChanges) {
      alert('変更を保存しました')
    }
  }

  // ページを離れる際の確認
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>記事を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (hasChanges && !confirm('未保存の変更があります。戻ってもよろしいですか？')) {
                    return
                  }
                  router.back()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← 戻る
              </button>
              
              {/* 保存状態 */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full" />
                    保存中...
                  </span>
                ) : hasChanges ? (
                  <span className="text-orange-600">未保存の変更あり</span>
                ) : lastSaved ? (
                  <span>
                    {new Date(lastSaved).toLocaleTimeString()}に保存済み
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* ビュー切り替え */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('edit')}
                  className={clsx(
                    'px-3 py-1 text-sm rounded-md transition-colors',
                    currentView === 'edit'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  編集
                </button>
                <button
                  onClick={() => setCurrentView('preview')}
                  className={clsx(
                    'px-3 py-1 text-sm rounded-md transition-colors',
                    currentView === 'preview'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  プレビュー
                </button>
              </div>

              {/* アクション */}
              <button
                onClick={manualSave}
                disabled={isSaving || !hasChanges}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                保存
              </button>
              
              <button
                onClick={publishChanges}
                disabled={isPublishing || !hasChanges}
                className={clsx(
                  'px-6 py-2 text-sm font-medium rounded-lg transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  hasChanges
                    ? 'bg-primary text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                {isPublishing ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full" />
                    更新中...
                  </span>
                ) : (
                  '変更を公開'
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
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  {/* ステータス */}
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-green-800 font-medium">公開済み</span>
                      <span className="text-green-600 text-sm">
                        {new Date(article.publishedAt!).toLocaleDateString()}に公開
                      </span>
                    </div>
                  </div>

                  {/* タイトル */}
                  <div className="flex items-start gap-4 mb-6">
                    <button
                      onClick={() => {
                        const emojis = ['📝', '💡', '🚀', '⚡', '🎯', '🔥', '✨', '📊', '🛠️', '🎨']
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
                        handleEmojiChange(randomEmoji)
                      }}
                      className="text-4xl hover:scale-110 transition-transform p-2"
                      title="絵文字をランダム変更"
                    >
                      {article.emoji}
                    </button>
                    
                    <input
                      type="text"
                      placeholder="記事のタイトルを入力"
                      value={article.title}
                      onChange={(e) => updateArticle({ title: e.target.value })}
                      className="flex-1 text-2xl font-bold border-none outline-none placeholder-gray-400"
                    />
                  </div>

                  {/* タイプ選択 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      記事タイプ
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateArticle({ type: 'tech' })}
                        className={clsx(
                          'px-4 py-2 text-sm rounded-lg transition-colors',
                          article.type === 'tech'
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        💻 Tech
                      </button>
                      <button
                        onClick={() => updateArticle({ type: 'idea' })}
                        className={clsx(
                          'px-4 py-2 text-sm rounded-lg transition-colors',
                          article.type === 'idea'
                            ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        💡 Idea
                      </button>
                    </div>
                  </div>

                  {/* タグ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          placeholder="タグを入力"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={addTag}
                          disabled={!tagInput.trim()}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          追加
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* エディタ */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <MarkdownEditor
                    value={article.content}
                    onChange={(content) => updateArticle({ content })}
                    minHeight="500px"
                  />
                </div>
              </div>
            ) : (
              /* プレビュー */
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{article.emoji}</span>
                    <div>
                      <h1 className="text-3xl font-bold">{article.title}</h1>
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
                
                <MarkdownContent content={article.content} />
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 編集状態 */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-bold mb-3">📝 編集状態</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>公開日</span>
                  <span className="text-gray-600">
                    {new Date(article.publishedAt!).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>最終更新</span>
                  <span className="text-gray-600">
                    {new Date(article.updatedAt!).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>変更状態</span>
                  <span className={hasChanges ? 'text-orange-600' : 'text-green-600'}>
                    {hasChanges ? '未保存' : '保存済み'}
                  </span>
                </div>
              </div>
            </div>

            {/* 統計 */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-bold mb-3">📊 統計</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>文字数</span>
                  <span className="font-medium">{article.content.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>行数</span>
                  <span className="font-medium">{article.content.split('\n').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>推定読了時間</span>
                  <span className="font-medium">
                    {Math.max(1, Math.ceil(article.content.length / 500))}分
                  </span>
                </div>
              </div>
            </div>

            {/* ナビゲーション */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-bold mb-3">🔗 ナビゲーション</h3>
              <div className="space-y-2">
                <a
                  href={`/articles/${article.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  記事を表示 →
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/articles/${article.id}`)
                    alert('URLをコピーしました')
                  }}
                  className="block text-sm text-gray-600 hover:text-gray-800"
                >
                  URLをコピー
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}