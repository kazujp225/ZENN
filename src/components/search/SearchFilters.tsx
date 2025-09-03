'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import clsx from 'clsx'
import type { SearchFilters as SearchFiltersType, SearchType, SortBy, DateRange } from '@/hooks/useSearch'

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: Partial<SearchFiltersType>) => void
  onReset: () => void
  activeCount: number
  totalResults: number
}

const popularTags = [
  'Next.js', 'React', 'TypeScript', 'JavaScript', 'Node.js',
  'Python', 'Go', 'Rust', 'Vue.js', 'Angular', 'Svelte',
  'Docker', 'AWS', 'Firebase', 'GraphQL', 'REST API',
  'UI/UX', 'フロントエンド', 'バックエンド', 'Web開発'
]

const popularAuthors = [
  'developer1', 'developer2', 'developer3', 'tech_expert',
  'frontend_guru', 'backend_master', 'design_pro', 'startup_founder'
]

export function SearchFilters({
  filters,
  onFiltersChange,
  onReset,
  activeCount,
  totalResults
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [tagSearch, setTagSearch] = useState('')
  const [authorSearch, setAuthorSearch] = useState('')

  const filteredTags = popularTags.filter(tag =>
    tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !filters.tags.includes(tag)
  )

  const filteredAuthors = popularAuthors.filter(author =>
    author.toLowerCase().includes(authorSearch.toLowerCase()) &&
    !filters.authors.includes(author)
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* フィルターヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="font-medium">フィルター</h3>
          {activeCount > 0 && (
            <Badge variant="primary" className="text-xs">
              {activeCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {totalResults.toLocaleString()}件
          </span>
          {activeCount > 0 && (
            <Button
              variant="ghost"
size="small"
              onClick={onReset}
              className="text-sm"
            >
              リセット
            </Button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg 
              className={clsx('w-5 h-5 transition-transform', isExpanded && 'rotate-180')}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 基本フィルター（常に表示） */}
      <div className="p-4 space-y-4">
        {/* タイプフィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            コンテンツタイプ
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all' as SearchType, label: 'すべて', icon: '📝' },
              { key: 'articles' as SearchType, label: '記事', icon: '📄' },
              { key: 'books' as SearchType, label: '本', icon: '📚' },
              { key: 'scraps' as SearchType, label: 'スクラップ', icon: '💭' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => onFiltersChange({ type: key })}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  filters.type === key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ソート */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            並び順
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ sortBy: e.target.value as SortBy })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="relevant">関連度順</option>
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="popular">人気順</option>
          </select>
        </div>
      </div>

      {/* 詳細フィルター（展開時のみ表示） */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-6">
          {/* 日付範囲 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投稿日
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all' as DateRange, label: '全期間' },
                { key: 'week' as DateRange, label: '1週間' },
                { key: 'month' as DateRange, label: '1ヶ月' },
                { key: 'year' as DateRange, label: '1年' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => onFiltersChange({ dateRange: key })}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm transition-colors',
                    filters.dateRange === key
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* タグフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            
            {/* 選択済みタグ */}
            {filters.tags.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => onFiltersChange({
                        tags: filters.tags.filter(t => t !== tag)
                      })}
                      className="flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs rounded cursor-pointer"
                    >
                      {tag}
                      <span className="hover:text-red-300">×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* タグ検索 */}
            <input
              type="text"
              placeholder="タグを検索..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
            />

            {/* タグ候補 */}
            <div className="max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {filteredTags.slice(0, 20).map(tag => (
                  <button
                    key={tag}
                    onClick={() => onFiltersChange({
                      tags: [...filters.tags, tag]
                    })}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 作者フィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作者
            </label>

            {/* 選択済み作者 */}
            {filters.authors.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {filters.authors.map(author => (
                    <button
                      key={author}
                      onClick={() => onFiltersChange({
                        authors: filters.authors.filter(a => a !== author)
                      })}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded cursor-pointer"
                    >
                      @{author}
                      <span className="hover:text-red-600">×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 作者検索 */}
            <input
              type="text"
              placeholder="作者を検索..."
              value={authorSearch}
              onChange={(e) => setAuthorSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
            />

            {/* 作者候補 */}
            <div className="max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {filteredAuthors.slice(0, 10).map(author => (
                  <button
                    key={author}
                    onClick={() => onFiltersChange({
                      authors: [...filters.authors, author]
                    })}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    @{author}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 詳細設定 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">詳細設定</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  フォロー中の作者のみ
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  いいねした投稿のみ
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  無料コンテンツのみ
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}