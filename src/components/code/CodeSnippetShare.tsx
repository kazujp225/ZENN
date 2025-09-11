'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Code2, Copy, Share2, Download, Link, Check, Palette, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark, vs, dracula, tomorrow, coldarkDark, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import '@/styles/components/code-snippet-share.css'

interface CodeSnippetShareProps {
  code?: string
  language?: string
  title?: string
  onShare?: (shareData: ShareData) => void
}

interface ShareData {
  code: string
  language: string
  title: string
  theme: string
  url?: string
  imageUrl?: string
}

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
]

const themes = [
  { value: 'atomDark', label: 'Atom Dark', style: atomDark },
  { value: 'vs', label: 'Visual Studio', style: vs },
  { value: 'dracula', label: 'Dracula', style: dracula },
  { value: 'tomorrow', label: 'Tomorrow', style: tomorrow },
  { value: 'coldarkDark', label: 'Coldark Dark', style: coldarkDark },
  { value: 'oneDark', label: 'One Dark', style: oneDark },
]

export function CodeSnippetShare({ 
  code: initialCode = '', 
  language: initialLanguage = 'javascript',
  title: initialTitle = '',
  onShare 
}: CodeSnippetShareProps) {
  const [code, setCode] = useState(initialCode)
  const [language, setLanguage] = useState(initialLanguage)
  const [title, setTitle] = useState(initialTitle)
  const [theme, setTheme] = useState('atomDark')
  const [shareUrl, setShareUrl] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [showLineNumbers, setShowLineNumbers] = useState(true)

  const selectedTheme = themes.find(t => t.value === theme)?.style || atomDark

  const generateShareUrl = async () => {
    setIsGenerating(true)
    
    try {
      // 共有URLの生成シミュレーション
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Base64エンコード
      const shareData = {
        code,
        language,
        title,
        theme,
        fontSize,
        showLineNumbers
      }
      const encoded = btoa(JSON.stringify(shareData))
      const url = `${window.location.origin}/snippet/${encoded.substring(0, 10)}...`
      
      setShareUrl(url)
      
      const fullShareData: ShareData = {
        code,
        language,
        title,
        theme,
        url,
        imageUrl: `${window.location.origin}/api/snippet-image/${encoded.substring(0, 10)}.png`
      }
      
      onShare?.(fullShareData)
      toast.success('共有リンクを生成しました')
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      toast.error('共有リンクの生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      toast.success('コードをコピーしました')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error('コピーに失敗しました')
    }
  }

  const copyShareUrl = async () => {
    if (!shareUrl) return
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('共有URLをコピーしました')
    } catch (error) {
      toast.error('コピーに失敗しました')
    }
  }

  const downloadAsImage = async () => {
    // 画像としてダウンロードのシミュレーション
    toast.info('画像エクスポート機能は現在開発中です')
  }

  const shareToTwitter = () => {
    const text = `${title || 'コードスニペット'}を共有しました\n${shareUrl}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(twitterUrl, '_blank')
  }

  return (
    <div className="code-snippet-share">
      <div className="code-snippet-share__header">
        <h3 className="code-snippet-share__title">
          <Code2 className="w-5 h-5" />
          コードスニペット共有
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4" />
          設定
        </Button>
      </div>

      {showSettings && (
        <div className="code-snippet-share__settings">
          <div className="code-snippet-share__setting-group">
            <label>テーマ:</label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="code-snippet-share__select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="code-snippet-share__theme-option">
                      <Palette className="w-4 h-4" />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="code-snippet-share__setting-group">
            <label>フォントサイズ:</label>
            <div className="code-snippet-share__font-size">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(Math.max(10, fontSize - 2))}
              >
                -
              </Button>
              <span>{fontSize}px</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              >
                +
              </Button>
            </div>
          </div>

          <div className="code-snippet-share__setting-group">
            <label className="code-snippet-share__checkbox">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
              />
              行番号を表示
            </label>
          </div>
        </div>
      )}

      <div className="code-snippet-share__form">
        <Input
          placeholder="スニペットのタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="code-snippet-share__input"
        />

        <div className="code-snippet-share__controls">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="code-snippet-share__select">
              <SelectValue placeholder="言語を選択" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={copyCode}
            disabled={!code}
          >
            {isCopied ? (
              <><Check className="w-4 h-4" /> コピー済み</>
            ) : (
              <><Copy className="w-4 h-4" /> コピー</>
            )}
          </Button>
        </div>

        <Textarea
          placeholder="コードを入力..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="code-snippet-share__textarea"
          rows={10}
        />
      </div>

      {code && (
        <div className="code-snippet-share__preview">
          <div className="code-snippet-share__preview-header">
            <span className="code-snippet-share__preview-title">
              {title || '無題'}
            </span>
            <span className="code-snippet-share__preview-language">
              {languages.find(l => l.value === language)?.label}
            </span>
          </div>
          <div 
            className="code-snippet-share__preview-content"
            style={{ fontSize: `${fontSize}px` }}
          >
            <SyntaxHighlighter
              language={language}
              style={selectedTheme}
              showLineNumbers={showLineNumbers}
              customStyle={{
                margin: 0,
                borderRadius: '0 0 0.5rem 0.5rem',
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      <div className="code-snippet-share__actions">
        <Button
          onClick={generateShareUrl}
          disabled={!code || isGenerating}
          className="code-snippet-share__share-btn"
        >
          <Share2 className="w-4 h-4" />
          {isGenerating ? '生成中...' : '共有リンクを生成'}
        </Button>

        {shareUrl && (
          <>
            <Button
              variant="outline"
              onClick={copyShareUrl}
            >
              <Link className="w-4 h-4" />
              URLをコピー
            </Button>
            <Button
              variant="outline"
              onClick={shareToTwitter}
            >
              <Share2 className="w-4 h-4" />
              Twitterで共有
            </Button>
            <Button
              variant="outline"
              onClick={downloadAsImage}
            >
              <Download className="w-4 h-4" />
              画像として保存
            </Button>
          </>
        )}
      </div>

      {shareUrl && (
        <div className="code-snippet-share__result">
          <div className="code-snippet-share__result-header">
            <span>共有URL:</span>
          </div>
          <div className="code-snippet-share__result-url">
            <code>{shareUrl}</code>
          </div>
          <p className="code-snippet-share__result-info">
            このURLを使用して、コードスニペットを他の人と共有できます
          </p>
        </div>
      )}
    </div>
  )
}