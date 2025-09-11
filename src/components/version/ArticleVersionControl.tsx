'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GitBranch, Clock, RotateCcw, Save, Eye, ChevronDown, ChevronUp, User } from 'lucide-react'
import { toast } from 'sonner'
import { DiffViewer } from './DiffViewer'
import '@/styles/components/article-version-control.css'

interface Version {
  id: string
  version: number
  title: string
  content: string
  author: {
    name: string
    avatar: string
  }
  message: string
  createdAt: string
  changes: {
    additions: number
    deletions: number
  }
  tags?: string[]
}

interface ArticleVersionControlProps {
  articleId: string
  currentVersion: Version
  onRestore?: (version: Version) => void
}

export function ArticleVersionControl({ articleId, currentVersion, onRestore }: ArticleVersionControlProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(null)

  useEffect(() => {
    fetchVersions()
  }, [articleId])

  const fetchVersions = async () => {
    setIsLoading(true)
    
    // ダミーデータの生成
    setTimeout(() => {
      const mockVersions: Version[] = [
        {
          id: 'v5',
          version: 5,
          title: currentVersion.title,
          content: currentVersion.content,
          author: {
            name: '田中太郎',
            avatar: '/images/avatar-placeholder.svg'
          },
          message: 'コードブロックのシンタックスハイライトを改善',
          createdAt: new Date().toISOString(),
          changes: { additions: 45, deletions: 12 },
          tags: ['improvement', 'code']
        },
        {
          id: 'v4',
          version: 4,
          title: currentVersion.title,
          content: currentVersion.content.replace('最新', '新しい'),
          author: {
            name: '佐藤花子',
            avatar: '/images/avatar-placeholder.svg'
          },
          message: 'パフォーマンス最適化のセクションを追加',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          changes: { additions: 128, deletions: 34 },
          tags: ['feature', 'performance']
        },
        {
          id: 'v3',
          version: 3,
          title: currentVersion.title.replace('2024', '2023'),
          content: currentVersion.content.substring(0, currentVersion.content.length - 500),
          author: {
            name: '田中太郎',
            avatar: '/images/avatar-placeholder.svg'
          },
          message: 'タイポの修正と説明の改善',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          changes: { additions: 23, deletions: 45 },
          tags: ['bugfix', 'documentation']
        },
        {
          id: 'v2',
          version: 2,
          title: currentVersion.title.replace('2024', '2023'),
          content: currentVersion.content.substring(0, currentVersion.content.length - 1000),
          author: {
            name: '鈴木一郎',
            avatar: '/images/avatar-placeholder.svg'
          },
          message: '初稿の内容を大幅に拡充',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          changes: { additions: 256, deletions: 0 },
          tags: ['major-update']
        },
        {
          id: 'v1',
          version: 1,
          title: `${currentVersion.title}（初稿）`,
          content: currentVersion.content.substring(0, 500),
          author: {
            name: '田中太郎',
            avatar: '/images/avatar-placeholder.svg'
          },
          message: '記事の初稿を作成',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          changes: { additions: 120, deletions: 0 },
          tags: ['initial']
        }
      ]
      
      setVersions(mockVersions)
      setIsLoading(false)
    }, 1000)
  }

  const toggleVersionExpand = (versionId: string) => {
    const newExpanded = new Set(expandedVersions)
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId)
    } else {
      newExpanded.add(versionId)
    }
    setExpandedVersions(newExpanded)
  }

  const handleRestore = (version: Version) => {
    setVersionToRestore(version)
    setShowRestoreDialog(true)
  }

  const confirmRestore = async () => {
    if (!versionToRestore) return
    
    try {
      // API呼び出しのシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onRestore?.(versionToRestore)
      toast.success(`バージョン ${versionToRestore.version} に復元しました`)
      setShowRestoreDialog(false)
      setVersionToRestore(null)
    } catch (error) {
      toast.error('復元に失敗しました')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (hours < 1) return 'たった今'
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    
    return date.toLocaleDateString('ja-JP')
  }

  if (isLoading) {
    return (
      <div className="article-version-control article-version-control--loading">
        <div className="article-version-control__spinner" />
        <p>バージョン履歴を読み込んでいます...</p>
      </div>
    )
  }

  return (
    <>
      <div className="article-version-control">
        <div className="article-version-control__header">
          <h3 className="article-version-control__title">
            <GitBranch className="w-5 h-5" />
            バージョン履歴
          </h3>
          <span className="article-version-control__count">
            {versions.length} バージョン
          </span>
        </div>

        <div className="article-version-control__timeline">
          {versions.map((version, index) => (
            <div key={version.id} className="article-version-item">
              <div className="article-version-item__connector">
                <div className="article-version-item__line" />
                <div className={`article-version-item__dot ${
                  index === 0 ? 'article-version-item__dot--current' : ''
                }`} />
              </div>

              <div className="article-version-item__content">
                <div className="article-version-item__header">
                  <div className="article-version-item__meta">
                    <span className="article-version-item__version">
                      v{version.version}
                    </span>
                    <span className="article-version-item__date">
                      <Clock className="w-3 h-3" />
                      {formatDate(version.createdAt)}
                    </span>
                    <div className="article-version-item__author">
                      <img 
                        src={version.author.avatar} 
                        alt={version.author.name}
                        className="article-version-item__avatar"
                      />
                      <span>{version.author.name}</span>
                    </div>
                  </div>

                  <div className="article-version-item__actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVersionExpand(version.id)}
                    >
                      {expandedVersions.has(version.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="article-version-item__message">
                  {version.message}
                </div>

                <div className="article-version-item__stats">
                  <span className="article-version-item__stat article-version-item__stat--additions">
                    +{version.changes.additions}
                  </span>
                  <span className="article-version-item__stat article-version-item__stat--deletions">
                    -{version.changes.deletions}
                  </span>
                  {version.tags?.map(tag => (
                    <span key={tag} className="article-version-item__tag">
                      {tag}
                    </span>
                  ))}
                </div>

                {expandedVersions.has(version.id) && (
                  <div className="article-version-item__expanded">
                    <div className="article-version-item__preview">
                      <h4>{version.title}</h4>
                      <p>{version.content.substring(0, 200)}...</p>
                    </div>
                    <div className="article-version-item__expanded-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVersion(version)
                          setShowDiff(true)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        差分を表示
                      </Button>
                      {index !== 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(version)}
                        >
                          <RotateCcw className="w-4 h-4" />
                          このバージョンに復元
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 差分ビューア */}
      {showDiff && selectedVersion && (
        <DiffViewer
          oldVersion={selectedVersion}
          newVersion={currentVersion}
          onClose={() => {
            setShowDiff(false)
            setSelectedVersion(null)
          }}
        />
      )}

      {/* 復元確認ダイアログ */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>バージョンの復元</DialogTitle>
            <DialogDescription>
              バージョン {versionToRestore?.version} に復元しますか？
              現在の変更は新しいバージョンとして保存されます。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={confirmRestore}>
              <RotateCcw className="w-4 h-4" />
              復元する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}