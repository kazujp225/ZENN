'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { MarkdownEditor } from '../editor/MarkdownEditor';

interface PostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogin?: () => void;
}

type PostType = 'article' | 'book' | 'scrap' | 'series';

export const PostingModal = ({ isOpen, onClose, isLoggedIn, onLogin }: PostingModalProps) => {
  const [activeTab, setActiveTab] = useState<PostType>('article');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [emoji, setEmoji] = useState('📝');
  const [isPublic, setIsPublic] = useState(true);
  const [price, setPrice] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting:', { type: activeTab, title, content, tags, emoji, isPublic, price });
    onClose();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">投稿を作成</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isLoggedIn ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-4">ログインが必要です</h3>
            <p className="text-gray-600 mb-6">
              投稿機能をご利用いただくには、ログインしてください。
            </p>
            <button
              onClick={onLogin}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログインする
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="border-b">
              <div className="flex gap-1 px-6 pt-4">
                {(['article', 'book', 'scrap', 'series'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTabChange(type)}
                    className={clsx(
                      'px-4 py-2 font-medium rounded-t-lg transition-colors',
                      activeTab === type
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    {type === 'article' && '記事'}
                    {type === 'book' && '本'}
                    {type === 'scrap' && 'スクラップ'}
                    {type === 'series' && '連載'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {activeTab === 'article' && (
                <>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        絵文字
                      </label>
                      <input
                        type="text"
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        className="w-16 h-16 text-3xl text-center border rounded-lg focus:ring-2 focus:ring-blue-500"
                        maxLength={2}
                      />
                    </div>
                    <div className="flex-grow">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        記事のタイトル
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="記事のタイトルを入力"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タグ（スペース区切り）
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="例: React TypeScript Next.js"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      本文（Markdown）
                    </label>
                    <MarkdownEditor
                      value={content}
                      onChange={setContent}
                      placeholder="記事の内容をMarkdownで入力..."
                    />
                  </div>
                </>
              )}

              {activeTab === 'book' && (
                <>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        絵文字
                      </label>
                      <input
                        type="text"
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        className="w-16 h-16 text-3xl text-center border rounded-lg focus:ring-2 focus:ring-blue-500"
                        maxLength={2}
                      />
                    </div>
                    <div className="flex-grow">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        本のタイトル
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="本のタイトルを入力"
                        required
                      />
                    </div>
                  </div>
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
                          className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="価格（円）"
                          min="100"
                          step="100"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      概要
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                      placeholder="本の概要を入力..."
                    />
                  </div>
                </>
              )}

              {activeTab === 'scrap' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      スクラップのタイトル
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="スクラップのタイトルを入力"
                      required
                    />
                  </div>
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
                        公開
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!isPublic}
                          onChange={() => setIsPublic(false)}
                          className="mr-2"
                        />
                        限定公開
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最初のコメント
                    </label>
                    <MarkdownEditor
                      value={content}
                      onChange={setContent}
                      placeholder="スクラップの最初のコメントを入力..."
                    />
                  </div>
                </>
              )}

              {activeTab === 'series' && (
                <>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        絵文字
                      </label>
                      <input
                        type="text"
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        className="w-16 h-16 text-3xl text-center border rounded-lg focus:ring-2 focus:ring-blue-500"
                        maxLength={2}
                      />
                    </div>
                    <div className="flex-grow">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        連載のタイトル
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="連載のタイトルを入力"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      連載の説明
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                      placeholder="連載の説明を入力..."
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {activeTab === 'book' ? '本を作成' : 
                   activeTab === 'scrap' ? 'スクラップを作成' :
                   activeTab === 'series' ? '連載を作成' : '記事を作成'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};