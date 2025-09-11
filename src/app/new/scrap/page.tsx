'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { scrapsApi } from '@/lib/api'

export default function NewScrapPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [emoji, setEmoji] = useState('💭')
  const [topics, setTopics] = useState<string[]>([])
  const [currentTopic, setCurrentTopic] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const commonEmojis = ['💭', '💡', '🤔', '📝', '🔍', '⚡', '🚀', '🎯', '🔧', '💻']

  const handleAddTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()])
      setCurrentTopic('')
    }
  }

  const handleRemoveTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    if (!content.trim()) {
      setError('内容を入力してください')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const slug = title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
      
      await scrapsApi.createScrap({
        title,
        slug,
        content,
        emoji,
        topics,
        closed: false
      })

      router.push('/scraps')
    } catch (err: any) {
      // エラーログ削除（セキュリティ対応）
      setError(err.message || 'スクラップの作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/scraps" className="text-blue-600 hover:text-blue-800">
            ← スクラップ一覧に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">新しいスクラップを作成</h1>
          <p className="text-gray-600 mb-8">アイデアや疑問を気軽に共有しましょう</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                絵文字
              </label>
              <div className="flex gap-2 mb-2">
                {commonEmojis.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`text-2xl p-2 rounded-lg border ${
                      emoji === e 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: Next.js 14でのSSRについて質問"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                トピック
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentTopic}
                  onChange={(e) => setCurrentTopic(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTopic()
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="トピックを入力してEnter"
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  追加
                </button>
              </div>
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topics.map(topic => (
                    <span
                      key={topic}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(topic)}
                        className="hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={15}
                placeholder="アイデアや疑問を自由に書いてください...&#10;&#10;Markdown形式で記述できます。"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 スクラップとは？</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 完成していないアイデアや疑問を気軽に投稿できます</li>
                <li>• コメントで他のユーザーと議論できます</li>
                <li>• 後から内容を編集・追記できます</li>
                <li>• 議論が終わったらクローズできます</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/scraps"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '作成中...' : 'スクラップを作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}