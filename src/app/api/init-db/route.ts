import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

const SQL_STATEMENTS = [
  // Enable UUID extension
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
  
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Articles table
  `CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    emoji TEXT DEFAULT '📝',
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_published BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Topics table
  `CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    articles_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Article topics relation
  `CREATE TABLE IF NOT EXISTS article_topics (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (article_id, topic_id)
  )`,
  
  // Comments table
  `CREATE TABLE IF NOT EXISTS article_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Books table
  `CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    cover_url TEXT,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    price INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Book chapters table
  `CREATE TABLE IF NOT EXISTS book_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    slug TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(book_id, slug)
  )`,
  
  // Scraps table
  `CREATE TABLE IF NOT EXISTS scraps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_closed BOOLEAN DEFAULT false,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Scrap comments table
  `CREATE TABLE IF NOT EXISTS scrap_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scrap_id UUID REFERENCES scraps(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Likes table
  `CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('article', 'book', 'comment', 'scrap')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
  )`,
  
  // Follows table
  `CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
  )`,
  
  // Notifications table
  `CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_id UUID,
    entity_type TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // Sessions table
  `CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`
]

const INDEX_STATEMENTS = [
  `CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published)`,
  `CREATE INDEX IF NOT EXISTS idx_article_comments_article ON article_comments(article_id)`,
  `CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id)`,
  `CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_scraps_author ON scraps(author_id)`,
  `CREATE INDEX IF NOT EXISTS idx_scraps_slug ON scraps(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_id, target_type)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`
]

export async function GET(request: NextRequest) {
  // 🚨 SECURITY: This endpoint has been disabled for production security
  return NextResponse.json({
    error: 'Endpoint disabled for security reasons',
    message: 'Database initialization endpoints are not available in production'
  }, { status: 403 })
  
  /*
  try {
    const supabase = createClient()
    const results = {
      tables: { success: 0, failed: 0, errors: [] as string[] },
      indexes: { success: 0, failed: 0, errors: [] as string[] },
      sample_data: { created: false, error: null as string | null }
    }
    
    // Execute table creation statements
    console.log('Creating tables...')
    for (const sql of SQL_STATEMENTS) {
      try {
        // Extract table name for logging
        const tableMatch = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)
        const tableName = tableMatch ? tableMatch[1] : 'unknown'
        
        // Since we can't execute raw SQL directly, we'll check if tables exist
        const { error } = await supabase
          .from(tableName)
          .select('count(*)', { count: 'exact', head: true })
        
        if (error && error.code === '42P01') {
          // Table doesn't exist
          results.tables.failed++
          results.tables.errors.push(`Table ${tableName} needs to be created`)
        } else {
          results.tables.success++
        }
      } catch (err: any) {
        results.tables.failed++
        results.tables.errors.push(err.message)
      }
    }
    
    // Check if we can create sample data
    try {
      // Check if users table is empty
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      if (userCount === 0) {
        // Create test user
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert({
            email: 'demo@zenn-clone.com',
            username: 'demo_user',
            display_name: 'デモユーザー',
            bio: 'Zenn Cloneのデモユーザーです'
          })
          .select()
          .single()
        
        if (!userError && userData) {
          // Create sample article
          await supabase
            .from('articles')
            .insert({
              title: 'Zenn Cloneへようこそ！',
              content: `# はじめに

Zenn Cloneは、エンジニア向けの知識共有プラットフォームです。

## 主な機能

- 📝 **記事投稿**: Markdownで技術記事を書けます
- 📚 **書籍作成**: 複数章からなる書籍を作成できます
- 💬 **スクラップ**: 短いメモや質問を投稿できます
- ❤️ **いいね機能**: 気に入った記事にいいねできます
- 🔔 **通知機能**: リアルタイムで通知を受け取れます

## 技術スタック

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Deployment**: Vercel

## さあ、始めましょう！

1. アカウントを作成
2. 記事を投稿
3. 他のユーザーと交流

楽しいエンジニアライフを！`,
              slug: 'welcome-to-zenn-clone',
              emoji: '🎉',
              author_id: userData.id,
              is_published: true
            })
          
          // Create sample topics
          const topics = [
            { name: 'React', slug: 'react', description: 'Reactに関する記事' },
            { name: 'Next.js', slug: 'nextjs', description: 'Next.jsに関する記事' },
            { name: 'TypeScript', slug: 'typescript', description: 'TypeScriptに関する記事' },
            { name: 'Supabase', slug: 'supabase', description: 'Supabaseに関する記事' },
            { name: 'Web開発', slug: 'web-dev', description: 'Web開発全般' }
          ]
          
          for (const topic of topics) {
            await supabase.from('topics').insert(topic)
          }
          
          results.sample_data.created = true
        } else {
          results.sample_data.error = userError?.message || 'Failed to create user'
        }
      }
    } catch (err: any) {
      results.sample_data.error = err.message
    }
    
    // Generate response
    const allTablesExist = results.tables.failed === 0
    
    if (!allTablesExist) {
      return NextResponse.json({
        success: false,
        message: 'Database tables need to be created',
        results,
        instructions: {
          step1: 'Go to Supabase SQL Editor',
          step2: 'Copy the SQL from /supabase/init.sql',
          step3: 'Execute the SQL',
          url: 'https://supabase.com/dashboard/project/qyvjtrdvbfxgfdydyhqe/sql/new'
        }
      }, { status: 503 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database is ready',
      results,
      tables_checked: SQL_STATEMENTS.length,
      sample_data: results.sample_data.created ? 'Created successfully' : 'Already exists or failed'
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to initialize database'
    }, { status: 500 })
  }
  */
}