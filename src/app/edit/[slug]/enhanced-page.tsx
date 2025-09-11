'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { MarkdownContent } from '@/components/article/MarkdownContent'
import { Badge } from '@/components/ui/Badge'
import { ArticleValidator, type ArticleDraft, type ArticleValidationResult } from '@/utils/articleValidator'
import clsx from 'clsx'

interface EnhancedArticleDraft extends ArticleDraft {
  id: string
  publishedAt?: string
  updatedAt?: string
  version: number
  editHistory: EditHistoryEntry[]
}

interface EditHistoryEntry {
  id: string
  timestamp: string
  field: string
  oldValue: string
  newValue: string
  reason?: string
}

interface ValidationStatus {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    severity: 'error' | 'warning'
  }>
  warnings: Array<{
    field: string
    message: string
  }>
  changesSinceLastValidation: boolean
}

// サンプル記事データ（実際はAPIから取得）
const getArticleForEdit = (slug: string): EnhancedArticleDraft => {
  return {
    id: slug,
    title: 'Next.js 14の新機能まとめ - App Routerの進化と最新のベストプラクティス',
    emoji: '🚀',
    type: 'tech',
    tags: ['Next.js', 'React', 'TypeScript', 'Web開発'],
    content: `# はじめに

Next.js 14がリリースされ、App Routerがさらに進化しました。本記事では、Next.js 14の新機能と、実際のプロジェクトで使えるベストプラクティスについて解説します。

## Partial Prerendering (PPR)

Partial Prerenderingは、静的レンダリングと動的レンダリングを組み合わせた新しいレンダリング手法です。

\`\`\`tsx
// app/page.tsx
export const experimental_ppr = true

export default async function Page() {
  // 静的にレンダリングされる部分
  const staticContent = <StaticComponent />
  
  // 動的にレンダリングされる部分
  const dynamicContent = <Suspense fallback={<Loading />}>
    <DynamicComponent />
  </Suspense>
  
  return (
    <div>
      {staticContent}
      {dynamicContent}
    </div>
  )
}
\`\`\`

### PPRのメリット

- **初期表示の高速化**: 静的部分が即座に表示される
- **SEOの改善**: 静的コンテンツが事前レンダリングされる  
- **動的データの鮮度**: 動的部分は常に最新のデータを表示

## まとめ

Next.js 14は、開発体験とパフォーマンスの両面で大幅な改善をもたらしました。特にPPRとServer Actionsの組み合わせにより、より高速でインタラクティブなWebアプリケーションの構築が可能になりました。`,
    published: true,
    publishedAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-16T14:30:00Z',
    version: 2,
    editHistory: [
      {
        id: '1',
        timestamp: '2025-01-15T10:00:00Z',
        field: 'content',
        oldValue: '',
        newValue: 'Initial creation',
        reason: 'Initial publication'
      },
      {
        id: '2', 
        timestamp: '2025-01-16T14:30:00Z',
        field: 'content',
        oldValue: 'Previous content',
        newValue: 'Updated content',
        reason: 'Added more examples'
      }
    ]
  }
}

