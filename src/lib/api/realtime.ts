import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type CommentPayload = RealtimePostgresChangesPayload<{
  [key: string]: any
}>

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map()
  private supabase = createClient()

  subscribeToArticleComments(
    articleId: string,
    callbacks: {
      onInsert?: (comment: any) => void
      onUpdate?: (comment: any) => void
      onDelete?: (comment: any) => void
    }
  ) {
    const channelName = `article-comments:${articleId}`
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'article_comments',
          filter: `article_id=eq.${articleId}`
        },
        (payload: CommentPayload) => {
          callbacks.onInsert?.(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'article_comments',
          filter: `article_id=eq.${articleId}`
        },
        (payload: CommentPayload) => {
          callbacks.onUpdate?.(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'article_comments',
          filter: `article_id=eq.${articleId}`
        },
        (payload: CommentPayload) => {
          callbacks.onDelete?.(payload.old)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  subscribeToNotifications(
    userId: string,
    onNotification: (notification: any) => void
  ) {
    const channelName = `notifications:${userId}`
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: CommentPayload) => {
          onNotification(payload.new)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  subscribeToUserPresence(
    channelName: string,
    userId: string,
    userInfo: { username: string; avatar_url?: string }
  ) {
    const channel = this.supabase.channel(channelName, {
      config: {
        presence: {
          key: userId
        }
      }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        // console.log削除（セキュリティ対応）
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // console.log削除（セキュリティ対応）
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // console.log削除（セキュリティ対応）
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            ...userInfo
          })
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  broadcastMessage(
    channelName: string,
    event: string,
    payload: any
  ) {
    const channel = this.supabase.channel(channelName)
    
    channel.send({
      type: 'broadcast',
      event,
      payload
    })

    return channel
  }

  subscribeToLiveArticleUpdates(
    articleId: string,
    onUpdate: (update: any) => void
  ) {
    const channelName = `article-live:${articleId}`
    
    const channel = this.supabase
      .channel(channelName)
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        onUpdate({ type: 'cursor', ...payload })
      })
      .on('broadcast', { event: 'selection' }, ({ payload }) => {
        onUpdate({ type: 'selection', ...payload })
      })
      .on('broadcast', { event: 'content' }, ({ payload }) => {
        onUpdate({ type: 'content', ...payload })
      })
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
  }
}

export const realtimeService = new RealtimeService()