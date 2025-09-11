'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CollaborationClient } from '@/lib/websocket/client'
import { EnhancedMarkdownEditor } from './EnhancedMarkdownEditor'
import clsx from 'clsx'
import '@/styles/components/collaborative-editor.css'

interface CollaborativeEditorProps {
  documentId: string
  initialContent?: string
  onContentChange?: (content: string) => void
  height?: string
}

interface CollaboratorCursor {
  userId: string
  userName: string
  color: string
  position: { line: number; col: number }
}

export function CollaborativeEditor({
  documentId,
  initialContent = '',
  onContentChange,
  height = '600px'
}: CollaborativeEditorProps) {
  const { user } = useAuth()
  const [content, setContent] = useState(initialContent)
  const [collaborators, setCollaborators] = useState<Map<string, any>>(new Map())
  const [cursors, setCursors] = useState<CollaboratorCursor[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(true)
  const clientRef = useRef<CollaborationClient | null>(null)
  const contentRef = useRef(content)

  // WebSocket接続の初期化
  useEffect(() => {
    if (!user || !documentId) return

    const client = new CollaborationClient(
      documentId,
      user.id,
      user.displayName || user.username || 'Anonymous',
      user.avatar || '/images/avatar-placeholder.svg'
    )

    // イベントリスナーの設定
    client.on('connected', () => {
      setIsConnected(true)
      // console.log削除（セキュリティ対応）
    })

    client.on('disconnected', () => {
      setIsConnected(false)
      // console.log削除（セキュリティ対応）
    })

    client.on('user-joined', (userData) => {
      setCollaborators(prev => {
        const newMap = new Map(prev)
        newMap.set(userData.id, userData)
        return newMap
      })
      // console.log削除（セキュリティ対応）
    })

    client.on('user-left', (userId) => {
      setCollaborators(prev => {
        const newMap = new Map(prev)
        newMap.delete(userId)
        return newMap
      })
      setCursors(prev => prev.filter(c => c.userId !== userId))
    })

    client.on('cursor-moved', ({ userId, position }) => {
      setCursors(prev => {
        const existing = prev.find(c => c.userId === userId)
        const userData = client.getUser(userId)
        
        if (!userData) return prev

        if (existing) {
          return prev.map(c => 
            c.userId === userId 
              ? { ...c, position }
              : c
          )
        } else {
          return [...prev, {
            userId,
            userName: userData.name,
            color: userData.color,
            position
          }]
        }
      })
    })

    client.on('content-changed', ({ userId, changes }) => {
      if (userId !== user.id) {
        // 他のユーザーの変更を適用
        applyChanges(changes)
      }
    })

    client.on('presence-update', (users) => {
      const newCollaborators = new Map()
      users.forEach(u => {
        if (u.id !== user.id) {
          newCollaborators.set(u.id, u)
        }
      })
      setCollaborators(newCollaborators)
    })

    clientRef.current = client
    client.connect()

    return () => {
      client.disconnect()
      clientRef.current = null
    }
  }, [user, documentId])

  // コンテンツ変更の処理
  const handleContentChange = useCallback((newContent: string) => {
    const previousContent = contentRef.current
    contentRef.current = newContent
    setContent(newContent)
    onContentChange?.(newContent)

    // 変更を他のユーザーに送信
    if (clientRef.current && clientRef.current.isUserConnected()) {
      const changes = calculateChanges(previousContent, newContent)
      clientRef.current.sendContentChange(changes)
    }
  }, [onContentChange])

  // カーソル位置の送信
  const handleCursorMove = useCallback((line: number, col: number) => {
    if (clientRef.current && clientRef.current.isUserConnected()) {
      clientRef.current.sendCursorPosition(line, col)
    }
  }, [])

  // 選択範囲の送信
  const handleSelectionChange = useCallback((start: number, end: number) => {
    if (clientRef.current && clientRef.current.isUserConnected()) {
      clientRef.current.sendSelectionChange(start, end)
    }
  }, [])

  // 変更の計算（簡略版）
  const calculateChanges = (oldContent: string, newContent: string) => {
    // 実際の実装では、より効率的な差分アルゴリズムを使用
    return {
      type: 'full-replace',
      content: newContent
    }
  }

  // 変更の適用
  const applyChanges = (changes: any) => {
    if (changes.type === 'full-replace') {
      setContent(changes.content)
      contentRef.current = changes.content
    }
    // 他の変更タイプの処理
  }

  return (
    <div className="collaborative-editor">
      {/* ヘッダー */}
      <div className="collaborative-editor__header">
        <div className="collaborative-editor__status">
          <div className={clsx(
            'collaborative-editor__status-indicator',
            isConnected ? 'collaborative-editor__status-indicator--connected' : 'collaborative-editor__status-indicator--disconnected'
          )} />
          <span className="collaborative-editor__status-text">
            {isConnected ? 'リアルタイム同期中' : '接続中...'}
          </span>
        </div>

        {/* コラボレーター表示 */}
        <div className="collaborative-editor__collaborators">
          <button
            onClick={() => setShowCollaborators(!showCollaborators)}
            className="collaborative-editor__collaborators-toggle"
          >
            <span className="collaborative-editor__collaborators-count">
              {collaborators.size + 1}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          {showCollaborators && (
            <div className="collaborative-editor__collaborators-list">
              {/* 自分 */}
              <div className="collaborative-editor__collaborator">
                <img
                  src={user?.avatar || '/images/avatar-placeholder.svg'}
                  alt={user?.displayName || user?.username}
                  className="collaborative-editor__collaborator-avatar"
                />
                <span className="collaborative-editor__collaborator-name">
                  {user?.displayName || user?.username} (あなた)
                </span>
              </div>

              {/* 他のコラボレーター */}
              {Array.from(collaborators.values()).map((collaborator) => (
                <div key={collaborator.id} className="collaborative-editor__collaborator">
                  <img
                    src={collaborator.avatar}
                    alt={collaborator.name}
                    className="collaborative-editor__collaborator-avatar"
                    style={{ borderColor: collaborator.color }}
                  />
                  <span className="collaborative-editor__collaborator-name">
                    {collaborator.name}
                  </span>
                  {collaborator.cursor && (
                    <span className="collaborative-editor__collaborator-position">
                      L{collaborator.cursor.line}:C{collaborator.cursor.col}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* エディタ本体 */}
      <div className="collaborative-editor__content" style={{ position: 'relative' }}>
        <EnhancedMarkdownEditor
          initialValue={content}
          onChange={handleContentChange}
          height={height}
          showToolbar={true}
          showPreview={true}
          autoSave={false}
        />

        {/* カーソル表示 */}
        {cursors.map((cursor) => (
          <div
            key={cursor.userId}
            className="collaborative-editor__cursor"
            style={{
              backgroundColor: cursor.color,
              // カーソル位置の計算（簡略版）
              top: `${cursor.position.line * 20}px`,
              left: `${cursor.position.col * 8}px`
            }}
          >
            <span className="collaborative-editor__cursor-label">
              {cursor.userName}
            </span>
          </div>
        ))}
      </div>

      {/* 接続状態のトースト */}
      {!isConnected && (
        <div className="collaborative-editor__toast">
          <div className="collaborative-editor__toast-content">
            <div className="collaborative-editor__toast-spinner" />
            <span>接続を確立中...</span>
          </div>
        </div>
      )}
    </div>
  )
}