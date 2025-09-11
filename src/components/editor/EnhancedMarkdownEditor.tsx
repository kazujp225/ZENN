'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useAutoSave } from '@/hooks/useAutoSave'
import clsx from 'clsx'
import '@/styles/components/enhanced-markdown-editor.css'

interface EnhancedMarkdownEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  draftId?: string
  height?: string
  showToolbar?: boolean
  showPreview?: boolean
  autoSave?: boolean
}

interface EditorShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

const TOOLBAR_ITEMS = [
  { icon: 'B', command: 'bold', title: '太字 (Ctrl+B)' },
  { icon: 'I', command: 'italic', title: '斜体 (Ctrl+I)' },
  { icon: 'S', command: 'strike', title: '取り消し線' },
  { type: 'divider' },
  { icon: 'H1', command: 'heading1', title: '見出し1' },
  { icon: 'H2', command: 'heading2', title: '見出し2' },
  { icon: 'H3', command: 'heading3', title: '見出し3' },
  { type: 'divider' },
  { icon: '•', command: 'ul', title: '箇条書き' },
  { icon: '1.', command: 'ol', title: '番号付きリスト' },
  { icon: '☐', command: 'task', title: 'タスクリスト' },
  { type: 'divider' },
  { icon: '"', command: 'quote', title: '引用' },
  { icon: '{}', command: 'code', title: 'コード' },
  { icon: '```', command: 'codeblock', title: 'コードブロック' },
  { type: 'divider' },
  { icon: '🔗', command: 'link', title: 'リンク (Ctrl+K)' },
  { icon: '📷', command: 'image', title: '画像' },
  { icon: '📊', command: 'table', title: 'テーブル' },
  { icon: '—', command: 'hr', title: '水平線' },
]

