import { createClient } from '@/lib/supabase/client'

const AVATAR_BUCKET = 'avatars'
const ARTICLE_IMAGES_BUCKET = 'article-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const storageApi = {
  async uploadAvatar(userId: string, file: File) {
    const supabase = createClient()
    
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 5MB')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath)

    await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    return { url: publicUrl, path: data.path }
  },

  async deleteAvatar(userId: string, filePath: string) {
    const supabase = createClient()
    
    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([filePath])

    if (error) throw error

    await supabase
      .from('users')
      .update({ avatar_url: null })
      .eq('id', userId)

    return true
  },

  async uploadArticleImage(articleId: string, file: File) {
    const supabase = createClient()
    
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 5MB')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${articleId}/${fileName}`

    const { data, error } = await supabase.storage
      .from(ARTICLE_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(ARTICLE_IMAGES_BUCKET)
      .getPublicUrl(filePath)

    return { url: publicUrl, path: data.path }
  },

  async deleteArticleImage(filePath: string) {
    const supabase = createClient()
    
    const { error } = await supabase.storage
      .from(ARTICLE_IMAGES_BUCKET)
      .remove([filePath])

    if (error) throw error

    return true
  },

  async listArticleImages(articleId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.storage
      .from(ARTICLE_IMAGES_BUCKET)
      .list(articleId, {
        limit: 100,
        offset: 0
      })

    if (error) throw error

    return data.map(file => ({
      name: file.name,
      size: file.metadata?.size || 0,
      url: supabase.storage
        .from(ARTICLE_IMAGES_BUCKET)
        .getPublicUrl(`${articleId}/${file.name}`).data.publicUrl
    }))
  },

  async getSignedUrl(bucket: string, filePath: string, expiresIn = 3600) {
    const supabase = createClient()
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn)

    if (error) throw error

    return data.signedUrl
  }
}