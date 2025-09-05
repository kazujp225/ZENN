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
    setIsSaving(true)
    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // ローカルストレージに保存（デモ用）
      localStorage.setItem('article-draft', JSON.stringify(article))
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
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 記事を保存（ローカルストレージの管理用リスト）
      const id = createArticleId()
      const slug = `${slugify(article.title)}-${id.slice(0, 6)}`
      const now = new Date().toISOString()
      const saved: Article = {
        id,
        slug,
        title: article.title.trim(),
        emoji: article.emoji,
        type: article.type,
        tags: article.tags,
        content: article.content,
        published: true,
        createdAt: now,
        updatedAt: now,
        views: 0,
        likes: 0,
      }
      saveArticle(saved)

      // 下書きをクリア
      localStorage.removeItem('article-draft')
      
      // ダッシュボードの管理画面へ
      router.push(`/dashboard/articles`)
    } catch (error) {
      console.error('記事の公開に失敗しました:', error)
      alert('記事の公開に失敗しました')
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
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
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
                onClick={saveDraft}
                disabled={isSaving}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                下書き保存
              </button>
              
              <button
                onClick={publishArticle}
                disabled={isPublishing || !article.title.trim() || !article.content.trim()}
                className={clsx(
                  'px-6 py-2 text-sm font-medium rounded-lg transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'bg-primary text-white hover:bg-blue-600'
                )}
              >
                {isPublishing ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full" />
                    公開中...
                  </span>
                ) : (
                  '記事を公開'
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
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-bold mb-3">✍️ 執筆ガイド</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 見出しで記事を構造化しましょう</p>
                <p>• コードブロックでサンプルを示す</p>
                <p>• 画像で理解を深める</p>
                <p>• 具体的な例を含める</p>
                <p>• まとめで要点を整理</p>
              </div>
            </div>

            {/* ショートカット */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-bold mb-3">⌨️ ショートカット</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>太字</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘B</kbd>
                </div>
                <div className="flex justify-between">
                  <span>イタリック</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘I</kbd>
                </div>
                <div className="flex justify-between">
                  <span>リンク</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘K</kbd>
                </div>
                <div className="flex justify-between">
                  <span>インデント</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Tab</kbd>
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
          </div>
        </div>
      </div>
    </div>
  )
}
