'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { createAuthClient } from '@/lib/supabase/auth'
import type { Database } from '@/lib/supabase/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: SupabaseUser | null
  profile: UserProfile | null
  isLoading: boolean
  signUp: (email: string, password: string, username: string, displayName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createAuthClient()

  useEffect(() => {
    // 初回ロード時にセッションを確認
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Session error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile load error:', error)
        return
      }

      setProfile(userProfile)
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, username: string, displayName?: string) => {
    try {
      // Supabase Authでユーザー登録
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        // プロフィールをusersテーブルに作成
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            username,
            display_name: displayName || username,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw new Error('Failed to create user profile')
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw new Error(error.message || 'Sign up failed')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw new Error(error.message || 'Sign in failed')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
    } catch (error: any) {
      console.error('Sign out error:', error)
      throw new Error(error.message || 'Sign out failed')
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) {
      throw new Error('No user logged in')
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // ローカル状態を更新
      setProfile(prev => prev ? { ...prev, ...data } : null)
    } catch (error: any) {
      console.error('Profile update error:', error)
      throw new Error(error.message || 'Profile update failed')
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      signUp,
      signIn,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}