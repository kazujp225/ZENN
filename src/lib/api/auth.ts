import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']

export const authApi = {
  // Sign up with email
  async signUpWithEmail(email: string, password: string, userData: Omit<UserInsert, 'email' | 'id'>) {
    const supabase = createClient()
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        ...userData
      })
      .select()
      .single()

    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    return { user: authData.user, profile }
  },

  // Sign in with email
  async signInWithEmail(email: string, password: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    
    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return { user: data.user, session: data.session, profile }
  },

  // Sign in with OAuth
  async signInWithOAuth(provider: 'github' | 'google' | 'twitter') {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const supabase = createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return null

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return { user, profile }
  },

  // Update password
  async updatePassword(newPassword: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
  },

  // Request password reset
  async requestPasswordReset(email: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
  },

  // Verify email
  async verifyEmail(token: string, type: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    })

    if (error) throw error
  },

  // Refresh session
  async refreshSession() {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) throw error
    return data
  },

  // Check username availability
  async checkUsernameAvailability(username: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore not found error
    
    return !data // Available if no data found
  }
}