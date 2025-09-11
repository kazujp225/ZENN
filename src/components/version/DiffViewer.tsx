'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, FileText, GitCompare, Eye } from 'lucide-react'
import { diffWords, diffLines, Change } from 'diff'
import '@/styles/components/diff-viewer.css'

interface Version {
  id: string
  version: number
  title: string
  content: string
  createdAt: string
}

interface DiffViewerProps {
  oldVersion: Version
  newVersion: Version
  onClose: () => void
}

export function DiffViewer({ oldVersion, newVersion, onClose }: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split')
  const [showOnlyChanges, setShowOnlyChanges] = useState(false)

  const titleDiff = useMemo(() => {
    return diffWords(oldVersion.title, newVersion.title)
  }, [oldVersion.title, newVersion.title])

  const contentDiff = useMemo(() => {
    return diffLines(oldVersion.content, newVersion.content)
  }, [oldVersion.content, newVersion.content])

  const renderDiffPart = (part: Change, index: number) => {
    if (part.added) {
      return (
        <span key={index} className="diff-viewer__added">
          {part.value}
        </span>
      )
    } else if (part.removed) {
      return (
        <span key={index} className="diff-viewer__removed">
          {part.value}
        </span>
      )
    } else if (!showOnlyChanges) {
      return (
        <span key={index} className="diff-viewer__unchanged">
          {part.value}
        </span>
      )
    }
    return null
  }

  const renderSplitView = () => {
    const oldLines = oldVersion.content.split('\n')
    const newLines = newVersion.content.split('\n')
    const maxLines = Math.max(oldLines.length, newLines.length)
    const rows = []

    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || ''
      const newLine = newLines[i] || ''
      const hasChange = oldLine !== newLine

      if (!showOnlyChanges || hasChange) {
        rows.push(
          <div key={i} className="diff-viewer__row">
            <div className="diff-viewer__line-number">{i + 1}</div>
            <div className={`diff-viewer__content diff-viewer__content--old ${
              hasChange && oldLine ? 'diff-viewer__content--removed' : ''
            }`}>
              {oldLine || <span className="diff-viewer__empty"> </span>}
            </div>
            <div className="diff-viewer__line-number">{i + 1}</div>
            <div className={`diff-viewer__content diff-viewer__content--new ${
              hasChange && newLine ? 'diff-viewer__content--added' : ''
            }`}>
              {newLine || <span className="diff-viewer__empty"> </span>}
            </div>
          </div>
        )
      }
    }

    return rows
  }

  const stats = useMemo(() => {
    let additions = 0
    let deletions = 0
    let unchanged = 0

    contentDiff.forEach(part => {
      const lines = part.value.split('\n').length - 1
      if (part.added) additions += lines
      else if (part.removed) deletions += lines
      else unchanged += lines
    })

    return { additions, deletions, unchanged }
  }, [contentDiff])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="diff-viewer__dialog">
        <DialogHeader>
          <DialogTitle className="diff-viewer__title">
            <GitCompare className="w-5 h-5" />
            バージョンの比較
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="diff-viewer__close"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="diff-viewer__header">
          <div className="diff-viewer__versions">
            <div className="diff-viewer__version">
              <span className="diff-viewer__version-label">旧バージョン</span>
              <span className="diff-viewer__version-number">v{oldVersion.version}</span>
            </div>
            <span className="diff-viewer__arrow">→</span>
            <div className="diff-viewer__version">
              <span className="diff-viewer__version-label">新バージョン</span>
              <span className="diff-viewer__version-number">v{newVersion.version}</span>
            </div>
          </div>

          <div className="diff-viewer__stats">
            <span className="diff-viewer__stat diff-viewer__stat--additions">
              +{stats.additions}
            </span>
            <span className="diff-viewer__stat diff-viewer__stat--deletions">
              -{stats.deletions}
            </span>
            <span className="diff-viewer__stat diff-viewer__stat--unchanged">
              ={stats.unchanged}
            </span>
          </div>
        </div>

        <div className="diff-viewer__controls">
          <div className="diff-viewer__view-mode">
            <Button
              variant={viewMode === 'split' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('split')}
            >
              分割表示
            </Button>
            <Button
              variant={viewMode === 'unified' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('unified')}
            >
              統合表示
            </Button>
          </div>

          <label className="diff-viewer__filter">
            <input
              type="checkbox"
              checked={showOnlyChanges}
              onChange={(e) => setShowOnlyChanges(e.target.checked)}
            />
            変更箇所のみ表示
          </label>
        </div>

        <Tabs defaultValue="content" className="diff-viewer__tabs">
          <TabsList>
            <TabsTrigger value="content">
              <FileText className="w-4 h-4" />
              コンテンツ
            </TabsTrigger>
            <TabsTrigger value="title">
              <Eye className="w-4 h-4" />
              タイトル
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="diff-viewer__content-wrapper">
            {viewMode === 'split' ? (
              <div className="diff-viewer__split">
                <div className="diff-viewer__split-header">
                  <div className="diff-viewer__split-title">旧バージョン</div>
                  <div className="diff-viewer__split-title">新バージョン</div>
                </div>
                <div className="diff-viewer__split-content">
                  {renderSplitView()}
                </div>
              </div>
            ) : (
              <div className="diff-viewer__unified">
                {contentDiff.map((part, index) => renderDiffPart(part, index))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="title" className="diff-viewer__content-wrapper">
            <div className="diff-viewer__title-diff">
              <h4>タイトルの変更:</h4>
              <div className="diff-viewer__title-content">
                {titleDiff.map((part, index) => renderDiffPart(part, index))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}