import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    
    // Delete all notifications for the user
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    // エラーログ削除（セキュリティ対応）
    return NextResponse.json(
      { error: 'Failed to clear notifications' },
      { status: 500 }
    )
  }
}