'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Tag, Plus, X, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import '@/styles/components/ai-tag-generator.css'

interface AITagGeneratorProps {
  content: string
  title?: string
  existingTags?: string[]
  onTagsGenerated?: (tags: string[]) => void
  maxTags?: number
}

interface TagSuggestion {
  tag: string
  confidence: number
  category: 'technology' | 'framework' | 'concept' | 'language' | 'tool' | 'other'
  reason: string
}

export function AITagGenerator({ 
  content, 
  title = '',
  existingTags = [],
  onTagsGenerated,
  maxTags = 10
}: AITagGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>(existingTags)
  const [showDetails, setShowDetails] = useState(false)

  const generateTags = async () => {
    setIsGenerating(true)
    
    try {
      // AIタグ生成のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // コンテンツに基づいたダミータグの生成
      const mockSuggestions: TagSuggestion[] = []
      
      // コンテンツからキーワードを抽出
      const contentLower = content.toLowerCase()
      const titleLower = title.toLowerCase()
      const combinedText = `${titleLower} ${contentLower}`
      
      // 技術キーワードのマッピング
      const techKeywords = [
        { keyword: 'react', tag: 'React', category: 'framework' as const, confidence: 0.95 },
        { keyword: 'next.js', tag: 'Next.js', category: 'framework' as const, confidence: 0.93 },
        { keyword: 'typescript', tag: 'TypeScript', category: 'language' as const, confidence: 0.92 },
        { keyword: 'javascript', tag: 'JavaScript', category: 'language' as const, confidence: 0.90 },
        { keyword: 'python', tag: 'Python', category: 'language' as const, confidence: 0.91 },
        { keyword: 'node.js', tag: 'Node.js', category: 'technology' as const, confidence: 0.88 },
        { keyword: 'docker', tag: 'Docker', category: 'tool' as const, confidence: 0.87 },
        { keyword: 'kubernetes', tag: 'Kubernetes', category: 'tool' as const, confidence: 0.86 },
        { keyword: 'aws', tag: 'AWS', category: 'technology' as const, confidence: 0.89 },
        { keyword: 'graphql', tag: 'GraphQL', category: 'technology' as const, confidence: 0.85 },
        { keyword: 'rest api', tag: 'REST API', category: 'concept' as const, confidence: 0.84 },
        { keyword: 'machine learning', tag: 'Machine Learning', category: 'concept' as const, confidence: 0.94 },
        { keyword: 'tailwind', tag: 'Tailwind CSS', category: 'framework' as const, confidence: 0.82 },
        { keyword: 'vue', tag: 'Vue.js', category: 'framework' as const, confidence: 0.91 },
        { keyword: 'git', tag: 'Git', category: 'tool' as const, confidence: 0.83 },
        { keyword: 'database', tag: 'Database', category: 'concept' as const, confidence: 0.81 },
        { keyword: 'api', tag: 'API', category: 'concept' as const, confidence: 0.80 },
        { keyword: 'css', tag: 'CSS', category: 'language' as const, confidence: 0.79 },
        { keyword: 'html', tag: 'HTML', category: 'language' as const, confidence: 0.78 },
        { keyword: 'testing', tag: 'Testing', category: 'concept' as const, confidence: 0.77 },
      ]
      
      // コンテンツに含まれるキーワードを検出
      techKeywords.forEach(({ keyword, tag, category, confidence }) => {
        if (combinedText.includes(keyword) && !existingTags.includes(tag)) {
          // キーワードの出現回数をカウント
          const occurrences = (combinedText.match(new RegExp(keyword, 'g')) || []).length
          const adjustedConfidence = Math.min(confidence + (occurrences * 0.02), 1)
          
          mockSuggestions.push({
            tag,
            confidence: adjustedConfidence,
            category,
            reason: `「${keyword}」に関する内容が${occurrences}箇所で検出されました`
          })
        }
      })
      
      // 一般的なコンセプトタグの追加
      const conceptTags = [
        { condition: /初心者|入門|基本|基礎/, tag: '初心者向け', confidence: 0.75 },
        { condition: /チュートリアル|ハンズオン|実践/, tag: 'チュートリアル', confidence: 0.78 },
        { condition: /パフォーマンス|最適化|高速化/, tag: 'パフォーマンス', confidence: 0.82 },
        { condition: /セキュリティ|脆弱性|保護/, tag: 'セキュリティ', confidence: 0.85 },
        { condition: /デザイン|UI|UX/, tag: 'UI/UX', confidence: 0.80 },
        { condition: /テスト|テスティング|TDD/, tag: 'テスト', confidence: 0.79 },
        { condition: /デプロイ|CI\/CD|ビルド/, tag: 'DevOps', confidence: 0.83 },
        { condition: /アーキテクチャ|設計|パターン/, tag: 'アーキテクチャ', confidence: 0.81 },
      ]
      
      conceptTags.forEach(({ condition, tag, confidence }) => {
        if (condition.test(combinedText) && !existingTags.includes(tag)) {
          mockSuggestions.push({
            tag,
            confidence,
            category: 'concept',
            reason: `関連するコンセプトがコンテンツ内で言及されています`
          })
        }
      })
      
      // 信頼度でソートし、上位を取得
      mockSuggestions.sort((a, b) => b.confidence - a.confidence)
      setSuggestions(mockSuggestions.slice(0, maxTags))
      
      toast.success(`${mockSuggestions.length}個のタグ候補を生成しました`)
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      toast.error('タグの生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }

  const applyTags = () => {
    onTagsGenerated?.(selectedTags)
    toast.success(`${selectedTags.length}個のタグを適用しました`)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: 'blue',
      framework: 'purple',
      concept: 'green',
      language: 'orange',
      tool: 'pink',
      other: 'gray'
    }
    return colors[category as keyof typeof colors] || 'gray'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return '非常に高い'
    if (confidence >= 0.8) return '高い'
    if (confidence >= 0.7) return '中程度'
    return '低い'
  }

  return (
    <div className="ai-tag-generator">
      <div className="ai-tag-generator__header">
        <h3 className="ai-tag-generator__title">
          <Sparkles className="w-5 h-5" />
          AI タグ生成
        </h3>
        <Button
          onClick={() => setShowDetails(!showDetails)}
          variant="ghost"
          size="sm"
        >
          {showDetails ? '詳細を非表示' : '詳細を表示'}
        </Button>
      </div>

      {existingTags.length > 0 && (
        <div className="ai-tag-generator__existing">
          <span className="ai-tag-generator__label">現在のタグ:</span>
          <div className="ai-tag-generator__tags">
            {existingTags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="ai-tag-generator__actions">
        <Button
          onClick={generateTags}
          disabled={isGenerating || !content}
          className="ai-tag-generator__generate-btn"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AIが分析中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              タグを自動生成
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <Button
            onClick={() => {
              setSuggestions([])
              setSelectedTags(existingTags)
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
            リセット
          </Button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="ai-tag-generator__suggestions">
          <div className="ai-tag-generator__suggestions-header">
            <span className="ai-tag-generator__label">
              AIが提案するタグ ({selectedTags.length} / {suggestions.length} 選択中)
            </span>
            <Button
              onClick={applyTags}
              disabled={selectedTags.length === 0}
              size="sm"
            >
              <Plus className="w-4 h-4" />
              選択したタグを適用
            </Button>
          </div>

          <div className="ai-tag-generator__suggestion-list">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.tag}
                className={`ai-tag-generator__suggestion-item ${
                  selectedTags.includes(suggestion.tag) ? 'ai-tag-generator__suggestion-item--selected' : ''
                }`}
                onClick={() => toggleTag(suggestion.tag)}
              >
                <div className="ai-tag-generator__suggestion-main">
                  <div className="ai-tag-generator__suggestion-tag">
                    <Tag className="w-4 h-4" />
                    <span>{suggestion.tag}</span>
                  </div>
                  <div className="ai-tag-generator__suggestion-meta">
                    <Badge 
                      variant="outline" 
                      className={`ai-tag-generator__category ai-tag-generator__category--${getCategoryColor(suggestion.category)}`}
                    >
                      {suggestion.category}
                    </Badge>
                    <div className="ai-tag-generator__confidence">
                      <div className="ai-tag-generator__confidence-bar">
                        <div 
                          className="ai-tag-generator__confidence-fill"
                          style={{ width: `${suggestion.confidence * 100}%` }}
                        />
                      </div>
                      <span className="ai-tag-generator__confidence-label">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {showDetails && (
                  <div className="ai-tag-generator__suggestion-detail">
                    <span className="ai-tag-generator__reason">
                      {suggestion.reason}
                    </span>
                    <span className="ai-tag-generator__confidence-text">
                      信頼度: {getConfidenceLabel(suggestion.confidence)}
                    </span>
                  </div>
                )}

                {selectedTags.includes(suggestion.tag) && (
                  <div className="ai-tag-generator__selected-indicator">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!content && (
        <div className="ai-tag-generator__empty">
          <Tag className="w-12 h-12" />
          <p>コンテンツを入力するとAIが最適なタグを提案します</p>
        </div>
      )}
    </div>
  )
}