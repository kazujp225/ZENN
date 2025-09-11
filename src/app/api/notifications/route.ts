import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createAdminClient()
    
    // Get user notifications
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Count unread notifications
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({
      notifications: data || [],
      count: count || 0,
      unreadCount: unreadCount || 0,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, type, title, message, entity_id, entity_type, action_url } = await request.json()

    if (!user_id || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Required fields: user_id, type, title, message' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Create notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type,
        title,
        message,
        entity_id,
        entity_type,
        action_url
      })
      .select()
      .single()

    if (error) throw error

    // Send realtime notification
    await supabase.realtime.channel('notifications')
      .send({
        type: 'broadcast',
        event: 'new-notification',
        payload: data
      })

    return NextResponse.json({
      success: true,
      message: 'Notification created',
      data
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { notification_ids } = await request.json()

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return NextResponse.json(
        { error: 'notification_ids array is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Mark notifications as read
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .in('id', notification_ids)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
      data
    })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}