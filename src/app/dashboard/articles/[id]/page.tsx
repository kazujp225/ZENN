'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getArticleById, saveArticle, type Article } from '@/utils/articleStore'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { Badge } from '@/components/ui/Badge'
import clsx from 'clsx'

export default function EditArticleDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [resolved, setResolved] = useState<{ id: string } | null>(null)
  const [article, setArticle] = useState<Article | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    params.then(p => setResolved(p))
  }, [params])

  useEffect(() => {
    if (!resolved?.id) return
    const a = getArticleById(resolved.id)
    if (!a) {
      alert('記事が見つかりませんでした')
      router.push('/dashboard/articles')
      return
    }
    setArticle(a)
  }, [resolved, router])

  const hasContent = useMemo(() => !!article?.title.trim() && !!article?.content.trim(), [article])

  const update = (updates: Partial<Article>) => {
    if (!article) return
    setArticle(prev => ({ ...prev!, ...updates }))
  }

  const addTag = () => {
    if (!article) return
    if (tagInput.trim() && !article.tags.includes(tagInput.trim()) && article.tags.length < 5) {
      update({ tags: [...article.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    if (!article) return
    update({ tags: article.tags.filter(t => t !== tag) })
  }

  const handleSave = async () => {
    if (!article) return
    setIsSaving(true)
    try {
      const updated: Article = { ...article, updatedAt: new Date().toISOString() }
      saveArticle(updated)
      setArticle(updated)
      alert('保存しました')
    } finally {
      setIsSaving(false)
    }
  }

  const togglePublish = async () => {
    if (!article) return
    const updated: Article = { ...article, published: !article.published, updatedAt: new Date().toISOString() }
    saveArticle(updated)
    setArticle(updated)
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard/articles')} className="px-3 py-1.5 rounded-lg hover:bg-gray-100">← 戻る</button>
            <div className="text-gray-500 text-sm">ID: {article.id}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={togglePublish}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium border',
                article.published ? 'border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100' : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
              )}
            >{article.published ? '下書きにする' : '公開する'}</button>
            <button
              onClick={handleSave}
              disabled={!hasContent || isSaving}
              className={clsx('px-5 py-2 rounded-lg text-sm font-medium text-white', hasContent ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400', 'disabled:opacity-60')}
            >{isSaving ? '保存中...' : '保存'}</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <button
                onClick={() => {
                  const emojis = ['📝','💡','🚀','⚡','🎯','🔥','✨','📊','🛠️','🎨']
                  update({ emoji: emojis[Math.floor(Math.random()*emojis.length)] })
                }}
                className="text-4xl hover:scale-110 transition-transform p-2"
              >
                {article.emoji}
              </button>
              <input
                value={article.title}
                onChange={e=>update({ title: e.target.value })}
                placeholder="記事のタイトル"
                className="flex-1 text-2xl font-bold border-none outline-none placeholder-gray-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">記事タイプ</label>
              <div className="flex gap-3">
                <button
                  onClick={()=>update({ type: 'tech' })}
                  className={clsx('px-4 py-2 text-sm rounded-lg', article.type==='tech' ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                >💻 Tech</button>
                <button
                  onClick={()=>update({ type: 'idea' })}
                  className={clsx('px-4 py-2 text-sm rounded-lg', article.type==='idea' ? 'bg-orange-100 text-orange-700 border-2 border-orange-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                >💡 Idea</button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">タグ ({article.tags.length}/5)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {article.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button onClick={()=>removeTag(tag)} className="hover:text-red-600 ml-1">×</button>
                  </Badge>
                ))}
              </div>
              {article.tags.length < 5 && (
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={e=>setTagInput(e.target.value)}
                    onKeyDown={e=> e.key==='Enter' && (e.preventDefault(), addTag())}
                    placeholder="タグを入力"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button onClick={addTag} disabled={!tagInput.trim()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50">追加</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden">
            <MarkdownEditor value={article.content} onChange={(content)=>update({ content })} minHeight="500px" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-4 text-sm text-gray-600">
            <div className="flex justify-between py-1"><span>作成日</span><span>{new Date(article.createdAt).toLocaleString()}</span></div>
            <div className="flex justify-between py-1"><span>更新日</span><span>{new Date(article.updatedAt).toLocaleString()}</span></div>
            <div className="flex justify-between py-1"><span>状態</span><span>{article.published ? '公開' : '下書き'}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

