'use client'

import { useState, useRef, useCallback } from 'react'
import clsx from 'clsx'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  disabled?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Markdownで記事を書いてください',
  minHeight = '300px',
  disabled = false
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // テキストエリアのリサイズ処理
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.max(textarea.scrollHeight, 300) + 'px'
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    adjustHeight()
  }

  // キーボードショートカット
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          insertFormatting('**', '**')
          break
        case 'i':
          e.preventDefault()
          insertFormatting('_', '_')
          break
        case 'k':
          e.preventDefault()
          insertFormatting('[', '](url)')
          break
      }
    }

    // Tab キーでインデント
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      })
    }
  }

  // フォーマット挿入
  const insertFormatting = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)
    
    const newText = beforeText + prefix + selectedText + suffix + afterText
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length)
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length)
      }
    })
  }

  // ドラッグ&ドロップでのファイルアップロード
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    imageFiles.forEach(file => {
      // TODO: 実際のファイルアップロード処理
      const imagePlaceholder = `![${file.name}](uploading...)`
      onChange(value + '\n' + imagePlaceholder)
    })
  }

  // ツールバーボタン
  const ToolbarButton = ({ 
    onClick, 
    children, 
    title 
  }: { 
    onClick: () => void
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        'p-2 rounded hover:bg-gray-100 transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1'
      )}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* ツールバー */}
      <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => insertFormatting('# ', '')}
            title="見出し1 (H1)"
          >
            <span className="font-bold text-lg">H1</span>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => insertFormatting('## ', '')}
            title="見出し2 (H2)"
          >
            <span className="font-bold">H2</span>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => insertFormatting('### ', '')}
            title="見出し3 (H3)"
          >
            <span className="font-medium text-sm">H3</span>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <ToolbarButton
            onClick={() => insertFormatting('**', '**')}
            title="太字 (Cmd+B)"
          >
            <span className="font-bold">B</span>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => insertFormatting('_', '_')}
            title="イタリック (Cmd+I)"
          >
            <span className="italic">I</span>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => insertFormatting('`', '`')}
            title="コード"
          >
            <span className="font-mono text-sm">&lt;/&gt;</span>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <ToolbarButton
            onClick={() => insertFormatting('[', '](url)')}
            title="リンク (Cmd+K)"
          >
            🔗
          </ToolbarButton>

          <ToolbarButton
            onClick={() => insertFormatting('![', '](url)')}
            title="画像"
          >
            🖼️
          </ToolbarButton>

          <ToolbarButton
            onClick={() => insertFormatting('\n```\n', '\n```\n')}
            title="コードブロック"
          >
            📋
          </ToolbarButton>

          <ToolbarButton
            onClick={() => insertFormatting('- ', '')}
            title="リスト"
          >
            📝
          </ToolbarButton>

          <ToolbarButton
            onClick={() => insertFormatting('> ', '')}
            title="引用"
          >
            💬
          </ToolbarButton>
        </div>
      </div>

      {/* エディタエリア */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          placeholder={placeholder}
          disabled={disabled}
          style={{ minHeight }}
          className={clsx(
            'w-full p-4 resize-none border-none outline-none',
            'font-mono text-sm leading-relaxed',
            'placeholder-gray-500',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            isDragOver && 'bg-blue-50 border-blue-300'
          )}
        />

        {/* ドラッグオーバー時のオーバーレイ */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-50 flex items-center justify-center">
            <div className="text-blue-600 text-lg font-medium">
              📁 画像をドロップしてアップロード
            </div>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="border-t border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>{value.length}文字</span>
            <span>行数: {value.split('\n').length}</span>
          </div>
          <div className="text-xs">
            ショートカット: <kbd className="bg-white px-1 rounded">Cmd+B</kbd> 太字, <kbd className="bg-white px-1 rounded">Cmd+I</kbd> イタリック, <kbd className="bg-white px-1 rounded">Tab</kbd> インデント
          </div>
        </div>
      </div>
    </div>
  )
}