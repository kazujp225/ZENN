import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export const usersApi = {
  // Get user by username
  async getUserByUsername(username: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        articles:articles(count),
        books:books(count),
        scraps:scraps(count),
        followers:follows!following_id(count),
        following:follows!follower_id(count)
      `)
      .eq('username', username)
      .single()

    if (error) throw error
    return data
  },

  // Get user by ID
  async getUserById(id: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Get user followers
  async getUserFollowers(userId: string, limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('follows')
      .select(`
        follower:users!follower_id(*)
      `, { count: 'exact' })
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { 
      data: data?.map(item => item.follower).filter(Boolean),
      count 
    }
  },

  // Get user following
  async getUserFollowing(userId: string, limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('follows')
      .select(`
        following:users!following_id(*)
      `, { count: 'exact' })
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { 
      data: data?.map(item => item.following).filter(Boolean),
      count 
    }
  },

  // Search users
  async searchUsers(query: string, limit = 20, offset = 0) {
    const supabase = createClient()
    
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  // Create user
  async createUser(user: UserInsert) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update user
  async updateUser(id: string, updates: UserUpdate) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Follow user
  async followUser(followerId: string, followingId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })

    if (error && error.code !== '23505') throw error // Ignore duplicate key error
  },

  // Unfollow user
  async unfollowUser(followerId: string, followingId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)

    if (error) throw error
  },

  // Check if user is following
  async isFollowing(followerId: string, followingId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore not found error
    return !!data
  }
}