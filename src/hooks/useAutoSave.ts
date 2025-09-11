import { useEffect, useRef, useCallback, useState } from 'react'
import { debounce } from 'lodash'
import toast from 'react-hot-toast'

interface AutoSaveOptions {
  draftId?: string
  delay?: number
  onSave?: (data: any) => Promise<void>
  enabled?: boolean
}

interface AutoSaveData {
  title: string
  content: string
  emoji?: string
  topics?: string[]
  metadata?: any
}

export function useAutoSave({
  draftId,
  delay = 3000,
  onSave,
  enabled = true
}: AutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const dataRef = useRef<AutoSaveData | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // デバウンスされた保存関数
  const debouncedSave = useCallback(
    debounce(async (data: AutoSaveData) => {
      if (!enabled || !draftId) return

      setIsSaving(true)
      try {
        if (onSave) {
          await onSave(data)
        } else {
          // デフォルトのAPI呼び出し
          const response = await fetch(`/api/drafts/${draftId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...data,
              auto_save: true
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to auto-save')
          }
        }

        setLastSaved(new Date())
        setHasChanges(false)
      } catch (error) {
        // エラーログ削除（セキュリティ対応）
        toast.error('自動保存に失敗しました', {
          duration: 2000,
          position: 'bottom-right'
        })
      } finally {
        setIsSaving(false)
      }
    }, delay),
    [draftId, enabled, onSave, delay]
  )

  // データを更新して自動保存をトリガー
  const updateData = useCallback((data: Partial<AutoSaveData>) => {
    if (!enabled) return

    dataRef.current = {
      ...dataRef.current,
      ...data
    } as AutoSaveData

    setHasChanges(true)
    
    // 既存のタイムアウトをクリア
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // 新しいタイムアウトを設定
    saveTimeoutRef.current = setTimeout(() => {
      if (dataRef.current) {
        debouncedSave(dataRef.current)
      }
    }, 100)
  }, [enabled, debouncedSave])

  // 強制保存
  const forceSave = useCallback(async () => {
    if (!dataRef.current || !enabled || !draftId) return

    debouncedSave.cancel()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dataRef.current,
          auto_save: false
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      setLastSaved(new Date())
      setHasChanges(false)
      toast.success('保存しました', {
        duration: 2000,
        position: 'bottom-right'
      })
    } catch (error) {
      // エラーログ削除（セキュリティ対応）
      toast.error('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }, [enabled, draftId, debouncedSave])

  // ページ離脱時の警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && enabled) {
        e.preventDefault()
        e.returnValue = '保存されていない変更があります。ページを離れますか？'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      debouncedSave.cancel()
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [hasChanges, enabled, debouncedSave])

  // キーボードショートカット（Cmd/Ctrl + S）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        forceSave()
      }
    }

    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, forceSave])

  return {
    updateData,
    forceSave,
    isSaving,
    lastSaved,
    hasChanges,
    getStatus: () => {
      if (isSaving) return '保存中...'
      if (lastSaved) {
        const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
        if (seconds < 60) return `${seconds}秒前に保存`
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}分前に保存`
        return `${Math.floor(minutes / 60)}時間前に保存`
      }
      return hasChanges ? '未保存の変更' : ''
    }
  }
}