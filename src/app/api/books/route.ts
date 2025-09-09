import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('books')
      .select(`
        *,
        author:users!user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit
    })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json({
      data: [],
      count: 0,
      page: 1,
      pageSize: 20
    })
  }
}