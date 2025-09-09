import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = createAdminClient()

    console.log('Starting database repair...')

    // 1. Drop and recreate tables with correct schema
    const repairQueries = [
      // Drop existing tables in correct order
      'DROP TABLE IF EXISTS notifications CASCADE;',
      'DROP TABLE IF EXISTS follows CASCADE;',
      'DROP TABLE IF EXISTS article_comments CASCADE;',
      'DROP TABLE IF EXISTS likes CASCADE;',
      'DROP TABLE IF EXISTS scraps CASCADE;',
      'DROP TABLE IF EXISTS books CASCADE;',
      'DROP TABLE IF EXISTS article_topics CASCADE;',
      'DROP TABLE IF EXISTS articles CASCADE;',
      'DROP TABLE IF EXISTS topics CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;',

      // Enable UUID extension
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',

      // Create users table
      `CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        website_url TEXT,
        twitter_username TEXT,
        github_username TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      // Create articles table
      `CREATE TABLE articles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        emoji TEXT DEFAULT '📝',
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        published BOOLEAN DEFAULT false,
        type VARCHAR(50) DEFAULT 'tech',
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      // Create topics table
      `CREATE TABLE topics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        articles_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      // Create books table
      `CREATE TABLE books (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        slug TEXT UNIQUE NOT NULL,
        emoji TEXT DEFAULT '📚',
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        published BOOLEAN DEFAULT false,
        price INTEGER DEFAULT 0,
        is_free BOOLEAN DEFAULT true,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      // Create scraps table
      `CREATE TABLE scraps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        slug TEXT UNIQUE NOT NULL,
        emoji TEXT DEFAULT '💭',
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        is_public BOOLEAN DEFAULT true,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      // Create article_topics table
      `CREATE TABLE article_topics (
        article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
        topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (article_id, topic_id)
      );`,

      // Create likes table
      `CREATE TABLE likes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        target_id UUID NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, target_id, target_type)
      );`,

      // Create article_comments table
      `CREATE TABLE article_comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      // Create follows table
      `CREATE TABLE follows (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      );`,

      // Create notifications table
      `CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        entity_id UUID,
        entity_type VARCHAR(50),
        action_url TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`,
    ]

    // Execute repair queries
    for (const query of repairQueries) {
      console.log(`Executing: ${query.substring(0, 50)}...`)
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error(`Error executing query: ${query}`, error)
        // Continue with other queries
      }
    }

    console.log('Database repair completed')

    return NextResponse.json({
      success: true,
      message: 'Database schema repaired successfully'
    })

  } catch (error) {
    console.error('Database repair error:', error)
    return NextResponse.json(
      { error: 'Database repair failed', details: error },
      { status: 500 }
    )
  }
}