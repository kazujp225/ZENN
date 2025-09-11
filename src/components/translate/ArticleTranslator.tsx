'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Languages, Loader2, Globe, Copy, Check, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import '@/styles/components/article-translator.css'

interface ArticleTranslatorProps {
  article: {
    title: string
    content: string
    tags?: string[]
  }
  onTranslated?: (translation: TranslatedArticle) => void
}

interface TranslatedArticle {
  title: string
  content: string
  language: string
  originalLanguage: string
}

interface LanguageOption {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
]

export function ArticleTranslator({ article, onTranslated }: ArticleTranslatorProps) {
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedArticle, setTranslatedArticle] = useState<TranslatedArticle | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [translationQuality, setTranslationQuality] = useState<'standard' | 'professional'>('standard')
  const [showOriginal, setShowOriginal] = useState(false)
  const [translationProgress, setTranslationProgress] = useState(0)

  const translateArticle = async () => {
    setIsTranslating(true)
    setTranslationProgress(0)
    
    try {
      // 翻訳プロセスのシミュレーション
      const progressInterval = setInterval(() => {
        setTranslationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      
      await new Promise(resolve => setTimeout(resolve, 2500))
      clearInterval(progressInterval)
      setTranslationProgress(100)
      
      // 言語に応じた翻訳シミュレーション
      const translations: Record<string, { title: string; contentPrefix: string }> = {
        en: {
          title: `${article.title} (English Translation)`,
          contentPrefix: 'This article discusses'
        },
        zh: {
          title: `${article.title}（中文翻译）`,
          contentPrefix: '本文讨论了'
        },
        ko: {
          title: `${article.title} (한국어 번역)`,
          contentPrefix: '이 글은 다음을 다룹니다'
        },
        es: {
          title: `${article.title} (Traducción al español)`,
          contentPrefix: 'Este artículo discute'
        },
        fr: {
          title: `${article.title} (Traduction française)`,
          contentPrefix: 'Cet article traite de'
        },
        de: {
          title: `${article.title} (Deutsche Übersetzung)`,
          contentPrefix: 'Dieser Artikel behandelt'
        },
      }
      
      const translation = translations[targetLanguage] || translations.en
      const selectedLanguage = languages.find(l => l.code === targetLanguage)
      
      const translated: TranslatedArticle = {
        title: translation.title,
        content: `${translation.contentPrefix} ${article.content.substring(0, 200)}...\n\n[${selectedLanguage?.nativeName || 'Translated'} version of the full content would appear here]\n\n${article.content}`,
        language: targetLanguage,
        originalLanguage: 'ja'
      }
      
      setTranslatedArticle(translated)
      onTranslated?.(translated)
      toast.success(`記事を${selectedLanguage?.nativeName}に翻訳しました`)
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('翻訳に失敗しました')
    } finally {
      setIsTranslating(false)
      setTranslationProgress(0)
    }
  }

  const copyTranslation = async () => {
    if (!translatedArticle) return
    
    try {
      await navigator.clipboard.writeText(
        `${translatedArticle.title}\n\n${translatedArticle.content}`
      )
      setIsCopied(true)
      toast.success('翻訳をコピーしました')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error('コピーに失敗しました')
    }
  }

  const downloadTranslation = () => {
    if (!translatedArticle) return
    
    const content = `${translatedArticle.title}\n\n${translatedArticle.content}`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${article.title}_${targetLanguage}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('翻訳をダウンロードしました')
  }

  const selectedLanguage = languages.find(l => l.code === targetLanguage)

  return (
    <div className="article-translator">
      <div className="article-translator__header">
        <h3 className="article-translator__title">
          <Languages className="w-5 h-5" />
          記事翻訳
        </h3>
        {translatedArticle && (
          <div className="article-translator__actions">
            <Button
              variant="outline"
              size="sm"
              onClick={copyTranslation}
            >
              {isCopied ? (
                <><Check className="w-4 h-4" /> コピー済み</>
              ) : (
                <><Copy className="w-4 h-4" /> コピー</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTranslation}
            >
              <Download className="w-4 h-4" />
              ダウンロード
            </Button>
          </div>
        )}
      </div>

      <div className="article-translator__controls">
        <div className="article-translator__language-select">
          <label className="article-translator__label">
            翻訳先言語:
          </label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className="article-translator__select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="article-translator__language-option">
                    <span className="article-translator__flag">{lang.flag}</span>
                    <span>{lang.name}</span>
                    <span className="article-translator__native-name">({lang.nativeName})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="article-translator__quality">
          <label className="article-translator__label">
            翻訳品質:
          </label>
          <div className="article-translator__quality-buttons">
            <Button
              variant={translationQuality === 'standard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTranslationQuality('standard')}
            >
              標準
            </Button>
            <Button
              variant={translationQuality === 'professional' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTranslationQuality('professional')}
            >
              プロフェッショナル
            </Button>
          </div>
        </div>

        <Button
          onClick={translateArticle}
          disabled={isTranslating}
          className="article-translator__translate-btn"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              翻訳中...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              翻訳する
            </>
          )}
        </Button>
      </div>

      {isTranslating && (
        <div className="article-translator__progress">
          <div className="article-translator__progress-bar">
            <div 
              className="article-translator__progress-fill"
              style={{ width: `${translationProgress}%` }}
            />
          </div>
          <span className="article-translator__progress-text">
            翻訳処理中... {translationProgress}%
          </span>
        </div>
      )}

      {translatedArticle && (
        <div className="article-translator__result">
          <div className="article-translator__result-header">
            <div className="article-translator__result-meta">
              <span className="article-translator__result-flag">
                {selectedLanguage?.flag}
              </span>
              <span className="article-translator__result-language">
                {selectedLanguage?.nativeName}
              </span>
              {translationQuality === 'professional' && (
                <Badge variant="secondary" className="article-translator__quality-badge">
                  プロ品質
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
            >
              {showOriginal ? '翻訳を表示' : '原文を表示'}
            </Button>
          </div>

          <Tabs defaultValue="translation" className="article-translator__tabs">
            <TabsList>
              <TabsTrigger value="translation">翻訳</TabsTrigger>
              <TabsTrigger value="sidebyside">並べて表示</TabsTrigger>
            </TabsList>

            <TabsContent value="translation" className="article-translator__content">
              <div className="article-translator__text">
                <h2>{showOriginal ? article.title : translatedArticle.title}</h2>
                <div className="article-translator__body">
                  {showOriginal ? article.content : translatedArticle.content}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sidebyside" className="article-translator__sidebyside">
              <div className="article-translator__column">
                <h4 className="article-translator__column-title">原文 (日本語)</h4>
                <div className="article-translator__column-content">
                  <h3>{article.title}</h3>
                  <p>{article.content}</p>
                </div>
              </div>
              <div className="article-translator__column">
                <h4 className="article-translator__column-title">
                  翻訳 ({selectedLanguage?.nativeName})
                </h4>
                <div className="article-translator__column-content">
                  <h3>{translatedArticle.title}</h3>
                  <p>{translatedArticle.content}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="article-translator__footer">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTranslatedArticle(null)
                setShowOriginal(false)
              }}
            >
              <RefreshCw className="w-4 h-4" />
              新しい翻訳
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}