'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import Link from 'next/link';

type PostType = 'article' | 'book' | 'scrap' | 'series';

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useEnhancedAuth();
  const [activeTab, setActiveTab] = useState<PostType>('article');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [emoji, setEmoji] = useState('📝');
  const [isPublic, setIsPublic] = useState(true);
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // console.log削除（セキュリティ対応）
      if (activeTab === 'article') {
        router.push('/articles');
      } else if (activeTab === 'book') {
        router.push('/books');
      } else if (activeTab === 'scrap') {
        router.push('/scraps');
      } else {
        router.push('/');
      }
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags('');
    setEmoji('📝');
    setIsPublic(true);
    setPrice('');
  };

  const handleTabChange = (type: PostType) => {
    setActiveTab(type);
    resetForm();
  };

  const handleEmojiClick = () => {
    const emojis = ['📝', '🚀', '💡', '🎯', '📚', '💻', '🔥', '⚡', '✨', '🎉'];
    const currentIndex = emojis.indexOf(emoji);
    const nextIndex = (currentIndex + 1) % emojis.length;
    setEmoji(emojis[nextIndex]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">ログインが必要です</h2>
            <p className="text-gray-600 mb-6">
              投稿機能をご利用いただくには、ログインしてください。
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログインする
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg">
          {/* ヘッダー */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">新規投稿</h1>
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          {/* タブ */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange('article')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === 'article'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>📄</span>
                <span>記事</span>
              </span>
            </button>
            <button
              onClick={() => handleTabChange('book')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === 'book'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>📚</span>
                <span>本</span>
              </span>
            </button>
            <button
              onClick={() => handleTabChange('scrap')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === 'scrap'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>💭</span>
                <span>スクラップ</span>
              </span>
            </button>
            <button
              onClick={() => handleTabChange('series')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === 'series'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>📖</span>
                <span>連載</span>
              </span>
            </button>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* 絵文字とタイトル */}
              <div className="flex gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    絵文字
                  </label>
                  <button
                    type="button"
                    onClick={handleEmojiClick}
                    className="w-16 h-16 text-3xl border-2 border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    title="クリックで変更"
                  >
                    {emoji}
                  </button>
                </div>
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={
                      activeTab === 'article' ? '記事のタイトル' :
                      activeTab === 'book' ? '本のタイトル' :
                      activeTab === 'scrap' ? 'スクラップのタイトル' :
                      '連載のタイトル'
                    }
                    required
                  />
                </div>
              </div>

              {/* タグ (記事のみ) */}
              {activeTab === 'article' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タグ
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="React TypeScript Next.js（スペース区切り、最大5つ）"
                  />
                  <p className="text-xs text-gray-500 mt-1">関連するタグを追加して、記事を見つけやすくしましょう</p>
                </div>
              )}

              {/* 価格設定 (本のみ) */}
              {activeTab === 'book' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    価格設定
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={price === ''}
                        onChange={() => setPrice('')}
                        className="mr-2"
                      />
                      無料
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={price !== ''}
                        onChange={() => setPrice('500')}
                        className="mr-2"
                      />
                      有料
                    </label>
                    {price !== '' && (
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="価格（円）"
                        min="100"
                        step="100"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* 公開設定 (スクラップのみ) */}
              {activeTab === 'scrap' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公開設定
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={isPublic}
                        onChange={() => setIsPublic(true)}
                        className="mr-2"
                      />
                      🌐 公開
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!isPublic}
                        onChange={() => setIsPublic(false)}
                        className="mr-2"
                      />
                      🔒 限定公開
                    </label>
                  </div>
                </div>
              )}

              {/* 本文 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {activeTab === 'scrap' ? '最初のコメント' : 
                   activeTab === 'series' ? '連載の説明' : '本文'} 
                  <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <MarkdownEditor
                    value={content}
                    onChange={setContent}
                    placeholder={
                      activeTab === 'article' ? '記事の内容をMarkdownで入力...' :
                      activeTab === 'scrap' ? 'スクラップの最初のコメントを入力...' :
                      activeTab === 'book' ? '本の概要を入力...' :
                      '連載の説明を入力...'
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Markdown記法が使用できます
                </p>
              </div>

              {/* プレビューエリア */}
              {content && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">プレビュー</h3>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{emoji}</span>
                      <h2 className="text-lg font-bold">{title || 'タイトル'}</h2>
                    </div>
                    {tags && activeTab === 'article' && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tags.split(' ').slice(0, 5).map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{content}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ボタン */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Link
                  href="/"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  キャンセル
                </Link>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    下書き保存
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title || !content}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? '投稿中...' : (
                      activeTab === 'book' ? '本を作成' : 
                      activeTab === 'scrap' ? 'スクラップを作成' :
                      activeTab === 'series' ? '連載を開始' : '記事を公開'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}