import { createClient } from '@/lib/supabase/client'

export const oauthProviders = {
  google: {
    name: 'Google',
    iconType: 'google' as const
  },
  github: {
    name: 'GitHub',
    iconType: 'github' as const
  }
}

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
}