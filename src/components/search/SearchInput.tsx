'use client'

import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  suggestions: string[]
  onSuggestionSelect: (suggestion: string) => void
  onGetSuggestions: (query: string) => void
  placeholder?: string
  disabled?: boolean
  history: string[]
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  suggestions,
  onSuggestionSelect,
  onGetSuggestions,
  placeholder = '記事、本、スクラップを検索',
  disabled = false,
  history
}: SearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // 入力変更時の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    onGetSuggestions(newValue)
    setFocusedIndex(-1)
    
    if (newValue.trim()) {
      setShowSuggestions(true)
    }
  }

  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return

    const allSuggestions = [...suggestions, ...history]
    const maxIndex = allSuggestions.length - 1

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => (prev < maxIndex ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : maxIndex))
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && allSuggestions[focusedIndex]) {
          onSuggestionSelect(allSuggestions[focusedIndex])
          setShowSuggestions(false)
        } else {
          onSubmit()
          setShowSuggestions(false)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setFocusedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // フォーカス処理
  const handleFocus = () => {
    if (value || history.length > 0) {
      setShowSuggestions(true)
    }
  }

  // 外部クリックで候補を非表示
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const allSuggestions = [...suggestions, ...history]
  const displayedSuggestions = allSuggestions.slice(0, 8)

  return (
    <div className="relative">
      {/* 検索入力 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            'w-full pl-12 pr-12 py-3 text-lg',
            'border border-gray-300 rounded-xl',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        />
        
        {/* 検索アイコン */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* クリアボタン */}
        {value && (
          <button
            onClick={() => {
              onChange('')
              setShowSuggestions(false)
              inputRef.current?.focus()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 検索候補 */}
      {showSuggestions && displayedSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
        >
          {suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                検索候補
              </div>
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <button
                  key={`suggestion-${suggestion}`}
                  onClick={() => {
                    onSuggestionSelect(suggestion)
                    setShowSuggestions(false)
                  }}
                  className={clsx(
                    'w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors',
                    'flex items-center gap-3',
                    focusedIndex === index && 'bg-blue-50'
                  )}
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="flex-1">{suggestion}</span>
                  <span className="text-xs text-gray-400">候補</span>
                </button>
              ))}
            </div>
          )}

          {history.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                検索履歴
              </div>
              {history.slice(0, 5).map((item, index) => {
                const actualIndex = suggestions.length + index
                return (
                  <button
                    key={`history-${item}`}
                    onClick={() => {
                      onSuggestionSelect(item)
                      setShowSuggestions(false)
                    }}
                    className={clsx(
                      'w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors',
                      'flex items-center gap-3',
                      focusedIndex === actualIndex && 'bg-blue-50'
                    )}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1">{item}</span>
                    <span className="text-xs text-gray-400">履歴</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 検索のヒント */}
      {!value && !showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 text-sm text-gray-500">
          <div className="flex flex-wrap gap-2">
            <span>人気: </span>
            {['Next.js', 'React', 'TypeScript'].map(term => (
              <button
                key={term}
                onClick={() => onSuggestionSelect(term)}
                className="text-primary hover:underline"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}