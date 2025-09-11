'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { MarkdownContent } from '@/components/article/MarkdownContent'
import { Badge } from '@/components/ui/Badge'
import { ArticleValidator, type ArticleDraft, type ArticleValidationResult } from '@/utils/articleValidator'
import clsx from 'clsx'

interface ValidationStatus {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    severity?: 'error' | 'warning'
  }>
  warnings: Array<{
    field: string
    message: string
  }>
}

export default function EnhancedNewArticlePage() {
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
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    isValid: false,
    errors: [],
    warnings: []
  })
  const [isDirty, setIsDirty] = useState(false)
  const [showValidationPanel, setShowValidationPanel] = useState(false)
  const [readabilityStats, setReadabilityStats] = useState<ReturnType<typeof ArticleValidator.analyzeReadability> | null>(null)
  
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // リアルタイムバリデーション（デバウンス付き）
  const validateArticle = useCallback(() => {
    const validation = ArticleValidator.validateArticle(article)
    const stats = ArticleValidator.analyzeReadability(article.content)
    
    setValidationStatus({
      isValid: validation.isValid,
      errors: validation.errors.map(error => ({
        ...error,
        severity: error.field === 'seo' ? 'warning' as const : 'error' as const
      })),
      warnings: validation.errors
        .filter(error => error.field === 'seo')
        .map(error => ({ field: error.field, message: error.message }))
    })
    
    setReadabilityStats(stats)
  }, [article])

  // デバウンス付きバリデーション
  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }
    
    validationTimeoutRef.current = setTimeout(validateArticle, 500)
    
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [validateArticle])

  // 自動保存機能（改良版）
  const saveAsDraft = useCallback(async () => {
    if (!isDirty) return
    
    setIsSaving(true)
    try {
      // バリデーション実行
      const validation = ArticleValidator.validateArticle(article)
      
      // APIに保存（実際の実装ではサーバーに送信）
      const draftData = {
        ...article,
        validationResults: validation,
        lastModified: new Date().toISOString(),
        autoSaved: true
      }
      
      await new Promise(resolve => setTimeout(resolve, 800)) // API呼び出しをシミュレート
      
      // ローカルストレージに保存（バックアップ）
      localStorage.setItem('enhanced-article-draft', JSON.stringify(draftData))
      setLastSaved(new Date())
      setIsDirty(false)
      
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      // エラー通知（実際の実装では適切な通知システムを使用）
      showNotification('下書きの保存に失敗しました', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [article, isDirty])

  // デバウンス付き自動保存
  useEffect(() => {
    if (!isDirty) return
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (article.title.trim() || article.content.trim()) {
        saveAsDraft()
      }
    }, 3000) // 3秒後に自動保存
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [article.title, article.content, isDirty, saveAsDraft])

  // 初回読み込み時に下書きを復元
  useEffect(() => {
    const savedDraft = localStorage.getItem('enhanced-article-draft')
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        if (draft.lastModified) {
          const lastModified = new Date(draft.lastModified)
          const hoursSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60)
          
          // 24時間以内の下書きのみ復元
          if (hoursSinceModified < 24) {
            setArticle(draft)
            setLastSaved(lastModified)
            showNotification('前回の下書きを復元しました', 'info')
          }
        }
      } catch (error) {
        // エラーログ削除（セキュリティ対応）
      }
    }
  }, [])

  // 記事の更新
  const updateArticle = (updates: Partial<ArticleDraft>) => {
    setArticle(prev => ({ ...prev, ...updates }))
    setIsDirty(true)
  }

  // タグの追加（改良版）
  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase()
    
    if (!trimmedTag) return
    
    if (article.tags.length >= 5) {
      showNotification('タグは5個まで追加できます', 'warning')
      return
    }
    
    if (article.tags.some(tag => tag.toLowerCase() === trimmedTag)) {
      showNotification('このタグは既に追加されています', 'warning')
      return
    }
    
    if (trimmedTag.length > 20) {
      showNotification('タグは20文字以内にしてください', 'warning')
      return
    }
    
    updateArticle({ 
      tags: [...article.tags, tagInput.trim()] 
    })
    setTagInput('')
  }

  // タグの削除
  const removeTag = (tagToRemove: string) => {
    updateArticle({
      tags: article.tags.filter(tag => tag !== tagToRemove)
    })
  }

  // 絵文字の変更（ランダムまたは選択）
  const handleEmojiChange = (emoji?: string) => {
    if (emoji) {
      updateArticle({ emoji })
    } else {
      const emojis = ['📝', '💡', '🚀', '⚡', '🎯', '🔥', '✨', '📊', '🛠️', '🎨', '💻', '📱', '🌟', '🎉', '💪']
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      updateArticle({ emoji: randomEmoji })
    }
  }

  // 記事の公開（改良版）
  const publishArticle = async () => {
    // 最終バリデーション
    const validation = ArticleValidator.validateArticle(article)
    
    if (!validation.isValid) {
      setShowValidationPanel(true)
      showNotification('記事の公開前にエラーを修正してください', 'error')
      return
    }

    // 警告がある場合は確認
    const warnings = validation.errors.filter(error => error.field === 'seo')
    if (warnings.length > 0) {
      const confirmPublish = confirm(
        `SEOに関する改善提案があります。それでも公開しますか？\n\n${warnings.map(w => `• ${w.message}`).join('\n')}`
      )
      if (!confirmPublish) return
    }

    setIsPublishing(true)
    try {
      // 公開前の最終処理
      const publishData = {
        ...article,
        published: true,
        publishedAt: new Date().toISOString(),
        slug: generateSlug(article.title),
        readabilityStats: readabilityStats
      }
      
      // API呼び出し（実際の実装）
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 下書きをクリア
      localStorage.removeItem('enhanced-article-draft')
      
      showNotification('記事を公開しました！', 'success')
      
      // 記事ページにリダイレクト
      router.push(`/articles/${publishData.slug}`)
      
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      showNotification('記事の公開に失敗しました', 'error')
    } finally {
      setIsPublishing(false)
    }
  }

  // スラグ生成
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .slice(0, 50)
  }

  // 手動下書き保存
  const saveDraft = async () => {
    setIsDirty(true) // 強制的に保存
    await saveAsDraft()
    showNotification('下書きを保存しました', 'success')
  }

  // 通知システム（簡易版）
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }
    
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm`
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 4000)
  }

  // ページ離脱時の警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = '保存されていない変更があります。ページを離れてもよろしいですか？'
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // 公開可能かどうかの判定
  const canPublish = validationStatus.isValid && 
                   article.title.trim() && 
                   article.content.trim() && 
                   article.tags.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (isDirty && !confirm('保存されていない変更があります。ページを離れてもよろしいですか？')) {
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
                  <span className="flex items-center gap-1 text-blue-600">
                    <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full" />
                    保存中...
                  </span>
                ) : lastSaved ? (
                  <span className="text-green-600">
                    ✓ {new Date(lastSaved).toLocaleTimeString()}に保存済み
                  </span>
                ) : isDirty ? (
                  <span className="text-orange-600">● 未保存の変更があります</span>
                ) : (
                  <span>最新</span>
                )}
              </div>

              {/* バリデーション状態 */}
              <button
                onClick={() => setShowValidationPanel(!showValidationPanel)}
                className={clsx(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors',
                  validationStatus.isValid 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                )}
              >
                {validationStatus.isValid ? '✓' : '⚠'} 
                {validationStatus.errors.length === 0 ? '検証OK' : `${validationStatus.errors.length}個の問題`}
              </button>
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
                {isSaving ? '保存中...' : '下書き保存'}
              </button>
              
              <button
                onClick={publishArticle}
                disabled={isPublishing || !canPublish}
                className={clsx(
                  'px-6 py-2 text-sm font-medium rounded-lg transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  'disabled:cursor-not-allowed',
                  canPublish && !isPublishing
                    ? 'bg-primary text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500'
                )}
                title={!canPublish ? '公開するには全ての検証をクリアしてください' : '記事を公開'}
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

      {/* バリデーションパネル */}
      {showValidationPanel && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">記事の検証結果</h3>
                <button
                  onClick={() => setShowValidationPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {validationStatus.errors.length === 0 ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <span>✓</span>
                  <span>すべての検証をクリアしました。記事を公開できます。</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {validationStatus.errors.map((error, index) => (
                    <div
                      key={index}
                      className={clsx(
                        'flex items-start gap-2 px-3 py-2 rounded-lg',
                        error.severity === 'warning'
                          ? 'text-yellow-700 bg-yellow-50'
                          : 'text-red-700 bg-red-50'
                      )}
                    >
                      <span className="flex-shrink-0 mt-0.5">
                        {error.severity === 'warning' ? '⚠' : '✕'}
                      </span>
                      <span className="text-sm">{error.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                      onClick={() => handleEmojiChange()}
                      className="text-4xl hover:scale-110 transition-transform p-2"
                      title="絵文字をランダム変更"
                    >
                      {article.emoji}
                    </button>
                    
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="記事のタイトルを入力（5-100文字）"
                        value={article.title}
                        onChange={(e) => updateArticle({ title: e.target.value })}
                        className={clsx(
                          'w-full text-2xl font-bold border-none outline-none placeholder-gray-400',
                          validationStatus.errors.some(e => e.field === 'title') && 'text-red-600'
                        )}
                        maxLength={100}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs text-gray-500">
                          {article.title.length}/100文字
                        </div>
                        {validationStatus.errors.some(e => e.field === 'title') && (
                          <div className="text-xs text-red-600">
                            {validationStatus.errors.find(e => e.field === 'title')?.message}
                          </div>
                        )}
                      </div>
                    </div>
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
                      タグ ({article.tags.length}/5) {article.tags.length === 0 && <span className="text-red-600">*必須</span>}
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
                          placeholder="タグを入力（例: React, TypeScript）"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTag()
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          maxLength={20}
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
                    
                    {validationStatus.errors.some(e => e.field === 'tags') && (
                      <div className="text-sm text-red-600 mt-1">
                        {validationStatus.errors.find(e => e.field === 'tags')?.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* エディタ */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">記事本文</span>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>文字数: {article.content.length.toLocaleString()}</span>
                      {readabilityStats && (
                        <span>読了時間: 約{readabilityStats.readingTime}分</span>
                      )}
                    </div>
                  </div>
                  <MarkdownEditor
                    value={article.content}
                    onChange={(content) => updateArticle({ content })}
                    minHeight="500px"
                  />
                  {validationStatus.errors.some(e => e.field === 'content') && (
                    <div className="p-3 bg-red-50 border-t border-red-200">
                      <div className="text-sm text-red-600">
                        {validationStatus.errors.find(e => e.field === 'content')?.message}
                      </div>
                    </div>
                  )}
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
            {/* 記事統計 */}
            {readabilityStats && (
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="font-bold mb-3">📊 記事統計</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>読了時間</span>
                    <span className="font-medium">{readabilityStats.readingTime}分</span>
                  </div>
                  <div className="flex justify-between">
                    <span>文字数</span>
                    <span className="font-medium">{readabilityStats.characterCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>段落数</span>
                    <span className="font-medium">{readabilityStats.paragraphCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>見出し数</span>
                    <span className="font-medium">{readabilityStats.headingCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>コードブロック</span>
                    <span className="font-medium">{readabilityStats.codeBlockCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>画像数</span>
                    <span className="font-medium">{readabilityStats.imageCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 執筆ガイド */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-bold mb-3">✍️ 執筆ガイド</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className={clsx(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    readabilityStats?.headingCount && readabilityStats.headingCount > 0 
                      ? "bg-green-500" : "bg-gray-300"
                  )} />
                  <span>見出しで記事を構造化しましょう</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={clsx(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    readabilityStats?.codeBlockCount && readabilityStats.codeBlockCount > 0 
                      ? "bg-green-500" : "bg-gray-300"
                  )} />
                  <span>コードブロックでサンプルを示す</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={clsx(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    readabilityStats?.imageCount && readabilityStats.imageCount > 0 
                      ? "bg-green-500" : "bg-gray-300"
                  )} />
                  <span>画像で理解を深める</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={clsx(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    article.content.length > 1000 ? "bg-green-500" : "bg-gray-300"
                  )} />
                  <span>具体的な例を含める</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={clsx(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    article.content.includes('まとめ') || article.content.includes('# まとめ') 
                      ? "bg-green-500" : "bg-gray-300"
                  )} />
                  <span>まとめで要点を整理</span>
                </div>
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
                  <span>プレビュー</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘P</kbd>
                </div>
                <div className="flex justify-between">
                  <span>保存</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘S</kbd>
                </div>
              </div>
            </div>

            {/* 公開チェックリスト */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-bold mb-3">📋 公開チェックリスト</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    "w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-xs",
                    article.title.length >= 5 
                      ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
                  )}>
                    {article.title.length >= 5 ? "✓" : "○"}
                  </span>
                  <span>適切なタイトル（5文字以上）</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    "w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-xs",
                    article.content.length >= 100 
                      ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
                  )}>
                    {article.content.length >= 100 ? "✓" : "○"}
                  </span>
                  <span>十分な内容（100文字以上）</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    "w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-xs",
                    article.tags.length > 0 
                      ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
                  )}>
                    {article.tags.length > 0 ? "✓" : "○"}
                  </span>
                  <span>関連タグの設定</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    "w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-xs",
                    validationStatus.errors.length === 0 
                      ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
                  )}>
                    {validationStatus.errors.length === 0 ? "✓" : "○"}
                  </span>
                  <span>バリデーション通過</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}