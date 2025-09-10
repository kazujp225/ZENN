import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const username = searchParams.get('username')
    
    const supabase = createClient()
    
    let query = supabase
      .from('users')
      .select('id, username, display_name, avatar_url, bio, created_at', { count: 'exact' })
    
    // usernameで検索する場合
    if (username) {
      query = query.eq('username', username)
    } else {
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({
      data: [],
      count: 0,
      page: 1,
      pageSize: 20
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createClient()
    
    // upsert（存在する場合は更新、しない場合は作成）
    const { data, error } = await supabase
      .from('users')
      .upsert(body, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Error creating/updating user:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in POST /api/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}