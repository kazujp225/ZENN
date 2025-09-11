import { NextRequest, NextResponse } from 'next/server'
import { createServerAuthClient } from '@/lib/supabase/auth'

export async function requireAuth(request: NextRequest) {
  const supabase = createServerAuthClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
      user: null
    }
  }
  
  return { user, error: null }
}

export async function optionalAuth(request: NextRequest) {
  try {
    const supabase = createServerAuthClient()
    const { data: { user } } = await supabase.auth.getUser()
    return { user }
  } catch {
    return { user: null }
  }
}

export function createAuthenticatedResponse(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

export function createErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}