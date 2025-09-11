'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText, FileCode, FileImage, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import '@/styles/components/article-exporter.css'

interface ArticleExporterProps {
  article: {
    id: string
    title: string
    content: string
    author: {
      name: string
      username: string
    }
    publishedAt?: string
    tags?: string[]
    coverImage?: string
  }
}

type ExportFormat = 'markdown' | 'html' | 'pdf' | 'json' | 'docx' | 'epub'

interface ExportOptions {
  includeMetadata: boolean
  includeComments: boolean
  includeImages: boolean
  includeSyntaxHighlighting: boolean
  includeTableOfContents: boolean
}

export function ArticleExporter({ article }: ArticleExporterProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown')
  const [options, setOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeComments: false,
    includeImages: true,
    includeSyntaxHighlighting: true,
    includeTableOfContents: false
  })
  const [showOptions, setShowOptions] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      switch (selectedFormat) {
        case 'markdown':
          await exportAsMarkdown()
          break
        case 'html':
          await exportAsHTML()
          break
        case 'pdf':
          await exportAsPDF()
          break
        case 'json':
          await exportAsJSON()
          break
        case 'docx':
          await exportAsDocx()
          break
        case 'epub':
          await exportAsEpub()
          break
      }
      
      toast.success(`記事を${getFormatLabel(selectedFormat)}形式でエクスポートしました`)
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      toast.error('エクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatLabel = (format: ExportFormat) => {
    const labels: Record<ExportFormat, string> = {
      markdown: 'Markdown',
      html: 'HTML',
      pdf: 'PDF',
      json: 'JSON',
      docx: 'Word',
      epub: 'EPUB'
    }
    return labels[format]
  }

  const generateMetadata = () => {
    return `---
title: ${article.title}
author: ${article.author.name} (@${article.author.username})
date: ${article.publishedAt || new Date().toISOString()}
tags: ${article.tags?.join(', ') || ''}
---\n\n`
  }

  const generateTableOfContents = (content: string) => {
    const headings = content.match(/^#{1,6} .+$/gm) || []
    if (headings.length === 0) return ''
    
    let toc = '## 目次\n\n'
    headings.forEach(heading => {
      const level = heading.match(/^#+/)?.[0].length || 1
      const title = heading.replace(/^#+\s+/, '')
      const indent = '  '.repeat(level - 1)
      toc += `${indent}- ${title}\n`
    })
    return toc + '\n'
  }

  const exportAsMarkdown = async () => {
    let content = ''
    
    if (options.includeMetadata) {
      content += generateMetadata()
    }
    
    content += `# ${article.title}\n\n`
    
    if (options.includeTableOfContents) {
      content += generateTableOfContents(article.content)
    }
    
    content += article.content
    
    downloadFile(content, `${article.title}.md`, 'text/markdown')
  }

  const exportAsHTML = async () => {
    let html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 { color: #1a202c; margin-bottom: 0.5rem; }
    .meta { color: #718096; margin-bottom: 2rem; }
    pre {
      background: #f7fafc;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }
    code {
      background: #edf2f7;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
    }
    img { max-width: 100%; height: auto; }
    blockquote {
      border-left: 4px solid #cbd5e0;
      padding-left: 1rem;
      margin: 1rem 0;
      color: #4a5568;
    }
  </style>
</head>
<body>
  <h1>${article.title}</h1>
  <div class="meta">
    <p>著者: ${article.author.name} (@${article.author.username})</p>
    <p>公開日: ${article.publishedAt || new Date().toISOString()}</p>
    ${article.tags ? `<p>タグ: ${article.tags.join(', ')}</p>` : ''}
  </div>
  <div class="content">
    ${convertMarkdownToHTML(article.content)}
  </div>
</body>
</html>`
    
    downloadFile(html, `${article.title}.html`, 'text/html')
  }

  const exportAsPDF = async () => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const lineHeight = 7
    let yPosition = margin
    
    // タイトル
    pdf.setFontSize(20)
    pdf.text(article.title, margin, yPosition)
    yPosition += lineHeight * 2
    
    // メタデータ
    pdf.setFontSize(12)
    pdf.setTextColor(100)
    pdf.text(`Author: ${article.author.name}`, margin, yPosition)
    yPosition += lineHeight
    pdf.text(`Date: ${article.publishedAt || new Date().toISOString()}`, margin, yPosition)
    yPosition += lineHeight * 2
    
    // コンテンツ
    pdf.setTextColor(0)
    pdf.setFontSize(11)
    
    const lines = article.content.split('\n')
    lines.forEach(line => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }
      
      const wrappedText = pdf.splitTextToSize(line, pageWidth - 2 * margin)
      wrappedText.forEach((textLine: string) => {
        pdf.text(textLine, margin, yPosition)
        yPosition += lineHeight
      })
    })
    
    pdf.save(`${article.title}.pdf`)
  }

  const exportAsJSON = async () => {
    const exportData = {
      ...article,
      exportedAt: new Date().toISOString(),
      options: options
    }
    
    const json = JSON.stringify(exportData, null, 2)
    downloadFile(json, `${article.title}.json`, 'application/json')
  }

  const exportAsDocx = async () => {
    // Word形式へのエクスポートは、実際にはdocxライブラリの実装が必要
    // ここではシンプルなHTMLファイルとしてエクスポート
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="utf-8"><title>${article.title}</title></head>
      <body>
        <h1>${article.title}</h1>
        <p>Author: ${article.author.name}</p>
        <p>Date: ${article.publishedAt || new Date().toISOString()}</p>
        <hr>
        ${convertMarkdownToHTML(article.content)}
      </body>
      </html>
    `
    
    downloadFile(html, `${article.title}.doc`, 'application/msword')
  }

  const exportAsEpub = async () => {
    // EPUB形式へのエクスポートは、実際にはepubライブラリの実装が必要
    // ここではシンプルなHTMLファイルとしてエクスポート
    const html = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${article.title}</title>
  <meta charset="UTF-8"/>
</head>
<body>
  <h1>${article.title}</h1>
  <p>Author: ${article.author.name}</p>
  <p>Date: ${article.publishedAt || new Date().toISOString()}</p>
  <hr/>
  ${convertMarkdownToHTML(article.content)}
</body>
</html>`
    
    downloadFile(html, `${article.title}.xhtml`, 'application/xhtml+xml')
  }

  const convertMarkdownToHTML = (markdown: string) => {
    // シンプルなMarkdownからHTMLへの変換
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="article-exporter">
      <div className="article-exporter__header">
        <h3 className="article-exporter__title">
          <Download className="w-5 h-5" />
          記事をエクスポート
        </h3>
        <button
          className="article-exporter__options-toggle"
          onClick={() => setShowOptions(!showOptions)}
        >
          オプション {showOptions ? '▲' : '▼'}
        </button>
      </div>

      {showOptions && (
        <div className="article-exporter__options">
          <div className="article-exporter__option">
            <Checkbox
              id="includeMetadata"
              checked={options.includeMetadata}
              onCheckedChange={(checked) => 
                setOptions({ ...options, includeMetadata: checked as boolean })
              }
            />
            <label htmlFor="includeMetadata">メタデータを含める</label>
          </div>
          <div className="article-exporter__option">
            <Checkbox
              id="includeImages"
              checked={options.includeImages}
              onCheckedChange={(checked) => 
                setOptions({ ...options, includeImages: checked as boolean })
              }
            />
            <label htmlFor="includeImages">画像を含める</label>
          </div>
          <div className="article-exporter__option">
            <Checkbox
              id="includeTableOfContents"
              checked={options.includeTableOfContents}
              onCheckedChange={(checked) => 
                setOptions({ ...options, includeTableOfContents: checked as boolean })
              }
            />
            <label htmlFor="includeTableOfContents">目次を生成</label>
          </div>
          <div className="article-exporter__option">
            <Checkbox
              id="includeSyntaxHighlighting"
              checked={options.includeSyntaxHighlighting}
              onCheckedChange={(checked) => 
                setOptions({ ...options, includeSyntaxHighlighting: checked as boolean })
              }
            />
            <label htmlFor="includeSyntaxHighlighting">シンタックスハイライト</label>
          </div>
        </div>
      )}

      <div className="article-exporter__controls">
        <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as ExportFormat)}>
          <SelectTrigger className="article-exporter__select">
            <SelectValue placeholder="形式を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="markdown">
              <div className="article-exporter__format">
                <FileText className="w-4 h-4" />
                <span>Markdown</span>
              </div>
            </SelectItem>
            <SelectItem value="html">
              <div className="article-exporter__format">
                <FileCode className="w-4 h-4" />
                <span>HTML</span>
              </div>
            </SelectItem>
            <SelectItem value="pdf">
              <div className="article-exporter__format">
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </div>
            </SelectItem>
            <SelectItem value="json">
              <div className="article-exporter__format">
                <FileCode className="w-4 h-4" />
                <span>JSON</span>
              </div>
            </SelectItem>
            <SelectItem value="docx">
              <div className="article-exporter__format">
                <FileText className="w-4 h-4" />
                <span>Word</span>
              </div>
            </SelectItem>
            <SelectItem value="epub">
              <div className="article-exporter__format">
                <FileText className="w-4 h-4" />
                <span>EPUB</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="article-exporter__button"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              エクスポート中...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              エクスポート
            </>
          )}
        </Button>
      </div>

      <div className="article-exporter__info">
        <p className="article-exporter__info-text">
          {getFormatLabel(selectedFormat)}形式でエクスポートします
        </p>
      </div>
    </div>
  )
}