import { EventEmitter } from 'events'

export type CollaborationEvent = 
  | { type: 'user-joined'; userId: string; userName: string; avatar: string }
  | { type: 'user-left'; userId: string }
  | { type: 'cursor-moved'; userId: string; position: { line: number; col: number } }
  | { type: 'selection-changed'; userId: string; selection: { start: number; end: number } }
  | { type: 'content-changed'; userId: string; changes: any }
  | { type: 'comment-added'; userId: string; comment: any }
  | { type: 'presence-update'; users: any[] }

interface CollaborationUser {
  id: string
  name: string
  avatar: string
  color: string
  cursor?: { line: number; col: number }
  selection?: { start: number; end: number }
}

export class CollaborationClient extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private pingTimer: NodeJS.Timeout | null = null
  private documentId: string
  private userId: string
  private userName: string
  private userAvatar: string
  private users: Map<string, CollaborationUser> = new Map()
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 1000

  constructor(
    documentId: string,
    userId: string,
    userName: string,
    userAvatar: string
  ) {
    super()
    this.documentId = documentId
    this.userId = userId
    this.userName = userName
    this.userAvatar = userAvatar
  }

  connect(url?: string) {
    const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
    
    try {
      this.ws = new WebSocket(`${wsUrl}/collaborate/${this.documentId}`)
      
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.scheduleReconnect()
    }
  }

  private handleOpen() {
    console.log('WebSocket connected')
    this.isConnected = true
    this.reconnectAttempts = 0
    
    // 参加メッセージを送信
    this.send({
      type: 'join',
      userId: this.userId,
      userName: this.userName,
      userAvatar: this.userAvatar,
      documentId: this.documentId
    })
    
    // Pingを定期的に送信
    this.startPing()
    
    this.emit('connected')
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'user-joined':
          this.handleUserJoined(data)
          break
        case 'user-left':
          this.handleUserLeft(data)
          break
        case 'cursor-moved':
          this.handleCursorMoved(data)
          break
        case 'selection-changed':
          this.handleSelectionChanged(data)
          break
        case 'content-changed':
          this.handleContentChanged(data)
          break
        case 'presence-update':
          this.handlePresenceUpdate(data)
          break
        case 'pong':
          // Pong received, connection is alive
          break
        default:
          console.warn('Unknown message type:', data.type)
      }
      
      this.emit('message', data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  private handleClose() {
    console.log('WebSocket disconnected')
    this.isConnected = false
    this.stopPing()
    this.emit('disconnected')
    this.scheduleReconnect()
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error)
    this.emit('error', error)
  }

  private handleUserJoined(data: any) {
    const user: CollaborationUser = {
      id: data.userId,
      name: data.userName,
      avatar: data.userAvatar,
      color: this.generateUserColor(data.userId)
    }
    
    this.users.set(data.userId, user)
    this.emit('user-joined', user)
  }

  private handleUserLeft(data: any) {
    this.users.delete(data.userId)
    this.emit('user-left', data.userId)
  }

  private handleCursorMoved(data: any) {
    const user = this.users.get(data.userId)
    if (user) {
      user.cursor = data.position
      this.emit('cursor-moved', { userId: data.userId, position: data.position })
    }
  }

  private handleSelectionChanged(data: any) {
    const user = this.users.get(data.userId)
    if (user) {
      user.selection = data.selection
      this.emit('selection-changed', { userId: data.userId, selection: data.selection })
    }
  }

  private handleContentChanged(data: any) {
    this.emit('content-changed', { userId: data.userId, changes: data.changes })
  }

  private handlePresenceUpdate(data: any) {
    this.users.clear()
    data.users.forEach((userData: any) => {
      const user: CollaborationUser = {
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar,
        color: this.generateUserColor(userData.id),
        cursor: userData.cursor,
        selection: userData.selection
      }
      this.users.set(userData.id, user)
    })
    this.emit('presence-update', Array.from(this.users.values()))
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  sendCursorPosition(line: number, col: number) {
    this.send({
      type: 'cursor-move',
      userId: this.userId,
      position: { line, col }
    })
  }

  sendSelectionChange(start: number, end: number) {
    this.send({
      type: 'selection-change',
      userId: this.userId,
      selection: { start, end }
    })
  }

  sendContentChange(changes: any) {
    this.send({
      type: 'content-change',
      userId: this.userId,
      changes
    })
  }

  private startPing() {
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      }
    }, 30000) // 30秒ごとにping
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.emit('reconnect-failed')
      return
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private generateUserColor(userId: string): string {
    const colors = [
      '#ef4444', // red
      '#f97316', // orange
      '#eab308', // yellow
      '#84cc16', // lime
      '#22c55e', // green
      '#14b8a6', // teal
      '#06b6d4', // cyan
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
    ]
    
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  getUsers(): CollaborationUser[] {
    return Array.from(this.users.values())
  }

  getUser(userId: string): CollaborationUser | undefined {
    return this.users.get(userId)
  }

  isUserConnected(): boolean {
    return this.isConnected
  }

  disconnect() {
    this.stopPing()
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.ws) {
      this.send({
        type: 'leave',
        userId: this.userId
      })
      
      this.ws.close()
      this.ws = null
    }
    
    this.users.clear()
    this.isConnected = false
  }
}