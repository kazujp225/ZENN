'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // サンプルの検索候補
  const getSuggestions = (searchQuery: string) => {
    if (!searchQuery) return []
    
    // 実際はAPIから取得
    const allSuggestions = [
      { type: 'article', title: 'Next.js 14の新機能まとめ', emoji: '🚀', url: '/articles/nextjs-14' },
      { type: 'article', title: 'TypeScriptの型パズル', emoji: '🧩', url: '/articles/typescript-puzzle' },
      { type: 'book', title: 'ゼロから学ぶReact', emoji: '📘', url: '/books/react-guide' },
      { type: 'scrap', title: 'SSGとISRの使い分け', emoji: '💭', url: '/scraps/ssg-isr' },
      { type: 'user', title: '田中太郎', emoji: '👤', url: '/@tanaka' },
      { type: 'tag', title: 'Next.js', emoji: '🏷️', url: '/topics/nextjs' },
      { type: 'tag', title: 'TypeScript', emoji: '🏷️', url: '/topics/typescript' },
      { type: 'tag', title: 'React', emoji: '🏷️', url: '/topics/react' }
    ]
    
    return allSuggestions.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query) {
        setSuggestions(getSuggestions(query))
        setIsOpen(true)
      } else {
        setSuggestions([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setQuery('')
      setIsOpen(false)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return '記事'
      case 'book': return '本'
      case 'scrap': return 'スクラップ'
      case 'user': return 'ユーザー'
      case 'tag': return 'タグ'
      default: return ''
    }
  }

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="検索..."
            className="w-full px-4 py-2 pl-10 pr-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </form>

      {/* 検索候補ドロップダウン */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border overflow-hidden z-50">
          {suggestions.map((item, index) => (
            <Link
              key={index}
              href={item.url}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              onClick={() => {
                setQuery('')
                setIsOpen(false)
              }}
            >
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-muted">{getTypeLabel(item.type)}</div>
              </div>
            </Link>
          ))}
          
          <div className="px-4 py-2 bg-gray-50 border-t">
            <button
              onClick={handleSearch}
              className="text-sm text-primary hover:underline"
            >
              「{query}」で検索
            </button>
          </div>
        </div>
      )}
    </div>
  )
}