export default function EnhancedEditArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const router = useRouter()
  const [paramsResolved, setParamsResolved] = useState<{ slug: string } | null>(null)
  
  const [article, setArticle] = useState<EnhancedArticleDraft | null>(null)
  const [originalArticle, setOriginalArticle] = useState<EnhancedArticleDraft | null>(null)
  const [currentView, setCurrentView] = useState<'edit' | 'preview' | 'history'>('edit')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    isValid: true,
    errors: [],
    warnings: [],
    changesSinceLastValidation: false
  })
  const [readabilityStats, setReadabilityStats] = useState<ReturnType<typeof ArticleValidator.analyzeReadability> | null>(null)
  const [showValidationPanel, setShowValidationPanel] = useState(false)
  const [isLoadingArticle, setIsLoadingArticle] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // URLパラメータの解決
  useEffect(() => {
    params.then(resolved => setParamsResolved(resolved))
  }, [params])

  // リアルタイムバリデーション
  const validateArticle = useCallback(() => {
    if (!article) return
    
    const validation = ArticleValidator.validateArticle(article)
    const stats = ArticleValidator.analyzeReadability(article.content)
    
    setValidationStatus(prev => ({
      isValid: validation.isValid,
      errors: validation.errors.map(error => ({
        ...error,
        severity: error.field === 'seo' ? 'warning' as const : 'error' as const
      })),
      warnings: validation.errors
        .filter(error => error.field === 'seo')
        .map(error => ({ field: error.field, message: error.message })),
      changesSinceLastValidation: false
    }))
    
    setReadabilityStats(stats)
  }, [article])

  // デバウンス付きバリデーション
  useEffect(() => {
    if (!article) return
    
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }
    
    setValidationStatus(prev => ({ ...prev, changesSinceLastValidation: true }))
    
    validationTimeoutRef.current = setTimeout(validateArticle, 800)
    
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [validateArticle])

  // 記事データの読み込み
  useEffect(() => {
    if (!paramsResolved) return
    
    const loadArticle = async () => {
      setIsLoadingArticle(true)
      setLoadError(null)
      
      try {
        // APIから記事を取得
        await new Promise(resolve => setTimeout(resolve, 800)) // ローディング演出
        const articleData = getArticleForEdit(paramsResolved.slug)
        
        if (!articleData) {
          throw new Error('記事が見つかりません')
        }
        
        setArticle(articleData)
        setOriginalArticle(structuredClone(articleData))
        setLastSaved(new Date(articleData.updatedAt!))
        
        // 初回バリデーション
        setTimeout(validateArticle, 100)
        
      } catch (error) {
        // エラーログ削除（セキュリティ対応）
        setLoadError(error instanceof Error ? error.message : '記事の読み込みに失敗しました')
      } finally {
        setIsLoadingArticle(false)
      }
    }

    loadArticle()
  }, [paramsResolved, router, validateArticle])

  // 変更検知（深い比較）
  useEffect(() => {
    if (article && originalArticle) {
      const articlesToCompare = {
        title: article.title,
        emoji: article.emoji,
        type: article.type,
        tags: [...article.tags].sort(),
        content: article.content
      }
      
      const originalToCompare = {
        title: originalArticle.title,
        emoji: originalArticle.emoji,
        type: originalArticle.type,
        tags: [...originalArticle.tags].sort(),
        content: originalArticle.content
      }
      
      const changed = JSON.stringify(articlesToCompare) !== JSON.stringify(originalToCompare)
      setHasChanges(changed)
    }
  }, [article, originalArticle])

  // 改良版自動保存
  const saveChanges = useCallback(async (showNotification = false) => {
    if (!article || !hasChanges) return false

    setIsSaving(true)
    try {
      // バリデーション実行
      const validation = ArticleValidator.validateArticle(article)
      
      // 変更履歴の記録
      const changeHistory: EditHistoryEntry[] = []
      if (originalArticle) {
        if (article.title !== originalArticle.title) {
          changeHistory.push({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            field: 'title',
            oldValue: originalArticle.title,
            newValue: article.title
          })
        }
        if (article.content !== originalArticle.content) {
          changeHistory.push({
            id: (Date.now() + 1).toString(),
            timestamp: new Date().toISOString(),
            field: 'content',
            oldValue: 'Content changed',
            newValue: 'Content updated'
          })
        }
      }
      
      const updatedArticle = {
        ...article,
        updatedAt: new Date().toISOString(),
        version: article.version + 1,
        editHistory: [...article.editHistory, ...changeHistory]
      }

      // APIに保存
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      setArticle(updatedArticle)
      setOriginalArticle(structuredClone(updatedArticle))
      setLastSaved(new Date())
      setHasChanges(false)
      
      if (showNotification) {
        showNotificationMessage('変更を保存しました', 'success')
      }
      
      return true
      
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      showNotificationMessage('保存に失敗しました', 'error')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [article, hasChanges, originalArticle])

  // デバウンス付き自動保存
  useEffect(() => {
    if (!hasChanges || !article) return
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges(false)
    }, 5000)
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [hasChanges, saveChanges, article])

  // 記事の更新
  const updateArticle = (updates: Partial<EnhancedArticleDraft>) => {
    if (!article) return
    setArticle(prev => ({ ...prev!, ...updates }))
  }

  // 高度なタグ管理
  const addTag = () => {
    if (!article) return
    
    const trimmedTag = tagInput.trim()
    
    if (!trimmedTag) {
      showNotificationMessage('タグを入力してください', 'warning')
      return
    }
    
    if (article.tags.length >= 5) {
      showNotificationMessage('タグは5個まで追加できます', 'warning')
      return
    }
    
    if (article.tags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase())) {
      showNotificationMessage('このタグは既に追加されています', 'warning')
      return
    }
    
    if (trimmedTag.length > 20) {
      showNotificationMessage('タグは20文字以内にしてください', 'warning')
      return
    }
    
    // タグの不適切チェック
    const inappropriateTags = ['spam', 'adult', 'nsfw', '18+', 'xxx', 'hack', 'crack', 'piracy', 'illegal']
    if (inappropriateTags.some(inappropriate => trimmedTag.toLowerCase().includes(inappropriate))) {
      showNotificationMessage('このタグは使用できません', 'error')
      return
    }
    
    updateArticle({ 
      tags: [...article.tags, trimmedTag] 
    })
    setTagInput('')
  }

  // タグの削除
  const removeTag = (tagToRemove: string) => {
    if (!article) return
    updateArticle({
      tags: article.tags.filter(tag => tag !== tagToRemove)
    })
  }

  // 絵文字の変更
  const handleEmojiChange = (emoji?: string) => {
    if (emoji) {
      updateArticle({ emoji })
    } else {
      const emojis = ['📝', '💡', '🚀', '⚡', '🎯', '🔥', '✨', '📊', '🛠️', '🎨', '💻', '📱', '🌟', '🎉', '💪']
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      updateArticle({ emoji: randomEmoji })
    }
  }

  // 改良版公開機能
  const publishChanges = async () => {
    if (!article || !hasChanges) return

    // 最終バリデーション
    const validation = ArticleValidator.validateArticle(article)
    
    if (!validation.isValid) {
      setShowValidationPanel(true)
      showNotificationMessage('公開前にエラーを修正してください', 'error')
      return
    }

    // 警告の確認
    const warnings = validation.errors.filter(error => error.field === 'seo')
    if (warnings.length > 0) {
      const confirmPublish = confirm(
        `SEOに関する改善提案があります。それでも公開しますか？\n\n${warnings.map(w => `• ${w.message}`).join('\n')}`
      )
      if (!confirmPublish) return
    }

    setIsPublishing(true)
    try {
      // まず保存
      const saved = await saveChanges(false)
      if (!saved) {
        throw new Error('保存に失敗しました')
      }

      // 公開処理
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      showNotificationMessage('記事を更新しました！', 'success')
      
      setTimeout(() => {
        router.push(`/articles/${article.id}`)
      }, 1000)
      
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      showNotificationMessage('記事の更新に失敗しました', 'error')
    } finally {
      setIsPublishing(false)
    }
  }

  // 手動保存
  const manualSave = async () => {
    const success = await saveChanges(true)
    if (!success && !hasChanges) {
      showNotificationMessage('保存する変更がありません', 'info')
    }
  }

  // 通知システム
  const showNotificationMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500', 
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }
    
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm animate-slide-in`
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.classList.add('animate-fade-out')
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 300)
      }
    }, 4000)
  }

  // 変更の破棄
  const discardChanges = () => {
    if (!originalArticle || !hasChanges) return
    
    const confirmDiscard = confirm('未保存の変更を破棄してもよろしいですか？この操作は取り消せません。')
    if (!confirmDiscard) return
    
    setArticle(structuredClone(originalArticle))
    setHasChanges(false)
    showNotificationMessage('変更を破棄しました', 'info')
  }

  // ページ離脱時の警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = '未保存の変更があります。ページを離れてもよろしいですか？'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  // キーボードショートカット
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            manualSave()
            break
          case 'p':
            e.preventDefault()
            setCurrentView(currentView === 'preview' ? 'edit' : 'preview')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [currentView, manualSave])

  // ローディング状態
  if (isLoadingArticle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">記事を読み込み中...</p>
        </div>
      </div>
    )
  }

  // エラー状態
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">記事の読み込みに失敗しました</h1>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              再読み込み
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!article) return null

  const canPublish = validationStatus.isValid && hasChanges

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
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  {isSaving ? (
                    <span className="flex items-center gap-1 text-blue-600">
                      <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full" />
                      保存中...
                    </span>
                  ) : hasChanges ? (
                    <span className="flex items-center gap-1 text-orange-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      未保存の変更あり
                    </span>
                  ) : lastSaved ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {new Date(lastSaved).toLocaleTimeString()}に保存済み
                    </span>
                  ) : null}
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
                  {validationStatus.changesSinceLastValidation ? (
                    <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
                  ) : (
                    validationStatus.isValid ? '✓' : '⚠'
                  )}
                  {validationStatus.errors.length === 0 ? '検証OK' : `${validationStatus.errors.length}個の問題`}
                </button>
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
                <button
                  onClick={() => setCurrentView('history')}
                  className={clsx(
                    'px-3 py-1 text-sm rounded-md transition-colors',
                    currentView === 'history'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  履歴
                </button>
              </div>

              {/* アクション */}
              {hasChanges && (
                <button
                  onClick={discardChanges}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  変更を破棄
                </button>
              )}
              
              <button
                onClick={manualSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
                title="Ctrl+S または Cmd+S"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
              
              <button
                onClick={publishChanges}
                disabled={isPublishing || !canPublish}
                className={clsx(
                  'px-6 py-2 text-sm font-medium rounded-lg transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  'disabled:cursor-not-allowed',
                  canPublish && !isPublishing
                    ? 'bg-primary text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500'
                )}
                title={!canPublish ? '変更があり、検証をクリアした場合のみ公開できます' : '記事を更新'}
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
                {/* 記事ステータス */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-green-800 font-medium">公開済み記事を編集中</span>
                      <span className="text-sm text-gray-500">
                        v{article.version}
                      </span>
                    </div>
                    {hasChanges && (
                      <div className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        未保存の変更があります
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span>公開日: </span>
                      <span>{new Date(article.publishedAt!).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span>最終更新: </span>
                      <span>{new Date(article.updatedAt!).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

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
            ) : currentView === 'preview' ? (
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
                  
                  <div className="text-sm text-gray-500 border-l-2 border-gray-200 pl-4">
                    <div>公開日: {new Date(article.publishedAt!).toLocaleDateString()}</div>
                    <div>最終更新: {new Date(article.updatedAt!).toLocaleDateString()}</div>
                    <div>バージョン: {article.version}</div>
                  </div>
                </div>
                
                <MarkdownContent content={article.content} />
              </div>
            ) : (
              /* 編集履歴 */
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-6">編集履歴</h2>
                <div className="space-y-4">
                  {article.editHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">編集履歴がありません</p>
                  ) : (
                    article.editHistory.slice().reverse().map((entry, index) => (
                      <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {entry.field === 'title' ? 'タイトル変更' :
                               entry.field === 'content' ? 'コンテンツ更新' :
                               entry.field === 'tags' ? 'タグ変更' : entry.field}
                            </span>
                            {entry.reason && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {entry.reason}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {entry.field === 'content' ? (
                          <div className="text-sm text-gray-600">
                            コンテンツが更新されました
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-red-600">- {entry.oldValue}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-green-600">+ {entry.newValue}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
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
                  <span>バージョン</span>
                  <span className="font-medium">v{article.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>変更状態</span>
                  <span className={hasChanges ? 'text-orange-600' : 'text-green-600'}>
                    {hasChanges ? '未保存' : '保存済み'}
                  </span>
                </div>
              </div>
            </div>

            {/* ショートカット */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-bold mb-3">⌨️ ショートカット</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>保存</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘S</kbd>
                </div>
                <div className="flex justify-between">
                  <span>プレビュー</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘P</kbd>
                </div>
                <div className="flex justify-between">
                  <span>太字</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘B</kbd>
                </div>
                <div className="flex justify-between">
                  <span>イタリック</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘I</kbd>
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
                    showNotificationMessage('URLをコピーしました', 'info')
                  }}
                  className="block text-sm text-gray-600 hover:text-gray-800 w-full text-left"
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