export function EnhancedMarkdownEditor({
  initialValue = '',
  onChange,
  placeholder = 'Markdownで書き始めましょう...',
  draftId,
  height = '500px',
  showToolbar = true,
  showPreview = true,
  autoSave = true
}: EnhancedMarkdownEditorProps) {
  const [value, setValue] = useState(initialValue)
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'split'>('split')
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewHtml, setPreviewHtml] = useState('')

  // 自動保存フック
  const { updateData, isSaving, getStatus, forceSave } = useAutoSave({
    draftId,
    enabled: autoSave && !!draftId,
    delay: 3000
  })

  // Markdownをパース
  const parseMarkdown = useCallback(async (markdown: string) => {
    // 簡易的なMarkdownパーサー（実際にはmarked等のライブラリを使用）
    let html = markdown
      // 見出し
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 太字・斜体
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // リンク・画像
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
      // コード
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 改行
      .replace(/\n/g, '<br />')
    
    setPreviewHtml(html)
  }, [])

  // 値の変更処理
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue)
    onChange?.(newValue)
    parseMarkdown(newValue)
    
    if (autoSave && draftId) {
      updateData({ content: newValue })
    }
  }, [onChange, parseMarkdown, autoSave, draftId, updateData])

  // エディタコマンド実行
  const executeCommand = useCallback((command: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    let newText = ''
    let newCursorPos = start

    switch (command) {
      case 'bold':
        newText = `**${selectedText || 'テキスト'}**`
        newCursorPos = start + 2
        break
      case 'italic':
        newText = `*${selectedText || 'テキスト'}*`
        newCursorPos = start + 1
        break
      case 'strike':
        newText = `~~${selectedText || 'テキスト'}~~`
        newCursorPos = start + 2
        break
      case 'heading1':
        newText = `# ${selectedText || '見出し'}`
        newCursorPos = start + 2
        break
      case 'heading2':
        newText = `## ${selectedText || '見出し'}`
        newCursorPos = start + 3
        break
      case 'heading3':
        newText = `### ${selectedText || '見出し'}`
        newCursorPos = start + 4
        break
      case 'ul':
        newText = `- ${selectedText || 'リスト項目'}`
        newCursorPos = start + 2
        break
      case 'ol':
        newText = `1. ${selectedText || 'リスト項目'}`
        newCursorPos = start + 3
        break
      case 'task':
        newText = `- [ ] ${selectedText || 'タスク'}`
        newCursorPos = start + 6
        break
      case 'quote':
        newText = `> ${selectedText || '引用文'}`
        newCursorPos = start + 2
        break
      case 'code':
        newText = `\`${selectedText || 'コード'}\``
        newCursorPos = start + 1
        break
      case 'codeblock':
        newText = `\`\`\`\n${selectedText || 'コード'}\n\`\`\``
        newCursorPos = start + 4
        break
      case 'link':
        newText = `[${selectedText || 'リンクテキスト'}](URL)`
        newCursorPos = start + 1
        break
      case 'image':
        newText = `![${selectedText || '画像の説明'}](画像URL)`
        newCursorPos = start + 2
        break
      case 'table':
        newText = `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |`
        newCursorPos = start
        break
      case 'hr':
        newText = '\n---\n'
        newCursorPos = start + 5
        break
      default:
        return
    }

    const newValue = value.substring(0, start) + newText + value.substring(end)
    handleChange(newValue)

    // カーソル位置を設定
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, handleChange])

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!textareaRef.current || e.target !== textareaRef.current) return

      // Ctrl/Cmd + B: 太字
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        executeCommand('bold')
      }
      // Ctrl/Cmd + I: 斜体
      else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        executeCommand('italic')
      }
      // Ctrl/Cmd + K: リンク
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        executeCommand('link')
      }
      // Tab: インデント
      else if (e.key === 'Tab') {
        e.preventDefault()
        const textarea = textareaRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newValue = value.substring(0, start) + '  ' + value.substring(end)
        handleChange(newValue)
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, start + 2)
        }, 0)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [value, executeCommand, handleChange])

  // カーソル位置の更新
  const updateCursorPosition = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const text = textarea.value.substring(0, textarea.selectionStart)
    const lines = text.split('\n')
    const line = lines.length
    const col = lines[lines.length - 1].length + 1

    setCursorPosition({ line, col })
  }, [])

  // 初期値の設定とプレビュー生成
  useEffect(() => {
    parseMarkdown(value)
  }, [value, parseMarkdown])

  return (
    <div className="enhanced-editor">
      {/* ツールバー */}
      {showToolbar && (
        <div className="enhanced-editor__toolbar">
          <div className="enhanced-editor__toolbar-items">
            {TOOLBAR_ITEMS.map((item, index) => {
              if (item.type === 'divider') {
                return <div key={index} className="enhanced-editor__toolbar-divider" />
              }
              return (
                <button
                  key={index}
                  onClick={() => executeCommand(item.command!)}
                  className="enhanced-editor__toolbar-button"
                  title={item.title}
                >
                  {item.icon}
                </button>
              )
            })}
          </div>
          <div className="enhanced-editor__toolbar-actions">
            {showPreview && (
              <div className="enhanced-editor__view-toggle">
                <button
                  onClick={() => setPreviewMode('edit')}
                  className={clsx(
                    'enhanced-editor__view-button',
                    previewMode === 'edit' && 'enhanced-editor__view-button--active'
                  )}
                >
                  編集
                </button>
                <button
                  onClick={() => setPreviewMode('split')}
                  className={clsx(
                    'enhanced-editor__view-button',
                    previewMode === 'split' && 'enhanced-editor__view-button--active'
                  )}
                >
                  分割
                </button>
                <button
                  onClick={() => setPreviewMode('preview')}
                  className={clsx(
                    'enhanced-editor__view-button',
                    previewMode === 'preview' && 'enhanced-editor__view-button--active'
                  )}
                >
                  プレビュー
                </button>
              </div>
            )}
            {autoSave && draftId && (
              <div className="enhanced-editor__save-status">
                {isSaving ? (
                  <span className="enhanced-editor__save-status--saving">保存中...</span>
                ) : (
                  <span className="enhanced-editor__save-status--saved">{getStatus()}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* エディタ本体 */}
      <div 
        className={clsx(
          'enhanced-editor__content',
          `enhanced-editor__content--${previewMode}`
        )}
        style={{ height }}
      >
        {/* エディタ */}
        {previewMode !== 'preview' && (
          <div className="enhanced-editor__editor">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onKeyUp={updateCursorPosition}
              onClick={updateCursorPosition}
              placeholder={placeholder}
              className="enhanced-editor__textarea"
              spellCheck={false}
            />
            <div className="enhanced-editor__status">
              <span>行 {cursorPosition.line}, 列 {cursorPosition.col}</span>
              <span>{value.length} 文字</span>
            </div>
          </div>
        )}

        {/* プレビュー */}
        {showPreview && previewMode !== 'edit' && (
          <div 
            ref={previewRef}
            className="enhanced-editor__preview markdown-body"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>
    </div>
  )
}